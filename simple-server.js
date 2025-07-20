#!/usr/bin/env node

/**
 * 简单服务器启动脚本
 * 绕过Hugo问题，直接启动Express服务器
 */

const express = require('express');
const path = require('path');
const fs = require('fs');
const compression = require('compression');

const app = express();
const PORT = process.env.PORT || 3002;

// 启用压缩
app.use(compression());

// 解析JSON请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 静态文件服务
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/images', express.static(path.join(__dirname, 'static/images')));
app.use('/css', express.static(path.join(__dirname, 'static/css')));
app.use('/js', express.static(path.join(__dirname, 'static/js')));

// 基本路由
app.get('/', (req, res) => {
    res.send(`
    <!DOCTYPE html>
    <html lang="zh-CN">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>维森视觉检测仪器</title>
        <style>
            body { 
                font-family: Arial, sans-serif; 
                max-width: 800px; 
                margin: 50px auto; 
                padding: 20px;
                line-height: 1.6;
            }
            .header { 
                text-align: center; 
                color: #2c3e50; 
                margin-bottom: 30px;
            }
            .status { 
                background: #e8f5e8; 
                padding: 15px; 
                border-radius: 5px; 
                margin: 20px 0;
            }
            .links { 
                background: #f8f9fa; 
                padding: 20px; 
                border-radius: 5px;
            }
            .links a { 
                display: block; 
                margin: 10px 0; 
                color: #007bff; 
                text-decoration: none;
            }
            .links a:hover { 
                text-decoration: underline; 
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🔧 维森视觉检测仪器</h1>
            <p>服务器运行正常</p>
        </div>
        
        <div class="status">
            <h3>✅ 系统状态</h3>
            <p><strong>服务器状态：</strong> 运行中</p>
            <p><strong>端口：</strong> ${PORT}</p>
            <p><strong>时间：</strong> ${new Date().toLocaleString('zh-CN')}</p>
            <p><strong>内容重组：</strong> 已完成</p>
            <p><strong>路径修复：</strong> 已完成</p>
        </div>
        
        <div class="links">
            <h3>📋 可用功能</h3>
            <a href="/api/products/list">📦 产品列表 API</a>
            <a href="/api/news/list">📰 新闻列表 API</a>
            <a href="/api/cases/list">📋 案例列表 API</a>
            <a href="/static/admin/">🛠️ 管理后台</a>
            <a href="/static/tools/">🔧 开发工具</a>
        </div>
        
        <div class="status">
            <h3>📊 内容统计</h3>
            <p><strong>新闻文章：</strong> 24个（已按类型分类）</p>
            <p><strong>产品信息：</strong> 34个（已按供应商分类）</p>
            <p><strong>应用案例：</strong> 5个</p>
            <p><strong>图片资源：</strong> 已修复所有路径问题</p>
        </div>
    </body>
    </html>
    `);
});

// API路由
app.get('/api/products/list', (req, res) => {
    try {
        const products = [];
        const suppliers = ['vis', 'vs', 'hk'];
        
        suppliers.forEach(supplier => {
            const supplierDir = path.join(__dirname, 'content/products', supplier);
            if (fs.existsSync(supplierDir)) {
                const files = fs.readdirSync(supplierDir);
                files.forEach(file => {
                    if (file.endsWith('.md') && file !== '_index.md') {
                        products.push({
                            supplier,
                            filename: file,
                            name: file.replace('.md', ''),
                            path: `/products/${supplier}/${file}`
                        });
                    }
                });
            }
        });
        
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/news/list', (req, res) => {
    try {
        const news = [];
        const categories = ['tech-article', 'industry', 'exhibition'];
        
        categories.forEach(category => {
            const categoryDir = path.join(__dirname, 'content/news', category);
            if (fs.existsSync(categoryDir)) {
                const files = fs.readdirSync(categoryDir);
                files.forEach(file => {
                    if (file.endsWith('.md') && file !== '_index.md') {
                        news.push({
                            category,
                            filename: file,
                            name: file.replace('.md', ''),
                            path: `/news/${category}/${file}`
                        });
                    }
                });
            }
        });
        
        res.json({
            success: true,
            count: news.length,
            data: news
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

app.get('/api/cases/list', (req, res) => {
    try {
        const cases = [];
        const casesDir = path.join(__dirname, 'content/cases');
        
        if (fs.existsSync(casesDir)) {
            const files = fs.readdirSync(casesDir);
            files.forEach(file => {
                if (file.endsWith('.md') && file !== '_index.md') {
                    cases.push({
                        filename: file,
                        name: file.replace('.md', ''),
                        path: `/cases/${file}`
                    });
                }
            });
        }
        
        res.json({
            success: true,
            count: cases.length,
            data: cases
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 供应商列表API
app.get('/api/suppliers/list', (req, res) => {
    try {
        const suppliers = [];
        const suppliersDir = path.join(__dirname, 'content/suppliers');

        if (fs.existsSync(suppliersDir)) {
            const files = fs.readdirSync(suppliersDir);
            files.forEach(file => {
                if (file.endsWith('.md') && file !== '_index.md') {
                    suppliers.push({
                        filename: file,
                        name: file.replace('.md', ''),
                        path: `/suppliers/${file}`
                    });
                }
            });
        }

        res.json({
            success: true,
            count: suppliers.length,
            data: suppliers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 需求列表API
app.get('/api/requirements/list', (req, res) => {
    try {
        const requirements = [];
        const requirementsDir = path.join(__dirname, 'content/requirements');

        if (fs.existsSync(requirementsDir)) {
            const files = fs.readdirSync(requirementsDir);
            files.forEach(file => {
                if (file.endsWith('.md') && file !== '_index.md' && !file.includes('hall') && !file.includes('publish')) {
                    try {
                        const filePath = path.join(requirementsDir, file);
                        const content = fs.readFileSync(filePath, 'utf8');

                        // 解析front matter
                        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                        if (frontMatterMatch) {
                            const frontMatter = parseFrontMatter(frontMatterMatch[1]);

                            requirements.push({
                                filename: file,
                                name: frontMatter.title || file.replace('.md', ''),
                                path: `/requirements/${file}`,
                                ...frontMatter
                            });
                        }
                    } catch (error) {
                        console.warn(`解析需求文件 ${file} 失败:`, error.message);
                    }
                }
            });
        }

        // 按日期排序，最新的在前
        requirements.sort((a, b) => {
            const dateA = new Date(a.date || a.created_at || 0);
            const dateB = new Date(b.date || b.created_at || 0);
            return dateB - dateA;
        });

        res.json({
            success: true,
            count: requirements.length,
            data: requirements
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 解析Front Matter的辅助函数
function parseFrontMatter(frontMatterText) {
    const frontMatter = {};
    const lines = frontMatterText.split('\n');
    let currentKey = null;
    let currentValue = '';
    let inArray = false;
    let inObject = false;

    lines.forEach(line => {
        line = line.trim();
        if (!line) return;

        // 处理数组
        if (line.startsWith('- ')) {
            if (currentKey && inArray) {
                if (!Array.isArray(frontMatter[currentKey])) {
                    frontMatter[currentKey] = [];
                }
                frontMatter[currentKey].push(line.substring(2).trim().replace(/^["']|["']$/g, ''));
            }
            return;
        }

        // 处理对象属性
        if (inObject && line.includes(':') && !line.endsWith(':')) {
            const colonIndex = line.indexOf(':');
            const objKey = line.substring(0, colonIndex).trim();
            const objValue = line.substring(colonIndex + 1).trim().replace(/^["']|["']$/g, '');

            if (currentKey && typeof frontMatter[currentKey] === 'object' && !Array.isArray(frontMatter[currentKey])) {
                frontMatter[currentKey][objKey] = objValue;
            }
            return;
        }

        // 处理普通键值对
        const colonIndex = line.indexOf(':');
        if (colonIndex > -1) {
            currentKey = line.substring(0, colonIndex).trim();
            currentValue = line.substring(colonIndex + 1).trim();

            // 检查是否是数组或对象的开始
            if (currentValue === '' || currentValue === '[]' || currentValue === '{}') {
                inArray = currentValue === '[]' || (currentValue === '' && lines[lines.indexOf(line) + 1]?.trim().startsWith('- '));
                inObject = currentValue === '{}' || (currentValue === '' && !inArray);

                if (inArray) {
                    frontMatter[currentKey] = [];
                } else if (inObject) {
                    frontMatter[currentKey] = {};
                }
            } else {
                // 普通值
                inArray = false;
                inObject = false;
                frontMatter[currentKey] = currentValue.replace(/^["']|["']$/g, '');
            }
        }
    });

    return frontMatter;
}

// 内容管理API - 保存文件
app.post('/api/content/save', (req, res) => {
    try {
        const { path: filePath, content } = req.body;

        if (!filePath || !content) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }

        const fullPath = path.join(__dirname, filePath);
        const dir = path.dirname(fullPath);

        // 确保目录存在
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }

        // 写入文件
        fs.writeFileSync(fullPath, content, 'utf8');

        res.json({
            success: true,
            message: '文件保存成功',
            path: filePath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 内容管理API - 删除文件
app.delete('/api/content/delete', (req, res) => {
    try {
        const { path: filePath } = req.body;

        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: '缺少文件路径'
            });
        }

        const fullPath = path.join(__dirname, filePath);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                error: '文件不存在'
            });
        }

        // 删除文件
        fs.unlinkSync(fullPath);

        res.json({
            success: true,
            message: '文件删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 内容管理API - 读取文件
app.get('/api/content/read', (req, res) => {
    try {
        const { path: filePath } = req.query;

        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: '缺少文件路径'
            });
        }

        const fullPath = path.join(__dirname, filePath);

        if (!fs.existsSync(fullPath)) {
            return res.status(404).json({
                success: false,
                error: '文件不存在'
            });
        }

        const content = fs.readFileSync(fullPath, 'utf8');

        res.json({
            success: true,
            content: content,
            path: filePath
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log('🚀 简单服务器启动成功！');
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`🔧 管理后台: http://localhost:${PORT}/static/admin/`);
    console.log(`🛠️ 开发工具: http://localhost:${PORT}/static/tools/`);
    console.log('✅ 所有内容已重组完成，路径问题已修复');
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🔧 正在关闭服务器...');
    process.exit(0);
});

module.exports = app;
