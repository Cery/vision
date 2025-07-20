const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const compression = require('compression');

const app = express();
const PORT = process.env.SERVER_PORT || 3002;

// 内存缓存
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5分钟缓存

// 缓存辅助函数
const getCacheKey = (type, params) => `${type}:${JSON.stringify(params)}`;
const setCache = (key, data) => {
    cache.set(key, {
        data,
        timestamp: Date.now()
    });
};
const getCache = (key) => {
    const cached = cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
        return cached.data;
    }
    cache.delete(key);
    return null;
};

// 定期清理过期缓存
setInterval(() => {
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            cache.delete(key);
        }
    }
}, 60000); // 每分钟清理一次

// 性能优化中间件
app.use(compression()); // 启用gzip压缩

// 启用CORS
app.use(cors({
    origin: process.env.NODE_ENV === 'production' ? 'https://visndt.com' : true,
    credentials: true
}));

// 优化请求体大小限制
app.use(express.json({
    limit: '10mb',
    parameterLimit: 1000
}));
app.use(express.urlencoded({
    limit: '10mb',
    extended: true,
    parameterLimit: 1000
}));

// 设置请求超时
app.use((req, res, next) => {
    req.setTimeout(30000); // 30秒超时
    res.setTimeout(30000);
    next();
});

// 静态文件服务 - 提供项目文件访问（带缓存优化）
app.use('/images', express.static('./static/images', {
    maxAge: '1d', // 1天缓存
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
        if (path.endsWith('.jpg') || path.endsWith('.png') || path.endsWith('.gif') || path.endsWith('.webp')) {
            res.setHeader('Cache-Control', 'public, max-age=86400'); // 图片缓存1天
        }
    }
}));
app.use('/uploads', express.static('./static/uploads', {
    maxAge: '1h', // 1小时缓存
    etag: true,
    lastModified: true
}));

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

// Base64图片保存接口（异步优化版）
app.post('/api/upload/base64', async (req, res) => {
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

        // 异步保存文件
        await fs.promises.writeFile(uploadPath, data, 'base64');

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

// 保存MD文件接口（异步优化版）
app.post('/api/products/save', async (req, res) => {
    try {
        const { id, content, filename } = req.body;

        if (!content) {
            return res.status(400).json({ success: false, message: '缺少文件内容' });
        }

        const finalFilename = filename || `${id || 'product'}.md`;
        const filePath = `./content/products/${finalFilename}`;

        // 确保目录存在
        ensureDirectoryExists('./content/products');

        // 异步保存MD文件
        await fs.promises.writeFile(filePath, content, 'utf8');

        // 清除相关缓存
        const cacheKey = getCacheKey('products', {});
        cache.delete(cacheKey);

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

// 获取产品列表接口（缓存优化版）
app.get('/api/products/list', async (req, res) => {
    try {
        const cacheKey = getCacheKey('products', req.query);
        const cached = getCache(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        const productsDir = './content/products';
        if (!fs.existsSync(productsDir)) {
            const result = { success: true, products: [] };
            setCache(cacheKey, result);
            return res.json(result);
        }

        const files = await fs.promises.readdir(productsDir);
        const productFiles = files.filter(file => file.endsWith('.md') && file !== '_index.md');

        const products = await Promise.all(productFiles.map(async (file) => {
            try {
                const filePath = path.join(productsDir, file);
                const content = await fs.promises.readFile(filePath, 'utf8');
                const id = path.basename(file, '.md');

                // 简单解析front matter
                const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
                let frontMatter = {};
                if (frontMatterMatch) {
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
            } catch (error) {
                console.error(`处理产品文件 ${file} 失败:`, error);
                return null;
            }
        }));

        const result = {
            success: true,
            products: products.filter(p => p !== null)
        };

        setCache(cacheKey, result);
        res.json(result);
    } catch (error) {
        console.error('获取产品列表失败:', error);
        res.status(500).json({ success: false, message: '获取产品列表失败: ' + error.message });
    }
});

// 获取媒体库列表接口 - 扫描现有项目文件夹（性能优化版）
app.get('/api/media/list', async (req, res) => {
    try {
        const { category, type, search, supplier } = req.query;
        const cacheKey = getCacheKey('media-list', { category, type, search, supplier });
        const cached = getCache(cacheKey);

        if (cached) {
            return res.json(cached);
        }

        const mediaLibrary = [];
        console.log('📂 扫描项目媒体文件夹...');

        // 定义图片文件夹映射
        const imageFolders = {
            'products': './static/images/products',
            'cases': './static/images/cases',
            'news': './static/images/news',
            'application': './static/images/application',
            'partner': './static/images/partner',
            'supplier': './static/images/supplier',
            'carousel': './static/images/carousel',
            'banners': './static/images/banners'
        };

        // 定义文件文件夹映射
        const fileFolders = {
            'products': './static/uploads/products',
            'documents': './static/uploads/documents',
            'manuals': './static/uploads/manuals',
            'certificates': './static/uploads/certificates'
        };

        // 异步扫描图片文件夹
        await Promise.all(Object.keys(imageFolders).map(async (categoryKey) => {
            const folderPath = imageFolders[categoryKey];
            if (fs.existsSync(folderPath)) {
                await scanFolderAsync(folderPath, categoryKey, 'image', mediaLibrary);
            }
        }));

        // 异步扫描文件文件夹
        await Promise.all(Object.keys(fileFolders).map(async (categoryKey) => {
            const folderPath = fileFolders[categoryKey];
            if (fs.existsSync(folderPath)) {
                await scanFolderAsync(folderPath, categoryKey, 'file', mediaLibrary);
            }
        }));

        // 应用筛选条件
        let filteredMedia = mediaLibrary;

        if (category) {
            filteredMedia = filteredMedia.filter(item => item.category === category);
        }

        if (type) {
            filteredMedia = filteredMedia.filter(item => item.type === type);
        }

        if (supplier) {
            filteredMedia = filteredMedia.filter(item => item.supplier === supplier);
        }

        if (search) {
            const searchLower = search.toLowerCase();
            filteredMedia = filteredMedia.filter(item =>
                item.name.toLowerCase().includes(searchLower)
            );
        }

        const result = {
            success: true,
            media: filteredMedia,
            total: mediaLibrary.length
        };

        setCache(cacheKey, result);
        console.log(`✅ 项目媒体库扫描完成，共找到 ${mediaLibrary.length} 个文件，筛选后 ${filteredMedia.length} 个`);
        res.json(result);
    } catch (error) {
        console.error('获取媒体库列表失败:', error);
        res.status(500).json({ success: false, message: '获取媒体库列表失败: ' + error.message });
    }
});

// 删除媒体文件接口
app.delete('/api/media/:id', (req, res) => {
    try {
        const { id } = req.params;
        console.log(`🗑️ 删除媒体文件: ${id}`);

        // 解析文件ID获取路径信息
        const [type, category, filename] = id.split('-');

        let filePath;
        if (type === 'image') {
            filePath = path.join('./static/images', category, filename);
        } else {
            filePath = path.join('./static/uploads', category, filename);
        }

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`✅ 文件删除成功: ${filePath}`);
            res.json({ success: true, message: '文件删除成功' });
        } else {
            console.log(`❌ 文件不存在: ${filePath}`);
            res.status(404).json({ success: false, message: '文件不存在' });
        }
    } catch (error) {
        console.error('删除媒体文件失败:', error);
        res.status(500).json({ success: false, message: '删除文件失败: ' + error.message });
    }
});

// 重命名媒体文件接口
app.put('/api/media/:id/rename', (req, res) => {
    try {
        const { id } = req.params;
        const { newName } = req.body;

        console.log(`📝 重命名媒体文件: ${id} -> ${newName}`);

        // 解析文件ID获取路径信息
        const [type, category, oldFilename] = id.split('-');

        let oldPath, newPath;
        if (type === 'image') {
            oldPath = path.join('./static/images', category, oldFilename);
            newPath = path.join('./static/images', category, newName);
        } else {
            oldPath = path.join('./static/uploads', category, oldFilename);
            newPath = path.join('./static/uploads', category, newName);
        }

        if (fs.existsSync(oldPath)) {
            if (fs.existsSync(newPath)) {
                return res.status(400).json({ success: false, message: '目标文件名已存在' });
            }

            fs.renameSync(oldPath, newPath);
            console.log(`✅ 文件重命名成功: ${oldPath} -> ${newPath}`);

            const newId = `${type}-${category}-${newName}`;
            res.json({
                success: true,
                message: '文件重命名成功',
                newId: newId,
                newPath: type === 'image' ? `/images/${category}/${newName}` : `/uploads/${category}/${newName}`
            });
        } else {
            console.log(`❌ 源文件不存在: ${oldPath}`);
            res.status(404).json({ success: false, message: '源文件不存在' });
        }
    } catch (error) {
        console.error('重命名媒体文件失败:', error);
        res.status(500).json({ success: false, message: '重命名文件失败: ' + error.message });
    }
});

// 批量删除媒体文件接口
app.delete('/api/media/batch', (req, res) => {
    try {
        const { ids } = req.body;
        console.log(`🗑️ 批量删除媒体文件: ${ids.length} 个文件`);

        const results = [];
        let successCount = 0;

        ids.forEach(id => {
            try {
                const [type, category, filename] = id.split('-');

                let filePath;
                if (type === 'image') {
                    filePath = path.join('./static/images', category, filename);
                } else {
                    filePath = path.join('./static/uploads', category, filename);
                }

                if (fs.existsSync(filePath)) {
                    fs.unlinkSync(filePath);
                    results.push({ id, success: true, message: '删除成功' });
                    successCount++;
                } else {
                    results.push({ id, success: false, message: '文件不存在' });
                }
            } catch (error) {
                results.push({ id, success: false, message: error.message });
            }
        });

        console.log(`✅ 批量删除完成: ${successCount}/${ids.length} 个文件删除成功`);
        res.json({
            success: true,
            message: `批量删除完成: ${successCount}/${ids.length} 个文件删除成功`,
            results: results,
            successCount: successCount,
            totalCount: ids.length
        });
    } catch (error) {
        console.error('批量删除媒体文件失败:', error);
        res.status(500).json({ success: false, message: '批量删除失败: ' + error.message });
    }
});

// 异步扫描文件夹的辅助函数
async function scanFolderAsync(folderPath, category, type, mediaLibrary) {
    try {
        const items = await fs.promises.readdir(folderPath);

        await Promise.all(items.map(async (item) => {
            try {
                const itemPath = path.join(folderPath, item);
                const stats = await fs.promises.stat(itemPath);

                if (stats.isFile()) {
                    // 检查文件类型
                    const ext = path.extname(item).toLowerCase();
                    const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(ext);
                    const isFile = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar', '.7z'].includes(ext);

                    if ((type === 'image' && isImage) || (type === 'file' && (isFile || !isImage))) {
                        const relativePath = type === 'image' ?
                            `/images/${category}/${item}` :
                            `/uploads/${category}/${item}`;

                        mediaLibrary.push({
                            id: `${type}-${category}-${item}`,
                            name: item,
                            type: type,
                            supplier: category,
                            category: category,
                            path: relativePath,
                            size: stats.size,
                            uploadDate: stats.mtime.toISOString().split('T')[0]
                        });
                    }
                } else if (stats.isDirectory()) {
                    // 递归扫描子文件夹
                    const subItems = await fs.promises.readdir(itemPath);

                    await Promise.all(subItems.map(async (subItem) => {
                        try {
                            const subItemPath = path.join(itemPath, subItem);
                            const subStats = await fs.promises.stat(subItemPath);

                            if (subStats.isFile()) {
                                const ext = path.extname(subItem).toLowerCase();
                                const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(ext);
                                const isFile = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar', '.7z'].includes(ext);

                                if ((type === 'image' && isImage) || (type === 'file' && (isFile || !isImage))) {
                                    const relativePath = type === 'image' ?
                                        `/images/${category}/${item}/${subItem}` :
                                        `/uploads/${category}/${item}/${subItem}`;

                                    mediaLibrary.push({
                                        id: `${type}-${category}-${item}-${subItem}`,
                                        name: subItem,
                                        type: type,
                                        supplier: `${category}/${item}`,
                                        category: category,
                                        subfolder: item,
                                        path: relativePath,
                                        size: subStats.size,
                                        uploadDate: subStats.mtime.toISOString().split('T')[0]
                                    });
                                }
                            }
                        } catch (error) {
                            console.error(`处理子文件 ${subItem} 失败:`, error);
                        }
                    }));
                }
            } catch (error) {
                console.error(`处理文件 ${item} 失败:`, error);
            }
        }));
    } catch (error) {
        console.error(`扫描文件夹 ${folderPath} 失败:`, error);
    }
}

// 扫描文件夹的辅助函数（保留同步版本用于兼容）
function scanFolder(folderPath, category, type, mediaLibrary) {
    try {
        const items = fs.readdirSync(folderPath);
        items.forEach(item => {
            const itemPath = path.join(folderPath, item);
            const stats = fs.statSync(itemPath);

            if (stats.isFile()) {
                // 检查文件类型
                const ext = path.extname(item).toLowerCase();
                const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(ext);
                const isFile = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar', '.7z'].includes(ext);

                if ((type === 'image' && isImage) || (type === 'file' && (isFile || !isImage))) {
                    const relativePath = type === 'image' ?
                        `/images/${category}/${item}` :
                        `/uploads/${category}/${item}`;

                    mediaLibrary.push({
                        id: `${type}-${category}-${item}`,
                        name: item,
                        type: type,
                        supplier: category,
                        category: category,
                        path: relativePath,
                        size: stats.size,
                        uploadDate: stats.mtime.toISOString().split('T')[0]
                    });
                }
            } else if (stats.isDirectory()) {
                // 递归扫描子文件夹
                const subFolderPath = itemPath;
                const subItems = fs.readdirSync(subFolderPath);
                subItems.forEach(subItem => {
                    const subItemPath = path.join(subFolderPath, subItem);
                    const subStats = fs.statSync(subItemPath);

                    if (subStats.isFile()) {
                        const ext = path.extname(subItem).toLowerCase();
                        const isImage = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'].includes(ext);
                        const isFile = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.zip', '.rar', '.7z'].includes(ext);

                        if ((type === 'image' && isImage) || (type === 'file' && (isFile || !isImage))) {
                            const relativePath = type === 'image' ?
                                `/images/${category}/${item}/${subItem}` :
                                `/uploads/${category}/${item}/${subItem}`;

                            mediaLibrary.push({
                                id: `${type}-${category}-${item}-${subItem}`,
                                name: subItem,
                                type: type,
                                supplier: `${category}/${item}`,
                                category: category,
                                subfolder: item,
                                path: relativePath,
                                size: subStats.size,
                                uploadDate: subStats.mtime.toISOString().split('T')[0]
                            });
                        }
                    }
                });
            }
        });
    } catch (error) {
        console.error(`扫描文件夹 ${folderPath} 失败:`, error);
    }
}

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 文件服务器启动成功: http://localhost:${PORT}`);
    console.log(`📁 静态文件目录: ./static/images/`);
    console.log(`📝 产品文件目录: ./content/products/`);
    console.log(`🗂️ 媒体库目录: ./static/images/media/ 和 ./static/files/media/`);
});

module.exports = app;
