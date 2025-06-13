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
                    this.documents = [
                        ...data.products, 
                        ...data.articles
                    ];
                    
                    this.isReady = true;
                    this.notifyReady();
                })
                .catch(error => {
                    console.error('❌ 搜索索引加载失败:', error);
                    this.fallbackToDefaultData();
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
                        if (!data.products || !data.articles) {
                            throw new Error('搜索索引数据格式不正确');
                        }
                        resolve(data);
                    })
                    .catch(reject);
            });
        },

        // 备用数据
        fallbackToDefaultData: function() {
            console.warn('🔄 使用备用搜索数据');
            this.documents = [
                {
                    id: '1',
                    title: '内窥镜检测系统',
                    content: '高精度工业内窥镜，专为精密检测设计，适用于各种复杂环境的视觉检测需求。',
                    type: 'product',
                    url: '/products/endoscope',
                    tags: ['内窥镜', '工业检测']
                },
                {
                    id: '2',
                    title: '视觉检测技术的发展趋势',
                    content: '随着人工智能和机器视觉技术的快速发展，视觉检测正在向更智能、更精准的方向演进。',
                    type: 'article',
                    url: '/articles/vision-detection-trends',
                    tags: ['视觉检测', '技术趋势']
                }
            ];
            
            this.isReady = true;
            this.notifyReady();
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
                    const contentMatch = doc.content.toLowerCase().includes(lowercaseQuery);
                    const tagMatch = doc.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery));

                    return titleMatch || contentMatch || tagMatch;
                })
                .map(doc => ({
                    ...doc,
                    highlightedTitle: this.highlightText(doc.title, query),
                    highlightedContent: this.highlightText(doc.content.substring(0, 200), query)
                }))
                .slice(0, 10);  // 限制结果数量

            console.log(`📊 搜索结果数量：${results.length}`);
            return results;
        },

        // 获取搜索建议
        getSuggestions: function(query) {
            if (!query) return [];

            const lowercaseQuery = query.toLowerCase();
            const suggestions = this.documents
                .filter(doc => 
                    doc.title.toLowerCase().includes(lowercaseQuery)
                )
                .slice(0, 5)
                .map(doc => ({
                    title: doc.title,
                    type: doc.type
                }));

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