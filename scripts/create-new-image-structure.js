#!/usr/bin/env node

/**
 * 创建新的图片目录结构
 * 按照优化方案重组图片目录，保持向后兼容
 */

const fs = require('fs').promises;
const path = require('path');

// 新的目录结构配置
const newStructure = {
    'static/images/assets': {
        'brand': ['logos', 'icons', 'watermarks'],
        'ui': ['placeholders', 'backgrounds', 'decorations'],
        'common': []
    },
    'static/images/content': {
        'products': ['covers', 'galleries', 'details', 'thumbnails'],
        'news': ['covers', 'articles', 'thumbnails'],
        'cases': ['covers', 'galleries', 'thumbnails'],
        'partners': ['logos', 'thumbnails']
    },
    'static/images/banners': {
        'home': [],
        'category': [],
        'promotion': []
    },
    'static/images/optimized': {
        'webp': [],
        'avif': [],
        'responsive': ['small', 'medium', 'large', 'xlarge']
    },
    'static/images/uploads': {
        'temp': [],
        'processed': [],
        'archive': []
    }
};

// 现有图片到新结构的映射
const migrationMapping = {
    // 产品图片映射
    'products': {
        source: 'static/images/products',
        target: 'static/images/content/products',
        rules: [
            { pattern: /.*/, targetSubdir: 'covers' } // 默认放到covers
        ]
    },
    
    // 新闻图片映射
    'news': {
        source: 'static/images/news',
        target: 'static/images/content/news',
        rules: [
            { pattern: /news-\d+\.(jpeg|jpg|png|webp)/, targetSubdir: 'covers' },
            { pattern: /.*/, targetSubdir: 'covers' } // 默认放到covers
        ]
    },
    
    // 案例图片映射
    'cases': {
        source: 'static/images/cases',
        target: 'static/images/content/cases',
        rules: [
            { pattern: /case-\d+\.webp/, targetSubdir: 'covers' },
            { pattern: /.*/, targetSubdir: 'covers' }
        ]
    },
    
    // 合作伙伴映射
    'partners': {
        source: 'static/images/partner',
        target: 'static/images/content/partners',
        rules: [
            { pattern: /.*/, targetSubdir: 'logos' }
        ]
    },
    
    // 轮播图映射
    'carousel': {
        source: 'static/images/carousel',
        target: 'static/images/banners/home',
        rules: [
            { pattern: /.*/, targetSubdir: '' }
        ]
    },
    
    // 应用领域映射
    'application': {
        source: 'static/images/application',
        target: 'static/images/banners/category',
        rules: [
            { pattern: /.*/, targetSubdir: '' }
        ]
    },
    
    // 品牌资源映射
    'brand': {
        source: 'static/images',
        target: 'static/images/assets/brand',
        rules: [
            { pattern: /logo.*\.svg/, targetSubdir: 'logos' },
            { pattern: /favicon\.svg/, targetSubdir: 'icons' }
        ]
    },
    
    // 占位图映射
    'placeholders': {
        source: 'static/images/placeholders',
        target: 'static/images/assets/ui/placeholders',
        rules: [
            { pattern: /.*/, targetSubdir: '' }
        ]
    }
};

/**
 * 创建目录结构
 */
async function createDirectoryStructure() {
    console.log('📁 创建新的目录结构...');
    
    for (const [basePath, structure] of Object.entries(newStructure)) {
        try {
            // 创建基础目录
            await fs.mkdir(basePath, { recursive: true });
            console.log(`✓ 创建目录: ${basePath}`);
            
            // 创建子目录
            for (const [subDir, subSubDirs] of Object.entries(structure)) {
                const subPath = path.join(basePath, subDir);
                await fs.mkdir(subPath, { recursive: true });
                console.log(`  ✓ 创建子目录: ${subPath}`);
                
                // 创建子子目录
                for (const subSubDir of subSubDirs) {
                    const subSubPath = path.join(subPath, subSubDir);
                    await fs.mkdir(subSubPath, { recursive: true });
                    console.log(`    ✓ 创建子子目录: ${subSubPath}`);
                }
            }
        } catch (error) {
            console.error(`✗ 创建目录失败 ${basePath}:`, error.message);
        }
    }
}

/**
 * 生成新的文件名
 */
function generateNewFileName(originalPath, category, type, index = 0) {
    const ext = path.extname(originalPath);
    const baseName = path.basename(originalPath, ext);
    
    // 清理文件名，移除特殊字符
    const cleanName = baseName
        .replace(/[^\w\u4e00-\u9fa5-]/g, '_') // 保留中文、英文、数字、下划线
        .replace(/_+/g, '_') // 合并多个下划线
        .replace(/^_|_$/g, ''); // 移除首尾下划线
    
    // 生成新文件名
    const identifier = cleanName || `item_${String(index).padStart(3, '0')}`;
    return `${category}_${type}_${identifier}_original_v1${ext}`;
}

/**
 * 复制并重命名文件
 */
async function copyAndRenameFile(sourcePath, targetDir, newFileName) {
    try {
        const targetPath = path.join(targetDir, newFileName);
        
        // 检查目标文件是否已存在
        try {
            await fs.access(targetPath);
            console.log(`  ⚠ 文件已存在，跳过: ${newFileName}`);
            return { success: true, skipped: true, targetPath };
        } catch {
            // 文件不存在，继续复制
        }
        
        // 复制文件
        await fs.copyFile(sourcePath, targetPath);
        console.log(`  ✓ 复制: ${path.basename(sourcePath)} → ${newFileName}`);
        
        return { success: true, skipped: false, targetPath };
        
    } catch (error) {
        console.error(`  ✗ 复制失败: ${sourcePath} → ${newFileName}:`, error.message);
        return { success: false, error: error.message };
    }
}

/**
 * 迁移图片文件
 */
async function migrateImages() {
    console.log('\n📦 开始迁移图片文件...');
    
    const migrationResults = {};
    
    for (const [category, config] of Object.entries(migrationMapping)) {
        console.log(`\n📂 处理分类: ${category}`);
        migrationResults[category] = {
            total: 0,
            success: 0,
            skipped: 0,
            failed: 0,
            files: []
        };
        
        try {
            // 检查源目录是否存在
            await fs.access(config.source);
            
            // 读取源目录中的文件
            const files = await fs.readdir(config.source, { withFileTypes: true });
            const imageFiles = files.filter(file => 
                file.isFile() && /\.(jpg|jpeg|png|webp|svg|gif)$/i.test(file.name)
            );
            
            migrationResults[category].total = imageFiles.length;
            
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const sourcePath = path.join(config.source, file.name);
                
                // 根据规则确定目标子目录
                let targetSubdir = '';
                for (const rule of config.rules) {
                    if (rule.pattern.test(file.name)) {
                        targetSubdir = rule.targetSubdir;
                        break;
                    }
                }
                
                const targetDir = targetSubdir 
                    ? path.join(config.target, targetSubdir)
                    : config.target;
                
                // 确保目标目录存在
                await fs.mkdir(targetDir, { recursive: true });
                
                // 生成新文件名
                const typeFromSubdir = targetSubdir || 'general';
                const newFileName = generateNewFileName(sourcePath, category, typeFromSubdir, i);
                
                // 复制文件
                const result = await copyAndRenameFile(sourcePath, targetDir, newFileName);
                
                if (result.success) {
                    if (result.skipped) {
                        migrationResults[category].skipped++;
                    } else {
                        migrationResults[category].success++;
                    }
                    
                    migrationResults[category].files.push({
                        original: sourcePath,
                        new: result.targetPath,
                        skipped: result.skipped
                    });
                } else {
                    migrationResults[category].failed++;
                }
            }
            
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.log(`  ⚠ 源目录不存在: ${config.source}`);
            } else {
                console.error(`  ✗ 处理分类失败: ${error.message}`);
            }
        }
    }
    
    return migrationResults;
}

/**
 * 生成路径映射配置
 */
async function generatePathMapping(migrationResults) {
    console.log('\n📋 生成路径映射配置...');
    
    const pathMapping = {
        version: '1.0.0',
        created: new Date().toISOString(),
        description: '新旧图片路径映射关系',
        mappings: {}
    };
    
    // 生成映射关系
    for (const [category, results] of Object.entries(migrationResults)) {
        pathMapping.mappings[category] = {};
        
        for (const file of results.files) {
            const oldPath = file.original.replace(/\\/g, '/').replace('static', '');
            const newPath = file.new.replace(/\\/g, '/').replace('static', '');
            pathMapping.mappings[category][oldPath] = newPath;
        }
    }
    
    // 保存映射文件
    const mappingPath = 'static/images/path-mapping.json';
    await fs.writeFile(mappingPath, JSON.stringify(pathMapping, null, 2), 'utf8');
    console.log(`✓ 路径映射已保存: ${mappingPath}`);
    
    return pathMapping;
}

/**
 * 生成迁移报告
 */
async function generateMigrationReport(migrationResults, pathMapping) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_categories: Object.keys(migrationResults).length,
            total_files: 0,
            successful_files: 0,
            skipped_files: 0,
            failed_files: 0
        },
        categories: migrationResults,
        path_mapping: pathMapping
    };
    
    // 计算总计
    for (const results of Object.values(migrationResults)) {
        report.summary.total_files += results.total;
        report.summary.successful_files += results.success;
        report.summary.skipped_files += results.skipped;
        report.summary.failed_files += results.failed;
    }
    
    // 保存报告
    try {
        await fs.mkdir('scripts/reports', { recursive: true });
        const reportPath = 'scripts/reports/image-migration-report.json';
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`✓ 迁移报告已保存: ${reportPath}`);
    } catch (error) {
        console.log(`⚠ 保存报告失败: ${error.message}`);
    }
    
    return report;
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 VisNDT 图片目录结构重组工具');
    console.log('='.repeat(50));
    
    try {
        // 步骤1: 创建新的目录结构
        await createDirectoryStructure();
        
        // 步骤2: 迁移现有图片
        const migrationResults = await migrateImages();
        
        // 步骤3: 生成路径映射
        const pathMapping = await generatePathMapping(migrationResults);
        
        // 步骤4: 生成报告
        const report = await generateMigrationReport(migrationResults, pathMapping);
        
        // 显示结果
        console.log('\n' + '='.repeat(50));
        console.log('🎉 图片目录重组完成！');
        
        console.log('\n📊 迁移统计:');
        console.log(`  • 处理分类: ${report.summary.total_categories}`);
        console.log(`  • 总文件数: ${report.summary.total_files}`);
        console.log(`  • 成功迁移: ${report.summary.successful_files}`);
        console.log(`  • 跳过文件: ${report.summary.skipped_files}`);
        console.log(`  • 失败文件: ${report.summary.failed_files}`);
        
        console.log('\n📁 新目录结构:');
        console.log('  static/images/');
        console.log('  ├── assets/          # 核心资产');
        console.log('  ├── content/         # 内容图片');
        console.log('  ├── banners/         # 横幅图片');
        console.log('  ├── optimized/       # 优化后图片');
        console.log('  └── uploads/         # 用户上传');
        
        console.log('\n💡 下一步:');
        console.log('  1. 检查新目录结构和文件');
        console.log('  2. 更新Hugo模板支持双路径');
        console.log('  3. 测试网站图片显示');
        console.log('  4. 验证所有页面正常');
        
        if (report.summary.failed_files > 0) {
            console.log('\n⚠️ 注意: 有文件迁移失败，请检查报告');
        }
        
    } catch (error) {
        console.error('\n❌ 重组失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    createDirectoryStructure,
    migrateImages,
    generatePathMapping,
    newStructure,
    migrationMapping
};
