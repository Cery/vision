#!/usr/bin/env node

/**
 * 更新图片引用脚本
 * 将项目中的图片引用更新为新的路径系统
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    // 需要更新的文件类型
    filePatterns: [
        'content/**/*.md',
        'layouts/**/*.html',
        'static/**/*.html',
        'static/**/*.js'
    ],
    
    // 路径映射规则
    pathMappings: {
        // 合作伙伴图片
        '/images/partner/': '/images/content/partners/logos/',
        
        // 新闻图片
        '/images/news/': '/images/content/news/covers/',
        
        // 案例图片  
        '/images/cases/': '/images/content/cases/covers/',
        
        // 轮播图
        '/images/carousel/': '/images/banners/home/',
        
        // 应用领域
        '/images/application/': '/images/banners/category/',
        
        // 品牌资源
        '/images/logo': '/images/assets/brand/logos/logo',
        '/images/favicon.svg': '/images/assets/brand/icons/favicon.svg'
    },
    
    // 特殊处理规则
    specialRules: [
        {
            // 合作伙伴配置中的logo路径
            pattern: /logo:\s*["']\/images\/partner\/([^"']+)["']/g,
            replacement: 'logo: "/images/content/partners/logos/partners_logos_$1_original_v1"'
        },
        {
            // 新闻featured_image路径
            pattern: /featured_image:\s*["']\/images\/news\/([^"']+)["']/g,
            replacement: 'featured_image: "/images/content/news/covers/news_covers_$1_original_v1"'
        }
    ]
};

/**
 * 获取所有需要处理的文件
 */
async function getFilesToProcess() {
    const files = [];
    
    // 手动指定关键文件，避免glob依赖
    const keyFiles = [
        'content/_index.md',
        'layouts/partials/homepage/partner_companies_display.html',
        'layouts/partials/homepage/news_center.html',
        'layouts/partials/homepage/application_cases_display.html',
        'layouts/partials/homepage/product_category_carousel.html'
    ];
    
    for (const file of keyFiles) {
        try {
            await fs.access(file);
            files.push(file);
        } catch {
            console.log(`⚠️ 文件不存在: ${file}`);
        }
    }
    
    return files;
}

/**
 * 处理单个文件
 */
async function processFile(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        let newContent = content;
        let changes = 0;
        const changeLog = [];
        
        // 应用路径映射规则
        for (const [oldPath, newPath] of Object.entries(config.pathMappings)) {
            const regex = new RegExp(oldPath.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            const matches = [...content.matchAll(regex)];
            
            if (matches.length > 0) {
                newContent = newContent.replace(regex, newPath);
                changes += matches.length;
                changeLog.push(`${oldPath} → ${newPath} (${matches.length}次)`);
            }
        }
        
        // 应用特殊规则
        for (const rule of config.specialRules) {
            const matches = [...content.matchAll(rule.pattern)];
            
            if (matches.length > 0) {
                newContent = newContent.replace(rule.pattern, rule.replacement);
                changes += matches.length;
                changeLog.push(`特殊规则应用 (${matches.length}次)`);
            }
        }
        
        // 写入文件
        if (changes > 0) {
            await fs.writeFile(filePath, newContent, 'utf8');
        }
        
        return {
            success: true,
            file: path.basename(filePath),
            changes,
            changeLog
        };
        
    } catch (error) {
        return {
            success: false,
            file: path.basename(filePath),
            error: error.message,
            changes: 0
        };
    }
}

/**
 * 更新首页配置中的合作伙伴路径
 */
async function updatePartnerPaths() {
    console.log('\n🔄 更新合作伙伴路径...');
    
    try {
        const indexPath = 'content/_index.md';
        const content = await fs.readFile(indexPath, 'utf8');
        
        // 更新合作伙伴logo路径
        let newContent = content;
        
        // 匹配合作伙伴配置块
        const partnerRegex = /logo:\s*["']\/images\/partner\/([^"']+)["']/g;
        const matches = [...content.matchAll(partnerRegex)];
        
        for (const match of matches) {
            const [fullMatch, fileName] = match;
            const baseName = path.parse(fileName).name;
            const ext = path.parse(fileName).ext;
            const newPath = `/images/content/partners/logos/partners_logos_${baseName}_original_v1${ext}`;
            
            newContent = newContent.replace(fullMatch, `logo: "${newPath}"`);
            console.log(`  ✓ ${fileName} → partners_logos_${baseName}_original_v1${ext}`);
        }
        
        if (matches.length > 0) {
            await fs.writeFile(indexPath, newContent, 'utf8');
            console.log(`✓ 更新了 ${matches.length} 个合作伙伴logo路径`);
        } else {
            console.log('✓ 合作伙伴路径已是最新');
        }
        
        return { success: true, changes: matches.length };
        
    } catch (error) {
        console.error('✗ 更新合作伙伴路径失败:', error.message);
        return { success: false, error: error.message };
    }
}

/**
 * 生成更新报告
 */
async function generateUpdateReport(results, partnerResult) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_files: results.length,
            successful_files: results.filter(r => r.success).length,
            failed_files: results.filter(r => !r.success).length,
            total_changes: results.reduce((sum, r) => sum + r.changes, 0) + (partnerResult.changes || 0),
            partner_updates: partnerResult.changes || 0
        },
        files: results,
        partner_update: partnerResult
    };
    
    try {
        await fs.mkdir('scripts/reports', { recursive: true });
        const reportPath = 'scripts/reports/image-reference-update-report.json';
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`✓ 更新报告已保存: ${reportPath}`);
    } catch (error) {
        console.log(`⚠️ 保存报告失败: ${error.message}`);
    }
    
    return report;
}

/**
 * 主函数
 */
async function main() {
    console.log('🔄 VisNDT 图片引用更新工具');
    console.log('='.repeat(40));
    
    try {
        // 更新合作伙伴路径
        const partnerResult = await updatePartnerPaths();
        
        // 获取要处理的文件
        console.log('\n📁 扫描需要更新的文件...');
        const files = await getFilesToProcess();
        console.log(`✓ 找到 ${files.length} 个文件需要检查`);
        
        // 处理文件
        console.log('\n⚙️ 处理文件...');
        const results = [];
        
        for (const file of files) {
            const result = await processFile(file);
            results.push(result);
            
            if (result.success && result.changes > 0) {
                console.log(`✓ ${result.file} (${result.changes} 处修改)`);
                result.changeLog.forEach(log => console.log(`    ${log}`));
            } else if (result.success) {
                console.log(`- ${result.file} (无需修改)`);
            } else {
                console.log(`✗ ${result.file} (${result.error})`);
            }
        }
        
        // 生成报告
        const report = await generateUpdateReport(results, partnerResult);
        
        // 显示结果
        console.log('\n' + '='.repeat(40));
        console.log('🎉 图片引用更新完成！');
        
        console.log('\n📊 更新统计:');
        console.log(`  • 总文件数: ${report.summary.total_files}`);
        console.log(`  • 成功处理: ${report.summary.successful_files}`);
        console.log(`  • 处理失败: ${report.summary.failed_files}`);
        console.log(`  • 总修改数: ${report.summary.total_changes}`);
        console.log(`  • 合作伙伴更新: ${report.summary.partner_updates}`);
        
        console.log('\n💡 下一步:');
        console.log('  1. 重新构建网站: hugo --gc --minify');
        console.log('  2. 检查所有页面图片显示');
        console.log('  3. 验证合作伙伴logo显示');
        
    } catch (error) {
        console.error('\n❌ 更新失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    processFile,
    updatePartnerPaths,
    config
};
