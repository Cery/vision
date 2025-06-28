#!/usr/bin/env node

/**
 * 简化的新闻图片替换脚本
 * 替换新闻文章中的外部图片为本地图片
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    newsDir: 'content/news',
    newsImages: [
        '/images/news/news-1.jpeg',
        '/images/news/news-2.jpeg', 
        '/images/news/news-3.jpeg',
        '/images/news/news-4.jpeg',
        '/images/news/news-5.jpeg',
        '/images/news/news-6.jpeg',
        '/images/news/行业资讯.png',
        '/images/news/新闻.webp',
        '/images/news/展会.webp'
    ],
    
    // 分类图片映射
    categoryImages: {
        '行业资讯': '/images/news/行业资讯.png',
        '展会资讯': '/images/news/展会.webp',
        '技术文章': '/images/news/新闻.webp'
    }
};

/**
 * 获取所有新闻文件
 */
async function getNewsFiles() {
    try {
        const files = await fs.readdir(config.newsDir);
        return files.filter(file => file.endsWith('.md') && file !== '_index.md')
                   .map(file => path.join(config.newsDir, file));
    } catch (error) {
        console.log('读取新闻目录失败:', error.message);
        return [];
    }
}

/**
 * 处理单个文件
 */
async function processFile(filePath, imageIndex) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        let newContent = content;
        let changes = 0;
        
        // 选择图片
        const selectedImage = config.newsImages[imageIndex % config.newsImages.length];
        
        // 1. 添加或更新 featured_image
        const frontMatterMatch = content.match(/^(---\n)([\s\S]*?)(\n---)/);
        if (frontMatterMatch) {
            const [fullMatch, start, frontMatter, end] = frontMatterMatch;
            
            if (frontMatter.includes('featured_image:')) {
                // 替换现有的
                const updatedFrontMatter = frontMatter.replace(
                    /featured_image:\s*[^\n]*/,
                    `featured_image: "${selectedImage}"`
                );
                newContent = newContent.replace(fullMatch, start + updatedFrontMatter + end);
                changes++;
            } else {
                // 添加新的
                const updatedFrontMatter = frontMatter + `\nfeatured_image: "${selectedImage}"`;
                newContent = newContent.replace(fullMatch, start + updatedFrontMatter + end);
                changes++;
            }
        }
        
        // 2. 替换文章中的外部图片链接
        const externalImagePatterns = [
            /https:\/\/picsum\.photos\/[^)\s"'\]]+/g,
            /https:\/\/via\.placeholder\.com\/[^)\s"'\]]+/g,
            /https:\/\/placeholder\.com\/[^)\s"'\]]+/g
        ];
        
        for (const pattern of externalImagePatterns) {
            const matches = [...content.matchAll(pattern)];
            for (let i = 0; i < matches.length; i++) {
                const match = matches[i];
                const originalUrl = match[0];
                const replacementImage = config.newsImages[(imageIndex + i) % config.newsImages.length];
                newContent = newContent.replace(originalUrl, replacementImage);
                changes++;
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
            selectedImage
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
 * 主函数
 */
async function main() {
    console.log('📰 新闻图片替换工具');
    console.log('='.repeat(40));
    
    try {
        // 获取文件
        console.log('\n📁 扫描新闻文章...');
        const files = await getNewsFiles();
        console.log(`找到 ${files.length} 篇文章`);
        
        if (files.length === 0) {
            console.log('没有找到新闻文章');
            return;
        }
        
        // 处理文件
        console.log('\n⚙️ 处理文章...');
        const results = [];
        
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const result = await processFile(file, i);
            results.push(result);
            
            if (result.success && result.changes > 0) {
                console.log(`✓ ${result.file} (${result.changes} 处修改)`);
            } else if (result.success) {
                console.log(`- ${result.file} (无需修改)`);
            } else {
                console.log(`✗ ${result.file} (${result.error})`);
            }
        }
        
        // 统计结果
        const successful = results.filter(r => r.success).length;
        const withChanges = results.filter(r => r.changes > 0).length;
        const totalChanges = results.reduce((sum, r) => sum + r.changes, 0);
        
        console.log('\n' + '='.repeat(40));
        console.log('🎉 处理完成！');
        console.log(`\n📊 统计:`);
        console.log(`  • 总文章数: ${files.length}`);
        console.log(`  • 成功处理: ${successful}`);
        console.log(`  • 有修改的: ${withChanges}`);
        console.log(`  • 总修改数: ${totalChanges}`);
        
        console.log('\n🖼️ 使用的图片:');
        config.newsImages.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img}`);
        });
        
        console.log('\n💡 下一步:');
        console.log('  1. 重新构建网站');
        console.log('  2. 检查图片显示效果');
        
    } catch (error) {
        console.error('处理失败:', error.message);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = { processFile, getNewsFiles, config };
