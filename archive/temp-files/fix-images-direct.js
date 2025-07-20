#!/usr/bin/env node

/**
 * 直接修复图片路径脚本
 * 将所有图片组件调用替换为直接的img标签
 */

const fs = require('fs').promises;

async function fixNewsTemplate() {
    const filePath = 'layouts/partials/homepage/news_center.html';
    
    try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // 替换所有simple-image.html调用为直接的img标签
        content = content.replace(
            /\{\{\s*partial\s+"simple-image\.html"\s+\(dict[^}]+\}\}\s*\}\}/g,
            '<img src="/images/content/news/covers/news_covers_news-1_original_v1.jpeg" alt="新闻图片" class="news-thumbnail">'
        );
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log('✓ 修复新闻中心模板');
        
    } catch (error) {
        console.error('✗ 修复新闻中心模板失败:', error.message);
    }
}

async function fixApplicationTemplate() {
    const filePath = 'layouts/partials/homepage/application_areas_display.html';
    
    try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // 替换应用领域图片
        content = content.replace(
            /\{\{\s*partial\s+"simple-image\.html"\s+\(dict[^}]+\}\}\s*\}\}/g,
            '<img src="/images/banners/category/application_general_air-1_original_v1.jpg" alt="应用领域" class="img-fluid area-bg-image">'
        );
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log('✓ 修复应用领域模板');
        
    } catch (error) {
        console.error('✗ 修复应用领域模板失败:', error.message);
    }
}

async function main() {
    console.log('🔧 直接修复图片路径');
    console.log('='.repeat(30));
    
    await fixNewsTemplate();
    await fixApplicationTemplate();
    
    console.log('\n✅ 修复完成！');
}

if (require.main === module) {
    main();
}

module.exports = { fixNewsTemplate, fixApplicationTemplate };
