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
    // 增强的搜索管理器
    class HugoSearchManager {
        constructor() {
            this.isReady = false;
            this.index = [];
            this.onReadyCallbacks = [];
            this.searchCache = new Map();
            this.maxCacheSize = 100;
            this.init();
        }

        init() {
            if (window.searchIndex) {
                this.index = this.preprocessIndex(window.searchIndex);
                this.isReady = true;
                this.onReadyCallbacks.forEach(cb => cb());
                console.log(`搜索引擎已就绪，索引了 ${this.index.length} 个项目`);
            } else {
                setTimeout(() => this.init(), 100);
            }
        }

        preprocessIndex(rawIndex) {
            return rawIndex.map(item => {
                // 深度清理数据 - 处理Hugo jsonify的双重编码问题
                let cleanTitle = item.title || '';
                let cleanUrl = item.url || '';
                let cleanContent = item.content || '';

                // 如果数据是字符串形式的JSON，先解析
                if (typeof cleanTitle === 'string' && cleanTitle.startsWith('"') && cleanTitle.endsWith('"')) {
                    try {
                        cleanTitle = JSON.parse(cleanTitle);
                    } catch (e) {
                        // 如果JSON解析失败，手动清理
                        cleanTitle = cleanTitle.replace(/^"|"$/g, '').replace(/\\"/g, '"');
                    }
                }

                if (typeof cleanUrl === 'string' && cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
                    try {
                        cleanUrl = JSON.parse(cleanUrl);
                    } catch (e) {
                        cleanUrl = cleanUrl.replace(/^"|"$/g, '').replace(/\\"/g, '"');
                    }
                }

                if (typeof cleanContent === 'string' && cleanContent.startsWith('"') && cleanContent.endsWith('"')) {
                    try {
                        cleanContent = JSON.parse(cleanContent);
                    } catch (e) {
                        cleanContent = cleanContent.replace(/^"|"$/g, '').replace(/\\"/g, '"');
                    }
                }

                // 进一步清理
                cleanTitle = cleanTitle.replace(/\\n/g, ' ').trim();
                cleanContent = cleanContent.replace(/\\n/g, ' ').trim();

                // 确保URL格式正确
                if (cleanUrl && !cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
                    cleanUrl = '/' + cleanUrl;
                }

                return {
                    ...item,
                    title: cleanTitle,
                    url: cleanUrl,
                    content: cleanContent,
                    titleLower: cleanTitle.toLowerCase(),
                    contentLower: cleanContent.toLowerCase(),
                    keywords: this.extractKeywords(cleanTitle + ' ' + cleanContent)
                };
            });
        }

        extractKeywords(text) {
            // 提取关键词，去除常见停用词
            const stopWords = new Set(['的', '了', '在', '是', '我', '有', '和', '就', '不', '人', '都', '一', '一个', '上', '也', '很', '到', '说', '要', '去', '你', '会', '着', '没有', '看', '好', '自己', '这']);
            return text.toLowerCase()
                .replace(/[^\w\s\u4e00-\u9fff]/g, ' ')
                .split(/\s+/)
                .filter(word => word.length > 1 && !stopWords.has(word))
                .slice(0, 20); // 限制关键词数量
        }

        onReady(cb) {
            if (this.isReady) cb();
            else this.onReadyCallbacks.push(cb);
        }

        getSuggestions(query, type = 'all') {
            if (!query || query.length < 1) return [];

            const cacheKey = `suggestions_${query}_${type}`;
            if (this.searchCache.has(cacheKey)) {
                return this.searchCache.get(cacheKey);
            }

            const queryLower = query.toLowerCase();
            const suggestions = this.index
                .filter(item => {
                    if (type !== 'all' && item.type !== type) return false;
                    return item.titleLower.includes(queryLower) ||
                           item.keywords.some(keyword => keyword.includes(queryLower));
                })
                .slice(0, 6)
                .map(item => ({
                    title: item.title,
                    type: item.type,
                    url: item.url
                }));

            this.setCacheItem(cacheKey, suggestions);
            return suggestions;
        }

        search(query, type = 'all') {
            if (!query || query.length < 1) return [];

            const cacheKey = `search_${query}_${type}`;
            if (this.searchCache.has(cacheKey)) {
                return this.searchCache.get(cacheKey);
            }

            const queryLower = query.toLowerCase();
            const queryWords = queryLower.split(/\s+/).filter(word => word.length > 0);

            const results = this.index
                .map(item => {
                    if (type !== 'all' && item.type !== type) return null;

                    const score = this.calculateRelevanceScore(item, queryLower, queryWords);
                    if (score <= 0) return null;

                    return {
                        ...item,
                        score: score
                    };
                })
                .filter(item => item !== null)
                .sort((a, b) => b.score - a.score)
                .slice(0, 20); // 限制结果数量

            this.setCacheItem(cacheKey, results);
            return results;
        }

        calculateRelevanceScore(item, query, queryWords) {
            let score = 0;
            const title = item.titleLower;
            const content = item.contentLower;

            // 完全匹配标题
            if (title === query) {
                score += 10;
            }
            // 标题包含完整查询
            else if (title.includes(query)) {
                score += 8;
                // 标题开头匹配加分
                if (title.startsWith(query)) {
                    score += 2;
                }
            }

            // 内容包含完整查询
            if (content.includes(query)) {
                score += 3;
            }

            // 分词匹配
            queryWords.forEach(word => {
                if (title.includes(word)) {
                    score += 2;
                }
                if (content.includes(word)) {
                    score += 1;
                }
                // 关键词匹配
                if (item.keywords.includes(word)) {
                    score += 1.5;
                }
            });

            // 类型权重
            const typeWeights = {
                'product': 1.2,
                'article': 1.0,
                'case': 1.1
            };
            score *= (typeWeights[item.type] || 1.0);

            // 标题长度权重（较短的标题可能更相关）
            if (score > 0) {
                const titleLength = item.title.length;
                const lengthFactor = Math.max(0.5, 1 - (titleLength - 20) / 100);
                score *= lengthFactor;
            }

            return score;
        }

        setCacheItem(key, value) {
            if (this.searchCache.size >= this.maxCacheSize) {
                // 删除最旧的缓存项
                const firstKey = this.searchCache.keys().next().value;
                this.searchCache.delete(firstKey);
            }
            this.searchCache.set(key, value);
        }

        clearCache() {
            this.searchCache.clear();
        }

        getStats() {
            return {
                indexSize: this.index.length,
                cacheSize: this.searchCache.size,
                isReady: this.isReady
            };
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