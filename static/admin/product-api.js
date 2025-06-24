// 产品API - 处理产品数据的保存和同步
class ProductAPI {
    constructor() {
        this.baseUrl = 'http://localhost:3001';
        this.apiEndpoint = `${this.baseUrl}/api/products`;
    }

    // 保存产品到文件系统
    async saveProduct(productData) {
        try {
            // 生成Markdown内容
            const markdownContent = this.generateProductMarkdown(productData);
            
            // 发送到后端API
            const response = await fetch(`${this.apiEndpoint}/save`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: productData.id,
                    content: markdownContent,
                    action: 'save'
                })
            });

            if (response.ok) {
                const result = await response.json();
                console.log('产品保存成功:', result);
                return { success: true, message: '产品已保存并同步到前台' };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('保存产品失败:', error);
            
            // 如果API不可用，使用本地存储作为备份
            return this.saveToLocalStorage(productData);
        }
    }

    // 生成产品Markdown内容
    generateProductMarkdown(productData) {
        let markdown = '---\n';

        // YAML字符串转义函数
        const escapeYamlString = (str) => {
            if (!str) return '""';
            // 转义引号和控制字符
            return '"' + str.toString()
                .replace(/\\/g, '\\\\')    // 转义反斜杠
                .replace(/"/g, '\\"')      // 转义双引号
                .replace(/\n/g, '\\n')     // 转义换行
                .replace(/\r/g, '\\r')     // 转义回车
                .replace(/\t/g, '\\t')     // 转义制表符
                .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
                + '"';
        };

        // 基本信息
        markdown += `title: ${escapeYamlString(productData.title)}\n`;
        markdown += `summary: ${escapeYamlString(productData.summary)}\n`;
        markdown += `primary_category: ${escapeYamlString(productData.primary_category)}\n`;
        markdown += `secondary_category: ${escapeYamlString(productData.secondary_category)}\n`;
        markdown += `model: ${escapeYamlString(productData.model)}\n`;
        markdown += `series: ${escapeYamlString(productData.series)}\n`;
        markdown += `supplier: ${escapeYamlString(productData.supplier)}\n`;
        markdown += `published: ${productData.published}\n`;

        // 图库 - 确保包含主图和副图
        markdown += 'gallery:\n';

        // 添加主图
        const mainImage = this.getSeriesMainImage(productData.series);
        markdown += `  - image: ${escapeYamlString(mainImage)}\n`;
        markdown += `    alt: ${escapeYamlString('主图')}\n`;
        markdown += `    is_main: true\n`;

        // 添加用户上传的图片（如果有）
        if (productData.gallery && productData.gallery.length > 0) {
            productData.gallery.forEach((img, index) => {
                if (!img.is_main) { // 跳过主图，避免重复
                    markdown += `  - image: ${escapeYamlString(img.image)}\n`;
                    markdown += `    alt: ${escapeYamlString(img.alt)}\n`;
                }
            });
        }

        // 添加系列默认副图
        const seriesImages = this.getSeriesImages(productData.series);
        seriesImages.forEach((imgPath, index) => {
            markdown += `  - image: ${escapeYamlString(imgPath)}\n`;
            markdown += `    alt: ${escapeYamlString(productData.title + '副图' + (index + 1))}\n`;
        });

        // 如果副图不够，添加随机图片补充到至少4张副图
        const currentSubImages = (productData.gallery ? productData.gallery.filter(img => !img.is_main).length : 0) + seriesImages.length;
        if (currentSubImages < 4) {
            for (let i = currentSubImages; i < 4; i++) {
                const randomImage = `https://picsum.photos/800/600?random=${Math.floor(Math.random() * 1000)}`;
                markdown += `  - image: ${escapeYamlString(randomImage)}\n`;
                markdown += `    alt: ${escapeYamlString('副图' + (i + 1))}\n`;
            }
        }

        // 参数 - 确保格式正确，包含所有参数以确保8个显示
        if (productData.parameters && productData.parameters.length > 0) {
            markdown += 'parameters:\n';

            // 确保包含模板期望的8个参数名称
            const templateParams = [
                "主机屏幕", "待机时长", "探头直径", "像素",
                "视向", "光源", "导向", "管线材质"
            ];

            // 先添加用户输入的参数
            productData.parameters.forEach(param => {
                markdown += `  - name: ${escapeYamlString(param.name)}\n`;
                markdown += `    value: ${escapeYamlString(param.value)}\n`;
            });

            // 检查是否缺少模板期望的参数，如果缺少则添加默认值
            const existingParamNames = productData.parameters.map(p => p.name);
            templateParams.forEach(paramName => {
                if (!existingParamNames.includes(paramName)) {
                    let defaultValue = "";
                    switch(paramName) {
                        case "主机屏幕": defaultValue = "6英寸"; break;
                        case "待机时长": defaultValue = "8小时"; break;
                        case "探头直径": defaultValue = "1.0mm"; break;
                        case "像素": defaultValue = "16万"; break;
                        case "视向": defaultValue = "直视"; break;
                        case "光源": defaultValue = "光纤光源"; break;
                        case "导向": defaultValue = "无导向"; break;
                        case "管线材质": defaultValue = "合金弹簧软管"; break;
                    }
                    markdown += `  - name: ${escapeYamlString(paramName)}\n`;
                    markdown += `    value: ${escapeYamlString(defaultValue)}\n`;
                }
            });
        }

        // 应用场景 - 转换HTML为Markdown格式，并添加图片
        if (productData.application_scenarios) {
            // 将HTML转换为更简单的Markdown格式
            let scenarios = productData.application_scenarios;

            // 移除HTML标签，保留内容
            scenarios = scenarios.replace(/<[^>]*>/g, '');

            // 处理换行
            scenarios = scenarios.replace(/\n\s*\n/g, '\n\n');
            scenarios = scenarios.trim();

            if (scenarios) {
                // 增强应用场景内容，添加图片和格式
                const enhancedScenarios = this.enhanceApplicationScenarios(scenarios, productData.title);

                markdown += 'application_scenarios: |\n';
                // 每行前面添加两个空格（YAML多行字符串格式）
                const lines = enhancedScenarios.split('\n');
                lines.forEach(line => {
                    markdown += `  ${line}\n`;
                });
            }
        } else {
            // 如果没有应用场景，生成默认的
            const defaultScenarios = this.generateDefaultApplicationScenarios(productData.title, productData.model);
            markdown += 'application_scenarios: |\n';
            const lines = defaultScenarios.split('\n');
            lines.forEach(line => {
                markdown += `  ${line}\n`;
            });
        }

        // 资料下载
        if (productData.data_download && productData.data_download.length > 0) {
            markdown += 'data_download:\n';
            productData.data_download.forEach(download => {
                markdown += `  - file_title: ${escapeYamlString(download.file_title)}\n`;
                markdown += `    file_path: ${escapeYamlString(download.file_path)}\n`;
            });
        }

        // 相关产品
        if (productData.related_products && productData.related_products.length > 0) {
            markdown += 'related_products:\n';
            productData.related_products.forEach(relatedId => {
                markdown += `  - ${escapeYamlString(relatedId)}\n`;
            });
        }

        markdown += '---\n\n';

        // 产品内容 - 这里是 .Content 的内容
        if (productData.content) {
            // 将HTML转换为Markdown
            let content = productData.content;

            // 简单的HTML到Markdown转换
            content = content.replace(/<h([1-6])>/g, (match, level) => '#'.repeat(parseInt(level)) + ' ');
            content = content.replace(/<\/h[1-6]>/g, '\n\n');
            content = content.replace(/<p>/g, '');
            content = content.replace(/<\/p>/g, '\n\n');
            content = content.replace(/<br\s*\/?>/g, '\n');
            content = content.replace(/<strong>/g, '**');
            content = content.replace(/<\/strong>/g, '**');
            content = content.replace(/<em>/g, '*');
            content = content.replace(/<\/em>/g, '*');
            content = content.replace(/<[^>]*>/g, ''); // 移除其他HTML标签

            // 清理多余的换行
            content = content.replace(/\n\s*\n\s*\n/g, '\n\n');
            content = content.trim();

            // 增强内容，添加图片
            const enhancedContent = this.enhanceProductContent(content, productData);
            markdown += enhancedContent;
        } else {
            // 生成默认的详细内容
            const defaultContent = this.generateDefaultProductContent(productData);
            markdown += defaultContent;
        }

        return markdown;
    }

    // 获取系列主图
    getSeriesMainImage(series) {
        switch(series) {
            case 'K系列': return '/images/products/K-series/K-main.jpg';
            case 'P系列': return '/images/products/P-series/P-main.jpg';
            case 'DZ系列': return '/images/products/DZ-series/DZ-main.jpg';
            default: return '/images/products/K-series/K-main.jpg';
        }
    }

    // 获取系列副图
    getSeriesImages(series) {
        switch(series) {
            case 'K系列':
                return [
                    '/images/products/K-series/K-1.jpg',
                    '/images/products/K-series/K-2.jpg',
                    '/images/products/K-series/K-3.jpg'
                ];
            case 'P系列':
                return [
                    '/images/products/P-series/P-1.jpg',
                    '/images/products/P-series/P-2.jpg',
                    '/images/products/P-series/P-3.jpg'
                ];
            case 'DZ系列':
                return [
                    '/images/products/DZ-series/DZ-1.jpg',
                    '/images/products/DZ-series/DZ-2.jpg',
                    '/images/products/DZ-series/DZ-3.jpg'
                ];
            default:
                return [
                    '/images/products/K-series/K-1.jpg',
                    '/images/products/K-series/K-2.jpg',
                    '/images/products/K-series/K-3.jpg'
                ];
        }
    }

    // 增强应用场景内容
    enhanceApplicationScenarios(scenarios, productTitle) {
        let enhanced = `## ${productTitle}应用场景\n\n`;

        // 将用户输入的内容分段
        const paragraphs = scenarios.split('\n\n').filter(p => p.trim());

        paragraphs.forEach((paragraph, index) => {
            enhanced += `### 应用场景${index + 1}\n`;
            enhanced += `${paragraph}\n\n`;

            // 每个场景后添加一张图片
            const randomNum = Math.floor(Math.random() * 1000) + index;
            enhanced += `![应用场景图片](https://picsum.photos/1200/600?random=${randomNum})\n\n`;
        });

        // 添加核心优势部分
        enhanced += `### 核心优势\n`;
        enhanced += `- 高清成像技术，细节清晰可见\n`;
        enhanced += `- 操作简便，快速上手\n`;
        enhanced += `- 结构紧凑，便于携带\n`;
        enhanced += `- 性能稳定，适应各种环境\n\n`;

        return enhanced;
    }

    // 生成默认应用场景
    generateDefaultApplicationScenarios(productTitle, productModel) {
        const randomNum1 = Math.floor(Math.random() * 1000);
        const randomNum2 = Math.floor(Math.random() * 1000) + 100;
        const randomNum3 = Math.floor(Math.random() * 1000) + 200;

        return `## ${productTitle}专业应用解决方案

### 工业检测领域
${productModel} 专为工业检测设计，适用于各种复杂检测环境：
- 管道内部检查和缺陷检测
- 机械设备内部结构观察
- 焊接质量和装配检查

![工业检测应用](https://picsum.photos/1200/600?random=${randomNum1})

### 质量控制应用
在制造业质量控制中发挥重要作用：
- 产品内部结构检验
- 装配过程质量监控
- 缺陷识别和分析

![质量控制应用](https://picsum.photos/1200/600?random=${randomNum2})

### 维护检修场景
为设备维护和检修提供专业支持：
- 设备故障诊断
- 预防性维护检查
- 维修效果验证

![维护检修应用](https://picsum.photos/1200/600?random=${randomNum3})

### 核心优势
- 高清成像技术，细节清晰可见
- 操作简便，快速上手
- 结构紧凑，便于携带
- 性能稳定，适应各种环境`;
    }

    // 增强产品内容
    enhanceProductContent(content, productData) {
        let enhanced = `**${productData.summary}**\n\n`;
        enhanced += content + '\n\n';

        // 添加产品图片展示
        enhanced += `## 产品展示\n\n`;

        // 根据系列添加对应的产品图片
        const seriesImages = this.getSeriesDetailImages(productData.series);
        seriesImages.forEach((imgPath, index) => {
            enhanced += `- ![产品图片](${imgPath})\n`;
        });

        enhanced += '\n';
        return enhanced;
    }

    // 生成默认产品内容
    generateDefaultProductContent(productData) {
        let content = `**${productData.summary}**\n\n`;

        content += `${productData.model} 是一款专业的工业内窥镜设备，具有优异的性能和可靠性。\n\n`;

        content += `## 产品特点\n\n`;
        content += `- 高清成像技术，确保检测精度\n`;
        content += `- 操作简便，快速上手使用\n`;
        content += `- 结构紧凑，便于现场操作\n`;
        content += `- 性能稳定，适应恶劣环境\n\n`;

        content += `## 技术优势\n\n`;
        content += `采用先进的光学技术和图像处理算法，为用户提供清晰、准确的检测结果。设备设计充分考虑工业现场的使用需求，具有良好的防护性能和可靠性。\n\n`;

        content += `## 应用领域\n\n`;
        content += `广泛应用于汽车制造、航空航天、石油化工、电力设备等行业的质量检测和维护检修工作。\n\n`;

        // 添加产品图片展示
        content += `## 产品展示\n\n`;

        // 根据系列添加对应的产品图片
        const seriesImages = this.getSeriesDetailImages(productData.series);
        seriesImages.forEach((imgPath, index) => {
            content += `- ![产品图片](${imgPath})\n`;
        });

        return content;
    }

    // 获取系列详细图片（用于产品详细描述）
    getSeriesDetailImages(series) {
        switch(series) {
            case 'K系列':
                return [
                    '/images/products/K-series/KX-1.jpg',
                    '/images/products/K-series/KX-2.jpg',
                    '/images/products/K-series/KX-3.jpg',
                    '/images/products/K-series/KX-4.jpg',
                    '/images/products/K-series/KX-5.jpg',
                    '/images/products/K-series/KX-6.jpg',
                    '/images/products/K-series/KX-7.jpg',
                    '/images/products/K-series/KX-8.jpg',
                    '/images/products/K-series/KX-9.jpg',
                    '/images/products/K-series/KX-10.jpg'
                ];
            case 'P系列':
                return [
                    '/images/products/P-series/PX-1.jpg',
                    '/images/products/P-series/PX-2.jpg',
                    '/images/products/P-series/PX-3.jpg',
                    '/images/products/P-series/PX-4.jpg',
                    '/images/products/P-series/PX-5.jpg',
                    '/images/products/P-series/PX-6.jpg',
                    '/images/products/P-series/PX-7.jpg',
                    '/images/products/P-series/PX-8.jpg'
                ];
            case 'DZ系列':
                return [
                    '/images/products/DZ-series/DZ-1.jpg',
                    '/images/products/DZ-series/DZ-2.jpg',
                    '/images/products/DZ-series/DZ-3.jpg',
                    '/images/products/DZ-series/DZ-4.jpg',
                    '/images/products/DZ-series/DZ-5.jpg',
                    '/images/products/DZ-series/DZ-6.jpg'
                ];
            default:
                return [
                    '/images/products/K-series/KX-1.jpg',
                    '/images/products/K-series/KX-2.jpg',
                    '/images/products/K-series/KX-3.jpg',
                    '/images/products/K-series/KX-4.jpg',
                    '/images/products/K-series/KX-5.jpg',
                    '/images/products/K-series/KX-6.jpg'
                ];
        }
    }

    // 保存到本地存储（备用方案）
    async saveToLocalStorage(productData) {
        try {
            const markdownContent = this.generateProductMarkdown(productData);
            const savedProducts = JSON.parse(localStorage.getItem('visndt_saved_products') || '{}');
            
            savedProducts[productData.id] = {
                content: markdownContent,
                data: productData,
                timestamp: new Date().toISOString(),
                synced: false
            };
            
            localStorage.setItem('visndt_saved_products', JSON.stringify(savedProducts));
            
            console.log(`产品 ${productData.title} 已保存到本地存储`);
            return { 
                success: true, 
                message: '产品已保存到本地，将在服务器可用时同步',
                local: true 
            };
        } catch (error) {
            console.error('本地保存失败:', error);
            return { 
                success: false, 
                message: '保存失败: ' + error.message 
            };
        }
    }

    // 同步本地数据到服务器
    async syncLocalData() {
        const savedProducts = JSON.parse(localStorage.getItem('visndt_saved_products') || '{}');
        const unsyncedProducts = Object.entries(savedProducts).filter(([id, data]) => !data.synced);
        
        if (unsyncedProducts.length === 0) {
            return { success: true, message: '没有需要同步的数据' };
        }

        let syncedCount = 0;
        for (const [id, productInfo] of unsyncedProducts) {
            try {
                const response = await fetch(`${this.apiEndpoint}/save`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        id: id.replace('.md', ''),
                        content: productInfo.content,
                        action: 'sync'
                    })
                });

                if (response.ok) {
                    savedProducts[id].synced = true;
                    syncedCount++;
                }
            } catch (error) {
                console.error(`同步产品 ${id} 失败:`, error);
            }
        }

        localStorage.setItem('visndt_saved_products', JSON.stringify(savedProducts));
        
        return { 
            success: true, 
            message: `已同步 ${syncedCount}/${unsyncedProducts.length} 个产品` 
        };
    }

    // 获取本地保存的产品列表
    getLocalProducts() {
        const savedProducts = JSON.parse(localStorage.getItem('visndt_saved_products') || '{}');
        return Object.entries(savedProducts).map(([id, data]) => ({
            id: id.replace('.md', ''),
            title: data.data?.title || id,
            timestamp: data.timestamp,
            synced: data.synced || false
        }));
    }

    // 删除产品
    async deleteProduct(productId) {
        try {
            const response = await fetch(`${this.apiEndpoint}/delete`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    id: productId,
                    action: 'delete'
                })
            });

            if (response.ok) {
                // 同时从本地存储中删除
                const savedProducts = JSON.parse(localStorage.getItem('visndt_saved_products') || '{}');
                delete savedProducts[productId + '.md'];
                localStorage.setItem('visndt_saved_products', JSON.stringify(savedProducts));
                
                return { success: true, message: '产品删除成功' };
            } else {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
        } catch (error) {
            console.error('删除产品失败:', error);
            return { success: false, message: '删除失败: ' + error.message };
        }
    }

    // 检查API服务器状态
    async checkServerStatus() {
        try {
            const response = await fetch(`${this.apiEndpoint}/status`, {
                method: 'GET',
                timeout: 5000
            });
            return response.ok;
        } catch (error) {
            return false;
        }
    }
}

// 导出API实例
window.ProductAPI = new ProductAPI();
