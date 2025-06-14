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
        // 限制结果条数为10
        const limitedResults = results.slice(0, 10);
        if (limitedResults.length === 0) {
            resultsContainer.innerHTML = '<div class="no-results">未找到相关结果</div>';
            return;
        }
        const resultsList = document.createElement('ul');
        limitedResults.forEach(result => {
            const li = document.createElement('li');
            li.innerHTML = `
                <a href="${result.url}" class="search-result-item">
                    ${result.image ? `<img src="${result.image}" alt="${escapeHTML(result.title)}">` : ''}
                    <div class="result-info">
                        <h4>${escapeHTML(result.title)}</h4>
                        <p>${escapeHTML(result.summary)}</p>
                        <span class="result-type">${escapeHTML(result.type)}</span>
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
    },

    // 获取搜索建议
    getSuggestions: function(query, limit = 5) {
        if (!query || !this.searchEngine) {
            return [];
        }
        // 返回带url的建议对象，限制为5条
        const suggestions = this.searchEngine.search(query)
            .slice(0, limit)
            .map(result => ({
                title: result.item.title,
                url: result.item.url
            }));
        if (suggestions.length === 0) {
            const partialMatches = this.documents
                .filter(doc => 
                    doc.title.toLowerCase().includes(query.toLowerCase()) ||
                    doc.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase()))
                )
                .slice(0, limit)
                .map(doc => ({
                    title: doc.title,
                    url: doc.url
                }));
            return partialMatches;
        }
        return suggestions;
    }
};

// 页面加载完成后初始化搜索模块
document.addEventListener('DOMContentLoaded', () => {
    SearchModule.init();
});

(function() {
    // 轻量级搜索管理器
    class HugoSearchManager {
        constructor() {
            this.isReady = false;
            this.index = [];
            this.onReadyCallbacks = [];
            this.init();
        }
        init() {
            if (window.searchIndex) {
                this.index = window.searchIndex;
                this.isReady = true;
                this.onReadyCallbacks.forEach(cb => cb());
            } else {
                setTimeout(() => this.init(), 100);
            }
        }
        onReady(cb) {
            if (this.isReady) cb();
            else this.onReadyCallbacks.push(cb);
        }
        getSuggestions(query, type = 'all') {
            return this.index
                .filter(item => (type === 'all' || item.type === type) && (item.title.includes(query) || item.content.includes(query)))
                .slice(0, 5)
                .map(item => item.title);
        }
        search(query, type = 'all') {
            return this.index
                .filter(item => (type === 'all' || item.type === type) && (item.title.includes(query) || item.content.includes(query)))
                .map(item => ({
                    ...item,
                    score: 0.7 // 可根据需要实现更复杂的相关度算法
                }));
        }
    }

    // 全局搜索管理器实例
    window.visndtSearchManager = new HugoSearchManager();

    // 页面加载后初始化搜索管理器
    document.addEventListener('DOMContentLoaded', () => {
        const initResult = window.visndtSearchManager.init();
        if (!initResult) {
            console.error('搜索管理器初始化失败！');
        }
    });
})();

// HTML转义函数
function escapeHTML(str) {
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}