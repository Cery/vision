// 内容管理系统 - 菜单函数
console.log('admin-functions.js 开始加载...');

// 测试函数
function testAlert() {
    alert('JavaScript 正常工作！');
    console.log('测试函数被调用');
}

// 首页管理函数
function showHomepageManager() {
    console.log('showHomepageManager 被调用');
    updatePageTitle('首页内容管理', '管理首页各个版块的内容');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">首页内容管理</h4>
                <p class="text-muted mb-0">管理首页各个版块的内容</p>
            </div>
            <button class="btn btn-success" onclick="saveHomepageChanges()">
                <i class="fas fa-save me-2"></i>保存所有更改
            </button>
        </div>

        <!-- 首页版块管理 -->
        <div class="row">
            <!-- 轮播图管理 -->
            <div class="col-lg-6 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-images text-primary me-2"></i>轮播图管理
                        </h5>
                        <button class="btn btn-sm btn-primary" onclick="showBannerManager()">
                            <i class="fas fa-edit me-1"></i>编辑
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="row" id="bannerPreview">
                            <div class="col-4 mb-2">
                                <div class="banner-item">
                                    <img src="/images/banner/banner1.jpg" class="img-fluid rounded" alt="轮播图1" style="height: 60px; object-fit: cover;">
                                    <small class="d-block text-muted mt-1">无损检测技术</small>
                                </div>
                            </div>
                            <div class="col-4 mb-2">
                                <div class="banner-item">
                                    <img src="/images/banner/banner2.jpg" class="img-fluid rounded" alt="轮播图2" style="height: 60px; object-fit: cover;">
                                    <small class="d-block text-muted mt-1">产品展示</small>
                                </div>
                            </div>
                            <div class="col-4 mb-2">
                                <div class="banner-item">
                                    <img src="/images/banner/banner3.jpg" class="img-fluid rounded" alt="轮播图3" style="height: 60px; object-fit: cover;">
                                    <small class="d-block text-muted mt-1">解决方案</small>
                                </div>
                            </div>
                        </div>
                        <div class="text-center mt-2">
                            <small class="text-muted">当前共 3 张轮播图</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 推荐产品管理 -->
            <div class="col-lg-6 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-star text-warning me-2"></i>推荐产品
                        </h5>
                        <button class="btn btn-sm btn-warning" onclick="showFeaturedProducts()">
                            <i class="fas fa-edit me-1"></i>编辑
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="list-group list-group-flush" id="featuredProductsList">
                            <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                                <div class="d-flex align-items-center">
                                    <img src="/images/products/product1.jpg" class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;" alt="产品1">
                                    <div>
                                        <h6 class="mb-0">WS-K08510超细工业电子内窥镜</h6>
                                        <small class="text-muted">K系列</small>
                                    </div>
                                </div>
                                <span class="badge bg-success">推荐</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between align-items-center px-0">
                                <div class="d-flex align-items-center">
                                    <img src="/images/products/product2.jpg" class="rounded me-2" style="width: 40px; height: 40px; object-fit: cover;" alt="产品2">
                                    <div>
                                        <h6 class="mb-0">P08510工业电子内窥镜</h6>
                                        <small class="text-muted">P系列</small>
                                    </div>
                                </div>
                                <span class="badge bg-success">推荐</span>
                            </div>
                        </div>
                        <div class="text-center mt-2">
                            <small class="text-muted">当前推荐 2 个产品</small>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 公司信息管理 -->
            <div class="col-lg-6 mb-4">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">
                            <i class="fas fa-building text-info me-2"></i>公司信息
                        </h5>
                        <button class="btn btn-sm btn-info" onclick="showCompanyInfo()">
                            <i class="fas fa-edit me-1"></i>编辑
                        </button>
                    </div>
                    <div class="card-body">
                        <div class="company-info">
                            <div class="mb-2">
                                <strong>公司名称：</strong>
                                <span>深圳市微视光电科技有限公司</span>
                            </div>
                            <div class="mb-2">
                                <strong>公司简介：</strong>
                                <span class="text-muted">专业从事无损检测设备研发、生产和销售的高新技术企业...</span>
                            </div>
                            <div class="mb-2">
                                <strong>联系电话：</strong>
                                <span>15222189183</span>
                            </div>
                            <div class="mb-2">
                                <strong>邮箱地址：</strong>
                                <span>wangxuan@sz-wise.cn</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 网站统计 -->
            <div class="col-lg-6 mb-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">
                            <i class="fas fa-chart-bar text-success me-2"></i>网站统计
                        </h5>
                    </div>
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-6 mb-3">
                                <h4 class="text-primary mb-1">156</h4>
                                <small class="text-muted">产品数量</small>
                            </div>
                            <div class="col-6 mb-3">
                                <h4 class="text-success mb-1">89</h4>
                                <small class="text-muted">资讯文章</small>
                            </div>
                            <div class="col-6">
                                <h4 class="text-warning mb-1">45</h4>
                                <small class="text-muted">成功案例</small>
                            </div>
                            <div class="col-6">
                                <h4 class="text-info mb-1">12,580</h4>
                                <small class="text-muted">访问量</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- SEO设置 -->
        <div class="card mb-4">
            <div class="card-header">
                <h5 class="mb-0">
                    <i class="fas fa-search text-secondary me-2"></i>首页SEO设置
                </h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="homePageTitle" class="form-label">页面标题</label>
                            <input type="text" class="form-control" id="homePageTitle" value="VisNDT - 专业无损检测设备供应商">
                        </div>
                        <div class="mb-3">
                            <label for="homePageKeywords" class="form-label">关键词</label>
                            <input type="text" class="form-control" id="homePageKeywords" value="无损检测,内窥镜,工业检测,VisNDT">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="homePageDescription" class="form-label">页面描述</label>
                            <textarea class="form-control" id="homePageDescription" rows="4">VisNDT是专业的无损检测设备供应商，提供工业内窥镜、检测相机等高质量产品和解决方案。</textarea>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
}

function showBannerManager() {
    console.log('showBannerManager 被调用');
    updatePageTitle('轮播图管理', '管理首页轮播图');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">轮播图管理</h4>
                <p class="text-muted mb-0">管理首页轮播图</p>
            </div>
            <div>
                <button class="btn btn-outline-secondary me-2" onclick="showHomepageManager()">
                    <i class="fas fa-arrow-left me-2"></i>返回首页管理
                </button>
                <button class="btn btn-primary" onclick="addNewBanner()">
                    <i class="fas fa-plus me-2"></i>添加轮播图
                </button>
            </div>
        </div>

        <!-- 轮播图列表 -->
        <div class="row" id="bannerList">
            <div class="col-lg-4 mb-4">
                <div class="card">
                    <div class="position-relative">
                        <img src="/images/banner/banner1.jpg" class="card-img-top" style="height: 200px; object-fit: cover;" alt="轮播图1">
                        <div class="position-absolute top-0 end-0 p-2">
                            <span class="badge bg-success">启用</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">无损检测技术展示</h6>
                        <p class="card-text text-muted small">展示公司核心无损检测技术和设备</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">排序: 1</small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="editBanner(1)">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteBanner(1)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4 mb-4">
                <div class="card">
                    <div class="position-relative">
                        <img src="/images/banner/banner2.jpg" class="card-img-top" style="height: 200px; object-fit: cover;" alt="轮播图2">
                        <div class="position-absolute top-0 end-0 p-2">
                            <span class="badge bg-success">启用</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">产品展示</h6>
                        <p class="card-text text-muted small">展示公司主要产品系列</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">排序: 2</small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="editBanner(2)">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteBanner(2)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4 mb-4">
                <div class="card">
                    <div class="position-relative">
                        <img src="/images/banner/banner3.jpg" class="card-img-top" style="height: 200px; object-fit: cover;" alt="轮播图3">
                        <div class="position-absolute top-0 end-0 p-2">
                            <span class="badge bg-warning">禁用</span>
                        </div>
                    </div>
                    <div class="card-body">
                        <h6 class="card-title">解决方案</h6>
                        <p class="card-text text-muted small">展示行业解决方案</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-muted">排序: 3</small>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="editBanner(3)">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteBanner(3)">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 轮播图设置 -->
        <div class="card">
            <div class="card-header">
                <h5 class="mb-0">轮播图设置</h5>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="bannerAutoPlay" class="form-label">自动播放</label>
                            <select class="form-select" id="bannerAutoPlay">
                                <option value="true" selected>启用</option>
                                <option value="false">禁用</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="bannerInterval" class="form-label">播放间隔（秒）</label>
                            <input type="number" class="form-control" id="bannerInterval" value="5" min="1" max="10">
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="mb-3">
                            <label for="bannerHeight" class="form-label">轮播图高度（px）</label>
                            <input type="number" class="form-control" id="bannerHeight" value="400" min="200" max="800">
                        </div>
                        <div class="mb-3">
                            <label for="bannerEffect" class="form-label">切换效果</label>
                            <select class="form-select" id="bannerEffect">
                                <option value="slide" selected>滑动</option>
                                <option value="fade">淡入淡出</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="text-end">
                    <button class="btn btn-success" onclick="saveBannerSettings()">
                        <i class="fas fa-save me-2"></i>保存设置
                    </button>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
}

function showFeaturedProducts() {
    console.log('showFeaturedProducts 被调用');
    alert('推荐产品功能');
    updatePageTitle('推荐产品', '管理推荐产品');
}

function showCompanyInfo() {
    console.log('showCompanyInfo 被调用');
    alert('公司信息功能');
    updatePageTitle('公司信息', '管理公司信息');
}

// 资讯管理函数
async function showNewsList() {
    console.log('showNewsList 被调用');
    updatePageTitle('资讯列表', '管理网站资讯内容');

    // 确保数据加载器已初始化
    await ensureDataLoaderInitialized();

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">资讯列表</h4>
                <p class="text-muted mb-0">管理网站资讯内容</p>
            </div>
            <button class="btn btn-primary" onclick="createNews()">
                <i class="fas fa-plus me-2"></i>发布新资讯
            </button>
        </div>

        <!-- 搜索和筛选 -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-4">
                        <input type="text" class="form-control" placeholder="搜索资讯标题..." id="newsSearchInput">
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" id="newsCategoryFilter">
                            <option value="">所有分类</option>
                            <option value="company">公司动态</option>
                            <option value="industry">行业资讯</option>
                            <option value="technology">技术文章</option>
                            <option value="product">产品资讯</option>
                        </select>
                    </div>
                    <div class="col-md-3">
                        <select class="form-select" id="newsStatusFilter">
                            <option value="">所有状态</option>
                            <option value="published">已发布</option>
                            <option value="draft">草稿</option>
                            <option value="archived">已归档</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-primary w-100" onclick="filterNews()">
                            <i class="fas fa-search me-2"></i>搜索
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 资讯列表 -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th width="50">
                                    <input type="checkbox" class="form-check-input" id="selectAllNews">
                                </th>
                                <th>标题</th>
                                <th width="120">分类</th>
                                <th width="100">状态</th>
                                <th width="120">发布时间</th>
                                <th width="100">浏览量</th>
                                <th width="150">操作</th>
                            </tr>
                        </thead>
                        <tbody id="newsTableBody">
                            <!-- 动态生成的资讯列表 -->
                        </tbody>
                    </table>
                </div>

                <!-- 分页 -->
                <nav aria-label="资讯分页" class="mt-4">
                    <ul class="pagination justify-content-center" id="newsPagination">
                        <!-- 动态生成的分页 -->
                    </ul>
                </nav>
            </div>
        </div>

        <!-- 批量操作 -->
        <div class="card mt-3" id="batchActionsCard" style="display: none;">
            <div class="card-body">
                <div class="d-flex align-items-center gap-3">
                    <span class="text-muted">已选择 <span id="selectedCount">0</span> 项</span>
                    <button class="btn btn-sm btn-outline-success" onclick="batchPublishNews()">批量发布</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="batchArchiveNews()">批量归档</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="batchDeleteNews()">批量删除</button>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadNewsList();
}

// 加载资讯列表
async function loadNewsList() {
    // 确保数据加载器已初始化
    await ensureDataLoaderInitialized();

    // 从数据加载器获取资讯数据
    const dataLoader = window.contentDataLoader;
    let newsData = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.news) {
        newsData = dataLoader.contentData.news.map((news, index) => ({
            id: news.id || `news-${index + 1}`,
            title: news.title,
            summary: news.summary,
            categories: news.categories || ['技术动态'],
            status: news.status || 'published',
            statusName: news.status === 'published' ? '已发布' : '草稿',
            publishDate: news.publishDate || new Date().toISOString().split('T')[0],
            author: news.author || '编辑部',
            views: news.views || Math.floor(Math.random() * 1000) + 100,
            thumbnail: news.thumbnail || '/images/news/default.jpg',
            featured: news.featured || false,
            tags: news.tags || []
        }));
    } else {
        // 备用数据
        newsData = [
            {
                id: 'news-001',
                title: '2024年工业内窥镜技术发展趋势',
                summary: '分析工业内窥镜在新一年的技术发展方向和市场趋势',
                categories: ['技术动态'],
                status: 'published',
                statusName: '已发布',
                publishDate: '2024-01-15',
                author: '技术部',
                views: 1250,
                thumbnail: '/images/news/tech-trend-2024.jpg',
                featured: true,
                tags: ['工业内窥镜', '技术趋势', '工业4.0']
            },
            {
                id: 'news-002',
                title: '参展2024年上海工博会圆满成功',
                summary: '公司携最新产品参展上海工博会，获得广泛关注',
                categories: ['展会资讯'],
                status: 'published',
                statusName: '已发布',
                publishDate: '2024-01-12',
                author: '市场部',
                views: 890,
                thumbnail: '/images/news/expo-2024.jpg',
                featured: false,
                tags: ['工博会', '展会', '新产品']
            }
        ];
    }

    // 渲染资讯列表
    renderNewsList(newsData);

    // 绑定复选框事件
    bindNewsCheckboxEvents();

    console.log(`资讯列表加载完成: ${newsData.length} 条资讯`);
}

// 渲染资讯列表
function renderNewsList(newsData) {
    const tbody = document.getElementById('newsTableBody');
    if (!tbody) return;

    if (newsData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-newspaper fa-3x mb-3"></i>
                        <p class="mb-0">暂无资讯数据</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = newsData.map(news => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input news-checkbox" value="${news.id}">
            </td>
            <td>
                <img src="${news.thumbnail}" alt="${news.title}" class="img-thumbnail" style="width: 60px; height: 40px; object-fit: cover;">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <h6 class="mb-1">${news.title}</h6>
                        <small class="text-muted">${news.summary}</small>
                        ${news.featured ? '<span class="badge bg-warning ms-2">推荐</span>' : ''}
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-secondary">${news.categories[0]}</span>
            </td>
            <td>${news.author}</td>
            <td>
                <span class="badge ${news.status === 'published' ? 'bg-success' : 'bg-warning'}">
                    ${news.statusName}
                </span>
            </td>
            <td>${news.publishDate}</td>
            <td>${news.views}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editNews('${news.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="previewNews('${news.id}')" title="预览">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteNews('${news.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 绑定资讯复选框事件
function bindNewsCheckboxEvents() {
    const selectAllCheckbox = document.getElementById('selectAllNews');
    const newsCheckboxes = document.querySelectorAll('.news-checkbox');
    const batchActionsCard = document.getElementById('batchActionsCard');
    const selectedCountSpan = document.getElementById('selectedCount');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            newsCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateNewsSelectedCount();
        });
    }

    newsCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateNewsSelectedCount);
    });

    function updateNewsSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.news-checkbox:checked');
        const count = selectedCheckboxes.length;

        if (selectedCountSpan) {
            selectedCountSpan.textContent = count;
        }

        if (batchActionsCard) {
            batchActionsCard.style.display = count > 0 ? 'block' : 'none';
        }

        if (selectAllCheckbox) {
            selectAllCheckbox.indeterminate = count > 0 && count < newsCheckboxes.length;
            selectAllCheckbox.checked = count === newsCheckboxes.length && count > 0;
        }
    }
}

function createNews() {
    console.log('createNews 被调用');
    updatePageTitle('发布新资讯', '创建和发布网站资讯内容');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">发布新资讯</h4>
                <p class="text-muted mb-0">创建和发布网站资讯内容</p>
            </div>
            <div>
                <button class="btn btn-outline-secondary me-2" onclick="showNewsList()">
                    <i class="fas fa-arrow-left me-2"></i>返回列表
                </button>
                <button class="btn btn-success" onclick="saveNews()">
                    <i class="fas fa-save me-2"></i>保存并发布
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- 基本信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newsTitle" class="form-label">资讯标题 <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="newsTitle" placeholder="请输入资讯标题">
                        </div>

                        <div class="row mb-3">
                            <div class="col-md-6">
                                <label for="newsCategory" class="form-label">分类 <span class="text-danger">*</span></label>
                                <select class="form-select" id="newsCategory">
                                    <option value="">请选择分类</option>
                                    <option value="company">公司动态</option>
                                    <option value="industry">行业资讯</option>
                                    <option value="technology">技术文章</option>
                                    <option value="product">产品资讯</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label for="newsAuthor" class="form-label">作者</label>
                                <input type="text" class="form-control" id="newsAuthor" value="管理员" placeholder="请输入作者">
                            </div>
                        </div>

                        <div class="mb-3">
                            <label for="newsExcerpt" class="form-label">摘要</label>
                            <textarea class="form-control" id="newsExcerpt" rows="3" placeholder="请输入资讯摘要（可选）"></textarea>
                        </div>

                        <div class="mb-3">
                            <label for="newsTags" class="form-label">标签</label>
                            <input type="text" class="form-control" id="newsTags" placeholder="请输入标签，用逗号分隔">
                            <div class="form-text">例如：无损检测,技术创新,航空航天</div>
                        </div>
                    </div>
                </div>

                <!-- 内容编辑 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">内容编辑</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newsContent" class="form-label">正文内容 <span class="text-danger">*</span></label>
                            <div class="border rounded" style="min-height: 400px;">
                                <div class="p-3 border-bottom bg-light">
                                    <div class="btn-toolbar" role="toolbar">
                                        <div class="btn-group me-2" role="group">
                                            <button type="button" class="btn btn-sm btn-outline-secondary" title="粗体">
                                                <i class="fas fa-bold"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-secondary" title="斜体">
                                                <i class="fas fa-italic"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-secondary" title="下划线">
                                                <i class="fas fa-underline"></i>
                                            </button>
                                        </div>
                                        <div class="btn-group me-2" role="group">
                                            <button type="button" class="btn btn-sm btn-outline-secondary" title="插入图片">
                                                <i class="fas fa-image"></i>
                                            </button>
                                            <button type="button" class="btn btn-sm btn-outline-secondary" title="插入链接">
                                                <i class="fas fa-link"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <textarea class="form-control border-0" id="newsContent" rows="15" placeholder="请输入资讯正文内容..."></textarea>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <!-- 发布设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">发布设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newsStatus" class="form-label">状态</label>
                            <select class="form-select" id="newsStatus">
                                <option value="draft">草稿</option>
                                <option value="published">立即发布</option>
                                <option value="scheduled">定时发布</option>
                            </select>
                        </div>

                        <div class="mb-3" id="publishDateGroup" style="display: none;">
                            <label for="publishDate" class="form-label">发布时间</label>
                            <input type="datetime-local" class="form-control" id="publishDate">
                        </div>

                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="allowComments" checked>
                                <label class="form-check-label" for="allowComments">
                                    允许评论
                                </label>
                            </div>
                        </div>

                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="featuredNews">
                                <label class="form-check-label" for="featuredNews">
                                    设为推荐资讯
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 封面图片 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">封面图片</h5>
                    </div>
                    <div class="card-body">
                        <div class="text-center">
                            <div class="border rounded p-4 mb-3" style="min-height: 200px; background-color: #f8f9fa;">
                                <i class="fas fa-image fa-3x text-muted mb-3"></i>
                                <p class="text-muted">点击上传封面图片</p>
                                <button class="btn btn-outline-primary btn-sm" onclick="uploadCoverImage()">
                                    <i class="fas fa-upload me-2"></i>选择图片
                                </button>
                            </div>
                            <small class="text-muted">建议尺寸：800x400px，支持 JPG、PNG 格式</small>
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card">
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="saveNews()">
                                <i class="fas fa-save me-2"></i>保存并发布
                            </button>
                            <button class="btn btn-outline-secondary" onclick="saveDraft()">
                                <i class="fas fa-file-alt me-2"></i>保存为草稿
                            </button>
                            <button class="btn btn-outline-info" onclick="previewNews()">
                                <i class="fas fa-eye me-2"></i>预览
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);

    // 绑定状态选择事件
    const statusSelect = document.getElementById('newsStatus');
    const publishDateGroup = document.getElementById('publishDateGroup');

    statusSelect.addEventListener('change', function() {
        if (this.value === 'scheduled') {
            publishDateGroup.style.display = 'block';
        } else {
            publishDateGroup.style.display = 'none';
        }
    });
}

function showNewsCategories() {
    console.log('showNewsCategories 被调用');
    alert('资讯分类管理功能');
    updatePageTitle('资讯分类管理', '管理资讯分类');
}

function showNewsDrafts() {
    console.log('showNewsDrafts 被调用');
    alert('草稿箱功能');
    updatePageTitle('草稿箱', '管理草稿资讯');
}

// 产品管理函数
function showProductsList() {
    console.log('showProductsList 被调用');
    updatePageTitle('产品列表', '管理产品信息');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">产品列表</h4>
                <p class="text-muted mb-0">管理产品信息</p>
            </div>
            <button class="btn btn-primary" onclick="createProduct()">
                <i class="fas fa-plus me-2"></i>添加新产品
            </button>
        </div>

        <!-- 产品统计 -->
        <div class="row mb-4" id="productStatsRow">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title mb-1">总产品数</h6>
                                <h3 class="mb-0" id="totalProductsCount">0</h3>
                            </div>
                            <i class="fas fa-box fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title mb-1">已发布</h6>
                                <h3 class="mb-0" id="publishedProductsCount">0</h3>
                            </div>
                            <i class="fas fa-check-circle fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title mb-1">草稿</h6>
                                <h3 class="mb-0" id="draftProductsCount">0</h3>
                            </div>
                            <i class="fas fa-edit fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h6 class="card-title mb-1">推荐产品</h6>
                                <h3 class="mb-0" id="featuredProductsCount">0</h3>
                            </div>
                            <i class="fas fa-star fa-2x opacity-75"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 搜索和筛选 -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <input type="text" class="form-control" placeholder="搜索产品名称..." id="productSearchInput">
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="productCategoryFilter">
                            <option value="">所有分类</option>
                            <option value="electronic-endoscope">电子内窥镜</option>
                            <option value="fiber-endoscope">光纤内窥镜</option>
                            <option value="optical-endoscope">光学内窥镜</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="productSupplierFilter">
                            <option value="">所有供应商</option>
                            <option value="深圳市微视光电科技有限公司">深圳市微视光电科技有限公司</option>
                            <option value="北京精密仪器有限公司">北京精密仪器有限公司</option>
                            <option value="上海光学设备厂">上海光学设备厂</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="productStatusFilter">
                            <option value="">所有状态</option>
                            <option value="published">已发布</option>
                            <option value="draft">草稿</option>
                            <option value="archived">已下架</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-primary w-100" onclick="filterProducts()">
                            <i class="fas fa-search me-2"></i>搜索
                        </button>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-secondary w-100" onclick="exportProducts()" title="导出产品">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 产品列表 -->
        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th width="50">
                                    <input type="checkbox" class="form-check-input" id="selectAllProducts">
                                </th>
                                <th width="80">图片</th>
                                <th>产品名称</th>
                                <th width="120">型号</th>
                                <th width="120">供应商</th>
                                <th width="120">分类</th>
                                <th width="80">状态</th>
                                <th width="100">发布时间</th>
                                <th width="150">操作</th>
                            </tr>
                        </thead>
                        <tbody id="productTableBody">
                            <!-- 动态生成的产品列表 -->
                        </tbody>
                    </table>
                </div>

                <!-- 分页 -->
                <div class="d-flex justify-content-between align-items-center mt-4">
                    <div class="d-flex align-items-center">
                        <span class="text-muted me-2">每页显示</span>
                        <select class="form-select form-select-sm" id="productPageSize" onchange="changeProductPageSize()" style="width: auto;">
                            <option value="10">10</option>
                            <option value="20">20</option>
                            <option value="50">50</option>
                            <option value="100">100</option>
                        </select>
                        <span class="text-muted ms-2">条记录</span>
                    </div>
                    <nav aria-label="产品分页">
                        <ul class="pagination pagination-sm mb-0" id="productPagination">
                            <!-- 动态生成的分页 -->
                        </ul>
                    </nav>
                    <div class="text-muted" id="productPaginationInfo">
                        <!-- 分页信息 -->
                    </div>
                </div>
            </div>
        </div>

        <!-- 批量操作 -->
        <div class="card mt-3" id="productBatchActionsCard" style="display: none;">
            <div class="card-body">
                <div class="d-flex align-items-center gap-3">
                    <span class="text-muted">已选择 <span id="productSelectedCount">0</span> 项</span>
                    <button class="btn btn-sm btn-outline-success" onclick="batchPublishProducts()">批量发布</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="batchArchiveProducts()">批量下架</button>
                    <button class="btn btn-sm btn-outline-primary" onclick="batchDuplicateProducts()">批量复制</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="batchDeleteProducts()">批量删除</button>
                    <button class="btn btn-sm btn-outline-info" onclick="batchExportProducts()">批量导出</button>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);

    // 异步加载产品列表
    loadProductsList().then(() => {
        console.log('产品列表加载完成');
    }).catch(error => {
        console.error('产品列表加载失败:', error);
        showNotification('产品列表加载失败', 'danger');
    });
}

// 分页相关变量
let currentProductPage = 1;
let productPageSize = 10;
let totalProducts = 0;
let filteredProducts = [];

// 确保数据加载器已初始化
async function ensureDataLoaderInitialized() {
    try {
        if (!window.contentDataLoader) {
            console.log('初始化数据加载器...');
            if (typeof ContentDataLoader === 'undefined') {
                throw new Error('ContentDataLoader 类未定义');
            }
            window.contentDataLoader = new ContentDataLoader();
            await window.contentDataLoader.loadAllData();
            console.log('数据加载器初始化完成，产品数量:', window.contentDataLoader.contentData.products?.length || 0);
        } else if (!window.contentDataLoader.contentData || !window.contentDataLoader.contentData.products || window.contentDataLoader.contentData.products.length === 0) {
            console.log('重新加载产品数据...');
            await window.contentDataLoader.loadProducts();
            console.log('产品数据重新加载完成，产品数量:', window.contentDataLoader.contentData.products?.length || 0);
        } else {
            console.log('数据加载器已就绪，产品数量:', window.contentDataLoader.contentData.products?.length || 0);
        }
    } catch (error) {
        console.error('数据加载器初始化失败:', error);
        // 创建一个最小的备用数据加载器
        window.contentDataLoader = {
            contentData: {
                products: [],
                news: [],
                cases: [],
                categories: [],
                suppliers: []
            }
        };
        throw error;
    }
}

// 更新产品统计信息
function updateProductStats() {
    const dataLoader = window.contentDataLoader;
    let products = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
        products = dataLoader.contentData.products;
    } else {
        // 使用备用数据进行统计
        products = [
            { status: 'published', featured: true },
            { status: 'published', featured: false },
            { status: 'published', featured: false },
            { status: 'published', featured: false },
            { status: 'published', featured: true },
            { status: 'published', featured: true }
        ];
    }

    // 计算统计数据
    const totalCount = products.length;
    const publishedCount = products.filter(p => p.status === 'published').length;
    const draftCount = products.filter(p => p.status === 'draft').length;
    const featuredCount = products.filter(p => p.featured === true).length;

    // 更新页面显示
    const totalElement = document.getElementById('totalProductsCount');
    const publishedElement = document.getElementById('publishedProductsCount');
    const draftElement = document.getElementById('draftProductsCount');
    const featuredElement = document.getElementById('featuredProductsCount');

    if (totalElement) totalElement.textContent = totalCount;
    if (publishedElement) publishedElement.textContent = publishedCount;
    if (draftElement) draftElement.textContent = draftCount;
    if (featuredElement) featuredElement.textContent = featuredCount;

    console.log('产品统计更新:', {
        总数: totalCount,
        已发布: publishedCount,
        草稿: draftCount,
        推荐: featuredCount
    });
}

function createProduct() {
    console.log('createProduct 被调用');
    showAddProductModal();
}

function showAddProductModal() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'addProductModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-plus me-2"></i>添加新产品
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="addProductForm">
                        <div class="row">
                            <!-- 基本信息 -->
                            <div class="col-md-8">
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">基本信息</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">产品名称 <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="productTitle" required>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">产品型号 <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="productModel" required>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">产品描述</label>
                                            <textarea class="form-control" id="productSummary" rows="3" placeholder="简要描述产品特点和用途"></textarea>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">主要分类 <span class="text-danger">*</span></label>
                                                <select class="form-select" id="productPrimaryCategory" required>
                                                    <option value="">请选择分类</option>
                                                    <option value="electronic-endoscope">电子内窥镜</option>
                                                    <option value="fiber-endoscope">光纤内窥镜</option>
                                                    <option value="optical-endoscope">光学内窥镜</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">次要分类</label>
                                                <select class="form-select" id="productSecondaryCategory">
                                                    <option value="">请选择次要分类</option>
                                                    <option value="industrial">工业检测</option>
                                                    <option value="medical">医疗检测</option>
                                                    <option value="automotive">汽车检测</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">产品系列</label>
                                                <select class="form-select" id="productSeries">
                                                    <option value="">请选择系列</option>
                                                    <option value="K系列">K系列</option>
                                                    <option value="P系列">P系列</option>
                                                    <option value="S系列">S系列</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">供应商</label>
                                                <select class="form-select" id="productSupplier">
                                                    <option value="深圳市微视光电科技有限公司">深圳市微视光电科技有限公司</option>
                                                    <option value="北京精密仪器有限公司">北京精密仪器有限公司</option>
                                                    <option value="上海光学设备厂">上海光学设备厂</option>
                                                </select>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">产品状态</label>
                                                <select class="form-select" id="productStatus">
                                                    <option value="published">已发布</option>
                                                    <option value="draft">草稿</option>
                                                    <option value="archived">已归档</option>
                                                </select>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">是否推荐</label>
                                                <select class="form-select" id="productFeatured">
                                                    <option value="false">否</option>
                                                    <option value="true">是</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 产品参数 -->
                                <div class="card mb-4">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">产品参数</h6>
                                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addParameterRow()">
                                            <i class="fas fa-plus me-1"></i>添加参数
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <div id="productParametersContainer">
                                            <div class="row mb-2 parameter-row">
                                                <div class="col-md-4">
                                                    <input type="text" class="form-control" placeholder="参数名称" name="paramName[]">
                                                </div>
                                                <div class="col-md-6">
                                                    <input type="text" class="form-control" placeholder="参数值" name="paramValue[]">
                                                </div>
                                                <div class="col-md-2">
                                                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeParameterRow(this)">
                                                        <i class="fas fa-trash"></i>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 应用场景 -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">应用场景</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label class="form-label">应用场景描述</label>
                                            <textarea class="form-control" id="productApplicationScenarios" rows="6" placeholder="详细描述产品的应用场景，支持Markdown格式"></textarea>
                                        </div>
                                    </div>
                                </div>

                                <!-- 相关产品和下载资料 -->
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">相关信息</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">相关产品</label>
                                                <textarea class="form-control" id="productRelatedProducts" rows="3" placeholder="输入相关产品ID，每行一个"></textarea>
                                                <small class="text-muted">每行输入一个产品ID</small>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">下载资料</label>
                                                <div id="dataDownloadContainer">
                                                    <div class="row mb-2 download-row">
                                                        <div class="col-md-5">
                                                            <input type="text" class="form-control" placeholder="文件标题" name="downloadTitle[]">
                                                        </div>
                                                        <div class="col-md-5">
                                                            <input type="text" class="form-control" placeholder="文件路径" name="downloadPath[]">
                                                        </div>
                                                        <div class="col-md-2">
                                                            <button type="button" class="btn btn-outline-primary btn-sm" onclick="addDownloadRow()">
                                                                <i class="fas fa-plus"></i>
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 图片上传 -->
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="mb-0">产品图片</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label class="form-label">主图</label>
                                            <div class="image-upload-area" onclick="document.getElementById('mainImageInput').click()">
                                                <div class="upload-placeholder">
                                                    <i class="fas fa-cloud-upload-alt fa-2x mb-2"></i>
                                                    <p>点击上传主图</p>
                                                </div>
                                                <img id="mainImagePreview" style="display: none; width: 100%; height: 200px; object-fit: cover;">
                                            </div>
                                            <input type="file" id="mainImageInput" accept="image/*" style="display: none;" onchange="previewMainImage(this)">
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">产品图库</label>
                                            <div class="image-gallery" id="productGallery">
                                                <!-- 图库图片将在这里显示 -->
                                            </div>
                                            <button type="button" class="btn btn-outline-primary btn-sm w-100" onclick="document.getElementById('galleryImageInput').click()">
                                                <i class="fas fa-plus me-1"></i>添加图片
                                            </button>
                                            <input type="file" id="galleryImageInput" accept="image/*" multiple style="display: none;" onchange="addGalleryImages(this)">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-success" onclick="saveNewProduct()">
                        <i class="fas fa-save me-1"></i>保存产品
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 添加产品参数行
function addParameterRow() {
    const container = document.getElementById('productParametersContainer');
    const newRow = document.createElement('div');
    newRow.className = 'row mb-2 parameter-row';
    newRow.innerHTML = `
        <div class="col-md-4">
            <input type="text" class="form-control" placeholder="参数名称" name="paramName[]">
        </div>
        <div class="col-md-6">
            <input type="text" class="form-control" placeholder="参数值" name="paramValue[]">
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeParameterRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(newRow);
}

// 移除产品参数行
function removeParameterRow(button) {
    const row = button.closest('.parameter-row');
    row.remove();
}

// 预览主图
function previewMainImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('mainImagePreview');
            const placeholder = input.parentElement.querySelector('.upload-placeholder');

            preview.src = e.target.result;
            preview.style.display = 'block';
            placeholder.style.display = 'none';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// 添加图库图片
function addGalleryImages(input) {
    if (input.files && input.files.length > 0) {
        const gallery = document.getElementById('productGallery');

        Array.from(input.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'gallery-item mb-2';
                imageDiv.innerHTML = `
                    <div class="position-relative">
                        <img src="${e.target.result}" class="img-thumbnail" style="width: 100%; height: 80px; object-fit: cover;">
                        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0" onclick="removeGalleryImage(this)" style="transform: translate(50%, -50%);">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                gallery.appendChild(imageDiv);
            };
            reader.readAsDataURL(file);
        });
    }
}

// 移除图库图片
function removeGalleryImage(button) {
    const imageDiv = button.closest('.gallery-item');
    imageDiv.remove();
}

// 添加下载资料行
function addDownloadRow() {
    const container = document.getElementById('dataDownloadContainer');
    const newRow = document.createElement('div');
    newRow.className = 'row mb-2 download-row';
    newRow.innerHTML = `
        <div class="col-md-5">
            <input type="text" class="form-control" placeholder="文件标题" name="downloadTitle[]">
        </div>
        <div class="col-md-5">
            <input type="text" class="form-control" placeholder="文件路径" name="downloadPath[]">
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeDownloadRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(newRow);
}

// 移除下载资料行
function removeDownloadRow(button) {
    const row = button.closest('.download-row');
    row.remove();
}

// 保存新产品
async function saveNewProduct() {
    const form = document.getElementById('addProductForm');
    const formData = new FormData(form);

    // 验证必填字段
    const title = document.getElementById('productTitle').value.trim();
    const model = document.getElementById('productModel').value.trim();
    const primaryCategory = document.getElementById('productPrimaryCategory').value;

    if (!title || !model || !primaryCategory) {
        showNotification('请填写所有必填字段', 'warning');
        return;
    }

    try {
        // 收集产品数据
        const productData = {
            id: generateProductId(model),
            title: title,
            model: model,
            summary: document.getElementById('productSummary').value.trim(),
            primary_category: primaryCategory,
            secondary_category: document.getElementById('productSecondaryCategory').value,
            series: document.getElementById('productSeries').value,
            supplier: document.getElementById('productSupplier').value,
            status: document.getElementById('productStatus').value,
            featured: document.getElementById('productFeatured').value === 'true',
            published: new Date().toISOString(),
            thumbnail: '/images/products/default.jpg', // 默认图片，实际应该上传
            parameters: collectProductParameters(),
            gallery: [], // 实际应该处理上传的图片
            application_scenarios: document.getElementById('productApplicationScenarios').value.trim(),
            related_products: collectRelatedProducts(),
            data_download: collectDataDownload()
        };

        // 使用文件操作模块保存产品
        if (window.fileOperations) {
            await window.fileOperations.createProduct(productData);
        }

        // 添加到本地数据
        const dataLoader = window.contentDataLoader;
        if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
            dataLoader.contentData.products.push(productData);
        }

        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('addProductModal'));
        modal.hide();

        // 显示成功消息
        showNotification(`产品"${title}"创建成功`, 'success');

        // 刷新产品列表
        loadProductsList();

    } catch (error) {
        console.error('保存产品失败:', error);
        showNotification(`保存产品失败: ${error.message}`, 'danger');
    }
}

// 生成产品ID
function generateProductId(model) {
    const timestamp = Date.now();
    const cleanModel = model.toLowerCase().replace(/[^a-z0-9]/g, '-');
    return `${cleanModel}-${timestamp}`;
}

// 收集产品参数
function collectProductParameters() {
    const parameters = [];
    const paramNames = document.querySelectorAll('input[name="paramName[]"]');
    const paramValues = document.querySelectorAll('input[name="paramValue[]"]');

    for (let i = 0; i < paramNames.length; i++) {
        const name = paramNames[i].value.trim();
        const value = paramValues[i].value.trim();

        if (name && value) {
            parameters.push({ name, value });
        }
    }

    return parameters;
}

// 收集相关产品
function collectRelatedProducts() {
    const relatedProductsText = document.getElementById('productRelatedProducts').value.trim();
    if (!relatedProductsText) return [];

    return relatedProductsText.split('\n')
        .map(line => line.trim())
        .filter(line => line.length > 0);
}

// 收集下载资料
function collectDataDownload() {
    const downloads = [];
    const downloadTitles = document.querySelectorAll('input[name="downloadTitle[]"]');
    const downloadPaths = document.querySelectorAll('input[name="downloadPath[]"]');

    for (let i = 0; i < downloadTitles.length; i++) {
        const title = downloadTitles[i].value.trim();
        const path = downloadPaths[i].value.trim();

        if (title && path) {
            downloads.push({
                file_title: title,
                file_path: path
            });
        }
    }

    return downloads;
}

function createProductOld() {
    console.log('createProduct 被调用');
    updatePageTitle('添加产品', '创建新产品');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">添加产品</h4>
                <p class="text-muted mb-0">创建新产品</p>
            </div>
            <div>
                <button class="btn btn-outline-secondary me-2" onclick="showProductsList()">
                    <i class="fas fa-arrow-left me-2"></i>返回列表
                </button>
                <button class="btn btn-success" onclick="saveNewProduct()">
                    <i class="fas fa-save me-2"></i>保存产品
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- 基本信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newProductTitle" class="form-label">产品标题 <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="newProductTitle" placeholder="请输入产品标题">
                        </div>
                        <div class="mb-3">
                            <label for="newProductSummary" class="form-label">产品简介</label>
                            <textarea class="form-control" id="newProductSummary" rows="3" placeholder="请输入产品简介"></textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="newProductModel" class="form-label">产品型号 <span class="text-danger">*</span></label>
                                    <input type="text" class="form-control" id="newProductModel" placeholder="请输入产品型号">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="newProductSeries" class="form-label">产品系列</label>
                                    <select class="form-select" id="newProductSeries">
                                        <option value="">请选择系列</option>
                                        <option value="K系列">K系列</option>
                                        <option value="P系列">P系列</option>
                                        <option value="DZ系列">DZ系列</option>
                                        <option value="S系列">S系列</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="newProductCategory" class="form-label">主分类</label>
                                    <select class="form-select" id="newProductCategory">
                                        <option value="">请选择主分类</option>
                                        <option value="电子内窥镜">电子内窥镜</option>
                                        <option value="光纤内窥镜">光纤内窥镜</option>
                                        <option value="光学内窥镜">光学内窥镜</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="newProductSecondaryCategory" class="form-label">次分类</label>
                                    <select class="form-select" id="newProductSecondaryCategory">
                                        <option value="">请选择次分类</option>
                                        <option value="工业视频内窥镜">工业视频内窥镜</option>
                                        <option value="医疗内窥镜">医疗内窥镜</option>
                                        <option value="汽车检测内窥镜">汽车检测内窥镜</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="newProductSupplier" class="form-label">供应商</label>
                            <input type="text" class="form-control" id="newProductSupplier"
                                   value="深圳市微视光电科技有限公司" placeholder="请输入供应商名称">
                        </div>
                    </div>
                </div>

                <!-- 产品参数 -->
                <div class="card mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">产品参数</h5>
                        <button class="btn btn-sm btn-outline-primary" onclick="addNewProductParameter()">
                            <i class="fas fa-plus me-1"></i>添加参数
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="newProductParameters">
                            <div class="row mb-2 parameter-row">
                                <div class="col-md-4">
                                    <input type="text" class="form-control" placeholder="参数名称">
                                </div>
                                <div class="col-md-6">
                                    <input type="text" class="form-control" placeholder="参数值">
                                </div>
                                <div class="col-md-2">
                                    <button class="btn btn-outline-danger btn-sm w-100" onclick="removeParameter(this)">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <!-- 发布设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">发布设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newProductStatus" class="form-label">状态</label>
                            <select class="form-select" id="newProductStatus">
                                <option value="draft">草稿</option>
                                <option value="published">已发布</option>
                                <option value="archived">已归档</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="newProductPublished" class="form-label">发布时间</label>
                            <input type="datetime-local" class="form-control" id="newProductPublished"
                                   value="${new Date().toISOString().slice(0, 16)}">
                        </div>
                    </div>
                </div>

                <!-- 产品图片 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">产品图片</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newProductThumbnail" class="form-label">缩略图URL</label>
                            <input type="text" class="form-control" id="newProductThumbnail"
                                   placeholder="请输入图片URL">
                        </div>
                        <div class="text-center">
                            <img src="/images/placeholder.svg"
                                 class="img-fluid rounded" style="max-height: 200px;" alt="产品图片预览" id="newProductImagePreview">
                        </div>
                        <button class="btn btn-outline-primary btn-sm mt-2 w-100" onclick="uploadNewProductImage()">
                            <i class="fas fa-upload me-2"></i>上传图片
                        </button>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card">
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="saveNewProduct()">
                                <i class="fas fa-save me-2"></i>保存产品
                            </button>
                            <button class="btn btn-outline-secondary" onclick="showProductsList()">
                                <i class="fas fa-arrow-left me-2"></i>返回列表
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);

    // 绑定图片预览事件
    const thumbnailInput = document.getElementById('newProductThumbnail');
    const imagePreview = document.getElementById('newProductImagePreview');

    thumbnailInput.addEventListener('input', function() {
        if (this.value) {
            imagePreview.src = this.value;
        } else {
            imagePreview.src = '/images/placeholder.svg';
        }
    });
}

function showProductCategories() {
    console.log('showProductCategories 被调用');
    updatePageTitle('产品分类管理', '管理产品分类体系');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">产品分类管理</h4>
                <p class="text-muted mb-0">管理产品分类体系，包括主分类和子分类</p>
            </div>
            <button class="btn btn-primary" onclick="createProductCategory()">
                <i class="fas fa-plus me-2"></i>添加分类
            </button>
        </div>

        <!-- 分类统计 -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">主分类</h6>
                                <h3 class="mb-0" id="primaryCategoryCount">3</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-layer-group fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">子分类</h6>
                                <h3 class="mb-0" id="secondaryCategoryCount">8</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-tags fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">关联产品</h6>
                                <h3 class="mb-0" id="categoryProductCount">25</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-box fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">启用分类</h6>
                                <h3 class="mb-0" id="activeCategoryCount">11</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-check-circle fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 分类列表 -->
        <div class="card">
            <div class="card-header">
                <div class="row align-items-center">
                    <div class="col">
                        <h5 class="mb-0">分类列表</h5>
                    </div>
                    <div class="col-auto">
                        <div class="input-group">
                            <input type="text" class="form-control" id="categorySearchInput" placeholder="搜索分类..." onkeyup="filterCategories()">
                            <button class="btn btn-outline-secondary" onclick="filterCategories()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th width="50">
                                    <input type="checkbox" class="form-check-input" id="selectAllCategories">
                                </th>
                                <th>分类名称</th>
                                <th width="120">分类类型</th>
                                <th width="100">产品数量</th>
                                <th width="100">排序</th>
                                <th width="80">状态</th>
                                <th width="120">创建时间</th>
                                <th width="150">操作</th>
                            </tr>
                        </thead>
                        <tbody id="categoryTableBody">
                            <!-- 动态生成的分类列表 -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 批量操作 -->
        <div class="card mt-3" id="categoryBatchActionsCard" style="display: none;">
            <div class="card-body">
                <div class="d-flex align-items-center gap-3">
                    <span class="text-muted">已选择 <span id="categorySelectedCount">0</span> 项</span>
                    <button class="btn btn-sm btn-outline-success" onclick="batchEnableCategories()">批量启用</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="batchDisableCategories()">批量禁用</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="batchDeleteCategories()">批量删除</button>
                    <button class="btn btn-sm btn-outline-info" onclick="batchExportCategories()">批量导出</button>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadProductCategories();
}

// 加载产品分类数据
function loadProductCategories() {
    // 获取分类数据
    const dataLoader = window.contentDataLoader;
    let categoryData = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.categories) {
        categoryData = dataLoader.contentData.categories;
    } else {
        // 备用分类数据
        categoryData = [
            {
                id: 'electronic-endoscope',
                name: '电子内窥镜',
                type: 'primary',
                typeName: '主分类',
                description: '采用电子成像技术的内窥镜产品',
                productCount: 15,
                sort: 1,
                status: 'active',
                statusName: '启用',
                created: '2024-01-01',
                children: [
                    {
                        id: 'industrial-video',
                        name: '工业视频内窥镜',
                        type: 'secondary',
                        typeName: '子分类',
                        parent: 'electronic-endoscope',
                        productCount: 8,
                        sort: 1,
                        status: 'active',
                        statusName: '启用',
                        created: '2024-01-01'
                    },
                    {
                        id: 'medical-video',
                        name: '医疗视频内窥镜',
                        type: 'secondary',
                        typeName: '子分类',
                        parent: 'electronic-endoscope',
                        productCount: 7,
                        sort: 2,
                        status: 'active',
                        statusName: '启用',
                        created: '2024-01-01'
                    }
                ]
            },
            {
                id: 'fiber-endoscope',
                name: '光纤内窥镜',
                type: 'primary',
                typeName: '主分类',
                description: '采用光纤传输技术的内窥镜产品',
                productCount: 8,
                sort: 2,
                status: 'active',
                statusName: '启用',
                created: '2024-01-01',
                children: [
                    {
                        id: 'industrial-fiber',
                        name: '工业光纤内窥镜',
                        type: 'secondary',
                        typeName: '子分类',
                        parent: 'fiber-endoscope',
                        productCount: 5,
                        sort: 1,
                        status: 'active',
                        statusName: '启用',
                        created: '2024-01-01'
                    },
                    {
                        id: 'automotive-fiber',
                        name: '汽车检测内窥镜',
                        type: 'secondary',
                        typeName: '子分类',
                        parent: 'fiber-endoscope',
                        productCount: 3,
                        sort: 2,
                        status: 'active',
                        statusName: '启用',
                        created: '2024-01-01'
                    }
                ]
            },
            {
                id: 'optical-endoscope',
                name: '光学内窥镜',
                type: 'primary',
                typeName: '主分类',
                description: '采用光学成像技术的内窥镜产品',
                productCount: 2,
                sort: 3,
                status: 'active',
                statusName: '启用',
                created: '2024-01-01',
                children: [
                    {
                        id: 'precision-optical',
                        name: '精密光学内窥镜',
                        type: 'secondary',
                        typeName: '子分类',
                        parent: 'optical-endoscope',
                        productCount: 2,
                        sort: 1,
                        status: 'active',
                        statusName: '启用',
                        created: '2024-01-01'
                    }
                ]
            }
        ];
    }

    // 渲染分类表格
    renderCategoryTable(categoryData);

    // 更新统计信息
    updateCategoryStats(categoryData);

    // 绑定复选框事件
    bindCategoryCheckboxEvents();
}

// 渲染分类表格
function renderCategoryTable(categoryData) {
    const tbody = document.getElementById('categoryTableBody');
    if (!tbody) return;

    if (categoryData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-layer-group empty-icon"></i>
                        <div class="empty-title">暂无分类数据</div>
                        <div class="empty-description">点击上方"添加分类"按钮开始添加分类</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    let tableHTML = '';

    categoryData.forEach(category => {
        // 主分类行
        tableHTML += `
            <tr class="table-primary">
                <td>
                    <input type="checkbox" class="form-check-input category-checkbox" value="${category.id}">
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        <i class="fas fa-layer-group text-primary me-2"></i>
                        <strong>${category.name}</strong>
                        ${category.description ? `<small class="text-muted ms-2">${category.description}</small>` : ''}
                    </div>
                </td>
                <td><span class="badge bg-primary">${category.typeName}</span></td>
                <td><span class="badge bg-info">${category.productCount}</span></td>
                <td><span class="badge bg-secondary">${category.sort}</span></td>
                <td><span class="badge ${getCategoryStatusBadgeClass(category.status)}">${category.statusName}</span></td>
                <td><small class="text-muted">${category.created}</small></td>
                <td>
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="editCategory('${category.id}')" title="编辑">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-outline-info" onclick="viewCategoryProducts('${category.id}')" title="查看产品">
                            <i class="fas fa-box"></i>
                        </button>
                        <button class="btn btn-outline-success" onclick="addSubCategory('${category.id}')" title="添加子分类">
                            <i class="fas fa-plus"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteCategory('${category.id}')" title="删除">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `;

        // 子分类行
        if (category.children && category.children.length > 0) {
            category.children.forEach(child => {
                tableHTML += `
                    <tr>
                        <td>
                            <input type="checkbox" class="form-check-input category-checkbox" value="${child.id}">
                        </td>
                        <td>
                            <div class="d-flex align-items-center ps-4">
                                <i class="fas fa-tag text-secondary me-2"></i>
                                ${child.name}
                            </div>
                        </td>
                        <td><span class="badge bg-secondary">${child.typeName}</span></td>
                        <td><span class="badge bg-info">${child.productCount}</span></td>
                        <td><span class="badge bg-secondary">${child.sort}</span></td>
                        <td><span class="badge ${getCategoryStatusBadgeClass(child.status)}">${child.statusName}</span></td>
                        <td><small class="text-muted">${child.created}</small></td>
                        <td>
                            <div class="btn-group btn-group-sm">
                                <button class="btn btn-outline-primary" onclick="editCategory('${child.id}')" title="编辑">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-info" onclick="viewCategoryProducts('${child.id}')" title="查看产品">
                                    <i class="fas fa-box"></i>
                                </button>
                                <button class="btn btn-outline-danger" onclick="deleteCategory('${child.id}')" title="删除">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            });
        }
    });

    tbody.innerHTML = tableHTML;
}

// 获取分类状态徽章样式
function getCategoryStatusBadgeClass(status) {
    switch(status) {
        case 'active': return 'bg-success';
        case 'inactive': return 'bg-secondary';
        case 'disabled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// 更新分类统计信息
function updateCategoryStats(categoryData) {
    let primaryCount = 0;
    let secondaryCount = 0;
    let totalProductCount = 0;
    let activeCount = 0;

    categoryData.forEach(category => {
        if (category.type === 'primary') {
            primaryCount++;
            totalProductCount += category.productCount;
            if (category.status === 'active') activeCount++;

            if (category.children) {
                secondaryCount += category.children.length;
                category.children.forEach(child => {
                    if (child.status === 'active') activeCount++;
                });
            }
        }
    });

    // 更新统计显示
    const primaryCountEl = document.getElementById('primaryCategoryCount');
    const secondaryCountEl = document.getElementById('secondaryCategoryCount');
    const productCountEl = document.getElementById('categoryProductCount');
    const activeCountEl = document.getElementById('activeCategoryCount');

    if (primaryCountEl) primaryCountEl.textContent = primaryCount;
    if (secondaryCountEl) secondaryCountEl.textContent = secondaryCount;
    if (productCountEl) productCountEl.textContent = totalProductCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
}

// 绑定分类复选框事件
function bindCategoryCheckboxEvents() {
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAllCategories');
    const categoryCheckboxes = document.querySelectorAll('.category-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            categoryCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateCategoryBatchActions();
        });
    }

    // 单个复选框事件
    categoryCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCategoryBatchActions);
    });
}

// 更新分类批量操作显示
function updateCategoryBatchActions() {
    const checkedBoxes = document.querySelectorAll('.category-checkbox:checked');
    const batchActionsCard = document.getElementById('categoryBatchActionsCard');
    const selectedCount = document.getElementById('categorySelectedCount');

    if (checkedBoxes.length > 0) {
        batchActionsCard.style.display = 'block';
        selectedCount.textContent = checkedBoxes.length;
    } else {
        batchActionsCard.style.display = 'none';
    }
}

// 筛选分类
function filterCategories() {
    const searchTerm = document.getElementById('categorySearchInput').value.toLowerCase();

    // 获取所有分类行
    const rows = document.querySelectorAll('#categoryTableBody tr');

    rows.forEach(row => {
        const categoryName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        if (categoryName.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 创建产品分类
function createProductCategory() {
    showCategoryModal();
}

// 显示分类编辑弹窗
function showCategoryModal(category = null) {
    const isEdit = category !== null;
    const title = isEdit ? '编辑分类' : '添加分类';

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'categoryModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-layer-group me-2"></i>${title}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="categoryForm">
                        ${isEdit ? `<input type="hidden" id="categoryId" value="${category.id}">` : ''}
                        <div class="mb-3">
                            <label class="form-label">分类名称 <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="categoryName" value="${isEdit ? category.name : ''}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">分类类型 <span class="text-danger">*</span></label>
                            <select class="form-select" id="categoryType" required ${isEdit ? 'disabled' : ''}>
                                <option value="">请选择分类类型</option>
                                <option value="primary" ${isEdit && category.type === 'primary' ? 'selected' : ''}>主分类</option>
                                <option value="secondary" ${isEdit && category.type === 'secondary' ? 'selected' : ''}>子分类</option>
                            </select>
                        </div>
                        <div class="mb-3" id="parentCategoryGroup" style="display: none;">
                            <label class="form-label">父分类 <span class="text-danger">*</span></label>
                            <select class="form-select" id="parentCategory">
                                <option value="">请选择父分类</option>
                                <!-- 动态加载主分类选项 -->
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">分类描述</label>
                            <textarea class="form-control" id="categoryDescription" rows="3">${isEdit ? (category.description || '') : ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">排序</label>
                                <input type="number" class="form-control" id="categorySort" value="${isEdit ? category.sort : 1}" min="1">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">状态</label>
                                <select class="form-select" id="categoryStatus">
                                    <option value="active" ${isEdit && category.status === 'active' ? 'selected' : ''}>启用</option>
                                    <option value="inactive" ${isEdit && category.status === 'inactive' ? 'selected' : ''}>禁用</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="saveCategory()">
                        <i class="fas fa-save me-1"></i>${isEdit ? '保存更改' : '创建分类'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // 绑定分类类型变化事件
    const categoryTypeSelect = document.getElementById('categoryType');
    const parentCategoryGroup = document.getElementById('parentCategoryGroup');

    categoryTypeSelect.addEventListener('change', function() {
        if (this.value === 'secondary') {
            parentCategoryGroup.style.display = 'block';
            loadParentCategoryOptions();
        } else {
            parentCategoryGroup.style.display = 'none';
        }
    });

    // 如果是编辑子分类，显示父分类选择
    if (isEdit && category.type === 'secondary') {
        parentCategoryGroup.style.display = 'block';
        loadParentCategoryOptions();
        setTimeout(() => {
            document.getElementById('parentCategory').value = category.parent || '';
        }, 100);
    }

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 加载父分类选项
function loadParentCategoryOptions() {
    const parentSelect = document.getElementById('parentCategory');
    if (!parentSelect) return;

    // 获取主分类数据
    const dataLoader = window.contentDataLoader;
    let primaryCategories = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.categories) {
        primaryCategories = dataLoader.contentData.categories.filter(cat => cat.type === 'primary');
    } else {
        // 备用数据
        primaryCategories = [
            { id: 'electronic-endoscope', name: '电子内窥镜' },
            { id: 'fiber-endoscope', name: '光纤内窥镜' },
            { id: 'optical-endoscope', name: '光学内窥镜' }
        ];
    }

    parentSelect.innerHTML = '<option value="">请选择父分类</option>' +
        primaryCategories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

// 保存分类
async function saveCategory() {
    const categoryId = document.getElementById('categoryId')?.value;
    const name = document.getElementById('categoryName').value.trim();
    const type = document.getElementById('categoryType').value;
    const description = document.getElementById('categoryDescription').value.trim();
    const sort = parseInt(document.getElementById('categorySort').value) || 1;
    const status = document.getElementById('categoryStatus').value;
    const parent = document.getElementById('parentCategory')?.value;

    if (!name || !type) {
        showNotification('请填写所有必填字段', 'warning');
        return;
    }

    if (type === 'secondary' && !parent) {
        showNotification('子分类必须选择父分类', 'warning');
        return;
    }

    try {
        const categoryData = {
            id: categoryId || generateCategoryId(name),
            name: name,
            type: type,
            typeName: type === 'primary' ? '主分类' : '子分类',
            description: description,
            sort: sort,
            status: status,
            statusName: status === 'active' ? '启用' : '禁用',
            created: new Date().toISOString().split('T')[0],
            productCount: 0
        };

        if (type === 'secondary') {
            categoryData.parent = parent;
        }

        // 使用文件操作模块保存分类
        if (window.fileOperations) {
            if (categoryId) {
                await window.fileOperations.updateCategory(categoryData);
            } else {
                await window.fileOperations.createCategory(categoryData);
            }
        }

        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('categoryModal'));
        modal.hide();

        // 显示成功消息
        const action = categoryId ? '更新' : '创建';
        showNotification(`分类"${name}"${action}成功`, 'success');

        // 刷新分类列表
        loadProductCategories();

    } catch (error) {
        console.error('保存分类失败:', error);
        showNotification(`保存分类失败: ${error.message}`, 'danger');
    }
}

// 生成分类ID
function generateCategoryId(name) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `category-${timestamp}-${randomStr}`;
}

// 编辑分类
function editCategory(id) {
    console.log('编辑分类:', id);

    // 获取分类数据
    const dataLoader = window.contentDataLoader;
    let category = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.categories) {
        // 在主分类中查找
        category = dataLoader.contentData.categories.find(cat => cat.id === id);

        // 如果没找到，在子分类中查找
        if (!category) {
            for (const mainCat of dataLoader.contentData.categories) {
                if (mainCat.children) {
                    category = mainCat.children.find(child => child.id === id);
                    if (category) break;
                }
            }
        }
    }

    if (!category) {
        showNotification('未找到分类数据', 'warning');
        return;
    }

    showCategoryModal(category);
}

// 删除分类
async function deleteCategory(id) {
    console.log('删除分类:', id);

    // 获取分类数据以显示确认信息
    const dataLoader = window.contentDataLoader;
    let category = null;
    let categoryName = id;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.categories) {
        // 在主分类中查找
        category = dataLoader.contentData.categories.find(cat => cat.id === id);

        // 如果没找到，在子分类中查找
        if (!category) {
            for (const mainCat of dataLoader.contentData.categories) {
                if (mainCat.children) {
                    category = mainCat.children.find(child => child.id === id);
                    if (category) break;
                }
            }
        }

        if (category) {
            categoryName = category.name;
        }
    }

    if (confirm(`确定要删除分类"${categoryName}"吗？\n\n注意：删除主分类将同时删除其所有子分类！`)) {
        try {
            // 使用文件操作模块删除分类
            if (window.fileOperations) {
                await window.fileOperations.deleteCategory(id);
            }

            // 显示成功消息
            showNotification(`分类"${categoryName}"已删除`, 'success');

            // 重新加载分类列表
            loadProductCategories();

        } catch (error) {
            console.error('删除分类失败:', error);
            showNotification(`删除分类失败: ${error.message}`, 'danger');
        }
    }
}

// 查看分类下的产品
function viewCategoryProducts(categoryId) {
    console.log('查看分类产品:', categoryId);

    // 跳转到产品列表并应用分类筛选
    showProductsList();

    // 延迟设置筛选条件，确保页面已加载
    setTimeout(() => {
        const categoryFilter = document.getElementById('productCategoryFilter');
        if (categoryFilter) {
            categoryFilter.value = categoryId;
            filterProducts();
        }
    }, 100);
}

// 添加子分类
function addSubCategory(parentId) {
    console.log('添加子分类，父分类:', parentId);

    // 创建一个预设了父分类的分类对象
    const newCategory = {
        type: 'secondary',
        parent: parentId,
        status: 'active'
    };

    showCategoryModal(newCategory);
}

// 批量启用分类
async function batchEnableCategories() {
    const checkedBoxes = document.querySelectorAll('.category-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要启用的分类', 'warning');
        return;
    }

    if (confirm(`确定要启用选中的 ${ids.length} 个分类吗？`)) {
        try {
            let successCount = 0;

            for (const id of ids) {
                // 这里应该调用API更新分类状态
                // 暂时模拟成功
                successCount++;
            }

            showNotification(`成功启用 ${successCount} 个分类`, 'success');
            loadProductCategories();

        } catch (error) {
            console.error('批量启用失败:', error);
            showNotification(`批量启用失败: ${error.message}`, 'danger');
        }
    }
}

// 批量禁用分类
async function batchDisableCategories() {
    const checkedBoxes = document.querySelectorAll('.category-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要禁用的分类', 'warning');
        return;
    }

    if (confirm(`确定要禁用选中的 ${ids.length} 个分类吗？`)) {
        try {
            let successCount = 0;

            for (const id of ids) {
                // 这里应该调用API更新分类状态
                // 暂时模拟成功
                successCount++;
            }

            showNotification(`成功禁用 ${successCount} 个分类`, 'success');
            loadProductCategories();

        } catch (error) {
            console.error('批量禁用失败:', error);
            showNotification(`批量禁用失败: ${error.message}`, 'danger');
        }
    }
}

// 批量删除分类
async function batchDeleteCategories() {
    const checkedBoxes = document.querySelectorAll('.category-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要删除的分类', 'warning');
        return;
    }

    if (confirm(`确定要删除选中的 ${ids.length} 个分类吗？\n\n注意：此操作将永久删除分类，无法恢复！`)) {
        try {
            let successCount = 0;

            for (const id of ids) {
                // 使用文件操作模块删除分类
                if (window.fileOperations) {
                    await window.fileOperations.deleteCategory(id);
                }
                successCount++;
            }

            showNotification(`成功删除 ${successCount} 个分类`, 'success');
            loadProductCategories();

        } catch (error) {
            console.error('批量删除失败:', error);
            showNotification(`批量删除失败: ${error.message}`, 'danger');
        }
    }
}

// 批量导出分类
function batchExportCategories() {
    const checkedBoxes = document.querySelectorAll('.category-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要导出的分类', 'warning');
        return;
    }

    try {
        const exportData = [];

        // 获取选中的分类数据
        const dataLoader = window.contentDataLoader;
        if (dataLoader && dataLoader.contentData && dataLoader.contentData.categories) {
            dataLoader.contentData.categories.forEach(category => {
                if (ids.includes(category.id)) {
                    exportData.push({
                        ID: category.id,
                        名称: category.name,
                        类型: category.typeName,
                        描述: category.description || '',
                        产品数量: category.productCount,
                        排序: category.sort,
                        状态: category.statusName,
                        创建时间: category.created
                    });
                }

                // 检查子分类
                if (category.children) {
                    category.children.forEach(child => {
                        if (ids.includes(child.id)) {
                            exportData.push({
                                ID: child.id,
                                名称: child.name,
                                类型: child.typeName,
                                父分类: category.name,
                                产品数量: child.productCount,
                                排序: child.sort,
                                状态: child.statusName,
                                创建时间: child.created
                            });
                        }
                    });
                }
            });
        }

        // 转换为CSV格式
        const csvContent = convertToCSV(exportData);

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `产品分类导出_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification(`成功导出 ${exportData.length} 个分类`, 'success');

    } catch (error) {
        console.error('批量导出失败:', error);
        showNotification(`批量导出失败: ${error.message}`, 'danger');
    }
}

function showProductSeries() {
    console.log('showProductSeries 被调用');
    updatePageTitle('产品系列管理', '管理产品系列分类');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">产品系列管理</h4>
                <p class="text-muted mb-0">管理产品系列分类，按系列组织产品</p>
            </div>
            <button class="btn btn-primary" onclick="createProductSeries()">
                <i class="fas fa-plus me-2"></i>添加产品系列
            </button>
        </div>

        <!-- 系列统计 -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">总系列数</h6>
                                <h3 class="mb-0" id="totalSeriesCount">4</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-layer-group fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">启用系列</h6>
                                <h3 class="mb-0" id="activeSeriesCount">4</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-check-circle fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">关联产品</h6>
                                <h3 class="mb-0" id="seriesProductCount">25</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-box fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">热门系列</h6>
                                <h3 class="mb-0" id="popularSeriesCount">2</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-star fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 系列列表 -->
        <div class="card">
            <div class="card-header">
                <div class="row align-items-center">
                    <div class="col">
                        <h5 class="mb-0">产品系列列表</h5>
                    </div>
                    <div class="col-auto">
                        <div class="input-group">
                            <input type="text" class="form-control" id="seriesSearchInput" placeholder="搜索系列..." onkeyup="filterProductSeries()">
                            <button class="btn btn-outline-secondary" onclick="filterProductSeries()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th width="50">
                                    <input type="checkbox" class="form-check-input" id="selectAllSeries">
                                </th>
                                <th>系列名称</th>
                                <th width="200">系列描述</th>
                                <th width="120">产品数量</th>
                                <th width="100">排序</th>
                                <th width="80">状态</th>
                                <th width="120">创建时间</th>
                                <th width="150">操作</th>
                            </tr>
                        </thead>
                        <tbody id="seriesTableBody">
                            <!-- 动态生成的系列列表 -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 批量操作 -->
        <div class="card mt-3" id="seriesBatchActionsCard" style="display: none;">
            <div class="card-body">
                <div class="d-flex align-items-center gap-3">
                    <span class="text-muted">已选择 <span id="seriesSelectedCount">0</span> 项</span>
                    <button class="btn btn-sm btn-outline-success" onclick="batchEnableSeries()">批量启用</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="batchDisableSeries()">批量禁用</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="batchDeleteSeries()">批量删除</button>
                    <button class="btn btn-sm btn-outline-info" onclick="batchExportSeries()">批量导出</button>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadProductSeries();
}

// 加载产品系列数据
function loadProductSeries() {
    // 获取系列数据
    const dataLoader = window.contentDataLoader;
    let seriesData = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
        seriesData = dataLoader.contentData.productSeries;
    } else {
        // 备用系列数据
        seriesData = [
            {
                id: 'k-series',
                name: 'K系列',
                description: '超细径工业电子内窥镜，适用于极小空间检测',
                productCount: 8,
                sort: 1,
                status: 'active',
                statusName: '启用',
                created: '2024-01-01',
                popular: true
            },
            {
                id: 'p-series',
                name: 'P系列',
                description: '便携式工业内窥镜，操作简便，适合现场检测',
                productCount: 6,
                sort: 2,
                status: 'active',
                statusName: '启用',
                created: '2024-01-02',
                popular: true
            },
            {
                id: 's-series',
                name: 'S系列',
                description: '专业级工业内窥镜，高清成像，功能丰富',
                productCount: 5,
                sort: 3,
                status: 'active',
                statusName: '启用',
                created: '2024-01-03',
                popular: false
            },
            {
                id: 'dz-series',
                name: 'DZ系列',
                description: '定制化工业内窥镜，根据特殊需求定制',
                productCount: 6,
                sort: 4,
                status: 'active',
                statusName: '启用',
                created: '2024-01-04',
                popular: false
            }
        ];
    }

    // 渲染系列表格
    renderSeriesTable(seriesData);

    // 更新统计信息
    updateSeriesStats(seriesData);

    // 绑定复选框事件
    bindSeriesCheckboxEvents();
}

// 渲染系列表格
function renderSeriesTable(seriesData) {
    const tbody = document.getElementById('seriesTableBody');
    if (!tbody) return;

    if (seriesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-layer-group empty-icon"></i>
                        <div class="empty-title">暂无系列数据</div>
                        <div class="empty-description">点击上方"添加产品系列"按钮开始添加系列</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = seriesData.map(series => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input series-checkbox" value="${series.id}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-layer-group text-primary me-2"></i>
                    <strong>${series.name}</strong>
                    ${series.popular ? '<span class="badge bg-warning text-dark ms-2">热门</span>' : ''}
                </div>
            </td>
            <td>
                <div class="text-truncate" style="max-width: 200px;" title="${series.description}">
                    ${series.description}
                </div>
            </td>
            <td><span class="badge bg-info">${series.productCount}</span></td>
            <td><span class="badge bg-secondary">${series.sort}</span></td>
            <td><span class="badge ${getSeriesStatusBadgeClass(series.status)}">${series.statusName}</span></td>
            <td><small class="text-muted">${series.created}</small></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editProductSeries('${series.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewSeriesProducts('${series.id}')" title="查看产品">
                        <i class="fas fa-box"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="duplicateProductSeries('${series.id}')" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteProductSeries('${series.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取系列状态徽章样式
function getSeriesStatusBadgeClass(status) {
    switch(status) {
        case 'active': return 'bg-success';
        case 'inactive': return 'bg-secondary';
        case 'disabled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// 更新系列统计信息
function updateSeriesStats(seriesData) {
    const totalCount = seriesData.length;
    const activeCount = seriesData.filter(series => series.status === 'active').length;
    const totalProductCount = seriesData.reduce((sum, series) => sum + series.productCount, 0);
    const popularCount = seriesData.filter(series => series.popular).length;

    // 更新统计显示
    const totalCountEl = document.getElementById('totalSeriesCount');
    const activeCountEl = document.getElementById('activeSeriesCount');
    const productCountEl = document.getElementById('seriesProductCount');
    const popularCountEl = document.getElementById('popularSeriesCount');

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (productCountEl) productCountEl.textContent = totalProductCount;
    if (popularCountEl) popularCountEl.textContent = popularCount;
}

// 绑定系列复选框事件
function bindSeriesCheckboxEvents() {
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAllSeries');
    const seriesCheckboxes = document.querySelectorAll('.series-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            seriesCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateSeriesBatchActions();
        });
    }

    // 单个复选框事件
    seriesCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSeriesBatchActions);
    });
}

// 更新系列批量操作显示
function updateSeriesBatchActions() {
    const checkedBoxes = document.querySelectorAll('.series-checkbox:checked');
    const batchActionsCard = document.getElementById('seriesBatchActionsCard');
    const selectedCount = document.getElementById('seriesSelectedCount');

    if (checkedBoxes.length > 0) {
        batchActionsCard.style.display = 'block';
        selectedCount.textContent = checkedBoxes.length;
    } else {
        batchActionsCard.style.display = 'none';
    }
}

// 筛选产品系列
function filterProductSeries() {
    const searchTerm = document.getElementById('seriesSearchInput').value.toLowerCase();

    // 获取所有系列行
    const rows = document.querySelectorAll('#seriesTableBody tr');

    rows.forEach(row => {
        const seriesName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const seriesDesc = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

        if (seriesName.includes(searchTerm) || seriesDesc.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 创建产品系列
function createProductSeries() {
    showSeriesModal();
}

// 编辑产品系列
function editProductSeries(id) {
    console.log('编辑产品系列:', id);

    // 获取系列数据
    const dataLoader = window.contentDataLoader;
    let series = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
        series = dataLoader.contentData.productSeries.find(s => s.id === id);
    } else {
        // 从备用数据中查找
        const backupData = [
            {
                id: 'k-series',
                name: 'K系列',
                description: '超细径工业电子内窥镜，适用于极小空间检测',
                productCount: 8,
                sort: 1,
                status: 'active',
                statusName: '启用',
                created: '2024-01-01',
                popular: true
            },
            {
                id: 'p-series',
                name: 'P系列',
                description: '便携式工业内窥镜，操作简便，适合现场检测',
                productCount: 6,
                sort: 2,
                status: 'active',
                statusName: '启用',
                created: '2024-01-02',
                popular: true
            },
            {
                id: 's-series',
                name: 'S系列',
                description: '专业级工业内窥镜，高清成像，功能丰富',
                productCount: 5,
                sort: 3,
                status: 'active',
                statusName: '启用',
                created: '2024-01-03',
                popular: false
            },
            {
                id: 'dz-series',
                name: 'DZ系列',
                description: '定制化工业内窥镜，根据特殊需求定制',
                productCount: 6,
                sort: 4,
                status: 'active',
                statusName: '启用',
                created: '2024-01-04',
                popular: false
            }
        ];
        series = backupData.find(s => s.id === id);
    }

    if (!series) {
        showNotification('未找到系列数据', 'warning');
        return;
    }

    showSeriesModal(series);
}

// 删除产品系列
async function deleteProductSeries(id) {
    console.log('删除产品系列:', id);

    // 获取系列数据以显示确认信息
    const dataLoader = window.contentDataLoader;
    let series = null;
    let seriesName = id;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
        series = dataLoader.contentData.productSeries.find(s => s.id === id);
        if (series) {
            seriesName = series.name;
        }
    }

    if (confirm(`确定要删除系列"${seriesName}"吗？\n\n注意：删除系列不会影响已关联的产品，但会移除系列分类！`)) {
        try {
            // 使用文件操作模块删除系列
            if (window.fileOperations) {
                await window.fileOperations.deleteProductSeries(id);
            }

            // 从本地数据中移除
            if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
                const index = dataLoader.contentData.productSeries.findIndex(s => s.id === id);
                if (index > -1) {
                    dataLoader.contentData.productSeries.splice(index, 1);
                }
            }

            // 显示成功消息
            showNotification(`系列"${seriesName}"已删除`, 'success');

            // 重新加载系列列表
            loadProductSeries();

        } catch (error) {
            console.error('删除系列失败:', error);
            showNotification(`删除系列失败: ${error.message}`, 'danger');
        }
    }
}

// 查看系列产品
function viewSeriesProducts(seriesId) {
    console.log('查看系列产品:', seriesId);

    // 跳转到产品列表并应用系列筛选
    showProductsList();

    // 延迟设置筛选条件，确保页面已加载
    setTimeout(() => {
        const seriesFilter = document.getElementById('productSeriesFilter');
        if (seriesFilter) {
            seriesFilter.value = seriesId;
            filterProducts();
        }
    }, 100);
}

// 复制产品系列
function duplicateProductSeries(id) {
    console.log('复制产品系列:', id);

    // 获取原系列数据
    const dataLoader = window.contentDataLoader;
    let originalSeries = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
        originalSeries = dataLoader.contentData.productSeries.find(s => s.id === id);
    } else {
        // 从备用数据中查找
        const backupData = [
            {
                id: 'k-series',
                name: 'K系列',
                description: '超细径工业电子内窥镜，适用于极小空间检测',
                productCount: 8,
                sort: 1,
                status: 'active',
                statusName: '启用',
                created: '2024-01-01',
                popular: true
            },
            {
                id: 'p-series',
                name: 'P系列',
                description: '便携式工业内窥镜，操作简便，适合现场检测',
                productCount: 6,
                sort: 2,
                status: 'active',
                statusName: '启用',
                created: '2024-01-02',
                popular: true
            }
        ];
        originalSeries = backupData.find(s => s.id === id);
    }

    if (!originalSeries) {
        showNotification('未找到要复制的系列数据', 'warning');
        return;
    }

    // 创建复制的系列数据
    const duplicatedSeries = {
        ...originalSeries,
        id: undefined, // 将在保存时生成新ID
        name: `${originalSeries.name} - 副本`,
        status: 'inactive', // 新复制的系列默认为禁用状态
        statusName: '禁用',
        popular: false, // 复制的系列默认不是热门
        productCount: 0, // 复制的系列初始产品数量为0
        created: undefined // 将在保存时设置新的创建时间
    };

    // 显示编辑界面
    showSeriesModal(duplicatedSeries);
}

// 显示系列编辑弹窗
function showSeriesModal(series = null) {
    const isEdit = series !== null;
    const title = isEdit ? '编辑产品系列' : '添加产品系列';

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'seriesModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-layer-group me-2"></i>${title}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="seriesForm">
                        ${isEdit ? `<input type="hidden" id="seriesId" value="${series.id}">` : ''}
                        <div class="mb-3">
                            <label class="form-label">系列名称 <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="seriesName" value="${isEdit ? series.name : ''}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">系列描述</label>
                            <textarea class="form-control" id="seriesDescription" rows="3">${isEdit ? (series.description || '') : ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">排序</label>
                                <input type="number" class="form-control" id="seriesSort" value="${isEdit ? series.sort : 1}" min="1">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">状态</label>
                                <select class="form-select" id="seriesStatus">
                                    <option value="active" ${isEdit && series.status === 'active' ? 'selected' : ''}>启用</option>
                                    <option value="inactive" ${isEdit && series.status === 'inactive' ? 'selected' : ''}>禁用</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="seriesPopular" ${isEdit && series.popular ? 'checked' : ''}>
                                <label class="form-check-label" for="seriesPopular">
                                    设为热门系列
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">系列特色</label>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="seriesFeatureUltraFine">
                                        <label class="form-check-label" for="seriesFeatureUltraFine">
                                            超细径设计
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="seriesFeaturePortable">
                                        <label class="form-check-label" for="seriesFeaturePortable">
                                            便携式设计
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="seriesFeatureHighDef">
                                        <label class="form-check-label" for="seriesFeatureHighDef">
                                            高清成像
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="seriesFeatureCustom">
                                        <label class="form-check-label" for="seriesFeatureCustom">
                                            定制化服务
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="saveProductSeries()">
                        <i class="fas fa-save me-1"></i>${isEdit ? '保存更改' : '创建系列'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 保存产品系列
async function saveProductSeries() {
    const seriesId = document.getElementById('seriesId')?.value;
    const name = document.getElementById('seriesName').value.trim();
    const description = document.getElementById('seriesDescription').value.trim();
    const sort = parseInt(document.getElementById('seriesSort').value) || 1;
    const status = document.getElementById('seriesStatus').value;
    const popular = document.getElementById('seriesPopular').checked;

    if (!name) {
        showNotification('请填写系列名称', 'warning');
        return;
    }

    try {
        const seriesData = {
            id: seriesId || generateSeriesId(name),
            name: name,
            description: description,
            sort: sort,
            status: status,
            statusName: status === 'active' ? '启用' : '禁用',
            popular: popular,
            created: seriesId ? undefined : new Date().toISOString().split('T')[0],
            productCount: seriesId ? undefined : 0,
            features: {
                ultraFine: document.getElementById('seriesFeatureUltraFine').checked,
                portable: document.getElementById('seriesFeaturePortable').checked,
                highDef: document.getElementById('seriesFeatureHighDef').checked,
                custom: document.getElementById('seriesFeatureCustom').checked
            }
        };

        // 使用文件操作模块保存系列
        if (window.fileOperations) {
            if (seriesId) {
                await window.fileOperations.updateProductSeries(seriesData);
            } else {
                await window.fileOperations.createProductSeries(seriesData);
            }
        }

        // 更新本地数据
        const dataLoader = window.contentDataLoader;
        if (dataLoader && dataLoader.contentData) {
            if (!dataLoader.contentData.productSeries) {
                dataLoader.contentData.productSeries = [];
            }

            if (seriesId) {
                // 更新现有系列
                const index = dataLoader.contentData.productSeries.findIndex(s => s.id === seriesId);
                if (index > -1) {
                    dataLoader.contentData.productSeries[index] = { ...dataLoader.contentData.productSeries[index], ...seriesData };
                }
            } else {
                // 添加新系列
                dataLoader.contentData.productSeries.push(seriesData);
            }
        }

        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('seriesModal'));
        modal.hide();

        // 显示成功消息
        const action = seriesId ? '更新' : '创建';
        showNotification(`系列"${name}"${action}成功`, 'success');

        // 刷新系列列表
        loadProductSeries();

    } catch (error) {
        console.error('保存系列失败:', error);
        showNotification(`保存系列失败: ${error.message}`, 'danger');
    }
}

// 生成系列ID
function generateSeriesId(name) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `series-${timestamp}-${randomStr}`;
}

// 批量启用系列
async function batchEnableSeries() {
    const checkedBoxes = document.querySelectorAll('.series-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要启用的系列', 'warning');
        return;
    }

    if (confirm(`确定要启用选中的 ${ids.length} 个系列吗？`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
                    const series = dataLoader.contentData.productSeries.find(s => s.id === id);
                    if (series) {
                        series.status = 'active';
                        series.statusName = '启用';
                        successCount++;
                    }
                }
            }

            showNotification(`成功启用 ${successCount} 个系列`, 'success');
            loadProductSeries();

        } catch (error) {
            console.error('批量启用失败:', error);
            showNotification(`批量启用失败: ${error.message}`, 'danger');
        }
    }
}

// 批量禁用系列
async function batchDisableSeries() {
    const checkedBoxes = document.querySelectorAll('.series-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要禁用的系列', 'warning');
        return;
    }

    if (confirm(`确定要禁用选中的 ${ids.length} 个系列吗？`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
                    const series = dataLoader.contentData.productSeries.find(s => s.id === id);
                    if (series) {
                        series.status = 'inactive';
                        series.statusName = '禁用';
                        successCount++;
                    }
                }
            }

            showNotification(`成功禁用 ${successCount} 个系列`, 'success');
            loadProductSeries();

        } catch (error) {
            console.error('批量禁用失败:', error);
            showNotification(`批量禁用失败: ${error.message}`, 'danger');
        }
    }
}

// 批量删除系列
async function batchDeleteSeries() {
    const checkedBoxes = document.querySelectorAll('.series-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要删除的系列', 'warning');
        return;
    }

    if (confirm(`确定要删除选中的 ${ids.length} 个系列吗？\n\n注意：此操作将永久删除系列，无法恢复！`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                // 使用文件操作模块删除系列
                if (window.fileOperations) {
                    await window.fileOperations.deleteProductSeries(id);
                }

                // 从本地数据中移除
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
                    const index = dataLoader.contentData.productSeries.findIndex(s => s.id === id);
                    if (index > -1) {
                        dataLoader.contentData.productSeries.splice(index, 1);
                        successCount++;
                    }
                }
            }

            showNotification(`成功删除 ${successCount} 个系列`, 'success');
            loadProductSeries();

        } catch (error) {
            console.error('批量删除失败:', error);
            showNotification(`批量删除失败: ${error.message}`, 'danger');
        }
    }
}

// 批量导出系列
function batchExportSeries() {
    const checkedBoxes = document.querySelectorAll('.series-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要导出的系列', 'warning');
        return;
    }

    try {
        const dataLoader = window.contentDataLoader;
        const exportData = [];

        for (const id of ids) {
            if (dataLoader && dataLoader.contentData && dataLoader.contentData.productSeries) {
                const series = dataLoader.contentData.productSeries.find(s => s.id === id);
                if (series) {
                    exportData.push({
                        ID: series.id,
                        系列名称: series.name,
                        描述: series.description || '',
                        产品数量: series.productCount,
                        排序: series.sort,
                        状态: series.statusName,
                        热门: series.popular ? '是' : '否',
                        创建时间: series.created
                    });
                }
            }
        }

        // 转换为CSV格式
        const csvContent = convertToCSV(exportData);

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `产品系列导出_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification(`成功导出 ${exportData.length} 个系列`, 'success');

    } catch (error) {
        console.error('批量导出失败:', error);
        showNotification(`批量导出失败: ${error.message}`, 'danger');
    }
}

function showSuppliers() {
    console.log('showSuppliers 被调用');
    updatePageTitle('供应商管理', '管理供应商信息');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">供应商管理</h4>
                <p class="text-muted mb-0">管理产品供应商信息和合作关系</p>
            </div>
            <button class="btn btn-primary" onclick="createSupplier()">
                <i class="fas fa-plus me-2"></i>添加供应商
            </button>
        </div>

        <!-- 供应商统计 -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">总供应商</h6>
                                <h3 class="mb-0" id="totalSupplierCount">3</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-building fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">活跃供应商</h6>
                                <h3 class="mb-0" id="activeSupplierCount">3</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-check-circle fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">供应产品</h6>
                                <h3 class="mb-0" id="supplierProductCount">25</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-box fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">核心供应商</h6>
                                <h3 class="mb-0" id="coreSupplierCount">1</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-star fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 供应商列表 -->
        <div class="card">
            <div class="card-header">
                <div class="row align-items-center">
                    <div class="col">
                        <h5 class="mb-0">供应商列表</h5>
                    </div>
                    <div class="col-auto">
                        <div class="input-group">
                            <input type="text" class="form-control" id="supplierSearchInput" placeholder="搜索供应商..." onkeyup="filterSuppliers()">
                            <button class="btn btn-outline-secondary" onclick="filterSuppliers()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th width="50">
                                    <input type="checkbox" class="form-check-input" id="selectAllSuppliers">
                                </th>
                                <th>供应商名称</th>
                                <th width="150">联系人</th>
                                <th width="150">联系电话</th>
                                <th width="120">产品数量</th>
                                <th width="100">合作等级</th>
                                <th width="80">状态</th>
                                <th width="120">合作开始</th>
                                <th width="150">操作</th>
                            </tr>
                        </thead>
                        <tbody id="supplierTableBody">
                            <!-- 动态生成的供应商列表 -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 批量操作 -->
        <div class="card mt-3" id="supplierBatchActionsCard" style="display: none;">
            <div class="card-body">
                <div class="d-flex align-items-center gap-3">
                    <span class="text-muted">已选择 <span id="supplierSelectedCount">0</span> 项</span>
                    <button class="btn btn-sm btn-outline-success" onclick="batchEnableSuppliers()">批量启用</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="batchDisableSuppliers()">批量禁用</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="batchDeleteSuppliers()">批量删除</button>
                    <button class="btn btn-sm btn-outline-info" onclick="batchExportSuppliers()">批量导出</button>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadSuppliers();
}

// 加载供应商数据
function loadSuppliers() {
    // 获取供应商数据
    const dataLoader = window.contentDataLoader;
    let supplierData = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
        supplierData = dataLoader.contentData.suppliers;
    } else {
        // 备用供应商数据
        supplierData = [
            {
                id: 'weishi-optical',
                name: '深圳市微视光电科技有限公司',
                contact: '张经理',
                phone: '0755-12345678',
                email: 'zhang@weishi.com',
                address: '深圳市南山区科技园',
                productCount: 20,
                level: 'core',
                levelName: '核心供应商',
                status: 'active',
                statusName: '活跃',
                cooperationStart: '2020-01-01',
                description: '专业的工业内窥镜制造商，技术实力雄厚'
            },
            {
                id: 'beijing-precision',
                name: '北京精密仪器有限公司',
                contact: '李总',
                phone: '010-87654321',
                email: 'li@bjprecision.com',
                address: '北京市海淀区中关村',
                productCount: 3,
                level: 'partner',
                levelName: '合作伙伴',
                status: 'active',
                statusName: '活跃',
                cooperationStart: '2021-06-01',
                description: '精密测量设备供应商'
            },
            {
                id: 'shanghai-optical',
                name: '上海光学设备厂',
                contact: '王主任',
                phone: '021-98765432',
                email: 'wang@shoptical.com',
                address: '上海市浦东新区张江',
                productCount: 2,
                level: 'supplier',
                levelName: '普通供应商',
                status: 'active',
                statusName: '活跃',
                cooperationStart: '2022-03-01',
                description: '光学设备制造商'
            }
        ];
    }

    // 渲染供应商表格
    renderSupplierTable(supplierData);

    // 更新统计信息
    updateSupplierStats(supplierData);

    // 绑定复选框事件
    bindSupplierCheckboxEvents();
}

// 渲染供应商表格
function renderSupplierTable(supplierData) {
    const tbody = document.getElementById('supplierTableBody');
    if (!tbody) return;

    if (supplierData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-building empty-icon"></i>
                        <div class="empty-title">暂无供应商数据</div>
                        <div class="empty-description">点击上方"添加供应商"按钮开始添加供应商</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = supplierData.map(supplier => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input supplier-checkbox" value="${supplier.id}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-building text-primary me-2"></i>
                    <div>
                        <strong>${supplier.name}</strong>
                        ${supplier.level === 'core' ? '<span class="badge bg-warning text-dark ms-2">核心</span>' : ''}
                        <br><small class="text-muted">${supplier.description || ''}</small>
                    </div>
                </div>
            </td>
            <td>
                <div>
                    ${supplier.contact}
                    <br><small class="text-muted">${supplier.email || ''}</small>
                </div>
            </td>
            <td>${supplier.phone}</td>
            <td><span class="badge bg-info">${supplier.productCount}</span></td>
            <td><span class="badge ${getSupplierLevelBadgeClass(supplier.level)}">${supplier.levelName}</span></td>
            <td><span class="badge ${getSupplierStatusBadgeClass(supplier.status)}">${supplier.statusName}</span></td>
            <td><small class="text-muted">${supplier.cooperationStart}</small></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editSupplier('${supplier.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewSupplierProducts('${supplier.id}')" title="查看产品">
                        <i class="fas fa-box"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="viewSupplierDetails('${supplier.id}')" title="详情">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteSupplier('${supplier.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取供应商等级徽章样式
function getSupplierLevelBadgeClass(level) {
    switch(level) {
        case 'core': return 'bg-warning text-dark';
        case 'partner': return 'bg-success';
        case 'supplier': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

// 获取供应商状态徽章样式
function getSupplierStatusBadgeClass(status) {
    switch(status) {
        case 'active': return 'bg-success';
        case 'inactive': return 'bg-secondary';
        case 'suspended': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// 更新供应商统计信息
function updateSupplierStats(supplierData) {
    const totalCount = supplierData.length;
    const activeCount = supplierData.filter(supplier => supplier.status === 'active').length;
    const totalProductCount = supplierData.reduce((sum, supplier) => sum + supplier.productCount, 0);
    const coreCount = supplierData.filter(supplier => supplier.level === 'core').length;

    // 更新统计显示
    const totalCountEl = document.getElementById('totalSupplierCount');
    const activeCountEl = document.getElementById('activeSupplierCount');
    const productCountEl = document.getElementById('supplierProductCount');
    const coreCountEl = document.getElementById('coreSupplierCount');

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (productCountEl) productCountEl.textContent = totalProductCount;
    if (coreCountEl) coreCountEl.textContent = coreCount;
}

// 绑定供应商复选框事件
function bindSupplierCheckboxEvents() {
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAllSuppliers');
    const supplierCheckboxes = document.querySelectorAll('.supplier-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            supplierCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateSupplierBatchActions();
        });
    }

    // 单个复选框事件
    supplierCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSupplierBatchActions);
    });
}

// 更新供应商批量操作显示
function updateSupplierBatchActions() {
    const checkedBoxes = document.querySelectorAll('.supplier-checkbox:checked');
    const batchActionsCard = document.getElementById('supplierBatchActionsCard');
    const selectedCount = document.getElementById('supplierSelectedCount');

    if (checkedBoxes.length > 0) {
        batchActionsCard.style.display = 'block';
        selectedCount.textContent = checkedBoxes.length;
    } else {
        batchActionsCard.style.display = 'none';
    }
}

// 筛选供应商
function filterSuppliers() {
    const searchTerm = document.getElementById('supplierSearchInput').value.toLowerCase();

    // 获取所有供应商行
    const rows = document.querySelectorAll('#supplierTableBody tr');

    rows.forEach(row => {
        const supplierName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const contact = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

        if (supplierName.includes(searchTerm) || contact.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 创建供应商
function createSupplier() {
    showSupplierModal();
}

// 编辑供应商
function editSupplier(id) {
    console.log('编辑供应商:', id);

    // 获取供应商数据
    const dataLoader = window.contentDataLoader;
    let supplier = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
        supplier = dataLoader.contentData.suppliers.find(s => s.id === id);
    } else {
        // 从备用数据中查找
        const backupData = [
            {
                id: 'weishi-optical',
                name: '深圳市微视光电科技有限公司',
                contact: '张经理',
                phone: '0755-12345678',
                email: 'zhang@weishi.com',
                address: '深圳市南山区科技园',
                productCount: 20,
                level: 'core',
                levelName: '核心供应商',
                status: 'active',
                statusName: '活跃',
                cooperationStart: '2020-01-01',
                description: '专业的工业内窥镜制造商，技术实力雄厚'
            },
            {
                id: 'beijing-precision',
                name: '北京精密仪器有限公司',
                contact: '李总',
                phone: '010-87654321',
                email: 'li@bjprecision.com',
                address: '北京市海淀区中关村',
                productCount: 3,
                level: 'partner',
                levelName: '合作伙伴',
                status: 'active',
                statusName: '活跃',
                cooperationStart: '2021-06-01',
                description: '精密测量设备供应商'
            },
            {
                id: 'shanghai-optical',
                name: '上海光学设备厂',
                contact: '王主任',
                phone: '021-98765432',
                email: 'wang@shoptical.com',
                address: '上海市浦东新区张江',
                productCount: 2,
                level: 'supplier',
                levelName: '普通供应商',
                status: 'active',
                statusName: '活跃',
                cooperationStart: '2022-03-01',
                description: '光学设备制造商'
            }
        ];
        supplier = backupData.find(s => s.id === id);
    }

    if (!supplier) {
        showNotification('未找到供应商数据', 'warning');
        return;
    }

    showSupplierModal(supplier);
}

// 删除供应商
async function deleteSupplier(id) {
    console.log('删除供应商:', id);

    // 获取供应商数据以显示确认信息
    const dataLoader = window.contentDataLoader;
    let supplier = null;
    let supplierName = id;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
        supplier = dataLoader.contentData.suppliers.find(s => s.id === id);
        if (supplier) {
            supplierName = supplier.name;
        }
    }

    if (confirm(`确定要删除供应商"${supplierName}"吗？\n\n注意：删除供应商不会影响已关联的产品，但会移除供应商信息！`)) {
        try {
            // 使用文件操作模块删除供应商
            if (window.fileOperations) {
                await window.fileOperations.deleteSupplier(id);
            }

            // 从本地数据中移除
            if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
                const index = dataLoader.contentData.suppliers.findIndex(s => s.id === id);
                if (index > -1) {
                    dataLoader.contentData.suppliers.splice(index, 1);
                }
            }

            // 显示成功消息
            showNotification(`供应商"${supplierName}"已删除`, 'success');

            // 重新加载供应商列表
            loadSuppliers();

        } catch (error) {
            console.error('删除供应商失败:', error);
            showNotification(`删除供应商失败: ${error.message}`, 'danger');
        }
    }
}

// 查看供应商产品
function viewSupplierProducts(supplierId) {
    console.log('查看供应商产品:', supplierId);

    // 跳转到产品列表并应用供应商筛选
    showProductsList();

    // 延迟设置筛选条件，确保页面已加载
    setTimeout(() => {
        const supplierFilter = document.getElementById('productSupplierFilter');
        if (supplierFilter) {
            supplierFilter.value = supplierId;
            filterProducts();
        }
    }, 100);
}

// 查看供应商详情
function viewSupplierDetails(id) {
    console.log('查看供应商详情:', id);

    // 获取供应商数据
    const dataLoader = window.contentDataLoader;
    let supplier = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
        supplier = dataLoader.contentData.suppliers.find(s => s.id === id);
    } else {
        // 从备用数据中查找
        const backupData = [
            {
                id: 'weishi-optical',
                name: '深圳市微视光电科技有限公司',
                contact: '张经理',
                phone: '0755-12345678',
                email: 'zhang@weishi.com',
                address: '深圳市南山区科技园',
                productCount: 20,
                level: 'core',
                levelName: '核心供应商',
                status: 'active',
                statusName: '活跃',
                cooperationStart: '2020-01-01',
                description: '专业的工业内窥镜制造商，技术实力雄厚',
                website: 'https://www.weishi.com'
            }
        ];
        supplier = backupData.find(s => s.id === id);
    }

    if (!supplier) {
        showNotification('未找到供应商数据', 'warning');
        return;
    }

    showSupplierDetailsModal(supplier);
}

// 显示供应商详情弹窗
function showSupplierDetailsModal(supplier) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'supplierDetailsModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-building me-2"></i>供应商详情 - ${supplier.name}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-8">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">基本信息</h6>
                                </div>
                                <div class="card-body">
                                    <div class="row mb-3">
                                        <div class="col-sm-4"><strong>供应商名称:</strong></div>
                                        <div class="col-sm-8">${supplier.name}</div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-sm-4"><strong>联系人:</strong></div>
                                        <div class="col-sm-8">${supplier.contact || '未填写'}</div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-sm-4"><strong>联系电话:</strong></div>
                                        <div class="col-sm-8">${supplier.phone || '未填写'}</div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-sm-4"><strong>邮箱地址:</strong></div>
                                        <div class="col-sm-8">${supplier.email || '未填写'}</div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-sm-4"><strong>公司地址:</strong></div>
                                        <div class="col-sm-8">${supplier.address || '未填写'}</div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-sm-4"><strong>网站地址:</strong></div>
                                        <div class="col-sm-8">
                                            ${supplier.website ? `<a href="${supplier.website}" target="_blank">${supplier.website}</a>` : '未填写'}
                                        </div>
                                    </div>
                                    <div class="row mb-3">
                                        <div class="col-sm-4"><strong>公司描述:</strong></div>
                                        <div class="col-sm-8">${supplier.description || '未填写'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-md-4">
                            <div class="card">
                                <div class="card-header">
                                    <h6 class="mb-0">合作信息</h6>
                                </div>
                                <div class="card-body">
                                    <div class="mb-3">
                                        <strong>合作等级</strong><br>
                                        <span class="badge ${getSupplierLevelBadgeClass(supplier.level)} fs-6">${supplier.levelName}</span>
                                    </div>
                                    <div class="mb-3">
                                        <strong>合作状态</strong><br>
                                        <span class="badge ${getSupplierStatusBadgeClass(supplier.status)} fs-6">${supplier.statusName}</span>
                                    </div>
                                    <div class="mb-3">
                                        <strong>合作开始</strong><br>
                                        ${supplier.cooperationStart || '未知'}
                                    </div>
                                    <div class="mb-3">
                                        <strong>供应产品数</strong><br>
                                        <span class="badge bg-info fs-6">${supplier.productCount} 个</span>
                                    </div>
                                </div>
                            </div>

                            <div class="card mt-3">
                                <div class="card-header">
                                    <h6 class="mb-0">快速操作</h6>
                                </div>
                                <div class="card-body">
                                    <div class="d-grid gap-2">
                                        <button class="btn btn-primary btn-sm" onclick="editSupplier('${supplier.id}')">
                                            <i class="fas fa-edit me-1"></i>编辑信息
                                        </button>
                                        <button class="btn btn-info btn-sm" onclick="viewSupplierProducts('${supplier.id}')">
                                            <i class="fas fa-box me-1"></i>查看产品
                                        </button>
                                        <button class="btn btn-success btn-sm" onclick="contactSupplier('${supplier.id}')">
                                            <i class="fas fa-phone me-1"></i>联系供应商
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 联系供应商
function contactSupplier(id) {
    console.log('联系供应商:', id);
    showNotification('联系供应商功能开发中', 'info');
}

// 显示供应商编辑弹窗
function showSupplierModal(supplier = null) {
    const isEdit = supplier !== null;
    const title = isEdit ? '编辑供应商' : '添加供应商';

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'supplierModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-building me-2"></i>${title}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="supplierForm">
                        ${isEdit ? `<input type="hidden" id="supplierId" value="${supplier.id}">` : ''}
                        <div class="row">
                            <div class="col-md-8 mb-3">
                                <label class="form-label">供应商名称 <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="supplierName" value="${isEdit ? supplier.name : ''}" required>
                            </div>
                            <div class="col-md-4 mb-3">
                                <label class="form-label">合作等级</label>
                                <select class="form-select" id="supplierLevel">
                                    <option value="supplier" ${isEdit && supplier.level === 'supplier' ? 'selected' : ''}>普通供应商</option>
                                    <option value="partner" ${isEdit && supplier.level === 'partner' ? 'selected' : ''}>合作伙伴</option>
                                    <option value="core" ${isEdit && supplier.level === 'core' ? 'selected' : ''}>核心供应商</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">联系人</label>
                                <input type="text" class="form-control" id="supplierContact" value="${isEdit ? (supplier.contact || '') : ''}">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">联系电话</label>
                                <input type="tel" class="form-control" id="supplierPhone" value="${isEdit ? (supplier.phone || '') : ''}">
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">邮箱地址</label>
                                <input type="email" class="form-control" id="supplierEmail" value="${isEdit ? (supplier.email || '') : ''}">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">合作开始时间</label>
                                <input type="date" class="form-control" id="supplierCooperationStart" value="${isEdit ? (supplier.cooperationStart || '') : ''}">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">公司地址</label>
                            <input type="text" class="form-control" id="supplierAddress" value="${isEdit ? (supplier.address || '') : ''}">
                        </div>
                        <div class="mb-3">
                            <label class="form-label">供应商描述</label>
                            <textarea class="form-control" id="supplierDescription" rows="3">${isEdit ? (supplier.description || '') : ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">状态</label>
                                <select class="form-select" id="supplierStatus">
                                    <option value="active" ${isEdit && supplier.status === 'active' ? 'selected' : ''}>活跃</option>
                                    <option value="inactive" ${isEdit && supplier.status === 'inactive' ? 'selected' : ''}>非活跃</option>
                                    <option value="suspended" ${isEdit && supplier.status === 'suspended' ? 'selected' : ''}>暂停合作</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">网站地址</label>
                                <input type="url" class="form-control" id="supplierWebsite" value="${isEdit ? (supplier.website || '') : ''}" placeholder="https://">
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">主营业务</label>
                            <div class="row">
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="businessEndoscope">
                                        <label class="form-check-label" for="businessEndoscope">
                                            内窥镜设备
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="businessOptical">
                                        <label class="form-check-label" for="businessOptical">
                                            光学设备
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="businessPrecision">
                                        <label class="form-check-label" for="businessPrecision">
                                            精密仪器
                                        </label>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="businessDetection">
                                        <label class="form-check-label" for="businessDetection">
                                            检测设备
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="saveSupplier()">
                        <i class="fas fa-save me-1"></i>${isEdit ? '保存更改' : '创建供应商'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 保存供应商
async function saveSupplier() {
    const supplierId = document.getElementById('supplierId')?.value;
    const name = document.getElementById('supplierName').value.trim();
    const level = document.getElementById('supplierLevel').value;
    const contact = document.getElementById('supplierContact').value.trim();
    const phone = document.getElementById('supplierPhone').value.trim();
    const email = document.getElementById('supplierEmail').value.trim();
    const address = document.getElementById('supplierAddress').value.trim();
    const description = document.getElementById('supplierDescription').value.trim();
    const status = document.getElementById('supplierStatus').value;
    const website = document.getElementById('supplierWebsite').value.trim();
    const cooperationStart = document.getElementById('supplierCooperationStart').value;

    if (!name) {
        showNotification('请填写供应商名称', 'warning');
        return;
    }

    try {
        const supplierData = {
            id: supplierId || generateSupplierId(name),
            name: name,
            contact: contact,
            phone: phone,
            email: email,
            address: address,
            description: description,
            level: level,
            levelName: getLevelName(level),
            status: status,
            statusName: getStatusName(status),
            website: website,
            cooperationStart: cooperationStart || new Date().toISOString().split('T')[0],
            productCount: supplierId ? undefined : 0,
            business: {
                endoscope: document.getElementById('businessEndoscope').checked,
                optical: document.getElementById('businessOptical').checked,
                precision: document.getElementById('businessPrecision').checked,
                detection: document.getElementById('businessDetection').checked
            }
        };

        // 使用文件操作模块保存供应商
        if (window.fileOperations) {
            if (supplierId) {
                await window.fileOperations.updateSupplier(supplierData);
            } else {
                await window.fileOperations.createSupplier(supplierData);
            }
        }

        // 更新本地数据
        const dataLoader = window.contentDataLoader;
        if (dataLoader && dataLoader.contentData) {
            if (!dataLoader.contentData.suppliers) {
                dataLoader.contentData.suppliers = [];
            }

            if (supplierId) {
                // 更新现有供应商
                const index = dataLoader.contentData.suppliers.findIndex(s => s.id === supplierId);
                if (index > -1) {
                    dataLoader.contentData.suppliers[index] = { ...dataLoader.contentData.suppliers[index], ...supplierData };
                }
            } else {
                // 添加新供应商
                dataLoader.contentData.suppliers.push(supplierData);
            }
        }

        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('supplierModal'));
        modal.hide();

        // 显示成功消息
        const action = supplierId ? '更新' : '创建';
        showNotification(`供应商"${name}"${action}成功`, 'success');

        // 刷新供应商列表
        loadSuppliers();

    } catch (error) {
        console.error('保存供应商失败:', error);
        showNotification(`保存供应商失败: ${error.message}`, 'danger');
    }
}

// 辅助函数
function getLevelName(level) {
    switch(level) {
        case 'core': return '核心供应商';
        case 'partner': return '合作伙伴';
        case 'supplier': return '普通供应商';
        default: return '普通供应商';
    }
}

function getStatusName(status) {
    switch(status) {
        case 'active': return '活跃';
        case 'inactive': return '非活跃';
        case 'suspended': return '暂停合作';
        default: return '活跃';
    }
}

// 生成供应商ID
function generateSupplierId(name) {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    return `supplier-${timestamp}-${randomStr}`;
}

// 批量操作函数
function batchEnableSuppliers() {
    const checkedBoxes = document.querySelectorAll('.supplier-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要启用的供应商', 'warning');
        return;
    }

    if (confirm(`确定要启用选中的 ${ids.length} 个供应商吗？`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
                    const supplier = dataLoader.contentData.suppliers.find(s => s.id === id);
                    if (supplier) {
                        supplier.status = 'active';
                        supplier.statusName = '活跃';
                        successCount++;
                    }
                }
            }

            showNotification(`成功启用 ${successCount} 个供应商`, 'success');
            loadSuppliers();

        } catch (error) {
            console.error('批量启用失败:', error);
            showNotification(`批量启用失败: ${error.message}`, 'danger');
        }
    }
}

function batchDisableSuppliers() {
    const checkedBoxes = document.querySelectorAll('.supplier-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要禁用的供应商', 'warning');
        return;
    }

    if (confirm(`确定要禁用选中的 ${ids.length} 个供应商吗？`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
                    const supplier = dataLoader.contentData.suppliers.find(s => s.id === id);
                    if (supplier) {
                        supplier.status = 'inactive';
                        supplier.statusName = '非活跃';
                        successCount++;
                    }
                }
            }

            showNotification(`成功禁用 ${successCount} 个供应商`, 'success');
            loadSuppliers();

        } catch (error) {
            console.error('批量禁用失败:', error);
            showNotification(`批量禁用失败: ${error.message}`, 'danger');
        }
    }
}

async function batchDeleteSuppliers() {
    const checkedBoxes = document.querySelectorAll('.supplier-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要删除的供应商', 'warning');
        return;
    }

    if (confirm(`确定要删除选中的 ${ids.length} 个供应商吗？\n\n注意：此操作将永久删除供应商，无法恢复！`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                // 使用文件操作模块删除供应商
                if (window.fileOperations) {
                    await window.fileOperations.deleteSupplier(id);
                }

                // 从本地数据中移除
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
                    const index = dataLoader.contentData.suppliers.findIndex(s => s.id === id);
                    if (index > -1) {
                        dataLoader.contentData.suppliers.splice(index, 1);
                        successCount++;
                    }
                }
            }

            showNotification(`成功删除 ${successCount} 个供应商`, 'success');
            loadSuppliers();

        } catch (error) {
            console.error('批量删除失败:', error);
            showNotification(`批量删除失败: ${error.message}`, 'danger');
        }
    }
}

function batchExportSuppliers() {
    const checkedBoxes = document.querySelectorAll('.supplier-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要导出的供应商', 'warning');
        return;
    }

    try {
        const dataLoader = window.contentDataLoader;
        const exportData = [];

        for (const id of ids) {
            if (dataLoader && dataLoader.contentData && dataLoader.contentData.suppliers) {
                const supplier = dataLoader.contentData.suppliers.find(s => s.id === id);
                if (supplier) {
                    exportData.push({
                        ID: supplier.id,
                        供应商名称: supplier.name,
                        联系人: supplier.contact || '',
                        联系电话: supplier.phone || '',
                        邮箱: supplier.email || '',
                        地址: supplier.address || '',
                        合作等级: supplier.levelName,
                        状态: supplier.statusName,
                        产品数量: supplier.productCount,
                        合作开始: supplier.cooperationStart,
                        描述: supplier.description || ''
                    });
                }
            }
        }

        // 转换为CSV格式
        const csvContent = convertToCSV(exportData);

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `供应商导出_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification(`成功导出 ${exportData.length} 个供应商`, 'success');

    } catch (error) {
        console.error('批量导出失败:', error);
        showNotification(`批量导出失败: ${error.message}`, 'danger');
    }
}

// 案例管理函数
async function showCasesList() {
    console.log('showCasesList 被调用');
    updatePageTitle('案例列表', '管理成功案例');

    // 确保数据加载器已初始化
    await ensureDataLoaderInitialized();

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">案例列表</h4>
                <p class="text-muted mb-0">管理成功案例</p>
            </div>
            <button class="btn btn-primary" onclick="createCase()">
                <i class="fas fa-plus me-2"></i>添加新案例
            </button>
        </div>

        <!-- 搜索和筛选 -->
        <div class="card mb-4">
            <div class="card-body">
                <div class="row g-3">
                    <div class="col-md-3">
                        <input type="text" class="form-control" placeholder="搜索案例标题..." id="caseSearchInput">
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="caseIndustryFilter">
                            <option value="">所有行业</option>
                            <option value="automotive">汽车制造</option>
                            <option value="aerospace">航空航天</option>
                            <option value="energy">新能源</option>
                            <option value="petrochemical">石油化工</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="caseApplicationFilter">
                            <option value="">所有应用</option>
                            <option value="quality-inspection">质量检测</option>
                            <option value="blade-inspection">叶片检测</option>
                            <option value="pipeline-inspection">管道检测</option>
                            <option value="gearbox-inspection">齿轮箱检测</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <select class="form-select" id="caseStatusFilter">
                            <option value="">所有状态</option>
                            <option value="published">已发布</option>
                            <option value="draft">草稿</option>
                            <option value="featured">推荐案例</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <button class="btn btn-outline-primary w-100" onclick="filterCases()">
                            <i class="fas fa-search me-2"></i>搜索
                        </button>
                    </div>
                    <div class="col-md-1">
                        <button class="btn btn-outline-secondary w-100" onclick="exportCases()" title="导出案例">
                            <i class="fas fa-download"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 案例列表 -->
        <div class="row" id="casesList">
            <!-- 动态生成的案例卡片 -->
        </div>

        <!-- 分页 -->
        <nav aria-label="案例分页" class="mt-4">
            <ul class="pagination justify-content-center" id="casePagination">
                <!-- 动态生成的分页 -->
            </ul>
        </nav>

        <!-- 批量操作 -->
        <div class="card mt-3" id="caseBatchActionsCard" style="display: none;">
            <div class="card-body">
                <div class="d-flex align-items-center gap-3">
                    <span class="text-muted">已选择 <span id="caseSelectedCount">0</span> 项</span>
                    <button class="btn btn-sm btn-outline-success" onclick="batchPublishCases()">批量发布</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="batchFeatureCases()">设为推荐</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="batchDeleteCases()">批量删除</button>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadCasesList();
}

// 加载案例列表
async function loadCasesList() {
    // 确保数据加载器已初始化
    await ensureDataLoaderInitialized();

    // 从数据加载器获取案例数据
    const dataLoader = window.contentDataLoader;
    let casesData = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.cases) {
        casesData = dataLoader.contentData.cases.map((caseItem, index) => ({
            id: caseItem.id || `case-${index + 1}`,
            title: caseItem.title,
            summary: caseItem.summary,
            industry: caseItem.industry || '工业制造',
            application: caseItem.application || '设备检测',
            scenario: caseItem.scenario || '设备内部检测',
            client: caseItem.client || '知名企业客户',
            status: caseItem.status || 'published',
            statusName: caseItem.status === 'published' ? '已发布' : '草稿',
            featured: caseItem.featured || false,
            publishDate: caseItem.publishDate || new Date().toISOString().split('T')[0],
            duration: caseItem.duration || '3个月',
            result: caseItem.result || '显著提升检测效果',
            thumbnail: caseItem.thumbnail || '/images/cases/default.jpg',
            products_used: caseItem.products_used || ['工业内窥镜'],
            technologies: caseItem.technologies || ['检测技术'],
            challenges: caseItem.challenges || '传统检测方法存在局限性',
            solution: caseItem.solution || '采用先进内窥镜技术进行检测',
            benefits: caseItem.benefits || ['检测效果显著提升']
        }));
    } else {
        // 备用数据
        casesData = [
            {
                id: 'case-001',
                title: '汽车制造业质量检测解决方案',
                summary: '通过引入先进的无损检测技术，帮助客户实现了生产线质量检测的全面升级',
                industry: '汽车制造',
                application: '质量检测',
                scenario: '发动机缸体检测',
                client: '某知名汽车厂',
                status: 'published',
                statusName: '已发布',
                featured: true,
                publishDate: '2024-01-14',
                duration: '3个月',
                result: '检测效率提升60%',
                thumbnail: '/images/cases/automotive.jpg',
                products_used: ['WS-K08510', 'P08510'],
                technologies: ['工业内窥镜', '无损检测'],
                challenges: '传统检测方法效率低，无法满足生产需求',
                solution: '采用高清工业内窥镜进行实时检测',
                benefits: ['效率提升60%', '成本降低30%', '质量提升显著']
            },
            {
                id: 'case-002',
                title: '航空发动机叶片检测案例',
                summary: '为航空发动机制造商提供精密叶片检测解决方案',
                industry: '航空航天',
                application: '叶片检测',
                scenario: '发动机叶片检测',
                client: '航空发动机公司',
                status: 'published',
                statusName: '已发布',
                featured: false,
                publishDate: '2024-01-10',
                duration: '4个月',
                result: '零缺陷检测率',
                thumbnail: '/images/cases/aviation.jpg',
                products_used: ['WS-K08510', 'WS-K09510'],
                technologies: ['工业内窥镜', '三维测量'],
                challenges: '设备结构复杂，检测精度要求极高',
                solution: '采用三维测量工业内窥镜进行精密检测',
                benefits: ['零缺陷检测', '质量提升显著', '故障预防']
            }
        ];
    }

    // 渲染案例列表
    renderCasesList(casesData);

    // 绑定复选框事件
    bindCaseCheckboxEvents();

    console.log(`案例列表加载完成: ${casesData.length} 个案例`);
}

// 渲染案例列表
function renderCasesList(casesData) {
    const tbody = document.getElementById('caseTableBody');
    if (!tbody) return;

    if (casesData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="text-muted">
                        <i class="fas fa-briefcase fa-3x mb-3"></i>
                        <p class="mb-0">暂无案例数据</p>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = casesData.map(caseItem => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input case-checkbox" value="${caseItem.id}">
            </td>
            <td>
                <img src="${caseItem.thumbnail}" alt="${caseItem.title}" class="img-thumbnail" style="width: 60px; height: 40px; object-fit: cover;">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <h6 class="mb-1">${caseItem.title}</h6>
                        <small class="text-muted">${caseItem.summary}</small>
                        ${caseItem.featured ? '<span class="badge bg-warning ms-2">推荐</span>' : ''}
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-primary">${caseItem.industry}</span>
            </td>
            <td>
                <span class="badge bg-info">${caseItem.application}</span>
            </td>
            <td>${caseItem.client}</td>
            <td>
                <span class="badge ${caseItem.status === 'published' ? 'bg-success' : 'bg-warning'}">
                    ${caseItem.statusName}
                </span>
            </td>
            <td>${caseItem.publishDate}</td>
            <td>
                <div class="btn-group btn-group-sm" role="group">
                    <button class="btn btn-outline-primary" onclick="editCase('${caseItem.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="previewCase('${caseItem.id}')" title="预览">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteCase('${caseItem.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 绑定案例复选框事件
function bindCaseCheckboxEvents() {
    const selectAllCheckbox = document.getElementById('selectAllCases');
    const caseCheckboxes = document.querySelectorAll('.case-checkbox');
    const batchActionsCard = document.getElementById('caseBatchActionsCard');
    const selectedCountSpan = document.getElementById('caseSelectedCount');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            caseCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateCaseSelectedCount();
        });
    }

    caseCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCaseSelectedCount);
    });

    function updateCaseSelectedCount() {
        const selectedCheckboxes = document.querySelectorAll('.case-checkbox:checked');
        const count = selectedCheckboxes.length;

        if (selectedCountSpan) {
            selectedCountSpan.textContent = count;
        }

        if (batchActionsCard) {
            batchActionsCard.style.display = count > 0 ? 'block' : 'none';
        }

        if (selectAllCheckbox) {
            selectAllCheckbox.indeterminate = count > 0 && count < caseCheckboxes.length;
            selectAllCheckbox.checked = count === caseCheckboxes.length && count > 0;
        }
    }
}

function createCase() {
    console.log('createCase 被调用');
    alert('添加案例功能');
}

function showCaseIndustries() {
    console.log('showCaseIndustries 被调用');
    alert('行业分类管理功能');
    updatePageTitle('行业分类管理', '管理案例行业分类');
}

function showCaseApplications() {
    console.log('showCaseApplications 被调用');
    alert('应用领域管理功能');
    updatePageTitle('应用领域管理', '管理案例应用领域');
}

// 页面管理函数
function editBusinessPage() {
    console.log('editBusinessPage 被调用');
    updatePageTitle('商务服务页面', '编辑商务服务页面内容');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">商务服务页面编辑</h4>
                <p class="text-muted mb-0">编辑商务服务页面内容</p>
            </div>
            <div>
                <button class="btn btn-outline-info me-2" onclick="previewBusinessPage()">
                    <i class="fas fa-eye me-2"></i>预览页面
                </button>
                <button class="btn btn-success" onclick="saveBusinessPage()">
                    <i class="fas fa-save me-2"></i>保存更改
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- 页面基本信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">页面基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="businessPageTitle" class="form-label">页面标题</label>
                            <input type="text" class="form-control" id="businessPageTitle" value="商务服务 - VisNDT无损检测平台">
                        </div>
                        <div class="mb-3">
                            <label for="businessPageSubtitle" class="form-label">页面副标题</label>
                            <input type="text" class="form-control" id="businessPageSubtitle" value="为制造商提供专业的无损检测设备和解决方案">
                        </div>
                        <div class="mb-3">
                            <label for="businessPageDescription" class="form-label">页面描述</label>
                            <textarea class="form-control" id="businessPageDescription" rows="3">VisNDT商务服务平台为制造商提供全方位的无损检测解决方案，包括设备采购、技术支持、培训服务等。</textarea>
                        </div>
                    </div>
                </div>

                <!-- 服务内容编辑 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">服务内容</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-4">
                            <h6>设备采购服务</h6>
                            <textarea class="form-control" rows="4" placeholder="编辑设备采购服务内容...">我们提供全系列无损检测设备，包括工业内窥镜、超声波检测仪、磁粉探伤仪等，满足不同行业的检测需求。专业的技术团队为您推荐最适合的设备解决方案。</textarea>
                        </div>
                        <div class="mb-4">
                            <h6>技术支持服务</h6>
                            <textarea class="form-control" rows="4" placeholder="编辑技术支持服务内容...">提供7×24小时技术支持，包括设备安装调试、操作培训、故障排除等。我们的工程师团队具有丰富的现场经验，能够快速解决各种技术问题。</textarea>
                        </div>
                        <div class="mb-4">
                            <h6>培训服务</h6>
                            <textarea class="form-control" rows="4" placeholder="编辑培训服务内容...">定期举办无损检测技术培训班，涵盖理论知识和实操技能。提供认证培训课程，帮助客户培养专业的检测人员。</textarea>
                        </div>
                        <div class="mb-4">
                            <h6>维护保养服务</h6>
                            <textarea class="form-control" rows="4" placeholder="编辑维护保养服务内容...">提供设备定期维护、保养、校准等服务，确保设备始终处于最佳工作状态。建立设备档案，制定个性化的维护计划。</textarea>
                        </div>
                    </div>
                </div>

                <!-- 联系方式 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">联系方式</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="businessPhone" class="form-label">联系电话</label>
                                    <input type="text" class="form-control" id="businessPhone" value="15222189183">
                                </div>
                                <div class="mb-3">
                                    <label for="businessEmail" class="form-label">邮箱地址</label>
                                    <input type="email" class="form-control" id="businessEmail" value="wangxuan@sz-wise.cn">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="businessAddress" class="form-label">公司地址</label>
                                    <textarea class="form-control" id="businessAddress" rows="3">广东省深圳市南山区科技园</textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <!-- 页面设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">页面设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="businessPageStatus" class="form-label">页面状态</label>
                            <select class="form-select" id="businessPageStatus">
                                <option value="published" selected>已发布</option>
                                <option value="draft">草稿</option>
                                <option value="maintenance">维护中</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="businessShowInMenu" checked>
                                <label class="form-check-label" for="businessShowInMenu">
                                    在导航菜单中显示
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="businessEnableComments">
                                <label class="form-check-label" for="businessEnableComments">
                                    启用评论功能
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- SEO设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">SEO设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="businessSeoTitle" class="form-label">SEO标题</label>
                            <input type="text" class="form-control" id="businessSeoTitle" value="商务服务 - VisNDT无损检测平台">
                        </div>
                        <div class="mb-3">
                            <label for="businessSeoKeywords" class="form-label">关键词</label>
                            <input type="text" class="form-control" id="businessSeoKeywords" value="商务服务,无损检测,设备采购,技术支持">
                        </div>
                        <div class="mb-3">
                            <label for="businessSeoDescription" class="form-label">SEO描述</label>
                            <textarea class="form-control" id="businessSeoDescription" rows="3">VisNDT商务服务平台为制造商提供专业的无损检测设备和解决方案</textarea>
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card">
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="saveBusinessPage()">
                                <i class="fas fa-save me-2"></i>保存更改
                            </button>
                            <button class="btn btn-outline-info" onclick="previewBusinessPage()">
                                <i class="fas fa-eye me-2"></i>预览页面
                            </button>
                            <button class="btn btn-outline-secondary" onclick="resetBusinessPage()">
                                <i class="fas fa-undo me-2"></i>重置内容
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
}

function editApplicationsPage() {
    console.log('editApplicationsPage 被调用');
    alert('应用领域页面编辑功能');
    updatePageTitle('应用领域页面', '编辑应用领域页面内容');
}

function editAboutPage() {
    console.log('editAboutPage 被调用');
    alert('关于我们页面编辑功能');
    updatePageTitle('关于我们页面', '编辑关于我们页面内容');
}

function editContactPage() {
    console.log('editContactPage 被调用');
    alert('联系我们页面编辑功能');
    updatePageTitle('联系我们页面', '编辑联系我们页面内容');
}

// 系统设置函数
function showSiteSettings() {
    console.log('showSiteSettings 被调用');
    updatePageTitle('网站设置', '管理网站基本设置');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">网站设置</h4>
                <p class="text-muted mb-0">管理网站基本设置</p>
            </div>
            <button class="btn btn-success" onclick="saveSiteSettings()">
                <i class="fas fa-save me-2"></i>保存所有设置
            </button>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- 基本信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">网站基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="siteName" class="form-label">网站名称</label>
                                    <input type="text" class="form-control" id="siteName" value="VisNDT无损检测平台">
                                </div>
                                <div class="mb-3">
                                    <label for="siteSlogan" class="form-label">网站标语</label>
                                    <input type="text" class="form-control" id="siteSlogan" value="专业无损检测设备供应商">
                                </div>
                                <div class="mb-3">
                                    <label for="siteUrl" class="form-label">网站地址</label>
                                    <input type="url" class="form-control" id="siteUrl" value="https://visndt.com">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="adminEmail" class="form-label">管理员邮箱</label>
                                    <input type="email" class="form-control" id="adminEmail" value="admin@visndt.com">
                                </div>
                                <div class="mb-3">
                                    <label for="contactPhone" class="form-label">联系电话</label>
                                    <input type="tel" class="form-control" id="contactPhone" value="15222189183">
                                </div>
                                <div class="mb-3">
                                    <label for="companyAddress" class="form-label">公司地址</label>
                                    <textarea class="form-control" id="companyAddress" rows="2">广东省深圳市南山区科技园</textarea>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="siteDescription" class="form-label">网站描述</label>
                            <textarea class="form-control" id="siteDescription" rows="3">VisNDT是专业的无损检测设备供应商，提供工业内窥镜、检测相机等高质量产品和解决方案。</textarea>
                        </div>
                    </div>
                </div>

                <!-- 功能设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">功能设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="enableComments" checked>
                                        <label class="form-check-label" for="enableComments">
                                            启用评论功能
                                        </label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="enableSearch" checked>
                                        <label class="form-check-label" for="enableSearch">
                                            启用搜索功能
                                        </label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="enableNewsletter">
                                        <label class="form-check-label" for="enableNewsletter">
                                            启用邮件订阅
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="enableAnalytics" checked>
                                        <label class="form-check-label" for="enableAnalytics">
                                            启用访问统计
                                        </label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="enableCache" checked>
                                        <label class="form-check-label" for="enableCache">
                                            启用页面缓存
                                        </label>
                                    </div>
                                </div>
                                <div class="mb-3">
                                    <div class="form-check">
                                        <input class="form-check-input" type="checkbox" id="maintenanceMode">
                                        <label class="form-check-label" for="maintenanceMode">
                                            维护模式
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 显示设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">显示设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="postsPerPage" class="form-label">每页显示文章数</label>
                                    <select class="form-select" id="postsPerPage">
                                        <option value="10" selected>10篇</option>
                                        <option value="15">15篇</option>
                                        <option value="20">20篇</option>
                                        <option value="25">25篇</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="dateFormat" class="form-label">日期格式</label>
                                    <select class="form-select" id="dateFormat">
                                        <option value="Y-m-d" selected>2024-01-15</option>
                                        <option value="Y/m/d">2024/01/15</option>
                                        <option value="d/m/Y">15/01/2024</option>
                                        <option value="M d, Y">Jan 15, 2024</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="timeZone" class="form-label">时区设置</label>
                                    <select class="form-select" id="timeZone">
                                        <option value="Asia/Shanghai" selected>北京时间 (UTC+8)</option>
                                        <option value="UTC">协调世界时 (UTC)</option>
                                        <option value="America/New_York">纽约时间 (UTC-5)</option>
                                    </select>
                                </div>
                                <div class="mb-3">
                                    <label for="language" class="form-label">默认语言</label>
                                    <select class="form-select" id="language">
                                        <option value="zh-CN" selected>简体中文</option>
                                        <option value="zh-TW">繁体中文</option>
                                        <option value="en-US">English</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <!-- 网站Logo -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">网站Logo</h5>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-3">
                            <img src="/images/logo-dark.png" alt="网站Logo" class="img-fluid" style="max-height: 80px;">
                        </div>
                        <button class="btn btn-outline-primary btn-sm" onclick="uploadLogo()">
                            <i class="fas fa-upload me-2"></i>更换Logo
                        </button>
                        <div class="form-text mt-2">建议尺寸：200x60px，支持PNG、JPG格式</div>
                    </div>
                </div>

                <!-- 网站图标 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">网站图标</h5>
                    </div>
                    <div class="card-body text-center">
                        <div class="mb-3">
                            <img src="/favicon.ico" alt="网站图标" style="width: 32px; height: 32px;">
                        </div>
                        <button class="btn btn-outline-primary btn-sm" onclick="uploadFavicon()">
                            <i class="fas fa-upload me-2"></i>更换图标
                        </button>
                        <div class="form-text mt-2">建议尺寸：32x32px，ICO格式</div>
                    </div>
                </div>

                <!-- 社交媒体 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">社交媒体</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="wechatQr" class="form-label">微信二维码</label>
                            <input type="url" class="form-control" id="wechatQr" placeholder="微信二维码图片地址">
                        </div>
                        <div class="mb-3">
                            <label for="weiboUrl" class="form-label">微博地址</label>
                            <input type="url" class="form-control" id="weiboUrl" placeholder="https://weibo.com/...">
                        </div>
                        <div class="mb-3">
                            <label for="linkedinUrl" class="form-label">LinkedIn地址</label>
                            <input type="url" class="form-control" id="linkedinUrl" placeholder="https://linkedin.com/...">
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card">
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="saveSiteSettings()">
                                <i class="fas fa-save me-2"></i>保存设置
                            </button>
                            <button class="btn btn-outline-info" onclick="previewSite()">
                                <i class="fas fa-eye me-2"></i>预览网站
                            </button>
                            <button class="btn btn-outline-secondary" onclick="resetSiteSettings()">
                                <i class="fas fa-undo me-2"></i>重置设置
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
}

function showSEOSettings() {
    console.log('showSEOSettings 被调用');
    alert('SEO设置功能');
    updatePageTitle('SEO设置', '管理SEO设置');
}

function showBackupRestore() {
    console.log('showBackupRestore 被调用');
    alert('备份恢复功能');
    updatePageTitle('备份恢复', '管理数据备份和恢复');
}

// 菜单展开/收起函数
function toggleSection(sectionName) {
    console.log('toggleSection 被调用:', sectionName);
    const content = document.getElementById(sectionName + '-content');
    const icon = document.getElementById(sectionName + '-icon');
    
    if (content && icon) {
        if (content.classList.contains('collapsed')) {
            content.classList.remove('collapsed');
            icon.className = 'fas fa-chevron-down';
        } else {
            content.classList.add('collapsed');
            icon.className = 'fas fa-chevron-right';
        }
    }
}

// 辅助函数 - 更新页面标题
function updatePageTitle(title, subtitle) {
    const titleElement = document.getElementById('contentTitle');
    const subtitleElement = document.getElementById('contentSubtitle');

    if (titleElement) titleElement.textContent = title;
    if (subtitleElement) subtitleElement.textContent = subtitle;
}

// 辅助函数 - 显示动态内容
function showDynamicContent(content) {
    // 隐藏欢迎页面，显示动态内容
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('dynamicContent').style.display = 'block';
    document.getElementById('dynamicContent').innerHTML = content;
}

// 辅助函数 - 显示欢迎页面
function showWelcomePage() {
    document.getElementById('welcomePage').style.display = 'block';
    document.getElementById('dynamicContent').style.display = 'none';
    updatePageTitle('欢迎使用内容管理中心', '选择左侧菜单开始管理您的网站内容');
}

// 辅助函数 - 显示动态内容
function showDynamicContent(content) {
    // 隐藏欢迎页面，显示动态内容
    document.getElementById('welcomePage').style.display = 'none';
    document.getElementById('dynamicContent').style.display = 'block';
    document.getElementById('dynamicContent').innerHTML = content;
}

// 辅助函数 - 显示欢迎页面
function showWelcomePage() {
    document.getElementById('welcomePage').style.display = 'block';
    document.getElementById('dynamicContent').style.display = 'none';
    updatePageTitle('欢迎使用内容管理中心', '选择左侧菜单开始管理您的网站内容');
}

// 资讯管理相关函数
function loadNewsList() {
    // 从数据加载器获取资讯数据
    const dataLoader = window.contentDataLoader;
    let newsData = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.news) {
        newsData = dataLoader.contentData.news.map(news => ({
            ...news,
            categoryName: getCategoryName(news.categories),
            statusName: getNewsStatusName(news.status)
        }));
    } else {
        // 备用资讯数据
        newsData = [
            {
                id: 'news001',
                title: '2024年工业内窥镜技术发展趋势',
                categories: ['技术动态'],
                categoryName: '技术动态',
                status: 'published',
                statusName: '已发布',
                publishDate: '2024-01-15',
                views: 1250,
                author: '技术部',
                summary: '分析工业内窥镜在新一年的技术发展方向和市场趋势',
                content: '随着工业4.0的深入发展，工业内窥镜技术也在不断创新...',
                tags: ['工业内窥镜', '技术趋势', '工业4.0'],
                thumbnail: '/images/news/tech-trend-2024.jpg'
            },
            {
                id: 'news002',
                title: '参展2024年上海工博会圆满成功',
                categories: ['展会资讯'],
                categoryName: '展会资讯',
                status: 'published',
                statusName: '已发布',
                publishDate: '2024-01-12',
                views: 890,
                author: '市场部',
                summary: '公司携最新产品参展上海工博会，获得广泛关注',
                content: '2024年上海工博会于近日圆满落幕，我公司携带最新研发的...',
                tags: ['工博会', '展会', '新产品'],
                thumbnail: '/images/news/expo-2024.jpg'
            },
            {
                id: 'news003',
                title: '新一代超细内窥镜产品发布',
                categories: ['公司新闻'],
                categoryName: '公司新闻',
                status: 'draft',
                statusName: '草稿',
                publishDate: '2024-01-10',
                views: 0,
                author: '产品部',
                summary: '公司发布新一代0.8mm超细内窥镜，技术领先行业',
                content: '经过两年的研发，我公司正式发布新一代0.8mm超细内窥镜...',
                tags: ['新产品', '超细内窥镜', '技术创新'],
                thumbnail: '/images/news/new-product.jpg'
            },
            {
                id: 'news004',
                title: '工业检测行业市场分析报告',
                categories: ['行业资讯'],
                categoryName: '行业资讯',
                status: 'published',
                statusName: '已发布',
                publishDate: '2024-01-08',
                views: 720,
                author: '市场研究部',
                summary: '深度分析工业检测设备市场现状和未来发展趋势',
                content: '根据最新市场调研数据，工业检测设备市场呈现稳步增长态势...',
                tags: ['市场分析', '行业报告', '发展趋势'],
                thumbnail: '/images/news/market-analysis.jpg'
            }
        ];
    }

    const tbody = document.getElementById('newsTableBody');
    if (!tbody) return;

    tbody.innerHTML = newsData.map(news => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input news-checkbox" value="${news.id}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <div>
                        <h6 class="mb-1">${news.title}</h6>
                        <small class="text-muted">作者: ${news.author}</small>
                    </div>
                </div>
            </td>
            <td>
                <span class="badge bg-secondary">${news.categoryName}</span>
            </td>
            <td>
                <span class="badge ${getStatusBadgeClass(news.status)}">${news.statusName}</span>
            </td>
            <td>
                <small>${news.publishDate}</small>
            </td>
            <td>
                <span class="text-muted">${news.views}</span>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editNews('${news.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="previewNews('${news.id}')" title="预览">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="duplicateNews('${news.id}')" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteNews('${news.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // 绑定复选框事件
    bindNewsCheckboxEvents();
}

function getStatusBadgeClass(status) {
    switch(status) {
        case 'published': return 'bg-success';
        case 'draft': return 'bg-warning';
        case 'archived': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

function getCategoryName(categories) {
    if (!categories || !Array.isArray(categories) || categories.length === 0) {
        return '未分类';
    }
    return categories[0]; // 返回第一个分类
}

function getNewsStatusName(status) {
    switch(status) {
        case 'published': return '已发布';
        case 'draft': return '草稿';
        case 'archived': return '已归档';
        default: return '未知';
    }
}

function bindNewsCheckboxEvents() {
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAllNews');
    const newsCheckboxes = document.querySelectorAll('.news-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            newsCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateBatchActions();
        });
    }

    // 单个复选框事件
    newsCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateBatchActions);
    });
}

function updateBatchActions() {
    const checkedBoxes = document.querySelectorAll('.news-checkbox:checked');
    const batchActionsCard = document.getElementById('batchActionsCard');
    const selectedCount = document.getElementById('selectedCount');

    if (checkedBoxes.length > 0) {
        batchActionsCard.style.display = 'block';
        selectedCount.textContent = checkedBoxes.length;
    } else {
        batchActionsCard.style.display = 'none';
    }
}

function filterNews() {
    const searchTerm = document.getElementById('newsSearchInput').value;
    const category = document.getElementById('newsCategoryFilter').value;
    const status = document.getElementById('newsStatusFilter').value;

    console.log('筛选条件:', { searchTerm, category, status });
    alert(`筛选功能：搜索"${searchTerm}"，分类"${category}"，状态"${status}"`);
}

function editNews(id) {
    console.log('编辑资讯:', id);

    // 获取资讯数据
    const dataLoader = window.contentDataLoader;
    let news = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.news) {
        news = dataLoader.contentData.news.find(n => n.id === id);
    }

    if (!news) {
        alert('未找到资讯数据');
        return;
    }

    showNewsEditForm(news, false);
}

function showNewsEditForm(news, isNew = false) {
    const title = isNew ? '添加资讯' : '编辑资讯';
    const subtitle = isNew ? '创建新资讯' : `编辑 ${news.title}`;

    updatePageTitle(title, subtitle);

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">编辑资讯</h4>
                <p class="text-muted mb-0">编辑 ${news.title}</p>
            </div>
            <div>
                <button class="btn btn-outline-secondary me-2" onclick="showNewsList()">
                    <i class="fas fa-arrow-left me-2"></i>返回列表
                </button>
                <button class="btn btn-success" onclick="saveNewsChanges('${id}')">
                    <i class="fas fa-save me-2"></i>保存更改
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- 基本信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newsTitle" class="form-label">资讯标题</label>
                            <input type="text" class="form-control" id="newsTitle" value="${news.title}">
                        </div>
                        <div class="mb-3">
                            <label for="newsSummary" class="form-label">资讯摘要</label>
                            <textarea class="form-control" id="newsSummary" rows="3">${news.summary || ''}</textarea>
                        </div>
                        <div class="mb-3">
                            <label for="newsContent" class="form-label">资讯内容</label>
                            <textarea class="form-control" id="newsContent" rows="10">${news.content || ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="newsAuthor" class="form-label">作者</label>
                                    <input type="text" class="form-control" id="newsAuthor" value="${news.author || ''}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="newsCategory" class="form-label">分类</label>
                                    <select class="form-select" id="newsCategory">
                                        <option value="技术动态" ${(news.categories && news.categories.includes('技术动态')) ? 'selected' : ''}>技术动态</option>
                                        <option value="展会资讯" ${(news.categories && news.categories.includes('展会资讯')) ? 'selected' : ''}>展会资讯</option>
                                        <option value="公司新闻" ${(news.categories && news.categories.includes('公司新闻')) ? 'selected' : ''}>公司新闻</option>
                                        <option value="行业资讯" ${(news.categories && news.categories.includes('行业资讯')) ? 'selected' : ''}>行业资讯</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="newsTags" class="form-label">标签</label>
                            <input type="text" class="form-control" id="newsTags"
                                   value="${(news.tags || []).join(', ')}"
                                   placeholder="多个标签用逗号分隔">
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <!-- 发布设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">发布设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newsStatus" class="form-label">状态</label>
                            <select class="form-select" id="newsStatus">
                                <option value="published" ${news.status === 'published' ? 'selected' : ''}>已发布</option>
                                <option value="draft" ${news.status === 'draft' ? 'selected' : ''}>草稿</option>
                                <option value="archived" ${news.status === 'archived' ? 'selected' : ''}>已归档</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="newsPublishDate" class="form-label">发布时间</label>
                            <input type="date" class="form-control" id="newsPublishDate" value="${news.publishDate || ''}">
                        </div>
                    </div>
                </div>

                <!-- 资讯图片 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">资讯图片</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="newsThumbnail" class="form-label">缩略图</label>
                            <input type="text" class="form-control" id="newsThumbnail" value="${news.thumbnail || ''}">
                        </div>
                        <div class="text-center">
                            <img src="${news.thumbnail || '/images/placeholder.svg'}"
                                 class="img-fluid rounded" style="max-height: 200px;" alt="资讯图片">
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card">
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="saveNewsChanges('${id}')">
                                <i class="fas fa-save me-2"></i>保存更改
                            </button>
                            <button class="btn btn-outline-info" onclick="previewNews('${id}')">
                                <i class="fas fa-eye me-2"></i>预览资讯
                            </button>
                            <button class="btn btn-outline-secondary" onclick="showNewsList()">
                                <i class="fas fa-arrow-left me-2"></i>返回列表
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
}

// 保存资讯更改
function saveNewsChanges(id) {
    const newsData = {
        id: id,
        title: document.getElementById('newsTitle').value,
        summary: document.getElementById('newsSummary').value,
        content: document.getElementById('newsContent').value,
        author: document.getElementById('newsAuthor').value,
        categories: [document.getElementById('newsCategory').value],
        tags: document.getElementById('newsTags').value.split(',').map(tag => tag.trim()).filter(tag => tag),
        status: document.getElementById('newsStatus').value,
        publishDate: document.getElementById('newsPublishDate').value,
        thumbnail: document.getElementById('newsThumbnail').value
    };

    console.log('保存资讯数据:', newsData);
    alert('资讯保存成功！\n\n注意：这是演示版本，实际保存功能需要后端API支持。');
    showNewsList();
}

// 预览资讯
function previewNews(id) {
    console.log('预览资讯:', id);
    window.open(`/news/${id}/`, '_blank');
}

function previewNews(id) {
    console.log('预览资讯:', id);
    alert(`预览资讯 ID: ${id}`);
}

function duplicateNews(id) {
    console.log('复制资讯:', id);

    // 获取原资讯数据
    const dataLoader = window.contentDataLoader;
    let originalNews = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.news) {
        originalNews = dataLoader.contentData.news.find(n => n.id === id);
    }

    if (!originalNews) {
        alert('未找到要复制的资讯数据');
        return;
    }

    // 创建复制的资讯数据
    const duplicatedNews = {
        ...originalNews,
        id: `${originalNews.id}-copy-${Date.now()}`,
        title: `${originalNews.title} (副本)`,
        status: 'draft',
        statusName: '草稿',
        publishDate: new Date().toISOString().split('T')[0],
        views: 0
    };

    // 显示编辑界面
    showNewsEditForm(duplicatedNews, true);
}

async function deleteNews(id) {
    // 获取资讯数据以显示确认信息
    const dataLoader = window.contentDataLoader;
    let news = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.news) {
        news = dataLoader.contentData.news.find(n => n.id === id);
    }

    const newsTitle = news ? news.title : id;

    if (confirm(`确定要删除资讯"${newsTitle}"吗？\n\n注意：此操作将永久删除资讯文件，无法恢复！`)) {
        console.log('删除资讯:', id);

        try {
            // 使用文件操作模块删除资讯
            if (window.fileOperations) {
                await window.fileOperations.deleteNews(id);
            }

            // 从本地数据中移除
            if (dataLoader && dataLoader.contentData && dataLoader.contentData.news) {
                const index = dataLoader.contentData.news.findIndex(n => n.id === id);
                if (index > -1) {
                    dataLoader.contentData.news.splice(index, 1);
                }
            }

            // 显示成功消息
            showNotification(`资讯"${newsTitle}"已删除`, 'success');

            // 重新加载资讯列表
            loadNewsList();
        } catch (error) {
            console.error('删除资讯失败:', error);
            showNotification(`删除资讯失败: ${error.message}`, 'danger');
        }
    }
}

function batchPublishNews() {
    const checkedBoxes = document.querySelectorAll('.news-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);
    console.log('批量发布:', ids);
    alert(`批量发布 ${ids.length} 篇资讯`);
}

function batchArchiveNews() {
    const checkedBoxes = document.querySelectorAll('.news-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);
    console.log('批量归档:', ids);
    alert(`批量归档 ${ids.length} 篇资讯`);
}

function batchDeleteNews() {
    const checkedBoxes = document.querySelectorAll('.news-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);
    if (confirm(`确定要删除选中的 ${ids.length} 篇资讯吗？`)) {
        console.log('批量删除:', ids);
        alert(`批量删除 ${ids.length} 篇资讯`);
        loadNewsList();
    }
}

// 资讯保存相关函数
function saveNews() {
    const title = document.getElementById('newsTitle').value;
    const category = document.getElementById('newsCategory').value;
    const author = document.getElementById('newsAuthor').value;
    const content = document.getElementById('newsContent').value;
    const status = document.getElementById('newsStatus').value;

    if (!title.trim()) {
        alert('请输入资讯标题');
        return;
    }

    if (!category) {
        alert('请选择资讯分类');
        return;
    }

    if (!content.trim()) {
        alert('请输入资讯内容');
        return;
    }

    console.log('保存资讯:', { title, category, author, content, status });
    alert('资讯保存成功！');

    // 返回列表页面
    showNewsList();
}

function saveDraft() {
    const title = document.getElementById('newsTitle').value;
    const category = document.getElementById('newsCategory').value;
    const content = document.getElementById('newsContent').value;

    console.log('保存草稿:', { title, category, content });
    alert('草稿保存成功！');
}

function uploadCoverImage() {
    alert('上传封面图片功能（待实现文件上传）');
}

// 产品管理相关函数
async function loadProductsList() {
    try {
        console.log('开始加载产品列表...');

        // 确保数据加载器已初始化
        await ensureDataLoaderInitialized();

        // 从数据加载器获取实际产品数据
        const dataLoader = window.contentDataLoader;
        let productData = [];

        if (dataLoader && dataLoader.contentData && dataLoader.contentData.products && dataLoader.contentData.products.length > 0) {
            console.log(`从数据加载器获取到 ${dataLoader.contentData.products.length} 个产品`);
            productData = dataLoader.contentData.products.map((product, index) => ({
                id: product.id || `product-${index + 1}`,
                title: product.title || '未命名产品',
                summary: product.summary || '',
                model: product.model || '',
                series: product.series || '',
                primary_category: product.primary_category || '电子内窥镜',
                secondary_category: product.secondary_category || '',
                status: product.status || 'published',
                statusName: product.status === 'published' ? '已发布' : product.status === 'draft' ? '草稿' : '已归档',
                published: product.published || new Date().toISOString(),
                thumbnail: product.thumbnail || '/images/placeholder.svg',
                supplier: product.supplier || '深圳市微视光电科技有限公司',
                featured: product.featured || false
            }));
        } else {
            console.warn('数据加载器中没有产品数据，尝试备用方案...');
            // 备用数据 - 如果数据加载器不可用，尝试直接调用其方法
            try {
                if (window.ContentDataLoader) {
                    console.log('尝试使用临时加载器...');
                    const tempLoader = new ContentDataLoader();
                    const tempData = await tempLoader.loadProductsFromKnownFiles();
                    if (tempData && tempData.length > 0) {
                        productData = tempData;
                        console.log(`通过临时加载器获取了 ${productData.length} 个产品`);
                        // 更新主数据加载器
                        if (dataLoader && dataLoader.contentData) {
                            dataLoader.contentData.products = tempData;
                        }
                    } else {
                        throw new Error('临时加载器返回空数据');
                    }
                } else {
                    throw new Error('ContentDataLoader 不可用');
                }
            } catch (error) {
                console.warn('临时加载器失败，使用最小备用数据:', error);
                // 最小备用数据集
                productData = [
                    {
                        id: 'WS-K08510-a',
                        title: 'WS-K08510超细工业电子内窥镜',
                        summary: '0.85mm超小直径，高清成像，适用于极小空间检测',
                        model: 'WS-K08510',
                        series: 'K系列',
                        supplier: '深圳市微视光电科技有限公司',
                        primary_category: '电子内窥镜',
                        secondary_category: '工业视频内窥镜',
                        status: 'published',
                        statusName: '已发布',
                        published: '2025-01-01T12:00:00+08:00',
                        thumbnail: '/images/products/K-series/K-main.jpg',
                        featured: true
                    }
                ];
            }
        }

        console.log(`最终获取到 ${productData.length} 个产品数据`);

        // 设置全局变量
        filteredProducts = [...productData];
        totalProducts = filteredProducts.length;

        // 渲染当前页的产品
        renderProductsPage();

        // 渲染分页控件
        renderProductPagination();

        // 绑定复选框事件
        bindProductCheckboxEvents();

        // 更新统计信息
        updateProductStats();

        console.log('产品列表加载完成');

    } catch (error) {
        console.error('加载产品列表失败:', error);

        // 显示错误状态
        const tbody = document.getElementById('productTableBody');
        if (tbody) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="9" class="text-center py-4">
                        <div class="empty-state">
                            <i class="fas fa-exclamation-triangle text-warning fa-3x mb-3"></i>
                            <div class="empty-title">产品列表加载失败</div>
                            <div class="empty-description">错误信息: ${error.message}</div>
                            <button class="btn btn-primary mt-3" onclick="loadProductsList()">
                                <i class="fas fa-refresh me-2"></i>重新加载
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        }

        // 显示通知
        showNotification(`产品列表加载失败: ${error.message}`, 'danger');

        throw error;
    }
}

// 渲染产品页面
function renderProductsPage() {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;

    if (filteredProducts.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-box empty-icon"></i>
                        <div class="empty-title">暂无产品数据</div>
                        <div class="empty-description">点击上方"添加新产品"按钮开始添加产品</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    // 计算当前页的产品
    const startIndex = (currentProductPage - 1) * productPageSize;
    const endIndex = startIndex + productPageSize;
    const currentPageProducts = filteredProducts.slice(startIndex, endIndex);

    tbody.innerHTML = currentPageProducts.map(product => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input product-checkbox" value="${product.id}">
            </td>
            <td>
                <img src="${product.thumbnail}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" alt="${product.title}" onerror="this.src='/images/placeholder.svg'">
            </td>
            <td>
                <div>
                    <h6 class="mb-1">${product.title}</h6>
                    <small class="text-muted">${product.summary || '暂无描述'}</small>
                    ${product.featured ? '<span class="badge bg-warning text-dark ms-1">推荐</span>' : ''}
                </div>
            </td>
            <td><code>${product.model}</code></td>
            <td>
                <span class="text-primary">${product.supplier || '深圳市微视光电科技有限公司'}</span>
            </td>
            <td>
                <span class="badge bg-secondary">${product.primary_category}</span>
                ${product.secondary_category ? `<br><small class="text-muted">${product.secondary_category}</small>` : ''}
            </td>
            <td><span class="badge ${getProductStatusBadgeClass(product.status)}">${product.statusName || '已发布'}</span></td>
            <td>
                <small class="text-muted">
                    ${product.published ? new Date(product.published).toLocaleDateString('zh-CN') : '未知'}
                </small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editProduct('${product.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewProduct('${product.id}')" title="预览">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="duplicateProduct('${product.id}')" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteProduct('${product.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 渲染分页控件
function renderProductPagination() {
    const paginationContainer = document.getElementById('productPagination');
    const paginationInfo = document.getElementById('productPaginationInfo');

    if (!paginationContainer) return;

    const totalPages = Math.ceil(filteredProducts.length / productPageSize);

    // 更新分页信息
    if (paginationInfo) {
        const startIndex = (currentProductPage - 1) * productPageSize + 1;
        const endIndex = Math.min(currentProductPage * productPageSize, filteredProducts.length);
        paginationInfo.textContent = `显示 ${startIndex}-${endIndex} 条，共 ${filteredProducts.length} 条记录`;
    }

    if (totalPages <= 1) {
        paginationContainer.innerHTML = '';
        return;
    }

    let paginationHTML = '';

    // 上一页按钮
    paginationHTML += `
        <li class="page-item ${currentProductPage === 1 ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToProductPage(${currentProductPage - 1})" tabindex="-1">上一页</a>
        </li>
    `;

    // 页码按钮
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentProductPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToProductPage(1)">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentProductPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToProductPage(${i})">${i}</a>
            </li>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToProductPage(${totalPages})">${totalPages}</a>
            </li>
        `;
    }

    // 下一页按钮
    paginationHTML += `
        <li class="page-item ${currentProductPage === totalPages ? 'disabled' : ''}">
            <a class="page-link" href="#" onclick="goToProductPage(${currentProductPage + 1})">下一页</a>
        </li>
    `;

    paginationContainer.innerHTML = paginationHTML;
}

// 跳转到指定页面
function goToProductPage(page) {
    if (page < 1 || page > Math.ceil(filteredProducts.length / productPageSize)) {
        return;
    }

    currentProductPage = page;
    renderProductsPage();
    renderProductPagination();
    bindProductCheckboxEvents();
}

// 改变每页显示数量
function changeProductPageSize() {
    const pageSizeSelect = document.getElementById('productPageSize');
    if (pageSizeSelect) {
        productPageSize = parseInt(pageSizeSelect.value);
        currentProductPage = 1; // 重置到第一页
        renderProductsPage();
        renderProductPagination();
        bindProductCheckboxEvents();
    }
}

function getProductStatusBadgeClass(status) {
    switch(status) {
        case 'published': return 'bg-success';
        case 'draft': return 'bg-warning';
        case 'archived': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

function bindProductCheckboxEvents() {
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAllProducts');
    const productCheckboxes = document.querySelectorAll('.product-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            productCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateProductBatchActions();
        });
    }

    // 单个复选框事件
    productCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateProductBatchActions);
    });
}

function updateProductBatchActions() {
    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    const batchActionsCard = document.getElementById('productBatchActionsCard');
    const selectedCount = document.getElementById('productSelectedCount');

    if (checkedBoxes.length > 0) {
        batchActionsCard.style.display = 'block';
        selectedCount.textContent = checkedBoxes.length;
    } else {
        batchActionsCard.style.display = 'none';
    }
}

function filterProducts() {
    const searchTerm = document.getElementById('productSearchInput').value;
    const category = document.getElementById('productCategoryFilter').value;
    const supplier = document.getElementById('productSupplierFilter').value;
    const status = document.getElementById('productStatusFilter').value;

    console.log('筛选产品:', { searchTerm, category, supplier, status });

    // 获取产品数据
    const dataLoader = window.contentDataLoader;
    let allProducts = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
        allProducts = dataLoader.contentData.products;
    }

    // 应用筛选条件
    filteredProducts = allProducts.filter(product => {
        // 搜索条件
        if (searchTerm && !product.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
            !product.model.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        // 分类筛选
        if (category && product.primary_category !== category) {
            return false;
        }

        // 供应商筛选
        if (supplier && product.supplier !== supplier) {
            return false;
        }

        // 状态筛选
        if (status && product.status !== status) {
            return false;
        }

        return true;
    });

    // 重置到第一页
    currentProductPage = 1;

    // 更新产品列表显示
    renderProductsPage();
    renderProductPagination();
    bindProductCheckboxEvents();

    // 更新统计信息
    const totalCount = allProducts.length;
    const filteredCount = filteredProducts.length;
    showNotification(`筛选完成：显示 ${filteredCount} / ${totalCount} 个产品`, 'info');
}

// 更新产品表格显示
function updateProductTable(productData) {
    const tbody = document.getElementById('productTableBody');
    if (!tbody) return;

    if (productData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-search empty-icon"></i>
                        <div class="empty-title">没有找到匹配的产品</div>
                        <div class="empty-description">请尝试调整筛选条件</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = productData.map(product => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input product-checkbox" value="${product.id}">
            </td>
            <td>
                <img src="${product.thumbnail}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" alt="${product.title}" onerror="this.src='/images/placeholder.svg'">
            </td>
            <td>
                <div>
                    <h6 class="mb-1">${product.title}</h6>
                    <small class="text-muted">${product.summary || '暂无描述'}</small>
                    ${product.featured ? '<span class="badge bg-warning text-dark ms-1">推荐</span>' : ''}
                </div>
            </td>
            <td><code>${product.model}</code></td>
            <td>
                <span class="text-primary">${product.supplier || '深圳市微视光电科技有限公司'}</span>
            </td>
            <td>
                <span class="badge bg-secondary">${product.primary_category}</span>
                ${product.secondary_category ? `<br><small class="text-muted">${product.secondary_category}</small>` : ''}
            </td>
            <td><span class="badge ${getProductStatusBadgeClass(product.status)}">${product.statusName || '已发布'}</span></td>
            <td>
                <small class="text-muted">
                    ${product.published ? new Date(product.published).toLocaleDateString('zh-CN') : '未知'}
                </small>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editProduct('${product.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewProduct('${product.id}')" title="预览">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="duplicateProduct('${product.id}')" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteProduct('${product.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function editProduct(id) {
    console.log('编辑产品:', id);

    // 获取产品数据
    const dataLoader = window.contentDataLoader;
    let product = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
        product = dataLoader.contentData.products.find(p => p.id === id);
    }

    if (!product) {
        showNotification('未找到产品数据', 'warning');
        return;
    }

    showEditProductModal(product);
}

function showEditProductModal(product) {
    // 获取分类和供应商数据
    const dataLoader = window.contentDataLoader;
    const categories = dataLoader?.contentData?.categories || [];
    const suppliers = dataLoader?.contentData?.suppliers || [];

    // 生成主要分类选项
    const primaryCategoryOptions = categories
        .filter(cat => !cat.parent) // 只获取顶级分类
        .map(cat => `<option value="${cat.id}" ${product.primary_category === cat.id || product.primary_category === cat.title ? 'selected' : ''}>${cat.title}</option>`)
        .join('');

    // 生成次要分类选项
    const secondaryCategoryOptions = categories
        .filter(cat => cat.parent) // 只获取子分类
        .map(cat => `<option value="${cat.id}" ${product.secondary_category === cat.id || product.secondary_category === cat.title ? 'selected' : ''}>${cat.title}</option>`)
        .join('');

    // 生成供应商选项
    const supplierOptions = suppliers.length > 0
        ? suppliers.map(supplier => `<option value="${supplier.title}" ${product.supplier === supplier.title ? 'selected' : ''}>${supplier.title}</option>`).join('')
        : `<option value="深圳市微视光电科技有限公司" ${product.supplier === '深圳市微视光电科技有限公司' ? 'selected' : ''}>深圳市微视光电科技有限公司</option>`;

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'editProductModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-xl">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-edit me-2"></i>编辑产品 - ${product.title}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="editProductForm">
                        <input type="hidden" id="editProductId" value="${product.id}">
                        <div class="row">
                            <!-- 基本信息 -->
                            <div class="col-md-8">
                                <div class="card mb-4">
                                    <div class="card-header">
                                        <h6 class="mb-0">基本信息</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">产品名称 <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="editProductTitle" value="${product.title}" required>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">产品型号 <span class="text-danger">*</span></label>
                                                <input type="text" class="form-control" id="editProductModel" value="${product.model}" required>
                                            </div>
                                        </div>
                                        <div class="mb-3">
                                            <label class="form-label">产品描述</label>
                                            <textarea class="form-control" id="editProductSummary" rows="3">${product.summary || ''}</textarea>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">主要分类 <span class="text-danger">*</span></label>
                                                <select class="form-select" id="editProductPrimaryCategory" required>
                                                    <option value="">请选择分类</option>
                                                    ${primaryCategoryOptions}
                                                </select>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">次要分类</label>
                                                <select class="form-select" id="editProductSecondaryCategory">
                                                    <option value="">请选择次要分类</option>
                                                    ${secondaryCategoryOptions}
                                                </select>
                                            </div>
                                        </div>
                                        <div class="row">
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">供应商</label>
                                                <select class="form-select" id="editProductSupplier">
                                                    ${supplierOptions}
                                                </select>
                                            </div>
                                            <div class="col-md-6 mb-3">
                                                <label class="form-label">产品状态</label>
                                                <select class="form-select" id="editProductStatus">
                                                    <option value="published" ${product.status === 'published' ? 'selected' : ''}>已发布</option>
                                                    <option value="draft" ${product.status === 'draft' ? 'selected' : ''}>草稿</option>
                                                    <option value="archived" ${product.status === 'archived' ? 'selected' : ''}>已归档</option>
                                                </select>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- 产品参数 -->
                                <div class="card mb-4">
                                    <div class="card-header d-flex justify-content-between align-items-center">
                                        <h6 class="mb-0">产品参数</h6>
                                        <button type="button" class="btn btn-sm btn-outline-primary" onclick="addEditParameterRow()">
                                            <i class="fas fa-plus me-1"></i>添加参数
                                        </button>
                                    </div>
                                    <div class="card-body">
                                        <div id="editProductParametersContainer">
                                            ${renderProductParameters(product.parameters || [])}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 图片管理 -->
                            <div class="col-md-4">
                                <div class="card">
                                    <div class="card-header">
                                        <h6 class="mb-0">产品图片</h6>
                                    </div>
                                    <div class="card-body">
                                        <div class="mb-3">
                                            <label class="form-label">主图</label>
                                            <div class="image-upload-area" onclick="document.getElementById('editMainImageInput').click()">
                                                <img id="editMainImagePreview" src="${product.thumbnail}" style="width: 100%; height: 200px; object-fit: cover;">
                                            </div>
                                            <input type="file" id="editMainImageInput" accept="image/*" style="display: none;" onchange="previewEditMainImage(this)">
                                        </div>

                                        <div class="mb-3">
                                            <label class="form-label">产品图库</label>
                                            <div class="image-gallery" id="editProductGallery">
                                                ${renderProductGallery(product.gallery || [])}
                                            </div>
                                            <button type="button" class="btn btn-outline-primary btn-sm w-100" onclick="document.getElementById('editGalleryImageInput').click()">
                                                <i class="fas fa-plus me-1"></i>添加图片
                                            </button>
                                            <input type="file" id="editGalleryImageInput" accept="image/*" multiple style="display: none;" onchange="addEditGalleryImages(this)">
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="updateProduct()">
                        <i class="fas fa-save me-1"></i>保存更改
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 渲染产品参数
function renderProductParameters(parameters) {
    if (!parameters || parameters.length === 0) {
        return `
            <div class="row mb-2 parameter-row">
                <div class="col-md-4">
                    <input type="text" class="form-control" placeholder="参数名称" name="editParamName[]">
                </div>
                <div class="col-md-6">
                    <input type="text" class="form-control" placeholder="参数值" name="editParamValue[]">
                </div>
                <div class="col-md-2">
                    <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeEditParameterRow(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    return parameters.map(param => `
        <div class="row mb-2 parameter-row">
            <div class="col-md-4">
                <input type="text" class="form-control" value="${param.name}" name="editParamName[]">
            </div>
            <div class="col-md-6">
                <input type="text" class="form-control" value="${param.value}" name="editParamValue[]">
            </div>
            <div class="col-md-2">
                <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeEditParameterRow(this)">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 渲染产品图库
function renderProductGallery(gallery) {
    if (!gallery || gallery.length === 0) {
        return '';
    }

    return gallery.map(image => `
        <div class="gallery-item mb-2">
            <div class="position-relative">
                <img src="${image.image}" class="img-thumbnail" style="width: 100%; height: 80px; object-fit: cover;">
                <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0" onclick="removeEditGalleryImage(this)" style="transform: translate(50%, -50%);">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        </div>
    `).join('');
}

// 编辑模式的参数管理
function addEditParameterRow() {
    const container = document.getElementById('editProductParametersContainer');
    const newRow = document.createElement('div');
    newRow.className = 'row mb-2 parameter-row';
    newRow.innerHTML = `
        <div class="col-md-4">
            <input type="text" class="form-control" placeholder="参数名称" name="editParamName[]">
        </div>
        <div class="col-md-6">
            <input type="text" class="form-control" placeholder="参数值" name="editParamValue[]">
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-outline-danger btn-sm" onclick="removeEditParameterRow(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(newRow);
}

function removeEditParameterRow(button) {
    const row = button.closest('.parameter-row');
    row.remove();
}

// 编辑模式的图片管理
function previewEditMainImage(input) {
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('editMainImagePreview');
            preview.src = e.target.result;
        };
        reader.readAsDataURL(input.files[0]);
    }
}

function addEditGalleryImages(input) {
    if (input.files && input.files.length > 0) {
        const gallery = document.getElementById('editProductGallery');

        Array.from(input.files).forEach((file, index) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageDiv = document.createElement('div');
                imageDiv.className = 'gallery-item mb-2';
                imageDiv.innerHTML = `
                    <div class="position-relative">
                        <img src="${e.target.result}" class="img-thumbnail" style="width: 100%; height: 80px; object-fit: cover;">
                        <button type="button" class="btn btn-danger btn-sm position-absolute top-0 end-0" onclick="removeEditGalleryImage(this)" style="transform: translate(50%, -50%);">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                gallery.appendChild(imageDiv);
            };
            reader.readAsDataURL(file);
        });
    }
}

function removeEditGalleryImage(button) {
    const imageDiv = button.closest('.gallery-item');
    imageDiv.remove();
}

// 更新产品
async function updateProduct() {
    const productId = document.getElementById('editProductId').value;
    const title = document.getElementById('editProductTitle').value.trim();
    const model = document.getElementById('editProductModel').value.trim();
    const primaryCategory = document.getElementById('editProductPrimaryCategory').value;

    if (!title || !model || !primaryCategory) {
        showNotification('请填写所有必填字段', 'warning');
        return;
    }

    try {
        // 收集更新的产品数据
        const updatedProductData = {
            id: productId,
            title: title,
            model: model,
            summary: document.getElementById('editProductSummary').value.trim(),
            primary_category: primaryCategory,
            secondary_category: document.getElementById('editProductSecondaryCategory').value,
            supplier: document.getElementById('editProductSupplier').value,
            status: document.getElementById('editProductStatus').value,
            published: new Date().toISOString(),
            thumbnail: document.getElementById('editMainImagePreview').src,
            parameters: collectEditProductParameters(),
            gallery: [], // 实际应该处理图库
            featured: false
        };

        // 使用文件操作模块更新产品
        if (window.fileOperations) {
            await window.fileOperations.updateProduct(productId, updatedProductData);
        }

        // 更新本地数据
        const dataLoader = window.contentDataLoader;
        if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
            const index = dataLoader.contentData.products.findIndex(p => p.id === productId);
            if (index > -1) {
                dataLoader.contentData.products[index] = updatedProductData;
            }
        }

        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('editProductModal'));
        modal.hide();

        // 显示成功消息
        showNotification(`产品"${title}"更新成功`, 'success');

        // 刷新产品列表
        loadProductsList();

    } catch (error) {
        console.error('更新产品失败:', error);
        showNotification(`更新产品失败: ${error.message}`, 'danger');
    }
}

// 收集编辑模式的产品参数
function collectEditProductParameters() {
    const parameters = [];
    const paramNames = document.querySelectorAll('input[name="editParamName[]"]');
    const paramValues = document.querySelectorAll('input[name="editParamValue[]"]');

    for (let i = 0; i < paramNames.length; i++) {
        const name = paramNames[i].value.trim();
        const value = paramValues[i].value.trim();

        if (name && value) {
            parameters.push({ name, value });
        }
    }

    return parameters;
}

function showProductEditForm(product, isNew = false) {
    const title = isNew ? '添加产品' : '编辑产品';
    const subtitle = isNew ? '创建新产品' : `编辑 ${product.title}`;

    updatePageTitle(title, subtitle);

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">编辑产品</h4>
                <p class="text-muted mb-0">编辑 ${product.title}</p>
            </div>
            <div>
                <button class="btn btn-outline-secondary me-2" onclick="showProductsList()">
                    <i class="fas fa-arrow-left me-2"></i>返回列表
                </button>
                <button class="btn btn-success" onclick="saveProductChanges('${id}')">
                    <i class="fas fa-save me-2"></i>保存更改
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- 基本信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="productTitle" class="form-label">产品标题</label>
                            <input type="text" class="form-control" id="productTitle" value="${product.title}">
                        </div>
                        <div class="mb-3">
                            <label for="productSummary" class="form-label">产品简介</label>
                            <textarea class="form-control" id="productSummary" rows="3">${product.summary || ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="productModel" class="form-label">产品型号</label>
                                    <input type="text" class="form-control" id="productModel" value="${product.model}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="productSeries" class="form-label">产品系列</label>
                                    <select class="form-select" id="productSeries">
                                        <option value="K系列" ${product.series === 'K系列' ? 'selected' : ''}>K系列</option>
                                        <option value="P系列" ${product.series === 'P系列' ? 'selected' : ''}>P系列</option>
                                        <option value="DZ系列" ${product.series === 'DZ系列' ? 'selected' : ''}>DZ系列</option>
                                        <option value="S系列" ${product.series === 'S系列' ? 'selected' : ''}>S系列</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="productCategory" class="form-label">主分类</label>
                                    <select class="form-select" id="productCategory">
                                        <option value="电子内窥镜" ${product.primary_category === '电子内窥镜' ? 'selected' : ''}>电子内窥镜</option>
                                        <option value="光纤内窥镜" ${product.primary_category === '光纤内窥镜' ? 'selected' : ''}>光纤内窥镜</option>
                                        <option value="光学内窥镜" ${product.primary_category === '光学内窥镜' ? 'selected' : ''}>光学内窥镜</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="productSecondaryCategory" class="form-label">次分类</label>
                                    <select class="form-select" id="productSecondaryCategory">
                                        <option value="工业视频内窥镜" ${product.secondary_category === '工业视频内窥镜' ? 'selected' : ''}>工业视频内窥镜</option>
                                        <option value="医疗内窥镜" ${product.secondary_category === '医疗内窥镜' ? 'selected' : ''}>医疗内窥镜</option>
                                        <option value="汽车检测内窥镜" ${product.secondary_category === '汽车检测内窥镜' ? 'selected' : ''}>汽车检测内窥镜</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="productSupplier" class="form-label">供应商</label>
                            <input type="text" class="form-control" id="productSupplier" value="${product.supplier}">
                        </div>
                    </div>
                </div>

                <!-- 产品参数 -->
                <div class="card mb-4">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0">产品参数</h5>
                        <button class="btn btn-sm btn-outline-primary" onclick="addProductParameter()">
                            <i class="fas fa-plus me-1"></i>添加参数
                        </button>
                    </div>
                    <div class="card-body">
                        <div id="productParameters">
                            ${(product.parameters || []).map((param, index) => `
                                <div class="row mb-2 parameter-row">
                                    <div class="col-md-4">
                                        <input type="text" class="form-control" placeholder="参数名称" value="${param.name}">
                                    </div>
                                    <div class="col-md-6">
                                        <input type="text" class="form-control" placeholder="参数值" value="${param.value}">
                                    </div>
                                    <div class="col-md-2">
                                        <button class="btn btn-outline-danger btn-sm w-100" onclick="removeParameter(this)">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <!-- 发布设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">发布设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="productStatus" class="form-label">状态</label>
                            <select class="form-select" id="productStatus">
                                <option value="published" ${product.status === 'published' ? 'selected' : ''}>已发布</option>
                                <option value="draft" ${product.status === 'draft' ? 'selected' : ''}>草稿</option>
                                <option value="archived" ${product.status === 'archived' ? 'selected' : ''}>已归档</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label for="productPublished" class="form-label">发布时间</label>
                            <input type="datetime-local" class="form-control" id="productPublished"
                                   value="${product.published ? new Date(product.published).toISOString().slice(0, 16) : ''}">
                        </div>
                    </div>
                </div>

                <!-- 产品图片 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">产品图片</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="productThumbnail" class="form-label">缩略图</label>
                            <input type="text" class="form-control" id="productThumbnail" value="${product.thumbnail || ''}">
                        </div>
                        <div class="text-center">
                            <img src="${product.thumbnail || '/images/placeholder.svg'}"
                                 class="img-fluid rounded" style="max-height: 200px;" alt="产品图片">
                        </div>
                        <button class="btn btn-outline-primary btn-sm mt-2 w-100" onclick="uploadProductImage()">
                            <i class="fas fa-upload me-2"></i>上传图片
                        </button>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card">
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="saveProductChanges('${id}')">
                                <i class="fas fa-save me-2"></i>保存更改
                            </button>
                            <button class="btn btn-outline-info" onclick="previewProduct('${id}')">
                                <i class="fas fa-eye me-2"></i>预览产品
                            </button>
                            <button class="btn btn-outline-secondary" onclick="showProductsList()">
                                <i class="fas fa-arrow-left me-2"></i>返回列表
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
}

function viewProduct(id) {
    console.log('查看产品:', id);

    // 获取产品数据
    const dataLoader = window.contentDataLoader;
    let product = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
        product = dataLoader.contentData.products.find(p => p.id === id);
    }

    if (!product) {
        showNotification('未找到产品数据', 'warning');
        return;
    }

    showProductPreviewModal(product);
}

function showProductPreviewModal(product) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'previewProductModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-eye me-2"></i>产品预览 - ${product.title}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row">
                        <div class="col-md-6">
                            <div class="product-image mb-3">
                                <img src="${product.thumbnail}" class="img-fluid rounded" alt="${product.title}" style="width: 100%; height: 300px; object-fit: cover;" onerror="this.src='/images/placeholder.svg'">
                            </div>
                            ${product.gallery && product.gallery.length > 0 ? `
                                <div class="product-gallery">
                                    <h6>产品图库</h6>
                                    <div class="row">
                                        ${product.gallery.map(img => `
                                            <div class="col-4 mb-2">
                                                <img src="${img.image}" class="img-thumbnail" style="width: 100%; height: 80px; object-fit: cover;">
                                            </div>
                                        `).join('')}
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                        <div class="col-md-6">
                            <div class="product-info">
                                <h4>${product.title}</h4>
                                <p class="text-muted mb-3">${product.summary || '暂无描述'}</p>

                                <div class="product-details">
                                    <div class="row mb-2">
                                        <div class="col-4"><strong>产品型号:</strong></div>
                                        <div class="col-8"><code>${product.model}</code></div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-4"><strong>供应商:</strong></div>
                                        <div class="col-8">${product.supplier || '深圳市微视光电科技有限公司'}</div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-4"><strong>主要分类:</strong></div>
                                        <div class="col-8"><span class="badge bg-secondary">${product.primary_category}</span></div>
                                    </div>
                                    ${product.secondary_category ? `
                                        <div class="row mb-2">
                                            <div class="col-4"><strong>次要分类:</strong></div>
                                            <div class="col-8"><span class="badge bg-light text-dark">${product.secondary_category}</span></div>
                                        </div>
                                    ` : ''}
                                    <div class="row mb-2">
                                        <div class="col-4"><strong>状态:</strong></div>
                                        <div class="col-8"><span class="badge ${getProductStatusBadgeClass(product.status)}">${product.statusName || '已发布'}</span></div>
                                    </div>
                                    <div class="row mb-2">
                                        <div class="col-4"><strong>发布时间:</strong></div>
                                        <div class="col-8">${product.published ? new Date(product.published).toLocaleDateString('zh-CN') : '未知'}</div>
                                    </div>
                                </div>

                                ${product.parameters && product.parameters.length > 0 ? `
                                    <div class="product-parameters mt-4">
                                        <h6>产品参数</h6>
                                        <div class="table-responsive">
                                            <table class="table table-sm">
                                                <tbody>
                                                    ${product.parameters.map(param => `
                                                        <tr>
                                                            <td><strong>${param.name}</strong></td>
                                                            <td>${param.value}</td>
                                                        </tr>
                                                    `).join('')}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    <button type="button" class="btn btn-primary" onclick="editProduct('${product.id}'); bootstrap.Modal.getInstance(document.getElementById('previewProductModal')).hide();">
                        <i class="fas fa-edit me-1"></i>编辑产品
                    </button>
                    <button type="button" class="btn btn-success" onclick="window.open('/products/${product.id}/', '_blank')">
                        <i class="fas fa-external-link-alt me-1"></i>前台预览
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 保存产品更改
function saveProductChanges(id) {
    const productData = {
        id: id,
        title: document.getElementById('productTitle').value,
        summary: document.getElementById('productSummary').value,
        model: document.getElementById('productModel').value,
        series: document.getElementById('productSeries').value,
        primary_category: document.getElementById('productCategory').value,
        secondary_category: document.getElementById('productSecondaryCategory').value,
        supplier: document.getElementById('productSupplier').value,
        status: document.getElementById('productStatus').value,
        published: document.getElementById('productPublished').value,
        thumbnail: document.getElementById('productThumbnail').value,
        parameters: getProductParameters()
    };

    console.log('保存产品数据:', productData);

    // 这里应该调用API保存数据
    // 暂时使用alert提示
    alert('产品保存成功！\n\n注意：这是演示版本，实际保存功能需要后端API支持。');

    // 返回产品列表
    showProductsList();
}

// 获取产品参数
function getProductParameters() {
    const parameters = [];
    const parameterRows = document.querySelectorAll('.parameter-row');

    parameterRows.forEach(row => {
        const nameInput = row.querySelector('input[placeholder="参数名称"]');
        const valueInput = row.querySelector('input[placeholder="参数值"]');

        if (nameInput.value && valueInput.value) {
            parameters.push({
                name: nameInput.value,
                value: valueInput.value
            });
        }
    });

    return parameters;
}

// 添加产品参数
function addProductParameter() {
    const container = document.getElementById('productParameters');
    const newRow = document.createElement('div');
    newRow.className = 'row mb-2 parameter-row';
    newRow.innerHTML = `
        <div class="col-md-4">
            <input type="text" class="form-control" placeholder="参数名称">
        </div>
        <div class="col-md-6">
            <input type="text" class="form-control" placeholder="参数值">
        </div>
        <div class="col-md-2">
            <button class="btn btn-outline-danger btn-sm w-100" onclick="removeParameter(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(newRow);
}

// 移除产品参数
function removeParameter(button) {
    button.closest('.parameter-row').remove();
}

// 预览产品
function previewProduct(id) {
    console.log('预览产品:', id);
    window.open(`/products/${id}/`, '_blank');
}

// 上传产品图片
function uploadProductImage() {
    alert('图片上传功能（待实现文件上传）');
}

// 保存新产品
function saveNewProduct() {
    // 验证必填字段
    const title = document.getElementById('newProductTitle').value.trim();
    const model = document.getElementById('newProductModel').value.trim();

    if (!title) {
        alert('请输入产品标题');
        document.getElementById('newProductTitle').focus();
        return;
    }

    if (!model) {
        alert('请输入产品型号');
        document.getElementById('newProductModel').focus();
        return;
    }

    const newProductData = {
        id: 'product-' + Date.now(), // 生成临时ID
        title: title,
        summary: document.getElementById('newProductSummary').value,
        model: model,
        series: document.getElementById('newProductSeries').value,
        primary_category: document.getElementById('newProductCategory').value,
        secondary_category: document.getElementById('newProductSecondaryCategory').value,
        supplier: document.getElementById('newProductSupplier').value,
        status: document.getElementById('newProductStatus').value,
        published: document.getElementById('newProductPublished').value,
        thumbnail: document.getElementById('newProductThumbnail').value || '/images/placeholder.svg',
        parameters: getNewProductParameters()
    };

    console.log('保存新产品数据:', newProductData);

    // 这里应该调用API保存数据
    // 暂时使用alert提示
    alert('新产品创建成功！\n\n注意：这是演示版本，实际保存功能需要后端API支持。');

    // 返回产品列表
    showProductsList();
}

// 获取新产品参数
function getNewProductParameters() {
    const parameters = [];
    const parameterRows = document.querySelectorAll('#newProductParameters .parameter-row');

    parameterRows.forEach(row => {
        const nameInput = row.querySelector('input[placeholder="参数名称"]');
        const valueInput = row.querySelector('input[placeholder="参数值"]');

        if (nameInput.value && valueInput.value) {
            parameters.push({
                name: nameInput.value,
                value: valueInput.value
            });
        }
    });

    return parameters;
}

// 添加新产品参数
function addNewProductParameter() {
    const container = document.getElementById('newProductParameters');
    const newRow = document.createElement('div');
    newRow.className = 'row mb-2 parameter-row';
    newRow.innerHTML = `
        <div class="col-md-4">
            <input type="text" class="form-control" placeholder="参数名称">
        </div>
        <div class="col-md-6">
            <input type="text" class="form-control" placeholder="参数值">
        </div>
        <div class="col-md-2">
            <button class="btn btn-outline-danger btn-sm w-100" onclick="removeParameter(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    container.appendChild(newRow);
}

// 上传新产品图片
function uploadNewProductImage() {
    alert('图片上传功能（待实现文件上传）');
}

function duplicateProduct(id) {
    console.log('复制产品:', id);

    // 获取原产品数据
    const dataLoader = window.contentDataLoader;
    let originalProduct = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
        originalProduct = dataLoader.contentData.products.find(p => p.id === id);
    }

    if (!originalProduct) {
        showNotification('未找到要复制的产品数据', 'warning');
        return;
    }

    showDuplicateProductModal(originalProduct);
}

function showDuplicateProductModal(originalProduct) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'duplicateProductModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-copy me-2"></i>复制产品 - ${originalProduct.title}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        将基于原产品创建副本，您可以修改以下信息后保存
                    </div>
                    <form id="duplicateProductForm">
                        <input type="hidden" id="originalProductId" value="${originalProduct.id}">
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">新产品名称 <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="duplicateProductTitle" value="${originalProduct.title} - 副本" required>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">新产品型号 <span class="text-danger">*</span></label>
                                <input type="text" class="form-control" id="duplicateProductModel" value="${originalProduct.model}-COPY" required>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">产品描述</label>
                            <textarea class="form-control" id="duplicateProductSummary" rows="3">${originalProduct.summary || ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">主要分类</label>
                                <select class="form-select" id="duplicateProductPrimaryCategory">
                                    <option value="electronic-endoscope" ${originalProduct.primary_category === 'electronic-endoscope' ? 'selected' : ''}>电子内窥镜</option>
                                    <option value="fiber-endoscope" ${originalProduct.primary_category === 'fiber-endoscope' ? 'selected' : ''}>光纤内窥镜</option>
                                    <option value="optical-endoscope" ${originalProduct.primary_category === 'optical-endoscope' ? 'selected' : ''}>光学内窥镜</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">次要分类</label>
                                <select class="form-select" id="duplicateProductSecondaryCategory">
                                    <option value="">请选择次要分类</option>
                                    <option value="industrial" ${originalProduct.secondary_category === 'industrial' ? 'selected' : ''}>工业检测</option>
                                    <option value="medical" ${originalProduct.secondary_category === 'medical' ? 'selected' : ''}>医疗检测</option>
                                    <option value="automotive" ${originalProduct.secondary_category === 'automotive' ? 'selected' : ''}>汽车检测</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">产品系列</label>
                                <select class="form-select" id="duplicateProductSeries">
                                    <option value="">请选择系列</option>
                                    <option value="K系列" ${originalProduct.series === 'K系列' ? 'selected' : ''}>K系列</option>
                                    <option value="P系列" ${originalProduct.series === 'P系列' ? 'selected' : ''}>P系列</option>
                                    <option value="S系列" ${originalProduct.series === 'S系列' ? 'selected' : ''}>S系列</option>
                                    <option value="DZ系列" ${originalProduct.series === 'DZ系列' ? 'selected' : ''}>DZ系列</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">供应商</label>
                                <select class="form-select" id="duplicateProductSupplier">
                                    <option value="深圳市微视光电科技有限公司" ${originalProduct.supplier === '深圳市微视光电科技有限公司' ? 'selected' : ''}>深圳市微视光电科技有限公司</option>
                                    <option value="北京精密仪器有限公司" ${originalProduct.supplier === '北京精密仪器有限公司' ? 'selected' : ''}>北京精密仪器有限公司</option>
                                    <option value="上海光学设备厂" ${originalProduct.supplier === '上海光学设备厂' ? 'selected' : ''}>上海光学设备厂</option>
                                </select>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">产品状态</label>
                                <select class="form-select" id="duplicateProductStatus">
                                    <option value="draft" selected>草稿</option>
                                    <option value="published">已发布</option>
                                    <option value="archived">已归档</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">是否推荐</label>
                                <select class="form-select" id="duplicateProductFeatured">
                                    <option value="false" selected>否</option>
                                    <option value="true">是</option>
                                </select>
                            </div>
                        </div>

                        <!-- 高级复制选项 -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-cog me-2"></i>复制选项
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="copyParameters" checked>
                                            <label class="form-check-label" for="copyParameters">
                                                复制产品参数
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="copyImages" checked>
                                            <label class="form-check-label" for="copyImages">
                                                复制产品图片
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="copyApplications" checked>
                                            <label class="form-check-label" for="copyApplications">
                                                复制应用场景
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="copyDownloads">
                                            <label class="form-check-label" for="copyDownloads">
                                                复制下载资料
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="copyRelatedProducts">
                                            <label class="form-check-label" for="copyRelatedProducts">
                                                复制相关产品
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="copyTags">
                                            <label class="form-check-label" for="copyTags">
                                                复制产品标签
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <div class="mt-3">
                                    <small class="text-muted">
                                        <i class="fas fa-info-circle me-1"></i>
                                        选择要复制的内容。取消选择的内容将不会包含在新产品中。
                                    </small>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-success" onclick="saveDuplicatedProduct()">
                        <i class="fas fa-copy me-1"></i>创建副本
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 保存复制的产品
async function saveDuplicatedProduct() {
    const originalProductId = document.getElementById('originalProductId').value;
    const title = document.getElementById('duplicateProductTitle').value.trim();
    const model = document.getElementById('duplicateProductModel').value.trim();
    const primaryCategory = document.getElementById('duplicateProductPrimaryCategory').value;

    if (!title || !model || !primaryCategory) {
        showNotification('请填写所有必填字段', 'warning');
        return;
    }

    try {
        // 获取原产品数据
        const dataLoader = window.contentDataLoader;
        let originalProduct = null;

        if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
            originalProduct = dataLoader.contentData.products.find(p => p.id === originalProductId);
        }

        if (!originalProduct) {
            showNotification('未找到原产品数据', 'error');
            return;
        }

        // 获取复制选项
        const copyOptions = {
            parameters: document.getElementById('copyParameters').checked,
            images: document.getElementById('copyImages').checked,
            applications: document.getElementById('copyApplications').checked,
            downloads: document.getElementById('copyDownloads').checked,
            relatedProducts: document.getElementById('copyRelatedProducts').checked,
            tags: document.getElementById('copyTags').checked
        };

        // 创建复制的产品数据
        const duplicatedProduct = {
            // 基本信息（总是复制）
            id: generateProductId(model),
            title: title,
            model: model,
            summary: document.getElementById('duplicateProductSummary').value.trim(),
            primary_category: primaryCategory,
            secondary_category: document.getElementById('duplicateProductSecondaryCategory').value,
            series: document.getElementById('duplicateProductSeries').value,
            supplier: document.getElementById('duplicateProductSupplier').value,
            status: document.getElementById('duplicateProductStatus').value,
            featured: document.getElementById('duplicateProductFeatured').value === 'true',
            published: new Date().toISOString(),

            // 可选复制的内容
            ...(copyOptions.parameters && originalProduct.parameters && { parameters: [...originalProduct.parameters] }),
            ...(copyOptions.images && originalProduct.thumbnail && { thumbnail: originalProduct.thumbnail }),
            ...(copyOptions.images && originalProduct.gallery && { gallery: [...originalProduct.gallery] }),
            ...(copyOptions.applications && originalProduct.applications && { applications: [...originalProduct.applications] }),
            ...(copyOptions.downloads && originalProduct.downloads && { downloads: [...originalProduct.downloads] }),
            ...(copyOptions.relatedProducts && originalProduct.related_products && { related_products: [...originalProduct.related_products] }),
            ...(copyOptions.tags && originalProduct.tags && { tags: [...originalProduct.tags] }),

            // 其他可能的字段
            ...(originalProduct.content && { content: originalProduct.content }),
            ...(originalProduct.specifications && { specifications: originalProduct.specifications }),
            ...(originalProduct.features && { features: originalProduct.features })
        };

        // 使用文件操作模块保存产品
        if (window.fileOperations) {
            await window.fileOperations.createProduct(duplicatedProduct);
        }

        // 添加到本地数据
        if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
            dataLoader.contentData.products.push(duplicatedProduct);
        }

        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('duplicateProductModal'));
        modal.hide();

        // 显示成功消息
        showNotification(`产品"${title}"复制成功`, 'success');

        // 刷新产品列表
        loadProductsList();

    } catch (error) {
        console.error('复制产品失败:', error);
        showNotification(`复制产品失败: ${error.message}`, 'danger');
    }
}

// 批量复制产品
function batchDuplicateProducts() {
    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要复制的产品', 'warning');
        return;
    }

    if (ids.length > 10) {
        showNotification('一次最多只能复制10个产品', 'warning');
        return;
    }

    showBatchDuplicateModal(ids);
}

// 显示批量复制弹窗
function showBatchDuplicateModal(productIds) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'batchDuplicateModal';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-copy me-2"></i>批量复制产品 (${productIds.length} 个)
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        将为选中的 ${productIds.length} 个产品创建副本，您可以设置统一的复制选项
                    </div>
                    <form id="batchDuplicateForm">
                        <input type="hidden" id="batchProductIds" value="${productIds.join(',')}">

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">名称后缀</label>
                                <input type="text" class="form-control" id="batchTitleSuffix" value=" - 副本" placeholder="例如：- 副本">
                                <small class="text-muted">将添加到每个产品名称后面</small>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">型号后缀</label>
                                <input type="text" class="form-control" id="batchModelSuffix" value="-COPY" placeholder="例如：-COPY">
                                <small class="text-muted">将添加到每个产品型号后面</small>
                            </div>
                        </div>

                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">统一状态</label>
                                <select class="form-select" id="batchStatus">
                                    <option value="draft" selected>草稿</option>
                                    <option value="published">已发布</option>
                                    <option value="archived">已归档</option>
                                </select>
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">统一推荐设置</label>
                                <select class="form-select" id="batchFeatured">
                                    <option value="false" selected>否</option>
                                    <option value="true">是</option>
                                </select>
                            </div>
                        </div>

                        <!-- 批量复制选项 -->
                        <div class="card mt-3">
                            <div class="card-header">
                                <h6 class="mb-0">
                                    <i class="fas fa-cog me-2"></i>批量复制选项
                                </h6>
                            </div>
                            <div class="card-body">
                                <div class="row">
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="batchCopyParameters" checked>
                                            <label class="form-check-label" for="batchCopyParameters">
                                                复制产品参数
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="batchCopyImages" checked>
                                            <label class="form-check-label" for="batchCopyImages">
                                                复制产品图片
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="batchCopyApplications" checked>
                                            <label class="form-check-label" for="batchCopyApplications">
                                                复制应用场景
                                            </label>
                                        </div>
                                    </div>
                                    <div class="col-md-6">
                                        <div class="form-check">
                                            <input class="form-check-input" type="checkbox" id="batchCopyDownloads">
                                            <label class="form-check-label" for="batchCopyDownloads">
                                                复制下载资料
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-success" onclick="saveBatchDuplicatedProducts()">
                        <i class="fas fa-copy me-1"></i>批量创建副本
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 保存批量复制的产品
async function saveBatchDuplicatedProducts() {
    const productIds = document.getElementById('batchProductIds').value.split(',');
    const titleSuffix = document.getElementById('batchTitleSuffix').value.trim();
    const modelSuffix = document.getElementById('batchModelSuffix').value.trim();
    const status = document.getElementById('batchStatus').value;
    const featured = document.getElementById('batchFeatured').value === 'true';

    const copyOptions = {
        parameters: document.getElementById('batchCopyParameters').checked,
        images: document.getElementById('batchCopyImages').checked,
        applications: document.getElementById('batchCopyApplications').checked,
        downloads: document.getElementById('batchCopyDownloads').checked
    };

    try {
        const dataLoader = window.contentDataLoader;
        let successCount = 0;
        const errors = [];

        for (const productId of productIds) {
            try {
                // 获取原产品数据
                let originalProduct = null;
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
                    originalProduct = dataLoader.contentData.products.find(p => p.id === productId);
                }

                if (!originalProduct) {
                    errors.push(`产品 ${productId} 未找到`);
                    continue;
                }

                // 创建复制的产品数据
                const duplicatedProduct = {
                    id: generateProductId(originalProduct.model + modelSuffix),
                    title: originalProduct.title + titleSuffix,
                    model: originalProduct.model + modelSuffix,
                    summary: originalProduct.summary,
                    primary_category: originalProduct.primary_category,
                    secondary_category: originalProduct.secondary_category,
                    series: originalProduct.series,
                    supplier: originalProduct.supplier,
                    status: status,
                    featured: featured,
                    published: new Date().toISOString(),

                    // 可选复制的内容
                    ...(copyOptions.parameters && originalProduct.parameters && { parameters: [...originalProduct.parameters] }),
                    ...(copyOptions.images && originalProduct.thumbnail && { thumbnail: originalProduct.thumbnail }),
                    ...(copyOptions.images && originalProduct.gallery && { gallery: [...originalProduct.gallery] }),
                    ...(copyOptions.applications && originalProduct.applications && { applications: [...originalProduct.applications] }),
                    ...(copyOptions.downloads && originalProduct.downloads && { downloads: [...originalProduct.downloads] }),

                    // 其他字段
                    ...(originalProduct.content && { content: originalProduct.content }),
                    ...(originalProduct.specifications && { specifications: originalProduct.specifications }),
                    ...(originalProduct.features && { features: originalProduct.features })
                };

                // 使用文件操作模块保存产品
                if (window.fileOperations) {
                    await window.fileOperations.createProduct(duplicatedProduct);
                }

                // 添加到本地数据
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
                    dataLoader.contentData.products.push(duplicatedProduct);
                }

                successCount++;

            } catch (error) {
                console.error(`复制产品 ${productId} 失败:`, error);
                errors.push(`产品 ${productId}: ${error.message}`);
            }
        }

        // 关闭弹窗
        const modal = bootstrap.Modal.getInstance(document.getElementById('batchDuplicateModal'));
        modal.hide();

        // 显示结果消息
        if (successCount > 0) {
            showNotification(`成功复制 ${successCount} 个产品`, 'success');
        }

        if (errors.length > 0) {
            console.warn('批量复制错误:', errors);
            showNotification(`${errors.length} 个产品复制失败，请查看控制台`, 'warning');
        }

        // 刷新产品列表
        loadProductsList();

    } catch (error) {
        console.error('批量复制产品失败:', error);
        showNotification(`批量复制失败: ${error.message}`, 'danger');
    }
}

async function deleteProduct(id) {
    // 获取产品数据以显示确认信息
    const dataLoader = window.contentDataLoader;
    let product = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
        product = dataLoader.contentData.products.find(p => p.id === id);
    }

    const productName = product ? product.title : id;

    if (confirm(`确定要删除产品"${productName}"吗？\n\n注意：此操作将永久删除产品文件，无法恢复！`)) {
        console.log('删除产品:', id);

        try {
            // 使用文件操作模块删除产品
            if (window.fileOperations) {
                await window.fileOperations.deleteProduct(id);
            }

            // 从本地数据中移除
            if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
                const index = dataLoader.contentData.products.findIndex(p => p.id === id);
                if (index > -1) {
                    dataLoader.contentData.products.splice(index, 1);
                }
            }

            // 显示成功消息
            showNotification(`产品"${productName}"已删除`, 'success');

            // 重新加载产品列表
            loadProductsList();
        } catch (error) {
            console.error('删除产品失败:', error);
            showNotification(`删除产品失败: ${error.message}`, 'danger');
        }
    }
}

function exportProducts() {
    console.log('导出产品');
    alert('导出产品功能');
}

async function batchPublishProducts() {
    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要发布的产品', 'warning');
        return;
    }

    if (confirm(`确定要发布选中的 ${ids.length} 个产品吗？`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
                    const product = dataLoader.contentData.products.find(p => p.id === id);
                    if (product) {
                        product.status = 'published';
                        product.statusName = '已发布';
                        product.published = new Date().toISOString();
                        successCount++;
                    }
                }
            }

            showNotification(`成功发布 ${successCount} 个产品`, 'success');
            loadProductsList();

        } catch (error) {
            console.error('批量发布失败:', error);
            showNotification(`批量发布失败: ${error.message}`, 'danger');
        }
    }
}

async function batchArchiveProducts() {
    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要归档的产品', 'warning');
        return;
    }

    if (confirm(`确定要归档选中的 ${ids.length} 个产品吗？`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
                    const product = dataLoader.contentData.products.find(p => p.id === id);
                    if (product) {
                        product.status = 'archived';
                        product.statusName = '已归档';
                        successCount++;
                    }
                }
            }

            showNotification(`成功归档 ${successCount} 个产品`, 'success');
            loadProductsList();

        } catch (error) {
            console.error('批量归档失败:', error);
            showNotification(`批量归档失败: ${error.message}`, 'danger');
        }
    }
}

async function batchDeleteProducts() {
    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要删除的产品', 'warning');
        return;
    }

    if (confirm(`确定要删除选中的 ${ids.length} 个产品吗？\n\n注意：此操作将永久删除产品文件，无法恢复！`)) {
        try {
            const dataLoader = window.contentDataLoader;
            let successCount = 0;

            for (const id of ids) {
                // 使用文件操作模块删除产品
                if (window.fileOperations) {
                    await window.fileOperations.deleteProduct(id);
                }

                // 从本地数据中移除
                if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
                    const index = dataLoader.contentData.products.findIndex(p => p.id === id);
                    if (index > -1) {
                        dataLoader.contentData.products.splice(index, 1);
                        successCount++;
                    }
                }
            }

            showNotification(`成功删除 ${successCount} 个产品`, 'success');
            loadProductsList();

        } catch (error) {
            console.error('批量删除失败:', error);
            showNotification(`批量删除失败: ${error.message}`, 'danger');
        }
    }
}

function batchExportProducts() {
    const checkedBoxes = document.querySelectorAll('.product-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);

    if (ids.length === 0) {
        showNotification('请先选择要导出的产品', 'warning');
        return;
    }

    try {
        const dataLoader = window.contentDataLoader;
        const exportData = [];

        for (const id of ids) {
            if (dataLoader && dataLoader.contentData && dataLoader.contentData.products) {
                const product = dataLoader.contentData.products.find(p => p.id === id);
                if (product) {
                    exportData.push({
                        ID: product.id,
                        标题: product.title,
                        型号: product.model,
                        系列: product.series,
                        供应商: product.supplier,
                        主要分类: product.primary_category,
                        次要分类: product.secondary_category,
                        状态: product.statusName,
                        发布时间: product.published ? new Date(product.published).toLocaleDateString('zh-CN') : '',
                        描述: product.summary
                    });
                }
            }
        }

        // 转换为CSV格式
        const csvContent = convertToCSV(exportData);

        // 下载文件
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `产品导出_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        showNotification(`成功导出 ${exportData.length} 个产品`, 'success');

    } catch (error) {
        console.error('批量导出失败:', error);
        showNotification(`批量导出失败: ${error.message}`, 'danger');
    }
}

// 转换为CSV格式的辅助函数
function convertToCSV(data) {
    if (data.length === 0) return '';

    const headers = Object.keys(data[0]);
    const csvRows = [];

    // 添加表头
    csvRows.push(headers.join(','));

    // 添加数据行
    for (const row of data) {
        const values = headers.map(header => {
            const value = row[header] || '';
            // 处理包含逗号或引号的值
            return `"${value.toString().replace(/"/g, '""')}"`;
        });
        csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
}

// 案例管理相关函数
function loadCasesList() {
    // 从数据加载器获取案例数据
    const dataLoader = window.contentDataLoader;
    let caseData = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.cases) {
        caseData = dataLoader.contentData.cases.map(caseItem => ({
            ...caseItem,
            statusName: getCaseStatusName(caseItem.status)
        }));
    } else {
        // 备用案例数据
        caseData = [
            {
                id: 'case001',
                title: '汽车制造业质量检测案例',
                industry: '汽车制造',
                application: '质量检测',
                scenario: '发动机缸体检测',
                client: '某知名汽车厂',
                status: 'published',
                statusName: '已发布',
                featured: true,
                publishDate: '2024-01-14',
                duration: '3个月',
                result: '检测效率提升60%',
                thumbnail: '/images/cases/automotive.jpg',
                summary: '通过引入先进的无损检测技术，帮助客户实现了生产线质量检测的全面升级。',
                products_used: ['WS-K08510', 'P08510'],
                technologies: ['工业内窥镜', '无损检测'],
                challenges: '传统检测方法效率低，无法满足生产需求',
                solution: '采用高清工业内窥镜进行实时检测',
                benefits: ['效率提升60%', '成本降低30%', '质量提升显著']
            },
            {
                id: 'case002',
                title: '航空发动机叶片检测',
                industry: '航空航天',
                application: '叶片检测',
                scenario: '航空发动机叶片',
                client: '航空发动机公司',
                status: 'published',
                statusName: '已发布',
                featured: true,
                publishDate: '2024-01-11',
                duration: '6个月',
                result: '零缺陷检测率',
                thumbnail: '/images/cases/aerospace.jpg',
                summary: '为航空发动机叶片提供精密检测解决方案，确保产品质量和飞行安全。',
                products_used: ['WS-DZ60', 'WS-K08510'],
                technologies: ['三维测量', '高清成像'],
                challenges: '叶片结构复杂，检测精度要求极高',
                solution: '采用三维测量工业内窥镜进行精密检测',
                benefits: ['零缺陷检测', '检测精度提升', '安全性保障']
            },
            {
                id: 'case003',
                title: '风电齿轮箱检测项目',
                industry: '新能源',
                application: '齿轮箱检测',
                scenario: '风力发电机齿轮箱',
                client: '风电设备制造商',
                status: 'draft',
                statusName: '草稿',
                featured: false,
                publishDate: '2024-01-16',
                duration: '4个月',
                result: '维护成本降低40%',
                thumbnail: '/images/cases/wind-power.jpg',
                summary: '为风电齿轮箱提供定期检测服务，有效预防故障发生。',
                products_used: ['P08510'],
                technologies: ['工业内窥镜', '预防性维护'],
                challenges: '齿轮箱内部结构复杂，传统检测困难',
                solution: '定期使用工业内窥镜进行内部检测',
                benefits: ['维护成本降低40%', '故障预防', '设备寿命延长']
            }
        ];
    }

    const container = document.getElementById('casesList');
    if (!container) return;

    container.innerHTML = caseData.map(caseItem => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <div class="position-relative">
                    <img src="${caseItem.thumbnail}" class="card-img-top" style="height: 200px; object-fit: cover;" alt="${caseItem.title}">
                    <div class="position-absolute top-0 start-0 p-2">
                        <input type="checkbox" class="form-check-input case-checkbox bg-white" value="${caseItem.id}">
                    </div>
                    <div class="position-absolute top-0 end-0 p-2">
                        <span class="badge ${getCaseStatusBadgeClass(caseItem.status)}">${caseItem.statusName}</span>
                        ${caseItem.featured ? '<span class="badge bg-warning ms-1">推荐</span>' : ''}
                    </div>
                </div>
                <div class="card-body d-flex flex-column">
                    <h6 class="card-title">${caseItem.title}</h6>
                    <p class="card-text text-muted small flex-grow-1">${caseItem.summary}</p>
                    <div class="case-meta">
                        <div class="row text-center mb-2">
                            <div class="col-6">
                                <small class="text-muted d-block">行业</small>
                                <span class="badge bg-info">${caseItem.industry}</span>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">应用</small>
                                <span class="badge bg-secondary">${caseItem.application}</span>
                            </div>
                        </div>
                        <div class="row text-center mb-3">
                            <div class="col-6">
                                <small class="text-muted d-block">项目周期</small>
                                <strong>${caseItem.duration}</strong>
                            </div>
                            <div class="col-6">
                                <small class="text-muted d-block">项目效果</small>
                                <strong class="text-success">${caseItem.result}</strong>
                            </div>
                        </div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <small class="text-muted">${caseItem.publishDate}</small>
                        <div class="btn-group btn-group-sm">
                            <button class="btn btn-outline-primary" onclick="editCase(${caseItem.id})" title="编辑">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-outline-info" onclick="viewCase(${caseItem.id})" title="查看">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-outline-danger" onclick="deleteCase(${caseItem.id})" title="删除">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // 绑定复选框事件
    bindCaseCheckboxEvents();
}

function getCaseStatusBadgeClass(status) {
    switch(status) {
        case 'published': return 'bg-success';
        case 'draft': return 'bg-warning';
        case 'featured': return 'bg-primary';
        default: return 'bg-secondary';
    }
}

function getCaseStatusName(status) {
    switch(status) {
        case 'published': return '已发布';
        case 'draft': return '草稿';
        case 'featured': return '推荐案例';
        default: return '未知';
    }
}

function bindCaseCheckboxEvents() {
    const caseCheckboxes = document.querySelectorAll('.case-checkbox');

    // 单个复选框事件
    caseCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateCaseBatchActions);
    });
}

function updateCaseBatchActions() {
    const checkedBoxes = document.querySelectorAll('.case-checkbox:checked');
    const batchActionsCard = document.getElementById('caseBatchActionsCard');
    const selectedCount = document.getElementById('caseSelectedCount');

    if (checkedBoxes.length > 0) {
        batchActionsCard.style.display = 'block';
        selectedCount.textContent = checkedBoxes.length;
    } else {
        batchActionsCard.style.display = 'none';
    }
}

function filterCases() {
    const searchTerm = document.getElementById('caseSearchInput').value;
    const industry = document.getElementById('caseIndustryFilter').value;
    const application = document.getElementById('caseApplicationFilter').value;
    const status = document.getElementById('caseStatusFilter').value;

    console.log('筛选案例:', { searchTerm, industry, application, status });
    alert(`案例筛选：搜索"${searchTerm}"，行业"${industry}"，应用"${application}"，状态"${status}"`);
}

function editCase(id) {
    console.log('编辑案例:', id);

    // 获取案例数据
    const dataLoader = window.contentDataLoader;
    let caseData = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.cases) {
        caseData = dataLoader.contentData.cases.find(c => c.id === id);
    }

    if (!caseData) {
        alert('未找到案例数据');
        return;
    }

    showCaseEditForm(caseData, false);
}

function showCaseEditForm(caseData, isNew = false) {
    const title = isNew ? '添加案例' : '编辑案例';
    const subtitle = isNew ? '创建新案例' : `编辑 ${caseData.title}`;

    updatePageTitle(title, subtitle);

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">编辑案例</h4>
                <p class="text-muted mb-0">编辑 ${caseData.title}</p>
            </div>
            <div>
                <button class="btn btn-outline-secondary me-2" onclick="showCasesList()">
                    <i class="fas fa-arrow-left me-2"></i>返回列表
                </button>
                <button class="btn btn-success" onclick="saveCaseChanges('${id}')">
                    <i class="fas fa-save me-2"></i>保存更改
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <!-- 基本信息 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">基本信息</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="caseTitle" class="form-label">案例标题</label>
                            <input type="text" class="form-control" id="caseTitle" value="${caseData.title}">
                        </div>
                        <div class="mb-3">
                            <label for="caseSummary" class="form-label">案例摘要</label>
                            <textarea class="form-control" id="caseSummary" rows="3">${caseData.summary || ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="caseIndustry" class="form-label">行业</label>
                                    <select class="form-select" id="caseIndustry">
                                        <option value="汽车制造" ${caseData.industry === '汽车制造' ? 'selected' : ''}>汽车制造</option>
                                        <option value="航空航天" ${caseData.industry === '航空航天' ? 'selected' : ''}>航空航天</option>
                                        <option value="新能源" ${caseData.industry === '新能源' ? 'selected' : ''}>新能源</option>
                                        <option value="石油化工" ${caseData.industry === '石油化工' ? 'selected' : ''}>石油化工</option>
                                    </select>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="caseApplication" class="form-label">应用</label>
                                    <select class="form-select" id="caseApplication">
                                        <option value="质量检测" ${caseData.application === '质量检测' ? 'selected' : ''}>质量检测</option>
                                        <option value="叶片检测" ${caseData.application === '叶片检测' ? 'selected' : ''}>叶片检测</option>
                                        <option value="齿轮箱检测" ${caseData.application === '齿轮箱检测' ? 'selected' : ''}>齿轮箱检测</option>
                                        <option value="管道检测" ${caseData.application === '管道检测' ? 'selected' : ''}>管道检测</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="caseClient" class="form-label">客户</label>
                                    <input type="text" class="form-control" id="caseClient" value="${caseData.client || ''}">
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="mb-3">
                                    <label for="caseDuration" class="form-label">项目周期</label>
                                    <input type="text" class="form-control" id="caseDuration" value="${caseData.duration || ''}">
                                </div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="caseResult" class="form-label">项目效果</label>
                            <input type="text" class="form-control" id="caseResult" value="${caseData.result || ''}">
                        </div>
                    </div>
                </div>
            </div>

            <div class="col-lg-4">
                <!-- 发布设置 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">发布设置</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="caseStatus" class="form-label">状态</label>
                            <select class="form-select" id="caseStatus">
                                <option value="published" ${caseData.status === 'published' ? 'selected' : ''}>已发布</option>
                                <option value="draft" ${caseData.status === 'draft' ? 'selected' : ''}>草稿</option>
                                <option value="featured" ${caseData.status === 'featured' ? 'selected' : ''}>推荐案例</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="caseFeatured" ${caseData.featured ? 'checked' : ''}>
                                <label class="form-check-label" for="caseFeatured">
                                    设为推荐案例
                                </label>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label for="casePublishDate" class="form-label">发布时间</label>
                            <input type="date" class="form-control" id="casePublishDate" value="${caseData.publishDate || ''}">
                        </div>
                    </div>
                </div>

                <!-- 案例图片 -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5 class="mb-0">案例图片</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label for="caseThumbnail" class="form-label">缩略图</label>
                            <input type="text" class="form-control" id="caseThumbnail" value="${caseData.thumbnail || ''}">
                        </div>
                        <div class="text-center">
                            <img src="${caseData.thumbnail || '/images/placeholder.svg'}"
                                 class="img-fluid rounded" style="max-height: 200px;" alt="案例图片">
                        </div>
                    </div>
                </div>

                <!-- 操作按钮 -->
                <div class="card">
                    <div class="card-body">
                        <div class="d-grid gap-2">
                            <button class="btn btn-success" onclick="saveCaseChanges('${id}')">
                                <i class="fas fa-save me-2"></i>保存更改
                            </button>
                            <button class="btn btn-outline-info" onclick="previewCase('${id}')">
                                <i class="fas fa-eye me-2"></i>预览案例
                            </button>
                            <button class="btn btn-outline-secondary" onclick="showCasesList()">
                                <i class="fas fa-arrow-left me-2"></i>返回列表
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
}

// 保存案例更改
function saveCaseChanges(id) {
    const caseData = {
        id: id,
        title: document.getElementById('caseTitle').value,
        summary: document.getElementById('caseSummary').value,
        industry: document.getElementById('caseIndustry').value,
        application: document.getElementById('caseApplication').value,
        client: document.getElementById('caseClient').value,
        duration: document.getElementById('caseDuration').value,
        result: document.getElementById('caseResult').value,
        status: document.getElementById('caseStatus').value,
        featured: document.getElementById('caseFeatured').checked,
        publishDate: document.getElementById('casePublishDate').value,
        thumbnail: document.getElementById('caseThumbnail').value
    };

    console.log('保存案例数据:', caseData);
    alert('案例保存成功！\n\n注意：这是演示版本，实际保存功能需要后端API支持。');
    showCasesList();
}

// 预览案例
function previewCase(id) {
    console.log('预览案例:', id);
    window.open(`/cases/${id}/`, '_blank');
}

function viewCase(id) {
    console.log('查看案例:', id);
    // 在新窗口中打开案例页面
    window.open(`/cases/${id}/`, '_blank');
}

function duplicateCase(id) {
    console.log('复制案例:', id);

    // 获取原案例数据
    const dataLoader = window.contentDataLoader;
    let originalCase = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.cases) {
        originalCase = dataLoader.contentData.cases.find(c => c.id === id);
    }

    if (!originalCase) {
        alert('未找到要复制的案例数据');
        return;
    }

    // 创建复制的案例数据
    const duplicatedCase = {
        ...originalCase,
        id: `${originalCase.id}-copy-${Date.now()}`,
        title: `${originalCase.title} (副本)`,
        status: 'draft',
        statusName: '草稿',
        publishDate: new Date().toISOString().split('T')[0],
        featured: false
    };

    // 显示编辑界面
    showCaseEditForm(duplicatedCase, true);
}

async function deleteCase(id) {
    // 获取案例数据以显示确认信息
    const dataLoader = window.contentDataLoader;
    let caseItem = null;

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.cases) {
        caseItem = dataLoader.contentData.cases.find(c => c.id === id);
    }

    const caseName = caseItem ? caseItem.title : id;

    if (confirm(`确定要删除案例"${caseName}"吗？\n\n注意：此操作将永久删除案例文件，无法恢复！`)) {
        console.log('删除案例:', id);

        try {
            // 使用文件操作模块删除案例
            if (window.fileOperations) {
                await window.fileOperations.deleteCase(id);
            }

            // 从本地数据中移除
            if (dataLoader && dataLoader.contentData && dataLoader.contentData.cases) {
                const index = dataLoader.contentData.cases.findIndex(c => c.id === id);
                if (index > -1) {
                    dataLoader.contentData.cases.splice(index, 1);
                }
            }

            // 显示成功消息
            showNotification(`案例"${caseName}"已删除`, 'success');

            // 重新加载案例列表
            loadCasesList();
        } catch (error) {
            console.error('删除案例失败:', error);
            showNotification(`删除案例失败: ${error.message}`, 'danger');
        }
    }
}

function exportCases() {
    console.log('导出案例');
    alert('导出案例功能');
}

function batchPublishCases() {
    const checkedBoxes = document.querySelectorAll('.case-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);
    console.log('批量发布案例:', ids);
    alert(`批量发布 ${ids.length} 个案例`);
}

function batchFeatureCases() {
    const checkedBoxes = document.querySelectorAll('.case-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);
    console.log('批量设为推荐案例:', ids);
    alert(`批量设为推荐 ${ids.length} 个案例`);
}

function batchDeleteCases() {
    const checkedBoxes = document.querySelectorAll('.case-checkbox:checked');
    const ids = Array.from(checkedBoxes).map(cb => cb.value);
    if (confirm(`确定要删除选中的 ${ids.length} 个案例吗？`)) {
        console.log('批量删除案例:', ids);
        alert(`批量删除 ${ids.length} 个案例`);
        loadCasesList();
    }
}

// 系统设置相关函数
function saveSiteSettings() {
    console.log('保存网站设置');
    alert('网站设置保存成功！');
}

function uploadLogo() {
    console.log('上传Logo');
    alert('Logo上传功能（待实现文件上传）');
}

function uploadFavicon() {
    console.log('上传网站图标');
    alert('网站图标上传功能（待实现文件上传）');
}

function previewSite() {
    console.log('预览网站');
    window.open('/', '_blank');
}

function resetSiteSettings() {
    if (confirm('确定要重置所有设置吗？此操作不可撤销。')) {
        console.log('重置网站设置');
        alert('网站设置已重置');
        showSiteSettings();
    }
}

// 页面管理相关函数
function saveBusinessPage() {
    console.log('保存商务服务页面');
    alert('商务服务页面保存成功！');
}

function previewBusinessPage() {
    console.log('预览商务服务页面');
    window.open('/business', '_blank');
}

function resetBusinessPage() {
    if (confirm('确定要重置页面内容吗？')) {
        console.log('重置商务服务页面');
        alert('页面内容已重置');
        editBusinessPage();
    }
}

// 轮播图管理相关函数
function addNewBanner() {
    console.log('添加新轮播图');
    alert('添加轮播图功能（待实现）');
}

function editBanner(id) {
    console.log('编辑轮播图:', id);
    alert(`编辑轮播图 ID: ${id}`);
}

function deleteBanner(id) {
    if (confirm('确定要删除这张轮播图吗？')) {
        console.log('删除轮播图:', id);
        alert(`删除轮播图 ID: ${id}`);
        showBannerManager();
    }
}

function saveBannerSettings() {
    console.log('保存轮播图设置');
    alert('轮播图设置保存成功！');
}

// 首页管理相关函数
function saveHomepageChanges() {
    console.log('保存首页更改');
    alert('首页内容保存成功！');
}

// 通用保存函数
function uploadCoverImage() {
    console.log('上传封面图片');
    alert('封面图片上传功能（待实现文件上传）');
}

// 新增的管理模块函数

// 产品类型管理
function showProductTypes() {
    console.log('showProductTypes 被调用');
    updatePageTitle('产品类型管理', '管理产品类型分类');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">产品类型管理</h4>
                <p class="text-muted mb-0">管理产品类型分类，用于产品的细分归类</p>
            </div>
            <button class="btn btn-primary" onclick="createProductType()">
                <i class="fas fa-plus me-2"></i>添加产品类型
            </button>
        </div>

        <!-- 类型统计 -->
        <div class="row mb-4">
            <div class="col-md-3">
                <div class="card bg-primary text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">总类型数</h6>
                                <h3 class="mb-0" id="totalTypeCount">8</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-tags fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-success text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">启用类型</h6>
                                <h3 class="mb-0" id="activeTypeCount">6</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-check-circle fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-info text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">关联产品</h6>
                                <h3 class="mb-0" id="typeProductCount">25</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-box fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card bg-warning text-white">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title">热门类型</h6>
                                <h3 class="mb-0" id="popularTypeCount">3</h3>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-fire fa-2x"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 类型列表 -->
        <div class="card">
            <div class="card-header">
                <div class="row align-items-center">
                    <div class="col">
                        <h5 class="mb-0">产品类型列表</h5>
                    </div>
                    <div class="col-auto">
                        <div class="input-group">
                            <input type="text" class="form-control" id="typeSearchInput" placeholder="搜索类型..." onkeyup="filterProductTypes()">
                            <button class="btn btn-outline-secondary" onclick="filterProductTypes()">
                                <i class="fas fa-search"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead class="table-light">
                            <tr>
                                <th width="50">
                                    <input type="checkbox" class="form-check-input" id="selectAllTypes">
                                </th>
                                <th>类型名称</th>
                                <th width="200">类型描述</th>
                                <th width="120">产品数量</th>
                                <th width="100">排序</th>
                                <th width="80">状态</th>
                                <th width="120">创建时间</th>
                                <th width="150">操作</th>
                            </tr>
                        </thead>
                        <tbody id="typeTableBody">
                            <!-- 动态生成的类型列表 -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- 批量操作 -->
        <div class="card mt-3" id="typeBatchActionsCard" style="display: none;">
            <div class="card-body">
                <div class="d-flex align-items-center gap-3">
                    <span class="text-muted">已选择 <span id="typeSelectedCount">0</span> 项</span>
                    <button class="btn btn-sm btn-outline-success" onclick="batchEnableTypes()">批量启用</button>
                    <button class="btn btn-sm btn-outline-warning" onclick="batchDisableTypes()">批量禁用</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="batchDeleteTypes()">批量删除</button>
                    <button class="btn btn-sm btn-outline-info" onclick="batchExportTypes()">批量导出</button>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadProductTypes();
}

// 加载产品类型数据
function loadProductTypes() {
    // 获取类型数据
    const dataLoader = window.contentDataLoader;
    let typeData = [];

    if (dataLoader && dataLoader.contentData && dataLoader.contentData.productTypes) {
        typeData = dataLoader.contentData.productTypes;
    } else {
        // 备用类型数据
        typeData = [
            {
                id: 'industrial-endoscope',
                name: '工业内窥镜',
                description: '用于工业检测的内窥镜设备，包括电子内窥镜、光纤内窥镜等',
                productCount: 15,
                sort: 1,
                status: 'active',
                statusName: '启用',
                created: '2024-01-01',
                popular: true
            },
            {
                id: 'medical-endoscope',
                name: '医疗内窥镜',
                description: '用于医疗诊断的内窥镜设备，符合医疗器械标准',
                productCount: 8,
                sort: 2,
                status: 'active',
                statusName: '启用',
                created: '2024-01-02',
                popular: false
            },
            {
                id: 'automotive-detection',
                name: '汽车检测设备',
                description: '专用于汽车行业的检测设备，包括发动机检测、变速箱检测等',
                productCount: 12,
                sort: 3,
                status: 'active',
                statusName: '启用',
                created: '2024-01-03',
                popular: true
            },
            {
                id: 'aerospace-detection',
                name: '航空航天检测',
                description: '航空航天领域专用检测设备，高精度、高可靠性',
                productCount: 6,
                sort: 4,
                status: 'active',
                statusName: '启用',
                created: '2024-01-04',
                popular: true
            },
            {
                id: 'pipeline-detection',
                name: '管道检测设备',
                description: '用于管道内部检测的专用设备',
                productCount: 4,
                sort: 5,
                status: 'active',
                statusName: '启用',
                created: '2024-01-05',
                popular: false
            },
            {
                id: 'precision-measurement',
                name: '精密测量设备',
                description: '高精度测量和检测设备',
                productCount: 3,
                sort: 6,
                status: 'active',
                statusName: '启用',
                created: '2024-01-06',
                popular: false
            },
            {
                id: 'underwater-detection',
                name: '水下检测设备',
                description: '适用于水下环境的检测设备',
                productCount: 2,
                sort: 7,
                status: 'inactive',
                statusName: '禁用',
                created: '2024-01-07',
                popular: false
            },
            {
                id: 'high-temp-detection',
                name: '高温检测设备',
                description: '适用于高温环境的特殊检测设备',
                productCount: 1,
                sort: 8,
                status: 'inactive',
                statusName: '禁用',
                created: '2024-01-08',
                popular: false
            }
        ];
    }

    // 渲染类型表格
    renderTypeTable(typeData);

    // 更新统计信息
    updateTypeStats(typeData);

    // 绑定复选框事件
    bindTypeCheckboxEvents();
}

// 渲染类型表格
function renderTypeTable(typeData) {
    const tbody = document.getElementById('typeTableBody');
    if (!tbody) return;

    if (typeData.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4">
                    <div class="empty-state">
                        <i class="fas fa-tags empty-icon"></i>
                        <div class="empty-title">暂无类型数据</div>
                        <div class="empty-description">点击上方"添加产品类型"按钮开始添加类型</div>
                    </div>
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = typeData.map(type => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input type-checkbox" value="${type.id}">
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <i class="fas fa-tag text-primary me-2"></i>
                    <strong>${type.name}</strong>
                    ${type.popular ? '<span class="badge bg-warning text-dark ms-2">热门</span>' : ''}
                </div>
            </td>
            <td>
                <div class="text-truncate" style="max-width: 200px;" title="${type.description}">
                    ${type.description}
                </div>
            </td>
            <td><span class="badge bg-info">${type.productCount}</span></td>
            <td><span class="badge bg-secondary">${type.sort}</span></td>
            <td><span class="badge ${getTypeStatusBadgeClass(type.status)}">${type.statusName}</span></td>
            <td><small class="text-muted">${type.created}</small></td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="editProductType('${type.id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline-info" onclick="viewTypeProducts('${type.id}')" title="查看产品">
                        <i class="fas fa-box"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="duplicateProductType('${type.id}')" title="复制">
                        <i class="fas fa-copy"></i>
                    </button>
                    <button class="btn btn-outline-danger" onclick="deleteProductType('${type.id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 获取类型状态徽章样式
function getTypeStatusBadgeClass(status) {
    switch(status) {
        case 'active': return 'bg-success';
        case 'inactive': return 'bg-secondary';
        case 'disabled': return 'bg-danger';
        default: return 'bg-secondary';
    }
}

// 更新类型统计信息
function updateTypeStats(typeData) {
    const totalCount = typeData.length;
    const activeCount = typeData.filter(type => type.status === 'active').length;
    const totalProductCount = typeData.reduce((sum, type) => sum + type.productCount, 0);
    const popularCount = typeData.filter(type => type.popular).length;

    // 更新统计显示
    const totalCountEl = document.getElementById('totalTypeCount');
    const activeCountEl = document.getElementById('activeTypeCount');
    const productCountEl = document.getElementById('typeProductCount');
    const popularCountEl = document.getElementById('popularTypeCount');

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (activeCountEl) activeCountEl.textContent = activeCount;
    if (productCountEl) productCountEl.textContent = totalProductCount;
    if (popularCountEl) popularCountEl.textContent = popularCount;
}

// 绑定类型复选框事件
function bindTypeCheckboxEvents() {
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAllTypes');
    const typeCheckboxes = document.querySelectorAll('.type-checkbox');

    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', function() {
            typeCheckboxes.forEach(checkbox => {
                checkbox.checked = this.checked;
            });
            updateTypeBatchActions();
        });
    }

    // 单个复选框事件
    typeCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateTypeBatchActions);
    });
}

// 更新类型批量操作显示
function updateTypeBatchActions() {
    const checkedBoxes = document.querySelectorAll('.type-checkbox:checked');
    const batchActionsCard = document.getElementById('typeBatchActionsCard');
    const selectedCount = document.getElementById('typeSelectedCount');

    if (checkedBoxes.length > 0) {
        batchActionsCard.style.display = 'block';
        selectedCount.textContent = checkedBoxes.length;
    } else {
        batchActionsCard.style.display = 'none';
    }
}

// 筛选产品类型
function filterProductTypes() {
    const searchTerm = document.getElementById('typeSearchInput').value.toLowerCase();

    // 获取所有类型行
    const rows = document.querySelectorAll('#typeTableBody tr');

    rows.forEach(row => {
        const typeName = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
        const typeDesc = row.querySelector('td:nth-child(3)').textContent.toLowerCase();

        if (typeName.includes(searchTerm) || typeDesc.includes(searchTerm)) {
            row.style.display = '';
        } else {
            row.style.display = 'none';
        }
    });
}

// 创建产品类型
function createProductType() {
    showTypeModal();
}

// 显示类型编辑弹窗
function showTypeModal(type = null) {
    const isEdit = type !== null;
    const title = isEdit ? '编辑产品类型' : '添加产品类型';

    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.id = 'typeModal';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">
                        <i class="fas fa-tag me-2"></i>${title}
                    </h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <form id="typeForm">
                        ${isEdit ? `<input type="hidden" id="typeId" value="${type.id}">` : ''}
                        <div class="mb-3">
                            <label class="form-label">类型名称 <span class="text-danger">*</span></label>
                            <input type="text" class="form-control" id="typeName" value="${isEdit ? type.name : ''}" required>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">类型描述</label>
                            <textarea class="form-control" id="typeDescription" rows="3">${isEdit ? (type.description || '') : ''}</textarea>
                        </div>
                        <div class="row">
                            <div class="col-md-6 mb-3">
                                <label class="form-label">排序</label>
                                <input type="number" class="form-control" id="typeSort" value="${isEdit ? type.sort : 1}" min="1">
                            </div>
                            <div class="col-md-6 mb-3">
                                <label class="form-label">状态</label>
                                <select class="form-select" id="typeStatus">
                                    <option value="active" ${isEdit && type.status === 'active' ? 'selected' : ''}>启用</option>
                                    <option value="inactive" ${isEdit && type.status === 'inactive' ? 'selected' : ''}>禁用</option>
                                </select>
                            </div>
                        </div>
                        <div class="mb-3">
                            <div class="form-check">
                                <input class="form-check-input" type="checkbox" id="typePopular" ${isEdit && type.popular ? 'checked' : ''}>
                                <label class="form-check-label" for="typePopular">
                                    设为热门类型
                                </label>
                            </div>
                        </div>
                    </form>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="saveProductType()">
                        <i class="fas fa-save me-1"></i>${isEdit ? '保存更改' : '创建类型'}
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

// 应用领域管理
function showApplicationsList() {
    console.log('showApplicationsList 被调用');
    updatePageTitle('应用领域管理', '管理应用领域内容');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">应用领域管理</h4>
                <p class="text-muted mb-0">管理应用领域内容</p>
            </div>
            <button class="btn btn-primary" onclick="createApplication()">
                <i class="fas fa-plus me-2"></i>添加应用领域
            </button>
        </div>

        <div class="row" id="applicationsList">
            <!-- 动态生成 -->
        </div>
    `;

    showDynamicContent(content);
    loadApplicationsList();
}

function loadApplicationsList() {
    const applications = [
        {
            id: 1,
            title: '汽车制造',
            description: '汽车发动机、变速箱等关键部件的无损检测',
            icon: 'fas fa-car',
            color: 'primary',
            caseCount: 25,
            productCount: 12
        },
        {
            id: 2,
            title: '航空航天',
            description: '航空发动机叶片、机身结构等精密检测',
            icon: 'fas fa-plane',
            color: 'success',
            caseCount: 18,
            productCount: 8
        },
        {
            id: 3,
            title: '新能源',
            description: '风电设备、太阳能组件等新能源设备检测',
            icon: 'fas fa-leaf',
            color: 'warning',
            caseCount: 15,
            productCount: 10
        }
    ];

    const container = document.getElementById('applicationsList');
    if (!container) return;

    container.innerHTML = applications.map(app => `
        <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-body text-center">
                    <div class="mb-3">
                        <i class="${app.icon} fa-3x text-${app.color}"></i>
                    </div>
                    <h5 class="card-title">${app.title}</h5>
                    <p class="card-text text-muted">${app.description}</p>
                    <div class="row text-center mb-3">
                        <div class="col-6">
                            <strong class="text-${app.color}">${app.caseCount}</strong>
                            <div class="small text-muted">相关案例</div>
                        </div>
                        <div class="col-6">
                            <strong class="text-${app.color}">${app.productCount}</strong>
                            <div class="small text-muted">相关产品</div>
                        </div>
                    </div>
                    <div class="btn-group w-100">
                        <button class="btn btn-outline-${app.color}" onclick="editApplication(${app.id})">
                            <i class="fas fa-edit"></i> 编辑
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteApplication(${app.id})">
                            <i class="fas fa-trash"></i> 删除
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

// 定制中心管理
function showCustomsList() {
    console.log('showCustomsList 被调用');
    updatePageTitle('定制需求管理', '管理客户定制需求');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">定制需求管理</h4>
                <p class="text-muted mb-0">管理客户定制需求</p>
            </div>
            <div>
                <button class="btn btn-outline-success me-2" onclick="exportCustoms()">
                    <i class="fas fa-download me-2"></i>导出数据
                </button>
                <button class="btn btn-primary" onclick="createCustom()">
                    <i class="fas fa-plus me-2"></i>添加需求
                </button>
            </div>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>客户信息</th>
                                <th>需求类型</th>
                                <th>需求描述</th>
                                <th>状态</th>
                                <th>提交时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="customsTableBody">
                            <!-- 动态生成 -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadCustomsList();
}

function loadCustomsList() {
    const customs = [
        {
            id: 1,
            clientName: '某汽车制造公司',
            clientContact: '张经理',
            type: '工业内窥镜定制',
            description: '需要定制适用于发动机缸体检测的专用内窥镜',
            status: 'pending',
            statusName: '待处理',
            submitTime: '2024-01-15 10:30'
        },
        {
            id: 2,
            clientName: '航空设备公司',
            clientContact: '李工程师',
            type: '检测设备定制',
            description: '航空发动机叶片检测专用设备定制需求',
            status: 'processing',
            statusName: '处理中',
            submitTime: '2024-01-14 14:20'
        }
    ];

    const tbody = document.getElementById('customsTableBody');
    if (!tbody) return;

    tbody.innerHTML = customs.map(custom => `
        <tr>
            <td>
                <div>
                    <strong>${custom.clientName}</strong>
                    <div class="small text-muted">${custom.clientContact}</div>
                </div>
            </td>
            <td><span class="badge bg-info">${custom.type}</span></td>
            <td>
                <div class="text-truncate" style="max-width: 200px;" title="${custom.description}">
                    ${custom.description}
                </div>
            </td>
            <td><span class="badge ${getCustomStatusBadgeClass(custom.status)}">${custom.statusName}</span></td>
            <td>${custom.submitTime}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewCustom(${custom.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="processCustom(${custom.id})">
                        <i class="fas fa-cog"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getCustomStatusBadgeClass(status) {
    switch(status) {
        case 'pending': return 'bg-warning';
        case 'processing': return 'bg-info';
        case 'completed': return 'bg-success';
        case 'cancelled': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

// 商务服务管理
function showCooperationRequests() {
    console.log('showCooperationRequests 被调用');
    updatePageTitle('合作申请管理', '管理商务合作申请');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">合作申请管理</h4>
                <p class="text-muted mb-0">管理商务合作申请</p>
            </div>
            <button class="btn btn-outline-success" onclick="exportCooperations()">
                <i class="fas fa-download me-2"></i>导出数据
            </button>
        </div>

        <div class="card">
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>公司信息</th>
                                <th>合作类型</th>
                                <th>联系方式</th>
                                <th>状态</th>
                                <th>申请时间</th>
                                <th>操作</th>
                            </tr>
                        </thead>
                        <tbody id="cooperationTableBody">
                            <!-- 动态生成 -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadCooperationsList();
}

function loadCooperationsList() {
    const cooperations = [
        {
            id: 1,
            companyName: '深圳某科技公司',
            contactPerson: '王总',
            type: '产品代理',
            phone: '138****8888',
            email: 'wang@company.com',
            status: 'new',
            statusName: '新申请',
            applyTime: '2024-01-15 09:30'
        },
        {
            id: 2,
            companyName: '上海检测设备公司',
            contactPerson: '李经理',
            type: '技术合作',
            phone: '139****9999',
            email: 'li@detection.com',
            status: 'contacted',
            statusName: '已联系',
            applyTime: '2024-01-14 16:45'
        }
    ];

    const tbody = document.getElementById('cooperationTableBody');
    if (!tbody) return;

    tbody.innerHTML = cooperations.map(coop => `
        <tr>
            <td>
                <div>
                    <strong>${coop.companyName}</strong>
                    <div class="small text-muted">${coop.contactPerson}</div>
                </div>
            </td>
            <td><span class="badge bg-primary">${coop.type}</span></td>
            <td>
                <div class="small">
                    <div><i class="fas fa-phone"></i> ${coop.phone}</div>
                    <div><i class="fas fa-envelope"></i> ${coop.email}</div>
                </div>
            </td>
            <td><span class="badge ${getCooperationStatusBadgeClass(coop.status)}">${coop.statusName}</span></td>
            <td>${coop.applyTime}</td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-primary" onclick="viewCooperation(${coop.id})">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-outline-success" onclick="contactCooperation(${coop.id})">
                        <i class="fas fa-phone"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function getCooperationStatusBadgeClass(status) {
    switch(status) {
        case 'new': return 'bg-info';
        case 'contacted': return 'bg-warning';
        case 'negotiating': return 'bg-primary';
        case 'signed': return 'bg-success';
        case 'rejected': return 'bg-secondary';
        default: return 'bg-secondary';
    }
}

// 菜单管理
function showMenuSettings() {
    console.log('showMenuSettings 被调用');
    updatePageTitle('菜单管理', '管理网站导航菜单');

    const content = `
        <div class="content-header d-flex justify-content-between align-items-center mb-4">
            <div>
                <h4 class="mb-1">菜单管理</h4>
                <p class="text-muted mb-0">管理网站导航菜单</p>
            </div>
            <div>
                <button class="btn btn-outline-info me-2" onclick="previewMenu()">
                    <i class="fas fa-eye me-2"></i>预览菜单
                </button>
                <button class="btn btn-success" onclick="saveMenuSettings()">
                    <i class="fas fa-save me-2"></i>保存菜单
                </button>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">主导航菜单</h5>
                    </div>
                    <div class="card-body">
                        <div id="menuItemsList">
                            <!-- 动态生成菜单项 -->
                        </div>
                        <button class="btn btn-outline-primary mt-3" onclick="addMenuItem()">
                            <i class="fas fa-plus me-2"></i>添加菜单项
                        </button>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0">菜单预览</h5>
                    </div>
                    <div class="card-body">
                        <div class="menu-preview" id="menuPreview">
                            <!-- 菜单预览 -->
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    showDynamicContent(content);
    loadMenuSettings();
}

function loadMenuSettings() {
    const menuItems = [
        { name: '首页', url: '/', weight: 10, active: true },
        { name: '产品中心', url: '/products', weight: 20, active: true },
        { name: '应用领域', url: '/applications', weight: 30, active: true },
        { name: '应用案例', url: '/cases', weight: 40, active: true },
        { name: '资讯中心', url: '/news', weight: 50, active: true },
        { name: '定制中心', url: '/customs', weight: 60, active: true },
        { name: '商务服务', url: '/cooperation', weight: 70, active: true }
    ];

    const container = document.getElementById('menuItemsList');
    if (!container) return;

    container.innerHTML = menuItems.map((item, index) => `
        <div class="menu-item-editor mb-3 p-3 border rounded">
            <div class="row align-items-center">
                <div class="col-md-3">
                    <input type="text" class="form-control" value="${item.name}" placeholder="菜单名称">
                </div>
                <div class="col-md-3">
                    <input type="text" class="form-control" value="${item.url}" placeholder="链接地址">
                </div>
                <div class="col-md-2">
                    <input type="number" class="form-control" value="${item.weight}" placeholder="排序">
                </div>
                <div class="col-md-2">
                    <div class="form-check">
                        <input class="form-check-input" type="checkbox" ${item.active ? 'checked' : ''}>
                        <label class="form-check-label">启用</label>
                    </div>
                </div>
                <div class="col-md-2">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-outline-primary" onclick="moveMenuUp(${index})">
                            <i class="fas fa-arrow-up"></i>
                        </button>
                        <button class="btn btn-outline-primary" onclick="moveMenuDown(${index})">
                            <i class="fas fa-arrow-down"></i>
                        </button>
                        <button class="btn btn-outline-danger" onclick="deleteMenuItem(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `).join('');

    // 更新预览
    updateMenuPreview(menuItems);
}

function updateMenuPreview(menuItems) {
    const preview = document.getElementById('menuPreview');
    if (!preview) return;

    preview.innerHTML = `
        <nav class="navbar navbar-expand-lg navbar-light bg-light">
            <div class="navbar-nav">
                ${menuItems.filter(item => item.active).map(item => `
                    <a class="nav-link" href="${item.url}">${item.name}</a>
                `).join('')}
            </div>
        </nav>
    `;
}

// 通用通知函数
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 90px; right: 20px; z-index: 2050; min-width: 300px;';
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    }, 3000);
}

// 通用操作函数
function createProductType() { alert('添加产品类型功能'); }
function editProductType(id) { alert(`编辑产品类型 ${id}`); }
function deleteProductType(id) { alert(`删除产品类型 ${id}`); }

function createApplication() { alert('添加应用领域功能'); }
function editApplication(id) { alert(`编辑应用领域 ${id}`); }
function deleteApplication(id) { alert(`删除应用领域 ${id}`); }
function editApplicationsPage() { alert('编辑应用领域页面'); }

function showCustomsCategories() { alert('定制分类管理'); }
function editCustomsPage() { alert('编辑定制中心页面'); }
function createCustom() { alert('添加定制需求'); }
function viewCustom(id) { alert(`查看定制需求 ${id}`); }
function processCustom(id) { alert(`处理定制需求 ${id}`); }
function exportCustoms() { alert('导出定制数据'); }

function showPartnersList() { alert('合作伙伴管理'); }
function viewCooperation(id) { alert(`查看合作申请 ${id}`); }
function contactCooperation(id) { alert(`联系合作申请 ${id}`); }
function exportCooperations() { alert('导出合作数据'); }

function previewMenu() { alert('预览菜单'); }
function saveMenuSettings() { alert('保存菜单设置'); }
function addMenuItem() { alert('添加菜单项'); }
function moveMenuUp(index) { alert(`上移菜单项 ${index}`); }
function moveMenuDown(index) { alert(`下移菜单项 ${index}`); }
function deleteMenuItem(index) { alert(`删除菜单项 ${index}`); }

// GitHub配置管理
function showGitHubConfig() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">GitHub集成配置</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="mb-3">
                        <label class="form-label">GitHub Personal Access Token</label>
                        <input type="password" class="form-control" id="githubToken"
                               placeholder="输入您的GitHub Personal Access Token">
                        <div class="form-text">
                            需要具有repo权限的Personal Access Token。
                            <a href="https://github.com/settings/tokens" target="_blank">创建Token</a>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">仓库信息</label>
                        <div class="row">
                            <div class="col-6">
                                <input type="text" class="form-control" id="githubOwner"
                                       value="Cery" placeholder="用户名/组织名">
                            </div>
                            <div class="col-6">
                                <input type="text" class="form-control" id="githubRepo"
                                       value="VisNDT" placeholder="仓库名">
                            </div>
                        </div>
                    </div>
                    <div class="mb-3">
                        <label class="form-label">分支</label>
                        <input type="text" class="form-control" id="githubBranch"
                               value="master" placeholder="分支名">
                    </div>
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        配置GitHub集成后，所有的文件操作将直接同步到GitHub仓库。
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">取消</button>
                    <button type="button" class="btn btn-primary" onclick="saveGitHubConfig()">保存配置</button>
                    <button type="button" class="btn btn-success" onclick="testGitHubConnection()">测试连接</button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const modalInstance = new bootstrap.Modal(modal);
    modalInstance.show();

    // 加载已保存的配置
    loadGitHubConfig();

    modal.addEventListener('hidden.bs.modal', () => {
        document.body.removeChild(modal);
    });
}

function loadGitHubConfig() {
    const config = localStorage.getItem('visndt_github_config');
    if (config) {
        const data = JSON.parse(config);
        document.getElementById('githubToken').value = data.token || '';
        document.getElementById('githubOwner').value = data.owner || 'Cery';
        document.getElementById('githubRepo').value = data.repo || 'VisNDT';
        document.getElementById('githubBranch').value = data.branch || 'master';
    }
}

function saveGitHubConfig() {
    const token = document.getElementById('githubToken').value.trim();
    const owner = document.getElementById('githubOwner').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();
    const branch = document.getElementById('githubBranch').value.trim();

    if (!token) {
        alert('请输入GitHub Personal Access Token');
        return;
    }

    const config = { token, owner, repo, branch };
    localStorage.setItem('visndt_github_config', JSON.stringify(config));

    // 初始化文件操作模块的GitHub配置
    if (window.fileOperations) {
        window.fileOperations.githubConfig = {
            owner: owner,
            repo: repo,
            branch: branch,
            token: token
        };
    }

    showNotification('GitHub配置已保存', 'success');
}

async function testGitHubConnection() {
    const token = document.getElementById('githubToken').value.trim();
    const owner = document.getElementById('githubOwner').value.trim();
    const repo = document.getElementById('githubRepo').value.trim();

    if (!token) {
        alert('请先输入GitHub Token');
        return;
    }

    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
            headers: {
                'Authorization': `token ${token}`,
            }
        });

        if (response.ok) {
            showNotification('GitHub连接测试成功！', 'success');
        } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
    } catch (error) {
        console.error('GitHub连接测试失败:', error);
        showNotification(`GitHub连接测试失败: ${error.message}`, 'danger');
    }
}

// 初始化GitHub配置
function initGitHubConfig() {
    const config = localStorage.getItem('visndt_github_config');
    if (config && window.fileOperations) {
        const data = JSON.parse(config);
        window.fileOperations.githubConfig = {
            owner: data.owner || 'Cery',
            repo: data.repo || 'VisNDT',
            branch: data.branch || 'master',
            token: data.token || null
        };
    }
}

console.log('admin-functions.js 加载完成 - 所有函数已定义');
