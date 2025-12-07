/**
 * 需求中心主应用
 * 基于三种内窥镜产品的具体参数
 */
class RequirementCenter {
    constructor() {
        this.apiBase = this.detectApiBase();
        this.requirements = [];
        this.currentFilter = '';
        this.apiAvailable = false; // API服务可用性标志
        
        this.init();
    }
    
    // 检测API服务地址（优先使用全局 API_BASE，其次使用相对路径）
    detectApiBase() {
        if (typeof window !== 'undefined' && window.API_BASE) {
            return String(window.API_BASE).replace(/\/$/, '');
        }
        return '';
    }
    
    // 初始化应用
    async init() {
        this.setupEventListeners();
        await this.loadRequirements();
        this.updateStats();
        
        // 检查API服务状态
        await this.checkApiStatus();
    }
    
    // 检查API服务状态
    async checkApiStatus() {
        try {
            const response = await fetch(`${this.apiBase}/api/markets`, { method: 'GET' });
            if (response.ok) {
                console.log('✅ API服务连接正常');
                this.apiAvailable = true;
                return;
            }
        } catch (error) {
            console.warn('⚠️ API服务未连接');
        }
        this.apiAvailable = false;
    }
    
    // 显示通知
    showNotification(message, type = 'info') {
        // 创建简单的通知
        const notification = document.createElement('div');
        notification.className = `alert alert-${type} position-fixed`;
        notification.style.cssText = `
            top: 20px; 
            right: 20px; 
            z-index: 9999; 
            min-width: 300px;
            opacity: 0;
            transition: opacity 0.3s ease;
        `;
        notification.innerHTML = `
            <div class="d-flex align-items-center">
                <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'} me-2"></i>
                ${message}
                <button type="button" class="btn-close ms-auto" onclick="this.parentElement.parentElement.remove()"></button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);
        
        // 3秒后自动消失
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
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
        document.getElementById('requirementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitRequirement();
        });
        
        // 筛选器
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.filterRequirements(e.target.value);
        });
    }
    
    // 显示技术参数字段
    showTechnicalParams(productType) {
        const paramsSection = document.getElementById('technicalParams');
        const fieldsContainer = document.getElementById('parameterFields');
        
        const paramFields = this.getParameterFields(productType);
        fieldsContainer.innerHTML = paramFields;
        
        paramsSection.style.display = 'block';
        paramsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // 获取参数字段HTML（根据新的参数分类）
    getParameterFields(type) {
        const fields = {
            electronic: `
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">主机屏幕</label>
                        <select class="form-select" name="screenSize">
                            <option value="">请选择</option>
                            <option value="5英寸">5英寸</option>
                            <option value="6英寸">6英寸</option>
                            <option value="7英寸">7英寸</option>
                            <option value="8英寸">8英寸</option>
                            <option value="其他">其他尺寸</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">待机时长</label>
                        <select class="form-select" name="batteryLife">
                            <option value="">请选择</option>
                            <option value="2小时">2小时</option>
                            <option value="4小时">4小时</option>
                            <option value="6小时">6小时</option>
                            <option value="8小时">8小时</option>
                            <option value="其他">其他时长</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">探头直径</label>
                        <select class="form-select" name="probeDiameter">
                            <option value="">请选择</option>
                            <option value="0.85mm">0.85mm</option>
                            <option value="0.95mm">0.95mm</option>
                            <option value="1.0mm">1.0mm</option>
                            <option value="1.2mm">1.2mm</option>
                            <option value="1.5mm">1.5mm</option>
                            <option value="1.8mm">1.8mm</option>
                            <option value="2.0mm">2.0mm</option>
                            <option value="2.2mm">2.2mm</option>
                            <option value="2.4mm">2.4mm</option>
                            <option value="2.8mm">2.8mm</option>
                            <option value="3.9mm">3.9mm</option>
                            <option value="6.0mm">6.0mm</option>
                            <option value="其他">其他规格</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">像素</label>
                        <select class="form-select" name="resolution">
                            <option value="">请选择</option>
                            <option value="16万">16万</option>
                            <option value="30万">30万</option>
                            <option value="100万">100万</option>
                            <option value="200万">200万</option>
                            <option value="其他">其他像素</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视向</label>
                        <select class="form-select" name="viewingDirection">
                            <option value="">请选择</option>
                            <option value="直视">直视</option>
                            <option value="直视(0°)">直视(0°)</option>
                            <option value="侧视(30°)">侧视(30°)</option>
                            <option value="侧视(90°)">侧视(90°)</option>
                            <option value="其他">其他视向</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">光源</label>
                        <select class="form-select" name="lightSource">
                            <option value="">请选择</option>
                            <option value="LED光源">LED光源</option>
                            <option value="光纤光源">光纤光源</option>
                            <option value="可选LED光源/光纤传导光源">可选LED光源/光纤传导光源</option>
                            <option value="冷光源">冷光源</option>
                            <option value="其他">其他光源</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">导向</label>
                        <select class="form-select" name="guidance">
                            <option value="">请选择</option>
                            <option value="无导向">无导向</option>
                            <option value="双向导向">双向导向</option>
                            <option value="四方向360度导向">四方向360度导向</option>
                            <option value="360°手电动导向">360°手电动导向</option>
                            <option value="其他">其他导向</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">管线材质</label>
                        <select class="form-select" name="cableMaterial">
                            <option value="">请选择</option>
                            <option value="合金弹簧软管">合金弹簧软管</option>
                            <option value="钛合金硬杆">钛合金硬杆</option>
                            <option value="钨丝编织软管">钨丝编织软管</option>
                            <option value="不锈钢软管">不锈钢软管</option>
                            <option value="其他">其他材质</option>
                        </select>
                    </div>
                </div>
            `,
            fiber: `
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">探头直径</label>
                        <select class="form-select" name="probeDiameter">
                            <option value="">请选择</option>
                            <option value="2.8mm">2.8mm</option>
                            <option value="4.0mm">4.0mm</option>
                            <option value="4.5mm">4.5mm</option>
                            <option value="6.0mm">6.0mm</option>
                            <option value="其他">其他规格</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">工作长度</label>
                        <select class="form-select" name="workingLength">
                            <option value="">请选择</option>
                            <option value="1500mm">1500mm</option>
                            <option value="2000mm">2000mm</option>
                            <option value="3000mm">3000mm</option>
                            <option value="其他">其他长度</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视向</label>
                        <select class="form-select" name="viewingDirection">
                            <option value="">请选择</option>
                            <option value="直视">直视</option>
                            <option value="直视(0°)">直视(0°)</option>
                            <option value="侧视(30°)">侧视(30°)</option>
                            <option value="侧视(90°)">侧视(90°)</option>
                            <option value="其他">其他视向</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视野</label>
                        <select class="form-select" name="fieldOfView">
                            <option value="">请选择</option>
                            <option value="60°">60°</option>
                            <option value="70°">70°</option>
                            <option value="75°">75°</option>
                            <option value="90°">90°</option>
                            <option value="120°">120°</option>
                            <option value="其他">其他视野</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">焦距</label>
                        <select class="form-select" name="focalLength">
                            <option value="">请选择</option>
                            <option value="5-50mm">5-50mm</option>
                            <option value="10-100mm">10-100mm</option>
                            <option value="20-200mm">20-200mm</option>
                            <option value="可调焦">可调焦</option>
                            <option value="其他">其他焦距</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">导向</label>
                        <select class="form-select" name="guidance">
                            <option value="">请选择</option>
                            <option value="无导向">无导向</option>
                            <option value="双向导向">双向导向</option>
                            <option value="四方向导向">四方向导向</option>
                            <option value="其他">其他导向</option>
                        </select>
                    </div>
                </div>
            `,
            optical: `
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">探头直径</label>
                        <select class="form-select" name="probeDiameter">
                            <option value="">请选择</option>
                            <option value="2.5mm">2.5mm</option>
                            <option value="3.0mm">3.0mm</option>
                            <option value="4.0mm">4.0mm</option>
                            <option value="其他">其他规格</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">工作长度</label>
                        <select class="form-select" name="workingLength">
                            <option value="">请选择</option>
                            <option value="175mm">175mm</option>
                            <option value="200mm">200mm</option>
                            <option value="300mm">300mm</option>
                            <option value="其他">其他长度</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视向</label>
                        <select class="form-select" name="viewingDirection">
                            <option value="">请选择</option>
                            <option value="直视">直视</option>
                            <option value="直视(0°)">直视(0°)</option>
                            <option value="侧视(30°)">侧视(30°)</option>
                            <option value="侧视(70°)">侧视(70°)</option>
                            <option value="其他">其他视向</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">光源</label>
                        <select class="form-select" name="lightSource">
                            <option value="">请选择</option>
                            <option value="冷光源">冷光源</option>
                            <option value="LED光源">LED光源</option>
                            <option value="光纤光源">光纤光源</option>
                            <option value="其他">其他光源</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视野</label>
                        <select class="form-select" name="fieldOfView">
                            <option value="">请选择</option>
                            <option value="60°">60°</option>
                            <option value="70°">70°</option>
                            <option value="85°">85°</option>
                            <option value="90°">90°</option>
                            <option value="120°">120°</option>
                            <option value="其他">其他视野</option>
                        </select>
                    </div>
                </div>
            `
        };
        
        return fields[type] || '';
    }

    // 提交需求
    async submitRequirement() {
        const form = document.getElementById('requirementForm');
        const formData = new FormData(form);

        // 验证必填字段
        if (!this.validateForm(form)) {
            return;
        }

        // 显示提交状态
        this.showSubmitStatus('正在提交...', 'info', true);

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
                this.showSubmitStatus('提交成功！', 'success', false);
                this.showSuccessModal(requirementData);
                form.reset();
                document.getElementById('technicalParams').style.display = 'none';

                // 刷新需求列表
                this.loadRequirements();
                this.updateStats();
            } else {
                this.showSubmitStatus('提交失败，请重试', 'danger', false);
            }
        } catch (error) {
            console.error('提交需求失败:', error);
            this.showSubmitStatus('提交失败: ' + error.message, 'danger', false);
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

        return isValid;
    }

    // 显示提交状态
    showSubmitStatus(message, type, loading) {
        const statusDiv = document.getElementById('submitStatus');
        const messageDiv = document.getElementById('submitMessage');
        const submitBtn = document.getElementById('submitBtn');
        const submitText = document.getElementById('submitText');
        const submitSpinner = document.getElementById('submitSpinner');

        statusDiv.className = `alert alert-${type}`;
        statusDiv.style.display = 'block';
        messageDiv.textContent = message;

        if (loading) {
            submitBtn.disabled = true;
            submitText.style.display = 'none';
            submitSpinner.style.display = 'inline-block';
        } else {
            submitBtn.disabled = false;
            submitText.style.display = 'inline';
            submitSpinner.style.display = 'none';

            // 3秒后隐藏状态
            setTimeout(() => {
                statusDiv.style.display = 'none';
            }, 3000);
        }
    }

    // 生成需求ID
    generateRequirementId() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = Date.now().toString(36).toUpperCase();
        return `REQ-${dateStr}-${timeStr}`;
    }

    // 保存需求到服务器
    async saveRequirement(data) {
        // 首先保存到本地存储（确保数据不丢失）
        this.saveToLocalStorage(data);

        // 如果API可用，尝试保存到服务器
        if (this.apiAvailable) {
            try {
                // 生成Markdown文件内容
                const markdownContent = this.generateRequirementMarkdown(data);
                const fileName = `${data.id}.md`;

                // 调用content-server API保存文件
                const response = await fetch(`${this.apiBase}/api/save-content`, {
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
                    console.log('✅ 需求保存到服务器成功:', result.filePath);
                    this.showNotification('需求已保存到服务器', 'success');
                } else {
                    throw new Error(result.message || '服务器保存失败');
                }
            } catch (error) {
                console.error('服务器保存失败:', error);
                this.showNotification('服务器保存失败，已保存到本地', 'warning');
            }
        } else {
            console.log('💾 需求已保存到本地存储');
            this.showNotification('需求已保存到本地存储', 'info');
        }

        return true; // 总是返回成功（本地存储作为备份）
    }

    // 生成需求的Markdown内容
    generateRequirementMarkdown(data) {
        const productTypeNames = {
            electronic: '电子内窥镜',
            fiber: '光纤内窥镜',
            optical: '光学内窥镜'
        };

        return `---
title: "${data.contactName}的${productTypeNames[data.productType] || data.productType}需求"
date: ${data.timestamp}
draft: false
type: "requirement"
status: "${data.status}"
requirement_id: "${data.id}"
product_type: "${data.productType}"
contact_name: "${data.contactName}"
contact_phone: "${data.contactPhone}"
company_name: "${data.companyName || ''}"
department: "${data.department || ''}"
budget: "${data.budget || ''}"
delivery_time: "${data.deliveryTime || ''}"
screen_size: "${data.screenSize || ''}"
battery_life: "${data.batteryLife || ''}"
probe_diameter: "${data.probeDiameter || ''}"
resolution: "${data.resolution || ''}"
viewing_direction: "${data.viewingDirection || ''}"
light_source: "${data.lightSource || ''}"
guidance: "${data.guidance || ''}"
working_length: "${data.workingLength || ''}"
field_of_view: "${data.fieldOfView || ''}"
---

# ${productTypeNames[data.productType] || data.productType}设备需求

## 基本信息

- **需求编号**: ${data.id}
- **联系人**: ${data.contactName}
- **联系电话**: ${data.contactPhone}
- **公司名称**: ${data.companyName || '未填写'}
- **所属部门**: ${data.department || '未填写'}
- **发布时间**: ${new Date(data.timestamp).toLocaleString()}

## 产品要求

- **产品类型**: ${productTypeNames[data.productType] || data.productType}
- **预算范围**: ${data.budget || '未填写'}
- **期望交付**: ${data.deliveryTime || '未填写'}

## 技术参数

${this.generateTechnicalParamsMarkdown(data)}

## 需求描述

${data.description}

## 联系方式

如需了解详细需求信息或提供解决方案，请联系：

- **联系人**: ${data.contactName}
- **电话**: ${data.contactPhone}
- **公司**: ${data.companyName || '个人用户'}

---

*此需求由Vision NDT需求中心自动生成*
`;
    }

    // 生成技术参数Markdown
    generateTechnicalParamsMarkdown(data) {
        const params = [];

        // 电子内窥镜参数
        if (data.screenSize) params.push(`- **主机屏幕**: ${data.screenSize}`);
        if (data.batteryLife) params.push(`- **待机时长**: ${data.batteryLife}`);

        // 通用参数
        if (data.probeDiameter) params.push(`- **探头直径**: ${data.probeDiameter}`);
        if (data.resolution) params.push(`- **像素/分辨率**: ${data.resolution}`);
        if (data.viewingDirection) params.push(`- **视向**: ${data.viewingDirection}`);
        if (data.lightSource) params.push(`- **光源**: ${data.lightSource}`);
        if (data.guidance) params.push(`- **导向**: ${data.guidance}`);

        // 光学/光纤内窥镜参数
        if (data.workingLength) params.push(`- **工作长度**: ${data.workingLength}`);
        if (data.fieldOfView) params.push(`- **视野**: ${data.fieldOfView}`);

        return params.length > 0 ? params.join('\n') : '- 无特殊技术要求';
    }

    // 保存到本地存储
    saveToLocalStorage(data) {
        const requirements = JSON.parse(localStorage.getItem('markets') || '[]');
        requirements.unshift(data);

        // 只保留最新的50条记录
        if (requirements.length > 50) {
            requirements.splice(50);
        }

        localStorage.setItem('markets', JSON.stringify(requirements));
        console.log('💾 需求已保存到本地存储');
    }

    // 加载需求列表（仅从接口获取，移除离线示例回退）
    async loadRequirements() {
        try {
            const apiRequirements = await this.loadFromApi();
            this.requirements = (apiRequirements || []).map(apiReq => this.normalizeStaticRequirement(apiReq))
                .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
            this.renderRequirements();
        } catch (error) {
            console.warn('从API加载失败:', error);
            this.showNotification('需求列表加载失败，请稍后再试', 'error');
        }
    }

    // 从API加载需求
    async loadFromApi() {
        let response = await fetch(`${this.apiBase}/api/markets`);
        if (!response.ok) {
            response = await fetch(`${this.apiBase}/api/requirements`);
        }
        if (!response.ok) {
            throw new Error('API请求失败');
        }
        const result = await response.json();
        return Array.isArray(result) ? result : (result.items || []);
    }

    // 从本地存储或示例数据加载
    async loadFromLocalStorage() {
        const localRequirements = JSON.parse(localStorage.getItem('markets') || localStorage.getItem('requirements') || '[]');
        this.requirements = localRequirements;
        if (this.requirements.length) {
            this.renderRequirements();
        }
    }

    // 规范化示例/接口返回数据为需求中心字段
    normalizeStaticRequirement(it) {
        const id = it.id || it.RequirementID || it.requirement_id || '';
        const published = it.timestamp || it.PublishedAt || it.published_at || it.created_at || new Date().toISOString();
        const statusText = it.status || it.Status || '';
        const progressText = it.progress || it.Progress || '';
        const titleText = it.title || it.Title || '';
        const primary = it.productType || it.PrimaryCategory || it.primaryCategory || it.category || '';
        const toType = (s) => {
            const t = String(s || '').toLowerCase();
            if (t.includes('电子')) return 'electronic';
            if (t.includes('光纤')) return 'fiber';
            if (t.includes('光学')) return 'optical';
            // 接口已是英文类型时直接返回
            if (['electronic','fiber','optical'].includes(t)) return t;
            return 'electronic';
        };
        const params = it.Parameters || it.parameters || {};
        return {
            id,
            timestamp: published,
            status: (statusText === '关闭' || statusText === 'closed') ? 'closed' : 'active',
            progress: progressText,
            title: titleText,
            productType: toType(primary),
            contactName: it.ContactName || it.contact_name || '',
            companyName: it.ContactCompany || it.contact_company || '',
            department: it.Department || it.contact_department || '',
            budget: it.BudgetRange || it.budget || '',
            description: it.PublicPreview || it.public_preview || it.Description || it.description || '',
            screenSize: params.ScreenSize || params.screen_size || '',
            batteryLife: params.BatteryLife || params.battery_life || '',
            probeDiameter: params.ProbeDiameter || params.probe_diameter || '',
            resolution: params.Resolution || params.resolution || '',
            viewingDirection: params.ViewingDirection || params.viewing_direction || '',
            lightSource: params.LightSource || params.light_source || '',
            guidance: params.Guidance || params.guidance || '',
            featured: !!it.featured,
            urgent: !!it.urgent
        };
    }

    // 获取模拟需求数据
    getMockRequirements() {
        return [
            {
                id: 'REQ-20250115-001',
                timestamp: '2025-01-15T10:30:00Z',
                status: 'active',
                productType: 'electronic',
                contactName: '张工程师',
                companyName: '某汽车制造有限公司',
                department: '质量部',
                budget: '10-20万',
                description: '需要采购电子内窥镜用于汽车发动机缸体内部检测，要求高清成像，支持测量功能，能够检测直径6mm的孔洞...',
                screenSize: '6英寸',
                batteryLife: '8小时',
                probeDiameter: '6.0mm',
                resolution: '100万',
                viewingDirection: '直视',
                lightSource: 'LED光源',
                guidance: '四方向360度导向',
                featured: true
            },
            {
                id: 'REQ-20250115-002',
                timestamp: '2025-01-15T09:15:00Z',
                status: 'active',
                productType: 'fiber',
                contactName: '李经理',
                companyName: '某航空科技公司',
                department: '技术部',
                budget: '20-50万',
                description: '用于航空发动机叶片检测的光纤内窥镜，需要超柔性探头，能够通过复杂路径进行检测...',
                probeDiameter: '2.8mm',
                workingLength: '1500mm',
                viewingDirection: '直视(0°)',
                fieldOfView: '60°',
                guidance: '双向导向',
                urgent: true
            },
            {
                id: 'REQ-20250115-003',
                timestamp: '2025-01-15T08:45:00Z',
                status: 'active',
                productType: 'optical',
                contactName: '王总监',
                companyName: '某精密制造企业',
                department: '生产部',
                budget: '5-10万',
                description: '需要光学内窥镜用于精密机械零件的质量检测，要求成像清晰，操作简便...',
                probeDiameter: '2.5mm',
                workingLength: '175mm',
                viewingDirection: '直视(0°)',
                lightSource: '冷光源',
                fieldOfView: '70°'
            }
        ];
    }

    // 渲染需求列表
    renderRequirements() {
        const container = document.getElementById('requirementsList');

        if (this.requirements.length === 0) {
            container.innerHTML = `
                <div class="text-center py-4">
                    <i class="fas fa-inbox" style="font-size: 3rem; color: #ccc;"></i>
                    <h5 class="mt-3 text-muted">暂无需求信息</h5>
                    <p class="text-muted">成为第一个发布需求的用户吧！</p>
                </div>
            `;
            return;
        }

        const filteredRequirements = this.currentFilter
            ? this.requirements.filter(req => req.productType === this.currentFilter)
            : this.requirements;

        const html = filteredRequirements.map(req => this.generateRequirementItemHTML(req)).join('');
        container.innerHTML = html;

        // 添加点击事件
        container.querySelectorAll('.requirement-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showRequirementDetail(item.dataset.id);
            });
        });
    }

    // 生成需求项HTML
    generateRequirementItemHTML(req) {
        const productTypeNames = {
            electronic: '电子内窥镜',
            fiber: '光纤内窥镜',
            optical: '光学内窥镜'
        };

        const timeAgo = this.getTimeAgo(req.timestamp);
        const itemClass = `requirement-item ${req.featured ? 'featured' : ''} ${req.urgent ? 'urgent' : ''}`;

        return `
            <div class="${itemClass}" data-id="${req.id}">
                <div class="requirement-header">
                    <div>
                        <div class="requirement-title">
                            ${req.companyName || req.contactName}的${productTypeNames[req.productType]}需求
                        </div>
                        <div class="requirement-meta">
                            <span class="badge bg-primary">${productTypeNames[req.productType]}</span>
                            <span class="badge bg-success">${req.budget || '预算面议'}</span>
                            <span class="badge bg-info">${req.department || '未指定部门'}</span>
                            ${req.featured ? '<span class="badge bg-warning">推荐</span>' : ''}
                            ${req.urgent ? '<span class="badge bg-danger">紧急</span>' : ''}
                        </div>
                    </div>
                    <div class="text-end">
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                </div>

                <div class="requirement-description">
                    ${req.description.substring(0, 120)}${req.description.length > 120 ? '...' : ''}
                </div>

                <div class="requirement-footer">
                    <div class="requirement-id">
                        需求编号: ${req.id}
                    </div>
                    <button class="btn btn-outline-primary contact-btn" onclick="event.stopPropagation(); contactRequirement('${req.id}')">
                        <i class="fas fa-phone me-1"></i>联系客户
                    </button>
                </div>
            </div>
        `;
    }

    // 计算时间差
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins}分钟前`;
        } else if (diffHours < 24) {
            return `${diffHours}小时前`;
        } else {
            return `${diffDays}天前`;
        }
    }

    // 筛选需求
    filterRequirements(type) {
        this.currentFilter = type;
        this.renderRequirements();
    }

    // 更新统计信息
    updateStats() {
        const activeCount = this.requirements.filter(req => req.status === 'active').length;
        document.getElementById('activeRequirements').textContent = activeCount;
    }

    // 显示成功提交模态框
    showSuccessModal(data) {
        const modal = new bootstrap.Modal(document.getElementById('successModal'));
        const modalBody = document.getElementById('successModalBody');

        modalBody.innerHTML = `
            <div class="text-center mb-3">
                <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                <h4 class="mt-3">需求已成功发布！</h4>
            </div>

            <div class="alert alert-info">
                <h6><i class="fas fa-info-circle me-1"></i>需求信息</h6>
                <p class="mb-1"><strong>需求编号：</strong>${data.id}</p>
                <p class="mb-1"><strong>产品类型：</strong>${this.getProductTypeName(data.productType)}</p>
                <p class="mb-0"><strong>联系电话：</strong>${data.contactPhone}</p>
            </div>

            <div class="alert alert-success">
                <h6><i class="fas fa-clock me-1"></i>后续流程</h6>
                <ol class="mb-0">
                    <li>我们将在24小时内联系您确认需求详情</li>
                    <li>为您匹配3-5家优质供应商</li>
                    <li>供应商将直接与您联系提供方案</li>
                    <li>我们提供全程技术支持和采购指导</li>
                </ol>
            </div>

            <div class="text-center">
                <p class="text-muted mb-2">
                    <i class="fas fa-phone me-1"></i>
                    如有疑问，请联系客服：400-XXX-XXXX
                </p>
            </div>
        `;

        modal.show();
    }

    // 显示需求详情
    showRequirementDetail(reqId) {
        const requirement = this.requirements.find(req => req.id === reqId);
        if (!requirement) return;

        const modal = new bootstrap.Modal(document.getElementById('requirementModal'));
        const modalBody = document.getElementById('requirementModalBody');

        // 处理时间线步进：已发布 / 沟通中 / 已完成(或关闭)
        const progressStr = String(requirement.progress || '').toLowerCase();
        let activeStep = 1;
        if (requirement.status === 'closed' || /完成|结束|closed|done/.test(progressStr)) {
            activeStep = 3;
        } else if (/沟通|接洽|联系|communicat|contact/.test(progressStr)) {
            activeStep = 2;
        }
        const percent = activeStep === 1 ? 33 : (activeStep === 2 ? 66 : 100);

        const title = requirement.title && String(requirement.title).trim()
          ? requirement.title
          : `${requirement.companyName || requirement.contactName || ''}的${this.getProductTypeName(requirement.productType)}需求`;

        modalBody.innerHTML = `
            <div class="mb-2">
                <h4 class="mb-1">${title}</h4>
                <div class="text-muted small">编号：${requirement.id} · 发布：${new Date(requirement.timestamp).toLocaleString()}</div>
            </div>

            <!-- 顶部时间线（横向） -->
            <div class="mb-3">
                <div class="d-flex align-items-center">
                    <div class="progress flex-grow-1" style="height:8px;">
                        <div class="progress-bar bg-success" role="progressbar" style="width: ${percent}%;" aria-valuenow="${percent}" aria-valuemin="0" aria-valuemax="100"></div>
                    </div>
                    <div class="ms-2 small text-muted">${activeStep===3?'已完成':(activeStep===2?'沟通中':'已发布')}</div>
                </div>
                <div class="d-flex justify-content-between small text-muted mt-1">
                    <span>已发布</span><span>沟通中</span><span>已完成</span>
                </div>
            </div>

            <!-- 基本信息（板块化） -->
            <div class="mb-3 p-3 border rounded">
                <div class="row mb-2">
                    <div class="col-md-6"><strong>产品类型：</strong>${this.getProductTypeName(requirement.productType)}</div>
                    <div class="col-md-6"><strong>预算范围：</strong><span class="text-success">${requirement.budget || '面议'}</span></div>
                </div>
                <div class="row">
                    <div class="col-md-6"><strong>客户公司：</strong>${requirement.companyName || '个人用户'}</div>
                    <div class="col-md-6"><strong>所属部门：</strong>${requirement.department || '未填写'}</div>
                </div>
            </div>

            <!-- 需求描述 -->
            <div class="mb-3 p-3 bg-light rounded">
                <div class="mb-2"><strong>需求描述</strong></div>
                <div>${requirement.description}</div>
            </div>

            <!-- 技术参数 -->
            <div class="mb-3 p-3 border rounded">
                <div class="mb-2"><strong>技术参数</strong></div>
                ${this.generateTechnicalParamsHTML(requirement)}
            </div>

            <!-- 联系方式（需授权密码） -->
            <div class="mb-3 p-3 border rounded">
                <div class="mb-2"><strong>联系方式</strong></div>
                <div class="alert alert-warning">
                    <div class="mb-2 small"><i class="fas fa-shield-exclamation me-1"></i>仅限合作供应商输入平台授权密码查看联系方式</div>
                    <div class="d-flex gap-2 align-items-center mb-2">
                        <input type="password" class="form-control form-control-sm" id="viewPasswordInput" placeholder="输入授权密码">
                        <button class="btn btn-primary btn-sm" onclick="verifyRequirementPassword('${requirement.id}')">
                            <i class="fas fa-unlock me-1"></i>解锁联系方式
                        </button>
                    </div>
                    <div id="contactUnlocked" style="display:none;" class="mt-2">
                        <div class="row g-2">
                            <div class="col-md-6"><strong>联系人：</strong><span id="cName"></span></div>
                            <div class="col-md-6"><strong>电话：</strong><span id="cPhone"></span></div>
                            <div class="col-md-6"><strong>公司：</strong><span id="cCompany"></span></div>
                            <div class="col-md-6"><strong>邮箱：</strong><span id="cEmail"></span></div>
                            <div class="col-md-6"><strong>部门：</strong><span id="cDept"></span></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 报价表单（默认折叠） -->
            <div class="mb-1 d-flex justify-content-between align-items-center">
                <div class="fw-bold">报价</div>
                <button class="btn btn-outline-success btn-sm" id="toggleQuoteBtn">展开报价表单</button>
            </div>
            <div id="quoteFormWrap" style="display:none;" class="p-3 border rounded mb-2">
                <form id="quoteForm" class="row g-2">
                    <div class="col-md-6">
                        <label class="form-label">供应商名称</label>
                        <input type="text" class="form-control" id="supplierName" placeholder="公司或联系人">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">联系电话</label>
                        <input type="text" class="form-control" id="supplierPhone" placeholder="手机号/座机">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">报价金额（元）</label>
                        <input type="number" class="form-control" id="quoteAmount" placeholder="例如 20000">
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">币种</label>
                        <input type="text" class="form-control" id="quoteCurrency" value="CNY">
                    </div>
                    <div class="col-12">
                        <label class="form-label">备注（型号/交期/关键参数等）</label>
                        <textarea class="form-control" id="quoteRemarks" rows="3"></textarea>
                    </div>
                    <div class="col-12 d-flex gap-2">
                        <button type="submit" class="btn btn-success">提交报价</button>
                        <button type="button" class="btn btn-outline-secondary" id="cancelQuoteBtn">收起</button>
                    </div>
                </form>
            </div>
        `;

        // 折叠/展开报价表单
        const toggleBtn = document.getElementById('toggleQuoteBtn');
        const wrap = document.getElementById('quoteFormWrap');
        const cancelBtn = document.getElementById('cancelQuoteBtn');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                const show = wrap.style.display === 'none';
                wrap.style.display = show ? '' : 'none';
                toggleBtn.textContent = show ? '收起报价表单' : '展开报价表单';
            });
        }
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                wrap.style.display = 'none';
                toggleBtn.textContent = '展开报价表单';
            });
        }

        // 提交报价
        const form = document.getElementById('quoteForm');
        if (form) {
            form.addEventListener('submit', async (e) => {
                e.preventDefault();
                const supplier_name = document.getElementById('supplierName').value.trim();
                const supplier_phone = document.getElementById('supplierPhone').value.trim();
                const amount = Number(document.getElementById('quoteAmount').value || 0);
                const currency = (document.getElementById('quoteCurrency').value || 'CNY').trim() || 'CNY';
                const remarks = document.getElementById('quoteRemarks').value.trim();
                if (!supplier_name || !amount) {
                    alert('请填写供应商名称与报价金额');
                    return;
                }
                try {
                    const api = window.requirementCenter?.apiBase || '';
                    const resp = await fetch(`${api}/api/quotes`, {
                        method: 'POST', headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ requirement_id: requirement.id, supplier_name, supplier_phone, amount, currency, remarks })
                    });
                    if (!resp.ok) throw new Error('报价提交失败');
                    await resp.json().catch(()=>({}));
                    alert('报价已提交成功！我们将通知发布方尽快接洽。');
                    form.reset();
                    wrap.style.display = 'none';
                    toggleBtn.textContent = '展开报价表单';
                } catch (err) {
                    alert('报价提交接口未开启或出错，请稍后再试');
                }
            });
        }

        modal.show();
    }

    // 生成技术参数HTML
    generateTechnicalParamsHTML(req) {
        const params = [];

        // 电子内窥镜参数
        if (req.screenSize) params.push(`<div class="col-md-6 mb-2"><strong>主机屏幕:</strong> ${req.screenSize}</div>`);
        if (req.batteryLife) params.push(`<div class="col-md-6 mb-2"><strong>待机时长:</strong> ${req.batteryLife}</div>`);

        // 通用参数
        if (req.probeDiameter) params.push(`<div class="col-md-6 mb-2"><strong>探头直径:</strong> ${req.probeDiameter}</div>`);
        if (req.resolution) params.push(`<div class="col-md-6 mb-2"><strong>像素/分辨率:</strong> ${req.resolution}</div>`);
        if (req.viewingDirection) params.push(`<div class="col-md-6 mb-2"><strong>视向:</strong> ${req.viewingDirection}</div>`);
        if (req.lightSource) params.push(`<div class="col-md-6 mb-2"><strong>光源:</strong> ${req.lightSource}</div>`);
        if (req.guidance) params.push(`<div class="col-md-6 mb-2"><strong>导向:</strong> ${req.guidance}</div>`);

        // 光学/光纤内窥镜参数
        if (req.workingLength) params.push(`<div class="col-md-6 mb-2"><strong>工作长度:</strong> ${req.workingLength}</div>`);
        if (req.fieldOfView) params.push(`<div class="col-md-6 mb-2"><strong>视野:</strong> ${req.fieldOfView}</div>`);

        return params.length > 0
            ? `<div class="row">${params.join('')}</div>`
            : '<p class="text-muted">无特殊技术要求</p>';
    }

    // 获取产品类型名称
    getProductTypeName(type) {
        const names = {
            electronic: '电子内窥镜',
            fiber: '光纤内窥镜',
            optical: '光学内窥镜'
        };
        return names[type] || type;
    }
}

// 全局函数
function contactRequirement(reqId) {
    alert(`联系需求 ${reqId}\n\n请联系平台客服获取客户详细联系方式：\n电话：400-XXX-XXXX\n邮箱：business@vision-ndt.com\n\n我们将在1小时内为您提供联系方式`);
}

function submitProposal(reqId) {
    alert(`提交技术方案\n\n请将您的技术方案和报价发送至：\nbusiness@vision-ndt.com\n\n邮件标题请注明：方案提交-${reqId}`);
}

// 授权密码验证并解锁联系方式（优先查看密码；失败则尝试供应商通行密码）
async function verifyRequirementPassword(requirementID) {
    const input = document.getElementById('viewPasswordInput');
    const pw = (input && input.value || '').trim();
    if (!pw) { alert('请输入授权密码'); return; }
    const api = (window.requirementCenter && window.requirementCenter.apiBase) || '';
    try {
        async function getDetail(qs){
            let r = await fetch(`${api}/api/markets/${encodeURIComponent(requirementID)}${qs}`);
            if (!r.ok) r = await fetch(`${api}/api/requirements/${encodeURIComponent(requirementID)}${qs}`);
            if (!r.ok) return null;
            try { return await r.json(); } catch { return null; }
        }
        let data = await getDetail(`?view_password=${encodeURIComponent(pw)}`);
        if (!(data && (data.requirement || data))) {
            data = await getDetail(`?supplier_access_password=${encodeURIComponent(pw)}`);
        }
        const det = data && (data.requirement || data) || null;
        if (det && (det.ContactName || det.ContactPhone || det.ContactCompany)) {
            document.getElementById('contactUnlocked')?.setAttribute('style','');
            document.getElementById('cName')?.replaceChildren(document.createTextNode(det.ContactName || ''));
            document.getElementById('cPhone')?.replaceChildren(document.createTextNode(det.ContactPhone || ''));
            const cc = document.getElementById('cCompany'); if (cc) cc.replaceChildren(document.createTextNode(det.ContactCompany || ''));
            const ce = document.getElementById('cEmail'); if (ce) ce.replaceChildren(document.createTextNode(det.ContactEmail || ''));
            const cd = document.getElementById('cDept'); if (cd) cd.replaceChildren(document.createTextNode(det.ContactDepartment || ''));
        } else {
            alert('授权密码不正确或接口暂不可用');
        }
    } catch (e) {
        alert('网络错误或接口不可用，请稍后再试');
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 确保页面元素已加载
    if (document.getElementById('requirementForm')) {
        window.requirementCenter = new RequirementCenter();
        console.log('✅ 需求中心已初始化');
    } else {
        console.warn('⚠️ 需求中心表单元素未找到');
    }
});
