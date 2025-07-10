/**
 * GitHub API 客户端
 * 用于与GitHub API交互，管理仓库内容
 */
class GitHubAPI {
    constructor(config = {}) {
        this.owner = config.owner || 'Cery';
        this.repo = config.repo || 'vision';
        this.branch = config.branch || 'main';
        this.token = config.token || null;
        this.baseURL = 'https://api.github.com';
        
        // API请求限制
        this.requestCount = 0;
        this.requestLimit = 5000; // GitHub API限制
        this.requestWindow = 3600000; // 1小时
        this.lastReset = Date.now();
    }

    /**
     * 设置认证Token
     */
    setToken(token) {
        this.token = token;
    }

    /**
     * 获取请求头
     */
    getHeaders() {
        const headers = {
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        };

        if (this.token) {
            headers['Authorization'] = `token ${this.token}`;
        }

        return headers;
    }

    /**
     * 检查API限制
     */
    checkRateLimit() {
        const now = Date.now();
        if (now - this.lastReset > this.requestWindow) {
            this.requestCount = 0;
            this.lastReset = now;
        }

        if (this.requestCount >= this.requestLimit) {
            throw new Error('API请求限制已达上限，请稍后再试');
        }

        this.requestCount++;
    }

    /**
     * 发送API请求
     */
    async request(endpoint, options = {}) {
        this.checkRateLimit();

        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: this.getHeaders(),
            ...options
        };

        try {
            const response = await fetch(url, config);
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('GitHub API请求失败:', error);
            throw error;
        }
    }

    /**
     * 验证Token有效性
     */
    async verifyToken() {
        try {
            const user = await this.request('/user');
            return { valid: true, user };
        } catch (error) {
            return { valid: false, error: error.message };
        }
    }

    /**
     * 获取仓库信息
     */
    async getRepository() {
        return await this.request(`/repos/${this.owner}/${this.repo}`);
    }

    /**
     * 获取目录内容
     */
    async getDirectoryContents(path = '') {
        const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`;
        return await this.request(endpoint);
    }

    /**
     * 获取文件内容
     */
    async getFileContent(path) {
        try {
            const response = await this.request(`/repos/${this.owner}/${this.repo}/contents/${path}`);
            
            if (response.type === 'file') {
                // Base64解码文件内容
                const content = atob(response.content.replace(/\s/g, ''));
                return {
                    content,
                    sha: response.sha,
                    path: response.path,
                    size: response.size
                };
            } else {
                throw new Error('指定路径不是文件');
            }
        } catch (error) {
            console.error('获取文件内容失败:', error);
            throw error;
        }
    }

    /**
     * 创建或更新文件
     */
    async createOrUpdateFile(path, content, message, sha = null) {
        const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`;
        
        const data = {
            message: message || `Update ${path}`,
            content: btoa(unescape(encodeURIComponent(content))), // UTF-8 Base64编码
            branch: this.branch
        };

        if (sha) {
            data.sha = sha; // 更新文件需要提供SHA
        }

        try {
            return await this.request(endpoint, {
                method: 'PUT',
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('创建/更新文件失败:', error);
            throw error;
        }
    }

    /**
     * 删除文件
     */
    async deleteFile(path, message, sha) {
        const endpoint = `/repos/${this.owner}/${this.repo}/contents/${path}`;
        
        const data = {
            message: message || `Delete ${path}`,
            sha: sha,
            branch: this.branch
        };

        try {
            return await this.request(endpoint, {
                method: 'DELETE',
                body: JSON.stringify(data)
            });
        } catch (error) {
            console.error('删除文件失败:', error);
            throw error;
        }
    }

    /**
     * 获取提交历史
     */
    async getCommits(path = null, limit = 10) {
        let endpoint = `/repos/${this.owner}/${this.repo}/commits?per_page=${limit}`;
        
        if (path) {
            endpoint += `&path=${path}`;
        }

        return await this.request(endpoint);
    }

    /**
     * 搜索文件
     */
    async searchFiles(query, path = '') {
        const endpoint = `/search/code?q=${encodeURIComponent(query)}+repo:${this.owner}/${this.repo}`;
        return await this.request(endpoint);
    }

    /**
     * 获取分支列表
     */
    async getBranches() {
        return await this.request(`/repos/${this.owner}/${this.repo}/branches`);
    }

    /**
     * 创建分支
     */
    async createBranch(branchName, fromBranch = 'main') {
        // 首先获取源分支的SHA
        const refResponse = await this.request(`/repos/${this.owner}/${this.repo}/git/refs/heads/${fromBranch}`);
        const sha = refResponse.object.sha;

        // 创建新分支
        const data = {
            ref: `refs/heads/${branchName}`,
            sha: sha
        };

        return await this.request(`/repos/${this.owner}/${this.repo}/git/refs`, {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    /**
     * 上传文件（支持二进制文件）
     */
    async uploadFile(path, file, message) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = async () => {
                try {
                    const content = reader.result.split(',')[1]; // 移除data:URL前缀
                    
                    const result = await this.createOrUpdateFile(
                        path,
                        atob(content), // 解码为二进制
                        message || `Upload ${file.name}`
                    );
                    
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsDataURL(file);
        });
    }

    /**
     * 批量操作文件
     */
    async batchOperation(operations) {
        const results = [];
        
        for (const operation of operations) {
            try {
                let result;
                
                switch (operation.type) {
                    case 'create':
                    case 'update':
                        result = await this.createOrUpdateFile(
                            operation.path,
                            operation.content,
                            operation.message,
                            operation.sha
                        );
                        break;
                        
                    case 'delete':
                        result = await this.deleteFile(
                            operation.path,
                            operation.message,
                            operation.sha
                        );
                        break;
                        
                    default:
                        throw new Error(`不支持的操作类型: ${operation.type}`);
                }
                
                results.push({ success: true, operation, result });
            } catch (error) {
                results.push({ success: false, operation, error: error.message });
            }
        }
        
        return results;
    }

    /**
     * 获取API使用情况
     */
    async getRateLimit() {
        return await this.request('/rate_limit');
    }

    /**
     * 解析Markdown Front Matter
     */
    parseMarkdown(content) {
        const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (match) {
            const frontMatter = {};
            const frontMatterContent = match[1];
            const markdownContent = match[2];
            
            // 简单的YAML解析（仅支持基本格式）
            const lines = frontMatterContent.split('\n');
            for (const line of lines) {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                    frontMatter[key] = value;
                }
            }
            
            return { frontMatter, content: markdownContent };
        }
        
        return { frontMatter: {}, content };
    }

    /**
     * 生成Markdown内容
     */
    generateMarkdown(frontMatter, content) {
        let markdown = '---\n';
        
        for (const [key, value] of Object.entries(frontMatter)) {
            if (typeof value === 'string') {
                markdown += `${key}: "${value}"\n`;
            } else if (typeof value === 'object') {
                markdown += `${key}:\n`;
                for (const [subKey, subValue] of Object.entries(value)) {
                    markdown += `  ${subKey}: "${subValue}"\n`;
                }
            } else {
                markdown += `${key}: ${value}\n`;
            }
        }
        
        markdown += '---\n\n';
        markdown += content;
        
        return markdown;
    }
}

// 导出类
if (typeof module !== 'undefined' && module.exports) {
    module.exports = GitHubAPI;
} else {
    window.GitHubAPI = GitHubAPI;
}
