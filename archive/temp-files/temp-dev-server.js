#!/usr/bin/env node

/**
 * 临时开发服务器
 * 在Hugo不可用时提供基本的静态文件服务
 */

const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 1313;

// 静态文件服务
app.use('/images', express.static(path.join(__dirname, 'static/images')));
app.use('/css', express.static(path.join(__dirname, 'static/css')));
app.use('/js', express.static(path.join(__dirname, 'static/js')));
app.use('/admin', express.static(path.join(__dirname, 'static/admin')));

// 基本的HTML页面
app.get('/', (req, res) => {
    res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>维森视觉检测仪器 - 开发环境</title>
    <style>
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            max-width: 1200px; 
            margin: 0 auto; 
            padding: 20px;
            background: #f5f5f5;
        }
        .container { 
            background: white; 
            padding: 30px; 
            border-radius: 10px; 
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        .header { 
            text-align: center; 
            margin-bottom: 40px;
            border-bottom: 2px solid #007acc;
            padding-bottom: 20px;
        }
        .status { 
            background: #e8f4fd; 
            padding: 15px; 
            border-radius: 5px; 
            margin: 20px 0;
            border-left: 4px solid #007acc;
        }
        .success { background: #d4edda; border-left-color: #28a745; }
        .warning { background: #fff3cd; border-left-color: #ffc107; }
        .error { background: #f8d7da; border-left-color: #dc3545; }
        .grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); 
            gap: 20px; 
            margin: 30px 0;
        }
        .card { 
            background: #f8f9fa; 
            padding: 20px; 
            border-radius: 8px; 
            border: 1px solid #dee2e6;
        }
        .card h3 { margin-top: 0; color: #007acc; }
        .btn { 
            display: inline-block; 
            padding: 10px 20px; 
            background: #007acc; 
            color: white; 
            text-decoration: none; 
            border-radius: 5px; 
            margin: 5px;
        }
        .btn:hover { background: #0056b3; }
        .btn-secondary { background: #6c757d; }
        .btn-secondary:hover { background: #545b62; }
        .feature-list { list-style: none; padding: 0; }
        .feature-list li { 
            padding: 8px 0; 
            border-bottom: 1px solid #eee;
        }
        .feature-list li:before { 
            content: "✅ "; 
            margin-right: 8px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔬 维森视觉检测仪器</h1>
            <p>专业的视觉检测设备信息与资讯发布平台</p>
        </div>

        <div class="status warning">
            <h3>⚠️ 临时开发环境</h3>
            <p>Hugo 暂时不可用，正在使用临时开发服务器。请重启 VS Code 后使用完整功能。</p>
        </div>

        <div class="grid">
            <div class="card">
                <h3>🖼️ 图片处理功能</h3>
                <ul class="feature-list">
                    <li>图片验证 - 已测试通过</li>
                    <li>占位符生成 - 可用</li>
                    <li>图片优化 - 可用</li>
                    <li>路径管理 - 可用</li>
                </ul>
                <a href="/admin/unified-image-manager.html" class="btn">图片管理器</a>
            </div>

            <div class="card">
                <h3>⚙️ 管理功能</h3>
                <ul class="feature-list">
                    <li>内容管理系统</li>
                    <li>产品管理</li>
                    <li>新闻管理</li>
                    <li>案例管理</li>
                </ul>
                <a href="/admin/" class="btn">CMS 管理后台</a>
            </div>

            <div class="card">
                <h3>🔧 开发工具</h3>
                <ul class="feature-list">
                    <li>环境检查脚本</li>
                    <li>图片处理脚本</li>
                    <li>编码修复工具</li>
                    <li>部署配置</li>
                </ul>
                <a href="#" class="btn btn-secondary">开发文档</a>
            </div>

            <div class="card">
                <h3>📊 项目状态</h3>
                <ul class="feature-list">
                    <li>Node.js - 已安装</li>
                    <li>Git - 已安装</li>
                    <li>依赖包 - 已安装</li>
                    <li>Hugo - 需要重启</li>
                </ul>
            </div>
        </div>

        <div class="status success">
            <h3>✅ 可用功能</h3>
            <p>图片处理、内容管理、产品服务器等核心功能都已可用。</p>
        </div>

        <div style="text-align: center; margin-top: 40px;">
            <a href="http://localhost:3002" class="btn">产品服务器 (端口 3002)</a>
            <a href="/admin/" class="btn">CMS 管理</a>
            <a href="/images/placeholders/" class="btn btn-secondary">查看占位符</a>
        </div>
    </div>
</body>
</html>
    `);
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 临时开发服务器启动成功！`);
    console.log(`📍 访问地址: http://localhost:${PORT}`);
    console.log(`🔧 这是一个临时服务器，请重启 VS Code 后使用完整的 Hugo 功能`);
    console.log(`\n可用功能:`);
    console.log(`  • 图片管理: http://localhost:${PORT}/admin/`);
    console.log(`  • 静态资源: http://localhost:${PORT}/images/`);
    console.log(`  • 占位符图片: http://localhost:${PORT}/images/placeholders/`);
});

module.exports = app;
