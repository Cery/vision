// 产品列表筛选功能增强脚本
document.addEventListener('DOMContentLoaded', function() {
    // 初始化级联显示功能
    initCascadingFilters();
    
    // 应用初始筛选
    updateFilterOptions();
});

// 初始化级联显示功能
function initCascadingFilters() {
    // 一级分类点击事件 - 级联显示二级分类
    document.querySelectorAll('.primary-btn').forEach(btn => {
        btn.addEventListener('click', function(e) {
            const primaryCategory = this.dataset.category;
            updateSecondaryCategories(primaryCategory);
        });
    });
    
    // 初始化时执行一次，确保页面加载时级联显示正确
    const activePrimaryBtn = document.querySelector('.primary-btn.active');
    if (activePrimaryBtn) {
        updateSecondaryCategories(activePrimaryBtn.dataset.category);
    }
}

// 更新二级分类显示
function updateSecondaryCategories(primaryCategory) {
    const secondaryBtns = document.querySelectorAll('.secondary-btn');
    
    if (!primaryCategory || primaryCategory === '') {
        // 如果没有选择一级分类，显示所有二级分类
        secondaryBtns.forEach(btn => {
            if (!btn.classList.contains('all-btn')) {
                btn.style.display = '';
            }
        });
        return;
    }
    
    // 显示与所选一级分类相关的二级分类
    secondaryBtns.forEach(btn => {
        if (btn.classList.contains('all-btn')) {
            // 始终显示"全部"按钮
            btn.style.display = '';
            return;
        }
        
        const primaryCategories = btn.dataset.primaryCategories?.split(',') || [];
        if (primaryCategories.includes(primaryCategory)) {
            btn.style.display = '';
        } else {
            btn.style.display = 'none';
        }
    });
}

// 更新筛选选项的可用状态
function updateFilterOptions() {
    // 获取当前筛选条件
    const currentPrimaryCategory = document.querySelector('.primary-btn.active')?.dataset.category || '';
    const currentSecondaryCategory = document.querySelector('.secondary-btn.active')?.dataset.category || '';
    
    // 获取参数筛选条件
    const parameterFilters = {};
    document.querySelectorAll('.parameter-filters select').forEach(select => {
        if (select.value) {
            parameterFilters[select.name] = select.value;
        }
    });
    
    // 获取所有产品
    const products = document.querySelectorAll('.product-item');
    const filteredProducts = [];
    
    // 应用筛选，找出符合条件的产品
    products.forEach(product => {
        let shouldShow = true;
        
        // 应用一级分类筛选
        if (currentPrimaryCategory && product.dataset.primaryCategory !== currentPrimaryCategory) {
            shouldShow = false;
        }
        
        // 应用二级分类筛选
        if (currentSecondaryCategory && product.dataset.secondaryCategory !== currentSecondaryCategory) {
            shouldShow = false;
        }
        
        // 应用参数筛选
        for (const [param, value] of Object.entries(parameterFilters)) {
            if (product.dataset[param] !== value) {
                shouldShow = false;
                break;
            }
        }
        
        if (shouldShow) {
            filteredProducts.push(product);
        }
    });
    
    // 收集所有可用的参数值
    const availableParams = {
        primaryCategory: new Set(),
        secondaryCategory: new Set(),
        lightSource: new Set(),
        viewingDirection: new Set(),
        fieldOfView: new Set(),
        insertionTubeLength: new Set()
    };
    
    // 从筛选后的产品中收集可用参数
    filteredProducts.forEach(product => {
        if (product.dataset.primaryCategory) availableParams.primaryCategory.add(product.dataset.primaryCategory);
        if (product.dataset.secondaryCategory) availableParams.secondaryCategory.add(product.dataset.secondaryCategory);
        if (product.dataset.lightSource) availableParams.lightSource.add(product.dataset.lightSource);
        if (product.dataset.viewingDirection) availableParams.viewingDirection.add(product.dataset.viewingDirection);
        if (product.dataset.fieldOfView) availableParams.fieldOfView.add(product.dataset.fieldOfView);
        if (product.dataset.insertionTubeLength) availableParams.insertionTubeLength.add(product.dataset.insertionTubeLength);
    });
    
    // 更新一级分类按钮状态
    document.querySelectorAll('.primary-btn').forEach(btn => {
        if (btn.classList.contains('all-btn')) return; // 跳过"全部"按钮
        
        const category = btn.dataset.category;
        if (!availableParams.primaryCategory.has(category) && !btn.classList.contains('active')) {
            btn.classList.add('disabled');
            btn.setAttribute('aria-disabled', 'true');
        } else {
            btn.classList.remove('disabled');
            btn.removeAttribute('aria-disabled');
        }
    });
    
    // 更新二级分类按钮状态
    document.querySelectorAll('.secondary-btn').forEach(btn => {
        if (btn.classList.contains('all-btn')) return; // 跳过"全部"按钮
        
        const category = btn.dataset.category;
        if (!availableParams.secondaryCategory.has(category) && !btn.classList.contains('active')) {
            btn.classList.add('disabled');
            btn.setAttribute('aria-disabled', 'true');
        } else {
            btn.classList.remove('disabled');
            btn.removeAttribute('aria-disabled');
        }
    });
    
    // 更新参数选择框选项状态
    document.querySelectorAll('.parameter-filters select').forEach(select => {
        const paramName = select.name;
        const mappedParamName = {
            'light_source': 'lightSource',
            'viewing_direction': 'viewingDirection',
            'field_of_view': 'fieldOfView',
            'insertion_tube_length': 'insertionTubeLength'
        }[paramName] || paramName;
        
        Array.from(select.options).forEach(option => {
            if (option.value === '') return; // 跳过"全部"选项
            
            if (!availableParams[mappedParamName]?.has(option.value) && option.value !== select.value) {
                option.disabled = true;
            } else {
                option.disabled = false;
            }
        });
    });
}

// 监听筛选变化
function listenToFilterChanges() {
    // 监听一级分类变化
    document.querySelectorAll('.primary-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateFilterOptions();
        });
    });
    
    // 监听二级分类变化
    document.querySelectorAll('.secondary-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            updateFilterOptions();
        });
    });
    
    // 监听参数选择变化
    document.querySelectorAll('.parameter-filters select').forEach(select => {
        select.addEventListener('change', function() {
            updateFilterOptions();
        });
    });
}

// 初始化监听器
listenToFilterChanges();