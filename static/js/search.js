// 搜索功能相关的JavaScript代码
const SearchModule = {
    init() {
        this.bindEvents();
        this.initializeSearchParams();
    },

    bindEvents() {
        // 搜索表单提交事件
        const searchForm = document.querySelector('.search-form');
        if (searchForm) {
            searchForm.addEventListener('submit', this.handleSearch.bind(this));
        }

        // 实时搜索输入事件
        const searchInput = document.querySelector('.search-input');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(this.handleLiveSearch.bind(this), 300));
        }

        // 搜索类型切换事件
        const searchTypeSelect = document.querySelector('select[name="type"]');
        if (searchTypeSelect) {
            searchTypeSelect.addEventListener('change', this.handleTypeChange.bind(this));
        }

        // 高级筛选项变化事件
        const filterInputs = document.querySelectorAll('.advanced-filters select, .advanced-filters input');
        filterInputs.forEach(input => {
            input.addEventListener('change', this.handleFilterChange.bind(this));
        });
    },

    initializeSearchParams() {
        // 从URL获取搜索参数并填充表单
        const urlParams = new URLSearchParams(window.location.search);
        const searchInput = document.querySelector('.search-input');
        const typeSelect = document.querySelector('select[name="type"]');

        if (searchInput && urlParams.has('q')) {
            searchInput.value = urlParams.get('q');
        }

        if (typeSelect && urlParams.has('type')) {
            typeSelect.value = urlParams.get('type');
        }

        // 填充高级筛选项
        this.fillAdvancedFilters(urlParams);
    },

    fillAdvancedFilters(urlParams) {
        const filterFields = [
            'category', 'supplier', 'price_min', 'price_max', 'date_start', 'date_end'
        ];

        filterFields.forEach(field => {
            const input = document.querySelector(`[name="${field}"]`);
            if (input && urlParams.has(field)) {
                input.value = urlParams.get(field);
            }
        });
    },

    handleSearch(event) {
        event.preventDefault();
        const formData = new FormData(event.target);
        const searchParams = new URLSearchParams();

        // 收集所有搜索参数
        for (const [key, value] of formData.entries()) {
            if (value) {
                searchParams.append(key, value);
            }
        }

        // 更新URL并触发搜索
        const newUrl = `${window.location.pathname}?${searchParams.toString()}`;
        window.location.href = newUrl;
    },

    handleLiveSearch(event) {
        const searchTerm = event.target.value;
        if (searchTerm.length >= 2) {
            this.performLiveSearch(searchTerm);
        }
    },

    async performLiveSearch(searchTerm) {
        try {
            const response = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
            const results = await response.json();
            this.displayLiveSearchResults(results);
        } catch (error) {
            console.error('搜索请求失败:', error);
        }
    },

    displayLiveSearchResults(results) {
        const resultsContainer = document.querySelector('.live-search-results');
        if (!resultsContainer) return;

        resultsContainer.innerHTML = '';
        
        if (results.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">未找到相关结果</div>';
            return;
        }

        const resultsList = document.createElement('ul');
        results.forEach(result => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${result.url}" class="search-result-item">
                    ${result.image ? `<img src="${result.image}" alt="${result.title}">` : ''}
                    <div class="result-info">
                        <h4>${result.title}</h4>
                        <p>${result.summary}</p>
                        <span class="result-type">${result.type}</span>
                    </div>
                </a>
            `;
            resultsList.appendChild(li);
        });

        resultsContainer.appendChild(resultsList);
    },

    handleTypeChange(event) {
        const selectedType = event.target.value;
        // 根据选择的类型更新高级筛选选项的显示状态
        this.updateFilterVisibility(selectedType);
    },

    handleFilterChange(event) {
        // 当筛选条件改变时，可以选择立即执行搜索或等待用户手动提交
        const autoSearch = false; // 设置是否自动执行搜索
        if (autoSearch) {
            const form = event.target.closest('form');
            if (form) {
                this.handleSearch(new Event('submit'));
            }
        }
    },

    updateFilterVisibility(type) {
        const filterGroups = {
            products: ['category', 'supplier', 'price'],
            articles: ['date', 'category'],
            all: ['category', 'supplier', 'price', 'date']
        };

        const filters = document.querySelectorAll('.advanced-filters [data-filter-group]');
        filters.forEach(filter => {
            const group = filter.dataset.filterGroup;
            const shouldShow = filterGroups[type]?.includes(group) || type === 'all';
            filter.style.display = shouldShow ? 'block' : 'none';
        });
    },

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};

// 页面加载完成后初始化搜索模块
document.addEventListener('DOMContentLoaded', () => {
    SearchModule.init();
});