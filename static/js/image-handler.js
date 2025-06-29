// 增强的图片加载和错误处理系统
document.addEventListener('DOMContentLoaded', function() {
    // 默认占位图片配置
    const placeholderImages = {
        default: '/images/assets/brand/brand_general_placeholder_original_v1.svg',
        product: '/images/placeholders/general/product-placeholder.svg',
        news: '/images/placeholders/general/news-placeholder.svg',
        partner: '/images/placeholders/general/partner-placeholder.svg',
        carousel: '/images/placeholders/general/carousel-placeholder.svg'
    };

    // 获取图片类型
    function getImageType(img) {
        const src = img.src || img.dataset.src || '';
        const alt = img.alt || '';

        if (src.includes('/products/') || alt.includes('产品')) return 'product';
        if (src.includes('/news/') || alt.includes('新闻')) return 'news';
        if (src.includes('/partner/') || alt.includes('合作伙伴')) return 'partner';
        if (src.includes('/carousel/') || alt.includes('轮播')) return 'carousel';

        return 'default';
    }

    // 获取所有图片
    const images = document.querySelectorAll('img');

    images.forEach(img => {
        // 添加加载状态类
        img.classList.add('img-loading');

        // 图片加载完成
        img.onload = function() {
            this.classList.remove('img-loading');
            this.classList.add('img-responsive', 'img-loaded');

            // 如果图片父元素有 img-container 类，添加适当的 object-fit 类
            const container = this.closest('.img-container');
            if (container) {
                if (container.dataset.fit === 'cover') {
                    this.classList.add('img-cover');
                } else if (container.dataset.fit === 'scale-down') {
                    this.classList.add('img-scale-down');
                }
            }

            // 触发自定义事件
            this.dispatchEvent(new CustomEvent('imageLoaded', {
                detail: { src: this.src, alt: this.alt }
            }));
        };

        // 图片加载失败处理
        img.onerror = function() {
            this.classList.remove('img-loading');
            this.classList.add('img-error');

            // 获取适当的占位图片
            const imageType = getImageType(this);
            const fallbackSrc = placeholderImages[imageType];

            // 避免无限循环
            if (this.src !== fallbackSrc) {
                console.warn(`图片加载失败: ${this.src}, 使用占位图片: ${fallbackSrc}`);
                this.src = fallbackSrc;
                this.alt = this.alt || '图片加载失败';
            }

            // 触发自定义事件
            this.dispatchEvent(new CustomEvent('imageError', {
                detail: { originalSrc: this.dataset.originalSrc || this.src, fallbackSrc: fallbackSrc }
            }));
        };

        // 保存原始src用于错误报告
        if (img.src && !img.dataset.originalSrc) {
            img.dataset.originalSrc = img.src;
        }
    });

    // 图片预加载功能
    function preloadCriticalImages() {
        const criticalImages = [
            '/images/assets/brand/logos/brand_logos_logo_original_v1.svg',
            '/images/banners/home/carousel_general_carousel-1_original_v1.jpg',
            '/images/banners/home/carousel_general_carousel-2_original_v1.jpg',
            '/images/banners/home/carousel_general_carousel-3_original_v1.webp'
        ];

        criticalImages.forEach(src => {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.href = src;
            document.head.appendChild(link);
        });
    }

    // 懒加载支持
    function initLazyLoading() {
        if ('IntersectionObserver' in window) {
            const lazyImages = document.querySelectorAll('img[data-src]');
            const imageObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        img.src = img.dataset.src;
                        img.classList.remove('lazy');
                        imageObserver.unobserve(img);
                    }
                });
            });

            lazyImages.forEach(img => imageObserver.observe(img));
        }
    }

    // 图片性能监控
    function monitorImagePerformance() {
        let loadedImages = 0;
        let failedImages = 0;

        document.addEventListener('imageLoaded', () => {
            loadedImages++;
        });

        document.addEventListener('imageError', (e) => {
            failedImages++;
            console.warn('图片加载失败统计:', {
                failed: failedImages,
                loaded: loadedImages,
                details: e.detail
            });
        });
    }

    // 初始化所有功能
    preloadCriticalImages();
    initLazyLoading();
    monitorImagePerformance();

    // 全局图片工具函数
    window.ImageUtils = {
        preloadImage: function(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = src;
            });
        },

        getImageDimensions: function(src) {
            return this.preloadImage(src).then(img => ({
                width: img.naturalWidth,
                height: img.naturalHeight,
                aspectRatio: img.naturalWidth / img.naturalHeight
            }));
        }
    };
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