/**
 * CMS 通用工具函数
 */

// 通知系统
class NotificationSystem {
    constructor() {
        this.container = this.createContainer();
    }

    createContainer() {
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                z-index: 9999;
                max-width: 400px;
            `;
            document.body.appendChild(container);
        }
        return container;
    }

    show(message, type = 'info', duration = 5000) {
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} alert-dismissible fade show`;
        notification.style.cssText = `
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;

        const icon = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-triangle',
            'warning': 'fas fa-exclamation-circle',
            'info': 'fas fa-info-circle'
        }[type] || 'fas fa-info-circle';

        notification.innerHTML = `
            <i class="${icon} mr-2"></i>
            ${message}
            <button type="button" class="btn-close" onclick="this.parentElement.remove()"></button>
        `;

        this.container.appendChild(notification);

        // 自动移除
        if (duration > 0) {
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, duration);
        }

        return notification;
    }

    success(message, duration) {
        return this.show(message, 'success', duration);
    }

    error(message, duration) {
        return this.show(message, 'error', duration);
    }

    warning(message, duration) {
        return this.show(message, 'warning', duration);
    }

    info(message, duration) {
        return this.show(message, 'info', duration);
    }
}

// 全局通知实例
const notify = new NotificationSystem();

// 加载状态管理
class LoadingManager {
    constructor() {
        this.loadingCount = 0;
        this.overlay = null;
    }

    show(message = '加载中...') {
        this.loadingCount++;
        
        if (!this.overlay) {
            this.overlay = document.createElement('div');
            this.overlay.id = 'loading-overlay';
            this.overlay.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(255, 255, 255, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 9998;
                backdrop-filter: blur(2px);
            `;

            this.overlay.innerHTML = `
                <div style="text-align: center; padding: 20px;">
                    <div class="loading mb-2"></div>
                    <div id="loading-message">${message}</div>
                </div>
            `;

            document.body.appendChild(this.overlay);
        } else {
            document.getElementById('loading-message').textContent = message;
        }
    }

    hide() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        
        if (this.loadingCount === 0 && this.overlay) {
            this.overlay.remove();
            this.overlay = null;
        }
    }

    updateMessage(message) {
        const messageEl = document.getElementById('loading-message');
        if (messageEl) {
            messageEl.textContent = message;
        }
    }
}

// 全局加载管理实例
const loading = new LoadingManager();

// 文件工具函数
const FileUtils = {
    /**
     * 格式化文件大小
     */
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    },

    /**
     * 获取文件扩展名
     */
    getFileExtension(filename) {
        return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
    },

    /**
     * 检查文件类型
     */
    isImageFile(filename) {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
        const ext = this.getFileExtension(filename).toLowerCase();
        return imageExtensions.includes(ext);
    },

    isMarkdownFile(filename) {
        const ext = this.getFileExtension(filename).toLowerCase();
        return ext === 'md' || ext === 'markdown';
    },

    /**
     * 生成安全的文件名
     */
    sanitizeFilename(filename) {
        return filename
            .toLowerCase()
            .replace(/[^a-z0-9\-_.]/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '');
    },

    /**
     * 读取文件内容
     */
    readFileAsText(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => reject(new Error('文件读取失败'));
            reader.readAsText(file);
        });
    },

    /**
     * 下载文件
     */
    downloadFile(content, filename, mimeType = 'text/plain') {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
    }
};

// 日期工具函数
const DateUtils = {
    /**
     * 格式化日期
     */
    formatDate(date, format = 'YYYY-MM-DD') {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        const seconds = String(d.getSeconds()).padStart(2, '0');

        return format
            .replace('YYYY', year)
            .replace('MM', month)
            .replace('DD', day)
            .replace('HH', hours)
            .replace('mm', minutes)
            .replace('ss', seconds);
    },

    /**
     * 获取相对时间
     */
    getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (days > 0) return `${days}天前`;
        if (hours > 0) return `${hours}小时前`;
        if (minutes > 0) return `${minutes}分钟前`;
        return '刚刚';
    },

    /**
     * 获取今天的日期字符串
     */
    getTodayString() {
        return this.formatDate(new Date(), 'YYYY-MM-DD');
    }
};

// 字符串工具函数
const StringUtils = {
    /**
     * 生成URL友好的slug
     */
    generateSlug(text) {
        return text
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    },

    /**
     * 截断文本
     */
    truncate(text, length = 100, suffix = '...') {
        if (text.length <= length) return text;
        return text.substring(0, length) + suffix;
    },

    /**
     * 首字母大写
     */
    capitalize(text) {
        return text.charAt(0).toUpperCase() + text.slice(1);
    },

    /**
     * 转换为标题格式
     */
    toTitleCase(text) {
        return text.replace(/\w\S*/g, (txt) => 
            txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
        );
    }
};

// 本地存储工具
const StorageUtils = {
    /**
     * 设置本地存储
     */
    set(key, value, expiry = null) {
        const data = {
            value,
            expiry: expiry ? Date.now() + expiry : null
        };
        localStorage.setItem(key, JSON.stringify(data));
    },

    /**
     * 获取本地存储
     */
    get(key) {
        try {
            const item = localStorage.getItem(key);
            if (!item) return null;

            const data = JSON.parse(item);
            
            // 检查是否过期
            if (data.expiry && Date.now() > data.expiry) {
                localStorage.removeItem(key);
                return null;
            }

            return data.value;
        } catch (error) {
            console.error('读取本地存储失败:', error);
            return null;
        }
    },

    /**
     * 删除本地存储
     */
    remove(key) {
        localStorage.removeItem(key);
    },

    /**
     * 清空本地存储
     */
    clear() {
        localStorage.clear();
    }
};

// 表单验证工具
const ValidationUtils = {
    /**
     * 验证必填字段
     */
    required(value) {
        return value !== null && value !== undefined && value.toString().trim() !== '';
    },

    /**
     * 验证邮箱格式
     */
    email(value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(value);
    },

    /**
     * 验证URL格式
     */
    url(value) {
        try {
            new URL(value);
            return true;
        } catch {
            return false;
        }
    },

    /**
     * 验证长度
     */
    length(value, min = 0, max = Infinity) {
        const len = value ? value.toString().length : 0;
        return len >= min && len <= max;
    },

    /**
     * 验证表单
     */
    validateForm(formData, rules) {
        const errors = {};

        for (const [field, fieldRules] of Object.entries(rules)) {
            const value = formData[field];

            for (const rule of fieldRules) {
                if (rule.type === 'required' && !this.required(value)) {
                    errors[field] = rule.message || `${field}是必填字段`;
                    break;
                }

                if (rule.type === 'email' && value && !this.email(value)) {
                    errors[field] = rule.message || `${field}格式不正确`;
                    break;
                }

                if (rule.type === 'length' && value && !this.length(value, rule.min, rule.max)) {
                    errors[field] = rule.message || `${field}长度不符合要求`;
                    break;
                }
            }
        }

        return {
            isValid: Object.keys(errors).length === 0,
            errors
        };
    }
};

// 防抖和节流
const DebounceUtils = {
    /**
     * 防抖函数
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * 节流函数
     */
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
};

// 导出工具函数
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        NotificationSystem,
        LoadingManager,
        FileUtils,
        DateUtils,
        StringUtils,
        StorageUtils,
        ValidationUtils,
        DebounceUtils,
        notify,
        loading
    };
} else {
    window.CmsUtils = {
        NotificationSystem,
        LoadingManager,
        FileUtils,
        DateUtils,
        StringUtils,
        StorageUtils,
        ValidationUtils,
        DebounceUtils,
        notify,
        loading
    };
}
