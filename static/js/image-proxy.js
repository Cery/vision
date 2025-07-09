// 图片代理客户端 - 用于前台页面访问后台管理的图片
(function() {
    'use strict';
    
    console.log('🖼️ 图片代理客户端已加载');
    
    // 图片请求缓存
    const imageCache = new Map();
    const pendingRequests = new Map();
    
    // 处理图片加载错误的函数
    function handleImageError(img, originalSrc) {
        console.log(`🔍 尝试通过代理加载图片: ${originalSrc}`);
        
        // 提取文件名
        const fileName = originalSrc.split('/').pop();
        if (!fileName) {
            console.error('无法提取文件名:', originalSrc);
            return;
        }
        
        // 检查缓存
        if (imageCache.has(fileName)) {
            const cachedData = imageCache.get(fileName);
            if (cachedData) {
                img.src = cachedData;
                console.log(`✅ 从缓存加载图片: ${fileName}`);
                return;
            }
        }
        
        // 检查是否已有相同的请求在进行
        if (pendingRequests.has(fileName)) {
            pendingRequests.get(fileName).push(img);
            return;
        }
        
        // 创建新的请求
        pendingRequests.set(fileName, [img]);
        
        // 向后台管理页面请求图片数据
        requestImageFromAdmin(fileName).then(imageData => {
            if (imageData) {
                // 缓存图片数据
                imageCache.set(fileName, imageData);
                
                // 更新所有等待的图片元素
                const waitingImages = pendingRequests.get(fileName) || [];
                waitingImages.forEach(waitingImg => {
                    waitingImg.src = imageData;
                    console.log(`✅ 图片加载成功: ${fileName}`);
                });
            } else {
                console.error(`❌ 图片加载失败: ${fileName}`);
                // 设置默认图片或占位符
                const waitingImages = pendingRequests.get(fileName) || [];
                waitingImages.forEach(waitingImg => {
                    waitingImg.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+aaguaXtuWKoOi9vTwvdGV4dD48L3N2Zz4=';
                });
            }
            
            // 清理请求记录
            pendingRequests.delete(fileName);
        });
    }
    
    // 向后台管理页面请求图片数据
    function requestImageFromAdmin(fileName) {
        return new Promise((resolve) => {
            const requestId = Math.random().toString(36).substring(2);
            
            // 设置超时
            const timeout = setTimeout(() => {
                window.removeEventListener('message', messageHandler);
                resolve(null);
            }, 5000);
            
            // 消息处理器
            function messageHandler(event) {
                if (event.data.type === 'IMAGE_RESPONSE' && event.data.requestId === requestId) {
                    clearTimeout(timeout);
                    window.removeEventListener('message', messageHandler);
                    resolve(event.data.imageData);
                }
            }
            
            // 监听响应
            window.addEventListener('message', messageHandler);
            
            // 尝试向后台管理页面发送请求
            try {
                // 如果后台管理页面在同一个窗口中打开过，尝试通过localStorage通信
                const adminWindow = window.parent !== window ? window.parent : window.opener;
                if (adminWindow) {
                    adminWindow.postMessage({
                        type: 'REQUEST_IMAGE',
                        fileName: fileName,
                        requestId: requestId
                    }, '*');
                } else {
                    // 降级方案：直接从localStorage读取
                    const tempImages = JSON.parse(localStorage.getItem('tempImages') || '{}');
                    const tempFiles = JSON.parse(localStorage.getItem('tempFiles') || '{}');

                    let imageData = null;

                    // 首先尝试通过文件名查找
                    if (tempImages[fileName]) {
                        imageData = tempImages[fileName].data;
                    } else if (tempFiles[fileName]) {
                        imageData = tempFiles[fileName].url;
                    } else {
                        // 尝试通过路径查找
                        for (const [key, value] of Object.entries(tempImages)) {
                            if (value.targetPath === originalSrc) {
                                imageData = value.data;
                                break;
                            }
                        }

                        if (!imageData) {
                            for (const [key, value] of Object.entries(tempFiles)) {
                                if (value.targetPath === originalSrc) {
                                    imageData = value.url;
                                    break;
                                }
                            }
                        }
                    }

                    clearTimeout(timeout);
                    window.removeEventListener('message', messageHandler);
                    resolve(imageData);
                }
            } catch (error) {
                console.error('请求图片数据失败:', error);
                clearTimeout(timeout);
                window.removeEventListener('message', messageHandler);
                resolve(null);
            }
        });
    }
    
    // 监听图片加载错误
    function initImageErrorHandling() {
        // 处理现有的图片
        document.querySelectorAll('img').forEach(img => {
            if (img.complete && img.naturalWidth === 0) {
                handleImageError(img, img.src);
            } else {
                img.addEventListener('error', function() {
                    handleImageError(this, this.src);
                });
            }
        });
        
        // 监听新添加的图片
        const observer = new MutationObserver(mutations => {
            mutations.forEach(mutation => {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        if (node.tagName === 'IMG') {
                            node.addEventListener('error', function() {
                                handleImageError(this, this.src);
                            });
                        } else {
                            node.querySelectorAll('img').forEach(img => {
                                img.addEventListener('error', function() {
                                    handleImageError(this, this.src);
                                });
                            });
                        }
                    }
                });
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
    
    // 页面加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initImageErrorHandling);
    } else {
        initImageErrorHandling();
    }
    
    // 定期清理缓存
    setInterval(() => {
        const now = Date.now();
        const maxAge = 30 * 60 * 1000; // 30分钟
        
        for (const [fileName, data] of imageCache.entries()) {
            // 如果是blob URL，检查是否过期
            if (typeof data === 'string' && data.startsWith('blob:')) {
                // 简单的过期检查（实际实现可能需要更复杂的逻辑）
                if (Math.random() < 0.1) { // 10%的概率清理
                    imageCache.delete(fileName);
                }
            }
        }
    }, 5 * 60 * 1000); // 每5分钟检查一次
    
})();
