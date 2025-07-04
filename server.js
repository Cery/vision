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

// 静态文件服务 - 提供媒体库文件访问
app.use('/media-library', express.static('./media-library'));

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

// 媒体库专用目录 - 指向项目中的特定文件夹
ensureDirectoryExists('./media-library');
ensureDirectoryExists('./media-library/images');
ensureDirectoryExists('./media-library/files');

// 按供应商分组的媒体库目录
const defaultSuppliers = [
    '天津维森科技有限公司',
    '上海尚品科技有限公司',
    '北京华科仪科技股份有限公司',
    'default'
];

defaultSuppliers.forEach(supplier => {
    ensureDirectoryExists(`./media-library/images/${supplier}`);
    ensureDirectoryExists(`./media-library/files/${supplier}`);
});

// 配置multer用于文件上传
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadType = req.body.uploadType || 'products';
        const supplier = req.body.supplier || 'default';
        let uploadPath;

        if (uploadType === 'content') {
            uploadPath = './static/images/content/products';
        } else if (uploadType === 'media') {
            // 媒体库按供应商分组 - 指向专用媒体库目录
            if (file.mimetype.startsWith('image/')) {
                uploadPath = `./media-library/images/${supplier}`;
            } else {
                uploadPath = `./media-library/files/${supplier}`;
            }
        } else if (file.mimetype.startsWith('image/')) {
            uploadPath = './static/images/products';
        } else {
            uploadPath = './static/files/downloads';
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
        fileSize: 50 * 1024 * 1024 // 50MB限制
    },
    fileFilter: function (req, file, cb) {
        // 允许的文件类型
        const allowedTypes = [
            // 图片类型
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
            // 文档类型
            'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
            // 文本类型
            'text/plain', 'text/csv',
            // 压缩文件
            'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
            // 其他常用类型
            'application/octet-stream'
        ];

        if (allowedTypes.includes(file.mimetype) || file.mimetype.startsWith('image/') || file.mimetype.startsWith('text/')) {
            cb(null, true);
        } else {
            console.log(`⚠️ 不支持的文件类型: ${file.mimetype}`);
            cb(null, true); // 暂时允许所有文件类型
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
        const supplier = req.body.supplier || 'default';
        let relativePath;

        if (uploadType === 'content') {
            relativePath = `/images/content/products/${req.file.filename}`;
        } else if (uploadType === 'media') {
            // 媒体库按供应商分组 - 返回媒体库路径
            relativePath = `/media-library/images/${supplier}/${req.file.filename}`;
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
            size: req.file.size,
            type: 'image',
            supplier: supplier
        });
    } catch (error) {
        console.error('图片上传失败:', error);
        res.status(500).json({ success: false, message: '图片上传失败: ' + error.message });
    }
});

// 文件上传接口
app.post('/api/upload/file', upload.single('file'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: '没有上传文件' });
        }

        const uploadType = req.body.uploadType || 'downloads';
        const supplier = req.body.supplier || 'default';
        let relativePath;

        if (uploadType === 'media') {
            // 媒体库按供应商分组 - 返回媒体库路径
            relativePath = `/media-library/files/${supplier}/${req.file.filename}`;
        } else {
            relativePath = `/files/downloads/${req.file.filename}`;
        }

        console.log(`📄 文件上传成功: ${relativePath}`);

        res.json({
            success: true,
            message: '文件上传成功',
            path: relativePath,
            filename: req.file.filename,
            originalName: req.file.originalname,
            size: req.file.size,
            type: 'file',
            supplier: supplier
        });
    } catch (error) {
        console.error('文件上传失败:', error);
        res.status(500).json({ success: false, message: '文件上传失败: ' + error.message });
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

// 获取媒体库列表接口
app.get('/api/media/list', (req, res) => {
    try {
        const mediaLibrary = [];
        const imagesPath = './media-library/images';
        const filesPath = './media-library/files';

        console.log('📂 扫描媒体库目录...');

        // 扫描图片媒体库
        if (fs.existsSync(imagesPath)) {
            const suppliers = fs.readdirSync(imagesPath);
            suppliers.forEach(supplier => {
                const supplierPath = path.join(imagesPath, supplier);
                if (fs.statSync(supplierPath).isDirectory()) {
                    const files = fs.readdirSync(supplierPath);
                    files.forEach(file => {
                        const filePath = path.join(supplierPath, file);
                        const stats = fs.statSync(filePath);
                        mediaLibrary.push({
                            id: `img-${supplier}-${file}`,
                            name: file,
                            type: 'image',
                            supplier: supplier,
                            path: `/media-library/images/${supplier}/${file}`,
                            size: stats.size,
                            uploadDate: stats.mtime.toISOString().split('T')[0]
                        });
                    });
                }
            });
        }

        // 扫描文件媒体库
        if (fs.existsSync(filesPath)) {
            const suppliers = fs.readdirSync(filesPath);
            suppliers.forEach(supplier => {
                const supplierPath = path.join(filesPath, supplier);
                if (fs.statSync(supplierPath).isDirectory()) {
                    const files = fs.readdirSync(supplierPath);
                    files.forEach(file => {
                        const filePath = path.join(supplierPath, file);
                        const stats = fs.statSync(filePath);
                        mediaLibrary.push({
                            id: `file-${supplier}-${file}`,
                            name: file,
                            type: 'file',
                            supplier: supplier,
                            path: `/media-library/files/${supplier}/${file}`,
                            size: stats.size,
                            uploadDate: stats.mtime.toISOString().split('T')[0]
                        });
                    });
                }
            });
        }

        console.log(`✅ 媒体库扫描完成，共找到 ${mediaLibrary.length} 个文件`);
        res.json({ success: true, media: mediaLibrary });
    } catch (error) {
        console.error('获取媒体库列表失败:', error);
        res.status(500).json({ success: false, message: '获取媒体库列表失败: ' + error.message });
    }
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 文件服务器启动成功: http://localhost:${PORT}`);
    console.log(`📁 静态文件目录: ./static/images/`);
    console.log(`📝 产品文件目录: ./content/products/`);
    console.log(`🗂️ 媒体库目录: ./static/images/media/ 和 ./static/files/media/`);
});

module.exports = app;
