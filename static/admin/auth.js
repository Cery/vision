/**
 * VisNDT 管理系统认证模块
 * 提供登录验证、会话管理等功能
 */

// 会话存储键
const SESSION_KEY = 'visndt_admin_session';
const REMEMBER_KEY = 'visndt_admin_remember';

// 默认登录凭据
const DEFAULT_CREDENTIALS = {
    username: 'administer',
    password: 'administer123'
};

/**
 * 管理系统认证类
 */
class AdminAuth {
    /**
     * 检查用户是否已登录
     * @returns {boolean} 是否已登录
     */
    static isLoggedIn() {
        // 检查会话存储
        const sessionData = sessionStorage.getItem(SESSION_KEY);
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                // 会话有效期为8小时
                if (Date.now() - session.loginTime < 8 * 60 * 60 * 1000) {
                    return true;
                }
            } catch (e) {
                console.error('会话数据解析失败:', e);
                sessionStorage.removeItem(SESSION_KEY);
            }
        }

        // 检查记住我
        const rememberData = localStorage.getItem(REMEMBER_KEY);
        if (rememberData) {
            try {
                const remember = JSON.parse(rememberData);
                // 记住我有效期为30天
                if (Date.now() - remember.loginTime < 30 * 24 * 60 * 60 * 1000) {
                    // 重新设置会话
                    this.setSession(remember.username, true);
                    return true;
                }
            } catch (e) {
                console.error('记住我数据解析失败:', e);
                localStorage.removeItem(REMEMBER_KEY);
            }
        }

        return false;
    }

    /**
     * 验证登录凭据
     * @param {string} username 用户名
     * @param {string} password 密码
     * @returns {boolean} 验证结果
     */
    static validateCredentials(username, password) {
        return username === DEFAULT_CREDENTIALS.username && 
               password === DEFAULT_CREDENTIALS.password;
    }

    /**
     * 设置用户会话
     * @param {string} username 用户名
     * @param {boolean} remember 是否记住登录
     */
    static setSession(username, remember = false) {
        const sessionData = {
            username: username,
            loginTime: Date.now(),
            remember: remember
        };

        // 设置会话存储
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(sessionData));

        // 如果选择记住我，设置本地存储
        if (remember) {
            localStorage.setItem(REMEMBER_KEY, JSON.stringify({
                username: username,
                loginTime: Date.now()
            }));
        }
    }

    /**
     * 获取当前登录用户信息
     * @returns {object|null} 用户信息
     */
    static getCurrentUser() {
        const sessionData = sessionStorage.getItem(SESSION_KEY);
        if (sessionData) {
            try {
                return JSON.parse(sessionData);
            } catch (e) {
                console.error('用户信息解析失败:', e);
                return null;
            }
        }
        return null;
    }

    /**
     * 用户登出
     */
    static logout() {
        sessionStorage.removeItem(SESSION_KEY);
        localStorage.removeItem(REMEMBER_KEY);
        
        // 跳转到登录页面
        window.location.href = 'login.html';
    }

    /**
     * 检查页面访问权限
     * 如果未登录，自动跳转到登录页面
     */
    static requireAuth() {
        if (!this.isLoggedIn()) {
            // 保存当前页面URL，登录后可以跳转回来
            const currentPage = window.location.pathname + window.location.search;
            sessionStorage.setItem('visndt_redirect_after_login', currentPage);
            
            window.location.href = 'login.html';
            return false;
        }
        return true;
    }

    /**
     * 延长会话时间
     */
    static extendSession() {
        const sessionData = sessionStorage.getItem(SESSION_KEY);
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                session.loginTime = Date.now();
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
                
                // 如果有记住我，也更新本地存储
                if (session.remember) {
                    const rememberData = localStorage.getItem(REMEMBER_KEY);
                    if (rememberData) {
                        const remember = JSON.parse(rememberData);
                        remember.loginTime = Date.now();
                        localStorage.setItem(REMEMBER_KEY, JSON.stringify(remember));
                    }
                }
            } catch (e) {
                console.error('延长会话失败:', e);
            }
        }
    }

    /**
     * 获取登录后重定向URL
     * @returns {string} 重定向URL
     */
    static getRedirectUrl() {
        const redirectUrl = sessionStorage.getItem('visndt_redirect_after_login');
        if (redirectUrl) {
            sessionStorage.removeItem('visndt_redirect_after_login');
            return redirectUrl;
        }
        return 'index.html';
    }

    /**
     * 初始化认证模块
     * 自动检查登录状态并设置定时器
     */
    static init() {
        // 检查登录状态
        if (!this.isLoggedIn()) {
            return false;
        }

        // 设置活动检测，用户活动时延长会话
        let activityTimer;
        const resetActivityTimer = () => {
            clearTimeout(activityTimer);
            activityTimer = setTimeout(() => {
                this.extendSession();
            }, 5 * 60 * 1000); // 5分钟无活动后延长会话
        };

        // 监听用户活动
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
            document.addEventListener(event, resetActivityTimer, true);
        });

        // 初始化活动计时器
        resetActivityTimer();

        // 定期检查会话有效性
        setInterval(() => {
            if (!this.isLoggedIn()) {
                alert('会话已过期，请重新登录');
                this.logout();
            }
        }, 10 * 60 * 1000); // 每10分钟检查一次

        return true;
    }
}

/**
 * 页面加载时自动检查认证状态
 */
document.addEventListener('DOMContentLoaded', function() {
    // 如果是登录页面，跳过认证检查
    if (window.location.pathname.includes('login.html')) {
        return;
    }

    // 检查认证状态
    if (!AdminAuth.requireAuth()) {
        return;
    }

    // 初始化认证模块
    AdminAuth.init();

    // 在页面上显示当前用户信息（如果有相应的元素）
    const userInfoElement = document.getElementById('currentUser');
    if (userInfoElement) {
        const user = AdminAuth.getCurrentUser();
        if (user) {
            userInfoElement.textContent = user.username;
        }
    }

    // 添加全局登出函数
    window.logout = function() {
        if (confirm('确定要退出登录吗？')) {
            AdminAuth.logout();
        }
    };
});

// 暴露到全局作用域
window.AdminAuth = AdminAuth;
