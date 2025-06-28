#!/usr/bin/env node

/**
 * 替换新闻文章封面图片脚本
 * 将所有新闻文章中的外部图片链接替换为本地 static/images/news/ 中的图片
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    newsDir: 'content/news',
    newsImageDir: 'static/images/news',
    supportedExtensions: ['.md'],
    
    // 本地新闻图片映射
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
    categoryImageMapping: {
        '行业资讯': '/images/news/行业资讯.png',
        '展会资讯': '/images/news/展会.webp',
        '技术文章': '/images/news/新闻.webp',
        '产品发布': '/images/news/news-1.jpeg',
        '公司新闻': '/images/news/news-2.jpeg'
    },
    
    // 外部图片服务模式
    externalImagePatterns: [
        /https:\/\/picsum\.photos\/[^)\s"']+/g,
        /https:\/\/via\.placeholder\.com\/[^)\s"']+/g,
        /https:\/\/placeholder\.com\/[^)\s"']+/g,
        /https:\/\/dummyimage\.com\/[^)\s"']+/g
    ],
    
    // 备份目录
    backupDir: 'backups/news-images-replacement'
};

/**
 * 获取所有新闻文章文件
 */
async function getNewsFiles() {
    try {
        const files = await fs.readdir(config.newsDir);
        return files.filter(file => {
            const ext = path.extname(file);
            return config.supportedExtensions.includes(ext) && file !== '_index.md';
        }).map(file => path.join(config.newsDir, file));
    } catch (error) {
        console.error('读取新闻目录失败:', error.message);
        return [];
    }
}

/**
 * 分析文章内容，提取元数据
 */
async function analyzeArticle(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        
        // 提取 front matter
        const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
        let frontMatter = {};
        
        if (frontMatterMatch) {
            const frontMatterText = frontMatterMatch[1];
            
            // 简单解析 YAML front matter
            const lines = frontMatterText.split('\n');
            for (const line of lines) {
                const match = line.match(/^(\w+):\s*(.+)$/);
                if (match) {
                    const [, key, value] = match;
                    if (key === 'categories' || key === 'tags') {
                        // 处理数组
                        frontMatter[key] = value.replace(/[\[\]"']/g, '').split(',').map(s => s.trim());
                    } else {
                        frontMatter[key] = value.replace(/['"]/g, '');
                    }
                }
            }
        }
        
        // 查找文章中的图片
        const imageMatches = [];
        for (const pattern of config.externalImagePatterns) {
            const matches = [...content.matchAll(pattern)];
            imageMatches.push(...matches.map(m => m[0]));
        }
        
        return {
            filePath,
            content,
            frontMatter,
            externalImages: [...new Set(imageMatches)],
            hasExternalImages: imageMatches.length > 0
        };
        
    } catch (error) {
        console.error(`分析文章失败 ${filePath}:`, error.message);
        return null;
    }
}

/**
 * 根据文章类型选择合适的本地图片
 */
function selectLocalImage(article, imageIndex = 0) {
    const { frontMatter } = article;
    
    // 优先根据分类选择图片
    if (frontMatter.categories && frontMatter.categories.length > 0) {
        const category = frontMatter.categories[0];
        if (config.categoryImageMapping[category]) {
            return config.categoryImageMapping[category];
        }
    }
    
    // 根据标题关键词选择
    const title = frontMatter.title || '';
    if (title.includes('展会') || title.includes('会议')) {
        return config.categoryImageMapping['展会资讯'];
    }
    if (title.includes('技术') || title.includes('创新')) {
        return config.categoryImageMapping['技术文章'];
    }
    if (title.includes('产品') || title.includes('发布')) {
        return config.categoryImageMapping['产品发布'];
    }
    
    // 默认按索引循环选择
    const imagePool = config.newsImages.filter(img => 
        !Object.values(config.categoryImageMapping).includes(img)
    );
    return imagePool[imageIndex % imagePool.length];
}

/**
 * 添加 featured_image 到 front matter
 */
function addFeaturedImageToFrontMatter(content, imagePath) {
    const frontMatterMatch = content.match(/^(---\n)([\s\S]*?)(\n---)/);
    
    if (frontMatterMatch) {
        const [, start, frontMatterContent, end] = frontMatterMatch;
        
        // 检查是否已有 featured_image
        if (frontMatterContent.includes('featured_image:')) {
            // 替换现有的 featured_image
            const updatedFrontMatter = frontMatterContent.replace(
                /featured_image:\s*[^\n]*/,
                `featured_image: "${imagePath}"`
            );
            return content.replace(frontMatterMatch[0], start + updatedFrontMatter + end);
        } else {
            // 添加新的 featured_image
            const updatedFrontMatter = frontMatterContent + `\nfeatured_image: "${imagePath}"`;
            return content.replace(frontMatterMatch[0], start + updatedFrontMatter + end);
        }
    }
    
    return content;
}

/**
 * 替换文章中的外部图片链接
 */
function replaceExternalImages(content, article, selectedImage) {
    let updatedContent = content;
    let replacementCount = 0;
    
    // 替换所有外部图片链接
    for (const pattern of config.externalImagePatterns) {
        const matches = [...content.matchAll(pattern)];
        
        for (let i = 0; i < matches.length; i++) {
            const match = matches[i];
            const originalUrl = match[0];
            
            // 为不同的图片选择不同的本地图片
            let replacementImage;
            if (i === 0) {
                replacementImage = selectedImage;
            } else {
                const imageIndex = i % config.newsImages.length;
                replacementImage = config.newsImages[imageIndex];
            }
            
            updatedContent = updatedContent.replace(originalUrl, replacementImage);
            replacementCount++;
        }
    }
    
    return { updatedContent, replacementCount };
}

/**
 * 处理单个新闻文章
 */
async function processNewsArticle(article, imageIndex) {
    try {
        // 选择本地图片
        const selectedImage = selectLocalImage(article, imageIndex);
        
        // 添加 featured_image 到 front matter
        let updatedContent = addFeaturedImageToFrontMatter(article.content, selectedImage);
        
        // 替换文章内容中的外部图片
        const { updatedContent: finalContent, replacementCount } = replaceExternalImages(
            updatedContent, 
            article, 
            selectedImage
        );
        
        // 创建备份
        const backupPath = path.join(config.backupDir, path.basename(article.filePath));
        await fs.mkdir(config.backupDir, { recursive: true });
        await fs.copyFile(article.filePath, backupPath);
        
        // 写入更新后的内容
        await fs.writeFile(article.filePath, finalContent, 'utf8');
        
        return {
            success: true,
            filePath: article.filePath,
            selectedImage,
            replacementCount,
            hasExternalImages: article.hasExternalImages,
            backedUp: true
        };
        
    } catch (error) {
        return {
            success: false,
            filePath: article.filePath,
            error: error.message,
            hasExternalImages: article.hasExternalImages,
            backedUp: false
        };
    }
}

/**
 * 生成处理报告
 */
async function generateReport(results) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_articles: results.length,
            processed_articles: results.filter(r => r.success).length,
            failed_articles: results.filter(r => !r.success).length,
            articles_with_external_images: results.filter(r => r.hasExternalImages).length,
            total_image_replacements: results.reduce((sum, r) => sum + (r.replacementCount || 0), 0),
            backed_up_articles: results.filter(r => r.backedUp).length
        },
        image_usage: {},
        details: results.map(result => ({
            file: path.basename(result.filePath),
            success: result.success,
            selected_image: result.selectedImage || null,
            replacement_count: result.replacementCount || 0,
            had_external_images: result.hasExternalImages,
            backed_up: result.backedUp,
            error: result.error || null
        }))
    };
    
    // 统计图片使用情况
    results.forEach(result => {
        if (result.selectedImage) {
            report.image_usage[result.selectedImage] = 
                (report.image_usage[result.selectedImage] || 0) + 1;
        }
    });
    
    try {
        await fs.mkdir('scripts/reports', { recursive: true });
        const reportPath = 'scripts/reports/news-images-replacement-report.json';
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`✓ 报告已保存: ${reportPath}`);
    } catch (error) {
        console.log(`⚠️ 保存报告失败: ${error.message}`);
    }
    
    return report;
}

/**
 * 主函数
 */
async function main() {
    console.log('📰 VisNDT 新闻图片替换工具');
    console.log('='.repeat(50));
    
    try {
        // 获取所有新闻文章
        console.log('\n📁 扫描新闻文章...');
        const newsFiles = await getNewsFiles();
        console.log(`✓ 找到 ${newsFiles.length} 篇新闻文章`);
        
        if (newsFiles.length === 0) {
            console.log('⚠️ 没有找到新闻文章');
            return;
        }
        
        // 分析所有文章
        console.log('\n🔍 分析文章内容...');
        const articles = [];
        for (const file of newsFiles) {
            const article = await analyzeArticle(file);
            if (article) {
                articles.push(article);
            }
        }
        
        console.log(`✓ 成功分析 ${articles.length} 篇文章`);
        console.log(`✓ 其中 ${articles.filter(a => a.hasExternalImages).length} 篇包含外部图片`);
        
        // 显示可用的本地图片
        console.log('\n🖼️ 可用的本地图片:');
        config.newsImages.forEach((img, index) => {
            console.log(`  ${index + 1}. ${img}`);
        });
        
        // 处理所有文章
        console.log('\n⚙️ 处理文章...');
        const results = [];
        
        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            const fileName = path.basename(article.filePath);
            
            process.stdout.write(`\r处理进度: ${i + 1}/${articles.length} - ${fileName}`);
            
            const result = await processNewsArticle(article, i);
            results.push(result);
        }
        
        console.log('\n');
        
        // 生成报告
        console.log('📊 生成报告...');
        const report = await generateReport(results);
        
        // 显示结果
        console.log('\n' + '='.repeat(50));
        console.log('🎉 新闻图片替换完成！');
        
        console.log('\n📊 处理统计:');
        console.log(`  • 总文章数: ${report.summary.total_articles}`);
        console.log(`  • 成功处理: ${report.summary.processed_articles}`);
        console.log(`  • 处理失败: ${report.summary.failed_articles}`);
        console.log(`  • 包含外部图片: ${report.summary.articles_with_external_images}`);
        console.log(`  • 图片替换次数: ${report.summary.total_image_replacements}`);
        console.log(`  • 备份文章数: ${report.summary.backed_up_articles}`);
        
        console.log('\n🖼️ 图片使用统计:');
        Object.entries(report.image_usage).forEach(([image, count]) => {
            console.log(`  • ${image}: ${count} 次`);
        });
        
        if (report.summary.failed_articles > 0) {
            console.log('\n❌ 失败的文章:');
            results.filter(r => !r.success).forEach(result => {
                console.log(`  • ${path.basename(result.filePath)}: ${result.error}`);
            });
        }
        
        console.log('\n📁 文件位置:');
        console.log(`  • 备份目录: ${config.backupDir}/`);
        console.log(`  • 处理报告: scripts/reports/news-images-replacement-report.json`);
        
        console.log('\n💡 下一步:');
        console.log('  1. 检查更新后的文章内容');
        console.log('  2. 重新构建网站: hugo --gc --minify');
        console.log('  3. 验证图片显示效果');
        
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
    getNewsFiles,
    analyzeArticle,
    selectLocalImage,
    processNewsArticle,
    config
};
