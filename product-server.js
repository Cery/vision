// 产品管理服务器 - 处理产品数据的保存和同步
const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3002;

// 中间件
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('static'));

// 内容文件目录
const PRODUCTS_DIR = path.join(__dirname, 'content', 'products');
const NEWS_DIR = path.join(__dirname, 'content', 'news');
const CASES_DIR = path.join(__dirname, 'content', 'cases');
const APPLICATIONS_DIR = path.join(__dirname, 'content', 'applications');
const CATEGORIES_DIR = path.join(__dirname, 'content', 'product_categories');
const UPLOADS_DIR = path.join(__dirname, 'static', 'uploads');

// 配置文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(UPLOADS_DIR, 'products');
        fs.mkdir(uploadPath, { recursive: true }).then(() => {
            cb(null, uploadPath);
        }).catch(err => {
            cb(err);
        });
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const ext = path.extname(file.originalname);
        let name = path.basename(file.originalname, ext);

        // 处理中文文件名，转换为安全的ASCII字符
        name = name
            .replace(/[^\w\s-]/g, '') // 移除特殊字符
            .replace(/\s+/g, '_')     // 空格替换为下划线
            .toLowerCase();           // 转为小写

        // 如果处理后名称为空，使用默认名称
        if (!name) {
            name = 'file';
        }

        cb(null, `${timestamp}_${name}${ext}`);
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB限制
    },
    fileFilter: function (req, file, cb) {
        // 允许的文件类型
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/zip',
            'application/x-rar-compressed',
            'image/jpeg',
            'image/png',
            'image/gif'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('不支持的文件类型'), false);
        }
    }
});

// 确保目录存在
async function ensureProductsDir() {
    try {
        await fs.access(PRODUCTS_DIR);
    } catch (error) {
        await fs.mkdir(PRODUCTS_DIR, { recursive: true });
        console.log('创建产品目录:', PRODUCTS_DIR);
    }
}

async function ensureUploadsDir() {
    try {
        await fs.access(UPLOADS_DIR);
    } catch (error) {
        await fs.mkdir(UPLOADS_DIR, { recursive: true });
        console.log('创建上传目录:', UPLOADS_DIR);
    }
}

// API路由

// 检查服务器状态
app.get('/api/products/status', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: '产品管理服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 文件上传
app.post('/api/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const filePath = `/uploads/products/${req.file.filename}`;

        console.log(`文件上传成功: ${req.file.originalname} -> ${filePath}`);

        res.json({
            success: true,
            message: '文件上传成功',
            filePath: filePath,
            fileName: req.file.originalname,
            fileSize: req.file.size,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('文件上传失败:', error);
        res.status(500).json({
            success: false,
            message: '文件上传失败: ' + error.message
        });
    }
});

// 保存产品
app.post('/api/products/save', async (req, res) => {
    try {
        const { id, content, action } = req.body;
        
        if (!id || !content) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数: id 和 content' 
            });
        }

        // 确保产品目录存在
        await ensureProductsDir();

        // 生成文件路径
        const fileName = `${id}.md`;
        const filePath = path.join(PRODUCTS_DIR, fileName);

        // 写入文件
        await fs.writeFile(filePath, content, 'utf8');

        console.log(`${action === 'sync' ? '同步' : '保存'}产品文件: ${fileName}`);

        res.json({ 
            success: true, 
            message: `产品 ${id} ${action === 'sync' ? '同步' : '保存'}成功`,
            filePath: `content/products/${fileName}`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('保存产品失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '保存产品失败: ' + error.message 
        });
    }
});

// 删除产品
app.post('/api/products/delete', async (req, res) => {
    try {
        const { id } = req.body;
        
        if (!id) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数: id' 
            });
        }

        const fileName = `${id}.md`;
        const filePath = path.join(PRODUCTS_DIR, fileName);

        // 检查文件是否存在
        try {
            await fs.access(filePath);
        } catch (error) {
            return res.status(404).json({ 
                success: false, 
                message: '产品文件不存在' 
            });
        }

        // 删除文件
        await fs.unlink(filePath);

        console.log(`删除产品文件: ${fileName}`);

        res.json({ 
            success: true, 
            message: `产品 ${id} 删除成功`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('删除产品失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '删除产品失败: ' + error.message 
        });
    }
});

// 获取产品列表
app.get('/api/products/list', async (req, res) => {
    try {
        await ensureProductsDir();
        
        const files = await fs.readdir(PRODUCTS_DIR);
        const productFiles = files.filter(file => file.endsWith('.md'));
        
        const products = [];
        for (const file of productFiles) {
            try {
                const filePath = path.join(PRODUCTS_DIR, file);
                const stats = await fs.stat(filePath);
                const content = await fs.readFile(filePath, 'utf8');
                
                // 提取标题
                const titleMatch = content.match(/title:\s*"([^"]+)"/);
                const title = titleMatch ? titleMatch[1] : file.replace('.md', '');
                
                products.push({
                    id: file.replace('.md', ''),
                    title: title,
                    fileName: file,
                    lastModified: stats.mtime.toISOString(),
                    size: stats.size
                });
            } catch (error) {
                console.error(`读取产品文件 ${file} 失败:`, error);
            }
        }

        res.json({ 
            success: true, 
            products: products,
            count: products.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('获取产品列表失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '获取产品列表失败: ' + error.message 
        });
    }
});

// 获取单个产品
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const fileName = `${id}.md`;
        const filePath = path.join(PRODUCTS_DIR, fileName);

        const content = await fs.readFile(filePath, 'utf8');
        const stats = await fs.stat(filePath);

        res.json({ 
            success: true, 
            product: {
                id: id,
                content: content,
                lastModified: stats.mtime.toISOString(),
                size: stats.size
            },
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        if (error.code === 'ENOENT') {
            res.status(404).json({ 
                success: false, 
                message: '产品不存在' 
            });
        } else {
            console.error('获取产品失败:', error);
            res.status(500).json({ 
                success: false, 
                message: '获取产品失败: ' + error.message 
            });
        }
    }
});

// 同步产品分类到前台
app.post('/api/categories/sync', async (req, res) => {
    try {
        const { categories } = req.body;

        if (!categories || !Array.isArray(categories)) {
            return res.status(400).json({
                success: false,
                message: '缺少分类数据'
            });
        }

        // 确保分类目录存在
        const categoriesDir = path.join(__dirname, 'content', 'product_categories');
        await fs.mkdir(categoriesDir, { recursive: true });

        // 清理现有分类文件
        try {
            const existingFiles = await fs.readdir(categoriesDir);
            for (const file of existingFiles) {
                if (file.endsWith('.md')) {
                    await fs.unlink(path.join(categoriesDir, file));
                }
            }
        } catch (error) {
            console.log('清理现有分类文件时出错:', error.message);
        }

        // 生成新的分类文件
        let createdCount = 0;
        for (const category of categories) {
            try {
                const categoryContent = generateCategoryMarkdown(category);
                const fileName = `${category.id}.md`;
                const filePath = path.join(categoriesDir, fileName);

                await fs.writeFile(filePath, categoryContent, 'utf8');
                createdCount++;

                console.log(`创建分类文件: ${fileName}`);
            } catch (error) {
                console.error(`创建分类 ${category.id} 失败:`, error);
            }
        }

        res.json({
            success: true,
            message: `成功同步 ${createdCount} 个产品分类`,
            categoriesCreated: createdCount,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('同步产品分类失败:', error);
        res.status(500).json({
            success: false,
            message: '同步产品分类失败: ' + error.message
        });
    }
});

// 生成分类Markdown内容
function generateCategoryMarkdown(category) {
    let markdown = '---\n';
    markdown += `title: "${category.title}"\n`;
    markdown += `description: "${category.description || category.title + '产品分类'}"\n`;

    if (category.parent) {
        markdown += `parent: "${category.parent}"\n`;
    }

    if (category.icon) {
        markdown += `icon: "${category.icon}"\n`;
    }

    if (category.subcategories && category.subcategories.length > 0) {
        markdown += 'subcategories:\n';
        category.subcategories.forEach(sub => {
            markdown += `  - id: "${sub.id}"\n`;
            markdown += `    title: "${sub.title}"\n`;
            if (sub.description) {
                markdown += `    description: "${sub.description}"\n`;
            }
        });
    }

    markdown += `weight: ${category.weight || 10}\n`;
    markdown += `type: "product_categories"\n`;
    markdown += '---\n\n';

    markdown += `# ${category.title}\n\n`;
    markdown += `${category.description || category.title + '产品分类页面'}\n`;

    return markdown;
}

// ==================== 新闻管理 API ====================

// 保存新闻
app.post('/api/news/save', async (req, res) => {
    try {
        const newsData = req.body;

        if (!newsData.title || !newsData.content) {
            return res.status(400).json({
                success: false,
                message: '缺少必要字段：标题和内容'
            });
        }

        await ensureNewsDir();

        // 生成文件名
        const fileName = newsData.id ? `${newsData.id}.md` : `${Date.now()}.md`;
        const filePath = path.join(NEWS_DIR, fileName);

        // 生成新闻Markdown内容
        const newsContent = generateNewsMarkdown(newsData);

        await fs.writeFile(filePath, newsContent, 'utf8');

        console.log(`新闻保存成功: ${fileName}`);

        res.json({
            success: true,
            message: '新闻保存成功',
            fileName: fileName,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('保存新闻失败:', error);
        res.status(500).json({
            success: false,
            message: '保存新闻失败: ' + error.message
        });
    }
});

// 获取新闻列表
app.get('/api/news/list', async (req, res) => {
    try {
        await ensureNewsDir();

        const files = await fs.readdir(NEWS_DIR);
        const newsFiles = files.filter(file => file.endsWith('.md'));

        const newsList = [];
        for (const file of newsFiles) {
            try {
                const filePath = path.join(NEWS_DIR, file);
                const content = await fs.readFile(filePath, 'utf8');
                const newsData = parseMarkdownFile(content);

                newsList.push({
                    id: path.basename(file, '.md'),
                    fileName: file,
                    ...newsData.frontMatter,
                    contentPreview: newsData.content.substring(0, 200) + '...'
                });
            } catch (error) {
                console.error(`读取新闻文件 ${file} 失败:`, error);
            }
        }

        // 按发布时间排序
        newsList.sort((a, b) => new Date(b.published || b.date) - new Date(a.published || a.date));

        res.json({
            success: true,
            news: newsList,
            total: newsList.length
        });

    } catch (error) {
        console.error('获取新闻列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取新闻列表失败: ' + error.message
        });
    }
});

// 获取单个新闻
app.get('/api/news/:id', async (req, res) => {
    try {
        const newsId = req.params.id;
        const filePath = path.join(NEWS_DIR, `${newsId}.md`);

        const content = await fs.readFile(filePath, 'utf8');
        const newsData = parseMarkdownFile(content);

        res.json({
            success: true,
            news: {
                id: newsId,
                ...newsData.frontMatter,
                content: newsData.content
            }
        });

    } catch (error) {
        console.error('获取新闻失败:', error);
        res.status(500).json({
            success: false,
            message: '获取新闻失败: ' + error.message
        });
    }
});

// 删除新闻
app.post('/api/news/delete', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: '缺少新闻ID'
            });
        }

        const filePath = path.join(NEWS_DIR, `${id}.md`);
        await fs.unlink(filePath);

        console.log(`新闻删除成功: ${id}`);

        res.json({
            success: true,
            message: '新闻删除成功'
        });

    } catch (error) {
        console.error('删除新闻失败:', error);
        res.status(500).json({
            success: false,
            message: '删除新闻失败: ' + error.message
        });
    }
});

// 生成新闻Markdown内容
function generateNewsMarkdown(newsData) {
    let markdown = '---\n';
    markdown += `title: "${newsData.title}"\n`;
    markdown += `summary: "${newsData.summary || newsData.title}"\n`;
    markdown += `date: ${newsData.date || new Date().toISOString()}\n`;
    markdown += `published: ${newsData.published || new Date().toISOString()}\n`;

    if (newsData.featured_image) {
        markdown += `featured_image: "${newsData.featured_image}"\n`;
    }

    if (newsData.categories && newsData.categories.length > 0) {
        markdown += 'categories:\n';
        newsData.categories.forEach(cat => {
            markdown += `  - "${cat}"\n`;
        });
    }

    if (newsData.tags && newsData.tags.length > 0) {
        markdown += 'tags:\n';
        newsData.tags.forEach(tag => {
            markdown += `  - "${tag}"\n`;
        });
    }

    markdown += `author: "${newsData.author || 'VisNDT'}"\n`;
    markdown += `views: ${newsData.views || 0}\n`;
    markdown += `type: "news"\n`;
    markdown += '---\n\n';

    markdown += newsData.content || `# ${newsData.title}\n\n${newsData.summary || ''}`;

    return markdown;
}

// 确保新闻目录存在
async function ensureNewsDir() {
    try {
        await fs.access(NEWS_DIR);
    } catch (error) {
        await fs.mkdir(NEWS_DIR, { recursive: true });
        console.log('创建新闻目录:', NEWS_DIR);
    }
}

// ==================== 案例管理 API ====================

// 保存案例
app.post('/api/cases/save', async (req, res) => {
    try {
        const caseData = req.body;

        if (!caseData.title || !caseData.content) {
            return res.status(400).json({
                success: false,
                message: '缺少必要字段：标题和内容'
            });
        }

        await ensureCasesDir();

        // 生成文件名
        const fileName = caseData.id ? `${caseData.id}.md` : `${Date.now()}.md`;
        const filePath = path.join(CASES_DIR, fileName);

        // 生成案例Markdown内容
        const caseContent = generateCaseMarkdown(caseData);

        await fs.writeFile(filePath, caseContent, 'utf8');

        console.log(`案例保存成功: ${fileName}`);

        res.json({
            success: true,
            message: '案例保存成功',
            fileName: fileName,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('保存案例失败:', error);
        res.status(500).json({
            success: false,
            message: '保存案例失败: ' + error.message
        });
    }
});

// 获取案例列表
app.get('/api/cases/list', async (req, res) => {
    try {
        await ensureCasesDir();

        const files = await fs.readdir(CASES_DIR);
        const caseFiles = files.filter(file => file.endsWith('.md'));

        const casesList = [];
        for (const file of caseFiles) {
            try {
                const filePath = path.join(CASES_DIR, file);
                const content = await fs.readFile(filePath, 'utf8');
                const caseData = parseMarkdownFile(content);

                casesList.push({
                    id: path.basename(file, '.md'),
                    fileName: file,
                    ...caseData.frontMatter,
                    contentPreview: caseData.content.substring(0, 200) + '...'
                });
            } catch (error) {
                console.error(`读取案例文件 ${file} 失败:`, error);
            }
        }

        // 按发布时间排序
        casesList.sort((a, b) => new Date(b.published || b.date) - new Date(a.published || a.date));

        res.json({
            success: true,
            cases: casesList,
            total: casesList.length
        });

    } catch (error) {
        console.error('获取案例列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取案例列表失败: ' + error.message
        });
    }
});

// 删除案例
app.post('/api/cases/delete', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: '缺少案例ID'
            });
        }

        const filePath = path.join(CASES_DIR, `${id}.md`);
        await fs.unlink(filePath);

        console.log(`案例删除成功: ${id}`);

        res.json({
            success: true,
            message: '案例删除成功'
        });

    } catch (error) {
        console.error('删除案例失败:', error);
        res.status(500).json({
            success: false,
            message: '删除案例失败: ' + error.message
        });
    }
});

// 生成案例Markdown内容
function generateCaseMarkdown(caseData) {
    let markdown = '---\n';
    markdown += `title: "${caseData.title}"\n`;
    markdown += `summary: "${caseData.summary || caseData.title}"\n`;
    markdown += `date: ${caseData.date || new Date().toISOString()}\n`;
    markdown += `published: ${caseData.published || new Date().toISOString()}\n`;

    if (caseData.featured_image) {
        markdown += `featured_image: "${caseData.featured_image}"\n`;
    }

    if (caseData.client) {
        markdown += `client: "${caseData.client}"\n`;
    }

    if (caseData.industry) {
        markdown += `industry: "${caseData.industry}"\n`;
    }

    if (caseData.application_field) {
        markdown += `application_field: "${caseData.application_field}"\n`;
    }

    if (caseData.products_used && caseData.products_used.length > 0) {
        markdown += 'products_used:\n';
        caseData.products_used.forEach(product => {
            markdown += `  - "${product}"\n`;
        });
    }

    if (caseData.tags && caseData.tags.length > 0) {
        markdown += 'tags:\n';
        caseData.tags.forEach(tag => {
            markdown += `  - "${tag}"\n`;
        });
    }

    markdown += `views: ${caseData.views || 0}\n`;
    markdown += `type: "cases"\n`;
    markdown += '---\n\n';

    markdown += caseData.content || `# ${caseData.title}\n\n${caseData.summary || ''}`;

    return markdown;
}

// 确保案例目录存在
async function ensureCasesDir() {
    try {
        await fs.access(CASES_DIR);
    } catch (error) {
        await fs.mkdir(CASES_DIR, { recursive: true });
        console.log('创建案例目录:', CASES_DIR);
    }
}

// ==================== 应用领域管理 API ====================

// 保存应用领域
app.post('/api/applications/save', async (req, res) => {
    try {
        const appData = req.body;

        if (!appData.title || !appData.content) {
            return res.status(400).json({
                success: false,
                message: '缺少必要字段：标题和内容'
            });
        }

        await ensureApplicationsDir();

        // 生成文件名
        const fileName = appData.id ? `${appData.id}.md` : `${Date.now()}.md`;
        const filePath = path.join(APPLICATIONS_DIR, fileName);

        // 生成应用领域Markdown内容
        const appContent = generateApplicationMarkdown(appData);

        await fs.writeFile(filePath, appContent, 'utf8');

        console.log(`应用领域保存成功: ${fileName}`);

        res.json({
            success: true,
            message: '应用领域保存成功',
            fileName: fileName,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('保存应用领域失败:', error);
        res.status(500).json({
            success: false,
            message: '保存应用领域失败: ' + error.message
        });
    }
});

// 获取应用领域列表
app.get('/api/applications/list', async (req, res) => {
    try {
        await ensureApplicationsDir();

        const files = await fs.readdir(APPLICATIONS_DIR);
        const appFiles = files.filter(file => file.endsWith('.md'));

        const appsList = [];
        for (const file of appFiles) {
            try {
                const filePath = path.join(APPLICATIONS_DIR, file);
                const content = await fs.readFile(filePath, 'utf8');
                const appData = parseMarkdownFile(content);

                appsList.push({
                    id: path.basename(file, '.md'),
                    fileName: file,
                    ...appData.frontMatter,
                    contentPreview: appData.content.substring(0, 200) + '...'
                });
            } catch (error) {
                console.error(`读取应用领域文件 ${file} 失败:`, error);
            }
        }

        // 按权重排序
        appsList.sort((a, b) => (a.weight || 999) - (b.weight || 999));

        res.json({
            success: true,
            applications: appsList,
            total: appsList.length
        });

    } catch (error) {
        console.error('获取应用领域列表失败:', error);
        res.status(500).json({
            success: false,
            message: '获取应用领域列表失败: ' + error.message
        });
    }
});

// 删除应用领域
app.post('/api/applications/delete', async (req, res) => {
    try {
        const { id } = req.body;

        if (!id) {
            return res.status(400).json({
                success: false,
                message: '缺少应用领域ID'
            });
        }

        const filePath = path.join(APPLICATIONS_DIR, `${id}.md`);
        await fs.unlink(filePath);

        console.log(`应用领域删除成功: ${id}`);

        res.json({
            success: true,
            message: '应用领域删除成功'
        });

    } catch (error) {
        console.error('删除应用领域失败:', error);
        res.status(500).json({
            success: false,
            message: '删除应用领域失败: ' + error.message
        });
    }
});

// 生成应用领域Markdown内容
function generateApplicationMarkdown(appData) {
    let markdown = '---\n';
    markdown += `title: "${appData.title}"\n`;
    markdown += `summary: "${appData.summary || appData.title}"\n`;
    markdown += `weight: ${appData.weight || 10}\n`;

    if (appData.icon) {
        markdown += `icon: "${appData.icon}"\n`;
    }

    if (appData.featured_image) {
        markdown += `featured_image: "${appData.featured_image}"\n`;
    }

    if (appData.industry_tags && appData.industry_tags.length > 0) {
        markdown += 'industry_tags:\n';
        appData.industry_tags.forEach(tag => {
            markdown += `  - "${tag}"\n`;
        });
    }

    if (appData.related_products && appData.related_products.length > 0) {
        markdown += 'related_products:\n';
        appData.related_products.forEach(product => {
            markdown += `  - "${product}"\n`;
        });
    }

    markdown += `type: "applications"\n`;
    markdown += '---\n\n';

    markdown += appData.content || `# ${appData.title}\n\n${appData.summary || ''}`;

    return markdown;
}

// 确保应用领域目录存在
async function ensureApplicationsDir() {
    try {
        await fs.access(APPLICATIONS_DIR);
    } catch (error) {
        await fs.mkdir(APPLICATIONS_DIR, { recursive: true });
        console.log('创建应用领域目录:', APPLICATIONS_DIR);
    }
}

// 批量操作
app.post('/api/products/batch', async (req, res) => {
    try {
        const { action, products } = req.body;
        
        if (!action || !Array.isArray(products)) {
            return res.status(400).json({ 
                success: false, 
                message: '缺少必要参数: action 和 products' 
            });
        }

        const results = [];
        
        for (const product of products) {
            try {
                if (action === 'save') {
                    const fileName = `${product.id}.md`;
                    const filePath = path.join(PRODUCTS_DIR, fileName);
                    await fs.writeFile(filePath, product.content, 'utf8');
                    results.push({ id: product.id, success: true });
                } else if (action === 'delete') {
                    const fileName = `${product.id}.md`;
                    const filePath = path.join(PRODUCTS_DIR, fileName);
                    await fs.unlink(filePath);
                    results.push({ id: product.id, success: true });
                }
            } catch (error) {
                results.push({ 
                    id: product.id, 
                    success: false, 
                    error: error.message 
                });
            }
        }

        const successCount = results.filter(r => r.success).length;
        
        res.json({ 
            success: true, 
            message: `批量${action === 'save' ? '保存' : '删除'}完成: ${successCount}/${products.length}`,
            results: results,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('批量操作失败:', error);
        res.status(500).json({ 
            success: false, 
            message: '批量操作失败: ' + error.message 
        });
    }
});

// 错误处理中间件
app.use((error, req, res, next) => {
    console.error('服务器错误:', error);
    res.status(500).json({ 
        success: false, 
        message: '服务器内部错误' 
    });
});

// 启动服务器
// 解析Markdown文件
function parseMarkdownFile(content) {
    const frontMatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontMatterRegex);

    if (!match) {
        return {
            frontMatter: {},
            content: content
        };
    }

    const frontMatterText = match[1];
    const markdownContent = match[2];

    // 简单的YAML解析
    const frontMatter = {};
    const lines = frontMatterText.split('\n');

    for (const line of lines) {
        const trimmedLine = line.trim();
        if (!trimmedLine || trimmedLine.startsWith('#')) continue;

        if (trimmedLine.includes(':')) {
            const [key, ...valueParts] = trimmedLine.split(':');
            const value = valueParts.join(':').trim();

            if (value.startsWith('"') && value.endsWith('"')) {
                frontMatter[key.trim()] = value.slice(1, -1);
            } else if (value.startsWith('[') && value.endsWith(']')) {
                // 简单数组解析
                const arrayContent = value.slice(1, -1);
                frontMatter[key.trim()] = arrayContent.split(',').map(item => item.trim().replace(/"/g, ''));
            } else if (!isNaN(value)) {
                frontMatter[key.trim()] = Number(value);
            } else if (value === 'true' || value === 'false') {
                frontMatter[key.trim()] = value === 'true';
            } else {
                frontMatter[key.trim()] = value;
            }
        }
    }

    return {
        frontMatter,
        content: markdownContent.trim()
    };
}

async function startServer() {
    try {
        await ensureProductsDir();
        await ensureUploadsDir();
        await ensureNewsDir();
        await ensureCasesDir();
        await ensureApplicationsDir();
        
        app.listen(PORT, () => {
            console.log(`产品管理服务器启动成功！`);
            console.log(`服务器地址: http://localhost:${PORT}`);
            console.log(`API端点: http://localhost:${PORT}/api/products`);
            console.log(`产品目录: ${PRODUCTS_DIR}`);
            console.log('---');
            console.log('可用的API端点:');
            console.log('  GET  /api/products/status   - 检查服务器状态');
            console.log('  POST /api/products/save     - 保存产品');
            console.log('  POST /api/products/delete   - 删除产品');
            console.log('  GET  /api/products/list     - 获取产品列表');
            console.log('  GET  /api/products/:id      - 获取单个产品');
            console.log('  POST /api/products/batch    - 批量操作');
        });
    } catch (error) {
        console.error('启动服务器失败:', error);
        process.exit(1);
    }
}

startServer();
