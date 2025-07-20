#!/usr/bin/env node

/**
 * 替换外部占位图片服务
 * 将项目中的 picsum.photos 等外部服务替换为本地占位图
 */

const fs = require('fs').promises;
const path = require('path');
const glob = require('glob');

// 配置
const config = {
    // 需要扫描的文件类型
    filePatterns: [
        'content/**/*.md',
        'layouts/**/*.html',
        'static/**/*.html',
        'static/**/*.js',
        'public/**/*.html'
    ],
    
    // 外部占位服务映射
    replacements: [
        {
            // picsum.photos 服务
            pattern: /https:\/\/picsum\.photos\/(\d+)\/(\d+)\?random=([^"'\s]+)/g,
            replacement: (match, width, height, random) => {
                return getLocalPlaceholder(width, height, random);
            }
        },
        {
            // 其他占位服务
            pattern: /https:\/\/via\.placeholder\.com\/(\d+)x?(\d+)?/g,
            replacement: (match, width, height = width) => {
                return getLocalPlaceholder(width, height, 'general');
            }
        },
        {
            // placeholder.com 服务
            pattern: /https?:\/\/placeholder\.com\/(\d+)x(\d+)/g,
            replacement: (match, width, height) => {
                return getLocalPlaceholder(width, height, 'general');
            }
        }
    ],
    
    // 备份目录
    backupDir: 'backups/placeholder-replacement',
    
    // 输出报告
    reportFile: 'scripts/placeholder-replacement-report.json'
};

/**
 * 根据尺寸和类型获取本地占位图路径
 */
function getLocalPlaceholder(width, height, identifier) {
    const w = parseInt(width);
    const h = parseInt(height);
    
    // 根据标识符判断类型
    let category = 'general';
    if (identifier.includes('test') || identifier.includes('product')) {
        if (identifier.includes('K') || identifier.includes('k')) category = 'K-series';
        else if (identifier.includes('P') || identifier.includes('p')) category = 'P-series';
        else if (identifier.includes('DZ') || identifier.includes('dz')) category = 'DZ-series';
        else if (identifier.includes('F') || identifier.includes('f')) category = 'F-series';
        else category = 'general';
    } else if (identifier.includes('news')) {
        category = 'news';
    } else if (identifier.includes('case')) {
        category = 'case';
    } else if (identifier.includes('supplier')) {
        category = 'supplier';
    }
    
    // 选择最接近的尺寸
    const sizeMapping = {
        '800x600': 'product-main-800x600',
        '400x300': 'product-thumb-400x300',
        '300x200': 'product-small-300x200',
        '100x100': 'qr-code-100x100',
        '1200x400': 'banner-1200x400',
        '150x150': 'avatar-150x150'
    };
    
    const sizeKey = `${w}x${h}`;
    const sizeName = sizeMapping[sizeKey] || findClosestSize(w, h);
    
    return `/images/placeholders/${category}/${sizeName}.svg`;
}

/**
 * 找到最接近的尺寸
 */
function findClosestSize(targetWidth, targetHeight) {
    const sizes = [
        { name: 'product-main-800x600', w: 800, h: 600 },
        { name: 'product-thumb-400x300', w: 400, h: 300 },
        { name: 'product-small-300x200', w: 300, h: 200 },
        { name: 'qr-code-100x100', w: 100, h: 100 },
        { name: 'banner-1200x400', w: 1200, h: 400 },
        { name: 'avatar-150x150', w: 150, h: 150 }
    ];
    
    let closest = sizes[0];
    let minDiff = Math.abs(targetWidth - closest.w) + Math.abs(targetHeight - closest.h);
    
    for (const size of sizes) {
        const diff = Math.abs(targetWidth - size.w) + Math.abs(targetHeight - size.h);
        if (diff < minDiff) {
            minDiff = diff;
            closest = size;
        }
    }
    
    return closest.name;
}

/**
 * 获取所有需要处理的文件
 */
async function getFilesToProcess() {
    const files = [];
    
    for (const pattern of config.filePatterns) {
        try {
            const matches = glob.sync(pattern, { ignore: ['node_modules/**', '.git/**'] });
            files.push(...matches);
        } catch (error) {
            console.warn(`警告: 无法处理模式 ${pattern}:`, error.message);
        }
    }
    
    // 去重
    return [...new Set(files)];
}

/**
 * 创建备份
 */
async function createBackup(filePath) {
    const backupPath = path.join(config.backupDir, filePath);
    const backupDir = path.dirname(backupPath);
    
    try {
        await fs.mkdir(backupDir, { recursive: true });
        await fs.copyFile(filePath, backupPath);
        return true;
    } catch (error) {
        console.error(`备份失败 ${filePath}:`, error.message);
        return false;
    }
}

/**
 * 处理单个文件
 */
async function processFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        let newContent = content;
        let hasChanges = false;
        const changes = [];
        
        // 应用所有替换规则
        for (const rule of config.replacements) {
            const matches = [...content.matchAll(rule.pattern)];
            
            if (matches.length > 0) {
                for (const match of matches) {
                    const original = match[0];
                    const replacement = typeof rule.replacement === 'function' 
                        ? rule.replacement(...match) 
                        : rule.replacement;
                    
                    newContent = newContent.replace(original, replacement);
                    hasChanges = true;
                    
                    changes.push({
                        original,
                        replacement,
                        line: content.substring(0, match.index).split('\n').length
                    });
                }
            }
        }
        
        // 如果有变更，创建备份并写入新内容
        if (hasChanges) {
            const backupSuccess = await createBackup(filePath);
            if (backupSuccess) {
                await fs.writeFile(filePath, newContent, 'utf8');
                return { success: true, changes, backed_up: true };
            } else {
                return { success: false, error: '备份失败', changes };
            }
        }
        
        return { success: true, changes: [], backed_up: false };
        
    } catch (error) {
        return { success: false, error: error.message, changes: [] };
    }
}

/**
 * 生成处理报告
 */
async function generateReport(results) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_files: results.length,
            processed_files: results.filter(r => r.success).length,
            failed_files: results.filter(r => !r.success).length,
            files_with_changes: results.filter(r => r.changes.length > 0).length,
            total_replacements: results.reduce((sum, r) => sum + r.changes.length, 0)
        },
        details: results.map(result => ({
            file: result.file,
            success: result.success,
            error: result.error || null,
            changes_count: result.changes.length,
            backed_up: result.backed_up || false,
            changes: result.changes
        })),
        config: config
    };
    
    await fs.writeFile(config.reportFile, JSON.stringify(report, null, 2), 'utf8');
    return report;
}

/**
 * 主函数
 */
async function main() {
    console.log('🔄 VisNDT 占位图片服务替换工具\n');
    console.log('='.repeat(60));
    
    try {
        // 创建备份目录
        await fs.mkdir(config.backupDir, { recursive: true });
        console.log(`✓ 备份目录: ${config.backupDir}`);
        
        // 获取要处理的文件
        console.log('\n📁 扫描文件...');
        const files = await getFilesToProcess();
        console.log(`✓ 找到 ${files.length} 个文件需要检查`);
        
        // 处理文件
        console.log('\n🔄 处理文件...');
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            process.stdout.write(`\r处理进度: ${i + 1}/${files.length} - ${file}`);
            
            const result = await processFile(file);
            results.push({ file, ...result });
        }
        
        console.log('\n');
        
        // 生成报告
        console.log('📊 生成报告...');
        const report = await generateReport(results);
        
        // 显示结果
        console.log('\n' + '='.repeat(60));
        console.log('🎉 处理完成！');
        console.log('\n📊 处理统计:');
        console.log(`   • 总文件数: ${report.summary.total_files}`);
        console.log(`   • 成功处理: ${report.summary.processed_files}`);
        console.log(`   • 处理失败: ${report.summary.failed_files}`);
        console.log(`   • 有变更的文件: ${report.summary.files_with_changes}`);
        console.log(`   • 总替换次数: ${report.summary.total_replacements}`);
        
        if (report.summary.files_with_changes > 0) {
            console.log('\n📝 变更的文件:');
            results.filter(r => r.changes.length > 0).forEach(result => {
                console.log(`   • ${result.file} (${result.changes.length} 处替换)`);
            });
        }
        
        if (report.summary.failed_files > 0) {
            console.log('\n❌ 失败的文件:');
            results.filter(r => !r.success).forEach(result => {
                console.log(`   • ${result.file}: ${result.error}`);
            });
        }
        
        console.log(`\n📋 详细报告: ${config.reportFile}`);
        console.log(`💾 备份位置: ${config.backupDir}/`);
        
    } catch (error) {
        console.error('\n❌ 处理失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    getLocalPlaceholder,
    processFile,
    config
};
