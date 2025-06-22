// 文件操作模块 - 处理内容文件的创建、修改、删除
class FileOperations {
    constructor() {
        this.baseUrl = window.location.origin;
        this.githubConfig = {
            owner: 'Cery',
            repo: 'VisNDT',
            branch: 'master',
            token: null // 需要用户配置GitHub token
        };
    }

    // 初始化GitHub配置
    initGitHub(token) {
        this.githubConfig.token = token;
    }

    // 创建产品文件
    async createProduct(productData) {
        try {
            const filename = this.generateProductFilename(productData);
            const content = this.generateProductMarkdown(productData);
            
            if (this.githubConfig.token) {
                return await this.createGitHubFile(`content/products/${filename}`, content);
            } else {
                return await this.createLocalFile('products', filename, content);
            }
        } catch (error) {
            console.error('创建产品文件失败:', error);
            throw error;
        }
    }

    // 更新产品文件
    async updateProduct(productId, productData) {
        try {
            const filename = this.generateProductFilename(productData);
            const content = this.generateProductMarkdown(productData);
            
            if (this.githubConfig.token) {
                return await this.updateGitHubFile(`content/products/${filename}`, content);
            } else {
                return await this.updateLocalFile('products', filename, content);
            }
        } catch (error) {
            console.error('更新产品文件失败:', error);
            throw error;
        }
    }

    // 删除产品文件
    async deleteProduct(productId) {
        try {
            const filename = `${productId}.md`;
            
            if (this.githubConfig.token) {
                return await this.deleteGitHubFile(`content/products/${filename}`);
            } else {
                return await this.deleteLocalFile('products', filename);
            }
        } catch (error) {
            console.error('删除产品文件失败:', error);
            throw error;
        }
    }

    // 创建资讯文件
    async createNews(newsData) {
        try {
            const filename = this.generateNewsFilename(newsData);
            const content = this.generateNewsMarkdown(newsData);
            
            if (this.githubConfig.token) {
                return await this.createGitHubFile(`content/news/${filename}`, content);
            } else {
                return await this.createLocalFile('news', filename, content);
            }
        } catch (error) {
            console.error('创建资讯文件失败:', error);
            throw error;
        }
    }

    // 更新资讯文件
    async updateNews(newsId, newsData) {
        try {
            const filename = this.generateNewsFilename(newsData);
            const content = this.generateNewsMarkdown(newsData);
            
            if (this.githubConfig.token) {
                return await this.updateGitHubFile(`content/news/${filename}`, content);
            } else {
                return await this.updateLocalFile('news', filename, content);
            }
        } catch (error) {
            console.error('更新资讯文件失败:', error);
            throw error;
        }
    }

    // 删除资讯文件
    async deleteNews(newsId) {
        try {
            const filename = `${newsId}.md`;
            
            if (this.githubConfig.token) {
                return await this.deleteGitHubFile(`content/news/${filename}`);
            } else {
                return await this.deleteLocalFile('news', filename);
            }
        } catch (error) {
            console.error('删除资讯文件失败:', error);
            throw error;
        }
    }

    // 创建案例文件
    async createCase(caseData) {
        try {
            const filename = this.generateCaseFilename(caseData);
            const content = this.generateCaseMarkdown(caseData);
            
            if (this.githubConfig.token) {
                return await this.createGitHubFile(`content/cases/${filename}`, content);
            } else {
                return await this.createLocalFile('cases', filename, content);
            }
        } catch (error) {
            console.error('创建案例文件失败:', error);
            throw error;
        }
    }

    // 更新案例文件
    async updateCase(caseId, caseData) {
        try {
            const filename = this.generateCaseFilename(caseData);
            const content = this.generateCaseMarkdown(caseData);
            
            if (this.githubConfig.token) {
                return await this.updateGitHubFile(`content/cases/${filename}`, content);
            } else {
                return await this.updateLocalFile('cases', filename, content);
            }
        } catch (error) {
            console.error('更新案例文件失败:', error);
            throw error;
        }
    }

    // 删除案例文件
    async deleteCase(caseId) {
        try {
            const filename = `${caseId}.md`;
            
            if (this.githubConfig.token) {
                return await this.deleteGitHubFile(`content/cases/${filename}`);
            } else {
                return await this.deleteLocalFile('cases', filename);
            }
        } catch (error) {
            console.error('删除案例文件失败:', error);
            throw error;
        }
    }

    // 生成产品文件名
    generateProductFilename(productData) {
        const slug = this.slugify(productData.model || productData.title);
        return `${slug}.md`;
    }

    // 生成资讯文件名
    generateNewsFilename(newsData) {
        const date = newsData.publishDate || new Date().toISOString().split('T')[0];
        const slug = this.slugify(newsData.title);
        return `${date}-${slug}.md`;
    }

    // 生成案例文件名
    generateCaseFilename(caseData) {
        const slug = this.slugify(caseData.title);
        return `${slug}.md`;
    }

    // 生成URL友好的slug
    slugify(text) {
        return text
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // 移除特殊字符
            .replace(/[\s_-]+/g, '-') // 替换空格和下划线为连字符
            .replace(/^-+|-+$/g, ''); // 移除开头和结尾的连字符
    }

    // 生成产品Markdown内容
    generateProductMarkdown(productData) {
        const frontmatter = {
            title: productData.title,
            summary: productData.summary || '',
            primary_category: productData.primary_category,
            secondary_category: productData.secondary_category,
            model: productData.model,
            series: productData.series,
            supplier: productData.supplier,
            published: productData.published || new Date().toISOString(),
            gallery: productData.gallery || [],
            parameters: productData.parameters || []
        };

        let markdown = '---\n';
        for (const [key, value] of Object.entries(frontmatter)) {
            if (Array.isArray(value)) {
                markdown += `${key}:\n`;
                value.forEach(item => {
                    if (typeof item === 'object') {
                        markdown += `  - `;
                        for (const [k, v] of Object.entries(item)) {
                            markdown += `${k}: "${v}"\n    `;
                        }
                        markdown = markdown.slice(0, -4) + '\n';
                    } else {
                        markdown += `  - "${item}"\n`;
                    }
                });
            } else {
                markdown += `${key}: "${value}"\n`;
            }
        }
        markdown += '---\n\n';
        
        // 添加产品描述内容
        markdown += `**${productData.title}**\n\n`;
        if (productData.summary) {
            markdown += `${productData.summary}\n\n`;
        }
        
        return markdown;
    }

    // 生成资讯Markdown内容
    generateNewsMarkdown(newsData) {
        const frontmatter = {
            title: newsData.title,
            date: newsData.publishDate || new Date().toISOString().split('T')[0],
            categories: newsData.categories || [],
            tags: newsData.tags || [],
            summary: newsData.summary || '',
            author: newsData.author || '编辑部',
            views: newsData.views || 0
        };

        let markdown = '---\n';
        for (const [key, value] of Object.entries(frontmatter)) {
            if (Array.isArray(value)) {
                markdown += `${key}:\n`;
                value.forEach(item => {
                    markdown += `- ${item}\n`;
                });
            } else {
                markdown += `${key}: ${typeof value === 'string' ? `"${value}"` : value}\n`;
            }
        }
        markdown += '---\n\n';
        
        // 添加资讯内容
        markdown += `# ${newsData.title}\n\n`;
        if (newsData.content) {
            markdown += `${newsData.content}\n\n`;
        }
        
        return markdown;
    }

    // 生成案例Markdown内容
    generateCaseMarkdown(caseData) {
        const frontmatter = {
            title: caseData.title,
            primary_category: caseData.products_used || [],
            application_field: [caseData.industry],
            application_scenario: [caseData.scenario],
            featured_image: caseData.thumbnail || '',
            summary: caseData.summary || '',
            date: caseData.publishDate || new Date().toISOString().split('T')[0],
            client: caseData.client || '',
            industry: caseData.industry || '',
            detection_object: caseData.scenario || '',
            equipment_used: (caseData.products_used || []).join('、')
        };

        let markdown = '---\n';
        for (const [key, value] of Object.entries(frontmatter)) {
            if (Array.isArray(value)) {
                markdown += `${key}:\n`;
                value.forEach(item => {
                    markdown += `- "${item}"\n`;
                });
            } else {
                markdown += `${key}: "${value}"\n`;
            }
        }
        markdown += '---\n\n';
        
        // 添加案例内容
        markdown += `# ${caseData.title}\n\n`;
        markdown += `## 项目概述\n\n`;
        if (caseData.summary) {
            markdown += `${caseData.summary}\n\n`;
        }
        
        if (caseData.challenges) {
            markdown += `## 面临挑战\n\n${caseData.challenges}\n\n`;
        }
        
        if (caseData.solution) {
            markdown += `## 解决方案\n\n${caseData.solution}\n\n`;
        }
        
        if (caseData.benefits && caseData.benefits.length > 0) {
            markdown += `## 项目效益\n\n`;
            caseData.benefits.forEach(benefit => {
                markdown += `- ${benefit}\n`;
            });
            markdown += '\n';
        }
        
        return markdown;
    }

    // GitHub文件操作方法
    async createGitHubFile(path, content) {
        const url = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${path}`;

        const response = await fetch(url, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Create ${path}`,
                content: btoa(unescape(encodeURIComponent(content))), // Base64编码
                branch: this.githubConfig.branch
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API错误: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async updateGitHubFile(path, content) {
        // 首先获取文件的SHA
        const getUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${path}`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
            }
        });

        let sha = null;
        if (getResponse.ok) {
            const fileData = await getResponse.json();
            sha = fileData.sha;
        }

        const putUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${path}`;
        const response = await fetch(putUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Update ${path}`,
                content: btoa(unescape(encodeURIComponent(content))),
                branch: this.githubConfig.branch,
                sha: sha
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API错误: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    async deleteGitHubFile(path) {
        // 首先获取文件的SHA
        const getUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${path}`;
        const getResponse = await fetch(getUrl, {
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
            }
        });

        if (!getResponse.ok) {
            throw new Error('文件不存在或无法访问');
        }

        const fileData = await getResponse.json();
        const sha = fileData.sha;

        const deleteUrl = `https://api.github.com/repos/${this.githubConfig.owner}/${this.githubConfig.repo}/contents/${path}`;
        const response = await fetch(deleteUrl, {
            method: 'DELETE',
            headers: {
                'Authorization': `token ${this.githubConfig.token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Delete ${path}`,
                sha: sha,
                branch: this.githubConfig.branch
            })
        });

        if (!response.ok) {
            throw new Error(`GitHub API错误: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    }

    // 本地文件操作方法（模拟）
    async createLocalFile(type, filename, content) {
        // 在实际环境中，这里需要调用后端API来创建文件
        console.log(`创建本地文件: content/${type}/${filename}`);
        console.log('文件内容:', content);

        // 模拟文件创建成功
        return {
            success: true,
            path: `content/${type}/${filename}`,
            message: '文件创建成功'
        };
    }

    async updateLocalFile(type, filename, content) {
        console.log(`更新本地文件: content/${type}/${filename}`);
        console.log('文件内容:', content);

        return {
            success: true,
            path: `content/${type}/${filename}`,
            message: '文件更新成功'
        };
    }

    async deleteLocalFile(type, filename) {
        console.log(`删除本地文件: content/${type}/${filename}`);

        return {
            success: true,
            path: `content/${type}/${filename}`,
            message: '文件删除成功'
        };
    }

    // 上传图片文件
    async uploadImage(file, type = 'general') {
        try {
            if (this.githubConfig.token) {
                return await this.uploadImageToGitHub(file, type);
            } else {
                return await this.uploadImageLocal(file, type);
            }
        } catch (error) {
            console.error('上传图片失败:', error);
            throw error;
        }
    }

    // 将文件转换为Base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // 移除data:image/...;base64,前缀
                resolve(base64);
            };
            reader.onerror = error => reject(error);
        });
    }
}

// 创建全局文件操作实例
window.fileOperations = new FileOperations();
