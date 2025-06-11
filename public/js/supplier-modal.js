// 供应商弹窗初始化和事件处理
document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有供应商链接的点击事件
    initSupplierLinks();
});

// 初始化供应商链接
function initSupplierLinks() {
    // 获取所有供应商链接
    const supplierLinks = document.querySelectorAll('.supplier-link');
    
    // 为每个链接添加点击事件
    supplierLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault(); // 阻止默认跳转行为
            
            // 获取供应商数据
            const supplierId = this.getAttribute('data-supplier-id');
            if (supplierId) {
                showSupplierModal(supplierId);
            }
        });
    });
}

// 显示供应商弹窗
function showSupplierModal(supplierId) {
    // 获取弹窗元素
    const modal = document.getElementById('supplierModal');
    if (!modal) return;
    
    // 使用 Bootstrap Modal 显示弹窗
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();
    
    // 初始化图片预览
    refreshFsLightbox();
}

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