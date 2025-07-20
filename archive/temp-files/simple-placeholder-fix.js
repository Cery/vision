#!/usr/bin/env node

/**
 * 简化的占位图片修复脚本
 * 不依赖外部包，直接修复项目中的占位图片问题
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    // 需要扫描的文件
    scanPaths: [
        'content',
        'static/admin',
        'public'
    ],
    
    // 文件扩展名
    extensions: ['.md', '.html', '.js'],
    
    // 占位图片映射
    placeholderMappings: {
        // picsum.photos 映射
        'https://picsum.photos/800/600?random=test001': '/images/placeholders/general/product-main-800x600.svg',
        'https://picsum.photos/800/600?random=test001-1': '/images/placeholders/general/product-main-800x600.svg',
        'https://picsum.photos/800/600?random=test001-2': '/images/placeholders/general/product-main-800x600.svg',
        'https://picsum.photos/800/600?random=test002': '/images/placeholders/general/product-main-800x600.svg',
        'https://picsum.photos/800/600?random=test002-1': '/images/placeholders/general/product-main-800x600.svg',
        'https://picsum.photos/100/100?random=8': '/images/placeholders/general/qr-code-100x100.svg',
        
        // 通用占位图
        '/images/placeholder.jpg': '/images/placeholder.svg'
    }
};

/**
 * 创建基础占位图片
 */
async function createBasicPlaceholders() {
    console.log('📸 创建基础占位图片...');
    
    // 创建目录
    const dirs = [
        'static/images/placeholders',
        'static/images/placeholders/general',
        'static/images/placeholders/K-series',
        'static/images/placeholders/P-series',
        'static/images/placeholders/DZ-series'
    ];
    
    for (const dir of dirs) {
        try {
            await fs.mkdir(dir, { recursive: true });
            console.log(`  ✓ 创建目录: ${dir}`);
        } catch (error) {
            console.log(`  ⚠ 目录已存在: ${dir}`);
        }
    }
    
    // 创建占位图片
    const placeholders = [
        {
            path: 'static/images/placeholder.svg',
            width: 400,
            height: 300,
            text: '默认占位图',
            color: '#6c757d'
        },
        {
            path: 'static/images/placeholders/general/product-main-800x600.svg',
            width: 800,
            height: 600,
            text: '产品主图',
            color: '#007bff'
        },
        {
            path: 'static/images/placeholders/general/qr-code-100x100.svg',
            width: 100,
            height: 100,
            text: 'QR',
            color: '#28a745'
        },
        {
            path: 'static/images/placeholders/K-series/product-main-800x600.svg',
            width: 800,
            height: 600,
            text: 'K系列产品',
            color: '#2196F3'
        },
        {
            path: 'static/images/placeholders/P-series/product-main-800x600.svg',
            width: 800,
            height: 600,
            text: 'P系列产品',
            color: '#4CAF50'
        },
        {
            path: 'static/images/placeholders/DZ-series/product-main-800x600.svg',
            width: 800,
            height: 600,
            text: 'DZ系列产品',
            color: '#FF9800'
        }
    ];
    
    for (const placeholder of placeholders) {
        const svg = generateSVG(placeholder);
        try {
            await fs.writeFile(placeholder.path, svg, 'utf8');
            console.log(`  ✓ 创建占位图: ${placeholder.path}`);
        } catch (error) {
            console.log(`  ✗ 创建失败: ${placeholder.path} - ${error.message}`);
        }
    }
}

/**
 * 生成SVG占位图
 */
function generateSVG({ width, height, text, color }) {
    const bgColor = color + '20';
    const fontSize = Math.min(width, height) / 20;
    
    return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
        <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="${color}" stroke-width="0.5" opacity="0.3"/>
        </pattern>
    </defs>
    <rect width="100%" height="100%" fill="${bgColor}"/>
    <rect width="100%" height="100%" fill="url(#grid)"/>
    <circle cx="${width/2}" cy="${height/2 - 20}" r="${Math.min(width, height)/20}" fill="${color}" opacity="0.8"/>
    <text x="${width/2}" y="${height/2 + 10}" font-family="Arial, sans-serif" font-size="${fontSize}" 
          fill="${color}" text-anchor="middle" font-weight="bold">
        ${text}
    </text>
    <text x="${width/2}" y="${height/2 + 30}" font-family="Arial, sans-serif" font-size="${fontSize * 0.7}" 
          fill="${color}" text-anchor="middle" opacity="0.7">
        ${width} × ${height}
    </text>
</svg>`;
}

/**
 * 递归获取所有文件
 */
async function getAllFiles(dir, extensions) {
    const files = [];
    
    try {
        const items = await fs.readdir(dir, { withFileTypes: true });
        
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            
            if (item.isDirectory()) {
                // 跳过某些目录
                if (!['node_modules', '.git', 'themes'].includes(item.name)) {
                    const subFiles = await getAllFiles(fullPath, extensions);
                    files.push(...subFiles);
                }
            } else if (item.isFile()) {
                const ext = path.extname(item.name);
                if (extensions.includes(ext)) {
                    files.push(fullPath);
                }
            }
        }
    } catch (error) {
        console.log(`  ⚠ 无法读取目录: ${dir}`);
    }
    
    return files;
}

/**
 * 替换文件中的占位图片链接
 */
async function replaceInFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        let newContent = content;
        let hasChanges = false;
        const changes = [];
        
        // 应用所有映射
        for (const [oldUrl, newUrl] of Object.entries(config.placeholderMappings)) {
            if (content.includes(oldUrl)) {
                newContent = newContent.replace(new RegExp(escapeRegExp(oldUrl), 'g'), newUrl);
                hasChanges = true;
                changes.push({ from: oldUrl, to: newUrl });
            }
        }
        
        // 如果有变更，写入文件
        if (hasChanges) {
            await fs.writeFile(filePath, newContent, 'utf8');
            return { success: true, changes };
        }
        
        return { success: true, changes: [] };
        
    } catch (error) {
        return { success: false, error: error.message, changes: [] };
    }
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 扫描并替换所有文件
 */
async function scanAndReplace() {
    console.log('\n🔍 扫描并替换占位图片链接...');
    
    const allFiles = [];
    
    // 获取所有需要扫描的文件
    for (const scanPath of config.scanPaths) {
        try {
            const files = await getAllFiles(scanPath, config.extensions);
            allFiles.push(...files);
            console.log(`  ✓ 扫描目录: ${scanPath} (${files.length} 个文件)`);
        } catch (error) {
            console.log(`  ⚠ 跳过目录: ${scanPath} - ${error.message}`);
        }
    }
    
    console.log(`\n📝 处理 ${allFiles.length} 个文件...`);
    
    const results = [];
    let processedCount = 0;
    let changedCount = 0;
    
    for (const file of allFiles) {
        const result = await replaceInFile(file);
        results.push({ file, ...result });
        
        processedCount++;
        if (result.changes.length > 0) {
            changedCount++;
            console.log(`  ✓ ${file} (${result.changes.length} 处替换)`);
        }
        
        // 显示进度
        if (processedCount % 10 === 0) {
            process.stdout.write(`\r  处理进度: ${processedCount}/${allFiles.length}`);
        }
    }
    
    console.log(`\n\n📊 处理结果:`);
    console.log(`  • 总文件数: ${processedCount}`);
    console.log(`  • 有变更的文件: ${changedCount}`);
    console.log(`  • 总替换次数: ${results.reduce((sum, r) => sum + r.changes.length, 0)}`);
    
    return results;
}

/**
 * 生成处理报告
 */
async function generateReport(results) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_files: results.length,
            changed_files: results.filter(r => r.changes.length > 0).length,
            total_replacements: results.reduce((sum, r) => sum + r.changes.length, 0),
            failed_files: results.filter(r => !r.success).length
        },
        changes: results.filter(r => r.changes.length > 0).map(r => ({
            file: r.file,
            changes: r.changes
        })),
        failures: results.filter(r => !r.success).map(r => ({
            file: r.file,
            error: r.error
        }))
    };
    
    try {
        await fs.mkdir('scripts/reports', { recursive: true });
        const reportPath = 'scripts/reports/placeholder-fix-report.json';
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`\n📋 报告已保存: ${reportPath}`);
    } catch (error) {
        console.log(`\n⚠ 保存报告失败: ${error.message}`);
    }
    
    return report;
}

/**
 * 主函数
 */
async function main() {
    console.log('🔧 VisNDT 占位图片修复工具');
    console.log('='.repeat(50));
    
    try {
        // 步骤1: 创建基础占位图片
        await createBasicPlaceholders();
        
        // 步骤2: 扫描并替换文件
        const results = await scanAndReplace();
        
        // 步骤3: 生成报告
        const report = await generateReport(results);
        
        // 显示最终结果
        console.log('\n' + '='.repeat(50));
        console.log('🎉 占位图片修复完成！');
        
        if (report.summary.failed_files > 0) {
            console.log('\n⚠️ 注意: 有文件处理失败，请检查报告');
        }
        
        console.log('\n💡 下一步:');
        console.log('  1. 检查生成的占位图片');
        console.log('  2. 测试网站图片加载');
        console.log('  3. 提交代码变更');
        
    } catch (error) {
        console.error('\n❌ 修复失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    createBasicPlaceholders,
    replaceInFile,
    scanAndReplace,
    config
};
