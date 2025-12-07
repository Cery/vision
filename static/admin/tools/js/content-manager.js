/**
 * 内容管理系统 JavaScript
 * 支持在线和本地服务器使用
 */

class ContentManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentContent = null;
        this.editor = null;
        this.isOnline = this.detectEnvironment();
        const base = (window.API_BASE || '').replace(/\/$/, '');
        this.apiBase = base ? (base + '/api') : '/api';
        this.dashboardData = {
            products: [],
            news: [],
            cases: [],
            suppliers: [],
            markets: []
        };

        this.init();
    }
    
    // 检测运行环境
    detectEnvironment() {
        const hostname = window.location.hostname;
        return hostname !== 'localhost' && hostname !== '127.0.0.1';
    }
    
    // 初始化
    async init() {
        this.setupEventListeners();
        this.initializeEditor();
        await this.loadDashboardData();

        // 预加载所有内容类型的数据
        await Promise.all([
            this.loadContent('news'),
            this.loadContent('products'),
            this.loadContent('cases'),
            this.loadContent('suppliers'),
            this.loadContent('markets')
        ]);

        this.updateStats();
        this.switchSection('dashboard');

        // 启动自动同步
        this.startAutoSync();
    }
    
    // 设置事件监听器
    setupEventListeners() {
        // 导航菜单
        document.querySelectorAll('.nav-link[data-section]').forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const section = e.target.closest('[data-section]').dataset.section;
                this.switchSection(section);
            });
        });
        
        // 筛选器
        ['newsCategory', 'newsDate', 'newsSearch'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.filterNews());
                element.addEventListener('input', () => this.filterNews());
            }
        });
        
        ['productSupplier', 'productCategory', 'productSearch'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.filterProducts());
                element.addEventListener('input', () => this.filterProducts());
            }
        });
        
        ['caseIndustry', 'caseCategory', 'caseSearch'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.filterCases());
                element.addEventListener('input', () => this.filterCases());
            }
        });

        ['supplierStatus', 'supplierCategory', 'supplierSearch'].forEach(id => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener('change', () => this.filterSuppliers());
                element.addEventListener('input', () => this.filterSuppliers());
            }
        });
    }
    
    // 初始化编辑器
    initializeEditor() {
        const textarea = document.getElementById('contentEditor');
        if (textarea) {
            this.editor = CodeMirror.fromTextArea(textarea, {
                mode: 'markdown',
                theme: 'monokai',
                lineNumbers: true,
                lineWrapping: true,
                autoCloseBrackets: true,
                matchBrackets: true,
                foldGutter: true,
                gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"]
            });
            
            this.editor.on('change', () => {
                this.updatePreview();
            });
        }
    }
    
    // 切换内容区域
    switchSection(section) {
        // 更新导航状态
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // 切换内容区域
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
            sec.style.display = 'none';
        });

        const targetSection = document.getElementById(`${section}-section`);
        if (targetSection) {
            targetSection.classList.add('active');
            targetSection.style.display = 'block';
        }

        this.currentSection = section;

        // 仪表板不需要加载内容列表
        if (section !== 'dashboard') {
            this.loadContent(section);
        }
    }
    
    // 加载内容
    async loadContent(type) {
        try {
            if (this.dashboardData[type] && this.dashboardData[type].length > 0) {
                this.renderContentListFromDashboard(type);
                return;
            }
            const url = (() => {
                if (type === 'news' || type === 'cases' || type === 'products') return `${this.apiBase}/admin/${type}`;
                if (type === 'suppliers') return `${this.apiBase}/admin/${type}`;
                if (type === 'markets') return `${this.apiBase}/markets`;
                return '';
            })();
            if (!url) return;
            const headers = { 'Content-Type': 'application/json' };
            if (typeof window.ADMIN_KEY === 'string' && window.ADMIN_KEY) headers['X-Admin-Key'] = window.ADMIN_KEY;
            const res = await fetch(url, { headers });
            if (!res.ok) throw new Error(`加载失败 ${res.status}`);
            const items = await res.json();
            const converted = (items || []).map(it => {
                if (type === 'news') {
                    return {
                        id: it.news_id || it.id,
                        uri: `/news/${(it.slug || it.news_id || '').trim()}`,
                        title: it.title || '',
                        summary: it.summary || '',
                        date: it.published_at || it.created_at || it.updated_at || '',
                        params: { primary_category: it.category || '', tags: it.tags || '' },
                        content: it.content || ''
                    };
                }
                if (type === 'cases') {
                    return {
                        id: it.case_id || it.id,
                        uri: `/cases/${(it.slug || it.case_id || '').trim()}`,
                        title: it.title || '',
                        summary: it.summary || '',
                        date: it.published_at || it.created_at || it.updated_at || '',
                        params: { industry: it.industry || '' },
                        content: it.content || ''
                    };
                }
                if (type === 'products') {
                    const slug = it.slug || it.model || it.product_id || '';
                    return {
                        id: it.product_id || it.id,
                        uri: `/products/${slug.trim()}`,
                        title: it.name || it.title || '',
                        summary: it.summary || '',
                        date: it.published_at || it.created_at || it.updated_at || '',
                        params: {
                            primary_category: it.primary_category || '',
                            model: it.model || '',
                            series: it.series || ''
                        },
                        content: it.description || it.content || ''
                    };
                }
                return {
                    id: it.id || '',
                    uri: it.uri || '',
                    title: it.title || it.name || '',
                    summary: it.summary || '',
                    date: it.updated_at || it.created_at || '',
                    params: {},
                    content: it.content || ''
                };
            });
            this.dashboardData[type] = converted;
            this.renderContentListFromDashboard(type);
        } catch (error) {
            this.loadContentFromLocal(type);
        }
    }
    
    // 从本地文件系统加载内容（备用方案）
    async loadContentFromLocal(type) {
        try {
            // 模拟数据结构
            const mockData = this.getMockData(type);
            this.renderContentList(type, mockData);
        } catch (error) {
            this.showError(`无法加载${type}内容`);
        }
    }
    
    // 获取模拟数据
    getMockData(type) {
        const mockData = {
            news: [
                {
                    filename: '2025-07-14-endoscope-image-processing-algorithm.md',
                    name: '内窥镜图像处理算法研究',
                    category: 'tech-article',
                    date: '2025-07-14',
                    path: '/news/tech-article/2025-07-14-endoscope-image-processing-algorithm.md'
                },
                {
                    filename: '2025-07-14-industrial-endoscope-market-growth.md',
                    name: '工业内窥镜市场增长分析',
                    category: 'industry',
                    date: '2025-07-14',
                    path: '/news/industry/2025-07-14-industrial-endoscope-market-growth.md'
                }
            ],
            products: [
                {
                    filename: 'VIS-T2815.md',
                    name: 'VIS-T2815 电子内窥镜',
                    supplier: 'vis',
                    category: '电子内窥镜',
                    path: '/products/vis/VIS-T2815.md'
                },
                {
                    filename: 'WS-K1010.md',
                    name: 'WS-K1010 刚性内窥镜',
                    supplier: 'vs',
                    category: '光学内窥镜',
                    path: '/products/vs/WS-K1010.md'
                }
            ],
            cases: [
                {
                    filename: 'automotive-manufacturing.md',
                    name: '汽车制造质量控制检测系统',
                    industry: '汽车制造',
                    category: '电子内窥镜',
                    path: '/cases/automotive-manufacturing.md'
                }
            ],
            suppliers: [
                {
                    filename: 'tianjin-vision.md',
                    name: '天津维森科技有限公司',
                    type: '制造商',
                    path: '/suppliers/tianjin-vision.md'
                },
                {
                    filename: 'shenzhen-weishi.md',
                    name: '深圳市微视光电科技有限公司',
                    type: '制造商',
                    path: '/suppliers/shenzhen-weishi.md'
                }
            ],
            markets: [
                {
                    filename: 'REQ-20250120-001.md',
                    name: '航空发动机叶片检测设备采购需求',
                    requirement_id: 'REQ-20250120-001',
                    contact_name: '李工程师',
                    company_name: '某航空制造有限公司',
                    product_type: 'electronic',
                    status: 'active',
                    urgency: 'high',
                    budget: '50-100万',
                    region: '华北',
                    path: '/markets/REQ-20250120-001.md'
                }
            ]
        };
        
        return mockData[type] || [];
    }
    
    // 渲染内容列表
    renderContentList(type, items) {
        const listContainer = document.getElementById(`${type}List`);
        if (!listContainer) return;
        
        if (items.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h5>暂无${this.getTypeName(type)}内容</h5>
                    <p>点击"新建${this.getTypeName(type)}"开始创建内容</p>
                </div>
            `;
            return;
        }
        
        const html = items.map(item => this.renderContentItem(type, item)).join('');
        listContainer.innerHTML = html;
        
        // 添加点击事件
        listContainer.querySelectorAll('.content-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectContent(item.dataset.path, type);
            });
        });
    }

    // 从仪表板数据渲染内容列表
    renderContentListFromDashboard(type) {
        const listContainer = document.getElementById(`${type}List`);
        if (!listContainer) return;

        const items = this.dashboardData[type] || [];

        if (items.length === 0) {
            listContainer.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h5>暂无${this.getTypeName(type)}内容</h5>
                    <p>点击"新建${this.getTypeName(type)}"开始创建内容</p>
                </div>
            `;
            return;
        }

        // 转换仪表板数据格式为内容列表格式
        const convertedItems = items.map(item => ({
            path: item.uri,
            filename: this.extractFilename(item.uri),
            name: item.title,
            title: item.title,
            date: item.date || item.params?.date || '未知日期',
            category: item.params?.primary_category || '未分类',
            summary: item.summary || '',
            content: item.content || ''
        }));

        const html = convertedItems.map(item => this.renderContentItemFromDashboard(type, item)).join('');
        listContainer.innerHTML = html;

        // 添加点击事件
        listContainer.querySelectorAll('.content-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectContentFromDashboard(item.dataset.path, type);
            });
        });
    }

    // 从URI提取文件名
    extractFilename(uri) {
        if (!uri) return '未知文件';
        const parts = uri.split('/');
        return parts[parts.length - 1] || parts[parts.length - 2] || '未知文件';
    }

    // 渲染仪表板数据的内容项
    renderContentItemFromDashboard(type, item) {
        const badges = this.generateBadgesFromDashboard(type, item);
        const meta = this.generateMetaFromDashboard(type, item);

        return `
            <div class="content-item" data-path="${item.path}" data-filename="${item.filename}">
                <div class="content-title">${item.title}</div>
                <div class="content-meta">
                    ${badges}
                    <div class="mt-1">${meta}</div>
                </div>
            </div>
        `;
    }

    // 生成仪表板数据的徽章
    generateBadgesFromDashboard(type, item) {
        let badges = [];

        if (item.category && item.category !== '未分类') {
            badges.push(`<span class="badge bg-primary">${item.category}</span>`);
        }

        if (type === 'products' && item.params?.product_type) {
            badges.push(`<span class="badge bg-info">${item.params.product_type}</span>`);
        }

        if (type === 'news' && item.params?.news_category) {
            badges.push(`<span class="badge bg-success">${item.params.news_category}</span>`);
        }

        return badges.join(' ');
    }

    // 生成仪表板数据的元信息
    generateMetaFromDashboard(type, item) {
        let meta = [];

        meta.push(`<i class="bi bi-calendar3"></i> ${item.date}`);
        meta.push(`<i class="bi bi-file-text"></i> ${item.filename}`);

        if (item.summary) {
            meta.push(`<i class="bi bi-info-circle"></i> ${item.summary.substring(0, 50)}...`);
        }

        return meta.join(' • ');
    }

    // 选择仪表板内容
    selectContentFromDashboard(path, type) {
        // 从仪表板数据中找到对应的内容
        const items = this.dashboardData[type] || [];
        const selectedItem = items.find(item => item.uri === path);

        if (selectedItem) {
            // 更新选中状态
            document.querySelectorAll('.content-item').forEach(item => {
                item.classList.remove('active');
            });
            document.querySelector(`[data-path="${path}"]`).classList.add('active');

            // 显示内容详情
            this.showContentDetail(selectedItem, type);
        }
    }

    // 显示内容详情
    showContentDetail(item, type) {
        const editorSection = document.getElementById(`${type}Editor`);
        if (!editorSection) return;

        // 构建内容详情HTML
        const detailHtml = `
            <div class="content-detail">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h5>${item.title}</h5>
                    <div>
                        <button class="btn btn-outline-primary btn-sm me-2" onclick="editContent('${item.uri}', '${type}')">
                            <i class="bi bi-pencil"></i> 编辑
                        </button>
                        <button class="btn btn-outline-success btn-sm" onclick="previewContent('${item.uri}')">
                            <i class="bi bi-eye"></i> 预览
                        </button>
                    </div>
                </div>

                <div class="content-info mb-3">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>文件路径:</strong> ${item.uri}<br>
                            <strong>发布日期:</strong> ${item.date || '未知'}<br>
                            <strong>分类:</strong> ${item.params?.primary_category || '未分类'}
                        </div>
                        <div class="col-md-6">
                            <strong>类型:</strong> ${this.getTypeName(type)}<br>
                            <strong>状态:</strong> <span class="badge bg-success">已发布</span>
                        </div>
                    </div>
                </div>

                ${item.summary ? `
                    <div class="content-summary mb-3">
                        <strong>摘要:</strong>
                        <p class="text-muted">${item.summary}</p>
                    </div>
                ` : ''}

                <div class="content-preview">
                    <strong>内容预览:</strong>
                    <div class="border p-3 mt-2" style="max-height: 300px; overflow-y: auto;">
                        ${item.content ? item.content.substring(0, 500) + '...' : '暂无内容'}
                    </div>
                </div>
            </div>
        `;

        editorSection.innerHTML = detailHtml;
    }

    // 渲染单个内容项
    renderContentItem(type, item) {
        const badges = this.generateBadges(type, item);
        const meta = this.generateMeta(type, item);
        
        return `
            <div class="content-item" data-path="${item.path}" data-filename="${item.filename}">
                <div class="content-title">${item.name || item.filename}</div>
                <div class="content-meta">
                    ${badges}
                    <div class="mt-1">${meta}</div>
                </div>
            </div>
        `;
    }
    
    // 生成标签
    generateBadges(type, item) {
        let badges = '';
        
        if (type === 'news') {
            badges += `<span class="badge badge-category category-badge">${this.getCategoryName(item.category)}</span>`;
        } else if (type === 'products') {
            badges += `<span class="badge badge-category supplier-badge">${this.getSupplierName(item.supplier)}</span>`;
            if (item.category) {
                badges += ` <span class="badge badge-category category-badge">${item.category}</span>`;
            }
        } else if (type === 'cases') {
            if (item.industry) {
                badges += `<span class="badge badge-category supplier-badge">${item.industry}</span>`;
            }
            if (item.category) {
                badges += ` <span class="badge badge-category category-badge">${item.category}</span>`;
            }
        } else if (type === 'suppliers') {
            if (item.type) {
                badges += `<span class="badge badge-category category-badge">${item.type}</span>`;
            }
        } else if (type === 'requirements') {
            if (item.status) {
                const statusClass = this.getStatusClass(item.status);
                badges += `<span class="badge ${statusClass}">${this.getStatusText(item.status)}</span>`;
            }
            if (item.urgency) {
                const urgencyClass = this.getUrgencyClass(item.urgency);
                badges += ` <span class="badge ${urgencyClass}">${this.getUrgencyText(item.urgency)}</span>`;
            }
            if (item.product_type) {
                badges += ` <span class="badge badge-category category-badge">${this.getProductTypeText(item.product_type)}</span>`;
            }
        }
        
        return badges;
    }
    
    // 生成元信息
    generateMeta(type, item) {
        let meta = `<small class="text-muted">文件: ${item.filename}</small>`;

        if (item.date) {
            meta += ` <span class="badge badge-category date-badge">${item.date}</span>`;
        }

        if (type === 'requirements') {
            if (item.contact_name) {
                meta += ` <small class="text-muted">联系人: ${item.contact_name}</small>`;
            }
            if (item.company_name) {
                meta += ` <small class="text-muted">公司: ${item.company_name}</small>`;
            }
            if (item.budget) {
                meta += ` <small class="text-muted">预算: ${item.budget}</small>`;
            }
        }

        return meta;
    }
    
    // 获取类型名称
    getTypeName(type) {
        const names = {
            news: '新闻',
            products: '产品',
            cases: '案例',
            suppliers: '供应商',
            markets: '需求市场'
        };
        return names[type] || type;
    }

    // 获取状态样式类
    getStatusClass(status) {
        const statusClasses = {
            active: 'bg-success',
            pending: 'bg-warning',
            completed: 'bg-info',
            cancelled: 'bg-danger'
        };
        return statusClasses[status] || 'bg-secondary';
    }

    // 获取状态文本
    getStatusText(status) {
        const statusTexts = {
            active: '活跃',
            pending: '待处理',
            completed: '已完成',
            cancelled: '已取消'
        };
        return statusTexts[status] || status;
    }

    // 获取紧急程度样式类
    getUrgencyClass(urgency) {
        const urgencyClasses = {
            high: 'bg-danger',
            medium: 'bg-warning',
            low: 'bg-success'
        };
        return urgencyClasses[urgency] || 'bg-secondary';
    }

    // 获取紧急程度文本
    getUrgencyText(urgency) {
        const urgencyTexts = {
            high: '高',
            medium: '中',
            low: '低'
        };
        return urgencyTexts[urgency] || urgency;
    }

    // 获取产品类型文本
    getProductTypeText(type) {
        const typeTexts = {
            electronic: '电子内窥镜',
            fiber: '光纤内窥镜',
            rigid: '硬性内窥镜',
            other: '其他设备'
        };
        return typeTexts[type] || type;
    }
    
    // 获取分类名称
    getCategoryName(category) {
        const names = {
            'tech-article': '技术文章',
            'industry': '行业资讯',
            'exhibition': '展会信息'
        };
        return names[category] || category;
    }
    
    // 获取供应商名称
    getSupplierName(supplier) {
        const names = {
            'vis': '天津维森',
            'vs': '深圳微视',
            'hk': '北京华科'
        };
        return names[supplier] || supplier;
    }
    
    // 选择内容
    async selectContent(path, type) {
        // 更新选中状态
        document.querySelectorAll('.content-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-path="${path}"]`).classList.add('active');
        
        // 加载内容详情
        try {
            const content = await this.loadContentDetail(path);
            this.currentContent = { path, type, content };
            this.showEditor(content, type);
        } catch (error) {
            this.showError('加载内容详情失败');
        }
    }
    
    // 加载内容详情
    async loadContentDetail(path) {
        try {
            const response = await fetch(`${this.apiBase}/content/detail?path=${encodeURIComponent(path)}`);
            if (response.ok) {
                return await response.text();
            } else {
                throw new Error('API请求失败');
            }
        } catch (error) {
            // 返回模拟内容
            return this.getMockContent(path);
        }
    }
    
    // 获取模拟内容
    getMockContent(path) {
        return `---
title: "示例内容"
date: ${new Date().toISOString().split('T')[0]}
draft: false
---

# 示例内容

这是一个示例内容，用于演示内容管理系统的功能。

## 功能特点

- 支持Markdown编辑
- 实时预览
- 文件管理
- 在线/本地双模式

## 使用说明

1. 在左侧选择要编辑的内容
2. 在编辑器中修改内容
3. 点击保存按钮保存更改

---

*此内容由内容管理系统生成*
`;
    }
    
    // 显示编辑器
    showEditor(content, type) {
        const modal = new bootstrap.Modal(document.getElementById('editorModal'));
        
        // 设置标题
        document.getElementById('editorModalTitle').textContent = `编辑${this.getTypeName(type)}`;
        
        // 解析front matter和内容
        const { frontMatter, body } = this.parseFrontMatter(content);
        const seed = this.currentContent?.data || {};
        const merged = { ...frontMatter };
        merged.title = seed.title || merged.title || '';
        merged.summary = seed.summary || merged.summary || '';
        merged.featured_image = seed.cover_image || merged.featured_image || '';
        if (type === 'news') {
            merged.categories = merged.categories || seed.category || '';
            merged.tags = merged.tags || seed.tags || '';
        } else if (type === 'products') {
            merged.category = merged.category || seed.params?.primary_category || '';
            merged.model = merged.model || seed.params?.model || '';
            merged.series = merged.series || seed.params?.series || '';
        } else if (type === 'cases') {
            merged.industry = merged.industry || seed.params?.industry || '';
        }
        
        // 生成表单
        this.generateMetaForm(type, merged);
        
        // 设置编辑器内容
        if (this.editor) {
            this.editor.setValue(content);
        }
        
        // 更新预览
        this.updatePreview();
        
        // 显示模态框
        modal.show();
    }
    
    // 解析front matter
    parseFrontMatter(content) {
        const frontMatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
        const match = content.match(frontMatterRegex);
        
        if (match) {
            const frontMatterText = match[1];
            const body = match[2];
            const frontMatter = {};
            
            // 简单解析YAML
            frontMatterText.split('\n').forEach(line => {
                const colonIndex = line.indexOf(':');
                if (colonIndex > 0) {
                    const key = line.substring(0, colonIndex).trim();
                    const value = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');
                    frontMatter[key] = value;
                }
            });
            
            return { frontMatter, body };
        }
        
        return { frontMatter: {}, body: content };
    }
    
    // 生成元数据表单
    generateMetaForm(type, frontMatter) {
        const formContainer = document.getElementById('metaForm');
        const fields = this.getFormFields(type);
        
        let html = '<div class="row">';
        
        fields.forEach(field => {
            const value = frontMatter[field.key] || field.default || '';
            html += `
                <div class="col-md-${field.width || 6}">
                    <div class="mb-3">
                        <label class="form-label">${field.label}</label>
                        ${this.generateFormField(field, value)}
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
        formContainer.innerHTML = html;
    }
    
    // 获取表单字段配置
    getFormFields(type) {
        const commonFields = [
            { key: 'title', label: '标题', type: 'text', width: 12, required: true },
            { key: 'date', label: '日期', type: 'date', width: 6 },
            { key: 'draft', label: '草稿', type: 'checkbox', width: 6 }
        ];
        
        const typeFields = {
            news: [
                { key: 'categories', label: '分类', type: 'select', width: 6, options: [
                    { value: 'tech-article', label: '技术文章' },
                    { value: 'industry', label: '行业资讯' },
                    { value: 'exhibition', label: '展会信息' }
                ]},
                { key: 'tags', label: '标签', type: 'text', width: 6 },
                { key: 'summary', label: '摘要', type: 'textarea', width: 12 }
            ],
            products: [
                { key: 'supplier', label: '供应商', type: 'select', width: 6, options: [
                    { value: 'vis', label: '天津维森科技' },
                    { value: 'vs', label: '深圳微视光电' },
                    { value: 'hk', label: '北京华科检测' }
                ]},
                { key: 'category', label: '产品类型', type: 'select', width: 6, options: [
                    { value: '电子内窥镜', label: '电子内窥镜' },
                    { value: '光纤内窥镜', label: '光纤内窥镜' },
                    { value: '光学内窥镜', label: '光学内窥镜' }
                ]},
                { key: 'model', label: '产品型号', type: 'text', width: 6 },
                { key: 'price', label: '价格', type: 'text', width: 6 }
            ],
            cases: [
                { key: 'industry', label: '应用行业', type: 'select', width: 6, options: [
                    { value: '汽车制造', label: '汽车制造' },
                    { value: '航空航天', label: '航空航天' },
                    { value: '机械制造', label: '机械制造' },
                    { value: '电力能源', label: '电力能源' }
                ]},
                { key: 'client', label: '客户', type: 'text', width: 6 },
                { key: 'equipment_used', label: '使用设备', type: 'text', width: 12 }
            ]
        };
        
        return [...commonFields, ...(typeFields[type] || [])];
    }
    
    // 生成表单字段
    generateFormField(field, value) {
        switch (field.type) {
            case 'text':
                return `<input type="text" class="form-control" name="${field.key}" value="${value}" ${field.required ? 'required' : ''}>`;
            case 'date':
                return `<input type="date" class="form-control" name="${field.key}" value="${value}">`;
            case 'checkbox':
                return `<div class="form-check">
                    <input type="checkbox" class="form-check-input" name="${field.key}" ${value === 'true' ? 'checked' : ''}>
                    <label class="form-check-label">${field.label}</label>
                </div>`;
            case 'select':
                let options = field.options.map(opt => 
                    `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
                ).join('');
                return `<select class="form-select" name="${field.key}">${options}</select>`;
            case 'textarea':
                return `<textarea class="form-control" name="${field.key}" rows="3">${value}</textarea>`;
            default:
                return `<input type="text" class="form-control" name="${field.key}" value="${value}">`;
        }
    }
    
    // 更新预览
    updatePreview() {
        if (!this.editor) return;
        
        const content = this.editor.getValue();
        const { body } = this.parseFrontMatter(content);
        
        // 使用marked.js渲染Markdown
        const html = marked.parse(body);
        document.getElementById('contentPreview').innerHTML = html;
    }
    
    // 更新统计信息
    async updateStats() {
        try {
            const headers = { 'Content-Type': 'application/json' };
            if (typeof window.ADMIN_KEY === 'string' && window.ADMIN_KEY) headers['X-Admin-Key'] = window.ADMIN_KEY;
            const res = await fetch(`${this.apiBase}/admin/stats`, { headers });
            if (!res.ok) throw new Error('stats');
            const s = await res.json();
            const newsCount = s.news?.total || 0;
            const productsCount = s.products?.total || 0;
            const casesCount = s.cases?.total || 0;
            const totalCount = newsCount + productsCount + casesCount;
            document.getElementById('totalContent').textContent = totalCount;
            document.getElementById('newsCount').textContent = newsCount;
            document.getElementById('productsCount').textContent = productsCount;
            document.getElementById('casesCount').textContent = casesCount;
        } catch (error) {
            document.getElementById('totalContent').textContent = String((this.dashboardData.news.length + this.dashboardData.products.length + this.dashboardData.cases.length) || 0);
            document.getElementById('newsCount').textContent = String(this.dashboardData.news.length || 0);
            document.getElementById('productsCount').textContent = String(this.dashboardData.products.length || 0);
            document.getElementById('casesCount').textContent = String(this.dashboardData.cases.length || 0);
        }
    }

    // 加载仪表板数据
    async loadDashboardData() {
        try {
            this.showDataSourceStatus('正在加载数据...', 'info');

            // 尝试从搜索索引加载数据
            const response = await fetch('/search-index.json');
            if (response.ok) {
                const searchData = await response.json();

                // 过滤不同类型的数据
                this.dashboardData.products = searchData.filter(item =>
                    item.type === 'products' && item.title && item.title.trim() !== ''
                );
                this.dashboardData.news = searchData.filter(item =>
                    item.type === 'news' && item.title && item.title.trim() !== ''
                );
                this.dashboardData.cases = searchData.filter(item =>
                    item.type === 'cases' && item.title && item.title.trim() !== ''
                );
                this.dashboardData.suppliers = searchData.filter(item =>
                    item.type === 'suppliers' && item.title && item.title.trim() !== ''
                );

                this.updateDashboardStats();
                this.showDataSourceStatus('数据加载完成', 'success');

                setTimeout(() => {
                    this.hideDataSourceStatus();
                }, 3000);
            } else {
                throw new Error('搜索索引不可用');
            }
        } catch (error) {
            console.error('加载仪表板数据失败:', error);
            this.showDataSourceStatus('数据加载失败: ' + error.message, 'error');
        }
    }

    // 更新仪表板统计
    updateDashboardStats() {
        // 更新总览统计
        document.getElementById('totalProducts').textContent = this.dashboardData.products.length;
        document.getElementById('totalNews').textContent = this.dashboardData.news.length;
        document.getElementById('totalCases').textContent = this.dashboardData.cases.length;
        document.getElementById('totalSuppliers').textContent = this.dashboardData.suppliers.length;

        // 更新产品分类统计
        this.updateProductCategoryStats();

        // 更新发布统计
        this.updatePublishStats();

        // 更新最后更新时间
        document.getElementById('lastUpdateTime').textContent =
            '最后更新: ' + new Date().toLocaleString();
    }

    // 更新产品分类统计
    updateProductCategoryStats() {
        const categories = {};
        this.dashboardData.products.forEach(product => {
            let category = '未分类';
            if (product.params && product.params.primary_category) {
                category = product.params.primary_category;
            }
            categories[category] = (categories[category] || 0) + 1;
        });

        const html = Object.entries(categories)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([category, count]) => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${category}</span>
                    <span class="badge bg-primary">${count}</span>
                </div>
            `).join('');

        document.getElementById('productCategoryStats').innerHTML = html ||
            '<div class="text-muted text-center">暂无数据</div>';
    }

    // 更新发布统计
    updatePublishStats() {
        const allContent = [
            ...this.dashboardData.products,
            ...this.dashboardData.news,
            ...this.dashboardData.cases
        ];

        const monthStats = {};
        allContent.forEach(item => {
            const date = new Date(item.date || '2024-01-01');
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            monthStats[monthKey] = (monthStats[monthKey] || 0) + 1;
        });

        const html = Object.entries(monthStats)
            .sort((a, b) => b[0].localeCompare(a[0]))
            .slice(0, 6)
            .map(([month, count]) => `
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span>${month}</span>
                    <span class="badge bg-success">${count}</span>
                </div>
            `).join('');

        document.getElementById('publishStats').innerHTML = html ||
            '<div class="text-muted text-center">暂无数据</div>';
    }



    // 显示数据源状态
    showDataSourceStatus(message, type) {
        const statusDiv = document.getElementById('dataSourceStatus');
        const messageSpan = document.getElementById('dataSourceMessage');

        if (statusDiv && messageSpan) {
            statusDiv.className = `alert alert-${type === 'success' ? 'success' : type === 'error' ? 'danger' : 'info'}`;
            messageSpan.textContent = message;
            statusDiv.style.display = 'block';
        }
    }

    // 隐藏数据源状态
    hideDataSourceStatus() {
        const statusDiv = document.getElementById('dataSourceStatus');
        if (statusDiv) {
            statusDiv.style.display = 'none';
        }
    }

    // 显示错误信息
    showError(message) {
        console.error(message);
        // 可以添加toast通知
    }
    
    // 创建新内容
    createNewContent(type) {
        const template = this.getContentTemplate(type);
        this.currentContent = {
            path: null,
            type,
            content: template,
            isNew: true
        };
        this.showEditor(template, type);

        // 隐藏删除按钮（新内容）
        document.getElementById('deleteBtn').style.display = 'none';
    }

    // 获取内容模板
    getContentTemplate(type) {
        const date = new Date().toISOString().split('T')[0];
        const templates = {
            news: `---
title: "新建新闻标题"
date: ${date}
draft: true
categories: ["tech-article"]
tags: ["工业内窥镜"]
summary: "新闻摘要"
featured_image: "/images/news/placeholder.svg"
---

# 新建新闻标题

## 概述

在这里编写新闻内容...

## 详细内容

详细描述新闻内容。

---

*更多信息请关注我们的官方网站*`,

            products: `---
title: "新建产品名称"
date: ${date}
draft: true
supplier: "vs"
category: "电子内窥镜"
model: "NEW-MODEL"
price: "询价"
featured_image: "/images/products/placeholder.svg"
---

# 新建产品名称

## 产品概述

产品的基本介绍...

## 技术参数

- **探头直径**: 待定
- **工作长度**: 待定
- **视向角度**: 待定

## 应用领域

- 应用场景1
- 应用场景2

---

*产品详情请咨询我们的销售团队*`,

            cases: `---
title: "新建应用案例"
date: ${date}
draft: true
industry: "汽车制造"
client: "客户名称"
equipment_used: "使用设备"
primary_category: ["电子内窥镜"]
application_field: ["汽车制造"]
application_scenario: ["质量检测"]
featured_image: "/images/cases/placeholder.svg"
---

# 新建应用案例

## 项目概述

案例的背景介绍...

## 解决方案

采用的技术方案...

## 实施效果

取得的成果和效益...

---

*更多案例请访问我们的案例中心*`,

            suppliers: `---
name: "新建供应商名称"
type: "制造商"
description: "供应商简介"
logo: "/images/suppliers/placeholder.png"
website: "https://www.example.com"
established_year: "2020"
registered_capital: "1000万元"
employee_count: "50-100人"
business_scope: "工业检测设备"
quality_certifications:
  - "ISO9001质量管理体系认证"
  - "CE认证"
contact:
  address: "详细地址"
  phone: "联系电话"
  email: "contact@example.com"
  contact_person: "联系人"
social_media:
  wechat: "微信号"
  weibo: "@微博账号"
  linkedin: "linkedin账号"
products_count: 0
status: "active"
created_at: ${date}T10:00:00+08:00
updated_at: ${date}T10:00:00+08:00
---

# 新建供应商名称

## 公司简介

在这里编写供应商的详细介绍...

## 主营产品

- 产品类别1
- 产品类别2

## 联系方式

- **地址**：详细地址
- **电话**：联系电话
- **邮箱**：contact@example.com`,

            requirements: `---
title: "新建需求标题"
date: ${date}T10:00:00+08:00
draft: false
type: "requirement"
status: "active"
requirement_id: "REQ-${date.replace(/-/g, '')}-001"
product_type: "electronic"
contact_name: "联系人姓名"
contact_phone: "联系电话"
contact_email: "联系邮箱"
company_name: "公司名称"
company_type: "制造企业"
region: "华东"
budget: "10-50万"
delivery_time: "1个月内"
urgency: "medium"
is_vip: false
description: "需求描述"
technical_requirements:
  probe_diameter: "6.0mm"
  working_length: "1500mm"
  viewing_direction: "0°"
  resolution: "高清"
  special_features: []
application_scenario: "应用场景"
tags: ["内窥镜", "检测设备"]
---

# 新建需求标题

## 基本信息

- **需求编号**：REQ-${date.replace(/-/g, '')}-001
- **联系人**：联系人姓名
- **公司**：公司名称
- **预算**：10-50万
- **交付时间**：1个月内

## 需求描述

详细描述采购需求...

## 技术要求

- **探头直径**：6.0mm
- **工作长度**：1500mm
- **视角方向**：0°
- **分辨率**：高清

## 应用场景

描述具体的应用场景...

---

*如有疑问，请联系我们的销售团队*`
        };

        return templates[type] || templates.news;
    }

    // 保存当前内容
    async saveCurrentContent() {
        if (!this.currentContent) {
            this.showNotification('没有要保存的内容', 'warning');
            return;
        }
        try {
            const formData = this.collectFormData();
            const { body } = this.parseFrontMatter(this.editor ? this.editor.getValue() : '');
            const type = this.currentContent.type;
            const headers = { 'Content-Type': 'application/json' };
            if (typeof window.ADMIN_KEY === 'string' && window.ADMIN_KEY) headers['X-Admin-Key'] = window.ADMIN_KEY;
            // 表单校验
            const title = (formData.title || '').trim();
            if (!title || title.length < 2) {
                this.showNotification('标题不能为空且需至少2个字符', 'warning');
                return;
            }
            if (type === 'news') {
                const cat = Array.isArray(formData.categories) ? formData.categories[0] : (formData.categories || '').trim();
                if (!cat) { this.showNotification('请选择新闻分类', 'warning'); return; }
            }
            if (type === 'products') {
                const cat = (formData.category || '').trim();
                const model = (formData.model || '').trim();
                if (!cat) { this.showNotification('请选择产品类型', 'warning'); return; }
                if (!model) { this.showNotification('请填写产品型号', 'warning'); return; }
            }
            if (type === 'cases') {
                const ind = (formData.industry || '').trim();
                if (!ind) { this.showNotification('请选择案例所属行业', 'warning'); return; }
            }
            let endpoint = `${this.apiBase}/admin/${type}`;
            let method = 'POST';
            let payload = {};
            const slug = this.generateSlug(formData.title || this.currentContent.title || '');
            if (type === 'news') {
                payload = {
                    title: formData.title,
                    slug,
                    summary: formData.summary || '',
                    content: body || this.currentContent.data?.content || '',
                    cover_image: formData.featured_image || '',
                    category: Array.isArray(formData.categories) ? formData.categories[0] : formData.categories || '',
                    tags: formData.tags || '',
                    status: formData.draft ? 'draft' : 'published'
                };
            } else if (type === 'cases') {
                payload = {
                    title: formData.title,
                    slug,
                    summary: formData.summary || '',
                    content: body || this.currentContent.data?.content || '',
                    cover_image: formData.featured_image || '',
                    industry: formData.industry || '',
                    related_product_id: this.currentContent.data?.params?.related_product_id || '' ,
                    status: formData.draft ? 'draft' : 'published'
                };
            } else if (type === 'products') {
                payload = {
                    name: formData.title,
                    slug,
                    summary: formData.summary || '',
                    description: body || this.currentContent.data?.content || '',
                    primary_category: formData.category || '',
                    model: formData.model || '',
                    series: formData.series || '',
                    cover_image: formData.featured_image || ''
                };
            }
            if (!this.currentContent.isNew && this.currentContent.data?.id) {
                endpoint = `${endpoint}/${this.currentContent.data.id}`;
                method = 'PATCH';
            }
            const res = await fetch(endpoint, { method, headers, body: JSON.stringify(payload) });
            if (!res.ok) throw new Error(`保存失败 ${res.status}`);
            const j = await res.json();
            // 更新选中项ID
            if (this.currentContent.isNew) {
                const id = j.news_id || j.case_id || j.product_id || '';
                this.currentContent.data = { ...(this.currentContent.data || {}), id };
            }
            this.showNotification('保存成功', 'success');
            await this.loadContent(type);
            bootstrap.Modal.getInstance(document.getElementById('editorModal')).hide();
        } catch (error) {
            this.showNotification('保存失败: ' + error.message, 'error');
        }
    }

    // 收集表单数据
    collectFormData() {
        const formData = {};
        const form = document.getElementById('metaForm');

        form.querySelectorAll('input, select, textarea').forEach(field => {
            if (field.type === 'checkbox') {
                formData[field.name] = field.checked;
            } else {
                formData[field.name] = field.value;
            }
        });

        return formData;
    }

    // 更新front matter
    updateFrontMatter(content, formData) {
        const { body } = this.parseFrontMatter(content);

        let frontMatter = '---\n';
        Object.entries(formData).forEach(([key, value]) => {
            if (value !== '') {
                if (typeof value === 'boolean') {
                    frontMatter += `${key}: ${value}\n`;
                } else if (key === 'categories' || key === 'tags') {
                    // 处理数组字段
                    const items = value.split(',').map(item => item.trim()).filter(item => item);
                    frontMatter += `${key}: [${items.map(item => `"${item}"`).join(', ')}]\n`;
                } else {
                    frontMatter += `${key}: "${value}"\n`;
                }
            }
        });
        frontMatter += '---\n\n';

        return frontMatter + body;
    }

    // 生成文件路径
    generateFilePath(type, formData) {
        const date = formData.date || new Date().toISOString().split('T')[0];
        const title = formData.title || 'untitled';
        const slug = this.generateSlug(title);

        const paths = {
            news: `/content/news/${formData.categories || 'tech-article'}/${date}-${slug}.md`,
            products: `/content/products/${formData.supplier || 'vs'}/${formData.model || slug}.md`,
            cases: `/content/cases/${slug}.md`
        };

        return paths[type] || `/content/${type}/${slug}.md`;
    }

    // 生成URL友好的slug
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim('-')
            .substring(0, 50);
    }

    // 保存到服务器
    async saveToServer(filePath, content) {
        try {
            const response = await fetch(`${this.apiBase}/content/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: filePath,
                    content: content
                })
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('保存到服务器失败:', error);
            // 如果是本地环境，尝试保存到localStorage
            if (!this.isOnline) {
                localStorage.setItem(`content_${filePath}`, content);
                return true;
            }
            return false;
        }
    }

    // 删除当前内容
    async deleteCurrentContent() {
        if (!this.currentContent || this.currentContent.isNew) {
            this.showNotification('没有要删除的内容', 'warning');
            return;
        }
        if (!confirm('确定要删除这个内容吗？此操作不可撤销。')) return;
        try {
            const type = this.currentContent.type;
            const id = this.currentContent.data?.id;
            if (!id) throw new Error('缺少ID');
            const headers = { 'Content-Type': 'application/json' };
            if (typeof window.ADMIN_KEY === 'string' && window.ADMIN_KEY) headers['X-Admin-Key'] = window.ADMIN_KEY;
            const res = await fetch(`${this.apiBase}/admin/${type}/${id}`, { method: 'DELETE', headers });
            if (!res.ok) throw new Error(`删除失败 ${res.status}`);
            this.showNotification('删除成功', 'success');
            await this.loadContent(type);
            bootstrap.Modal.getInstance(document.getElementById('editorModal')).hide();
            this.currentContent = null;
        } catch (error) {
            this.showNotification('删除失败: ' + error.message, 'error');
        }
    }

    // 从服务器删除
    async deleteFromServer(filePath) {
        try {
            const response = await fetch(`${this.apiBase}/content/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    path: filePath
                })
            });

            const result = await response.json();
            return result.success;
        } catch (error) {
            console.error('从服务器删除失败:', error);
            // 如果是本地环境，从localStorage删除
            if (!this.isOnline) {
                localStorage.removeItem(`content_${filePath}`);
                return true;
            }
            return false;
        }
    }

    // 启动自动同步
    startAutoSync() {
        // 每30秒检查一次数据更新
        this.syncInterval = setInterval(() => {
            this.syncContentData();
        }, 30000);

        // 页面可见性变化时同步
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.syncContentData();
            }
        });

        console.log('自动同步已启动');
    }

    // 停止自动同步
    stopAutoSync() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
            this.syncInterval = null;
        }
    }

    // 渲染内容列表
    renderContentList(type, data) {
        const listElement = document.getElementById(`${type}List`);
        const countElement = document.getElementById(`${type}Count`);

        if (!listElement) return;

        // 更新计数
        if (countElement) {
            countElement.textContent = data.length;
        }

        if (data.length === 0) {
            listElement.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-${this.getTypeIcon(type)}"></i>
                    <p>暂无${this.getTypeName(type)}信息</p>
                </div>
            `;
            return;
        }

        // 渲染列表项
        listElement.innerHTML = data.map(item => this.renderContentItem(type, item)).join('');
    }

    // 获取类型图标
    getTypeIcon(type) {
        const icons = {
            news: 'newspaper',
            products: 'box',
            cases: 'file-text',
            suppliers: 'building',
            markets: 'clipboard-data'
        };
        return icons[type] || 'file';
    }

    // 同步内容数据
    async syncContentData() {
        try {
            const currentType = this.currentSection;
            if (currentType && currentType !== 'dashboard') {
                const headers = { 'Content-Type': 'application/json' };
                if (typeof window.ADMIN_KEY === 'string' && window.ADMIN_KEY) headers['X-Admin-Key'] = window.ADMIN_KEY;
                const response = await fetch(`${this.apiBase}/admin/${currentType}`, { headers });
                if (!response.ok) return;
                const items = await response.json();
                const converted = (items || []).map(it => ({ title: it.title || it.name || '', filename: it.slug || it.id || '' }));
                const currentData = this.dashboardData[currentType] || [];
                if (this.hasDataChanged(currentData, converted)) {
                    this.dashboardData[currentType] = converted;
                    this.renderContentListFromDashboard(currentType);
                    this.updateStats();
                    this.showSyncNotification('数据已同步更新');
                }
            }
        } catch (error) {
            console.warn('自动同步失败:', error);
        }
    }

    // 检查数据是否有变化
    hasDataChanged(oldData, newData) {
        if (oldData.length !== newData.length) {
            return true;
        }

        // 简单的内容比较
        const oldIds = oldData.map(item => item.filename || item.name).sort();
        const newIds = newData.map(item => item.filename || item.name).sort();

        return JSON.stringify(oldIds) !== JSON.stringify(newIds);
    }

    // 显示同步通知
    showSyncNotification(message) {
        // 创建轻量级的同步提示
        const notification = document.createElement('div');
        notification.className = 'sync-notification';
        notification.innerHTML = `
            <i class="bi bi-arrow-clockwise"></i> ${message}
        `;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #28a745;
            color: white;
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 14px;
            z-index: 9999;
            opacity: 0;
            transition: opacity 0.3s;
        `;

        document.body.appendChild(notification);

        // 显示动画
        setTimeout(() => {
            notification.style.opacity = '1';
        }, 100);

        // 自动消失
        setTimeout(() => {
            notification.style.opacity = '0';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 2000);
    }

    // 手动同步
    async manualSync() {
        this.showNotification('正在同步数据...', 'info');

        try {
            // 重新加载所有数据
            await Promise.all([
                this.loadContent('news'),
                this.loadContent('products'),
                this.loadContent('cases'),
                this.loadContent('suppliers'),
                this.loadContent('markets')
            ]);

            this.updateStats();
            this.showNotification('数据同步完成', 'success');
        } catch (error) {
            this.showNotification('数据同步失败: ' + error.message, 'error');
        }
    }

    // 显示通知
    showNotification(message, type = 'info') {
        // 创建toast通知
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        // 自动移除
        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    // 创建toast容器
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }

    // 筛选方法
    filterNews() {
        const category = document.getElementById('newsCategory').value;
        const date = document.getElementById('newsDate').value;
        const search = document.getElementById('newsSearch').value.toLowerCase();

        this.applyFilter('news', { category, date, search });
    }

    filterProducts() {
        const supplier = document.getElementById('productSupplier').value;
        const category = document.getElementById('productCategory').value;
        const search = document.getElementById('productSearch').value.toLowerCase();

        this.applyFilter('products', { supplier, category, search });
    }

    filterCases() {
        const industry = document.getElementById('caseIndustry').value;
        const category = document.getElementById('caseCategory').value;
        const search = document.getElementById('caseSearch').value.toLowerCase();

        this.applyFilter('cases', { industry, category, search });
    }

    filterSuppliers() {
        const status = document.getElementById('supplierStatus').value;
        const category = document.getElementById('supplierCategory').value;
        const search = document.getElementById('supplierSearch').value.toLowerCase();

        this.applyFilter('suppliers', { status, category, search });
    }

    // 应用筛选
    applyFilter(type, filters) {
        const items = document.querySelectorAll(`#${type}List .content-item`);

        items.forEach(item => {
            let show = true;

            // 应用各种筛选条件
            Object.entries(filters).forEach(([key, value]) => {
                if (value && show) {
                    const itemData = this.getItemDataFromElement(item);

                    if (key === 'search') {
                        show = itemData.title.toLowerCase().includes(value) ||
                               itemData.filename.toLowerCase().includes(value);
                    } else {
                        show = itemData[key] === value;
                    }
                }
            });

            item.style.display = show ? 'block' : 'none';
        });
    }

    // 从DOM元素获取项目数据
    getItemDataFromElement(element) {
        const title = element.querySelector('.content-title').textContent;
        const filename = element.dataset.filename;
        const badges = Array.from(element.querySelectorAll('.badge')).map(badge => badge.textContent);

        return {
            title,
            filename,
            category: badges[0] || '',
            supplier: badges[0] || '',
            industry: badges[0] || ''
        };
    }
}

// 全局函数
function createNewContent(type) {
    if (window.contentManager) {
        window.contentManager.createNewContent(type);
    }
}

function saveContent() {
    if (window.contentManager) {
        window.contentManager.saveCurrentContent();
    }
}

function deleteContent() {
    if (window.contentManager) {
        window.contentManager.deleteCurrentContent();
    }
}

function refreshContent() {
    if (window.contentManager) {
        window.contentManager.loadContent(window.contentManager.currentSection);
        window.contentManager.updateStats();
    }
}

function refreshAllData() {
    if (window.contentManager) {
        window.contentManager.loadDashboardData();
    }
}

function editContent(path, type) {
    if (window.contentManager) {
        // 找到对应的内容项
        const items = window.contentManager.dashboardData[type] || [];
        const item = items.find(item => item.uri === path);

        if (item) {
            // 设置当前内容
            window.contentManager.currentContent = {
                path: path,
                type: type,
                content: item.content || '',
                isNew: false,
                title: item.title,
                data: item
            };

            // 显示编辑器模态框
            window.contentManager.showEditor(item.content || '', type);
        }
    }
}

function previewContent(path) {
    if (window.contentManager) {
        // 在新窗口中打开预览
        window.open(path, '_blank');
    }
}

function exportData() {
    console.log('导出数据');
    // 实现数据导出逻辑
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.contentManager = new ContentManager();
});
