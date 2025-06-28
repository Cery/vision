#!/usr/bin/env node

/**
 * 图片优化处理脚本
 * 压缩、转换格式、生成响应式图片
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

// 配置
const config = {
    // 输入目录
    inputDirs: [
        'static/images',
        'static/uploads'
    ],
    
    // 输出目录
    outputDir: 'static/images/optimized',
    
    // 支持的图片格式
    supportedFormats: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
    
    // 响应式图片尺寸
    responsiveSizes: [
        { suffix: '-sm', width: 400 },
        { suffix: '-md', width: 800 },
        { suffix: '-lg', width: 1200 },
        { suffix: '-xl', width: 1600 }
    ],
    
    // 优化设置
    optimization: {
        quality: 85,
        progressive: true,
        webp: true,
        avif: false // 可选，更新的格式
    },
    
    // 排除文件
    exclude: [
        '**/node_modules/**',
        '**/placeholders/**',
        '**/*.svg' // SVG单独处理
    ]
};

/**
 * 获取所有图片文件
 */
async function getImageFiles() {
    const files = [];
    
    for (const dir of config.inputDirs) {
        try {
            const patterns = config.supportedFormats.map(ext => 
                path.join(dir, '**', `*${ext}`)
            );
            
            for (const pattern of patterns) {
                const matches = glob.sync(pattern, { 
                    ignore: config.exclude,
                    nodir: true 
                });
                files.push(...matches);
            }
        } catch (error) {
            console.warn(`警告: 无法扫描目录 ${dir}:`, error.message);
        }
    }
    
    return [...new Set(files)];
}

/**
 * 分析图片信息
 */
async function analyzeImage(filePath) {
    try {
        const stats = await fs.stat(filePath);
        const ext = path.extname(filePath).toLowerCase();
        
        return {
            path: filePath,
            size: stats.size,
            extension: ext,
            name: path.basename(filePath, ext),
            directory: path.dirname(filePath),
            modified: stats.mtime
        };
    } catch (error) {
        return null;
    }
}

/**
 * 生成优化后的文件路径
 */
function getOptimizedPath(originalPath, suffix = '', format = null) {
    const parsed = path.parse(originalPath);
    const relativePath = path.relative('static', originalPath);
    const newExt = format || parsed.ext;
    const newName = `${parsed.name}${suffix}${newExt}`;
    
    return path.join(config.outputDir, path.dirname(relativePath), newName);
}

/**
 * 创建图片优化任务
 */
function createOptimizationTasks(imageInfo) {
    const tasks = [];
    const { path: filePath, extension, name } = imageInfo;
    
    // 原始尺寸优化
    tasks.push({
        input: filePath,
        output: getOptimizedPath(filePath),
        type: 'optimize',
        format: extension,
        quality: config.optimization.quality
    });
    
    // WebP 格式
    if (config.optimization.webp && ['.jpg', '.jpeg', '.png'].includes(extension)) {
        tasks.push({
            input: filePath,
            output: getOptimizedPath(filePath, '', '.webp'),
            type: 'convert',
            format: '.webp',
            quality: config.optimization.quality
        });
    }
    
    // 响应式尺寸（仅对大图片）
    if (['.jpg', '.jpeg', '.png'].includes(extension)) {
        for (const size of config.responsiveSizes) {
            tasks.push({
                input: filePath,
                output: getOptimizedPath(filePath, size.suffix),
                type: 'resize',
                format: extension,
                width: size.width,
                quality: config.optimization.quality
            });
            
            // 响应式 WebP
            if (config.optimization.webp) {
                tasks.push({
                    input: filePath,
                    output: getOptimizedPath(filePath, size.suffix, '.webp'),
                    type: 'resize_convert',
                    format: '.webp',
                    width: size.width,
                    quality: config.optimization.quality
                });
            }
        }
    }
    
    return tasks;
}

/**
 * 模拟图片处理（实际项目中需要使用 sharp 或其他图片处理库）
 */
async function processImageTask(task) {
    try {
        // 确保输出目录存在
        const outputDir = path.dirname(task.output);
        await fs.mkdir(outputDir, { recursive: true });
        
        // 这里应该使用实际的图片处理库，如 sharp
        // 现在只是复制文件作为示例
        await fs.copyFile(task.input, task.output);
        
        const stats = await fs.stat(task.output);
        
        return {
            success: true,
            input: task.input,
            output: task.output,
            type: task.type,
            size: stats.size,
            format: task.format
        };
    } catch (error) {
        return {
            success: false,
            input: task.input,
            output: task.output,
            type: task.type,
            error: error.message
        };
    }
}

/**
 * 生成图片映射文件
 */
async function generateImageMapping(results) {
    const mapping = {
        version: '1.0.0',
        generated: new Date().toISOString(),
        images: {},
        stats: {
            total_processed: results.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length
        }
    };
    
    // 按原始文件分组
    const grouped = {};
    results.forEach(result => {
        if (result.success) {
            const originalPath = result.input;
            if (!grouped[originalPath]) {
                grouped[originalPath] = {
                    original: originalPath,
                    variants: []
                };
            }
            
            grouped[originalPath].variants.push({
                path: result.output,
                type: result.type,
                format: result.format,
                size: result.size
            });
        }
    });
    
    mapping.images = grouped;
    
    const mappingPath = path.join(config.outputDir, 'image-mapping.json');
    await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2), 'utf8');
    
    return mapping;
}

/**
 * 生成Hugo图片处理配置
 */
async function generateHugoImageConfig() {
    const hugoConfig = {
        // Hugo 图片处理配置
        imaging: {
            resampleFilter: 'CatmullRom',
            quality: config.optimization.quality,
            anchor: 'smart'
        },
        
        // 响应式图片配置
        responsive: {
            sizes: config.responsiveSizes.map(size => ({
                suffix: size.suffix,
                width: size.width
            })),
            formats: ['webp', 'jpg']
        },
        
        // 默认图片路径
        defaults: {
            placeholder: '/images/placeholder.svg',
            product: '/images/product-placeholder.svg',
            news: '/images/news-placeholder.svg'
        }
    };
    
    const configPath = path.join(config.outputDir, 'hugo-image-config.json');
    await fs.writeFile(configPath, JSON.stringify(hugoConfig, null, 2), 'utf8');
    
    return hugoConfig;
}

/**
 * 主函数
 */
async function main() {
    console.log('🖼️ VisNDT 图片优化工具\n');
    console.log('='.repeat(50));
    
    try {
        // 创建输出目录
        await fs.mkdir(config.outputDir, { recursive: true });
        console.log(`✓ 输出目录: ${config.outputDir}`);
        
        // 扫描图片文件
        console.log('\n📁 扫描图片文件...');
        const imageFiles = await getImageFiles();
        console.log(`✓ 找到 ${imageFiles.length} 个图片文件`);
        
        if (imageFiles.length === 0) {
            console.log('⚠️ 没有找到需要处理的图片文件');
            return;
        }
        
        // 分析图片
        console.log('\n🔍 分析图片信息...');
        const imageInfos = [];
        for (const file of imageFiles) {
            const info = await analyzeImage(file);
            if (info) {
                imageInfos.push(info);
            }
        }
        
        // 创建优化任务
        console.log('\n📋 创建优化任务...');
        const allTasks = [];
        imageInfos.forEach(info => {
            const tasks = createOptimizationTasks(info);
            allTasks.push(...tasks);
        });
        
        console.log(`✓ 创建了 ${allTasks.length} 个优化任务`);
        
        // 处理任务
        console.log('\n⚙️ 处理图片...');
        const results = [];
        
        for (let i = 0; i < allTasks.length; i++) {
            const task = allTasks[i];
            process.stdout.write(`\r处理进度: ${i + 1}/${allTasks.length} - ${path.basename(task.input)}`);
            
            const result = await processImageTask(task);
            results.push(result);
        }
        
        console.log('\n');
        
        // 生成映射文件
        console.log('📊 生成映射文件...');
        const mapping = await generateImageMapping(results);
        const hugoConfig = await generateHugoImageConfig();
        
        // 显示结果
        console.log('\n' + '='.repeat(50));
        console.log('🎉 图片优化完成！');
        console.log('\n📊 处理统计:');
        console.log(`   • 原始图片: ${imageInfos.length}`);
        console.log(`   • 优化任务: ${allTasks.length}`);
        console.log(`   • 成功处理: ${mapping.stats.successful}`);
        console.log(`   • 处理失败: ${mapping.stats.failed}`);
        
        console.log('\n📁 输出文件:');
        console.log(`   • 优化图片: ${config.outputDir}/`);
        console.log(`   • 映射文件: ${config.outputDir}/image-mapping.json`);
        console.log(`   • Hugo配置: ${config.outputDir}/hugo-image-config.json`);
        
        console.log('\n💡 下一步:');
        console.log('   1. 安装图片处理库: npm install sharp');
        console.log('   2. 更新 Hugo 配置文件');
        console.log('   3. 更新模板文件使用优化后的图片');
        
    } catch (error) {
        console.error('\n❌ 优化失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    getImageFiles,
    analyzeImage,
    createOptimizationTasks,
    config
};
