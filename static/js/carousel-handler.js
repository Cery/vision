// 轮播图加载与回退增强
document.addEventListener('DOMContentLoaded', function() {
  var carousel = document.getElementById('homepageCarousel');
  if (!carousel) return;

  var slideImages = carousel.querySelectorAll('.carousel-item img');

  // 为所有图片设置错误处理与加载状态
  slideImages.forEach(function(img, idx) {
    try {
      // 绑定内联处理兜底
      img.onerror = function(ev) {
        if (typeof window.handleImageError === 'function') {
          window.handleImageError(ev);
        }
      };

      // 主图优先加载
      if (idx === 0) {
        img.loading = 'eager';
        img.fetchPriority = 'high';
      }

      // 预加载未完成的图片
      if (!img.complete || img.naturalWidth === 0) {
        var link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    } catch (e) {
      console.warn('预设轮播图图片属性异常:', e);
    }
  });

  // 切换到下一张时，确保图片已就绪；失败则替换占位
  carousel.addEventListener('slide.bs.carousel', function(ev) {
    try {
      var nextItem = ev.relatedTarget; // 即将展示的 .carousel-item
      if (!nextItem) return;
      var nextImg = nextItem.querySelector('img');
      if (!nextImg) return;

      // 如果尚未加载，尝试预加载并在失败时回退
      if (!nextImg.complete || nextImg.naturalWidth === 0) {
        var tester = new Image();
        tester.onload = function() {
          // 强制一次重绘，确保可见
          nextImg.src = nextImg.src;
        };
        tester.onerror = function() {
          if (typeof window.handleImageError === 'function') {
            window.handleImageError({ target: nextImg });
          }
        };
        tester.src = nextImg.src;
      }
    } catch (e) {
      console.warn('轮播切换预加载异常:', e);
    }
  });
});