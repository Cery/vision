/**
 * 双模式图片处理器
 * 支持完全自动化（方案A）和半自动化确认（方案B）两种模式
 */

class DualModeImageProcessor {
    constructor(options = {}) {
        this.pathManager = new ImagePathManager();
        this.mode = options.mode || 'semi-auto'; // 'auto' 或 'semi-auto'
        this.editorType = options.editorType || 'tech-article';
        this.contentInfo = options.contentInfo || {};
        this.onProgress = options.onProgress || (() => {});
        this.onComplete = options.onComplete || (() => {});
        this.onError = options.onError || (() => {});
        
        this.pathConfig = null;
        this.images = [];
        this.processedImages = [];
        this.isProcessing = false;
    }

    /**
     * 初始化处理器
     */
    initialize(editorType, contentInfo) {
        this.editorType = editorType;
        this.contentInfo = contentInfo;
        this.pathConfig = this.pathManager.generatePathConfig(editorType, contentInfo);
        this.images = [];
        this.processedImages = [];
    }

    /**
     * 设置处理模式
     */
    setMode(mode) {
        if (!['auto', 'semi-auto'].includes(mode)) {
            throw new Error('无效的处理模式，支持: auto, semi-auto');
        }
        this.mode = mode;
    }

    /**
     * 分析内容中的图片
     */
    analyzeImages(content) {
        const imageRegex = /!\[([^\]]*)\]\(([^)]+)\)/g;
        const images = [];
        let match;

        while ((match = imageRegex.exec(content)) !== null) {
            const imageInfo = {
                id: images.length,
                alt: match[1] || `图片${images.length + 1}`,
                originalUrl: match[2],
                originalMarkdown: match[0],
                processed: false,
                processing: false,
                error: null,
                newFileName: null,
                newPath: null,
                selected: true, // 默认选中
                customName: null
            };

            // 生成建议的文件名和路径
            const pathInfo = this.pathManager.generateImagePaths(
                this.pathConfig, 
                images.length, 
                imageInfo.originalUrl
            );
            
            imageInfo.suggestedFileName = pathInfo.fileName;
            imageInfo.suggestedPath = pathInfo.markdownPath;
            imageInfo.staticPath = pathInfo.staticPath;

            images.push(imageInfo);
        }

        this.images = images;
        return images;
    }

    /**
     * 处理图片 - 根据模式选择处理方式
     */
    async processImages(content, options = {}) {
        if (this.mode === 'auto') {
            return await this.processImagesAuto(content, options);
        } else {
            return await this.processImagesSemiAuto(content, options);
        }
    }

    /**
     * 方案A：完全自动化处理
     */
    async processImagesAuto(content, options = {}) {
        this.isProcessing = true;
        this.onProgress({ stage: 'analyzing', progress: 0, message: '分析图片中...' });

        try {
            // 分析图片
            const images = this.analyzeImages(content);
            
            if (images.length === 0) {
                this.onComplete({ 
                    success: true, 
                    message: '没有找到需要处理的图片',
                    processedContent: content,
                    images: []
                });
                return { success: true, processedContent: content };
            }

            this.onProgress({ 
                stage: 'processing', 
                progress: 10, 
                message: `开始处理 ${images.length} 张图片...` 
            });

            // 批量处理所有图片
            const processedContent = await this.batchProcessImages(content, images);

            this.onComplete({
                success: true,
                message: `成功处理 ${this.processedImages.length} 张图片`,
                processedContent: processedContent,
                images: this.processedImages
            });

            return { 
                success: true, 
                processedContent: processedContent,
                images: this.processedImages
            };

        } catch (error) {
            this.onError(error);
            return { success: false, error: error.message };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 方案B：半自动化确认处理
     */
    async processImagesSemiAuto(content, options = {}) {
        this.isProcessing = true;
        this.onProgress({ stage: 'analyzing', progress: 0, message: '分析图片中...' });

        try {
            // 分析图片
            const images = this.analyzeImages(content);
            
            if (images.length === 0) {
                this.onComplete({ 
                    success: true, 
                    message: '没有找到需要处理的图片',
                    processedContent: content,
                    images: []
                });
                return { success: true, processedContent: content };
            }

            // 返回图片列表供用户确认
            this.onProgress({ 
                stage: 'confirmation', 
                progress: 20, 
                message: `发现 ${images.length} 张图片，等待用户确认...`,
                images: images
            });

            return { 
                success: true, 
                stage: 'confirmation',
                images: images,
                needsConfirmation: true
            };

        } catch (error) {
            this.onError(error);
            return { success: false, error: error.message };
        }
    }

    /**
     * 确认后处理选中的图片
     */
    async processSelectedImages(content, selectedImages) {
        if (!selectedImages || selectedImages.length === 0) {
            return { success: true, processedContent: content };
        }

        try {
            this.onProgress({ 
                stage: 'processing', 
                progress: 30, 
                message: `开始处理 ${selectedImages.length} 张选中的图片...` 
            });

            const processedContent = await this.batchProcessImages(content, selectedImages);

            this.onComplete({
                success: true,
                message: `成功处理 ${this.processedImages.length} 张图片`,
                processedContent: processedContent,
                images: this.processedImages
            });

            return { 
                success: true, 
                processedContent: processedContent,
                images: this.processedImages
            };

        } catch (error) {
            this.onError(error);
            return { success: false, error: error.message };
        } finally {
            this.isProcessing = false;
        }
    }

    /**
     * 批量处理图片
     */
    async batchProcessImages(content, images) {
        let processedContent = content;
        this.processedImages = [];

        for (let i = 0; i < images.length; i++) {
            const image = images[i];
            
            if (!image.selected) continue;

            try {
                this.onProgress({ 
                    stage: 'processing', 
                    progress: 30 + (i / images.length) * 60, 
                    message: `处理图片 ${i + 1}/${images.length}: ${image.alt}` 
                });

                const result = await this.processSingleImage(image);
                
                if (result.success) {
                    // 替换内容中的图片路径
                    processedContent = processedContent.replace(
                        image.originalMarkdown,
                        `![${image.alt}](${result.newPath})`
                    );
                    
                    this.processedImages.push({
                        ...image,
                        processed: true,
                        newFileName: result.fileName,
                        newPath: result.newPath
                    });
                } else {
                    this.processedImages.push({
                        ...image,
                        processed: false,
                        error: result.error
                    });
                }

            } catch (error) {
                this.processedImages.push({
                    ...image,
                    processed: false,
                    error: error.message
                });
            }
        }

        return processedContent;
    }

    /**
     * 处理单张图片
     */
    async processSingleImage(image) {
        try {
            const fileName = image.customName || image.suggestedFileName;
            
            const response = await fetch('http://localhost:5000/api/download-image', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    url: image.originalUrl,
                    filename: fileName,
                    targetDir: this.pathConfig.fullStaticPath
                })
            });

            const result = await response.json();

            if (result.success) {
                return {
                    success: true,
                    fileName: result.filename,
                    newPath: result.localPath
                };
            } else {
                throw new Error(result.error);
            }

        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * 获取处理统计信息
     */
    getProcessingStats() {
        const total = this.processedImages.length;
        const success = this.processedImages.filter(img => img.processed).length;
        const failed = total - success;

        return {
            total: total,
            success: success,
            failed: failed,
            successRate: total > 0 ? (success / total * 100).toFixed(1) : 0
        };
    }

    /**
     * 重置处理器状态
     */
    reset() {
        this.images = [];
        this.processedImages = [];
        this.isProcessing = false;
        this.pathConfig = null;
    }
}

// 导出为全局变量
window.DualModeImageProcessor = DualModeImageProcessor;
