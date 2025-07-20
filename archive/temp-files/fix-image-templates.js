#!/usr/bin/env node

/**
 * 修复图片模板引用脚本
 * 将smart-image.html替换为simple-image.html
 */

const fs = require('fs').promises;
const path = require('path');

async function fixNewsTemplate() {
    const filePath = 'layouts/partials/homepage/news_center.html';
    
    try {
        let content = await fs.readFile(filePath, 'utf8');
        
        // 替换所有smart-image.html为simple-image.html
        content = content.replace(/smart-image\.html/g, 'simple-image.html');
        
        // 移除loading参数
        content = content.replace(/\s*"loading"\s*:\s*"lazy"\s*,?\s*/g, '');
        content = content.replace(/,\s*\)\s*\}\}/g, ') }}');
        
        await fs.writeFile(filePath, content, 'utf8');
        console.log('✓ 修复新闻中心模板');
        
    } catch (error) {
        console.error('✗ 修复新闻中心模板失败:', error.message);
    }
}

async function main() {
    console.log('🔧 修复图片模板引用');
    console.log('='.repeat(30));
    
    await fixNewsTemplate();
    
    console.log('\n✅ 修复完成！');
}

if (require.main === module) {
    main();
}

module.exports = { fixNewsTemplate };
