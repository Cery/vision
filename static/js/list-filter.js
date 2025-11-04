// 产品筛选功能
document.addEventListener('DOMContentLoaded', function() {
    // 初始化
    initializeFilters();
});

// 初始化筛选功能
function initializeFilters() {
    try {
        // 收集所有产品数据
        const allProducts = collectProductData();
        
        // 构建可用的筛选选项
        buildAvailableFilterOptions(allProducts);
        
        // 添加事件监听器
        addFilterEventListeners(allProducts);
        
        // 应用URL中的筛选条件
        applyURLFilters(allProducts);
        
        console.log('筛选功能初始化成功');
    } catch (error) {
        console.error('搜索管理器初始化失败!', error);
    }
}

// 收集所有产品数据
function collectProductData() {
    const productElements = document.querySelectorAll('.product-item');
    const products = [];
    
    productElements.forEach(element => {
        const product = {
            element: element,
            primaryCategory: element.dataset.primaryCategory || '',
            secondaryCategory: element.dataset.secondaryCategory || '',
            
            // 电子内窥镜参数
            insertionLength: element.dataset.insertionLength || '',
            screenSize: element.dataset.screenSize || '',
            batteryLife: element.dataset.batteryLife || '',
            resolution: element.dataset.resolution || '',
            electronicGuidance: element.dataset.electronicGuidance || '',
            cableMaterial: element.dataset.cableMaterial || '',
            
            // 光纤内窥镜参数
            fiberWorkingLength: element.dataset.fiberWorkingLength || '',
            fiberFieldOfView: element.dataset.fiberFieldOfView || '',
            focalLength: element.dataset.focalLength || '',
            fiberGuidance: element.dataset.fiberGuidance || '',
            
            // 光学内窥镜参数
            opticalWorkingLength: element.dataset.opticalWorkingLength || '',
            opticalFieldOfView: element.dataset.opticalFieldOfView || ''
        };
        
        products.push(product);
    });
    
    return products;
}

// 构建可用的筛选选项
function buildAvailableFilterOptions(allProducts) {
    // 获取所有可用的筛选选项
    const availableFilters = {
        primaryCategory: new Set(),
        secondaryCategory: new Set(),
        
        // 电子内窥镜参数
        insertionLength: new Set(),
        screenSize: new Set(),
        batteryLife: new Set(),
        resolution: new Set(),
        electronicGuidance: new Set(),
        cableMaterial: new Set(),
        
        // 光纤内窥镜参数
        fiberWorkingLength: new Set(),
        fiberFieldOfView: new Set(),
        focalLength: new Set(),
        fiberGuidance: new Set(),
        
        // 光学内窥镜参数
        opticalWorkingLength: new Set(),
        opticalFieldOfView: new Set()
    };
    
    // 收集所有可用的筛选选项
    allProducts.forEach(product => {
        Object.keys(availableFilters).forEach(key => {
            if (product[key]) {
                availableFilters[key].add(product[key]);
            }
        });
    });
    
    // 存储可用的筛选选项
    window.availableFilters = availableFilters;
}

// 根据当前筛选条件更新筛选选项
function updateFilterOptions(allProducts, currentFilters) {
    // 获取符合当前筛选条件的产品
    const filteredProducts = getFilteredProducts(allProducts, currentFilters);
    
    // 获取可用的筛选选项
    const availableOptions = {};
    
    // 收集可用的筛选选项
    filteredProducts.forEach(product => {
        Object.keys(product).forEach(key => {
            if (key !== 'element' && product[key]) {
                if (!availableOptions[key]) {
                    availableOptions[key] = new Set();
                }
                availableOptions[key].add(product[key]);
            }
        });
    });
    
    // 更新筛选选项
    updateSelectOptions('insertionLength', availableOptions.insertionLength, currentFilters.insertionLength);
    updateSelectOptions('screenSize', availableOptions.screenSize, currentFilters.screenSize);
    updateSelectOptions('batteryLife', availableOptions.batteryLife, currentFilters.batteryLife);
    updateSelectOptions('resolution', availableOptions.resolution, currentFilters.resolution);
    updateSelectOptions('electronicGuidance', availableOptions.electronicGuidance, currentFilters.electronicGuidance);
    updateSelectOptions('cableMaterial', availableOptions.cableMaterial, currentFilters.cableMaterial);
    
    updateSelectOptions('fiberWorkingLength', availableOptions.fiberWorkingLength, currentFilters.fiberWorkingLength);
    updateSelectOptions('fiberFieldOfView', availableOptions.fiberFieldOfView, currentFilters.fiberFieldOfView);
    updateSelectOptions('focalLength', availableOptions.focalLength, currentFilters.focalLength);
    updateSelectOptions('fiberGuidance', availableOptions.fiberGuidance, currentFilters.fiberGuidance);
    
    updateSelectOptions('opticalWorkingLength', availableOptions.opticalWorkingLength, currentFilters.opticalWorkingLength);
    updateSelectOptions('opticalFieldOfView', availableOptions.opticalFieldOfView, currentFilters.opticalFieldOfView);
}

// 更新下拉选择框选项
function updateSelectOptions(selectId, availableOptions, currentValue) {
    const select = document.getElementById(selectId);
    if (!select) return;
    
    // 保存当前选择的值
    const selectedValue = currentValue || select.value;
    
    // 清空选项
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // 添加可用选项
    if (availableOptions) {
        Array.from(availableOptions).sort().forEach(option => {
            const optionElement = document.createElement('option');
            optionElement.value = option;
            optionElement.textContent = option;
            select.appendChild(optionElement);
        });
    }
    
    // 恢复选择的值
    if (selectedValue && Array.from(select.options).some(option => option.value === selectedValue)) {
        select.value = selectedValue;
    } else {
        select.selectedIndex = 0;
    }
}

// 添加事件监听器
function addFilterEventListeners(allProducts) {
    // 分类按钮事件监听器
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.addEventListener('click', function() {
            // 移除同级按钮的活动状态
            const siblings = Array.from(this.parentElement.children);
            siblings.forEach(sibling => {
                sibling.classList.remove('active');
            });
            
            // 切换当前按钮的活动状态
            this.classList.toggle('active');
            
            // 应用所有筛选条件
            applyAllFilters(allProducts);
        });
    });
    
    // 参数选择框事件监听器
    const parameterSelects = document.querySelectorAll('.parameter-select select');
    parameterSelects.forEach(select => {
        select.addEventListener('change', function() {
            applyAllFilters(allProducts);
        });
    });
    
    // 动态绑定筛选控件事件监听器
    const dynamicParameterSelects = [
        'screenSize', 'batteryLife', 'resolution', 'electronicGuidance',
        'cableMaterial', 'fiberWorkingLength', 'fiberFieldOfView',
        'focalLength', 'fiberGuidance', 'opticalWorkingLength', 'opticalFieldOfView'
    ];

    dynamicParameterSelects.forEach(id => {
        const selectElement = document.getElementById(id);
        if (selectElement) {
            selectElement.addEventListener('change', function() {
                applyAllFilters(allProducts);
            });
        }
    });
    
    // 重置按钮事件监听器
    const resetButton = document.querySelector('.filter-reset');
    if (resetButton) {
        resetButton.addEventListener('click', function() {
            resetAllFilters(allProducts);
        });
    }
    
    // 应用按钮事件监听器
    const applyButton = document.querySelector('.filter-apply');
    if (applyButton) {
        applyButton.addEventListener('click', function() {
            applyAllFilters(allProducts);
        });
    }
}

// 获取当前筛选条件
function getCurrentFilters() {
    const filters = {};
    
    // 获取分类筛选
    const primaryCategoryBtn = document.querySelector('.category-btn.primary.active');
    if (primaryCategoryBtn) {
        filters.primaryCategory = primaryCategoryBtn.dataset.category;
    }
    
    const secondaryCategoryBtn = document.querySelector('.category-btn.secondary.active');
    if (secondaryCategoryBtn) {
        filters.secondaryCategory = secondaryCategoryBtn.dataset.category;
    }
    
    // 获取参数筛选
    const parameterSelects = {
        // 电子内窥镜参数
        insertionLength: document.getElementById('insertionLength'),
        screenSize: document.getElementById('screenSize'),
        batteryLife: document.getElementById('batteryLife'),
        resolution: document.getElementById('resolution'),
        electronicGuidance: document.getElementById('electronicGuidance'),
        cableMaterial: document.getElementById('cableMaterial'),
        
        // 光纤内窥镜参数
        fiberWorkingLength: document.getElementById('fiberWorkingLength'),
        fiberFieldOfView: document.getElementById('fiberFieldOfView'),
        focalLength: document.getElementById('focalLength'),
        fiberGuidance: document.getElementById('fiberGuidance'),
        
        // 光学内窥镜参数
        opticalWorkingLength: document.getElementById('opticalWorkingLength'),
        opticalFieldOfView: document.getElementById('opticalFieldOfView')
    };
    
    // 添加有选择的参数到筛选条件
    Object.entries(parameterSelects).forEach(([key, select]) => {
        if (select && select.value) {
            filters[key] = select.value;
        }
    });
    
    return filters;
}

// 获取符合筛选条件的产品
function getFilteredProducts(allProducts, filters) {
    return allProducts.filter(product => {
        // 检查主分类
        if (filters.primaryCategory && product.primaryCategory !== filters.primaryCategory) {
            return false;
        }

        // 检查二级分类
        if (filters.secondaryCategory && product.secondaryCategory !== filters.secondaryCategory) {
            return false;
        }

        // 检查电子内窥镜参数
        if (filters.insertionLength && product.insertionLength !== filters.insertionLength) {
            return false;
        }

        if (filters.screenSize && product.screenSize !== filters.screenSize) {
            return false;
        }

        if (filters.batteryLife && product.batteryLife !== filters.batteryLife) {
            return false;
        }

        if (filters.resolution && product.resolution !== filters.resolution) {
            return false;
        }

        if (filters.electronicGuidance && product.electronicGuidance !== filters.electronicGuidance) {
            return false;
        }

        if (filters.cableMaterial && product.cableMaterial !== filters.cableMaterial) {
            return false;
        }

        // 检查光纤内窥镜参数
        if (filters.fiberWorkingLength && product.fiberWorkingLength !== filters.fiberWorkingLength) {
            return false;
        }

        if (filters.fiberFieldOfView && product.fiberFieldOfView !== filters.fiberFieldOfView) {
            return false;
        }

        if (filters.focalLength && product.focalLength !== filters.focalLength) {
            return false;
        }

        if (filters.fiberGuidance && product.fiberGuidance !== filters.fiberGuidance) {
            return false;
        }

        // 检查光学内窥镜参数
        if (filters.opticalWorkingLength && product.opticalWorkingLength !== filters.opticalWorkingLength) {
            return false;
        }

        if (filters.opticalFieldOfView && product.opticalFieldOfView !== filters.opticalFieldOfView) {
            return false;
        }

        return true;
    });
}

// 应用所有筛选条件
// 添加已选项目显示和重置按钮
function updateSelectedFiltersDisplay(filters) {
    const selectedFiltersContainer = document.getElementById('selected-filters');
    if (!selectedFiltersContainer) return;

    // 清空已选项目显示
    selectedFiltersContainer.innerHTML = '';

    // 动态添加已选项目
    Object.entries(filters).forEach(([key, value]) => {
        if (value) {
            const filterItem = document.createElement('span');
            filterItem.className = 'selected-filter-item';
            filterItem.textContent = `${key}: ${value}`;
            selectedFiltersContainer.appendChild(filterItem);
        }
    });

    // 添加重置按钮
    const resetButton = document.createElement('button');
    resetButton.className = 'reset-filters-btn';
    resetButton.textContent = '重置筛选';
    resetButton.addEventListener('click', () => {
        resetAllFilters(window.allProducts);
    });
    selectedFiltersContainer.appendChild(resetButton);
}

// 修改筛选逻辑为即选即筛
function applyAllFilters(allProducts) {
    const filters = getCurrentFilters();
    const filteredProducts = getFilteredProducts(allProducts, filters);

    allProducts.forEach(product => {
        product.element.style.display = filteredProducts.includes(product) ? '' : 'none';
    });

    displayFilterMessage(filteredProducts.length, allProducts.length);
    updateFilterOptions(allProducts, filters);
    updateSelectedFiltersDisplay(filters);
}

// 显示筛选信息
function displayFilterMessage(filteredCount, totalCount) {
    const messageElement = document.querySelector('.filter-message');
    if (messageElement) {
        if (filteredCount === 0) {
            messageElement.textContent = '没有符合条件的产品';
            messageElement.style.display = '';
        } else if (filteredCount < totalCount) {
            messageElement.textContent = `显示 ${filteredCount} 个产品（共 ${totalCount} 个）`;
            messageElement.style.display = '';
        } else {
            messageElement.style.display = 'none';
        }
    }
}

// 应用URL中的筛选条件
function applyURLFilters(allProducts) {
    try {
        // 获取URL参数
        const urlParams = new URLSearchParams(window.location.search);
        
        // 应用主分类筛选
        const primaryCategory = urlParams.get('primary');
        if (primaryCategory) {
            const primaryCategoryBtn = document.querySelector(`.category-btn.primary[data-category="${primaryCategory}"]`);
            if (primaryCategoryBtn) {
                // 移除同级按钮的活动状态
                const siblings = Array.from(primaryCategoryBtn.parentElement.children);
                siblings.forEach(sibling => {
                    sibling.classList.remove('active');
                });
                
                // 设置当前按钮的活动状态
                primaryCategoryBtn.classList.add('active');
            }
        }
        
        // 应用二级分类筛选
        const secondaryCategory = urlParams.get('secondary');
        if (secondaryCategory) {
            const secondaryCategoryBtn = document.querySelector(`.category-btn.secondary[data-category="${secondaryCategory}"]`);
            if (secondaryCategoryBtn) {
                // 移除同级按钮的活动状态
                const siblings = Array.from(secondaryCategoryBtn.parentElement.children);
                siblings.forEach(sibling => {
                    sibling.classList.remove('active');
                });
                
                // 设置当前按钮的活动状态
                secondaryCategoryBtn.classList.add('active');
            }
        }
        
        // 应用参数筛选
        const parameterMap = {
            'insertion-length': 'insertionLength',
            'screen-size': 'screenSize',
            'battery-life': 'batteryLife',
            'resolution': 'resolution',
            'electronic-guidance': 'electronicGuidance',
            'cable-material': 'cableMaterial',
            'fiber-working-length': 'fiberWorkingLength',
            'fiber-field-of-view': 'fiberFieldOfView',
            'focal-length': 'focalLength',
            'fiber-guidance': 'fiberGuidance',
            'optical-working-length': 'opticalWorkingLength',
            'optical-field-of-view': 'opticalFieldOfView'
        };
        
        // 应用参数筛选
        Object.entries(parameterMap).forEach(([urlKey, selectId]) => {
            const value = urlParams.get(urlKey);
            if (value) {
                const select = document.getElementById(selectId);
                if (select) {
                    select.value = value;
                }
            }
        });
        
        // 应用所有筛选条件
        applyAllFilters(allProducts);
    } catch (error) {
        console.error('应用URL筛选条件失败', error);
    }
}

// 更新URL参数
function updateURLParameters(filters) {
    // 创建URL参数
    const urlParams = new URLSearchParams();
    
    // 添加分类筛选参数
    if (filters.primaryCategory) {
        urlParams.set('primary', filters.primaryCategory);
    }
    
    if (filters.secondaryCategory) {
        urlParams.set('secondary', filters.secondaryCategory);
    }
    
    // 添加参数筛选参数
    const parameterMap = {
        'insertionLength': 'insertion-length',
        'screenSize': 'screen-size',
        'batteryLife': 'battery-life',
        'resolution': 'resolution',
        'electronicGuidance': 'electronic-guidance',
        'cableMaterial': 'cable-material',
        'fiberWorkingLength': 'fiber-working-length',
        'fiberFieldOfView': 'fiber-field-of-view',
        'focalLength': 'focal-length',
        'fiberGuidance': 'fiber-guidance',
        'opticalWorkingLength': 'optical-working-length',
        'opticalFieldOfView': 'optical-field-of-view'
    };
    
    // 添加参数筛选参数
    Object.entries(parameterMap).forEach(([filterKey, urlKey]) => {
        if (filters[filterKey]) {
            urlParams.set(urlKey, filters[filterKey]);
        }
    });
    
    // 更新URL
    const newURL = `${window.location.pathname}?${urlParams.toString()}`;
    window.history.replaceState({}, '', newURL);
}

// 重置所有筛选条件
function resetAllFilters(allProducts) {
    // 重置分类按钮
    const categoryButtons = document.querySelectorAll('.category-btn');
    categoryButtons.forEach(button => {
        button.classList.remove('active');
    });
    
    // 重置参数选择框
    const parameterSelects = document.querySelectorAll('.parameter-select select');
    parameterSelects.forEach(select => {
        select.selectedIndex = 0;
    });
    
    // 应用所有筛选条件
    applyAllFilters(allProducts);
}