const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3001;

// 中间件
app.use(cors({
    origin: ['http://localhost:1313', 'http://127.0.0.1:1313'],
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.static('static'));

// 配置multer用于文件上传
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB限制
    },
    fileFilter: (req, file, cb) => {
        // 允许的文件类型
        const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt|zip|rar/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('不支持的文件类型'));
        }
    }
});

// 确保目录存在
async function ensureDirectoryExists(dirPath) {
    try {
        await fs.access(dirPath);
    } catch (error) {
        await fs.mkdir(dirPath, { recursive: true });
        console.log(`📁 创建目录: ${dirPath}`);
    }
}

// 保存Markdown文件的API
app.post('/api/save-markdown', async (req, res) => {
    try {
        const { fileName, content, contentType, path: filePath } = req.body;
        
        console.log(`📝 接收到保存请求: ${fileName}`);
        
        if (!fileName || !content || !contentType) {
            return res.status(400).json({
                success: false,
                error: '缺少必要参数'
            });
        }

        // 构建完整的文件路径 - 确保使用项目根目录
        const projectRoot = path.resolve(process.cwd(), '..');
        const fullPath = path.join(projectRoot, 'content', contentType, fileName);
        const dirPath = path.dirname(fullPath);

        console.log(`📂 项目根目录: ${projectRoot}`);
        console.log(`📁 目标路径: ${fullPath}`);

        // 安全检查：确保路径在项目目录内
        const normalizedProjectRoot = path.normalize(projectRoot);
        const normalizedFullPath = path.normalize(fullPath);
        if (!normalizedFullPath.startsWith(normalizedProjectRoot)) {
            throw new Error('安全错误：不允许访问项目目录外的文件');
        }
        
        // 确保目录存在
        await ensureDirectoryExists(dirPath);
        
        // 写入文件
        await fs.writeFile(fullPath, content, 'utf8');
        
        console.log(`✅ 文件已保存: ${fullPath}`);
        
        res.json({
            success: true,
            message: `文件已保存到 content/${contentType}/${fileName}`,
            path: fullPath
        });
        
    } catch (error) {
        console.error('❌ 保存文件失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取已保存的文件列表
app.get('/api/saved-files/:contentType', async (req, res) => {
    try {
        const { contentType } = req.params;
        const dirPath = path.join(process.cwd(), 'content', contentType);
        
        try {
            const files = await fs.readdir(dirPath);
            const markdownFiles = files.filter(file => file.endsWith('.md'));
            
            const fileList = await Promise.all(
                markdownFiles.map(async (file) => {
                    const filePath = path.join(dirPath, file);
                    const stats = await fs.stat(filePath);
                    return {
                        name: file,
                        path: `content/${contentType}/${file}`,
                        size: stats.size,
                        modified: stats.mtime
                    };
                })
            );
            
            res.json({
                success: true,
                files: fileList
            });
            
        } catch (error) {
            res.json({
                success: true,
                files: []
            });
        }
        
    } catch (error) {
        console.error('获取文件列表失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 删除文件
app.delete('/api/delete-file', async (req, res) => {
    try {
        const { filePath } = req.body;
        
        if (!filePath) {
            return res.status(400).json({
                success: false,
                error: '缺少文件路径'
            });
        }
        
        const fullPath = path.join(process.cwd(), filePath);
        await fs.unlink(fullPath);
        
        console.log(`🗑️ 文件已删除: ${fullPath}`);
        
        res.json({
            success: true,
            message: '文件已删除'
        });
        
    } catch (error) {
        console.error('删除文件失败:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 图片上传端点
app.post('/api/upload-image', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const { category = 'products' } = req.body;
        const projectRoot = path.resolve(process.cwd(), '..');

        // 创建图片保存目录
        const imageDir = path.join(projectRoot, 'static', 'images', category);
        await ensureDirectoryExists(imageDir);

        // 生成安全的文件名
        const fileExtension = path.extname(req.file.originalname);
        const baseName = path.basename(req.file.originalname, fileExtension)
            .toLowerCase()
            .replace(/[^a-z0-9\-]/g, '-')
            .replace(/-+/g, '-');
        const fileName = `${baseName}-${Date.now()}${fileExtension}`;

        // 保存文件
        const filePath = path.join(imageDir, fileName);
        await fs.writeFile(filePath, req.file.buffer);

        // 返回相对路径
        const relativePath = `/images/${category}/${fileName}`;

        console.log(`✅ 图片已保存: ${relativePath}`);

        res.json({
            success: true,
            message: '图片上传成功',
            path: relativePath,
            fileName: fileName,
            originalName: req.file.originalname,
            size: req.file.size
        });

    } catch (error) {
        console.error('图片上传失败:', error);
        res.status(500).json({
            success: false,
            message: '图片上传失败: ' + error.message
        });
    }
});

// 文件上传端点
app.post('/api/upload-file', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '没有上传文件'
            });
        }

        const { category = 'products' } = req.body;
        const projectRoot = path.resolve(process.cwd(), '..');

        // 创建文件保存目录
        const fileDir = path.join(projectRoot, 'static', 'uploads', category);
        await ensureDirectoryExists(fileDir);

        // 生成安全的文件名
        const fileExtension = path.extname(req.file.originalname);
        const baseName = path.basename(req.file.originalname, fileExtension)
            .toLowerCase()
            .replace(/[^a-z0-9\-]/g, '-')
            .replace(/-+/g, '-');
        const fileName = `${baseName}-${Date.now()}${fileExtension}`;

        // 保存文件
        const filePath = path.join(fileDir, fileName);
        await fs.writeFile(filePath, req.file.buffer);

        // 返回相对路径
        const relativePath = `/uploads/${category}/${fileName}`;

        console.log(`✅ 文件已保存: ${relativePath}`);

        res.json({
            success: true,
            message: '文件上传成功',
            path: relativePath,
            fileName: fileName,
            originalName: req.file.originalname,
            size: req.file.size
        });

    } catch (error) {
        console.error('文件上传失败:', error);
        res.status(500).json({
            success: false,
            message: '文件上传失败: ' + error.message
        });
    }
});

// 健康检查
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Markdown服务器运行正常',
        timestamp: new Date().toISOString()
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 Markdown文件服务器已启动`);
    console.log(`📍 地址: http://localhost:${PORT}`);
    console.log(`📝 API端点:`);
    console.log(`   POST /api/save-markdown - 保存MD文件`);
    console.log(`   GET  /api/saved-files/:contentType - 获取文件列表`);
    console.log(`   DELETE /api/delete-file - 删除文件`);
    console.log(`   GET  /api/health - 健康检查`);
    console.log(`\n💡 使用方法:`);
    console.log(`   1. 确保此服务器在后台运行`);
    console.log(`   2. 在内容管理系统中添加产品`);
    console.log(`   3. MD文件将自动保存到 content/products/ 目录`);
});

// 优雅关闭
process.on('SIGINT', () => {
    console.log('\n🛑 正在关闭Markdown服务器...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🛑 正在关闭Markdown服务器...');
    process.exit(0);
});
