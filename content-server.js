const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 项目根目录
const PROJECT_ROOT = __dirname;
const CONTENT_DIR = path.join(PROJECT_ROOT, 'content');
const STATIC_DIR = path.join(PROJECT_ROOT, 'static');

// 确保目录存在
async function ensureDirectory(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`📁 创建目录: ${dirPath}`);
    }
}

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        message: 'Content server is running',
        timestamp: new Date().toISOString()
    });
});

// 保存Markdown文件
app.post('/api/save-content', async (req, res) => {
    try {
        const { fileName, content, contentType, path: relativePath } = req.body;
        
        if (!fileName || !content || !contentType) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数: fileName, content, contentType'
            });
        }

        // 确保content目录存在
        const targetDir = path.join(CONTENT_DIR, contentType);
        await ensureDirectory(targetDir);

        // 写入文件
        const filePath = path.join(targetDir, fileName);
        await fs.writeFile(filePath, content, 'utf8');

        console.log(`✅ 文件已保存: ${relativePath || filePath}`);

        res.json({
            success: true,
            message: `文件 ${fileName} 保存成功`,
            filePath: relativePath || `content/${contentType}/${fileName}`,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ 保存文件失败:', error);
        res.status(500).json({
            success: false,
            message: `保存文件失败: ${error.message}`
        });
    }
});

// 保存图片文件
app.post('/api/save-image', async (req, res) => {
    try {
        const { fileName, imageData, directory = 'images' } = req.body;
        
        if (!fileName || !imageData) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数: fileName, imageData'
            });
        }

        // 确保images目录存在
        const targetDir = path.join(STATIC_DIR, directory);
        await ensureDirectory(targetDir);

        // 处理base64数据
        let base64Data = imageData;
        if (base64Data.startsWith('data:')) {
            base64Data = base64Data.split(',')[1];
        }

        // 写入文件
        const filePath = path.join(targetDir, fileName);
        await fs.writeFile(filePath, base64Data, 'base64');

        const relativePath = `/${directory}/${fileName}`;
        console.log(`✅ 图片已保存: ${relativePath}`);

        res.json({
            success: true,
            message: `图片 ${fileName} 保存成功`,
            filePath: relativePath,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ 保存图片失败:', error);
        res.status(500).json({
            success: false,
            message: `保存图片失败: ${error.message}`
        });
    }
});

// 保存普通文件
app.post('/api/save-file', async (req, res) => {
    try {
        const { fileName, fileData, directory = 'uploads' } = req.body;

        if (!fileName || !fileData) {
            return res.status(400).json({
                success: false,
                message: '缺少必要参数: fileName, fileData'
            });
        }

        // 确保目录存在
        const targetDir = path.join(STATIC_DIR, directory);
        await ensureDirectory(targetDir);

        // 处理base64数据
        let base64Data = fileData;
        if (base64Data.startsWith('data:')) {
            base64Data = base64Data.split(',')[1];
        }

        // 写入文件
        const filePath = path.join(targetDir, fileName);
        await fs.writeFile(filePath, base64Data, 'base64');

        const relativePath = `/${directory}/${fileName}`;
        console.log(`✅ 文件已保存: ${relativePath}`);

        res.json({
            success: true,
            message: `文件 ${fileName} 保存成功`,
            filePath: relativePath,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ 保存文件失败:', error);
        res.status(500).json({
            success: false,
            message: `保存文件失败: ${error.message}`
        });
    }
});

// 获取目录文件列表
app.get('/api/media/:directory', async (req, res) => {
    try {
        const { directory } = req.params;
        const targetDir = path.join(STATIC_DIR, directory);

        try {
            const files = await fs.readdir(targetDir);
            const fileList = [];

            for (const file of files) {
                const filePath = path.join(targetDir, file);
                const stats = await fs.stat(filePath);
                
                if (stats.isFile()) {
                    const extension = path.extname(file).toLowerCase();
                    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
                    const documentExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar'];
                    
                    if (imageExtensions.includes(extension) || documentExtensions.includes(extension)) {
                        fileList.push({
                            name: file,
                            path: `/${directory}/${file}`,
                            type: imageExtensions.includes(extension) ? 'image' : 'document',
                            size: stats.size,
                            modified: stats.mtime.toISOString()
                        });
                    }
                }
            }

            res.json({
                success: true,
                directory: directory,
                files: fileList,
                count: fileList.length
            });

        } catch (error) {
            if (error.code === 'ENOENT') {
                res.json({
                    success: true,
                    directory: directory,
                    files: [],
                    count: 0,
                    message: '目录不存在'
                });
            } else {
                throw error;
            }
        }

    } catch (error) {
        console.error('❌ 获取文件列表失败:', error);
        res.status(500).json({
            success: false,
            message: `获取文件列表失败: ${error.message}`
        });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Content Server 启动成功`);
    console.log(`📡 服务地址: http://localhost:${PORT}`);
    console.log(`📁 项目根目录: ${PROJECT_ROOT}`);
    console.log(`📝 Content目录: ${CONTENT_DIR}`);
    console.log(`🖼️ Static目录: ${STATIC_DIR}`);
    console.log('');
    console.log('可用的API端点:');
    console.log(`  GET  /api/health - 健康检查`);
    console.log(`  POST /api/save-content - 保存Markdown文件`);
    console.log(`  POST /api/save-image - 保存图片文件`);
    console.log(`  GET  /api/media/:directory - 获取媒体文件列表`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 Content Server 正在关闭...');
    process.exit(0);
});
