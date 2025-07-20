#!/usr/bin/env node

/**
 * 批量更新新闻文章的featured_image
 */

const fs = require('fs').promises;
const path = require('path');

// 新闻文章配置
const newsConfig = [
    // 行业资讯类
    { file: 'industry-news-1.md', image: '/images/news/行业资讯.png' },
    { file: 'industry-news-2.md', image: '/images/news/news-1.jpeg' },
    { file: 'industry-news-3.md', image: '/images/news/news-2.jpeg' },
    { file: 'industry-news-4.md', image: '/images/news/news-3.jpeg' },
    { file: 'industry-news-5.md', image: '/images/news/news-4.jpeg' },
    
    // 展会资讯类
    { file: 'exhibition-news-1.md', image: '/images/news/展会.webp' },
    { file: 'exhibition-news-2.md', image: '/images/news/news-5.jpeg' },
    { file: 'exhibition-news-3.md', image: '/images/news/news-6.jpeg' },
    { file: 'exhibition-news-4.md', image: '/images/news/news-1.jpeg' },
    { file: 'exhibition-news-5.md', image: '/images/news/news-2.jpeg' },
    { file: 'exhibition-news-6.md', image: '/images/news/news-3.jpeg' },
    { file: 'exhibition-news-7.md', image: '/images/news/news-4.jpeg' },
    { file: 'exhibition-news-8.md', image: '/images/news/news-5.jpeg' },
    { file: 'exhibition-news-9.md', image: '/images/news/news-6.jpeg' },
    { file: 'exhibition-news-10.md', image: '/images/news/展会.webp' },
    { file: 'exhibition-news-11.md', image: '/images/news/news-1.jpeg' },
    { file: 'exhibition-news-12.md', image: '/images/news/news-2.jpeg' },
    
    // 技术文章类
    { file: 'tech-article-1.md', image: '/images/news/新闻.webp' },
    { file: 'tech-article-2.md', image: '/images/news/news-3.jpeg' },
    { file: 'tech-article-3.md', image: '/images/news/news-4.jpeg' },
    { file: 'tech-article-4.md', image: '/images/news/news-5.jpeg' },
    { file: 'tech-article-5.md', image: '/images/news/news-6.jpeg' },
    
    // 其他文章
    { file: '2024-01-16-exhibition-news.md', image: '/images/news/展会.webp' },
    { file: '2024-01-20-product-launch.md', image: '/images/news/news-1.jpeg' },
    { file: '2024-03-14-tech-trends.md', image: '/images/news/新闻.webp' }
];

async function updateNewsFile(fileName, imagePath) {
    const filePath = path.join('content/news', fileName);
    
    try {
        // 检查文件是否存在
        await fs.access(filePath);
        
        // 读取文件内容
        const content = await fs.readFile(filePath, 'utf8');
        
        // 检查是否有front matter
        const frontMatterMatch = content.match(/^(---\n)([\s\S]*?)(\n---)/);
        
        if (!frontMatterMatch) {
            console.log(`⚠️ ${fileName}: 没有找到front matter`);
            return false;
        }
        
        const [fullMatch, start, frontMatter, end] = frontMatterMatch;
        
        // 检查是否已有featured_image
        if (frontMatter.includes('featured_image:')) {
            // 替换现有的featured_image
            const updatedFrontMatter = frontMatter.replace(
                /featured_image:\s*[^\n]*/,
                `featured_image: "${imagePath}"`
            );
            const newContent = content.replace(fullMatch, start + updatedFrontMatter + end);
            await fs.writeFile(filePath, newContent, 'utf8');
            console.log(`✓ ${fileName}: 更新featured_image`);
        } else {
            // 添加featured_image
            const updatedFrontMatter = frontMatter + `\nfeatured_image: "${imagePath}"`;
            const newContent = content.replace(fullMatch, start + updatedFrontMatter + end);
            await fs.writeFile(filePath, newContent, 'utf8');
            console.log(`✓ ${fileName}: 添加featured_image`);
        }
        
        return true;
        
    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(`⚠️ ${fileName}: 文件不存在`);
        } else {
            console.log(`✗ ${fileName}: ${error.message}`);
        }
        return false;
    }
}

async function main() {
    console.log('📰 批量更新新闻文章图片');
    console.log('='.repeat(40));
    
    let successCount = 0;
    let totalCount = newsConfig.length;
    
    for (const config of newsConfig) {
        const success = await updateNewsFile(config.file, config.image);
        if (success) {
            successCount++;
        }
    }
    
    console.log('\n' + '='.repeat(40));
    console.log('🎉 批量更新完成！');
    console.log(`📊 成功: ${successCount}/${totalCount}`);
    
    console.log('\n💡 下一步:');
    console.log('  1. 重新构建网站: hugo --gc --minify');
    console.log('  2. 检查新闻页面图片显示');
}

if (require.main === module) {
    main();
}

module.exports = { updateNewsFile, newsConfig };
