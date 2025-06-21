(function() {
    class SearchModalManager {
        constructor() {
            this.searchModal = document.getElementById('searchModal');
            this.searchInput = document.getElementById('searchInput');
            this.searchResults = document.getElementById('searchResults');
            this.searchLoading = document.getElementById('searchLoading');
            this.searchStats = document.getElementById('searchStats');
            this.searchStatsText = document.getElementById('searchStatsText');
            this.clearSearchBtn = document.getElementById('clearSearchBtn');
            this.searchTypeButtons = document.querySelectorAll('.search-type-pill');

            this.currentSearchType = 'all';
            this.searchHistory = [];
            this.MAX_HISTORY_LENGTH = 10;
            this.searchTimeout = null;
            this.currentResults = [];
            this.selectedIndex = -1;

            this.loadSearchHistory();
            this.initEventListeners();
        }

        initEventListeners() {
            // 模态框事件
            if (this.searchModal) {
                this.searchModal.addEventListener('shown.bs.modal', () => {
                    this.renderSearchHistory();
                    if (this.searchInput) {
                        this.searchInput.focus();
                        this.searchInput.select();
                    }
                });

                this.searchModal.addEventListener('hidden.bs.modal', () => {
                    this.resetSearch();
                });
            }

            // 搜索类型切换
            if (this.searchTypeButtons.length > 0) {
                this.searchTypeButtons.forEach(btn => {
                    btn.addEventListener('click', (e) => {
                        this.currentSearchType = e.target.dataset.type || 'all';
                        this.updateSearchTypeUI(e.target);
                        this.performSearch();
                    });
                });
            }

            // 搜索输入框事件
            if (this.searchInput) {
                this.searchInput.addEventListener('input', (e) => {
                    const query = e.target.value.trim();
                    this.updateClearButton(query);

                    // 清除之前的搜索定时器
                    if (this.searchTimeout) {
                        clearTimeout(this.searchTimeout);
                    }

                    // 设置新的搜索定时器（防抖）
                    this.searchTimeout = setTimeout(() => {
                        this.handleSearchInput(query);
                    }, 300);
                });

                this.searchInput.addEventListener('keydown', (e) => {
                    this.handleKeyboardNavigation(e);
                });

                this.searchInput.addEventListener('focus', () => {
                    if (!this.searchInput.value.trim()) {
                        this.renderSearchHistory();
                    }
                });
            }

            // 清除按钮事件
            if (this.clearSearchBtn) {
                this.clearSearchBtn.addEventListener('click', () => {
                    this.clearSearch();
                });
            }

            // 全局键盘事件
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && this.searchModal.classList.contains('show')) {
                    this.closeModal();
                }
            });
        }

        updateSearchTypeUI(activeButton) {
            this.searchTypeButtons.forEach(btn => btn.classList.remove('active'));
            activeButton.classList.add('active');
        }

        updateClearButton(query) {
            if (this.clearSearchBtn) {
                this.clearSearchBtn.style.display = query ? 'flex' : 'none';
            }
        }

        clearSearch() {
            this.searchInput.value = '';
            this.updateClearButton('');
            this.renderSearchHistory();
            this.searchInput.focus();
        }

        resetSearch() {
            this.selectedIndex = -1;
            this.currentResults = [];
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }
        }

        closeModal() {
            const modal = bootstrap.Modal.getInstance(this.searchModal);
            if (modal) {
                modal.hide();
            }
        }

        handleSearchInput(query) {
            if (!query) {
                this.renderSearchHistory();
                this.hideStats();
                return;
            }

            if (query.length < 2) {
                this.showMessage('请输入至少2个字符进行搜索', 'info');
                return;
            }

            this.performSearch(query);
        }

        handleKeyboardNavigation(e) {
            const results = this.searchResults.querySelectorAll('.search-suggestion, .search-result');

            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, results.length - 1);
                this.updateSelection(results);
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection(results);
            } else if (e.key === 'Enter') {
                e.preventDefault();
                if (this.selectedIndex >= 0 && results[this.selectedIndex]) {
                    results[this.selectedIndex].click();
                } else {
                    this.performSearch();
                }
            }
        }

        updateSelection(results) {
            results.forEach((result, index) => {
                result.classList.toggle('selected', index === this.selectedIndex);
            });
        }

        showLoading() {
            if (this.searchLoading) {
                this.searchLoading.style.display = 'block';
            }
            if (this.searchResults) {
                this.searchResults.innerHTML = '';
            }
        }

        hideLoading() {
            if (this.searchLoading) {
                this.searchLoading.style.display = 'none';
            }
        }

        showStats(query, count, time) {
            if (this.searchStats && this.searchStatsText) {
                this.searchStatsText.textContent = `找到 ${count} 个关于"${query}"的结果 (用时 ${time}ms)`;
                this.searchStats.style.display = 'block';
            }
        }

        hideStats() {
            if (this.searchStats) {
                this.searchStats.style.display = 'none';
            }
        }

        showMessage(message, type = 'info') {
            const iconMap = {
                info: 'fas fa-info-circle',
                warning: 'fas fa-exclamation-triangle',
                error: 'fas fa-times-circle',
                success: 'fas fa-check-circle'
            };

            this.searchResults.innerHTML = `
                <div class="search-message text-center py-4">
                    <i class="${iconMap[type]} fa-2x mb-2 text-${type === 'error' ? 'danger' : type}"></i>
                    <p class="mb-0">${message}</p>
                </div>
            `;
        }

        renderSuggestions(suggestions, query) {
            if (!Array.isArray(suggestions)) {
                console.warn('搜索建议数据格式不正确:', suggestions);
                return;
            }

            // 规范化建议数据
            const normalizedSuggestions = suggestions.map(suggestion => {
                if (typeof suggestion === 'string') {
                    return {
                        title: suggestion,
                        type: 'product',
                        url: `/products/${encodeURIComponent(suggestion)}/`
                    };
                }

                // 深度清理数据
                let cleanTitle = suggestion.title || '';

                // 处理JSON编码的标题
                if (typeof cleanTitle === 'string' && cleanTitle.startsWith('"') && cleanTitle.endsWith('"')) {
                    try {
                        cleanTitle = JSON.parse(cleanTitle);
                    } catch (e) {
                        cleanTitle = cleanTitle.replace(/^"|"$/g, '').replace(/\\"/g, '"');
                    }
                }

                cleanTitle = cleanTitle.replace(/\\n/g, ' ').trim();
                const cleanUrl = this.generateUrl(suggestion);

                console.log('规范化建议:', {
                    原始: suggestion.title,
                    清理后: cleanTitle,
                    URL: cleanUrl
                });

                return {
                    title: cleanTitle,
                    type: suggestion.type || 'product',
                    url: cleanUrl
                };
            });

            // 限制显示数量
            const limitedSuggestions = normalizedSuggestions.slice(0, 6);

            if (limitedSuggestions.length === 0) {
                this.showMessage('未找到相关建议，试试其他关键词', 'info');
                return;
            }

            // 渲染建议列表
            this.searchResults.innerHTML = `
                <div class="search-suggestions-header mb-3">
                    <h6 class="mb-0">
                        <i class="fas fa-lightbulb me-2 text-warning"></i>
                        搜索建议
                    </h6>
                </div>
                ${limitedSuggestions.map((suggestion, index) => `
                    <a href="${suggestion.url}" class="search-suggestion" data-type="${suggestion.type}" data-index="${index}">
                        <span class="icon">
                            <i class="${this.getTypeIcon(suggestion.type)}"></i>
                        </span>
                        <div class="suggestion-content">
                            <div class="suggestion-title">
                                ${this.highlightText(escapeHTML(suggestion.title), query)}
                            </div>
                        </div>
                        <span class="suggestion-arrow">
                            <i class="fas fa-arrow-right"></i>
                        </span>
                    </a>
                `).join('')}
            `;

            // 添加点击事件处理
            this.addSuggestionEvents();
        }

        generateUrl(suggestion) {
            // 如果已经有URL，直接使用（确保格式正确）
            if (suggestion.url) {
                let url = suggestion.url;

                // 深度清理URL - 处理各种编码问题
                if (typeof url === 'string' && url.startsWith('"') && url.endsWith('"')) {
                    try {
                        url = JSON.parse(url);
                    } catch (e) {
                        url = url.replace(/^"|"$/g, '').replace(/\\"/g, '"');
                    }
                }

                // 清理URL中的引号和转义字符
                url = url.replace(/^"|"$/g, '').replace(/\\"/g, '"').replace(/\\n/g, '');

                // 确保URL以/开头
                if (!url.startsWith('/') && !url.startsWith('http')) {
                    url = '/' + url;
                }

                console.log('生成的URL:', url, '原始URL:', suggestion.url);
                return url;
            }

            // 如果没有URL，根据类型生成
            const typeUrlMap = {
                'product': '/products/',
                'article': '/news/',
                'case': '/cases/'
            };
            const basePath = typeUrlMap[suggestion.type] || '/';
            return `${basePath}${encodeURIComponent(suggestion.title)}/`;
        }

        getTypeIcon(type) {
            const iconMap = {
                'product': 'fas fa-cube',
                'article': 'fas fa-newspaper',
                'case': 'fas fa-briefcase',
                'all': 'fas fa-search'
            };
            return iconMap[type] || 'fas fa-file';
        }

        getTypeLabel(type) {
            const labelMap = {
                'product': '产品',
                'article': '资讯',
                'case': '案例'
            };
            return labelMap[type] || '内容';
        }

        addSuggestionEvents() {
            this.searchResults.querySelectorAll('.search-suggestion').forEach((item, index) => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = item.getAttribute('href');
                    const title = item.querySelector('.suggestion-title').textContent.trim();

                    console.log('点击搜索建议:', { url, title, item });

                    if (url && url !== '#' && url !== 'undefined') {
                        this.updateSearchHistory(title);
                        console.log('跳转到建议页面:', url);

                        // 关闭模态框
                        this.closeModal();

                        // 延迟跳转，确保模态框关闭
                        setTimeout(() => {
                            window.location.href = url;
                        }, 100);
                    } else {
                        console.error('无效的建议URL:', url);
                        alert('抱歉，无法打开此页面，URL无效');
                    }
                });

                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = index;
                    this.updateSelection(this.searchResults.querySelectorAll('.search-suggestion'));
                });
            });
        }

        renderSearchHistory() {
            if (!this.searchResults) return;

            const history = this.searchHistory;
            const hotKeywords = [
                { text: '工业内窥镜', icon: 'fas fa-search-plus' },
                { text: '视觉检测', icon: 'fas fa-eye' },
                { text: '无损检测', icon: 'fas fa-shield-alt' },
                { text: '光纤内窥镜', icon: 'fas fa-fiber-optic' },
                { text: '电子内窥镜', icon: 'fas fa-microchip' },
                { text: '管道检测', icon: 'fas fa-pipe' }
            ];

            let historySectionHtml = '';
            if (history.length > 0) {
                historySectionHtml = `
                    <div class="search-history-section">
                        <h6>
                            <i class="fas fa-history me-2"></i>
                            搜索历史
                        </h6>
                        <div class="history-items">
                            ${history.map(query => `
                                <div class="search-history-item" data-query="${escapeHTML(query)}">
                                    <div class="d-flex align-items-center">
                                        <span class="icon me-2">
                                            <i class="fas fa-clock"></i>
                                        </span>
                                        <span class="history-text">${escapeHTML(query)}</span>
                                        <button class="btn btn-sm btn-outline-danger ms-auto remove-history" data-query="${escapeHTML(query)}">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="text-center mt-3">
                            <button id="clearHistoryBtn" class="btn btn-sm btn-outline-secondary">
                                <i class="fas fa-trash me-1"></i>清除所有历史
                            </button>
                        </div>
                    </div>
                `;
            }

            const hotKeywordsHtml = `
                <div class="search-hot-keywords-section">
                    <h6>
                        <i class="fas fa-fire me-2 text-danger"></i>
                        热门搜索
                    </h6>
                    <div class="hot-keywords-grid">
                        ${hotKeywords.map(keyword => `
                            <span class="hot-keyword-item" data-keyword="${escapeHTML(keyword.text)}">
                                <i class="${keyword.icon} me-1"></i>
                                ${escapeHTML(keyword.text)}
                            </span>
                        `).join('')}
                    </div>
                </div>
            `;

            this.searchResults.innerHTML = `
                <div class="search-welcome">
                    <div class="welcome-header text-center mb-4">
                        <i class="fas fa-search fa-3x text-primary mb-2"></i>
                        <h5>开始搜索</h5>
                        <p class="text-muted">输入关键词搜索产品、资讯和案例</p>
                    </div>
                    ${historySectionHtml}
                    ${hotKeywordsHtml}
                </div>
            `;

            this.bindHistoryEvents();
        }

        bindHistoryEvents() {
            // 清除所有历史按钮
            const clearHistoryBtn = document.getElementById('clearHistoryBtn');
            if (clearHistoryBtn) {
                clearHistoryBtn.addEventListener('click', () => this.clearSearchHistory());
            }

            // 历史项点击事件
            document.querySelectorAll('.search-history-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    if (!e.target.closest('.remove-history')) {
                        const query = item.dataset.query;
                        this.searchInput.value = query;
                        this.performSearch(query);
                    }
                });
            });

            // 删除单个历史项
            document.querySelectorAll('.remove-history').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const query = btn.dataset.query;
                    this.removeHistoryItem(query);
                });
            });

            // 热门关键词点击事件
            document.querySelectorAll('.hot-keyword-item').forEach(item => {
                item.addEventListener('click', (e) => {
                    const keyword = item.dataset.keyword;
                    this.searchInput.value = keyword;
                    this.performSearch(keyword);
                });
            });
        }

        removeHistoryItem(query) {
            this.searchHistory = this.searchHistory.filter(item => item !== query);
            localStorage.setItem('visndt_search_history', JSON.stringify(this.searchHistory));
            this.renderSearchHistory();
        }

        performSearch(query = null) {
            const searchQuery = query || this.searchInput.value.trim();

            if (!searchQuery) {
                this.renderSearchHistory();
                this.hideStats();
                return;
            }

            if (searchQuery.length < 2) {
                this.showMessage('请输入至少2个字符进行搜索', 'warning');
                return;
            }

            this.showLoading();
            const startTime = Date.now();

            window.visndtSearchManager.onReady(() => {
                try {
                    const results = window.visndtSearchManager.search(searchQuery, this.currentSearchType);
                    const endTime = Date.now();
                    const searchTime = endTime - startTime;

                    this.hideLoading();
                    this.displaySearchResults(results, searchQuery);
                    this.showStats(searchQuery, results.length, searchTime);
                    this.updateSearchHistory(searchQuery);

                } catch (error) {
                    console.error('搜索执行失败:', error);
                    this.hideLoading();
                    this.showMessage('搜索服务暂时不可用，请稍后重试', 'error');
                }
            });
        }

        displaySearchResults(results, query) {
            if (!this.searchResults) return;

            this.currentResults = results;
            const limitedResults = results.slice(0, 12);

            if (limitedResults.length === 0) {
                this.searchResults.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search-minus fa-3x mb-3"></i>
                        <h5>未找到相关结果</h5>
                        <p class="text-muted mb-4">没有找到与"${escapeHTML(query)}"相关的内容</p>
                        <div class="search-suggestions">
                            <p class="mb-2"><strong>搜索建议：</strong></p>
                            <ul class="list-unstyled">
                                <li>• 检查关键词拼写是否正确</li>
                                <li>• 尝试使用更通用的关键词</li>
                                <li>• 减少关键词数量</li>
                                <li>• 尝试搜索相关的产品类别</li>
                            </ul>
                        </div>
                        <button class="btn btn-primary mt-3" onclick="document.getElementById('searchInput').focus()">
                            <i class="fas fa-search me-1"></i>重新搜索
                        </button>
                    </div>
                `;
                return;
            }

            // 按类型分组结果
            const groupedResults = this.groupResultsByType(limitedResults);

            this.searchResults.innerHTML = `
                <div class="search-results-header mb-3">
                    <h6 class="mb-0">
                        <i class="fas fa-list-ul me-2"></i>
                        搜索结果
                    </h6>
                </div>
                ${this.renderGroupedResults(groupedResults, query)}
            `;

            this.addResultEvents();
        }

        groupResultsByType(results) {
            const groups = {};
            results.forEach(result => {
                const type = result.type || 'other';
                if (!groups[type]) {
                    groups[type] = [];
                }
                groups[type].push(result);
            });
            return groups;
        }

        renderGroupedResults(groupedResults, query) {
            const typeOrder = ['product', 'article', 'case', 'other'];
            let html = '';

            typeOrder.forEach(type => {
                if (groupedResults[type] && groupedResults[type].length > 0) {
                    html += this.renderResultGroup(type, groupedResults[type], query);
                }
            });

            return html;
        }

        renderResultGroup(type, results, query) {
            const typeInfo = {
                'product': { label: '产品', icon: 'fas fa-cube', color: 'primary' },
                'article': { label: '资讯', icon: 'fas fa-newspaper', color: 'info' },
                'case': { label: '案例', icon: 'fas fa-briefcase', color: 'success' },
                'other': { label: '其他', icon: 'fas fa-file', color: 'secondary' }
            };

            const info = typeInfo[type] || typeInfo['other'];

            return `
                <div class="result-group mb-4">
                    <div class="result-group-header mb-2">
                        <span class="badge bg-${info.color}">
                            <i class="${info.icon} me-1"></i>
                            ${info.label} (${results.length})
                        </span>
                    </div>
                    <div class="result-group-content">
                        ${results.map((result, index) => this.renderSingleResult(result, query, index)).join('')}
                    </div>
                </div>
            `;
        }

        renderSingleResult(result, query, index) {
            // 深度清理URL
            let cleanUrl = result.url || '';
            if (typeof cleanUrl === 'string' && cleanUrl.startsWith('"') && cleanUrl.endsWith('"')) {
                try {
                    cleanUrl = JSON.parse(cleanUrl);
                } catch (e) {
                    cleanUrl = cleanUrl.replace(/^"|"$/g, '').replace(/\\"/g, '"');
                }
            }
            cleanUrl = cleanUrl.replace(/\\n/g, '').trim();

            if (!cleanUrl.startsWith('/') && !cleanUrl.startsWith('http')) {
                cleanUrl = '/' + cleanUrl;
            }

            // 深度清理标题
            let cleanTitle = result.title || '';
            if (typeof cleanTitle === 'string' && cleanTitle.startsWith('"') && cleanTitle.endsWith('"')) {
                try {
                    cleanTitle = JSON.parse(cleanTitle);
                } catch (e) {
                    cleanTitle = cleanTitle.replace(/^"|"$/g, '').replace(/\\"/g, '"');
                }
            }
            cleanTitle = cleanTitle.replace(/\\n/g, ' ').trim();

            console.log('渲染搜索结果:', {
                原始标题: result.title,
                清理后标题: cleanTitle,
                原始URL: result.url,
                清理后URL: cleanUrl
            });

            return `
                <a href="${cleanUrl}" class="search-result" data-index="${index}" data-url="${cleanUrl}">
                    <div class="search-result-header">
                        <span class="icon me-2">
                            <i class="${this.getTypeIcon(result.type)}"></i>
                        </span>
                        <h6 class="search-result-title">
                            ${this.highlightText(escapeHTML(cleanTitle), query)}
                        </h6>
                    </div>
                </a>
            `;
        }

        addResultEvents() {
            this.searchResults.querySelectorAll('.search-result').forEach((item, index) => {
                item.addEventListener('click', (e) => {
                    e.preventDefault();
                    const url = item.getAttribute('href') || item.getAttribute('data-url');
                    const title = item.querySelector('.search-result-title').textContent.trim();

                    console.log('点击搜索结果:', { url, title, item });

                    if (url && url !== '#' && url !== 'undefined') {
                        this.updateSearchHistory(this.searchInput.value.trim());
                        console.log('跳转到:', url);

                        // 关闭模态框
                        this.closeModal();

                        // 延迟跳转，确保模态框关闭
                        setTimeout(() => {
                            window.location.href = url;
                        }, 100);
                    } else {
                        console.error('无效的URL:', url);
                        alert('抱歉，无法打开此页面，URL无效');
                    }
                });

                item.addEventListener('mouseenter', () => {
                    this.selectedIndex = index;
                    this.updateSelection(this.searchResults.querySelectorAll('.search-result'));
                });
            });
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
            if (!query || !text) return text;

            // 转义特殊正则字符
            const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            const regex = new RegExp(`(${escapedQuery})`, 'gi');
            return text.replace(regex, '<mark>$1</mark>');
        }

        // 改进的搜索算法
        improvedSearch(query, type = 'all') {
            if (!window.searchIndex) return [];

            const results = window.searchIndex
                .filter(item => {
                    // 类型过滤
                    if (type !== 'all' && item.type !== type) return false;

                    // 搜索匹配
                    const title = item.title.toLowerCase();
                    const content = item.content.toLowerCase();
                    const searchQuery = query.toLowerCase();

                    return title.includes(searchQuery) || content.includes(searchQuery);
                })
                .map(item => {
                    // 计算相关度分数
                    const title = item.title.toLowerCase();
                    const content = item.content.toLowerCase();
                    const searchQuery = query.toLowerCase();

                    let score = 0;

                    // 标题完全匹配
                    if (title === searchQuery) score += 1.0;
                    // 标题包含查询
                    else if (title.includes(searchQuery)) score += 0.8;
                    // 标题开头匹配
                    else if (title.startsWith(searchQuery)) score += 0.7;

                    // 内容匹配
                    if (content.includes(searchQuery)) score += 0.3;

                    // 查询词在标题中的位置权重
                    const titleIndex = title.indexOf(searchQuery);
                    if (titleIndex !== -1) {
                        score += (1 - titleIndex / title.length) * 0.2;
                    }

                    return { ...item, score };
                })
                .filter(item => item.score > 0)
                .sort((a, b) => b.score - a.score);

            return results;
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