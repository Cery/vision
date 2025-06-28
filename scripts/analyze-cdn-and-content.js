#!/usr/bin/env node

/**
 * CDN和内容逻辑分析工具
 * 检查项目中的CDN配置和首页内容逻辑问题
 */

const fs = require('fs').promises;
const path = require('path');

// CDN相关配置检查
const cdnAnalysis = {
    // 外部CDN资源
    externalCDNs: [
        'https://cdn.jsdelivr.net',
        'https://cdnjs.cloudflare.com',
        'https://unpkg.com',
        'https://identity.netlify.com'
    ],
    
    // 可能影响显示的配置
    potentialIssues: [
        {
            file: 'netlify.toml',
            issue: 'CSP策略允许外部图片域名',
            impact: '可能影响图片加载',
            line: 'img-src \'self\' data: https://picsum.photos https://fastly.picsum.photos'
        },
        {
            file: 'layouts/partials/head.html',
            issue: 'Bootstrap和FontAwesome使用CDN',
            impact: '网络问题时可能影响样式',
            line: 'Bootstrap CSS和Font Awesome从CDN加载'
        },
        {
            file: 'static/admin/index.html',
            issue: 'CMS管理界面使用多个CDN',
            impact: '管理界面可能受网络影响',
            line: 'Bootstrap, FontAwesome, Netlify Identity, Decap CMS'
        }
    ]
};

// 内容逻辑问题分析
const contentLogicIssues = {
    applicationAreas: {
        homepageConfig: {
            source: 'content/_index.md',
            path: 'application_areas_display.areas',
            type: 'hardcoded',
            description: '首页应用领域使用硬编码配置'
        },
        actualPages: {
            source: 'content/applications/*.md',
            type: 'dynamic',
            description: '实际应用领域页面是独立的Markdown文件'
        },
        inconsistencies: [
            {
                issue: '图片路径不一致',
                homepage: '/images/banners/category/air-1.jpg',
                actualPage: 'https://picsum.photos/800/400?random=aerospace',
                impact: '首页显示的图片与详情页不匹配'
            },
            {
                issue: '内容来源不同',
                homepage: '硬编码在_index.md中',
                actualPage: '来自独立的应用领域页面',
                impact: '内容更新时需要两处维护'
            },
            {
                issue: '链接指向问题',
                homepage: '/applications/aerospace',
                actualPage: '存在对应页面',
                impact: '链接正确但内容不同步'
            }
        ]
    }
};

/**
 * 分析CDN配置
 */
async function analyzeCDNConfig() {
    console.log('🌐 CDN配置分析');
    console.log('='.repeat(40));
    
    const results = {
        externalDependencies: [],
        potentialRisks: [],
        recommendations: []
    };
    
    // 检查netlify.toml
    try {
        const netlifyConfig = await fs.readFile('netlify.toml', 'utf8');
        
        // 检查CSP策略
        if (netlifyConfig.includes('picsum.photos')) {
            results.potentialRisks.push({
                type: 'CSP允许外部图片域名',
                file: 'netlify.toml',
                description: 'CSP策略允许picsum.photos，但项目已不使用外部图片',
                severity: 'low',
                recommendation: '移除不必要的外部图片域名'
            });
        }
        
        // 检查CDN域名
        cdnAnalysis.externalCDNs.forEach(cdn => {
            if (netlifyConfig.includes(cdn)) {
                results.externalDependencies.push({
                    domain: cdn,
                    usage: 'CSP策略中允许',
                    risk: 'medium'
                });
            }
        });
        
    } catch (error) {
        console.log('⚠️ 无法读取netlify.toml');
    }
    
    // 检查HTML模板中的CDN使用
    try {
        const headTemplate = await fs.readFile('layouts/partials/head.html', 'utf8');
        
        if (headTemplate.includes('cdn.jsdelivr.net')) {
            results.externalDependencies.push({
                domain: 'cdn.jsdelivr.net',
                usage: 'Bootstrap CSS',
                risk: 'medium',
                fallback: 'none'
            });
        }
        
        if (headTemplate.includes('cdnjs.cloudflare.com')) {
            results.externalDependencies.push({
                domain: 'cdnjs.cloudflare.com',
                usage: 'Font Awesome',
                risk: 'medium',
                fallback: 'none'
            });
        }
        
    } catch (error) {
        console.log('⚠️ 无法读取head.html');
    }
    
    return results;
}

/**
 * 分析内容逻辑问题
 */
async function analyzeContentLogic() {
    console.log('\n📄 内容逻辑分析');
    console.log('='.repeat(40));
    
    const results = {
        inconsistencies: [],
        recommendations: []
    };
    
    try {
        // 读取首页配置
        const indexContent = await fs.readFile('content/_index.md', 'utf8');
        
        // 提取应用领域配置
        const areasMatch = indexContent.match(/application_areas_display:([\s\S]*?)(?=\n\w+:|$)/);
        if (areasMatch) {
            console.log('✓ 找到首页应用领域配置');
            
            // 检查图片路径
            const imageMatches = [...areasMatch[1].matchAll(/image:\s*["']([^"']+)["']/g)];
            const homepageImages = imageMatches.map(match => match[1]);
            
            console.log(`✓ 首页配置了 ${homepageImages.length} 个应用领域图片`);
            
            // 检查是否使用外部图片
            const externalImages = homepageImages.filter(img => img.startsWith('http'));
            if (externalImages.length > 0) {
                results.inconsistencies.push({
                    type: '外部图片引用',
                    location: '首页应用领域配置',
                    count: externalImages.length,
                    images: externalImages,
                    severity: 'high'
                });
            }
        }
        
        // 检查应用领域页面
        const applicationsDir = 'content/applications';
        const appFiles = await fs.readdir(applicationsDir);
        const appPages = appFiles.filter(file => file.endsWith('.md') && file !== '_index.md');
        
        console.log(`✓ 找到 ${appPages.length} 个应用领域页面`);
        
        // 检查每个应用领域页面
        for (const file of appPages) {
            const filePath = path.join(applicationsDir, file);
            const content = await fs.readFile(filePath, 'utf8');
            
            // 检查图片配置
            const imageMatch = content.match(/image:\s*["']([^"']+)["']/);
            if (imageMatch) {
                const pageImage = imageMatch[1];
                if (pageImage.startsWith('http')) {
                    results.inconsistencies.push({
                        type: '页面使用外部图片',
                        location: file,
                        image: pageImage,
                        severity: 'high'
                    });
                }
            }
        }
        
    } catch (error) {
        console.error('分析内容逻辑失败:', error.message);
    }
    
    return results;
}

/**
 * 生成修复建议
 */
function generateRecommendations(cdnResults, contentResults) {
    const recommendations = [];
    
    // CDN相关建议
    if (cdnResults.externalDependencies.length > 0) {
        recommendations.push({
            category: 'CDN优化',
            priority: 'medium',
            title: '考虑本地化外部资源',
            description: '将Bootstrap和Font Awesome下载到本地，减少外部依赖',
            benefits: ['提高加载速度', '减少网络依赖', '提升稳定性']
        });
    }
    
    // 内容逻辑建议
    if (contentResults.inconsistencies.length > 0) {
        recommendations.push({
            category: '内容同步',
            priority: 'high',
            title: '统一应用领域内容管理',
            description: '让首页应用领域动态读取实际页面内容，而不是硬编码',
            benefits: ['内容一致性', '维护简化', '数据同步']
        });
        
        recommendations.push({
            category: '图片管理',
            priority: 'high',
            title: '替换外部图片为本地图片',
            description: '将所有外部图片替换为本地图片资源',
            benefits: ['加载稳定', '无外部依赖', '更好的缓存控制']
        });
    }
    
    return recommendations;
}

/**
 * 主函数
 */
async function main() {
    console.log('🔍 VisNDT CDN和内容逻辑分析工具');
    console.log('='.repeat(50));
    
    try {
        // CDN分析
        const cdnResults = await analyzeCDNConfig();
        
        // 内容逻辑分析
        const contentResults = await analyzeContentLogic();
        
        // 生成建议
        const recommendations = generateRecommendations(cdnResults, contentResults);
        
        // 输出结果
        console.log('\n📊 分析结果');
        console.log('='.repeat(40));
        
        console.log('\n🌐 CDN依赖:');
        cdnResults.externalDependencies.forEach(dep => {
            console.log(`  • ${dep.domain} - ${dep.usage} (风险: ${dep.risk})`);
        });
        
        console.log('\n⚠️ 发现的问题:');
        [...cdnResults.potentialRisks, ...contentResults.inconsistencies].forEach((issue, index) => {
            console.log(`  ${index + 1}. ${issue.type || issue.issue}`);
            console.log(`     位置: ${issue.file || issue.location}`);
            console.log(`     影响: ${issue.impact || issue.description}`);
        });
        
        console.log('\n💡 修复建议:');
        recommendations.forEach((rec, index) => {
            console.log(`  ${index + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
            console.log(`     分类: ${rec.category}`);
            console.log(`     描述: ${rec.description}`);
            console.log(`     收益: ${rec.benefits.join(', ')}`);
        });
        
        // 保存详细报告
        const report = {
            timestamp: new Date().toISOString(),
            cdn: cdnResults,
            content: contentResults,
            recommendations
        };
        
        await fs.mkdir('scripts/reports', { recursive: true });
        await fs.writeFile(
            'scripts/reports/cdn-content-analysis.json',
            JSON.stringify(report, null, 2),
            'utf8'
        );
        
        console.log('\n✅ 分析完成！详细报告已保存到 scripts/reports/cdn-content-analysis.json');
        
    } catch (error) {
        console.error('\n❌ 分析失败:', error.message);
        process.exit(1);
    }
}

// 运行分析
if (require.main === module) {
    main();
}

module.exports = {
    analyzeCDNConfig,
    analyzeContentLogic,
    generateRecommendations
};
