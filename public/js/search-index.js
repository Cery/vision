// 搜索索引生成脚本
(function() {
    console.log('🔍 搜索索引脚本开始加载');

    // 搜索管理器
    const SearchManager = {
        documents: [],
        isReady: false,

        // 初始化搜索
        init: function() {
            console.log('🚀 开始初始化搜索');
            
            // 添加更多日志和错误处理
            this.loadSearchIndex()
                .then(data => {
                    console.log('📦 搜索数据加载成功');
                    this.documents = data; // 直接使用从 search-index.json 获取的数据
                    
                    this.isReady = true;
                    this.notifyReady();
                })
                .catch(error => {
                    console.error('❌ 搜索索引加载失败:', error);
                    // 不再使用备用数据，如果加载失败则可能无法搜索
                });
        },

        // 加载搜索索引
        loadSearchIndex: function() {
            return new Promise((resolve, reject) => {
                fetch('/search-index.json')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP错误！状态为 ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => {
                        // 不再检查 data.products 或 data.articles，直接解析为文档数组
                        resolve(data);
                    })
                    .catch(reject);
            });
        },

        // 通知搜索管理器已就绪
        notifyReady: function() {
            console.log('✅ 搜索管理器已就绪');
            
            // 使用全局状态管理
            if (window.SearchState) {
                window.SearchState.isManagerReady = true;
                
                // 执行所有等待的回调
                while (window.SearchState.readyCallbacks.length > 0) {
                    const callback = window.SearchState.readyCallbacks.shift();
                    try {
                        callback();
                    } catch (error) {
                        console.error('执行就绪回调时出错:', error);
                    }
                }
            }

            // 兼容旧的就绪通知方法
            if (typeof window.markSearchManagerReady === 'function') {
                window.markSearchManagerReady();
            }
        },

        // 执行搜索
        search: function(query, type = 'all') {
            console.log(`🔍 搜索：查询=${query}, 类型=${type}`);
            
            // 检查搜索管理器是否就绪
            if (!this.isReady) {
                console.warn('❗ 搜索管理器未准备就绪');
                return [];
            }

            if (!query) return [];

            const lowercaseQuery = query.toLowerCase();

            // 过滤和匹配结果
            const results = this.documents
                .filter(doc => {
                    // 类型过滤
                    if (type !== 'all' && doc.type !== type) {
                        return false;
                    }

                    // 标题和内容匹配
                    const titleMatch = doc.title.toLowerCase().includes(lowercaseQuery);
                    const contentMatch = doc.content && doc.content.toLowerCase().includes(lowercaseQuery);
                    const tagMatch = doc.tags && doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));

                    return titleMatch || contentMatch || tagMatch;
                })
                .map(doc => {
                    // 确保文档有必要的属性
                    if (!doc.title || !doc.type) {
                        console.warn('文档缺少必要属性', doc);
                        return null;
                    }

                    // 清理标题中的引号
                    const cleanTitle = doc.title.replace(/^"|"$/g, '');

                    // 直接使用文档中提供的URL
                    let url = doc.url;

                    // 确保URL是有效的
                    if (!url.startsWith('/') && !url.startsWith('http')) {
                        url = '/' + url;
                    }
          
                    return {
                        ...doc,
                        title: cleanTitle,
                        url: url,
                        highlightedTitle: this.highlightText(cleanTitle, query),
                        highlightedContent: this.highlightText((doc.content || '').substring(0, 200), query)
                    };
                })
                .filter(Boolean) // 移除无效的结果
                .slice(0, 10);  // 限制结果数量

            console.log(`📊 搜索结果数量：${results.length}`);
            return results;
        },

        // 获取搜索建议
        getSuggestions: function(query) {
            if (!query) return [];

            const lowercaseQuery = query.toLowerCase();
            const suggestions = this.documents
                .filter(doc => {
                    if (!doc.title || !doc.type) return false;
                    return doc.title.toLowerCase().includes(lowercaseQuery);
                })
                .slice(0, 5)
                .map(doc => {
                    // 清理标题中的引号
                    const cleanTitle = doc.title.replace(/^"|"$/g, '');

                    // 直接使用文档中提供的URL
                    let url = doc.url;

                    // 确保URL是有效的
                    if (!url.startsWith('/') && !url.startsWith('http')) {
                        url = '/' + url;
                    }

                    return {
                        title: cleanTitle,
                        type: doc.type,
                        slug: doc.slug,
                        url: url
                    };
                });

            console.log(`💡 搜索建议：查询=${query}, 数量=${suggestions.length}`);
            return suggestions;
        },

        // 文本高亮
        highlightText: function(text, query) {
            if (!query) return text;

            const regex = new RegExp(`(${query})`, 'gi');
            return text.replace(regex, '<span class="search-highlight">$1</span>');
        }
    };

    // 全局搜索管理器
    window.searchManager = SearchManager;

    // 页面加载时初始化搜索
    document.addEventListener('DOMContentLoaded', () => {
        console.log('🚀 搜索索引脚本开始初始化');
        
        // 延迟初始化，确保DOM已完全加载
        setTimeout(() => {
            SearchManager.init();
        }, 100);

        console.log('🎉 搜索索引脚本初始化完成');
    });
})(); 