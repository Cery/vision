// 调试产品数据加载的脚本

console.log('=== 产品数据调试开始 ===');

// 检查数据加载器
function checkDataLoader() {
    console.log('1. 检查数据加载器...');
    
    if (typeof window.contentDataLoader !== 'undefined') {
        console.log('✓ window.contentDataLoader 存在');
        
        if (window.contentDataLoader.contentData) {
            console.log('✓ contentData 存在');
            
            if (window.contentDataLoader.contentData.products) {
                const products = window.contentDataLoader.contentData.products;
                console.log(`✓ products 数组存在，包含 ${products.length} 个产品`);
                
                if (products.length > 0) {
                    console.log('第一个产品数据:', products[0]);
                    
                    // 检查产品数据结构
                    const firstProduct = products[0];
                    const requiredFields = ['id', 'title', 'model', 'primary_category', 'supplier', 'status'];
                    
                    console.log('检查必需字段:');
                    requiredFields.forEach(field => {
                        if (firstProduct[field]) {
                            console.log(`  ✓ ${field}: ${firstProduct[field]}`);
                        } else {
                            console.log(`  ✗ ${field}: 缺失`);
                        }
                    });
                } else {
                    console.log('✗ products 数组为空');
                }
            } else {
                console.log('✗ products 不存在');
            }
        } else {
            console.log('✗ contentData 不存在');
        }
    } else {
        console.log('✗ window.contentDataLoader 不存在');
    }
}

// 检查DOM元素
function checkDOMElements() {
    console.log('2. 检查DOM元素...');
    
    const tbody = document.getElementById('productTableBody');
    if (tbody) {
        console.log('✓ productTableBody 元素存在');
        console.log('当前内容:', tbody.innerHTML.substring(0, 100) + '...');
    } else {
        console.log('✗ productTableBody 元素不存在');
    }
    
    // 检查其他相关元素
    const elements = [
        'productSearchInput',
        'productCategoryFilter', 
        'productSupplierFilter',
        'productStatusFilter'
    ];
    
    elements.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            console.log(`✓ ${id} 存在`);
        } else {
            console.log(`✗ ${id} 不存在`);
        }
    });
}

// 测试loadProductsList函数
function testLoadProductsList() {
    console.log('3. 测试 loadProductsList 函数...');
    
    if (typeof loadProductsList === 'function') {
        console.log('✓ loadProductsList 函数存在');
        
        try {
            loadProductsList();
            console.log('✓ loadProductsList 执行成功');
            
            // 检查执行后的表格内容
            setTimeout(() => {
                const tbody = document.getElementById('productTableBody');
                if (tbody) {
                    console.log('执行后表格内容:', tbody.innerHTML.substring(0, 200) + '...');
                }
            }, 100);
            
        } catch (error) {
            console.log('✗ loadProductsList 执行失败:', error);
        }
    } else {
        console.log('✗ loadProductsList 函数不存在');
    }
}

// 手动创建测试数据
function createTestData() {
    console.log('4. 创建测试数据...');
    
    const testProducts = [
        {
            id: 'test-1',
            title: '测试产品1',
            summary: '这是测试产品1的描述',
            model: 'TEST-001',
            series: '测试系列',
            supplier: '测试供应商',
            primary_category: '电子内窥镜',
            secondary_category: '工业视频内窥镜',
            status: 'published',
            statusName: '已发布',
            published: new Date().toISOString(),
            thumbnail: '/images/placeholder.jpg',
            featured: false
        },
        {
            id: 'test-2',
            title: '测试产品2',
            summary: '这是测试产品2的描述',
            model: 'TEST-002',
            series: '测试系列',
            supplier: '测试供应商',
            primary_category: '光纤内窥镜',
            secondary_category: '工业检测',
            status: 'draft',
            statusName: '草稿',
            published: new Date().toISOString(),
            thumbnail: '/images/placeholder.jpg',
            featured: true
        }
    ];
    
    // 创建或更新数据加载器
    if (!window.contentDataLoader) {
        window.contentDataLoader = {
            contentData: {
                products: testProducts
            }
        };
    } else {
        window.contentDataLoader.contentData.products = testProducts;
    }
    
    console.log('✓ 测试数据创建完成');
    return testProducts;
}

// 手动渲染产品列表
function manualRenderProducts(products) {
    console.log('5. 手动渲染产品列表...');
    
    const tbody = document.getElementById('productTableBody');
    if (!tbody) {
        console.log('✗ 找不到 productTableBody 元素');
        return;
    }
    
    if (!products || products.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="text-center">没有产品数据</td></tr>';
        console.log('✓ 显示空数据提示');
        return;
    }
    
    const html = products.map(product => `
        <tr>
            <td>
                <input type="checkbox" class="form-check-input product-checkbox" value="${product.id}">
            </td>
            <td>
                <img src="${product.thumbnail}" class="rounded" style="width: 50px; height: 50px; object-fit: cover;" alt="${product.title}" onerror="this.src='/images/placeholder.jpg'">
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
            <td><span class="badge ${product.status === 'published' ? 'bg-success' : 'bg-warning'}">${product.statusName || product.status}</span></td>
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
    
    tbody.innerHTML = html;
    console.log(`✓ 成功渲染 ${products.length} 个产品`);
}

// 运行完整调试
function runFullDebug() {
    console.log('=== 开始完整调试 ===');
    
    checkDataLoader();
    checkDOMElements();
    testLoadProductsList();
    
    // 如果数据加载失败，创建测试数据
    if (!window.contentDataLoader || !window.contentDataLoader.contentData || !window.contentDataLoader.contentData.products || window.contentDataLoader.contentData.products.length === 0) {
        console.log('数据加载失败，使用测试数据...');
        const testProducts = createTestData();
        manualRenderProducts(testProducts);
    }
    
    console.log('=== 调试完成 ===');
}

// 导出调试函数到全局
window.debugProducts = {
    checkDataLoader,
    checkDOMElements,
    testLoadProductsList,
    createTestData,
    manualRenderProducts,
    runFullDebug
};

console.log('调试脚本加载完成。使用 window.debugProducts.runFullDebug() 运行完整调试。');
