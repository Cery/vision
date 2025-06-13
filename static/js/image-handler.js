// 图片加载和错误处理
document.addEventListener('DOMContentLoaded', function() {
    // 获取所有图片
    const images = document.querySelectorAll('img');
    
    images.forEach(img => {
        // 添加加载状态类
        img.classList.add('img-loading');
        
        // 图片加载完成
        img.onload = function() {
            this.classList.remove('img-loading');
            this.classList.add('img-responsive');
            
            // 如果图片父元素有 img-container 类，添加适当的 object-fit 类
            const container = this.closest('.img-container');
            if (container) {
                if (container.dataset.fit === 'cover') {
                    this.classList.add('img-cover');
                } else if (container.dataset.fit === 'scale-down') {
                    this.classList.add('img-scale-down');
                }
            }
        };
        
        // 图片加载失败
        img.onerror = function() {
            this.classList.remove('img-loading');
            this.classList.add('img-error');
            this.src = '/images/placeholder.jpg'; // 设置默认图片
        };
    });
});

// 图片懒加载
document.addEventListener('DOMContentLoaded', function() {
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    lazyImages.forEach(img => {
        imageObserver.observe(img);
    });
}); 