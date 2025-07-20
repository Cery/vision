#!/usr/bin/env node

/**
 * 创建本地占位图片系统
 * 替换外部占位服务，生成本地占位图片
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    outputDir: 'static/images/placeholders',
    sizes: [
        { width: 800, height: 600, name: 'product-main' },
        { width: 400, height: 300, name: 'product-thumb' },
        { width: 300, height: 200, name: 'product-small' },
        { width: 100, height: 100, name: 'qr-code' },
        { width: 1200, height: 400, name: 'banner' },
        { width: 150, height: 150, name: 'avatar' }
    ],
    categories: [
        'K-series', 'P-series', 'DZ-series', 'F-series',
        'general', 'news', 'case', 'supplier'
    ]
};

/**
 * 生成SVG占位图
 */
function generateSVGPlaceholder(width, height, category, index = 0) {
    const colors = {
        'K-series': '#2196F3',
        'P-series': '#4CAF50', 
        'DZ-series': '#FF9800',
        'F-series': '#9C27B0',
        'general': '#607D8B',
        'news': '#FF5722',
        'case': '#795548',
        'supplier': '#3F51B5'
    };
    
    const color = colors[category] || colors.general;
    const textColor = '#FFFFFF';
    const bgColor = color + '20'; // 添加透明度
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
            </pattern>
        </defs>
        <rect width="100%" height="100%" fill="${bgColor}"/>
        <rect width="100%" height="100%" fill="url(#grid)"/>
        <circle cx="${width/2}" cy="${height/2 - 20}" r="30" fill="${color}" opacity="0.8"/>
        <text x="${width/2}" y="${height/2 + 10}" font-family="Arial, sans-serif" font-size="14" 
              fill="${color}" text-anchor="middle" font-weight="bold">
            ${category.toUpperCase()}
        </text>
        <text x="${width/2}" y="${height/2 + 30}" font-family="Arial, sans-serif" font-size="12" 
              fill="${color}" text-anchor="middle" opacity="0.7">
            ${width} × ${height}
        </text>
        ${index > 0 ? `<text x="${width/2}" y="${height/2 + 50}" font-family="Arial, sans-serif" font-size="10" 
              fill="${color}" text-anchor="middle" opacity="0.5">
            #${index}
        </text>` : ''}
    </svg>`;
}

/**
 * 创建占位图片目录结构
 */
async function createDirectoryStructure() {
    const dirs = [
        config.outputDir,
        ...config.categories.map(cat => path.join(config.outputDir, cat))
    ];
    
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`✓ 创建目录: ${dir}`);
        } catch (error) {
            console.error(`✗ 创建目录失败: ${dir}`, error.message);
        }
    }
}

/**
 * 生成占位图片文件
 */
async function generatePlaceholderImages() {
    console.log('🎨 开始生成占位图片...\n');
    
    for (const category of config.categories) {
        console.log(`📁 处理分类: ${category}`);
        
        for (const size of config.sizes) {
            // 生成基础占位图
            const svg = generateSVGPlaceholder(size.width, size.height, category);
            const filename = `${size.name}-${size.width}x${size.height}.svg`;
            const filepath = path.join(config.outputDir, category, filename);
            
            try {
                await fs.writeFile(filepath, svg, 'utf8');
                console.log(`  ✓ ${filename}`);
            } catch (error) {
                console.error(`  ✗ ${filename}:`, error.message);
            }
            
            // 为产品生成多个变体（模拟不同产品）
            if (category.includes('series') && size.name === 'product-main') {
                for (let i = 1; i <= 5; i++) {
                    const variantSvg = generateSVGPlaceholder(size.width, size.height, category, i);
                    const variantFilename = `${size.name}-${size.width}x${size.height}-${i}.svg`;
                    const variantFilepath = path.join(config.outputDir, category, variantFilename);
                    
                    try {
                        await fs.writeFile(variantFilepath, variantSvg, 'utf8');
                        console.log(`  ✓ ${variantFilename}`);
                    } catch (error) {
                        console.error(`  ✗ ${variantFilename}:`, error.message);
                    }
                }
            }
        }
        console.log('');
    }
}

/**
 * 创建通用占位图
 */
async function createGeneralPlaceholders() {
    console.log('🖼️ 创建通用占位图...\n');
    
    // 默认占位图 (用于错误处理)
    const defaultSvg = generateSVGPlaceholder(400, 300, 'general');
    await fs.writeFile(path.join('static/images', 'placeholder.svg'), defaultSvg, 'utf8');
    console.log('✓ 创建默认占位图: /images/placeholder.svg');
    
    // 产品默认图
    const productSvg = generateSVGPlaceholder(800, 600, 'general');
    await fs.writeFile(path.join('static/images', 'product-placeholder.svg'), productSvg, 'utf8');
    console.log('✓ 创建产品占位图: /images/product-placeholder.svg');
    
    // 新闻默认图
    const newsSvg = generateSVGPlaceholder(600, 400, 'news');
    await fs.writeFile(path.join('static/images', 'news-placeholder.svg'), newsSvg, 'utf8');
    console.log('✓ 创建新闻占位图: /images/news-placeholder.svg');
}

/**
 * 生成占位图映射文件
 */
async function generatePlaceholderMapping() {
    console.log('\n📋 生成占位图映射文件...');
    
    const mapping = {
        version: '1.0.0',
        generated: new Date().toISOString(),
        categories: {},
        defaults: {
            product: '/images/placeholders/general/product-main-800x600.svg',
            news: '/images/placeholders/news/product-main-800x600.svg',
            case: '/images/placeholders/case/product-main-800x600.svg',
            supplier: '/images/placeholders/supplier/product-main-800x600.svg',
            error: '/images/placeholder.svg'
        }
    };
    
    // 为每个分类生成映射
    for (const category of config.categories) {
        mapping.categories[category] = {};
        
        for (const size of config.sizes) {
            const key = `${size.name}_${size.width}x${size.height}`;
            mapping.categories[category][key] = `/images/placeholders/${category}/${size.name}-${size.width}x${size.height}.svg`;
        }
    }
    
    const mappingPath = path.join(config.outputDir, 'mapping.json');
    await fs.writeFile(mappingPath, JSON.stringify(mapping, null, 2), 'utf8');
    console.log(`✓ 映射文件: ${mappingPath}`);
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 VisNDT 占位图片生成器\n');
    console.log('='.repeat(50));
    
    try {
        await createDirectoryStructure();
        await generatePlaceholderImages();
        await createGeneralPlaceholders();
        await generatePlaceholderMapping();
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 占位图片生成完成！');
        console.log('\n📊 生成统计:');
        console.log(`   • 分类数量: ${config.categories.length}`);
        console.log(`   • 尺寸规格: ${config.sizes.length}`);
        console.log(`   • 总文件数: ${config.categories.length * config.sizes.length + 15} (约)`);
        console.log('\n📁 文件位置:');
        console.log(`   • 占位图目录: ${config.outputDir}/`);
        console.log(`   • 默认占位图: static/images/placeholder.svg`);
        console.log(`   • 映射文件: ${config.outputDir}/mapping.json`);
        
    } catch (error) {
        console.error('\n❌ 生成失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    generateSVGPlaceholder,
    createDirectoryStructure,
    generatePlaceholderImages,
    config
};
