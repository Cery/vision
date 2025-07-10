/**
 * 移动端优化JavaScript
 * 兼容多种移动浏览器：Safari iOS, Chrome Mobile, UC浏览器, 360手机浏览器等
 */

(function() {
    'use strict';

    // 检测移动设备和浏览器
    const MobileDetector = {
        // 基础移动设备检测
        isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent),
        
        // 具体浏览器检测
        isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
        isAndroid: /Android/.test(navigator.userAgent),
        isSafari: /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent),
        isChrome: /Chrome/.test(navigator.userAgent),
        isUC: /UCBrowser|UCWEB/.test(navigator.userAgent),
        is360: /360/.test(navigator.userAgent),
        isQQ: /QQBrowser/.test(navigator.userAgent),
        isSogou: /SogouMobileBrowser/.test(navigator.userAgent),
        isHuawei: /HuaweiBrowser/.test(navigator.userAgent),
        isMiui: /MiuiBrowser/.test(navigator.userAgent),
        
        // 屏幕尺寸检测
        isSmallScreen: window.innerWidth <= 375,
        isTablet: window.innerWidth >= 768 && window.innerWidth <= 1024,
        
        // 触摸支持检测
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
    };

    // 移动端优化管理器
    const MobileOptimizer = {
        init() {
            this.setupViewport();
            this.setupTouchOptimization();
            this.setupScrollOptimization();
            this.setupImageOptimization();
            this.setupFormOptimization();
            this.setupNavigationOptimization();
            this.setupModalOptimization();
            this.setupPerformanceOptimization();
            this.setupBrowserSpecificFixes();
            this.setupAccessibilityEnhancements();
            
            console.log('📱 移动端优化已启用');
        },

        // 视口优化
        setupViewport() {
            // 防止iOS Safari缩放
            if (MobileDetector.isIOS) {
                document.addEventListener('touchstart', function(e) {
                    if (e.touches.length > 1) {
                        e.preventDefault();
                    }
                }, { passive: false });

                let lastTouchEnd = 0;
                document.addEventListener('touchend', function(e) {
                    const now = (new Date()).getTime();
                    if (now - lastTouchEnd <= 300) {
                        e.preventDefault();
                    }
                    lastTouchEnd = now;
                }, false);
            }

            // 处理屏幕旋转
            window.addEventListener('orientationchange', () => {
                setTimeout(() => {
                    this.adjustLayoutForOrientation();
                }, 100);
            });
        },

        // 触摸优化
        setupTouchOptimization() {
            if (!MobileDetector.hasTouch) return;

            // 添加触摸反馈
            document.addEventListener('touchstart', (e) => {
                const target = e.target.closest('button, .btn, a, .clickable');
                if (target) {
                    target.classList.add('touch-active');
                }
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                const target = e.target.closest('button, .btn, a, .clickable');
                if (target) {
                    setTimeout(() => {
                        target.classList.remove('touch-active');
                    }, 150);
                }
            }, { passive: true });

            // 优化滑动手势
            this.setupSwipeGestures();
        },

        // 滑动手势
        setupSwipeGestures() {
            let startX, startY, startTime;

            document.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                startTime = Date.now();
            }, { passive: true });

            document.addEventListener('touchend', (e) => {
                if (!startX || !startY) return;

                const touch = e.changedTouches[0];
                const endX = touch.clientX;
                const endY = touch.clientY;
                const endTime = Date.now();

                const deltaX = endX - startX;
                const deltaY = endY - startY;
                const deltaTime = endTime - startTime;

                // 检测快速滑动
                if (deltaTime < 300 && Math.abs(deltaX) > 50 && Math.abs(deltaY) < 100) {
                    if (deltaX > 0) {
                        this.handleSwipeRight();
                    } else {
                        this.handleSwipeLeft();
                    }
                }

                startX = startY = null;
            }, { passive: true });
        },

        // 滑动处理
        handleSwipeRight() {
            // 可以添加返回上一页等功能
            console.log('👉 向右滑动');
        },

        handleSwipeLeft() {
            // 可以添加前进等功能
            console.log('👈 向左滑动');
        },

        // 滚动优化
        setupScrollOptimization() {
            // iOS Safari滚动优化
            if (MobileDetector.isIOS) {
                const scrollElements = document.querySelectorAll('.scroll-container, .modal-body, .table-responsive');
                scrollElements.forEach(el => {
                    el.style.webkitOverflowScrolling = 'touch';
                });
            }

            // 滚动性能优化
            let ticking = false;
            const updateScrollPosition = () => {
                this.handleScroll();
                ticking = false;
            };

            window.addEventListener('scroll', () => {
                if (!ticking) {
                    requestAnimationFrame(updateScrollPosition);
                    ticking = true;
                }
            }, { passive: true });
        },

        // 滚动处理
        handleScroll() {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // 显示/隐藏返回顶部按钮
            const backToTopBtn = document.getElementById('backToTopBtn');
            if (backToTopBtn) {
                if (scrollTop > 300) {
                    backToTopBtn.style.display = 'block';
                } else {
                    backToTopBtn.style.display = 'none';
                }
            }

            // 导航栏滚动效果
            const navbar = document.querySelector('.navbar');
            if (navbar && scrollTop > 100) {
                navbar.classList.add('navbar-scrolled');
            } else if (navbar) {
                navbar.classList.remove('navbar-scrolled');
            }
        },

        // 图片优化
        setupImageOptimization() {
            // 懒加载图片
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                imageObserver.unobserve(img);
                            }
                        }
                    });
                });

                document.querySelectorAll('img[data-src]').forEach(img => {
                    imageObserver.observe(img);
                });
            }

            // 图片加载错误处理
            document.addEventListener('error', (e) => {
                if (e.target.tagName === 'IMG') {
                    e.target.src = '/images/placeholder.svg';
                }
            }, true);
        },

        // 表单优化
        setupFormOptimization() {
            // 防止iOS缩放
            const inputs = document.querySelectorAll('input, textarea, select');
            inputs.forEach(input => {
                if (MobileDetector.isIOS) {
                    input.style.fontSize = '16px';
                }

                // 自动完成优化
                if (input.type === 'email') {
                    input.setAttribute('autocomplete', 'email');
                    input.setAttribute('inputmode', 'email');
                } else if (input.type === 'tel') {
                    input.setAttribute('autocomplete', 'tel');
                    input.setAttribute('inputmode', 'tel');
                }
            });

            // 表单验证优化
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', (e) => {
                    const invalidInputs = form.querySelectorAll(':invalid');
                    if (invalidInputs.length > 0) {
                        e.preventDefault();
                        invalidInputs[0].focus();
                        this.showValidationMessage(invalidInputs[0]);
                    }
                });
            });
        },

        // 显示验证消息
        showValidationMessage(input) {
            const message = input.validationMessage;
            if (message) {
                // 创建提示框
                const tooltip = document.createElement('div');
                tooltip.className = 'validation-tooltip';
                tooltip.textContent = message;
                tooltip.style.cssText = `
                    position: absolute;
                    background: #dc3545;
                    color: white;
                    padding: 8px 12px;
                    border-radius: 4px;
                    font-size: 14px;
                    z-index: 1000;
                    top: ${input.offsetTop + input.offsetHeight + 5}px;
                    left: ${input.offsetLeft}px;
                `;
                
                input.parentNode.appendChild(tooltip);
                
                setTimeout(() => {
                    tooltip.remove();
                }, 3000);
            }
        },

        // 导航优化
        setupNavigationOptimization() {
            const navbarToggler = document.querySelector('.navbar-toggler');
            const navbarCollapse = document.querySelector('.navbar-collapse');

            if (navbarToggler && navbarCollapse) {
                // 点击外部关闭菜单
                document.addEventListener('click', (e) => {
                    if (!navbarCollapse.contains(e.target) && !navbarToggler.contains(e.target)) {
                        if (navbarCollapse.classList.contains('show')) {
                            navbarToggler.click();
                        }
                    }
                });

                // 菜单项点击后自动关闭
                const navLinks = navbarCollapse.querySelectorAll('.nav-link');
                navLinks.forEach(link => {
                    link.addEventListener('click', () => {
                        if (navbarCollapse.classList.contains('show')) {
                            setTimeout(() => navbarToggler.click(), 100);
                        }
                    });
                });
            }
        },

        // 模态框优化
        setupModalOptimization() {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.addEventListener('shown.bs.modal', () => {
                    // 防止背景滚动
                    document.body.style.overflow = 'hidden';
                    
                    // 焦点管理
                    const firstInput = modal.querySelector('input, textarea, select, button');
                    if (firstInput) {
                        firstInput.focus();
                    }
                });

                modal.addEventListener('hidden.bs.modal', () => {
                    // 恢复背景滚动
                    document.body.style.overflow = '';
                });
            });
        },

        // 性能优化
        setupPerformanceOptimization() {
            // 预加载关键资源
            this.preloadCriticalResources();

            // 延迟加载非关键资源
            this.deferNonCriticalResources();

            // 内存管理
            this.setupMemoryManagement();
        },

        // 预加载关键资源
        preloadCriticalResources() {
            const criticalImages = [
                '/images/logo.svg',
                '/images/favicon.svg'
            ];

            criticalImages.forEach(src => {
                const link = document.createElement('link');
                link.rel = 'preload';
                link.as = 'image';
                link.href = src;
                document.head.appendChild(link);
            });
        },

        // 延迟加载非关键资源
        deferNonCriticalResources() {
            // 延迟加载字体图标
            setTimeout(() => {
                const fontAwesome = document.createElement('link');
                fontAwesome.rel = 'stylesheet';
                fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
                document.head.appendChild(fontAwesome);
            }, 1000);
        },

        // 内存管理
        setupMemoryManagement() {
            // 清理事件监听器
            window.addEventListener('beforeunload', () => {
                // 清理定时器
                this.clearTimers();
                
                // 清理观察器
                if (this.imageObserver) {
                    this.imageObserver.disconnect();
                }
            });
        },

        // 清理定时器
        clearTimers() {
            // 清理所有定时器
            const highestTimeoutId = setTimeout(() => {}, 0);
            for (let i = 0; i < highestTimeoutId; i++) {
                clearTimeout(i);
            }
        },

        // 浏览器特定修复
        setupBrowserSpecificFixes() {
            // UC浏览器修复
            if (MobileDetector.isUC) {
                this.applyUCBrowserFixes();
            }

            // 360浏览器修复
            if (MobileDetector.is360) {
                this.apply360BrowserFixes();
            }

            // QQ浏览器修复
            if (MobileDetector.isQQ) {
                this.applyQQBrowserFixes();
            }

            // 华为浏览器修复
            if (MobileDetector.isHuawei) {
                this.applyHuaweiBrowserFixes();
            }

            // MIUI浏览器修复
            if (MobileDetector.isMiui) {
                this.applyMiuiBrowserFixes();
            }
        },

        // UC浏览器修复
        applyUCBrowserFixes() {
            // 修复flex布局问题
            document.body.classList.add('uc-browser-fix');
            
            // 修复视频播放问题
            const videos = document.querySelectorAll('video');
            videos.forEach(video => {
                video.setAttribute('webkit-playsinline', 'true');
                video.setAttribute('playsinline', 'true');
            });
        },

        // 360浏览器修复
        apply360BrowserFixes() {
            document.body.classList.add('browser-360-fix');
            
            // 修复CSS3动画问题
            const animatedElements = document.querySelectorAll('.animated');
            animatedElements.forEach(el => {
                el.style.webkitAnimationFillMode = 'both';
            });
        },

        // QQ浏览器修复
        applyQQBrowserFixes() {
            document.body.classList.add('qq-browser-fix');
        },

        // 华为浏览器修复
        applyHuaweiBrowserFixes() {
            document.body.classList.add('huawei-browser-fix');
        },

        // MIUI浏览器修复
        applyMiuiBrowserFixes() {
            document.body.classList.add('miui-browser-fix');
        },

        // 无障碍增强
        setupAccessibilityEnhancements() {
            // 键盘导航支持
            this.setupKeyboardNavigation();
            
            // 屏幕阅读器支持
            this.setupScreenReaderSupport();
            
            // 高对比度支持
            this.setupHighContrastSupport();
        },

        // 键盘导航
        setupKeyboardNavigation() {
            document.addEventListener('keydown', (e) => {
                // ESC键关闭模态框
                if (e.key === 'Escape') {
                    const openModal = document.querySelector('.modal.show');
                    if (openModal) {
                        const closeBtn = openModal.querySelector('[data-bs-dismiss="modal"]');
                        if (closeBtn) closeBtn.click();
                    }
                }

                // Tab键焦点管理
                if (e.key === 'Tab') {
                    this.manageFocus(e);
                }
            });
        },

        // 焦点管理
        manageFocus(e) {
            const focusableElements = document.querySelectorAll(
                'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'
            );
            
            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey && document.activeElement === firstElement) {
                e.preventDefault();
                lastElement.focus();
            } else if (!e.shiftKey && document.activeElement === lastElement) {
                e.preventDefault();
                firstElement.focus();
            }
        },

        // 屏幕阅读器支持
        setupScreenReaderSupport() {
            // 添加ARIA标签
            const buttons = document.querySelectorAll('button:not([aria-label])');
            buttons.forEach(btn => {
                if (!btn.textContent.trim()) {
                    btn.setAttribute('aria-label', '按钮');
                }
            });

            // 添加跳转链接
            this.addSkipLinks();
        },

        // 添加跳转链接
        addSkipLinks() {
            const skipLink = document.createElement('a');
            skipLink.href = '#main-content';
            skipLink.textContent = '跳转到主要内容';
            skipLink.className = 'skip-link';
            skipLink.style.cssText = `
                position: absolute;
                top: -40px;
                left: 6px;
                background: #000;
                color: #fff;
                padding: 8px;
                text-decoration: none;
                z-index: 1000;
                border-radius: 4px;
            `;
            
            skipLink.addEventListener('focus', () => {
                skipLink.style.top = '6px';
            });
            
            skipLink.addEventListener('blur', () => {
                skipLink.style.top = '-40px';
            });

            document.body.insertBefore(skipLink, document.body.firstChild);
        },

        // 高对比度支持
        setupHighContrastSupport() {
            // 检测系统高对比度设置
            if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
                document.body.classList.add('high-contrast');
            }
        },

        // 屏幕方向调整
        adjustLayoutForOrientation() {
            const orientation = window.orientation || 0;
            document.body.classList.remove('portrait', 'landscape');
            
            if (Math.abs(orientation) === 90) {
                document.body.classList.add('landscape');
            } else {
                document.body.classList.add('portrait');
            }
        }
    };

    // 初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            MobileOptimizer.init();
        });
    } else {
        MobileOptimizer.init();
    }

    // 导出到全局
    window.MobileOptimizer = MobileOptimizer;
    window.MobileDetector = MobileDetector;

})();
