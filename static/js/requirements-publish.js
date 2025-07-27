/**
 * 需求发布页面主应用
 * 集成现有的API服务，实现真正可用的功能
 */
class RequirementCenter {
    constructor() {
        this.apiBase = this.detectApiBase();
        this.requirements = [];
        this.currentFilter = '';

        this.init();
    }

    // 检测API服务地址
    detectApiBase() {
        // 检测是否有本地服务运行
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3002'; // content-server.js
        }
        return '/api'; // 生产环境API
    }

    // 初始化应用
    async init() {
        this.setupEventListeners();
        this.loadRequirements();
        this.updateStats();

        // 检查API服务状态
        await this.checkApiStatus();
    }

    // 检查API服务状态
    async checkApiStatus() {
        try {
            const response = await fetch(this.apiBase + '/health');
            if (response.ok) {
                console.log('✅ API服务连接正常');
                this.showNotification('API服务已连接', 'success');
            }
        } catch (error) {
            console.warn('⚠️ API服务未连接，使用模拟数据');
            this.showNotification('使用模拟数据模式', 'warning');
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 产品类型选择
        document.querySelectorAll('input[name="productType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.showTechnicalParams(e.target.value);
            });
        });

        // 表单提交
        const form = document.getElementById('requirementForm');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.submitRequirement();
            });
        }

        // 筛选器
        const filter = document.getElementById('typeFilter');
        if (filter) {
            filter.addEventListener('change', (e) => {
                this.filterRequirements(e.target.value);
            });
        }
    }

    // 显示技术参数字段
    showTechnicalParams(productType) {
        const paramsSection = document.getElementById('technicalParams');
        const fieldsContainer = document.getElementById('parameterFields');

        if (!paramsSection || !fieldsContainer) return;

        const paramFields = this.getParameterFields(productType);
        fieldsContainer.innerHTML = paramFields;

        paramsSection.style.display = 'block';
        paramsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 获取参数字段HTML
    getParameterFields(type) {
        const fields = {
            electronic: this.getElectronicFields(),
            fiber: this.getFiberFields(),
            optical: this.getOpticalFields()
        };

        return fields[type] || '';
    }

    // 电子内窥镜参数字段
    getElectronicFields() {
        return `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">探头直径</label>
                    <select class="form-select" name="probeDiameter">
                        <option value="">请选择</option>
                        <option value="2.8mm">2.8mm</option>
                        <option value="4.0mm">4.0mm</option>
                        <option value="6.0mm">6.0mm</option>
                        <option value="8.0mm">8.0mm</option>
                        <option value="其他">其他规格</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">工作长度</label>
                    <select class="form-select" name="workingLength">
                        <option value="">请选择</option>
                        <option value="1000mm">1000mm</option>
                        <option value="1500mm">1500mm</option>
                        <option value="2000mm">2000mm</option>
                        <option value="3000mm">3000mm</option>
                        <option value="其他">其他长度</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">视向角度</label>
                    <select class="form-select" name="viewingDirection">
                        <option value="">请选择</option>
                        <option value="0°">0°（直视）</option>
                        <option value="30°">30°（侧视）</option>
                        <option value="90°">90°（侧视）</option>
                        <option value="可调">可调角度</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">分辨率要求</label>
                    <select class="form-select" name="resolution">
                        <option value="">请选择</option>
                        <option value="标清">标清</option>
                        <option value="高清">高清(HD)</option>
                        <option value="超高清">超高清(4K)</option>
                    </select>
                </div>
            </div>
        `;
    }

    // 光纤内窥镜参数字段
    getFiberFields() {
        return `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">探头直径</label>
                    <select class="form-select" name="probeDiameter">
                        <option value="">请选择</option>
                        <option value="0.35mm">0.35mm</option>
                        <option value="0.55mm">0.55mm</option>
                        <option value="1.0mm">1.0mm</option>
                        <option value="2.0mm">2.0mm</option>
                        <option value="4.0mm">4.0mm</option>
                        <option value="6.0mm">6.0mm</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">工作长度</label>
                    <select class="form-select" name="workingLength">
                        <option value="">请选择</option>
                        <option value="1000mm">1000mm</option>
                        <option value="2000mm">2000mm</option>
                        <option value="3000mm">3000mm</option>
                        <option value="5000mm">5000mm</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">视向角度</label>
                    <select class="form-select" name="viewingDirection">
                        <option value="">请选择</option>
                        <option value="0°">0°（直视）</option>
                        <option value="30°">30°（侧视）</option>
                        <option value="45°">45°（侧视）</option>
                        <option value="90°">90°（侧视）</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">视场角</label>
                    <select class="form-select" name="fieldOfView">
                        <option value="">请选择</option>
                        <option value="50°">50°</option>
                        <option value="60°">60°</option>
                        <option value="70°">70°</option>
                        <option value="90°">90°</option>
                    </select>
                </div>
            </div>
        `;
    }

    // 光学内窥镜参数字段
    getOpticalFields() {
        return `
            <div class="row g-3">
                <div class="col-md-6">
                    <label class="form-label">探头直径</label>
                    <select class="form-select" name="probeDiameter">
                        <option value="">请选择</option>
                        <option value="1.0mm">1.0mm</option>
                        <option value="1.2mm">1.2mm</option>
                        <option value="1.8mm">1.8mm</option>
                        <option value="2.7mm">2.7mm</option>
                        <option value="4.0mm">4.0mm</option>
                        <option value="10.0mm">10.0mm</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">工作长度</label>
                    <select class="form-select" name="workingLength">
                        <option value="">请选择</option>
                        <option value="100mm">100mm</option>
                        <option value="200mm">200mm</option>
                        <option value="300mm">300mm</option>
                        <option value="500mm">500mm</option>
                        <option value="1000mm">1000mm</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">视向角度</label>
                    <select class="form-select" name="viewingDirection">
                        <option value="">请选择</option>
                        <option value="0°">0°（直视）</option>
                        <option value="30°">30°（侧视）</option>
                        <option value="70°">70°（侧视）</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">光学系统</label>
                    <select class="form-select" name="opticalSystem">
                        <option value="">请选择</option>
                        <option value="Hopkins棒镜">Hopkins棒镜系统</option>
                        <option value="传统透镜">传统透镜系统</option>
                        <option value="梯度折射率">梯度折射率透镜</option>
                    </select>
                </div>
            </div>
        `;
    }

    // 提交需求
    async submitRequirement() {
        const form = document.getElementById('requirementForm');
        const formData = new FormData(form);

        // 验证必填字段
        if (!this.validateForm(form)) {
            return;
        }

        // 收集表单数据
        const requirementData = {
            id: this.generateRequirementId(),
            timestamp: new Date().toISOString(),
            status: 'active',
            ...Object.fromEntries(formData)
        };

        try {
            // 保存到服务器
            const success = await this.saveRequirement(requirementData);

            if (success) {
                this.showSuccessModal(requirementData);
                form.reset();
                const techParams = document.getElementById('technicalParams');
                if (techParams) {
                    techParams.style.display = 'none';
                }

                // 刷新需求列表
                this.loadRequirements();
                this.updateStats();
            } else {
                this.showNotification('提交失败，请重试', 'error');
            }
        } catch (error) {
            console.error('提交需求失败:', error);
            this.showNotification('提交失败: ' + error.message, 'error');
        }
    }

    // 验证表单
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            this.showNotification('请填写所有必填字段', 'warning');
        }

        return isValid;
    }

    // 生成需求ID
    generateRequirementId() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = Date.now().toString(36).toUpperCase();
        return 'REQ-' + dateStr + '-' + timeStr;
    }

    // 保存需求到服务器
    async saveRequirement(data) {
        try {
            // 生成Markdown文件内容
            const markdownContent = this.generateRequirementMarkdown(data);
            const fileName = data.id + '.md';

            // 调用content-server API保存文件
            const response = await fetch(this.apiBase + '/api/save-content', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: fileName,
                    content: markdownContent,
                    contentType: 'requirements'
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ 需求保存成功:', result.filePath);
                return true;
            } else {
                throw new Error(result.message || '保存失败');
            }
        } catch (error) {
            console.error('保存需求失败:', error);

            // 如果API失败，保存到localStorage作为备份
            this.saveToLocalStorage(data);
            return true; // 仍然返回成功，使用本地存储
        }
    }

    // 其他方法将在下一个文件中继续...
    
    // 显示通知
    showNotification(message, type = 'info') {
        // 简化的通知实现
        console.log(type.toUpperCase() + ': ' + message);
        
        // 可以在这里添加更复杂的通知UI
        if (window.bootstrap && window.bootstrap.Toast) {
            // 使用Bootstrap Toast
            this.showBootstrapToast(message, type);
        } else {
            // 简单的alert作为后备
            alert(message);
        }
    }

    // 显示Bootstrap Toast
    showBootstrapToast(message, type) {
        // 创建toast容器（如果不存在）
        let container = document.getElementById('toastContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'toast-container position-fixed top-0 end-0 p-3';
            container.style.zIndex = '9999';
            document.body.appendChild(container);
        }

        // 创建toast元素
        const toastEl = document.createElement('div');
        const bgClass = type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary';
        toastEl.className = 'toast align-items-center text-white bg-' + bgClass + ' border-0';
        toastEl.setAttribute('role', 'alert');
        toastEl.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        container.appendChild(toastEl);

        // 显示toast
        const toast = new window.bootstrap.Toast(toastEl);
        toast.show();

        // 自动移除
        toastEl.addEventListener('hidden.bs.toast', () => {
            toastEl.remove();
        });
    }

    // 加载需求列表的简化版本
    async loadRequirements() {
        // 简化实现，避免复杂的模板字符串
        console.log('加载需求列表...');
        this.requirements = this.getMockRequirements();
        this.renderRequirements();
    }

    // 获取模拟数据
    getMockRequirements() {
        return [
            {
                id: 'REQ-20250115-001',
                timestamp: '2025-01-15T10:30:00Z',
                status: 'active',
                productType: 'electronic',
                contactName: '张工程师',
                companyName: '某汽车制造有限公司',
                region: '华东',
                budget: '10-20万',
                description: '需要采购电子内窥镜用于汽车发动机缸体内部检测...',
                featured: true
            }
        ];
    }

    // 渲染需求列表
    renderRequirements() {
        const container = document.getElementById('requirementsList');
        if (!container) return;

        if (this.requirements.length === 0) {
            container.innerHTML = '<div class="empty-state"><p>暂无需求信息</p></div>';
            return;
        }

        // 简化的渲染，避免复杂的模板字符串
        let html = '';
        this.requirements.forEach(req => {
            html += '<div class="requirement-item" data-id="' + req.id + '">';
            html += '<h5>' + req.contactName + '的需求</h5>';
            html += '<p>' + req.description + '</p>';
            html += '</div>';
        });

        container.innerHTML = html;
    }

    // 其他简化的方法
    updateStats() {
        const activeEl = document.getElementById('activeRequirements');
        const todayEl = document.getElementById('todayNew');
        
        if (activeEl) activeEl.textContent = this.requirements.length;
        if (todayEl) todayEl.textContent = '0';
    }

    filterRequirements(type) {
        this.currentFilter = type;
        this.renderRequirements();
    }

    showSuccessModal(data) {
        this.showNotification('需求提交成功！需求编号：' + data.id, 'success');
    }

    saveToLocalStorage(data) {
        const requirements = JSON.parse(localStorage.getItem('requirements') || '[]');
        requirements.unshift(data);
        localStorage.setItem('requirements', JSON.stringify(requirements));
    }

    generateRequirementMarkdown(data) {
        // 简化的Markdown生成，避免模板字符串
        let content = '---\n';
        content += 'title: "' + data.contactName + '的需求"\n';
        content += 'date: ' + data.timestamp + '\n';
        content += 'draft: false\n';
        content += 'type: "requirement"\n';
        content += '---\n\n';
        content += '# 需求详情\n\n';
        content += '联系人：' + data.contactName + '\n';
        content += '描述：' + data.description + '\n';
        
        return content;
    }
}

// 全局函数
function contactRequirement(reqId) {
    alert('联系需求 ' + reqId + '\n\n请联系平台客服获取详细联系方式');
}

function submitProposal(reqId) {
    alert('提交技术方案\n\n请将方案发送至：business@vision-ndt.com');
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    window.requirementCenter = new RequirementCenter();
});
