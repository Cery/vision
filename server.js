const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = 3002;

// 启用CORS
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// 确保必要的目录存在
const ensureDirectoryExists = (dirPath) => {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true });
        console.log(`📁 创建目录: ${dirPath}`);
    }
};

// 初始化必要的目录
ensureDirectoryExists('./static/images/products');
ensureDirectoryExists('./static/images/content/products');
ensureDirectoryExists('./content/products');

// 配置multer用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadType = req.body.uploadType || 'products';
        let uploadPath = './static/images/products';
        
        if (uploadType === 'content') {
            uploadPath = './static/images/content/products';
        }
        
        ensureDirectoryExists(uploadPath);
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        const timestamp = Date.now();
        const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
        const ext = path.extname(originalName);
        const name = path.basename(originalName, ext);
        const filename = `${name}-${timestamp}${ext}`;
        cb(null, filename);
    }
});

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB限制
    },
    fileFilter: function (req, file, cb) {
        // 检查文件类型
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('只允许上传图片文件'), false);
        }
    }
});

// 图片上传接口
app.post('/api/upload/image', upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '没有上传文件' });
        }

        const uploadType = req.body.uploadType || 'products';
        let relativePath;
        
        if (uploadType === 'content') {
            relativePath = `/images/content/products/${req.file.filename}`;
        } else {
            relativePath = `/images/products/${req.file.filename}`;
        }

        console.log(`📷 图片上传成功: ${relativePath}`);
        
        res.json({
            success: true,
            message: '图片上传成功',
            path: relativePath,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size
        });
    } catch (error) {
        console.error('图片上传失败:', error);
        res.status(500).json({ success: false, message: '图片上传失败: ' + error.message });
    }
});

// Base64图片保存接口
app.post('/api/upload/base64', (req, res) => {
    try {
        const { imageData, filename, uploadType = 'products' } = req.body;
        
        if (!imageData || !filename) {
            return res.status(400).json({ success: false, message: '缺少必要参数' });
        }

        // 解析base64数据
        const matches = imageData.match(/^data:image\/([a-zA-Z]+);base64,(.+)$/);
        if (!matches) {
            return res.status(400).json({ success: false, message: '无效的base64图片数据' });
        }

        const ext = matches[1] === 'jpeg' ? 'jpg' : matches[1];
        const data = matches[2];
        const timestamp = Date.now();
        const finalFilename = `${path.basename(filename, path.extname(filename))}-${timestamp}.${ext}`;
        
        let uploadPath, relativePath;
        if (uploadType === 'content') {
            uploadPath = `./static/images/content/products/${finalFilename}`;
            relativePath = `/images/content/products/${finalFilename}`;
        } else {
            uploadPath = `./static/images/products/${finalFilename}`;
            relativePath = `/images/products/${finalFilename}`;
        }

        // 确保目录存在
        ensureDirectoryExists(path.dirname(uploadPath));
        
        // 保存文件
        fs.writeFileSync(uploadPath, data, 'base64');
        
        console.log(`💾 Base64图片保存成功: ${relativePath}`);
        
        res.json({
            success: true,
            message: 'Base64图片保存成功',
            path: relativePath,
            filename: finalFilename
        });
    } catch (error) {
        console.error('Base64图片保存失败:', error);
        res.status(500).json({ success: false, message: 'Base64图片保存失败: ' + error.message });
    }
});

// 保存MD文件接口
app.post('/api/products/save', (req, res) => {
    try {
        const { id, content, filename } = req.body;
        
        if (!content) {
            return res.status(400).json({ success: false, message: '缺少文件内容' });
        }

        const finalFilename = filename || `${id || 'product'}.md`;
        const filePath = `./content/products/${finalFilename}`;
        
        // 确保目录存在
        ensureDirectoryExists('./content/products');
        
        // 保存MD文件
        fs.writeFileSync(filePath, content, 'utf8');
        
        console.log(`📝 MD文件保存成功: ${filePath}`);
        
        res.json({
            success: true,
            message: 'MD文件保存成功',
            path: filePath,
            filename: finalFilename
        });
    } catch (error) {
        console.error('MD文件保存失败:', error);
        res.status(500).json({ success: false, message: 'MD文件保存失败: ' + error.message });
    }
});

// 获取产品列表接口
app.get('/api/products/list', (req, res) => {
    try {
        const productsDir = './content/products';
        if (!fs.existsSync(productsDir)) {
            return res.json({ success: true, products: [] });
        }

        const files = fs.readdirSync(productsDir)
            .filter(file => file.endsWith('.md') && file !== '_index.md')
            .map(file => {
                const filePath = path.join(productsDir, file);
                const content = fs.readFileSync(filePath, 'utf8');
                const id = path.basename(file, '.md');
                
                // 简单解析front matter
                const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                let frontMatter = {};
                if (frontMatterMatch) {
                    // 这里可以添加更复杂的YAML解析
                    const lines = frontMatterMatch[1].split('\n');
                    lines.forEach(line => {
                        const match = line.match(/^(\w+):\s*"?([^"]*)"?$/);
                        if (match) {
                            frontMatter[match[1]] = match[2];
                        }
                    });
                }
                
                return {
                    id,
                    filename: file,
                    title: frontMatter.title || id,
                    model: frontMatter.model || '',
                    summary: frontMatter.summary || '',
                    ...frontMatter
                };
            });

        res.json({ success: true, products: files });
    } catch (error) {
        console.error('获取产品列表失败:', error);
        res.status(500).json({ success: false, message: '获取产品列表失败: ' + error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 文件服务器启动成功: http://localhost:${PORT}`);
    console.log(`📁 静态文件目录: ./static/images/`);
    console.log(`📝 产品文件目录: ./content/products/`);
});

module.exports = app;
