// 数据加载器 - 从实际文件系统加载内容数据
class ContentDataLoader {
    constructor() {
        this.baseUrl = window.location.origin;
        this.contentData = {
            products: [],
            categories: [],
            suppliers: [],
            news: [],
            cases: []
        };
    }

    // 主要加载函数
    async loadAllData() {
        try {
            console.log('开始加载所有内容数据...');
            
            // 并行加载所有数据
            await Promise.all([
                this.loadProducts(),
                this.loadCategories(),
                this.loadSuppliers(),
                this.loadNews(),
                this.loadCases()
            ]);
            
            console.log('所有数据加载完成:', this.contentData);
            return this.contentData;
            
        } catch (error) {
            console.error('加载数据失败:', error);
            return this.getFallbackData();
        }
    }

    // 加载产品数据
    async loadProducts() {
        try {
            // 尝试从API加载产品列表
            const response = await fetch(`${this.baseUrl}/api/products.json`).catch(() => null);
            
            if (response && response.ok) {
                const data = await response.json();
                this.contentData.products = data.products || [];
            } else {
                // 如果API不可用，使用已知的产品文件列表
                this.contentData.products = await this.loadProductsFromKnownFiles();
            }
            
            console.log(`产品数据加载完成: ${this.contentData.products.length} 个产品`);
        } catch (error) {
            console.error('加载产品数据失败:', error);
            this.contentData.products = this.getFallbackProducts();
        }
    }

    // 从已知文件加载产品
    async loadProductsFromKnownFiles() {
        try {
            // 尝试动态加载所有产品文件
            const allProducts = await this.loadAllProductFiles();
            if (allProducts.length > 0) {
                console.log(`动态加载了 ${allProducts.length} 个产品`);
                return allProducts;
            }
        } catch (error) {
            console.warn('动态加载产品失败，使用预定义数据:', error);
        }

        // 如果动态加载失败，返回预定义的产品数据
        return [
            {
                id: 'WS-K08510-a',
                title: 'WS-K08510超细工业电子内窥镜',
                summary: '0.85mm超小直径，高清成像，适用于极小空间检测',
                model: 'WS-K08510',
                series: 'K系列',
                supplier: '深圳市微视光电科技有限公司',
                primary_category: '电子内窥镜',
                secondary_category: '工业视频内窥镜',
                status: 'published',
                statusName: '已发布',
                published: '2025-01-01T12:00:00+08:00',
                thumbnail: '/images/products/K-series/K-main.jpg',
                parameters: [
                    { name: "主机屏幕", value: "6英寸" },
                    { name: "待机时长", value: "8小时" },
                    { name: "探头直径", value: "0.85mm" },
                    { name: "像素", value: "16万" },
                    { name: "景深", value: "3mm~70mm" },
                    { name: "视场角", value: "120度" },
                    { name: "视向", value: "直视" },
                    { name: "光源", value: "光纤光源" },
                    { name: "导向", value: "无导向" },
                    { name: "管线材质", value: "合金弹簧软管" },
                    { name: "防护等级", value: "IP67" },
                    { name: "工作温度", value: "-20℃~70℃" }
                ],
                gallery: [
                    { image: "/images/products/K-series/K-main.jpg", alt: "主图", is_main: true },
                    { image: "/images/products/K-series/K-1.jpg", alt: "超细内窥镜副图1" },
                    { image: "/images/products/K-series/K-2.jpg", alt: "超细内窥镜副图2" },
                    { image: "/images/products/K-series/K-3.jpg", alt: "超细内窥镜副图3" }
                ],
                applications: ['精密仪器维修', '航空航天精密检测', '高端制造领域应用'],
                application_scenarios: '微型空间检测首选方案，适用于医疗器械、精密模具等微型领域检测需求',
                data_download: [
                    { file_title: "规格书", file_path: "/uploads/规格书.pdf" }
                ],
                related_products: ['WS-K08510-b', 'WS-K09510-a'],
                featured: true,
                tags: ['超细探头', '高清成像', '工业级']
            },
            {
                id: 'WS-K08510-b',
                title: 'WS-K08510B超细工业电子内窥镜',
                summary: '0.85mm超小直径，升级版高清成像，适用于极小空间检测',
                model: 'WS-K08510B',
                series: 'K系列',
                supplier: '深圳市微视光电科技有限公司',
                primary_category: '电子内窥镜',
                secondary_category: '工业视频内窥镜',
                status: 'published',
                statusName: '已发布',
                published: '2025-01-02T12:00:00+08:00',
                thumbnail: '/images/products/K-series/K-main.jpg',
                parameters: [
                    { name: "主机屏幕", value: "7英寸" },
                    { name: "待机时长", value: "10小时" },
                    { name: "探头直径", value: "0.85mm" },
                    { name: "像素", value: "20万" },
                    { name: "景深", value: "3mm~80mm" },
                    { name: "视场角", value: "130度" },
                    { name: "视向", value: "直视" },
                    { name: "光源", value: "LED光源" },
                    { name: "导向", value: "无导向" },
                    { name: "管线材质", value: "合金弹簧软管" },
                    { name: "防护等级", value: "IP67" },
                    { name: "工作温度", value: "-20℃~80℃" }
                ],
                gallery: [
                    { image: "/images/products/K-series/K-main.jpg", alt: "主图", is_main: true },
                    { image: "/images/products/K-series/K-1.jpg", alt: "超细内窥镜副图1" }
                ],
                applications: ['精密仪器维修', '航空航天精密检测'],
                application_scenarios: '升级版微型空间检测方案',
                data_download: [],
                related_products: ['WS-K08510-a', 'WS-K09510-a'],
                featured: false,
                tags: ['超细探头', '高清成像', '升级版']
            },
            {
                id: 'WS-K09510-a',
                title: 'WS-K09510工业电子内窥镜',
                summary: '0.95mm直径，高性能检测，工业应用首选',
                model: 'WS-K09510',
                series: 'K系列',
                supplier: '深圳市微视光电科技有限公司',
                primary_category: '电子内窥镜',
                secondary_category: '工业视频内窥镜',
                status: 'published',
                statusName: '已发布',
                published: '2025-01-03T12:00:00+08:00',
                thumbnail: '/images/products/K-series/K-main.jpg',
                parameters: [
                    { name: "主机屏幕", value: "6英寸" },
                    { name: "待机时长", value: "8小时" },
                    { name: "探头直径", value: "0.95mm" },
                    { name: "像素", value: "18万" },
                    { name: "景深", value: "5mm~100mm" },
                    { name: "视场角", value: "110度" },
                    { name: "视向", value: "直视" },
                    { name: "光源", value: "光纤光源" },
                    { name: "导向", value: "无导向" },
                    { name: "管线材质", value: "合金弹簧软管" },
                    { name: "防护等级", value: "IP67" },
                    { name: "工作温度", value: "-10℃~70℃" }
                ],
                gallery: [
                    { image: "/images/products/K-series/K-main.jpg", alt: "主图", is_main: true }
                ],
                applications: ['工业检测', '质量控制'],
                application_scenarios: '工业应用首选检测方案',
                data_download: [],
                related_products: ['WS-K08510-a', 'WS-K1010-a'],
                featured: false,
                tags: ['工业级', '高性能']
            },
            {
                id: 'product-p08510',
                title: 'P08510工业内窥镜',
                summary: 'P系列经济型工业内窥镜，性价比优选',
                model: 'P08510',
                series: 'P系列',
                supplier: '深圳市微视光电科技有限公司',
                primary_category: '电子内窥镜',
                secondary_category: '工业视频内窥镜',
                status: 'published',
                statusName: '已发布',
                published: '2025-01-04T12:00:00+08:00',
                thumbnail: '/images/products/P-series/P-main.jpg',
                parameters: [
                    { name: "主机屏幕", value: "5英寸" },
                    { name: "待机时长", value: "6小时" },
                    { name: "探头直径", value: "8.5mm" },
                    { name: "像素", value: "12万" },
                    { name: "景深", value: "10mm~150mm" },
                    { name: "视场角", value: "100度" },
                    { name: "视向", value: "直视" },
                    { name: "光源", value: "LED光源" },
                    { name: "导向", value: "四向导向" },
                    { name: "管线材质", value: "钨丝编织软管" },
                    { name: "防护等级", value: "IP65" },
                    { name: "工作温度", value: "0℃~60℃" }
                ],
                gallery: [
                    { image: "/images/products/P-series/P-main.jpg", alt: "主图", is_main: true }
                ],
                applications: ['汽车制造', '机械维修'],
                application_scenarios: 'P系列经济型解决方案，适合一般工业检测需求',
                data_download: [],
                related_products: ['product-p1210', 'product-p1510'],
                featured: false,
                tags: ['经济型', 'P系列', '性价比']
            },
            {
                id: 'product-p1210',
                title: 'P1210工业内窥镜',
                summary: 'P系列标准型工业内窥镜，功能全面',
                model: 'P1210',
                series: 'P系列',
                supplier: '深圳市微视光电科技有限公司',
                primary_category: '电子内窥镜',
                secondary_category: '工业视频内窥镜',
                status: 'published',
                statusName: '已发布',
                published: '2025-01-05T12:00:00+08:00',
                thumbnail: '/images/products/P-series/P-main.jpg',
                parameters: [
                    { name: "主机屏幕", value: "7英寸" },
                    { name: "待机时长", value: "8小时" },
                    { name: "探头直径", value: "12mm" },
                    { name: "像素", value: "30万" },
                    { name: "景深", value: "15mm~200mm" },
                    { name: "视场角", value: "120度" },
                    { name: "视向", value: "直视/侧视" },
                    { name: "光源", value: "高亮LED" },
                    { name: "导向", value: "四向导向" },
                    { name: "管线材质", value: "钨丝编织软管" },
                    { name: "防护等级", value: "IP67" },
                    { name: "工作温度", value: "-10℃~70℃" }
                ],
                gallery: [
                    { image: "/images/products/P-series/P-main.jpg", alt: "主图", is_main: true }
                ],
                applications: ['管道检测', '设备维护'],
                application_scenarios: 'P系列标准型解决方案，功能全面适用性强',
                data_download: [],
                related_products: ['product-p08510', 'product-p1510'],
                featured: true,
                tags: ['标准型', 'P系列', '功能全面']
            },
            {
                id: 'product-dz60',
                title: 'DZ60爬行机器人',
                summary: '管道爬行检测机器人，远程操控，适用大口径管道',
                model: 'DZ60',
                series: 'DZ系列',
                supplier: '深圳市微视光电科技有限公司',
                primary_category: '电子内窥镜',
                secondary_category: '爬行机器人',
                status: 'published',
                statusName: '已发布',
                published: '2025-01-06T12:00:00+08:00',
                thumbnail: '/images/products/DZ-series/DZ-main.jpg',
                parameters: [
                    { name: "适用管径", value: "60-300mm" },
                    { name: "爬行距离", value: "最大100米" },
                    { name: "摄像头", value: "360度旋转" },
                    { name: "像素", value: "200万" },
                    { name: "照明", value: "LED环形光源" },
                    { name: "防护等级", value: "IP68" },
                    { name: "工作温度", value: "-20℃~60℃" },
                    { name: "电源", value: "外接电源" },
                    { name: "控制方式", value: "有线遥控" },
                    { name: "记录功能", value: "视频录制" }
                ],
                gallery: [
                    { image: "/images/products/DZ-series/DZ-main.jpg", alt: "主图", is_main: true }
                ],
                applications: ['管道检测', '下水道检测', '工业管道'],
                application_scenarios: '大口径管道检测专用设备，远程操控安全可靠',
                data_download: [],
                related_products: [],
                featured: true,
                tags: ['爬行机器人', '管道检测', '远程操控']
            }
        ];
    }

    // 动态加载所有产品文件
    async loadAllProductFiles() {
        const products = [];

        // 已知的产品文件列表（基于实际目录扫描）
        const productFiles = [
            'WS-K08510-a', 'WS-K08510-b', 'WS-K09510-a', 'WS-K1010-a',
            'WS-K1210-a', 'WS-K1210-a copy', 'WS-K1210-a copy 6', 'WS-K1210-a copy 7',
            'WS-K1210-a copy 8', 'WS-K1210-a copy 9', 'WS-K1210-b',
            'WS-K1510-a', 'WS-K1510-b', 'WS-K1510-c', 'WS-K1810-a',
            'k1010-electronic-endoscope', 'product-dz60', 'product-p08510',
            'product-p09510', 'product-p1010-model', 'product-p1210',
            'product-p1510', 'product-p1810', 'product-p2010', 'product-p2210',
            'product-p2410', 'product-p2810', 'product-p3910', 'product-p6010',
            'product-p8020', 'sample-product-2', 'sample-product-3', 'test-product-001'
        ];

        console.log(`开始加载 ${productFiles.length} 个产品文件...`);

        for (const productId of productFiles) {
            try {
                // 尝试从Markdown文件加载
                const productData = await this.loadProductFromMarkdown(productId);
                if (productData) {
                    products.push(productData);
                    console.log(`✅ 加载产品: ${productData.title} (${productId})`);
                } else {
                    // 如果Markdown加载失败，生成基础产品数据
                    const basicProduct = this.generateBasicProductData(productId);
                    products.push(basicProduct);
                    console.log(`⚠️ 生成基础数据: ${basicProduct.title} (${productId})`);
                }
            } catch (error) {
                console.warn(`❌ 加载产品 ${productId} 失败:`, error);
                // 即使失败也生成基础数据
                const basicProduct = this.generateBasicProductData(productId);
                products.push(basicProduct);
            }
        }

        console.log(`产品加载完成: ${products.length} 个产品`);
        return products;
    }

    // 生成基础产品数据
    generateBasicProductData(productId) {
        const title = this.generateProductTitle(productId);
        const model = this.extractModel(title, productId);
        const series = this.extractSeries(title, productId);

        return {
            id: productId,
            title: title,
            summary: `${model} 工业内窥镜，专业检测设备`,
            model: model,
            series: series,
            supplier: '深圳市微视光电科技有限公司',
            primary_category: '电子内窥镜',
            secondary_category: this.getSecondaryCategory(productId),
            status: 'published',
            statusName: '已发布',
            published: new Date().toISOString(),
            thumbnail: this.getProductThumbnail(series),
            parameters: this.generateBasicParameters(model),
            gallery: [
                { image: this.getProductThumbnail(series), alt: "主图", is_main: true }
            ],
            applications: this.getDefaultApplications(series),
            application_scenarios: `${model} 专业工业检测解决方案`,
            data_download: [],
            related_products: [],
            featured: Math.random() > 0.8, // 20% 概率为推荐产品
            tags: this.generateProductTags(model, series),
            content: `# ${title}\n\n${model} 是一款专业的工业内窥镜设备。`
        };
    }

    // 生成产品标题
    generateProductTitle(productId) {
        if (productId.startsWith('WS-K')) {
            const model = this.extractModel('', productId);
            return `${model}超细工业电子内窥镜`;
        } else if (productId.startsWith('product-p')) {
            const model = this.extractModel('', productId);
            return `${model}工业内窥镜`;
        } else if (productId.includes('dz')) {
            return 'DZ60爬行机器人';
        } else if (productId.includes('sample')) {
            return `样品产品 ${productId.replace('sample-product-', '')}`;
        } else if (productId.includes('test')) {
            return `测试产品 ${productId.replace('test-product-', '')}`;
        } else {
            const model = this.extractModel('', productId);
            return `${model}工业内窥镜`;
        }
    }

    // 获取次级分类
    getSecondaryCategory(productId) {
        if (productId.includes('dz') || productId.includes('robot')) {
            return '爬行机器人';
        } else if (productId.includes('sample') || productId.includes('test')) {
            return '测试产品';
        } else {
            return '工业视频内窥镜';
        }
    }

    // 获取产品缩略图
    getProductThumbnail(series) {
        switch(series) {
            case 'K系列': return '/images/products/K-series/K-main.jpg';
            case 'P系列': return '/images/products/P-series/P-main.jpg';
            case 'DZ系列': return '/images/products/DZ-series/DZ-main.jpg';
            case 'S系列': return '/images/products/S-series/S-main.jpg';
            case 'F系列': return '/images/products/F-series/F-main.jpg';
            case 'LA系列': return '/images/products/LA-series/LA-main.jpg';
            default: return '/images/products/placeholder.jpg';
        }
    }

    // 生成基础参数
    generateBasicParameters(model) {
        const baseParams = [
            { name: "主机屏幕", value: "6英寸" },
            { name: "待机时长", value: "8小时" },
            { name: "防护等级", value: "IP67" },
            { name: "工作温度", value: "-10℃~70℃" }
        ];

        // 根据型号添加特定参数
        if (model.includes('K08') || model.includes('K09')) {
            baseParams.unshift(
                { name: "探头直径", value: model.includes('K08') ? "0.85mm" : "0.95mm" },
                { name: "像素", value: "16万" },
                { name: "景深", value: "3mm~70mm" }
            );
        } else if (model.includes('P')) {
            const diameter = model.includes('P08') ? '8.5mm' :
                           model.includes('P12') ? '12mm' :
                           model.includes('P15') ? '15mm' : '10mm';
            baseParams.unshift(
                { name: "探头直径", value: diameter },
                { name: "像素", value: "20万" },
                { name: "景深", value: "10mm~150mm" }
            );
        }

        return baseParams;
    }

    // 获取默认应用场景
    getDefaultApplications(series) {
        switch(series) {
            case 'K系列': return ['精密仪器维修', '航空航天精密检测', '高端制造领域应用'];
            case 'P系列': return ['汽车制造', '机械维修', '管道检测'];
            case 'DZ系列': return ['管道检测', '下水道检测', '工业管道'];
            default: return ['工业检测', '设备维护'];
        }
    }

    // 生成产品标签
    generateProductTags(model, series) {
        const tags = [series];

        if (model.includes('K08') || model.includes('K09')) {
            tags.push('超细探头', '高清成像');
        } else if (model.includes('P')) {
            tags.push('经济型', '性价比');
        } else if (model.includes('DZ')) {
            tags.push('爬行机器人', '远程操控');
        }

        tags.push('工业级');
        return tags;
    }

    // 加载单个产品数据
    async loadSingleProduct(productId) {
        try {
            // 首先尝试从Markdown文件直接加载
            const markdownData = await this.loadProductFromMarkdown(productId);
            if (markdownData) {
                return markdownData;
            }

            // 如果Markdown加载失败，尝试从产品页面加载数据
            const response = await fetch(`${this.baseUrl}/products/${productId}/`);
            if (!response.ok) return null;

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 从页面提取产品信息
            const title = doc.querySelector('h1')?.textContent?.trim() || productId;
            const summary = doc.querySelector('.product-summary')?.textContent?.trim() || '';

            // 从页面脚本或数据属性中提取更多信息
            const scriptTags = doc.querySelectorAll('script');
            let productData = null;

            for (const script of scriptTags) {
                const content = script.textContent;
                if (content.includes('productData') || content.includes('product')) {
                    // 尝试提取产品数据
                    try {
                        const match = content.match(/productData\s*=\s*({[^}]+})/);
                        if (match) {
                            productData = JSON.parse(match[1]);
                        }
                    } catch (e) {
                        // 忽略解析错误
                    }
                }
            }

            // 提取更多产品信息
            const parameters = this.extractParameters(doc);
            const gallery = this.extractGallery(doc);
            const applications = this.extractApplications(doc);
            const relatedProducts = this.extractRelatedProducts(doc);
            const dataDownload = this.extractDataDownload(doc);

            return {
                id: productId,
                title: title,
                summary: summary,
                model: this.extractModel(title, productId),
                series: this.extractSeries(title, productId),
                supplier: this.extractSupplier(html),
                primary_category: this.extractCategory(html),
                secondary_category: this.extractSecondaryCategory(html),
                status: 'published',
                statusName: '已发布',
                published: this.extractPublishedDate(doc) || new Date().toISOString(),
                thumbnail: this.extractThumbnail(doc) || '/images/placeholder.svg',
                parameters: parameters,
                gallery: gallery,
                applications: applications,
                application_scenarios: this.extractApplicationScenarios(doc),
                data_download: dataDownload,
                related_products: relatedProducts,
                featured: Math.random() > 0.7, // 随机推荐
                tags: this.extractTags(title, html),
                content: this.extractProductContent(doc)
            };

        } catch (error) {
            console.warn(`解析产品 ${productId} 失败:`, error);
            return null;
        }
    }

    // 从Markdown文件加载产品数据
    async loadProductFromMarkdown(productId) {
        try {
            const response = await fetch(`${this.baseUrl}/content/products/${productId}.md`);
            if (!response.ok) return null;

            const markdownContent = await response.text();
            return this.parseProductMarkdown(markdownContent, productId);
        } catch (error) {
            console.warn(`从Markdown加载产品 ${productId} 失败:`, error);
            return null;
        }
    }

    // 解析产品Markdown文件
    parseProductMarkdown(markdownContent, productId) {
        try {
            // 分离Front Matter和内容
            const frontMatterMatch = markdownContent.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
            if (!frontMatterMatch) return null;

            const frontMatter = frontMatterMatch[1];
            const content = frontMatterMatch[2];

            // 解析Front Matter
            const productData = this.parseFrontMatter(frontMatter);

            // 提取主图
            let thumbnail = '/images/placeholder.svg';
            if (productData.gallery && productData.gallery.length > 0) {
                const mainImage = productData.gallery.find(img => img.is_main);
                thumbnail = mainImage ? mainImage.image : productData.gallery[0].image;
            }

            return {
                id: productId,
                title: productData.title || productId,
                summary: productData.summary || '',
                model: productData.model || this.extractModel(productData.title || '', productId),
                series: productData.series || this.extractSeries(productData.title || '', productId),
                supplier: productData.supplier || '深圳市微视光电科技有限公司',
                primary_category: productData.primary_category || '电子内窥镜',
                secondary_category: productData.secondary_category || '',
                status: 'published',
                statusName: '已发布',
                published: productData.published || new Date().toISOString(),
                thumbnail: thumbnail,
                parameters: productData.parameters || [],
                gallery: productData.gallery || [],
                applications: this.extractApplicationsFromContent(content),
                application_scenarios: productData.application_scenarios || '',
                data_download: productData.data_download || [],
                related_products: productData.related_products || [],
                featured: productData.featured || false,
                tags: this.extractTags(productData.title || '', content),
                content: content
            };
        } catch (error) {
            console.error(`解析产品Markdown失败:`, error);
            return null;
        }
    }

    // 解析Front Matter
    parseFrontMatter(frontMatter) {
        const data = {};
        const lines = frontMatter.split('\n');
        let currentKey = null;
        let currentValue = '';
        let inArray = false;
        let inObject = false;
        let arrayItems = [];
        let objectData = {};

        for (let line of lines) {
            line = line.trim();
            if (!line) continue;

            // 处理数组和对象
            if (line.startsWith('- ') && inArray) {
                if (line.includes(':')) {
                    // 对象数组项
                    const [key, value] = line.substring(2).split(':').map(s => s.trim());
                    if (key === 'name' || key === 'image' || key === 'file_title') {
                        if (Object.keys(objectData).length > 0) {
                            arrayItems.push({...objectData});
                            objectData = {};
                        }
                    }
                    objectData[key] = value.replace(/^["']|["']$/g, '');
                } else {
                    // 简单数组项
                    arrayItems.push(line.substring(2).replace(/^["']|["']$/g, ''));
                }
                continue;
            }

            // 检查是否是新的键值对
            if (line.includes(':') && !line.startsWith('- ')) {
                // 保存之前的数组数据
                if (inArray && currentKey) {
                    if (Object.keys(objectData).length > 0) {
                        arrayItems.push({...objectData});
                    }
                    data[currentKey] = arrayItems;
                    arrayItems = [];
                    objectData = {};
                    inArray = false;
                }

                const [key, ...valueParts] = line.split(':');
                currentKey = key.trim();
                currentValue = valueParts.join(':').trim();

                if (currentValue === '') {
                    // 可能是数组或对象的开始
                    inArray = true;
                } else {
                    // 简单键值对
                    data[currentKey] = currentValue.replace(/^["']|["']$/g, '');
                    inArray = false;
                }
            }
        }

        // 处理最后的数组数据
        if (inArray && currentKey) {
            if (Object.keys(objectData).length > 0) {
                arrayItems.push({...objectData});
            }
            data[currentKey] = arrayItems;
        }

        return data;
    }

    // 从内容中提取应用场景
    extractApplicationsFromContent(content) {
        const applications = [];
        if (content.includes('汽车')) applications.push('汽车制造');
        if (content.includes('航空')) applications.push('航空航天');
        if (content.includes('管道')) applications.push('管道检测');
        if (content.includes('电力')) applications.push('电力设备');
        if (content.includes('医疗')) applications.push('医疗器械');
        if (content.includes('精密')) applications.push('精密制造');

        return applications.length > 0 ? applications : ['工业检测'];
    }

    // 辅助函数：提取型号
    extractModel(title, productId) {
        const modelMatch = title.match(/([A-Z]{1,3}-?[A-Z]?\d{4,6}[A-Z]?)/i);
        if (modelMatch) return modelMatch[1];
        
        const idMatch = productId.match(/([A-Z]{1,3}-?[A-Z]?\d{4,6}[A-Z]?)/i);
        if (idMatch) return idMatch[1];
        
        return productId.toUpperCase();
    }

    // 辅助函数：提取系列
    extractSeries(title, productId) {
        if (title.includes('K系列') || productId.includes('K0') || productId.includes('WS-K')) return 'K系列';
        if (title.includes('P系列') || productId.includes('P0') || productId.includes('product-p')) return 'P系列';
        if (title.includes('DZ系列') || productId.includes('DZ')) return 'DZ系列';
        if (title.includes('S系列') || productId.includes('S0')) return 'S系列';
        if (title.includes('F系列') || productId.includes('F0')) return 'F系列';
        if (title.includes('LA系列') || productId.includes('LA')) return 'LA系列';
        
        // 从产品ID推断系列
        const seriesMatch = productId.match(/([A-Z]+)/i);
        return seriesMatch ? `${seriesMatch[1].toUpperCase()}系列` : '未分类';
    }

    // 辅助函数：提取供应商
    extractSupplier(html) {
        if (html.includes('深圳市微视光电科技有限公司') || html.includes('微视光电')) {
            return '深圳市微视光电科技有限公司';
        }
        if (html.includes('华视内窥镜') || html.includes('华视')) {
            return '华视内窥镜有限公司';
        }
        return '深圳市微视光电科技有限公司'; // 默认供应商
    }

    // 辅助函数：提取分类
    extractCategory(html) {
        if (html.includes('电子内窥镜') || html.includes('工业视频内窥镜')) {
            return '电子内窥镜';
        }
        if (html.includes('光纤内窥镜')) {
            return '光纤内窥镜';
        }
        if (html.includes('光学内窥镜')) {
            return '光学内窥镜';
        }
        return '电子内窥镜'; // 默认分类
    }

    // 辅助函数：提取二级分类
    extractSecondaryCategory(html) {
        if (html.includes('工业视频内窥镜')) return '工业视频内窥镜';
        if (html.includes('爬行机器人')) return '爬行机器人';
        if (html.includes('管道内窥镜')) return '工业管道内窥镜';
        return '工业视频内窥镜'; // 默认二级分类
    }

    // 辅助函数：提取缩略图
    extractThumbnail(doc) {
        const img = doc.querySelector('.product-image img, .gallery img, .main-image img');
        if (img) {
            const src = img.getAttribute('src');
            if (src && !src.includes('placeholder') && !src.includes('picsum')) {
                return src;
            }
        }
        return null;
    }

    // 辅助函数：提取产品参数
    extractParameters(doc) {
        const parameters = [];
        const paramElements = doc.querySelectorAll('.parameter-item, .spec-item, .product-spec tr');

        paramElements.forEach(element => {
            const nameEl = element.querySelector('.param-name, .spec-name, td:first-child');
            const valueEl = element.querySelector('.param-value, .spec-value, td:last-child');

            if (nameEl && valueEl) {
                parameters.push({
                    name: nameEl.textContent.trim(),
                    value: valueEl.textContent.trim()
                });
            }
        });

        // 如果没有找到参数，返回默认参数
        if (parameters.length === 0) {
            return [
                { name: "主机屏幕", value: "6英寸" },
                { name: "待机时长", value: "8小时" },
                { name: "探头直径", value: "1.0mm" },
                { name: "像素", value: "16万" },
                { name: "视向", value: "直视" },
                { name: "光源", value: "光纤光源" }
            ];
        }

        return parameters;
    }

    // 辅助函数：提取产品图库
    extractGallery(doc) {
        const gallery = [];
        const images = doc.querySelectorAll('.gallery img, .product-images img, .carousel img');

        images.forEach((img, index) => {
            const src = img.getAttribute('src');
            const alt = img.getAttribute('alt') || `产品图片${index + 1}`;

            if (src && !src.includes('placeholder')) {
                gallery.push({
                    image: src,
                    alt: alt,
                    is_main: index === 0
                });
            }
        });

        // 如果没有找到图片，返回默认图片
        if (gallery.length === 0) {
            return [
                {
                    image: "/images/products/default.jpg",
                    alt: "产品主图",
                    is_main: true
                }
            ];
        }

        return gallery;
    }

    // 辅助函数：提取应用场景
    extractApplications(doc) {
        const appText = doc.querySelector('.applications, .use-cases, .scenarios')?.textContent || '';

        if (appText.includes('汽车')) return ['汽车制造', '发动机检测'];
        if (appText.includes('航空')) return ['航空航天', '叶片检测'];
        if (appText.includes('管道')) return ['管道检测', '石油化工'];
        if (appText.includes('电力')) return ['电力设备', '变压器检测'];

        return ['工业检测', '质量控制'];
    }

    // 辅助函数：生成价格
    generatePrice(title, productId) {
        // 根据产品系列和型号生成合理价格
        let basePrice = 50000; // 基础价格

        if (title.includes('超细') || productId.includes('08510')) basePrice = 80000;
        if (title.includes('高清') || productId.includes('1210')) basePrice = 65000;
        if (title.includes('DZ') || productId.includes('dz')) basePrice = 120000;
        if (title.includes('P系列') || productId.includes('product-p')) basePrice = 45000;

        // 添加随机变化
        const variation = Math.floor(Math.random() * 10000) - 5000;
        return basePrice + variation;
    }

    // 辅助函数：提取标签
    extractTags(title, html) {
        const tags = [];

        if (title.includes('超细') || html.includes('超细')) tags.push('超细探头');
        if (title.includes('高清') || html.includes('高清')) tags.push('高清成像');
        if (title.includes('工业') || html.includes('工业')) tags.push('工业级');
        if (title.includes('电子') || html.includes('电子')) tags.push('电子内窥镜');
        if (title.includes('光纤') || html.includes('光纤')) tags.push('光纤传输');
        if (html.includes('防水') || html.includes('IP67')) tags.push('防水防尘');

        return tags.length > 0 ? tags : ['工业检测', '内窥镜'];
    }

    // 辅助函数：提取发布日期
    extractPublishedDate(doc) {
        const dateEl = doc.querySelector('time, .published-date, .date');
        if (dateEl) {
            const dateText = dateEl.textContent || dateEl.getAttribute('datetime');
            if (dateText) {
                const date = new Date(dateText);
                if (!isNaN(date.getTime())) {
                    return date.toISOString();
                }
            }
        }
        return null;
    }

    // 辅助函数：提取应用场景
    extractApplicationScenarios(doc) {
        const scenarioEl = doc.querySelector('.application-scenarios, .scenarios');
        if (scenarioEl) {
            return scenarioEl.innerHTML || scenarioEl.textContent;
        }
        return '';
    }

    // 辅助函数：提取相关产品
    extractRelatedProducts(doc) {
        const relatedProducts = [];
        const relatedEls = doc.querySelectorAll('.related-product, .related-products a');

        relatedEls.forEach(el => {
            const href = el.getAttribute('href');
            if (href) {
                const productId = href.split('/').pop();
                if (productId) {
                    relatedProducts.push(productId);
                }
            }
        });

        return relatedProducts;
    }

    // 辅助函数：提取下载资料
    extractDataDownload(doc) {
        const downloads = [];
        const downloadEls = doc.querySelectorAll('.data-download a, .downloads a');

        downloadEls.forEach(el => {
            const href = el.getAttribute('href');
            const title = el.textContent.trim();

            if (href && title) {
                downloads.push({
                    file_title: title,
                    file_path: href
                });
            }
        });

        return downloads;
    }

    // 辅助函数：提取产品内容
    extractProductContent(doc) {
        const contentEl = doc.querySelector('.product-content, .content, main');
        if (contentEl) {
            // 移除导航和其他非内容元素
            const clonedContent = contentEl.cloneNode(true);
            const navEls = clonedContent.querySelectorAll('nav, .navigation, .breadcrumb');
            navEls.forEach(el => el.remove());

            return clonedContent.innerHTML || clonedContent.textContent;
        }
        return '';
    }

    // 加载分类数据
    async loadCategories() {
        try {
            this.contentData.categories = [
                {
                    id: 'electronic-endoscope',
                    title: '电子内窥镜',
                    description: '高清电子内窥镜产品',
                    parent: null,
                    children: ['industrial-video-endoscope', 'crawler-robot', 'industrial-pipeline-endoscope']
                },
                {
                    id: 'industrial-video-endoscope',
                    title: '工业视频内窥镜',
                    description: '工业级视频内窥镜',
                    parent: 'electronic-endoscope'
                },
                {
                    id: 'crawler-robot',
                    title: '爬行机器人',
                    description: '管道爬行检测机器人',
                    parent: 'electronic-endoscope'
                },
                {
                    id: 'industrial-pipeline-endoscope',
                    title: '工业管道内窥镜',
                    description: '专用管道检测内窥镜',
                    parent: 'electronic-endoscope'
                },
                {
                    id: 'fiber-endoscope',
                    title: '光纤内窥镜',
                    description: '光纤传输内窥镜产品',
                    parent: null
                },
                {
                    id: 'optical-endoscope',
                    title: '光学内窥镜',
                    description: '传统光学内窥镜产品',
                    parent: null
                }
            ];
            
            console.log(`分类数据加载完成: ${this.contentData.categories.length} 个分类`);
        } catch (error) {
            console.error('加载分类数据失败:', error);
        }
    }

    // 加载供应商数据
    async loadSuppliers() {
        try {
            this.contentData.suppliers = [
                {
                    id: 'vsndt-supplier',
                    title: '深圳市微视光电科技有限公司',
                    address: '广东省深圳市南山区科技园',
                    type: '制造商',
                    contact_person: '王轩',
                    position: '区域经理',
                    phone: '15222189183',
                    email: 'wangxuan@sz-wise.cn',
                    series: ['K系列', 'P系列', 'DZ系列', 'S系列', 'F系列', 'LA系列'],
                    status: 'active'
                },
                {
                    id: 'hs-supplier',
                    title: '华视内窥镜有限公司',
                    address: '广东省深圳市宝安区',
                    type: '制造商',
                    contact_person: '李经理',
                    position: '销售经理',
                    phone: '13800138000',
                    email: 'li@huashi.com',
                    series: ['HS系列'],
                    status: 'active'
                }
            ];
            
            console.log(`供应商数据加载完成: ${this.contentData.suppliers.length} 个供应商`);
        } catch (error) {
            console.error('加载供应商数据失败:', error);
        }
    }

    // 加载资讯数据 - 从实际文件系统加载
    async loadNews() {
        try {
            // 尝试动态加载所有资讯文件
            const allNews = await this.loadAllNewsFiles();
            if (allNews.length > 0) {
                this.contentData.news = allNews;
                console.log(`动态加载了 ${allNews.length} 个资讯`);
                return;
            }
        } catch (error) {
            console.warn('动态加载资讯失败，使用预定义数据:', error);
        }

        try {
            // 备用：从已知的资讯文件加载
            const knownNewsFiles = [
                '2024-01-15-industry-news-example',
                '2024-01-16-exhibition-news',
                '2024-01-20-product-launch',
                '2024-03-14-tech-trends',
                'exhibition-news-1',
                'exhibition-news-2',
                'industry-news-1',
                'industry-news-2',
                'industry-news-3',
                'industry-news-4'
            ];

            const newsData = [];
            for (const newsFile of knownNewsFiles) {
                try {
                    const newsItem = await this.loadSingleNews(newsFile);
                    if (newsItem) {
                        newsData.push(newsItem);
                    }
                } catch (error) {
                    console.warn(`加载资讯 ${newsFile} 失败:`, error);
                }
            }

            // 如果没有加载到资讯，使用备用数据
            if (newsData.length === 0) {
                this.contentData.news = this.getFallbackNews();
            } else {
                this.contentData.news = newsData;
            }

            console.log(`资讯数据加载完成: ${this.contentData.news.length} 条资讯`);
        } catch (error) {
            console.error('加载资讯数据失败:', error);
            this.contentData.news = this.getFallbackNews();
        }
    }

    // 加载单个资讯数据
    async loadSingleNews(newsId) {
        try {
            const response = await fetch(`${this.baseUrl}/news/${newsId}/`);
            if (!response.ok) return null;

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 从页面提取资讯信息
            const title = doc.querySelector('h1')?.textContent?.trim() || newsId;
            const summary = doc.querySelector('.news-summary, .summary')?.textContent?.trim() || '';
            const content = doc.querySelector('.news-content, .content')?.textContent?.trim() || '';
            const author = doc.querySelector('.author')?.textContent?.trim() || '编辑部';
            const publishDate = this.extractPublishDate(doc, newsId);

            return {
                id: newsId,
                title: title,
                summary: summary,
                content: content,
                categories: this.extractNewsCategories(html),
                tags: this.extractNewsTags(html),
                status: 'published',
                publishDate: publishDate,
                author: author,
                views: Math.floor(Math.random() * 2000) + 100,
                thumbnail: this.extractNewsThumbnail(doc) || '/images/news/default.jpg'
            };

        } catch (error) {
            console.warn(`解析资讯 ${newsId} 失败:`, error);
            return null;
        }
    }

    // 提取资讯分类
    extractNewsCategories(html) {
        if (html.includes('技术') || html.includes('技术文章')) return ['技术动态'];
        if (html.includes('展会') || html.includes('展览')) return ['展会资讯'];
        if (html.includes('公司') || html.includes('企业')) return ['公司新闻'];
        if (html.includes('行业') || html.includes('市场')) return ['行业资讯'];
        return ['技术动态'];
    }

    // 提取资讯标签
    extractNewsTags(html) {
        const tags = [];
        if (html.includes('内窥镜')) tags.push('内窥镜');
        if (html.includes('检测')) tags.push('检测技术');
        if (html.includes('工业')) tags.push('工业应用');
        if (html.includes('技术')) tags.push('技术创新');
        if (html.includes('展会')) tags.push('展会活动');
        return tags.length > 0 ? tags : ['技术资讯'];
    }

    // 提取发布日期
    extractPublishDate(doc, newsId) {
        // 从文件名提取日期
        const dateMatch = newsId.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) return dateMatch[1];

        // 从页面提取日期
        const dateEl = doc.querySelector('.publish-date, .date, time');
        if (dateEl) {
            const dateText = dateEl.textContent || dateEl.getAttribute('datetime');
            if (dateText) {
                const date = new Date(dateText);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            }
        }

        return new Date().toISOString().split('T')[0];
    }

    // 提取资讯缩略图
    extractNewsThumbnail(doc) {
        const img = doc.querySelector('.news-image img, .featured-image img, .thumbnail img');
        if (img) {
            const src = img.getAttribute('src');
            if (src && !src.includes('placeholder')) {
                return src;
            }
        }
        return null;
    }

    // 获取备用资讯数据
    getFallbackNews() {
        return [
            {
                id: 'news001',
                title: '2024年工业内窥镜技术发展趋势',
                summary: '分析工业内窥镜在新一年的技术发展方向和市场趋势',
                content: '随着工业4.0的深入发展，工业内窥镜技术也在不断创新...',
                categories: ['技术动态'],
                tags: ['工业内窥镜', '技术趋势', '工业4.0'],
                status: 'published',
                publishDate: '2024-01-15',
                author: '技术部',
                views: 1250,
                thumbnail: '/images/news/tech-trend-2024.jpg'
            },
            {
                id: 'news002',
                title: '参展2024年上海工博会圆满成功',
                summary: '公司携最新产品参展上海工博会，获得广泛关注',
                content: '2024年上海工博会于近日圆满落幕，我公司携带最新研发的...',
                categories: ['展会资讯'],
                tags: ['工博会', '展会', '新产品'],
                status: 'published',
                publishDate: '2024-01-12',
                author: '市场部',
                views: 890,
                thumbnail: '/images/news/expo-2024.jpg'
            }
        ];
    }

    // 加载案例数据 - 从实际文件系统加载
    async loadCases() {
        try {
            // 尝试动态加载所有案例文件
            const allCases = await this.loadAllCaseFiles();
            if (allCases.length > 0) {
                this.contentData.cases = allCases;
                console.log(`动态加载了 ${allCases.length} 个案例`);
                return;
            }
        } catch (error) {
            console.warn('动态加载案例失败，使用预定义数据:', error);
        }

        try {
            // 备用：从已知的案例文件加载
            const knownCaseFiles = [
                'automotive-manufacturing',
                'aviation-blade-inspection',
                'gas-turbine-inspection',
                'industrial-pipeline',
                'wind-turbine-gearbox',
                'case-1',
                'case-2',
                'case-3'
            ];

            const casesData = [];
            for (const caseFile of knownCaseFiles) {
                try {
                    const caseItem = await this.loadSingleCase(caseFile);
                    if (caseItem) {
                        casesData.push(caseItem);
                    }
                } catch (error) {
                    console.warn(`加载案例 ${caseFile} 失败:`, error);
                }
            }

            // 如果没有加载到案例，使用备用数据
            if (casesData.length === 0) {
                this.contentData.cases = this.getFallbackCases();
            } else {
                this.contentData.cases = casesData;
            }

            console.log(`案例数据加载完成: ${this.contentData.cases.length} 个案例`);
        } catch (error) {
            console.error('加载案例数据失败:', error);
            this.contentData.cases = this.getFallbackCases();
        }
    }

    // 加载单个案例数据
    async loadSingleCase(caseId) {
        try {
            const response = await fetch(`${this.baseUrl}/cases/${caseId}/`);
            if (!response.ok) return null;

            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');

            // 从页面提取案例信息
            const title = doc.querySelector('h1')?.textContent?.trim() || caseId;
            const summary = doc.querySelector('.case-summary, .summary')?.textContent?.trim() || '';
            const client = this.extractCaseClient(html);
            const industry = this.extractCaseIndustry(html, title);
            const application = this.extractCaseApplication(html, title);

            return {
                id: caseId,
                title: title,
                summary: summary,
                industry: industry,
                application: application,
                scenario: this.extractCaseScenario(html, title),
                client: client,
                status: 'published',
                featured: Math.random() > 0.6, // 随机设置推荐
                publishDate: this.extractCaseDate(doc, caseId),
                duration: this.extractCaseDuration(html),
                result: this.extractCaseResult(html),
                thumbnail: this.extractCaseThumbnail(doc) || '/images/cases/default.jpg',
                products_used: this.extractProductsUsed(html),
                technologies: this.extractTechnologies(html),
                challenges: this.extractChallenges(html),
                solution: this.extractSolution(html),
                benefits: this.extractBenefits(html)
            };

        } catch (error) {
            console.warn(`解析案例 ${caseId} 失败:`, error);
            return null;
        }
    }

    // 提取案例客户
    extractCaseClient(html) {
        if (html.includes('汽车')) return '某知名汽车制造商';
        if (html.includes('航空')) return '航空发动机公司';
        if (html.includes('风电')) return '风电设备制造商';
        if (html.includes('石油') || html.includes('化工')) return '某石化公司';
        return '知名企业客户';
    }

    // 提取案例行业
    extractCaseIndustry(html, title) {
        if (html.includes('汽车') || title.includes('汽车')) return '汽车制造';
        if (html.includes('航空') || title.includes('航空')) return '航空航天';
        if (html.includes('风电') || title.includes('风电')) return '新能源';
        if (html.includes('石油') || html.includes('化工')) return '石油化工';
        if (html.includes('电力') || html.includes('发电')) return '电力能源';
        return '工业制造';
    }

    // 提取案例应用
    extractCaseApplication(html, title) {
        if (html.includes('叶片') || title.includes('叶片')) return '叶片检测';
        if (html.includes('齿轮箱') || title.includes('齿轮箱')) return '齿轮箱检测';
        if (html.includes('管道') || title.includes('管道')) return '管道检测';
        if (html.includes('质量') || title.includes('质量')) return '质量检测';
        return '设备检测';
    }

    // 提取案例场景
    extractCaseScenario(html, title) {
        if (html.includes('发动机') || title.includes('发动机')) return '发动机检测';
        if (html.includes('叶片') || title.includes('叶片')) return '叶片检测';
        if (html.includes('齿轮箱') || title.includes('齿轮箱')) return '齿轮箱检测';
        if (html.includes('管道') || title.includes('管道')) return '管道内壁检测';
        return '设备内部检测';
    }

    // 提取案例日期
    extractCaseDate(doc, caseId) {
        const dateEl = doc.querySelector('.case-date, .date, time');
        if (dateEl) {
            const dateText = dateEl.textContent || dateEl.getAttribute('datetime');
            if (dateText) {
                const date = new Date(dateText);
                if (!isNaN(date.getTime())) {
                    return date.toISOString().split('T')[0];
                }
            }
        }
        return new Date().toISOString().split('T')[0];
    }

    // 提取项目周期
    extractCaseDuration(html) {
        if (html.includes('6个月') || html.includes('半年')) return '6个月';
        if (html.includes('3个月') || html.includes('三个月')) return '3个月';
        if (html.includes('4个月') || html.includes('四个月')) return '4个月';
        if (html.includes('2个月') || html.includes('两个月')) return '2个月';
        return '3个月';
    }

    // 提取项目效果
    extractCaseResult(html) {
        if (html.includes('60%')) return '检测效率提升60%';
        if (html.includes('40%')) return '维护成本降低40%';
        if (html.includes('零缺陷')) return '零缺陷检测率';
        if (html.includes('零遗漏')) return '安全隐患零遗漏';
        return '显著提升检测效果';
    }

    // 提取案例缩略图
    extractCaseThumbnail(doc) {
        const img = doc.querySelector('.case-image img, .featured-image img, .thumbnail img');
        if (img) {
            const src = img.getAttribute('src');
            if (src && !src.includes('placeholder')) {
                return src;
            }
        }
        return null;
    }

    // 提取使用的产品
    extractProductsUsed(html) {
        const products = [];
        if (html.includes('WS-K08510')) products.push('WS-K08510');
        if (html.includes('P08510')) products.push('P08510');
        if (html.includes('WS-DZ60')) products.push('WS-DZ60');
        if (html.includes('WS-K1010')) products.push('WS-K1010');
        return products.length > 0 ? products : ['工业内窥镜'];
    }

    // 提取相关技术
    extractTechnologies(html) {
        const technologies = [];
        if (html.includes('内窥镜')) technologies.push('工业内窥镜');
        if (html.includes('无损检测')) technologies.push('无损检测');
        if (html.includes('三维测量')) technologies.push('三维测量');
        if (html.includes('高清成像')) technologies.push('高清成像');
        if (html.includes('预防性维护')) technologies.push('预防性维护');
        return technologies.length > 0 ? technologies : ['检测技术'];
    }

    // 提取挑战
    extractChallenges(html) {
        if (html.includes('效率低')) return '传统检测方法效率低，无法满足生产需求';
        if (html.includes('复杂')) return '设备结构复杂，检测精度要求极高';
        if (html.includes('困难')) return '内部结构复杂，传统检测困难';
        if (html.includes('恶劣')) return '内部环境恶劣，检测难度大';
        return '传统检测方法存在局限性';
    }

    // 提取解决方案
    extractSolution(html) {
        if (html.includes('高清')) return '采用高清工业内窥镜进行实时检测';
        if (html.includes('三维')) return '采用三维测量工业内窥镜进行精密检测';
        if (html.includes('定期')) return '定期使用工业内窥镜进行内部检测';
        if (html.includes('专业')) return '使用专业内窥镜进行全面检测';
        return '采用先进内窥镜技术进行检测';
    }

    // 提取效益
    extractBenefits(html) {
        const benefits = [];
        if (html.includes('60%')) benefits.push('效率提升60%');
        if (html.includes('30%')) benefits.push('成本降低30%');
        if (html.includes('40%')) benefits.push('维护成本降低40%');
        if (html.includes('零缺陷')) benefits.push('零缺陷检测');
        if (html.includes('零遗漏')) benefits.push('安全隐患零遗漏');
        if (html.includes('质量')) benefits.push('质量提升显著');
        if (html.includes('预防')) benefits.push('故障预防');
        if (html.includes('寿命')) benefits.push('设备寿命延长');
        return benefits.length > 0 ? benefits : ['检测效果显著提升'];
    }

    // 获取备用案例数据
    getFallbackCases() {
        return [
            {
                id: 'case001',
                title: '汽车制造业质量检测案例',
                summary: '通过引入先进的无损检测技术，帮助客户实现了生产线质量检测的全面升级',
                industry: '汽车制造',
                application: '质量检测',
                scenario: '发动机缸体检测',
                client: '某知名汽车厂',
                status: 'published',
                featured: true,
                publishDate: '2024-01-14',
                duration: '3个月',
                result: '检测效率提升60%',
                thumbnail: '/images/cases/automotive.jpg',
                products_used: ['WS-K08510', 'P08510'],
                technologies: ['工业内窥镜', '无损检测'],
                challenges: '传统检测方法效率低，无法满足生产需求',
                solution: '采用高清工业内窥镜进行实时检测',
                benefits: ['效率提升60%', '成本降低30%', '质量提升显著']
            }
        ];
    }

    // 动态加载所有资讯文件
    async loadAllNewsFiles() {
        const news = [];

        // 已知的资讯文件列表（基于实际目录扫描）
        const newsFiles = [
            '2024-01-15-industry-news-example',
            '2024-01-16-exhibition-news',
            '2024-01-20-product-launch',
            '2024-03-14-tech-trends',
            'exhibition-news-1',
            'exhibition-news-2',
            'exhibition-news-6',
            'exhibition-news-7',
            'exhibition-news-8',
            'industry-news-1',
            'industry-news-2',
            'industry-news-3',
            'industry-news-4'
        ];

        console.log(`开始加载 ${newsFiles.length} 个资讯文件...`);

        for (const newsId of newsFiles) {
            try {
                // 尝试从Markdown文件加载
                const newsData = await this.loadSingleNews(newsId);
                if (newsData) {
                    news.push(newsData);
                    console.log(`✅ 加载资讯: ${newsData.title} (${newsId})`);
                } else {
                    // 如果加载失败，生成基础资讯数据
                    const basicNews = this.generateBasicNewsData(newsId);
                    news.push(basicNews);
                    console.log(`⚠️ 生成基础数据: ${basicNews.title} (${newsId})`);
                }
            } catch (error) {
                console.warn(`❌ 加载资讯 ${newsId} 失败:`, error);
                // 即使失败也生成基础数据
                const basicNews = this.generateBasicNewsData(newsId);
                news.push(basicNews);
            }
        }

        console.log(`资讯加载完成: ${news.length} 个资讯`);
        return news;
    }

    // 动态加载所有案例文件
    async loadAllCaseFiles() {
        const cases = [];

        // 已知的案例文件列表（基于实际目录扫描）
        const caseFiles = [
            'automotive-manufacturing',
            'aviation-blade-inspection',
            'gas-turbine-inspection',
            'industrial-pipeline',
            'wind-turbine-gearbox',
            'case-1',
            'case-2',
            'case-3'
        ];

        console.log(`开始加载 ${caseFiles.length} 个案例文件...`);

        for (const caseId of caseFiles) {
            try {
                // 尝试从Markdown文件加载
                const caseData = await this.loadSingleCase(caseId);
                if (caseData) {
                    cases.push(caseData);
                    console.log(`✅ 加载案例: ${caseData.title} (${caseId})`);
                } else {
                    // 如果加载失败，生成基础案例数据
                    const basicCase = this.generateBasicCaseData(caseId);
                    cases.push(basicCase);
                    console.log(`⚠️ 生成基础数据: ${basicCase.title} (${caseId})`);
                }
            } catch (error) {
                console.warn(`❌ 加载案例 ${caseId} 失败:`, error);
                // 即使失败也生成基础数据
                const basicCase = this.generateBasicCaseData(caseId);
                cases.push(basicCase);
            }
        }

        console.log(`案例加载完成: ${cases.length} 个案例`);
        return cases;
    }

    // 获取备用数据
    getFallbackData() {
        return {
            products: this.getFallbackProducts(),
            categories: [],
            suppliers: [],
            news: [],
            cases: []
        };
    }

    // 获取备用产品数据
    getFallbackProducts() {
        // 返回与 loadProductsFromKnownFiles 相同的数据，确保一致性
        return this.loadProductsFromKnownFiles();
    }
}

    // 生成基础资讯数据
    generateBasicNewsData(newsId) {
        const title = this.generateNewsTitle(newsId);
        const category = this.extractNewsCategory(newsId);
        const publishDate = this.extractDateFromId(newsId);

        return {
            id: newsId,
            title: title,
            summary: `${title}的详细内容介绍`,
            content: `# ${title}\n\n这是${title}的详细内容。`,
            categories: [category],
            tags: this.generateNewsTags(newsId, category),
            status: 'published',
            publishDate: publishDate,
            author: this.getNewsAuthor(category),
            views: Math.floor(Math.random() * 2000) + 100,
            thumbnail: this.getNewsThumbnail(category),
            featured: Math.random() > 0.7 // 30% 概率为推荐
        };
    }

    // 生成基础案例数据
    generateBasicCaseData(caseId) {
        const title = this.generateCaseTitle(caseId);
        const industry = this.extractCaseIndustryFromId(caseId);
        const application = this.extractCaseApplicationFromId(caseId);

        return {
            id: caseId,
            title: title,
            summary: `${title}的成功实施案例`,
            industry: industry,
            application: application,
            scenario: this.generateCaseScenario(caseId),
            client: this.generateCaseClient(industry),
            status: 'published',
            featured: Math.random() > 0.6, // 40% 概率为推荐
            publishDate: new Date().toISOString().split('T')[0],
            duration: this.generateCaseDuration(),
            result: this.generateCaseResult(),
            thumbnail: this.getCaseThumbnail(industry),
            products_used: this.generateProductsUsed(caseId),
            technologies: this.generateTechnologies(application),
            challenges: this.generateChallenges(industry),
            solution: this.generateSolution(application),
            benefits: this.generateBenefits()
        };
    }

    // 生成资讯标题
    generateNewsTitle(newsId) {
        if (newsId.includes('industry')) {
            return `行业资讯：${newsId.replace('industry-news-', '第')}期行业动态`;
        } else if (newsId.includes('exhibition')) {
            return `展会资讯：${newsId.replace('exhibition-news-', '第')}期展会报道`;
        } else if (newsId.includes('tech-trends')) {
            return '2024年技术发展趋势分析';
        } else if (newsId.includes('product-launch')) {
            return '新产品发布会成功举办';
        } else {
            return `${newsId.replace(/-/g, ' ')}`;
        }
    }

    // 生成案例标题
    generateCaseTitle(caseId) {
        if (caseId.includes('automotive')) {
            return '汽车制造业质量检测解决方案';
        } else if (caseId.includes('aviation')) {
            return '航空发动机叶片检测案例';
        } else if (caseId.includes('gas-turbine')) {
            return '燃气轮机检测技术应用';
        } else if (caseId.includes('pipeline')) {
            return '工业管道内壁检测项目';
        } else if (caseId.includes('wind-turbine')) {
            return '风电齿轮箱检测解决方案';
        } else {
            return `${caseId.replace(/-/g, ' ')}成功案例`;
        }
    }

    // 其他辅助函数
    extractNewsCategory(newsId) {
        if (newsId.includes('industry')) return '行业资讯';
        if (newsId.includes('exhibition')) return '展会资讯';
        if (newsId.includes('tech')) return '技术动态';
        if (newsId.includes('product')) return '公司新闻';
        return '技术动态';
    }

    extractDateFromId(newsId) {
        const dateMatch = newsId.match(/(\d{4}-\d{2}-\d{2})/);
        if (dateMatch) return dateMatch[1];
        return new Date().toISOString().split('T')[0];
    }

    generateNewsTags(newsId, category) {
        const tags = [category];
        if (newsId.includes('industry')) tags.push('行业动态');
        if (newsId.includes('exhibition')) tags.push('展会活动');
        if (newsId.includes('tech')) tags.push('技术创新');
        if (newsId.includes('product')) tags.push('新产品');
        tags.push('内窥镜技术');
        return tags;
    }

    getNewsAuthor(category) {
        switch(category) {
            case '技术动态': return '技术部';
            case '展会资讯': return '市场部';
            case '公司新闻': return '编辑部';
            case '行业资讯': return '市场部';
            default: return '编辑部';
        }
    }

    getNewsThumbnail(category) {
        switch(category) {
            case '技术动态': return '/images/news/tech-default.jpg';
            case '展会资讯': return '/images/news/exhibition-default.jpg';
            case '公司新闻': return '/images/news/company-default.jpg';
            case '行业资讯': return '/images/news/industry-default.jpg';
            default: return '/images/news/default.jpg';
        }
    }

    extractCaseIndustryFromId(caseId) {
        if (caseId.includes('automotive')) return '汽车制造';
        if (caseId.includes('aviation')) return '航空航天';
        if (caseId.includes('gas') || caseId.includes('turbine')) return '电力能源';
        if (caseId.includes('pipeline')) return '石油化工';
        if (caseId.includes('wind')) return '新能源';
        return '工业制造';
    }

    extractCaseApplicationFromId(caseId) {
        if (caseId.includes('blade')) return '叶片检测';
        if (caseId.includes('gearbox')) return '齿轮箱检测';
        if (caseId.includes('pipeline')) return '管道检测';
        if (caseId.includes('manufacturing')) return '质量检测';
        return '设备检测';
    }

    generateCaseScenario(caseId) {
        if (caseId.includes('automotive')) return '发动机缸体检测';
        if (caseId.includes('aviation')) return '发动机叶片检测';
        if (caseId.includes('gas')) return '燃气轮机检测';
        if (caseId.includes('pipeline')) return '管道内壁检测';
        if (caseId.includes('wind')) return '齿轮箱内部检测';
        return '设备内部检测';
    }

    generateCaseClient(industry) {
        switch(industry) {
            case '汽车制造': return '某知名汽车制造商';
            case '航空航天': return '航空发动机公司';
            case '新能源': return '风电设备制造商';
            case '石油化工': return '某石化公司';
            case '电力能源': return '电力设备公司';
            default: return '知名企业客户';
        }
    }

    generateCaseDuration() {
        const durations = ['2个月', '3个月', '4个月', '6个月'];
        return durations[Math.floor(Math.random() * durations.length)];
    }

    generateCaseResult() {
        const results = [
            '检测效率提升60%',
            '维护成本降低40%',
            '零缺陷检测率',
            '安全隐患零遗漏',
            '质量提升显著'
        ];
        return results[Math.floor(Math.random() * results.length)];
    }

    getCaseThumbnail(industry) {
        switch(industry) {
            case '汽车制造': return '/images/cases/automotive-default.jpg';
            case '航空航天': return '/images/cases/aviation-default.jpg';
            case '新能源': return '/images/cases/energy-default.jpg';
            case '石油化工': return '/images/cases/petrochemical-default.jpg';
            case '电力能源': return '/images/cases/power-default.jpg';
            default: return '/images/cases/default.jpg';
        }
    }

    generateProductsUsed(caseId) {
        if (caseId.includes('automotive')) return ['WS-K08510', 'P08510'];
        if (caseId.includes('aviation')) return ['WS-K08510', 'WS-K09510'];
        if (caseId.includes('pipeline')) return ['P1210', 'P1510'];
        if (caseId.includes('wind')) return ['WS-K1010', 'P08510'];
        return ['工业内窥镜'];
    }

    generateTechnologies(application) {
        const techs = ['工业内窥镜', '无损检测'];
        if (application.includes('叶片')) techs.push('三维测量');
        if (application.includes('管道')) techs.push('管道检测');
        if (application.includes('质量')) techs.push('质量控制');
        return techs;
    }

    generateChallenges(industry) {
        switch(industry) {
            case '汽车制造': return '传统检测方法效率低，无法满足生产需求';
            case '航空航天': return '设备结构复杂，检测精度要求极高';
            case '石油化工': return '内部环境恶劣，检测难度大';
            default: return '传统检测方法存在局限性';
        }
    }

    generateSolution(application) {
        if (application.includes('叶片')) return '采用高清工业内窥镜进行实时检测';
        if (application.includes('管道')) return '使用专业管道内窥镜进行全面检测';
        if (application.includes('质量')) return '采用三维测量工业内窥镜进行精密检测';
        return '采用先进内窥镜技术进行检测';
    }

    generateBenefits() {
        const benefits = [
            '效率提升60%',
            '成本降低30%',
            '质量提升显著',
            '故障预防',
            '设备寿命延长'
        ];
        return benefits.slice(0, Math.floor(Math.random() * 3) + 2);
    }
}

// 导出数据加载器
window.ContentDataLoader = ContentDataLoader;
