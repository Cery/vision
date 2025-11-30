/**
 * DeepSeek API 集成
 * 为编辑器提供真实的AI智能创作功能
 */

class DeepSeekAPI {
    constructor(config = {}) {
        // API配置
        this.apiKey = config.apiKey || this.getApiKeyFromStorage();
        this.baseURL = config.baseURL || 'https://api.deepseek.com/v1';
        this.model = config.model || 'deepseek-chat';
        this.maxTokens = config.maxTokens || 2000;
        this.temperature = config.temperature || 0.7;

        // 请求配置
        this.timeout = config.timeout || 30000;
        this.retryCount = config.retryCount || 3;
        this.retryDelay = config.retryDelay || 1000;

        // 模拟模式配置
        this.simulationMode = config.simulationMode || false;
        this.enableFallback = config.enableFallback !== false; // 默认启用回退
    }

    /**
     * 从本地存储获取API密钥
     */
    getApiKeyFromStorage() {
        // 如果本地存储中没有密钥，使用预设密钥
        const storedKey = localStorage.getItem('deepseek_api_key');
        if (storedKey) {
            return storedKey;
        }

        // 预设的API密钥
        const defaultKey = 'sk-d7f6cc85dc9846a3bd88e67692d56816';
        if (defaultKey) {
            // 自动保存到本地存储
            localStorage.setItem('deepseek_api_key', defaultKey);
            return defaultKey;
        }

        return '';
    }

    /**
     * 设置API密钥
     */
    setApiKey(apiKey) {
        this.apiKey = apiKey;
        localStorage.setItem('deepseek_api_key', apiKey);
    }

    /**
     * 检查API密钥是否配置
     */
    isConfigured() {
        return !!this.apiKey && this.apiKey.trim().length > 0;
    }

    /**
     * 发送API请求
     */
    async request(messages, options = {}) {
        // 如果启用模拟模式，直接返回模拟响应
        if (this.simulationMode) {
            return await this.simulateRequest(messages, options);
        }

        if (!this.isConfigured()) {
            if (this.enableFallback) {
                console.warn('API密钥未配置，使用模拟模式');
                return await this.simulateRequest(messages, options);
            }
            throw new Error('请先配置DeepSeek API密钥');
        }

        const requestBody = {
            model: options.model || this.model,
            messages: messages,
            max_tokens: options.maxTokens || this.maxTokens,
            temperature: options.temperature || this.temperature,
            stream: false
        };

        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.apiKey}`
            },
            body: JSON.stringify(requestBody),
            signal: AbortSignal.timeout(this.timeout)
        };

        let lastError;
        for (let attempt = 1; attempt <= this.retryCount; attempt++) {
            try {
                const response = await fetch(`${this.baseURL}/chat/completions`, requestOptions);

                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    const errorMessage = `API请求失败 (${response.status}): ${errorData.error?.message || response.statusText}`;

                    // 如果是余额不足或其他API错误，且启用回退，则使用模拟模式
                    if (this.enableFallback && (response.status === 402 || response.status === 429 || response.status >= 500)) {
                        console.warn(`API请求失败，使用模拟模式: ${errorMessage}`);
                        return await this.simulateRequest(messages, options);
                    }

                    throw new Error(errorMessage);
                }

                const data = await response.json();

                if (!data.choices || data.choices.length === 0) {
                    throw new Error('API返回数据格式错误');
                }

                return {
                    success: true,
                    content: data.choices[0].message.content,
                    usage: data.usage,
                    model: data.model,
                    isSimulated: false
                };

            } catch (error) {
                lastError = error;
                console.warn(`API请求失败 (尝试 ${attempt}/${this.retryCount}):`, error.message);

                if (attempt < this.retryCount) {
                    await new Promise(resolve => setTimeout(resolve, this.retryDelay * attempt));
                }
            }
        }

        // 如果所有重试都失败，且启用回退，则使用模拟模式
        if (this.enableFallback) {
            console.warn('API请求完全失败，使用模拟模式');
            return await this.simulateRequest(messages, options);
        }

        return {
            success: false,
            error: lastError.message || '未知错误'
        };
    }

    /**
     * 模拟API请求
     */
    async simulateRequest(messages, options = {}) {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

        const userMessage = messages[messages.length - 1]?.content || '';
        const systemMessage = messages.find(m => m.role === 'system')?.content || '';

        // 根据消息内容生成相应的模拟响应
        let simulatedContent = this.generateSimulatedResponse(userMessage, systemMessage);

        return {
            success: true,
            content: simulatedContent,
            usage: { total_tokens: 500, prompt_tokens: 100, completion_tokens: 400 },
            model: 'deepseek-chat-simulated',
            isSimulated: true
        };
    }

    /**
     * 生成模拟响应
     */
    generateSimulatedResponse(userMessage, systemMessage) {
        const lowerMessage = userMessage.toLowerCase();

        // 连接测试
        if (lowerMessage.includes('连接成功') || lowerMessage.includes('测试')) {
            return '连接成功！模拟模式正常工作。';
        }

        // 展会信息生成
        if (lowerMessage.includes('展会') || lowerMessage.includes('exhibition')) {
            return this.generateExhibitionSimulation(userMessage);
        }

        // 技术文章生成
        if (systemMessage.includes('技术专家') || lowerMessage.includes('技术')) {
            return this.generateTechArticleSimulation(userMessage);
        }

        // 行业资讯生成
        if (systemMessage.includes('分析师') || lowerMessage.includes('资讯')) {
            return this.generateNewsSimulation(userMessage);
        }

        // 应用案例生成
        if (lowerMessage.includes('案例') || lowerMessage.includes('应用')) {
            return this.generateCaseStudySimulation(userMessage);
        }

        // 默认响应
        return '这是一个模拟响应。由于DeepSeek API暂时不可用（可能是余额不足），系统自动使用了模拟模式。请充值DeepSeek账户以使用真实的AI功能。';
    }

    /**
     * 生成展会信息内容
     */
    async generateExhibitionContent(keywords, industry, options = {}) {
        const prompt = `请根据以下信息生成一个专业的展会信息：

关键词：${keywords}
行业：${industry}

请生成包含以下信息的展会内容：
1. 展会名称（专业且吸引人）
2. 展会简介（100-150字）
3. 展会日期（2025年的合理日期）
4. 展会地点（符合行业特点的城市和场馆）
5. 主办单位（专业的行业组织）
6. 展会规模（展览面积、参展商数量、观众数量）
7. 展品范围（5-8个主要类别，每个类别包含具体产品）
8. 往届参展商（8-10个知名企业）

请以JSON格式返回，字段名使用英文，内容使用中文。确保信息专业、真实、符合行业特点。`;

        const messages = [
            {
                role: 'system',
                content: '你是一个专业的展会策划专家，擅长生成各行业的展会信息。请确保生成的内容专业、准确、符合行业标准。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const result = await this.request(messages, options);
        
        if (result.success) {
            try {
                // 尝试解析JSON
                const jsonMatch = result.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    return {
                        success: true,
                        data: parsedData
                    };
                } else {
                    throw new Error('无法解析返回的JSON数据');
                }
            } catch (parseError) {
                return {
                    success: false,
                    error: '解析AI返回数据失败: ' + parseError.message,
                    rawContent: result.content
                };
            }
        }

        return result;
    }

    /**
     * 生成技术文章内容
     */
    async generateTechArticle(topic, difficulty, options = {}) {
        const difficultyMap = {
            'beginner': '入门级',
            'intermediate': '中级',
            'advanced': '高级'
        };

        const prompt = `请写一篇关于"${topic}"的技术文章，难度等级：${difficultyMap[difficulty] || '中级'}。

文章要求：
1. 标题要专业且吸引人
2. 文章长度：1500-2000字
3. 结构清晰，包含：引言、主要内容（3-4个章节）、技术要点、应用案例、总结
4. 内容要专业准确，适合${difficultyMap[difficulty] || '中级'}读者
5. 包含实际应用场景和案例
6. 语言简洁明了，逻辑清晰

请以Markdown格式返回文章内容。`;

        const messages = [
            {
                role: 'system',
                content: '你是一个资深的技术专家和技术写作者，擅长将复杂的技术概念用清晰易懂的方式表达出来。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        return await this.request(messages, options);
    }

    /**
     * 生成行业资讯内容
     */
    async generateIndustryNews(topic, industry, options = {}) {
        const prompt = `请写一篇关于"${topic}"的${industry}行业资讯文章。

文章要求：
1. 新闻标题要吸引人且专业
2. 文章长度：800-1200字
3. 结构：导语、正文（2-3个段落）、行业影响分析、未来展望
4. 内容要客观、准确、有新闻价值
5. 包含具体的数据、案例或专家观点
6. 语言新闻化，简洁有力

请以Markdown格式返回文章内容。`;

        const messages = [
            {
                role: 'system',
                content: '你是一个专业的行业分析师和新闻记者，对各个行业的发展趋势有深入了解。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        return await this.request(messages, options);
    }

    /**
     * 生成应用案例内容
     */
    async generateCaseStudy(industry, application, options = {}) {
        const prompt = `请写一个${industry}行业的${application}应用案例。

案例要求：
1. 案例标题要专业且具体
2. 包含：项目背景、面临挑战、解决方案、实施过程、效果评估
3. 内容要真实可信，符合行业实际情况
4. 包含具体的技术参数、实施数据、效果指标
5. 长度：1000-1500字
6. 突出技术优势和实际价值

请以JSON格式返回，包含案例的各个字段信息。`;

        const messages = [
            {
                role: 'system',
                content: '你是一个经验丰富的项目经理和技术顾问，擅长分析和总结各种技术应用案例。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        const result = await this.request(messages, options);
        
        if (result.success) {
            try {
                const jsonMatch = result.content.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsedData = JSON.parse(jsonMatch[0]);
                    return {
                        success: true,
                        data: parsedData
                    };
                } else {
                    throw new Error('无法解析返回的JSON数据');
                }
            } catch (parseError) {
                return {
                    success: false,
                    error: '解析AI返回数据失败: ' + parseError.message,
                    rawContent: result.content
                };
            }
        }

        return result;
    }

    /**
     * 从网页URL提取内容
     */
    async extractContentFromUrl(url, extractMode = 'smart') {
        // 注意：这个功能需要后端支持，因为浏览器无法直接抓取跨域网页
        // 这里提供一个模拟实现，实际应该调用后端API
        
        const prompt = `请根据这个URL：${url} 生成相应的内容。

提取模式：${extractMode}
- smart: 智能提取关键信息
- full: 完整内容提取
- basic: 基本信息提取

请生成符合URL主题的专业内容，格式要规范，信息要准确。`;

        const messages = [
            {
                role: 'system',
                content: '你是一个专业的内容分析师，能够根据URL和上下文生成相关的专业内容。'
            },
            {
                role: 'user',
                content: prompt
            }
        ];

        return await this.request(messages, options);
    }

    /**
     * 测试API连接
     */
    async testConnection() {
        const messages = [
            {
                role: 'user',
                content: '请回复"连接成功"来测试API是否正常工作。'
            }
        ];

        return await this.request(messages, { maxTokens: 50 });
    }

    /**
     * 生成展会信息模拟数据
     */
    generateExhibitionSimulation(userMessage) {
        const keywords = this.extractKeywords(userMessage);
        const year = new Date().getFullYear() + 1;

        return JSON.stringify({
            title: `${year}年中国国际${keywords}展览会`,
            summary: `${year}年度最具影响力的${keywords}行业盛会，汇聚全球领先企业和前沿技术，为行业发展注入新动力。`,
            event_date: `${year}年11月15日-18日`,
            location: "上海",
            detailed_location: "上海国家会展中心",
            organizer: "中国机械工业联合会",
            exhibition_industry: keywords,
            exhibition_area: "50000平方米",
            exhibitor_count: "500+",
            visitor_count: "30000+",
            exhibition_scope: [
                {
                    category: "检测设备",
                    items: ["工业内窥镜", "超声波检测仪", "磁粉探伤仪", "涡流检测设备"]
                },
                {
                    category: "成像技术",
                    items: ["高清摄像头", "图像处理软件", "3D成像系统", "AI识别技术"]
                }
            ],
            previous_exhibitors: [
                { name: "奥林巴斯", category: "检测设备" },
                { name: "GE检测", category: "工业检测" },
                { name: "韦林科技", category: "内窥镜设备" },
                { name: "海克斯康", category: "测量技术" }
            ],
            contact_phone: "021-12345678",
            contact_email: "info@exhibition.com",
            contact_website: "www.exhibition.com",
            registration_deadline: `${year}年10月31日`,
            seo_title: `${year}年${keywords}展览会 - 行业领先展会`,
            seo_description: `参加${year}年${keywords}展览会，了解最新技术趋势，拓展商业机会。`,
            seo_keywords: `${keywords}, 展览会, ${year}, 工业检测`
        }, null, 2);
    }

    /**
     * 从用户消息中提取关键词
     */
    extractKeywords(message) {
        const keywords = ['工业内窥镜', '无损检测', '图像处理', '智能检测', '质量控制'];

        for (const keyword of keywords) {
            if (message.includes(keyword)) {
                return keyword;
            }
        }

        return '工业检测';
    }

    /**
     * 设置模拟模式
     */
    setSimulationMode(enabled) {
        this.simulationMode = enabled;
    }

    /**
     * 设置回退模式
     */
    setFallbackMode(enabled) {
        this.enableFallback = enabled;
    }
}

// 导出为全局变量
window.DeepSeekAPI = DeepSeekAPI;
