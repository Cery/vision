#!/usr/bin/env node

/**
 * 首页图片使用情况分析工具
 * 检查首页所有图片的加载状态、路径正确性和显示问题
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    homepageFile: 'public/index.html',
    staticDir: 'static',
    
    // 需要检查的图片模式
    imagePatterns: [
        /src=["']([^"']*\.(?:jpg|jpeg|png|webp|svg|gif))["']/gi,
        /srcset=["']([^"']*\.(?:jpg|jpeg|png|webp|svg|gif)[^"']*)["']/gi,
        /background-image:\s*url\(["']?([^"')]*\.(?:jpg|jpeg|png|webp|svg|gif))["']?\)/gi
    ],
    
    // 外部图片服务
    externalServices: [
        'picsum.photos',
        'placeholder.com',
        'via.placeholder.com',
        'unsplash.com',
        'images.unsplash.com'
    ]
};

/**
 * 分析首页HTML文件
 */
async function analyzeHomepageImages() {
    try {
        const content = await fs.readFile(config.homepageFile, 'utf8');
        
        const analysis = {
            totalImages: 0,
            localImages: 0,
            externalImages: 0,
            missingImages: 0,
            newPathImages: 0,
            oldPathImages: 0,
            issues: [],
            images: []
        };
        
        // 提取所有图片引用
        for (const pattern of config.imagePatterns) {
            const matches = [...content.matchAll(pattern)];
            
            for (const match of matches) {
                let imagePath = match[1];
                
                // 处理srcset中的多个图片
                if (imagePath.includes(',')) {
                    const srcsetImages = imagePath.split(',').map(item => {
                        const parts = item.trim().split(/\s+/);
                        return parts[0];
                    });
                    
                    for (const img of srcsetImages) {
                        await analyzeImage(img, analysis, content);
                    }
                } else {
                    await analyzeImage(imagePath, analysis, content);
                }
            }
        }
        
        return analysis;
        
    } catch (error) {
        throw new Error(`分析首页失败: ${error.message}`);
    }
}

/**
 * 分析单个图片
 */
async function analyzeImage(imagePath, analysis, content) {
    if (!imagePath || imagePath.startsWith('data:')) {
        return; // 跳过空路径和base64图片
    }
    
    analysis.totalImages++;
    
    const imageInfo = {
        path: imagePath,
        type: 'unknown',
        exists: false,
        isExternal: false,
        isNewPath: false,
        issues: []
    };
    
    // 检查是否为外部图片
    for (const service of config.externalServices) {
        if (imagePath.includes(service)) {
            imageInfo.isExternal = true;
            imageInfo.type = 'external';
            analysis.externalImages++;
            imageInfo.issues.push(`使用外部图片服务: ${service}`);
            break;
        }
    }
    
    if (!imageInfo.isExternal) {
        // 本地图片
        analysis.localImages++;
        
        // 检查是否为新路径结构
        if (imagePath.includes('/images/content/') || 
            imagePath.includes('/images/assets/') || 
            imagePath.includes('/images/banners/') || 
            imagePath.includes('/images/optimized/')) {
            imageInfo.isNewPath = true;
            imageInfo.type = 'new-path';
            analysis.newPathImages++;
        } else {
            imageInfo.type = 'old-path';
            analysis.oldPathImages++;
        }
        
        // 检查文件是否存在
        const staticPath = path.join(config.staticDir, imagePath.replace(/^\//, ''));
        try {
            await fs.access(staticPath);
            imageInfo.exists = true;
        } catch {
            imageInfo.exists = false;
            analysis.missingImages++;
            imageInfo.issues.push('文件不存在');
        }
        
        // 检查路径编码问题
        if (imagePath.includes('%')) {
            imageInfo.issues.push('路径包含URL编码');
        }
        
        // 检查文件名长度
        const fileName = path.basename(imagePath);
        if (fileName.length > 100) {
            imageInfo.issues.push('文件名过长');
        }
    }
    
    analysis.images.push(imageInfo);
    
    // 添加到问题列表
    if (imageInfo.issues.length > 0) {
        analysis.issues.push({
            path: imagePath,
            issues: imageInfo.issues
        });
    }
}

/**
 * 检查特定区域的图片使用
 */
async function analyzeImagesBySection() {
    try {
        const content = await fs.readFile(config.homepageFile, 'utf8');
        
        const sections = {
            header: extractSection(content, /<header[^>]*>/, /<\/header>/),
            carousel: extractSection(content, /carousel/, /\/carousel/),
            partners: extractSection(content, /partner-companies-section/, /\/section/),
            cases: extractSection(content, /application-cases/, /\/section/),
            news: extractSection(content, /news-center/, /\/section/),
            footer: extractSection(content, /<footer[^>]*>/, /<\/footer>/)
        };
        
        const sectionAnalysis = {};
        
        for (const [sectionName, sectionContent] of Object.entries(sections)) {
            if (sectionContent) {
                sectionAnalysis[sectionName] = await analyzeSectionImages(sectionContent);
            }
        }
        
        return sectionAnalysis;
        
    } catch (error) {
        throw new Error(`按区域分析失败: ${error.message}`);
    }
}

/**
 * 提取页面区域内容
 */
function extractSection(content, startPattern, endPattern) {
    const startMatch = content.search(startPattern);
    if (startMatch === -1) return null;
    
    const endMatch = content.search(endPattern);
    if (endMatch === -1) return content.substring(startMatch);
    
    return content.substring(startMatch, endMatch);
}

/**
 * 分析区域内的图片
 */
async function analyzeSectionImages(sectionContent) {
    const images = [];
    
    for (const pattern of config.imagePatterns) {
        const matches = [...sectionContent.matchAll(pattern)];
        
        for (const match of matches) {
            const imagePath = match[1];
            if (imagePath && !imagePath.startsWith('data:')) {
                images.push(imagePath);
            }
        }
    }
    
    return {
        imageCount: images.length,
        images: images,
        hasExternalImages: images.some(img => 
            config.externalServices.some(service => img.includes(service))
        )
    };
}

/**
 * 生成修复建议
 */
function generateFixSuggestions(analysis) {
    const suggestions = [];
    
    if (analysis.externalImages > 0) {
        suggestions.push({
            priority: 'high',
            issue: `发现 ${analysis.externalImages} 个外部图片引用`,
            solution: '替换为本地图片，避免外部依赖',
            action: '更新模板文件，使用本地图片路径'
        });
    }
    
    if (analysis.missingImages > 0) {
        suggestions.push({
            priority: 'high',
            issue: `发现 ${analysis.missingImages} 个缺失的图片文件`,
            solution: '检查文件路径，确保图片文件存在',
            action: '修复路径或添加缺失的图片文件'
        });
    }
    
    if (analysis.oldPathImages > 0) {
        suggestions.push({
            priority: 'medium',
            issue: `发现 ${analysis.oldPathImages} 个使用旧路径的图片`,
            solution: '更新为新的路径结构',
            action: '使用智能图片组件自动处理路径'
        });
    }
    
    // 检查路径编码问题
    const encodedPaths = analysis.images.filter(img => img.path.includes('%'));
    if (encodedPaths.length > 0) {
        suggestions.push({
            priority: 'medium',
            issue: `发现 ${encodedPaths.length} 个包含URL编码的路径`,
            solution: '使用正确的文件名，避免特殊字符',
            action: '重命名文件或更新路径引用'
        });
    }
    
    return suggestions;
}

/**
 * 生成分析报告
 */
async function generateReport(analysis, sectionAnalysis) {
    const suggestions = generateFixSuggestions(analysis);
    
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_images: analysis.totalImages,
            local_images: analysis.localImages,
            external_images: analysis.externalImages,
            missing_images: analysis.missingImages,
            new_path_images: analysis.newPathImages,
            old_path_images: analysis.oldPathImages,
            total_issues: analysis.issues.length
        },
        sections: sectionAnalysis,
        issues: analysis.issues,
        suggestions: suggestions,
        detailed_analysis: analysis.images
    };
    
    try {
        await fs.mkdir('scripts/reports', { recursive: true });
        const reportPath = 'scripts/reports/homepage-image-analysis.json';
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
        console.log(`✓ 分析报告已保存: ${reportPath}`);
    } catch (error) {
        console.log(`⚠️ 保存报告失败: ${error.message}`);
    }
    
    return report;
}

/**
 * 主函数
 */
async function main() {
    console.log('🔍 VisNDT 首页图片使用情况分析');
    console.log('='.repeat(40));
    
    try {
        // 整体分析
        console.log('\n📊 分析首页图片使用情况...');
        const analysis = await analyzeHomepageImages();
        
        // 按区域分析
        console.log('📋 按区域分析图片使用...');
        const sectionAnalysis = await analyzeImagesBySection();
        
        // 生成报告
        const report = await generateReport(analysis, sectionAnalysis);
        
        // 显示结果
        console.log('\n' + '='.repeat(40));
        console.log('📈 分析结果');
        
        console.log('\n📊 图片统计:');
        console.log(`  • 总图片数: ${report.summary.total_images}`);
        console.log(`  • 本地图片: ${report.summary.local_images}`);
        console.log(`  • 外部图片: ${report.summary.external_images}`);
        console.log(`  • 缺失图片: ${report.summary.missing_images}`);
        console.log(`  • 新路径图片: ${report.summary.new_path_images}`);
        console.log(`  • 旧路径图片: ${report.summary.old_path_images}`);
        
        console.log('\n📋 区域分析:');
        for (const [section, data] of Object.entries(sectionAnalysis)) {
            if (data) {
                const status = data.hasExternalImages ? '⚠️' : '✅';
                console.log(`  ${status} ${section}: ${data.imageCount} 张图片`);
            }
        }
        
        if (report.issues.length > 0) {
            console.log('\n⚠️ 发现的问题:');
            report.issues.slice(0, 5).forEach((issue, index) => {
                console.log(`  ${index + 1}. ${issue.path}`);
                issue.issues.forEach(i => console.log(`     - ${i}`));
            });
            
            if (report.issues.length > 5) {
                console.log(`  ... 还有 ${report.issues.length - 5} 个问题`);
            }
        }
        
        if (report.suggestions.length > 0) {
            console.log('\n💡 修复建议:');
            report.suggestions.forEach((suggestion, index) => {
                const priority = suggestion.priority === 'high' ? '🔴' : '🟡';
                console.log(`  ${priority} ${suggestion.issue}`);
                console.log(`     解决方案: ${suggestion.solution}`);
            });
        }
        
        console.log('\n✅ 分析完成！');
        
    } catch (error) {
        console.error('\n❌ 分析失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    analyzeHomepageImages,
    analyzeImagesBySection,
    generateFixSuggestions
};
