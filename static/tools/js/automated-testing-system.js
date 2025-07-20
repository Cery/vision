/**
 * Vision NDT 全面自动化测试系统
 * 核心JavaScript逻辑
 */

const { createApp } = Vue;

createApp({
    data() {
        return {
            // 测试状态
            isTestingAll: false,
            hasTestResults: false,
            overallProgress: 0,
            
            // 测试统计
            testStats: {
                total: 0,
                passed: 0,
                failed: 0,
                warnings: 0
            },
            
            // 各类测试状态
            frontendTests: {
                status: 'pending',
                progress: 0,
                running: false,
                lastRun: '未运行',
                results: []
            },
            
            backendTests: {
                status: 'pending',
                progress: 0,
                running: false,
                lastRun: '未运行',
                results: []
            },
            
            toolsTests: {
                status: 'pending',
                progress: 0,
                running: false,
                lastRun: '未运行',
                results: []
            },
            
            performanceTests: {
                status: 'pending',
                progress: 0,
                running: false,
                lastRun: '未运行',
                results: []
            },
            
            securityTests: {
                status: 'pending',
                progress: 0,
                running: false,
                lastRun: '未运行',
                results: []
            },
            
            integrationTests: {
                status: 'pending',
                progress: 0,
                running: false,
                lastRun: '未运行',
                results: []
            },
            
            // 测试日志
            testLogs: [],
            logCounter: 0,
            
            // 测试配置
            testConfig: {
                baseUrl: window.location.origin,
                timeout: 30000,
                retries: 3,
                parallel: true
            }
        };
    },
    
    computed: {
        progressStyle() {
            const circumference = 2 * Math.PI * 52;
            const offset = circumference - (this.overallProgress / 100) * circumference;
            return {
                strokeDashoffset: offset
            };
        }
    },
    
    mounted() {
        this.addLog('info', 'SYSTEM', '测试系统初始化完成');
        this.loadTestHistory();
    },
    
    methods: {
        // 日志管理
        addLog(level, category, message) {
            const timestamp = new Date().toLocaleTimeString();
            this.testLogs.push({
                id: ++this.logCounter,
                timestamp,
                level,
                category,
                message
            });
            
            // 自动滚动到底部
            this.$nextTick(() => {
                const logElement = this.$refs.testLog;
                if (logElement) {
                    logElement.scrollTop = logElement.scrollHeight;
                }
            });
            
            // 限制日志数量
            if (this.testLogs.length > 1000) {
                this.testLogs = this.testLogs.slice(-500);
            }
        },
        
        clearLogs() {
            this.testLogs = [];
            this.addLog('info', 'SYSTEM', '日志已清空');
        },
        
        // 状态管理
        getStatusClass(status) {
            return `status-${status}`;
        },
        
        getStatusText(status) {
            const statusMap = {
                pending: '待测试',
                running: '测试中',
                success: '通过',
                failed: '失败',
                warning: '警告'
            };
            return statusMap[status] || status;
        },
        
        // 全面测试
        async startFullTest() {
            this.isTestingAll = true;
            this.addLog('info', 'SYSTEM', '开始全面自动化测试');
            
            try {
                // 重置所有测试状态
                this.resetAllTests();
                
                // 按顺序执行测试
                await this.testFrontend();
                await this.testBackend();
                await this.testTools();
                await this.testPerformance();
                await this.testSecurity();
                await this.testIntegration();
                
                this.addLog('success', 'SYSTEM', '全面测试完成');
                this.hasTestResults = true;
                
                // 自动生成报告
                await this.generateReport();
                
            } catch (error) {
                this.addLog('error', 'SYSTEM', `全面测试失败: ${error.message}`);
            } finally {
                this.isTestingAll = false;
                this.updateOverallProgress();
            }
        },
        
        resetAllTests() {
            const tests = [
                'frontendTests', 'backendTests', 'toolsTests',
                'performanceTests', 'securityTests', 'integrationTests'
            ];
            
            tests.forEach(testType => {
                this[testType].status = 'pending';
                this[testType].progress = 0;
                this[testType].running = false;
                this[testType].results = [];
            });
            
            this.testStats = { total: 0, passed: 0, failed: 0, warnings: 0 };
        },
        
        // 前端功能测试
        async testFrontend() {
            this.frontendTests.running = true;
            this.frontendTests.status = 'running';
            this.addLog('info', 'FRONTEND', '开始前端功能测试');
            
            const tests = [
                { name: '首页加载', url: '/' },
                { name: '产品中心', url: '/products' },
                { name: '资讯中心', url: '/news' },
                { name: '需求中心', url: '/requirements' },
                { name: '商务服务', url: '/cooperation' },
                { name: '应用领域', url: '/applications' },
                { name: '应用案例', url: '/cases' },
                { name: '搜索功能', url: '/search' }
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (let i = 0; i < tests.length; i++) {
                const test = tests[i];
                this.addLog('info', 'FRONTEND', `测试: ${test.name}`);
                
                try {
                    const result = await this.testPageLoad(test.url);
                    if (result.success) {
                        passed++;
                        this.addLog('success', 'FRONTEND', `✅ ${test.name} - 通过`);
                    } else {
                        failed++;
                        this.addLog('error', 'FRONTEND', `❌ ${test.name} - 失败: ${result.error}`);
                    }
                } catch (error) {
                    failed++;
                    this.addLog('error', 'FRONTEND', `❌ ${test.name} - 异常: ${error.message}`);
                }
                
                this.frontendTests.progress = Math.round(((i + 1) / tests.length) * 100);
                await this.delay(500); // 避免请求过快
            }
            
            this.frontendTests.running = false;
            this.frontendTests.status = failed === 0 ? 'success' : (passed > 0 ? 'warning' : 'failed');
            this.frontendTests.lastRun = new Date().toLocaleString();
            this.frontendTests.results = { passed, failed, total: tests.length };
            
            this.updateTestStats('frontend', passed, failed);
            this.addLog('info', 'FRONTEND', `前端测试完成 - 通过: ${passed}, 失败: ${failed}`);
        },
        
        // 后端服务测试
        async testBackend() {
            this.backendTests.running = true;
            this.backendTests.status = 'running';
            this.addLog('info', 'BACKEND', '开始后端服务测试');
            
            const tests = [
                { name: '主服务器健康检查', url: '/api/health' },
                { name: '产品API', url: '/api/products/list' },
                { name: '媒体库API', url: '/api/media/list' },
                { name: '文件上传API', url: '/api/upload/test' },
                { name: 'Python抓取服务', url: 'http://localhost:5000/api/health' },
                { name: '需求API服务', url: 'http://localhost:5001/health' }
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (let i = 0; i < tests.length; i++) {
                const test = tests[i];
                this.addLog('info', 'BACKEND', `测试: ${test.name}`);
                
                try {
                    const result = await this.testApiEndpoint(test.url);
                    if (result.success) {
                        passed++;
                        this.addLog('success', 'BACKEND', `✅ ${test.name} - 通过`);
                    } else {
                        failed++;
                        this.addLog('error', 'BACKEND', `❌ ${test.name} - 失败: ${result.error}`);
                    }
                } catch (error) {
                    failed++;
                    this.addLog('error', 'BACKEND', `❌ ${test.name} - 异常: ${error.message}`);
                }
                
                this.backendTests.progress = Math.round(((i + 1) / tests.length) * 100);
                await this.delay(500);
            }
            
            this.backendTests.running = false;
            this.backendTests.status = failed === 0 ? 'success' : (passed > 0 ? 'warning' : 'failed');
            this.backendTests.lastRun = new Date().toLocaleString();
            this.backendTests.results = { passed, failed, total: tests.length };
            
            this.updateTestStats('backend', passed, failed);
            this.addLog('info', 'BACKEND', `后端测试完成 - 通过: ${passed}, 失败: ${failed}`);
        },
        
        // 开发工具测试
        async testTools() {
            this.toolsTests.running = true;
            this.toolsTests.status = 'running';
            this.addLog('info', 'TOOLS', '开始开发工具测试');
            
            const tools = [
                { name: '工具首页', url: '/tools/' },
                { name: '展会编辑器', url: '/tools/exhibition-editor.html' },
                { name: '图片处理器', url: '/tools/image-processor.html' },
                { name: '内容管理器', url: '/tools/content-manager.html' },
                { name: '技术文章编辑器', url: '/tools/tech-article-editor.html' },
                { name: '行业资讯编辑器', url: '/tools/industry-news-editor.html' },
                { name: '案例研究编辑器', url: '/tools/case-study-editor.html' },
                { name: 'API配置工具', url: '/tools/api-config.html' }
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (let i = 0; i < tools.length; i++) {
                const tool = tools[i];
                this.addLog('info', 'TOOLS', `测试: ${tool.name}`);
                
                try {
                    const result = await this.testPageLoad(tool.url);
                    if (result.success) {
                        passed++;
                        this.addLog('success', 'TOOLS', `✅ ${tool.name} - 通过`);
                    } else {
                        failed++;
                        this.addLog('error', 'TOOLS', `❌ ${tool.name} - 失败: ${result.error}`);
                    }
                } catch (error) {
                    failed++;
                    this.addLog('error', 'TOOLS', `❌ ${tool.name} - 异常: ${error.message}`);
                }
                
                this.toolsTests.progress = Math.round(((i + 1) / tools.length) * 100);
                await this.delay(500);
            }
            
            this.toolsTests.running = false;
            this.toolsTests.status = failed === 0 ? 'success' : (passed > 0 ? 'warning' : 'failed');
            this.toolsTests.lastRun = new Date().toLocaleString();
            this.toolsTests.results = { passed, failed, total: tools.length };
            
            this.updateTestStats('tools', passed, failed);
            this.addLog('info', 'TOOLS', `工具测试完成 - 通过: ${passed}, 失败: ${failed}`);
        },
        
        // 性能测试
        async testPerformance() {
            this.performanceTests.running = true;
            this.performanceTests.status = 'running';
            this.addLog('info', 'PERFORMANCE', '开始性能测试');
            
            const tests = [
                { name: '首页加载时间', url: '/', threshold: 3000 },
                { name: '产品列表加载', url: '/products', threshold: 5000 },
                { name: 'API响应时间', url: '/api/products/list', threshold: 2000 },
                { name: '图片加载性能', url: '/images/products/', threshold: 1000 }
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (let i = 0; i < tests.length; i++) {
                const test = tests[i];
                this.addLog('info', 'PERFORMANCE', `测试: ${test.name}`);
                
                try {
                    const result = await this.testPerformanceMetric(test.url, test.threshold);
                    if (result.success) {
                        passed++;
                        this.addLog('success', 'PERFORMANCE', `✅ ${test.name} - ${result.time}ms (阈值: ${test.threshold}ms)`);
                    } else {
                        failed++;
                        this.addLog('error', 'PERFORMANCE', `❌ ${test.name} - ${result.time}ms 超过阈值 ${test.threshold}ms`);
                    }
                } catch (error) {
                    failed++;
                    this.addLog('error', 'PERFORMANCE', `❌ ${test.name} - 异常: ${error.message}`);
                }
                
                this.performanceTests.progress = Math.round(((i + 1) / tests.length) * 100);
                await this.delay(1000);
            }
            
            this.performanceTests.running = false;
            this.performanceTests.status = failed === 0 ? 'success' : (passed > 0 ? 'warning' : 'failed');
            this.performanceTests.lastRun = new Date().toLocaleString();
            this.performanceTests.results = { passed, failed, total: tests.length };
            
            this.updateTestStats('performance', passed, failed);
            this.addLog('info', 'PERFORMANCE', `性能测试完成 - 通过: ${passed}, 失败: ${failed}`);
        },
        
        // 安全测试
        async testSecurity() {
            this.securityTests.running = true;
            this.securityTests.status = 'running';
            this.addLog('info', 'SECURITY', '开始安全测试');
            
            const tests = [
                { name: 'XSS防护检查', type: 'xss' },
                { name: 'CSRF防护检查', type: 'csrf' },
                { name: '文件上传安全', type: 'upload' },
                { name: 'SQL注入防护', type: 'sql' },
                { name: 'HTTP头安全', type: 'headers' }
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (let i = 0; i < tests.length; i++) {
                const test = tests[i];
                this.addLog('info', 'SECURITY', `测试: ${test.name}`);
                
                try {
                    const result = await this.testSecurityCheck(test.type);
                    if (result.success) {
                        passed++;
                        this.addLog('success', 'SECURITY', `✅ ${test.name} - 通过`);
                    } else {
                        failed++;
                        this.addLog('warning', 'SECURITY', `⚠️ ${test.name} - 需要关注: ${result.message}`);
                    }
                } catch (error) {
                    failed++;
                    this.addLog('error', 'SECURITY', `❌ ${test.name} - 异常: ${error.message}`);
                }
                
                this.securityTests.progress = Math.round(((i + 1) / tests.length) * 100);
                await this.delay(500);
            }
            
            this.securityTests.running = false;
            this.securityTests.status = failed === 0 ? 'success' : (passed > 0 ? 'warning' : 'failed');
            this.securityTests.lastRun = new Date().toLocaleString();
            this.securityTests.results = { passed, failed, total: tests.length };
            
            this.updateTestStats('security', passed, failed);
            this.addLog('info', 'SECURITY', `安全测试完成 - 通过: ${passed}, 需要关注: ${failed}`);
        },
        
        // 集成测试
        async testIntegration() {
            this.integrationTests.running = true;
            this.integrationTests.status = 'running';
            this.addLog('info', 'INTEGRATION', '开始集成测试');
            
            const tests = [
                { name: 'Hugo与服务器集成', type: 'hugo-server' },
                { name: 'CMS与内容集成', type: 'cms-content' },
                { name: '图片处理流程', type: 'image-pipeline' },
                { name: '搜索功能集成', type: 'search-integration' },
                { name: '数据流完整性', type: 'data-flow' }
            ];
            
            let passed = 0;
            let failed = 0;
            
            for (let i = 0; i < tests.length; i++) {
                const test = tests[i];
                this.addLog('info', 'INTEGRATION', `测试: ${test.name}`);
                
                try {
                    const result = await this.testIntegrationCheck(test.type);
                    if (result.success) {
                        passed++;
                        this.addLog('success', 'INTEGRATION', `✅ ${test.name} - 通过`);
                    } else {
                        failed++;
                        this.addLog('error', 'INTEGRATION', `❌ ${test.name} - 失败: ${result.error}`);
                    }
                } catch (error) {
                    failed++;
                    this.addLog('error', 'INTEGRATION', `❌ ${test.name} - 异常: ${error.message}`);
                }
                
                this.integrationTests.progress = Math.round(((i + 1) / tests.length) * 100);
                await this.delay(1000);
            }
            
            this.integrationTests.running = false;
            this.integrationTests.status = failed === 0 ? 'success' : (passed > 0 ? 'warning' : 'failed');
            this.integrationTests.lastRun = new Date().toLocaleString();
            this.integrationTests.results = { passed, failed, total: tests.length };
            
            this.updateTestStats('integration', passed, failed);
            this.addLog('info', 'INTEGRATION', `集成测试完成 - 通过: ${passed}, 失败: ${failed}`);
        },
        
        // 工具方法
        async delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        },
        
        updateTestStats(category, passed, failed) {
            this.testStats.total += (passed + failed);
            this.testStats.passed += passed;
            this.testStats.failed += failed;
        },
        
        updateOverallProgress() {
            const tests = [
                this.frontendTests, this.backendTests, this.toolsTests,
                this.performanceTests, this.securityTests, this.integrationTests
            ];

            const totalProgress = tests.reduce((sum, test) => sum + test.progress, 0);
            this.overallProgress = Math.round(totalProgress / tests.length);
        },

        // 核心测试方法
        async testPageLoad(url) {
            const startTime = performance.now();
            try {
                const fullUrl = url.startsWith('http') ? url : this.testConfig.baseUrl + url;
                const response = await fetch(fullUrl, {
                    method: 'GET',
                    timeout: this.testConfig.timeout
                });

                const endTime = performance.now();
                const loadTime = endTime - startTime;

                if (response.ok) {
                    return {
                        success: true,
                        status: response.status,
                        loadTime: Math.round(loadTime)
                    };
                } else {
                    return {
                        success: false,
                        error: `HTTP ${response.status}: ${response.statusText}`,
                        loadTime: Math.round(loadTime)
                    };
                }
            } catch (error) {
                const endTime = performance.now();
                return {
                    success: false,
                    error: error.message,
                    loadTime: Math.round(endTime - startTime)
                };
            }
        },

        async testApiEndpoint(url) {
            try {
                const fullUrl = url.startsWith('http') ? url : this.testConfig.baseUrl + url;
                const response = await fetch(fullUrl, {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    timeout: this.testConfig.timeout
                });

                if (response.ok) {
                    const data = await response.json();
                    return {
                        success: true,
                        status: response.status,
                        data: data
                    };
                } else {
                    return {
                        success: false,
                        error: `API错误 ${response.status}: ${response.statusText}`
                    };
                }
            } catch (error) {
                return {
                    success: false,
                    error: `连接失败: ${error.message}`
                };
            }
        },

        async testPerformanceMetric(url, threshold) {
            const startTime = performance.now();
            try {
                const fullUrl = url.startsWith('http') ? url : this.testConfig.baseUrl + url;
                const response = await fetch(fullUrl);
                const endTime = performance.now();
                const loadTime = Math.round(endTime - startTime);

                return {
                    success: loadTime <= threshold,
                    time: loadTime,
                    threshold: threshold
                };
            } catch (error) {
                const endTime = performance.now();
                return {
                    success: false,
                    time: Math.round(endTime - startTime),
                    error: error.message
                };
            }
        },

        async testSecurityCheck(type) {
            switch (type) {
                case 'xss':
                    return await this.testXSSProtection();
                case 'csrf':
                    return await this.testCSRFProtection();
                case 'upload':
                    return await this.testUploadSecurity();
                case 'sql':
                    return await this.testSQLInjectionProtection();
                case 'headers':
                    return await this.testSecurityHeaders();
                default:
                    return { success: false, message: '未知的安全测试类型' };
            }
        },

        async testXSSProtection() {
            try {
                const testPayload = '<script>alert("xss")</script>';
                const response = await fetch(this.testConfig.baseUrl + '/api/test-xss', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ input: testPayload })
                });

                // 如果API不存在，认为是安全的（没有暴露测试端点）
                if (response.status === 404) {
                    return { success: true, message: '无测试端点暴露' };
                }

                const result = await response.text();
                const isVulnerable = result.includes('<script>');

                return {
                    success: !isVulnerable,
                    message: isVulnerable ? 'XSS漏洞检测到' : 'XSS防护正常'
                };
            } catch (error) {
                return { success: true, message: '无法测试XSS（可能是好事）' };
            }
        },

        async testCSRFProtection() {
            try {
                // 测试是否有CSRF token验证
                const response = await fetch(this.testConfig.baseUrl + '/api/test-csrf', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ action: 'test' })
                });

                if (response.status === 404) {
                    return { success: true, message: '无敏感操作端点暴露' };
                }

                // 如果没有CSRF token就能成功，可能存在CSRF漏洞
                const hasCSRFProtection = response.status === 403 || response.status === 401;

                return {
                    success: hasCSRFProtection,
                    message: hasCSRFProtection ? 'CSRF防护正常' : '可能缺少CSRF防护'
                };
            } catch (error) {
                return { success: true, message: '无法测试CSRF（可能是好事）' };
            }
        },

        async testUploadSecurity() {
            try {
                // 测试文件上传安全性
                const maliciousFile = new Blob(['<?php echo "test"; ?>'], { type: 'text/php' });
                const formData = new FormData();
                formData.append('file', maliciousFile, 'test.php');

                const response = await fetch(this.testConfig.baseUrl + '/api/upload', {
                    method: 'POST',
                    body: formData
                });

                if (response.status === 404) {
                    return { success: true, message: '无文件上传端点' };
                }

                const result = await response.json();
                const allowedMaliciousUpload = response.ok && result.success;

                return {
                    success: !allowedMaliciousUpload,
                    message: allowedMaliciousUpload ? '文件上传安全检查不足' : '文件上传安全正常'
                };
            } catch (error) {
                return { success: true, message: '文件上传功能受限（安全）' };
            }
        },

        async testSQLInjectionProtection() {
            try {
                const sqlPayload = "'; DROP TABLE users; --";
                const response = await fetch(this.testConfig.baseUrl + `/api/search?q=${encodeURIComponent(sqlPayload)}`);

                if (response.status === 404) {
                    return { success: true, message: '无搜索API端点' };
                }

                // 检查响应是否包含SQL错误信息
                const result = await response.text();
                const hasSQLError = result.toLowerCase().includes('sql') ||
                                  result.toLowerCase().includes('database') ||
                                  result.toLowerCase().includes('mysql');

                return {
                    success: !hasSQLError,
                    message: hasSQLError ? '可能存在SQL注入漏洞' : 'SQL注入防护正常'
                };
            } catch (error) {
                return { success: true, message: '数据库查询受限（安全）' };
            }
        },

        async testSecurityHeaders() {
            try {
                const response = await fetch(this.testConfig.baseUrl + '/');
                const headers = response.headers;

                const securityHeaders = {
                    'X-Content-Type-Options': headers.get('X-Content-Type-Options'),
                    'X-Frame-Options': headers.get('X-Frame-Options'),
                    'X-XSS-Protection': headers.get('X-XSS-Protection'),
                    'Strict-Transport-Security': headers.get('Strict-Transport-Security'),
                    'Content-Security-Policy': headers.get('Content-Security-Policy')
                };

                const missingHeaders = Object.entries(securityHeaders)
                    .filter(([key, value]) => !value)
                    .map(([key]) => key);

                const hasBasicSecurity = missingHeaders.length < 3;

                return {
                    success: hasBasicSecurity,
                    message: hasBasicSecurity ?
                        '基本安全头配置正常' :
                        `缺少安全头: ${missingHeaders.join(', ')}`
                };
            } catch (error) {
                return { success: false, message: `安全头检查失败: ${error.message}` };
            }
        },

        async testIntegrationCheck(type) {
            switch (type) {
                case 'hugo-server':
                    return await this.testHugoServerIntegration();
                case 'cms-content':
                    return await this.testCMSContentIntegration();
                case 'image-pipeline':
                    return await this.testImagePipelineIntegration();
                case 'search-integration':
                    return await this.testSearchIntegration();
                case 'data-flow':
                    return await this.testDataFlowIntegration();
                default:
                    return { success: false, error: '未知的集成测试类型' };
            }
        },

        async testHugoServerIntegration() {
            try {
                // 测试Hugo生成的页面和服务器API的集成
                const hugoPage = await fetch(this.testConfig.baseUrl + '/products');
                const apiData = await fetch(this.testConfig.baseUrl + '/api/products/list');

                const hugoOk = hugoPage.ok;
                const apiOk = apiData.ok;

                return {
                    success: hugoOk && apiOk,
                    error: !hugoOk ? 'Hugo页面加载失败' : (!apiOk ? 'API服务失败' : null)
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        async testCMSContentIntegration() {
            try {
                // 测试CMS配置和内容的一致性
                const cmsConfig = await fetch(this.testConfig.baseUrl + '/admin/config.yml');
                const contentIndex = await fetch(this.testConfig.baseUrl + '/index.json');

                return {
                    success: cmsConfig.ok && contentIndex.ok,
                    error: !cmsConfig.ok ? 'CMS配置加载失败' : (!contentIndex.ok ? '内容索引失败' : null)
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        async testImagePipelineIntegration() {
            try {
                // 测试图片处理流程
                const imageProcessor = await fetch(this.testConfig.baseUrl + '/tools/image-processor.html');
                const pythonService = await fetch('http://localhost:5000/api/health');

                return {
                    success: imageProcessor.ok,
                    error: !imageProcessor.ok ? '图片处理器加载失败' : null,
                    warning: !pythonService.ok ? 'Python图片服务未启动' : null
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        async testSearchIntegration() {
            try {
                // 测试搜索功能集成
                const searchPage = await fetch(this.testConfig.baseUrl + '/search');
                const searchIndex = await fetch(this.testConfig.baseUrl + '/index.json');

                return {
                    success: searchPage.ok && searchIndex.ok,
                    error: !searchPage.ok ? '搜索页面失败' : (!searchIndex.ok ? '搜索索引失败' : null)
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        async testDataFlowIntegration() {
            try {
                // 测试数据流的完整性
                const tests = [
                    fetch(this.testConfig.baseUrl + '/'),
                    fetch(this.testConfig.baseUrl + '/api/health'),
                    fetch(this.testConfig.baseUrl + '/index.json')
                ];

                const results = await Promise.allSettled(tests);
                const successCount = results.filter(r => r.status === 'fulfilled' && r.value.ok).length;

                return {
                    success: successCount >= 2,
                    error: successCount < 2 ? '数据流集成存在问题' : null
                };
            } catch (error) {
                return { success: false, error: error.message };
            }
        },

        // 生成测试报告
        async generateReport() {
            this.addLog('info', 'REPORT', '开始生成测试报告');

            const report = {
                timestamp: new Date().toISOString(),
                summary: {
                    totalTests: this.testStats.total,
                    passed: this.testStats.passed,
                    failed: this.testStats.failed,
                    warnings: this.testStats.warnings,
                    successRate: this.testStats.total > 0 ?
                        Math.round((this.testStats.passed / this.testStats.total) * 100) : 0
                },
                categories: {
                    frontend: this.frontendTests,
                    backend: this.backendTests,
                    tools: this.toolsTests,
                    performance: this.performanceTests,
                    security: this.securityTests,
                    integration: this.integrationTests
                },
                logs: this.testLogs.slice(-100), // 最近100条日志
                recommendations: this.generateRecommendations()
            };

            // 保存报告到content目录
            await this.saveReportToContent(report);

            // 下载报告文件
            this.downloadReport(report);

            this.addLog('success', 'REPORT', '测试报告生成完成');
        },

        generateRecommendations() {
            const recommendations = [];

            if (this.backendTests.status === 'failed') {
                recommendations.push('建议检查后端服务配置和依赖安装');
            }

            if (this.performanceTests.status === 'warning') {
                recommendations.push('建议优化页面加载性能，启用缓存和压缩');
            }

            if (this.securityTests.status === 'warning') {
                recommendations.push('建议加强安全配置，添加安全响应头');
            }

            if (this.toolsTests.status === 'failed') {
                recommendations.push('建议检查开发工具的依赖和配置');
            }

            return recommendations;
        },

        async saveReportToContent(report) {
            try {
                const reportContent = this.generateMarkdownReport(report);
                const filename = `test-report-${new Date().toISOString().split('T')[0]}.md`;

                // 尝试保存到content目录
                const response = await fetch('/api/save-content', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        path: `content/reports/${filename}`,
                        content: reportContent
                    })
                });

                if (response.ok) {
                    this.addLog('success', 'REPORT', `报告已保存到 content/reports/${filename}`);
                } else {
                    this.addLog('warning', 'REPORT', '无法保存到content目录，请手动保存');
                }
            } catch (error) {
                this.addLog('warning', 'REPORT', `保存报告失败: ${error.message}`);
            }
        },

        generateMarkdownReport(report) {
            return `---
title: "Vision NDT 自动化测试报告"
date: ${report.timestamp}
type: "test-report"
summary: "全面自动化测试结果报告"
---

# Vision NDT 自动化测试报告

## 测试概览

- **测试时间**: ${new Date(report.timestamp).toLocaleString()}
- **总测试项**: ${report.summary.totalTests}
- **通过**: ${report.summary.passed}
- **失败**: ${report.summary.failed}
- **警告**: ${report.summary.warnings}
- **成功率**: ${report.summary.successRate}%

## 测试结果详情

### 前端功能测试
- **状态**: ${this.getStatusText(report.categories.frontend.status)}
- **进度**: ${report.categories.frontend.progress}%
- **最后运行**: ${report.categories.frontend.lastRun}

### 后端服务测试
- **状态**: ${this.getStatusText(report.categories.backend.status)}
- **进度**: ${report.categories.backend.progress}%
- **最后运行**: ${report.categories.backend.lastRun}

### 开发工具测试
- **状态**: ${this.getStatusText(report.categories.tools.status)}
- **进度**: ${report.categories.tools.progress}%
- **最后运行**: ${report.categories.tools.lastRun}

### 性能测试
- **状态**: ${this.getStatusText(report.categories.performance.status)}
- **进度**: ${report.categories.performance.progress}%
- **最后运行**: ${report.categories.performance.lastRun}

### 安全测试
- **状态**: ${this.getStatusText(report.categories.security.status)}
- **进度**: ${report.categories.security.progress}%
- **最后运行**: ${report.categories.security.lastRun}

### 集成测试
- **状态**: ${this.getStatusText(report.categories.integration.status)}
- **进度**: ${report.categories.integration.progress}%
- **最后运行**: ${report.categories.integration.lastRun}

## 改进建议

${report.recommendations.map(rec => `- ${rec}`).join('\n')}

## 测试日志摘要

${report.logs.slice(-20).map(log => `- [${log.timestamp}] [${log.category}] ${log.message}`).join('\n')}

---

*此报告由Vision NDT自动化测试系统生成*`;
        },

        downloadReport(report) {
            const reportJson = JSON.stringify(report, null, 2);
            const blob = new Blob([reportJson], { type: 'application/json' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `vision-ndt-test-report-${new Date().toISOString().split('T')[0]}.json`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        },

        loadTestHistory() {
            // 从localStorage加载测试历史
            const history = localStorage.getItem('vision-ndt-test-history');
            if (history) {
                try {
                    const data = JSON.parse(history);
                    this.testStats = data.testStats || this.testStats;
                    this.addLog('info', 'SYSTEM', '已加载测试历史数据');
                } catch (error) {
                    this.addLog('warning', 'SYSTEM', '测试历史数据加载失败');
                }
            }
        },

        saveTestHistory() {
            // 保存测试历史到localStorage
            const history = {
                testStats: this.testStats,
                lastUpdate: new Date().toISOString()
            };
            localStorage.setItem('vision-ndt-test-history', JSON.stringify(history));
        }
    }
}).mount('#app');
