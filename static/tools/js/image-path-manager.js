/**
 * 图片路径管理器
 * 根据内容类型智能管理图片存储路径和命名规则
 */

class ImagePathManager {
    constructor() {
        // 内容类型到路径的映射配置
        this.pathConfig = {
            'tech-article': {
                staticPath: 'static/images/content/tech-articles',
                publicPath: '/images/content/tech-articles',
                contentPath: 'content/news',
                namePrefix: 'tech',
                description: '技术文章'
            },
            'exhibition': {
                staticPath: 'static/images/content/exhibitions',
                publicPath: '/images/content/exhibitions',
                contentPath: 'content/news',
                namePrefix: 'exhibition',
                description: '展会信息'
            },
            'case-study': {
                staticPath: 'static/images/content/case-studies',
                publicPath: '/images/content/case-studies',
                contentPath: 'content/cases',
                namePrefix: 'case',
                description: '应用案例'
            },
            'industry-news': {
                staticPath: 'static/images/content/industry-news',
                publicPath: '/images/content/industry-news',
                contentPath: 'content/news',
                namePrefix: 'news',
                description: '行业资讯'
            },
            'product': {
                staticPath: 'static/images/products',
                publicPath: '/images/products',
                contentPath: 'content/products',
                namePrefix: 'product',
                description: '产品信息'
            }
        };
    }

    /**
     * 根据编辑器类型和内容信息生成完整的路径配置
     */
    generatePathConfig(editorType, contentInfo) {
        const baseConfig = this.pathConfig[editorType];
        if (!baseConfig) {
            throw new Error(`不支持的编辑器类型: ${editorType}`);
        }

        const contentId = this.generateContentId(contentInfo);
        const timestamp = new Date().toISOString().split('T')[0];

        return {
            ...baseConfig,
            contentId: contentId,
            timestamp: timestamp,
            fullStaticPath: `${baseConfig.staticPath}/${timestamp}`,
            fullPublicPath: `${baseConfig.publicPath}/${timestamp}`,
            contentFileName: this.generateContentFileName(editorType, contentInfo)
        };
    }

    /**
     * 生成内容ID
     */
    generateContentId(contentInfo) {
        const title = contentInfo.title || 'untitled';
        const date = contentInfo.date ? new Date(contentInfo.date) : new Date();
        const dateStr = date.toISOString().split('T')[0];
        
        // 清理标题，生成安全的文件名
        const cleanTitle = title
            .toLowerCase()
            .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            .substring(0, 50); // 限制长度

        return `${dateStr}-${cleanTitle}`;
    }

    /**
     * 生成内容文件名
     */
    generateContentFileName(editorType, contentInfo) {
        const contentId = this.generateContentId(contentInfo);
        return `${contentId}.md`;
    }

    /**
     * 生成图片文件名
     */
    generateImageFileName(pathConfig, imageIndex, originalUrl, customName = null) {
        if (customName) {
            return this.sanitizeFileName(customName);
        }

        const extension = this.getImageExtension(originalUrl);
        const indexStr = String(imageIndex + 1).padStart(2, '0');
        
        return `${pathConfig.namePrefix}-${pathConfig.contentId}-${indexStr}${extension}`;
    }

    /**
     * 获取图片扩展名
     */
    getImageExtension(url) {
        try {
            const urlPath = new URL(url).pathname;
            const extension = urlPath.split('.').pop().toLowerCase();
            const supportedFormats = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
            
            if (supportedFormats.includes(extension)) {
                return `.${extension}`;
            }
        } catch (e) {
            console.warn('无法解析图片URL:', url);
        }
        
        return '.jpg'; // 默认格式
    }

    /**
     * 清理文件名
     */
    sanitizeFileName(fileName) {
        return fileName
            .replace(/[^a-zA-Z0-9\u4e00-\u9fa5._-]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * 生成完整的图片路径信息
     */
    generateImagePaths(pathConfig, imageIndex, originalUrl, customName = null) {
        const fileName = this.generateImageFileName(pathConfig, imageIndex, originalUrl, customName);
        
        return {
            fileName: fileName,
            staticPath: `${pathConfig.fullStaticPath}/${fileName}`,
            publicPath: `${pathConfig.fullPublicPath}/${fileName}`,
            markdownPath: `${pathConfig.fullPublicPath}/${fileName}`,
            relativePath: `images/content/${pathConfig.namePrefix}s/${pathConfig.timestamp}/${fileName}`
        };
    }

    /**
     * 验证路径配置
     */
    validatePathConfig(pathConfig) {
        const required = ['staticPath', 'publicPath', 'contentPath', 'namePrefix'];
        for (const field of required) {
            if (!pathConfig[field]) {
                throw new Error(`路径配置缺少必要字段: ${field}`);
            }
        }
        return true;
    }

    /**
     * 获取所有支持的编辑器类型
     */
    getSupportedEditorTypes() {
        return Object.keys(this.pathConfig).map(key => ({
            type: key,
            description: this.pathConfig[key].description,
            contentPath: this.pathConfig[key].contentPath
        }));
    }
}

// 导出为全局变量
window.ImagePathManager = ImagePathManager;
