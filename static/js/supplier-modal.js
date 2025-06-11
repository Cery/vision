// 供应商弹窗初始化和事件处理
document.addEventListener('DOMContentLoaded', function() {
    // 初始化供应商弹窗
    var supplierModal = document.getElementById('supplierModal');
    if (supplierModal) {
        supplierModal.addEventListener('show.bs.modal', function(event) {
            // 获取触发按钮
            var button = event.relatedTarget;
            
            // 获取数据
            var title = button.getAttribute('data-supplier-title') || '未知供应商';
            var address = button.getAttribute('data-supplier-address') || '未提供';
            var type = button.getAttribute('data-supplier-type') || '未提供';
            var contactPerson = button.getAttribute('data-supplier-contact-person') || '未提供';
            var position = button.getAttribute('data-supplier-position') || '未提供';
            var phone = button.getAttribute('data-supplier-phone') || '未提供';
            var email = button.getAttribute('data-supplier-email') || '未提供';
            var content = button.getAttribute('data-supplier-content') || '暂无简介';
            var series = button.getAttribute('data-supplier-series');
            var models = button.getAttribute('data-supplier-models');
            var gallery = button.getAttribute('data-supplier-gallery');
            
            // 更新模态框内容
            document.getElementById('supplierModalLabel').textContent = title;
            document.getElementById('supplier-title').textContent = title;
            document.getElementById('supplier-address').textContent = address;
            document.getElementById('supplier-type').textContent = type;
            document.getElementById('supplier-contact-person').textContent = contactPerson;
            document.getElementById('supplier-position').textContent = position;
            document.getElementById('supplier-phone').textContent = phone;
            document.getElementById('supplier-email').textContent = email;
            document.getElementById('supplier-description').innerHTML = content;
            
            // 设置电话和邮箱链接
            var phoneLink = document.getElementById('supplier-phone-link');
            var emailLink = document.getElementById('supplier-email-link');
            if (phone && phone !== '未提供') {
                phoneLink.href = 'tel:' + phone;
                phoneLink.style.display = 'inline';
            } else {
                phoneLink.style.display = 'none';
            }
            if (email && email !== '未提供') {
                emailLink.href = 'mailto:' + email;
                emailLink.style.display = 'inline';
            } else {
                emailLink.style.display = 'none';
            }
            
            // 设置联系按钮
            var contactBtn = document.getElementById('supplier-contact-btn');
            if (email && email !== '未提供') {
                contactBtn.href = 'mailto:' + email + '?subject=询价: ' + title;
                contactBtn.style.display = 'inline-block';
            } else {
                contactBtn.style.display = 'none';
            }
            
            // 处理产品系列
            var seriesContainer = document.getElementById('supplier-series');
            seriesContainer.innerHTML = '';
            
            if (series) {
                try {
                    var seriesArray = JSON.parse(series);
                    if (seriesArray && seriesArray.length > 0) {
                        seriesArray.forEach(function(item) {
                            var badge = document.createElement('span');
                            badge.className = 'badge bg-light text-dark me-2 mb-2';
                            badge.textContent = item;
                            seriesContainer.appendChild(badge);
                        });
                    } else {
                        seriesContainer.innerHTML = '<p class="text-muted mb-0">暂无产品系列信息</p>';
                    }
                } catch (e) {
                    seriesContainer.innerHTML = '<p class="text-muted mb-0">暂无产品系列信息</p>';
                }
            } else {
                seriesContainer.innerHTML = '<p class="text-muted mb-0">暂无产品系列信息</p>';
            }
            
            // 处理产品型号
            var modelsContainer = document.getElementById('supplier-models');
            if (modelsContainer) {
                modelsContainer.innerHTML = '';
                
                if (models) {
                    try {
                        var modelsArray = JSON.parse(models);
                        if (modelsArray && modelsArray.length > 0) {
                            modelsArray.forEach(function(item) {
                                var badge = document.createElement('span');
                                badge.className = 'badge bg-light text-dark me-2 mb-2';
                                badge.textContent = item;
                                modelsContainer.appendChild(badge);
                            });
                        } else {
                            modelsContainer.innerHTML = '<p class="text-muted mb-0">暂无产品型号信息</p>';
                        }
                    } catch (e) {
                        modelsContainer.innerHTML = '<p class="text-muted mb-0">暂无产品型号信息</p>';
                    }
                } else {
                    modelsContainer.innerHTML = '<p class="text-muted mb-0">暂无产品型号信息</p>';
                }
            }
            
            // 处理企业相册
            var galleryContainer = document.getElementById('supplier-gallery');
            galleryContainer.innerHTML = '';
            
            if (gallery) {
                try {
                    var galleryArray = JSON.parse(gallery);
                    if (galleryArray && galleryArray.length > 0) {
                        galleryArray.forEach(function(item, index) {
                            var col = document.createElement('div');
                            col.className = 'col-md-4 col-6';
                            
                            var imgWrapper = document.createElement('div');
                            imgWrapper.className = 'gallery-item position-relative';
                            
                            var img = document.createElement('img');
                            img.src = item;
                            img.className = 'img-fluid rounded w-100';
                            img.style.height = '200px';
                            img.style.objectFit = 'cover';
                            img.setAttribute('data-fslightbox', 'supplier-gallery');
                            img.onclick = function() {
                                fsLightboxInstances['supplier-gallery'].open(index);
                            };
                            img.onerror = function() {
                                this.onerror = null;
                                this.src = '/images/placeholder.jpg';
                            };
                            
                            imgWrapper.appendChild(img);
                            col.appendChild(imgWrapper);
                            galleryContainer.appendChild(col);
                        });
                        
                        // 刷新lightbox
    refreshFsLightbox();
                    } else {
                        galleryContainer.innerHTML = '<div class="col-12"><p class="text-muted">暂无企业相册</p></div>';
                    }
                } catch (e) {
                    galleryContainer.innerHTML = '<div class="col-12"><p class="text-muted">暂无企业相册</p></div>';
                }
            } else {
                galleryContainer.innerHTML = '<div class="col-12"><p class="text-muted">暂无企业相册</p></div>';
            }
        });
    }
});

// 关闭供应商弹窗
function closeSupplierModal() {
    const modal = document.getElementById('supplierModal');
    if (!modal) return;
    
    const modalInstance = bootstrap.Modal.getInstance(modal);
    if (modalInstance) {
        modalInstance.hide();
    }
}

// 处理图片加载错误
function handleImageError(img) {
    img.onerror = null; // 防止无限循环
    img.src = '/images/placeholder.jpg'; // 设置默认图片
}