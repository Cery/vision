// 产品中心功能测试脚本

console.log('=== 产品中心功能测试开始 ===');

// 测试结果记录
const testResults = {
    passed: 0,
    failed: 0,
    tests: []
};

// 测试函数
function runTest(testName, testFunction) {
    try {
        console.log(`\n🧪 测试: ${testName}`);
        const result = testFunction();
        if (result) {
            console.log(`✅ 通过: ${testName}`);
            testResults.passed++;
            testResults.tests.push({ name: testName, status: 'PASSED', error: null });
        } else {
            console.log(`❌ 失败: ${testName}`);
            testResults.failed++;
            testResults.tests.push({ name: testName, status: 'FAILED', error: 'Test returned false' });
        }
    } catch (error) {
        console.log(`❌ 错误: ${testName} - ${error.message}`);
        testResults.failed++;
        testResults.tests.push({ name: testName, status: 'ERROR', error: error.message });
    }
}

// 1. 测试产品列表功能
function testProductsList() {
    console.log('检查产品列表功能...');
    
    // 检查函数是否存在
    if (typeof showProductsList !== 'function') {
        throw new Error('showProductsList 函数不存在');
    }
    
    if (typeof loadProductsList !== 'function') {
        throw new Error('loadProductsList 函数不存在');
    }
    
    if (typeof filterProducts !== 'function') {
        throw new Error('filterProducts 函数不存在');
    }
    
    // 检查分页功能
    if (typeof goToProductPage !== 'function') {
        throw new Error('goToProductPage 函数不存在');
    }
    
    if (typeof changeProductPageSize !== 'function') {
        throw new Error('changeProductPageSize 函数不存在');
    }
    
    console.log('  ✓ 所有产品列表函数存在');
    return true;
}

// 2. 测试产品CRUD功能
function testProductCRUD() {
    console.log('检查产品CRUD功能...');
    
    // 检查创建功能
    if (typeof createProduct !== 'function') {
        throw new Error('createProduct 函数不存在');
    }
    
    if (typeof saveNewProduct !== 'function') {
        throw new Error('saveNewProduct 函数不存在');
    }
    
    // 检查编辑功能
    if (typeof editProduct !== 'function') {
        throw new Error('editProduct 函数不存在');
    }
    
    if (typeof updateProduct !== 'function') {
        throw new Error('updateProduct 函数不存在');
    }
    
    // 检查查看功能
    if (typeof viewProduct !== 'function') {
        throw new Error('viewProduct 函数不存在');
    }
    
    // 检查复制功能
    if (typeof duplicateProduct !== 'function') {
        throw new Error('duplicateProduct 函数不存在');
    }
    
    if (typeof saveDuplicatedProduct !== 'function') {
        throw new Error('saveDuplicatedProduct 函数不存在');
    }
    
    // 检查删除功能
    if (typeof deleteProduct !== 'function') {
        throw new Error('deleteProduct 函数不存在');
    }
    
    console.log('  ✓ 所有产品CRUD函数存在');
    return true;
}

// 3. 测试批量操作功能
function testBatchOperations() {
    console.log('检查批量操作功能...');
    
    if (typeof batchPublishProducts !== 'function') {
        throw new Error('batchPublishProducts 函数不存在');
    }
    
    if (typeof batchArchiveProducts !== 'function') {
        throw new Error('batchArchiveProducts 函数不存在');
    }
    
    if (typeof batchDeleteProducts !== 'function') {
        throw new Error('batchDeleteProducts 函数不存在');
    }
    
    if (typeof batchExportProducts !== 'function') {
        throw new Error('batchExportProducts 函数不存在');
    }
    
    console.log('  ✓ 所有批量操作函数存在');
    return true;
}

// 4. 测试产品分类管理
function testProductCategories() {
    console.log('检查产品分类管理功能...');
    
    if (typeof showProductCategories !== 'function') {
        throw new Error('showProductCategories 函数不存在');
    }
    
    if (typeof loadProductCategories !== 'function') {
        throw new Error('loadProductCategories 函数不存在');
    }
    
    if (typeof createProductCategory !== 'function') {
        throw new Error('createProductCategory 函数不存在');
    }
    
    if (typeof editCategory !== 'function') {
        throw new Error('editCategory 函数不存在');
    }
    
    if (typeof deleteCategory !== 'function') {
        throw new Error('deleteCategory 函数不存在');
    }
    
    if (typeof saveCategory !== 'function') {
        throw new Error('saveCategory 函数不存在');
    }
    
    console.log('  ✓ 所有产品分类函数存在');
    return true;
}

// 5. 测试产品类型管理
function testProductTypes() {
    console.log('检查产品类型管理功能...');
    
    if (typeof showProductTypes !== 'function') {
        throw new Error('showProductTypes 函数不存在');
    }
    
    if (typeof loadProductTypes !== 'function') {
        throw new Error('loadProductTypes 函数不存在');
    }
    
    if (typeof createProductType !== 'function') {
        throw new Error('createProductType 函数不存在');
    }
    
    if (typeof editProductType !== 'function') {
        throw new Error('editProductType 函数不存在');
    }
    
    if (typeof deleteProductType !== 'function') {
        throw new Error('deleteProductType 函数不存在');
    }
    
    console.log('  ✓ 所有产品类型函数存在');
    return true;
}

// 6. 测试产品系列管理
function testProductSeries() {
    console.log('检查产品系列管理功能...');
    
    if (typeof showProductSeries !== 'function') {
        throw new Error('showProductSeries 函数不存在');
    }
    
    console.log('  ✓ 产品系列函数存在');
    return true;
}

// 7. 测试供应商管理
function testSuppliers() {
    console.log('检查供应商管理功能...');
    
    if (typeof showSuppliers !== 'function') {
        throw new Error('showSuppliers 函数不存在');
    }
    
    console.log('  ✓ 供应商管理函数存在');
    return true;
}

// 8. 测试数据加载器
function testDataLoader() {
    console.log('检查数据加载器...');
    
    if (typeof window.contentDataLoader === 'undefined') {
        console.log('  ⚠️ 数据加载器不存在，使用备用数据');
        return true;
    }
    
    const dataLoader = window.contentDataLoader;
    
    if (!dataLoader.contentData) {
        throw new Error('contentData 不存在');
    }
    
    console.log('  ✓ 数据加载器正常');
    return true;
}

// 9. 测试UI组件
function testUIComponents() {
    console.log('检查UI组件...');
    
    // 检查通知系统
    if (typeof showNotification !== 'function') {
        throw new Error('showNotification 函数不存在');
    }
    
    // 检查动态内容显示
    if (typeof showDynamicContent !== 'function') {
        throw new Error('showDynamicContent 函数不存在');
    }
    
    // 检查页面标题更新
    if (typeof updatePageTitle !== 'function') {
        throw new Error('updatePageTitle 函数不存在');
    }
    
    console.log('  ✓ 所有UI组件函数存在');
    return true;
}

// 运行所有测试
function runAllTests() {
    console.log('🚀 开始运行产品中心功能测试...\n');
    
    runTest('产品列表功能', testProductsList);
    runTest('产品CRUD功能', testProductCRUD);
    runTest('批量操作功能', testBatchOperations);
    runTest('产品分类管理', testProductCategories);
    runTest('产品类型管理', testProductTypes);
    runTest('产品系列管理', testProductSeries);
    runTest('供应商管理', testSuppliers);
    runTest('数据加载器', testDataLoader);
    runTest('UI组件', testUIComponents);
    
    // 输出测试结果
    console.log('\n=== 测试结果汇总 ===');
    console.log(`✅ 通过: ${testResults.passed}`);
    console.log(`❌ 失败: ${testResults.failed}`);
    console.log(`📊 总计: ${testResults.passed + testResults.failed}`);
    console.log(`🎯 成功率: ${((testResults.passed / (testResults.passed + testResults.failed)) * 100).toFixed(1)}%`);
    
    if (testResults.failed > 0) {
        console.log('\n❌ 失败的测试:');
        testResults.tests.filter(t => t.status !== 'PASSED').forEach(test => {
            console.log(`  - ${test.name}: ${test.error}`);
        });
    }
    
    console.log('\n=== 产品中心功能测试完成 ===');
    
    return testResults;
}

// 导出测试函数
window.productTests = {
    runAllTests,
    testResults
};

console.log('产品测试脚本加载完成。使用 window.productTests.runAllTests() 运行测试。');
