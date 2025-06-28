/**
 * 产品管理修复脚本
 * 解决文件保存路径、图片字段显示、字段匹配等问题
 */

// 修复后的ContentAPI
window.FixedContentAPI = {
    // 修复产品保存功能
    async saveProduct(productData) {
        try {
            // 生成产品ID（如果没有）
            if (!productData.id) {
                productData.id = productData.product_code || 'product_' + Date.now();
            }

            // 清理和标准化数据
            const cleanedData = this.cleanProductData(productData);

            // 生成Hugo markdown文件内容
            const markdownContent = this.generateHugoMarkdown(cleanedData);

            // 保存到localStorage
            this.saveToLocalStorage(cleanedData);

            // 创建正确的文件下载
            this.downloadToCorrectPath(cleanedData, markdownContent);

            return {
                success: true,
                message: '产品保存成功！文件已下载，请放入 content/products/ 目录',
                data: cleanedData
            };

        } catch (error) {
            console.error('保存产品失败:', error);
            return {
                success: false,
                message: '保存失败: ' + error.message
            };
        }
    },

    // 清理产品数据，移除不必要的字段
    cleanProductData(productData) {
        return {
            // 基本信息
            title: productData.title,
            model: productData.model,
            product_code: productData.product_code || productData.id,
            summary: productData.summary,
            
            // 分类信息
            primary_category: productData.primary_category,
            secondary_category: productData.secondary_category,
            supplier: productData.supplier,
            series: productData.series,
            
            // 图片信息 - 修复gallery字段
            featured_image: productData.featured_image || (productData.gallery && productData.gallery[0] ? productData.gallery[0].image : ''),
            gallery: this.cleanGalleryData(productData.gallery),
            
            // 技术参数
            specifications: this.convertParametersToSpecs(productData.parameters),
            
            // 内容
            application_scenarios: productData.application_scenarios,
            description: productData.content || productData.description,
            
            // 资料下载
            data_download: productData.data_download || [],
            
            // 相关产品
            related_products: productData.related_products || [],
            
            // 状态
            status: 'published',
            date: new Date().toISOString().split('T')[0],
            
            // 移除不需要的字段
            // weight, tags 等字段不包含在产品模板中
        };
    },

    // 清理图片库数据
    cleanGalleryData(gallery) {
        if (!Array.isArray(gallery)) return [];
        
        return gallery.map((item, index) => {
            if (typeof item === 'string') {
                return {
                    image: item,
                    alt: `产品图片 ${index + 1}`,
                    is_main: index === 0
                };
            } else if (typeof item === 'object' && item.image) {
                return {
                    image: item.image,
                    alt: item.alt || `产品图片 ${index + 1}`,
                    is_main: item.is_main || index === 0
                };
            }
            return null;
        }).filter(item => item !== null);
    },

    // 转换参数为规格
    convertParametersToSpecs(parameters) {
        if (!Array.isArray(parameters)) return {};
        
        const specs = {};
        parameters.forEach(param => {
            if (param.name && param.value) {
                specs[param.name] = param.value;
            }
        });
        return specs;
    },

    // 生成Hugo markdown文件内容
    generateHugoMarkdown(product) {
        let yaml = '---\n';
        yaml += `title: "${product.title}"\n`;
        yaml += `model: "${product.model}"\n`;
        yaml += `product_code: "${product.product_code}"\n`;
        yaml += `summary: "${product.summary || ''}"\n`;
        yaml += `primary_category: "${product.primary_category || ''}"\n`;
        yaml += `secondary_category: "${product.secondary_category || ''}"\n`;
        yaml += `supplier: "${product.supplier || ''}"\n`;
        yaml += `series: "${product.series || ''}"\n`;
        yaml += `featured_image: "${product.featured_image || ''}"\n`;
        yaml += `date: ${product.date}\n`;
        yaml += `status: "${product.status}"\n`;

        // 图片库
        if (product.gallery && product.gallery.length > 0) {
            yaml += 'gallery:\n';
            product.gallery.forEach(img => {
                yaml += `  - image: "${img.image}"\n`;
                yaml += `    alt: "${img.alt}"\n`;
                yaml += `    is_main: ${img.is_main}\n`;
            });
        }

        // 技术规格
        if (product.specifications && Object.keys(product.specifications).length > 0) {
            yaml += 'specifications:\n';
            Object.entries(product.specifications).forEach(([key, value]) => {
                yaml += `  "${key}": "${value}"\n`;
            });
        }

        // 资料下载
        if (product.data_download && product.data_download.length > 0) {
            yaml += 'data_download:\n';
            product.data_download.forEach(item => {
                yaml += `  - file_title: "${item.file_title}"\n`;
                yaml += `    file_path: "${item.file_path}"\n`;
            });
        }

        // 相关产品
        if (product.related_products && product.related_products.length > 0) {
            yaml += 'related_products:\n';
            product.related_products.forEach(id => {
                yaml += `  - "${id}"\n`;
            });
        }

        yaml += '---\n\n';

        // 内容部分
        const content = `# ${product.title}

## 产品概述

${product.summary || '这是一款专业的工业检测设备。'}

## 应用场景

${product.application_scenarios || '适用于各种工业检测场景。'}

## 产品描述

${product.description || '详细的产品描述信息。'}
`;

        return yaml + content;
    },

    // 保存到localStorage
    saveToLocalStorage(productData) {
        let savedProducts = JSON.parse(localStorage.getItem('visndt_products') || '[]');
        
        const existingIndex = savedProducts.findIndex(p => p.product_code === productData.product_code);
        if (existingIndex !== -1) {
            savedProducts[existingIndex] = productData;
        } else {
            savedProducts.push(productData);
        }
        
        localStorage.setItem('visndt_products', JSON.stringify(savedProducts));
    },

    // 下载到正确路径
    downloadToCorrectPath(product, content) {
        const filename = `${product.product_code}.md`;
        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);

        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.style.display = 'none';

        // 添加提示信息
        const notification = document.createElement('div');
        notification.className = 'alert alert-info position-fixed';
        notification.style.cssText = 'top: 20px; right: 20px; z-index: 9999; max-width: 400px;';
        notification.innerHTML = `
            <h6><i class="fas fa-download me-2"></i>文件下载提示</h6>
            <p class="mb-2">文件 <strong>${filename}</strong> 已下载</p>
            <p class="mb-0 small">请将此文件放入项目的 <code>content/products/</code> 目录中</p>
        `;

        document.body.appendChild(notification);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 5秒后移除提示
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 5000);
    }
};

// 修复图片上传组件
window.FixedImageUploader = {
    // 创建图片上传组件
    createImageUploader(containerId, options = {}) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const uploaderHtml = `
            <div class="image-uploader">
                <div class="upload-options mb-3">
                    <button type="button" class="btn btn-outline-primary me-2" onclick="FixedImageUploader.uploadFromLocal('${containerId}')">
                        <i class="fas fa-upload me-1"></i>本地上传
                    </button>
                    <button type="button" class="btn btn-outline-secondary" onclick="FixedImageUploader.selectFromLibrary('${containerId}')">
                        <i class="fas fa-images me-1"></i>媒体库选择
                    </button>
                </div>
                <div class="image-preview-area" id="${containerId}_preview">
                    <div class="upload-placeholder text-center p-4 border border-dashed rounded">
                        <i class="fas fa-image fa-3x text-muted mb-2"></i>
                        <p class="text-muted">点击上方按钮添加图片</p>
                    </div>
                </div>
                <input type="file" id="${containerId}_input" accept="image/*" multiple style="display: none;">
            </div>
        `;

        container.innerHTML = uploaderHtml;
    },

    // 本地上传
    uploadFromLocal(containerId) {
        const input = document.getElementById(`${containerId}_input`);
        input.onchange = (e) => {
            const files = e.target.files;
            this.handleFiles(containerId, files);
        };
        input.click();
    },

    // 媒体库选择
    selectFromLibrary(containerId) {
        this.showMediaLibrary(containerId);
    },

    // 处理文件
    handleFiles(containerId, files) {
        const previewArea = document.getElementById(`${containerId}_preview`);
        previewArea.innerHTML = '';

        Array.from(files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const imageHtml = `
                    <div class="image-item d-inline-block position-relative m-2">
                        <img src="${e.target.result}" alt="上传图片 ${index + 1}" class="img-thumbnail" style="width: 150px; height: 150px; object-fit: cover;">
                        <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" onclick="this.parentElement.remove()">
                            <i class="fas fa-times"></i>
                        </button>
                        <input type="hidden" name="gallery_images[]" value="${e.target.result}">
                    </div>
                `;
                previewArea.insertAdjacentHTML('beforeend', imageHtml);
            };
            reader.readAsDataURL(file);
        });
    },

    // 显示媒体库
    showMediaLibrary(containerId) {
        const modalHtml = `
            <div class="modal fade" id="mediaLibraryModal" tabindex="-1">
                <div class="modal-dialog modal-xl">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title">媒体库</h5>
                            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-3">
                                    <div class="list-group">
                                        <a href="#" class="list-group-item list-group-item-action active" onclick="FixedImageUploader.loadMediaFolder('images')">
                                            <i class="fas fa-folder me-2"></i>images
                                        </a>
                                        <a href="#" class="list-group-item list-group-item-action" onclick="FixedImageUploader.loadMediaFolder('uploads')">
                                            <i class="fas fa-folder me-2"></i>uploads
                                        </a>
                                        <a href="#" class="list-group-item list-group-item-action" onclick="FixedImageUploader.loadMediaFolder('products')">
                                            <i class="fas fa-folder me-2"></i>products
                                        </a>
                                    </div>
                                </div>
                                <div class="col-md-9">
                                    <div id="mediaGrid" class="row">
                                        <!-- 媒体文件将在这里显示 -->
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                            <button type="button" class="btn btn-primary" onclick="FixedImageUploader.selectMediaImages('${containerId}')">选择图片</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 移除已存在的模态框
        const existingModal = document.getElementById('mediaLibraryModal');
        if (existingModal) {
            existingModal.remove();
        }

        document.body.insertAdjacentHTML('beforeend', modalHtml);
        const modal = new bootstrap.Modal(document.getElementById('mediaLibraryModal'));
        modal.show();

        // 默认加载images文件夹
        this.loadMediaFolder('images');
    },

    // 加载媒体文件夹
    loadMediaFolder(folder) {
        const mediaGrid = document.getElementById('mediaGrid');
        
        // 模拟媒体文件
        const mockImages = [
            '/images/products/default-1.jpg',
            '/images/products/default-2.jpg',
            '/images/products/default-3.jpg',
            '/images/uploads/sample-1.jpg',
            '/images/uploads/sample-2.jpg',
        ];

        const gridHtml = mockImages.map(img => `
            <div class="col-md-3 mb-3">
                <div class="card">
                    <img src="${img}" class="card-img-top" style="height: 150px; object-fit: cover;" alt="媒体文件">
                    <div class="card-body p-2">
                        <div class="form-check">
                            <input class="form-check-input" type="checkbox" value="${img}" id="media_${img.replace(/[^a-zA-Z0-9]/g, '_')}">
                            <label class="form-check-label small" for="media_${img.replace(/[^a-zA-Z0-9]/g, '_')}">
                                ${img.split('/').pop()}
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        mediaGrid.innerHTML = gridHtml;
    },

    // 选择媒体图片
    selectMediaImages(containerId) {
        const selectedImages = document.querySelectorAll('#mediaGrid input[type="checkbox"]:checked');
        const previewArea = document.getElementById(`${containerId}_preview`);
        
        if (selectedImages.length === 0) {
            alert('请选择至少一张图片');
            return;
        }

        previewArea.innerHTML = '';

        selectedImages.forEach((checkbox, index) => {
            const imageSrc = checkbox.value;
            const imageHtml = `
                <div class="image-item d-inline-block position-relative m-2">
                    <img src="${imageSrc}" alt="选择图片 ${index + 1}" class="img-thumbnail" style="width: 150px; height: 150px; object-fit: cover;">
                    <button type="button" class="btn btn-sm btn-danger position-absolute top-0 end-0" onclick="this.parentElement.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                    <input type="hidden" name="gallery_images[]" value="${imageSrc}">
                </div>
            `;
            previewArea.insertAdjacentHTML('beforeend', imageHtml);
        });

        // 关闭模态框
        const modal = bootstrap.Modal.getInstance(document.getElementById('mediaLibraryModal'));
        modal.hide();
    }
};

// 应用修复
document.addEventListener('DOMContentLoaded', function() {
    // 替换原有的ContentAPI
    if (window.ContentAPI) {
        window.ContentAPI = { ...window.ContentAPI, ...window.FixedContentAPI };
    }
    
    // 替换原有的ProductAPI
    if (window.ProductAPI) {
        window.ProductAPI = { ...window.ProductAPI, ...window.FixedContentAPI };
    }
    
    console.log('产品管理修复脚本已加载');
});
