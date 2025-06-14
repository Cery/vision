(function() {
    class SearchModalManager {
        constructor() {
            this.searchModal = document.getElementById('searchModal');
            this.searchInput = document.getElementById('searchInput');
            this.searchResults = document.getElementById('searchResults');
            this.searchTypeButtons = document.querySelectorAll('.search-type-btn');
            this.searchButton = document.getElementById('searchBtn');

            this.currentSearchType = 'all';
            this.searchHistory = [];
            this.MAX_HISTORY_LENGTH = 10;

            this.loadSearchHistory();
            this.initEventListeners();
        }

        initEventListeners() {
            if (this.searchModal) {
                this.searchModal.addEventListener('shown.bs.modal', () => {
                    this.renderSearchHistory();
                    if (this.searchInput) this.searchInput.focus();
                });
            }
            if (this.searchTypeButtons.length > 0) {
                this.searchTypeButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.currentSearchType = e.target.dataset.type || 'all';
                        this.updateSearchTypeUI(e.target);
                        this.performSearch();
                    });
                });
            }
            if (this.searchInput) {
                this.searchInput.addEventListener('input', () => {
                    const query = this.searchInput.value.trim();
                    this.updateSearchSuggestions(query);
                });
                this.searchInput.addEventListener('keyup', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault(); 
                        this.performSearch();
                    }
                });
            }
            if (this.searchButton) {
                this.searchButton.addEventListener('click', (e) => {
                    e.preventDefault(); 
                    this.performSearch();
                });
            }
        }

        updateSearchTypeUI(activeButton) {
            this.searchTypeButtons.forEach(btn => btn.classList.remove('active'));
            activeButton.classList.add('active');
        }

        updateSearchSuggestions(query) {
            if (!query) {
                this.renderSearchHistory(); 
                return;
            }
            window.visndtSearchManager.onReady(() => {
                const suggestions = window.visndtSearchManager.getSuggestions(query, this.currentSearchType);
                this.renderSuggestions(suggestions);
            });
        }

        renderSuggestions(suggestions) {
            if (!Array.isArray(suggestions)) {
                console.warn('搜索建议数据格式不正确:', suggestions);
                return;
            }

            // 规范化建议数据
            const normalizedSuggestions = suggestions.map(suggestion => {
                if (typeof suggestion === 'string') {
                    return {
                        title: suggestion,
                        type: 'product', // 默认为产品类型
                        url: `/products/${encodeURIComponent(suggestion)}/`
                    };
                }
                return {
                    title: suggestion.title,
                    type: suggestion.type || 'product',
                    url: suggestion.url || (suggestion.type === 'post' ? 
                        `/posts/${encodeURIComponent(suggestion.title)}/` : 
                        `/products/${encodeURIComponent(suggestion.title)}/`)
                };
            });

            // 限制显示数量
            const limitedSuggestions = normalizedSuggestions.slice(0, 5);

            // 渲染建议列表
            this.searchResults.innerHTML = limitedSuggestions.length > 0 ? 
                limitedSuggestions.map(suggestion => `
                    <a href="${suggestion.url}" class="search-suggestion d-flex align-items-center" data-type="${suggestion.type}" tabindex="0">
                        <span class="icon me-2 text-primary"><i class="fas fa-arrow-circle-right"></i></span>
                        <span>${this.highlightText(escapeHTML(suggestion.title), this.searchInput.value)}</span>
                    </a>
                `).join('') : 
                '<div class="search-hint text-center text-muted py-4">未找到相关建议</div>';

            // 添加点击事件处理
            this.searchResults.querySelectorAll('.search-suggestion').forEach(item => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = item.getAttribute('href');
                    const type = item.getAttribute('data-type');
                    
                    if (url && url !== '#') {
                        console.log('点击搜索建议:', {url, type});
                        window.location.href = url;
                    }
                });
            });
        }

        renderSearchHistory() {
            if (!this.searchResults) return;
            const history = this.searchHistory;
            const hotKeywords = ['内窥镜', '视觉检测', '工业相机', '无损检测', '探伤仪', '光纤内窥镜'];
            const hotKeywordsHtml = hotKeywords.map(keyword => `
                <span class="badge bg-light text-dark m-1 hot-keyword-item" data-keyword="${keyword}">
                    <i class="fas fa-fire text-danger me-1"></i>${keyword}
                </span>
            `).join('');
            let historySectionHtml = '';
            if (history.length > 0) {
                historySectionHtml = `
                    <div class="search-history-section mb-3">
                        <h6 class="mb-2">搜索历史</h6>
                        ${history.map(query => `
                            <div class="search-history-item d-flex align-items-center" data-query="${query}">
                                <span class="icon me-2 text-secondary"><i class="fas fa-history"></i></span>
                                <span>${query}</span>
                            </div>
                        `).join('')}
                        <button id="clearHistoryBtn" class="btn btn-sm btn-outline-secondary mt-2">清除历史</button>
                    </div>
                `;
            } else {
                historySectionHtml = `
                    <div class="search-history-section mb-3">
                        <h6 class="mb-2">搜索历史</h6>
                        <div class="search-hint text-center text-muted">暂无搜索历史</div>
                    </div>
                `;
            }
            this.searchResults.innerHTML = `
                ${historySectionHtml}
                <div class="search-hot-keywords-section mt-3">
                    <h6 class="mb-2">热门搜索</h6>
                    <div class="d-flex flex-wrap">
                        ${hotKeywordsHtml}
                    </div>
                </div>
            `;
            this.clearHistoryButton = document.getElementById('clearHistoryBtn');
            if (this.clearHistoryButton) {
                this.clearHistoryButton.addEventListener('click', () => this.clearSearchHistory());
            }
            document.querySelectorAll('.search-history-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    this.searchInput.value = e.currentTarget.dataset.query;
                    this.performSearch();
                });
            });
            document.querySelectorAll('.hot-keyword-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    this.searchInput.value = e.currentTarget.dataset.keyword;
                    this.performSearch();
                });
            });
        }

        performSearch() {
            const query = this.searchInput.value.trim();
            if (!query) {
                this.renderSearchHistory(); 
                return;
            }
            window.visndtSearchManager.onReady(() => {
                const results = window.visndtSearchManager.search(query, this.currentSearchType);
                this.displaySearchResults(results);
                this.updateSearchHistory(query);
            });
        }

        displaySearchResults(results) {
            if (!this.searchResults) return;
            // 限制结果条数为10
            const limitedResults = results.slice(0, 10);
            if (limitedResults.length === 0) {
                this.searchResults.innerHTML = `
                    <div class=\"no-results text-center text-muted py-4\">
                        <i class=\"fas fa-search-minus fa-2x mb-2\"></i>
                        <p>未找到与\"${this.searchInput.value}\"相关的结果</p>
                        <p>请尝试其他关键词</p>
                    </div>
                `;
                return;
            }
            this.searchResults.innerHTML = limitedResults.map(result => `
                <a href=\"${result.url}\" class=\"search-result d-flex flex-column mb-2 p-2 border rounded\" style=\"cursor:pointer;\">
                    <div class=\"d-flex align-items-center mb-1\">
                        <span class=\"icon me-2 text-success\"><i class=\"fas fa-file-alt\"></i></span>
                        <span class=\"fw-bold\">${this.highlightText(escapeHTML(result.title), this.searchInput.value)}</span>
                        <span class=\"badge bg-secondary ms-2\">${result.type === 'product' ? '产品' : '文章'}</span>
                        <span class=\"ms-auto text-muted small\">相关度：${(result.score * 100).toFixed(0)}%</span>
                    </div>
                    <div class=\"text-truncate text-muted small\">${this.highlightText(escapeHTML(result.content.substring(0, 100)), this.searchInput.value)}...</div>
                </a>
            `).join('');
        }

        updateSearchHistory(query) {
            if (!query) return;
            this.searchHistory = [
                query,
                ...this.searchHistory.filter(h => h !== query)
            ].slice(0, this.MAX_HISTORY_LENGTH);
            localStorage.setItem('visndt_search_history', JSON.stringify(this.searchHistory));
        }

        loadSearchHistory() {
            const storedHistory = localStorage.getItem('visndt_search_history');
            this.searchHistory = storedHistory ? JSON.parse(storedHistory) : [];
        }

        clearSearchHistory() {
            this.searchHistory = [];
            localStorage.removeItem('visndt_search_history');
            this.renderSearchHistory(); 
        }

        highlightText(text, query) {
            if (!query) return text;
            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        window.visndtSearchManager.onReady(() => {
            window.searchModalManager = new SearchModalManager();
        });
    });

    // HTML转义函数
    function escapeHTML(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
})();