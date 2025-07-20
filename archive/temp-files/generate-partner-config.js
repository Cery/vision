#!/usr/bin/env node

/**
 * 自动生成合作伙伴配置脚本
 * 扫描 static/images/partner/ 目录，根据图片文件名自动生成首页合作伙伴配置
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    partnerImageDir: 'static/images/partner',
    indexFile: 'content/_index.md',
    supportedExtensions: ['.png', '.jpg', '.jpeg', '.webp', '.svg'],
    
    // 企业名称映射（如果需要特殊处理）
    nameMapping: {
        // 可以在这里添加特殊的名称映射
        // '文件名': '显示名称'
    },
    
    // 排序优先级（数字越小优先级越高）
    sortPriority: {
        '中国航天': 1,
        '中国航发': 2,
        '中航工业': 3,
        '中航光电': 4,
        '中国商飞': 5,
        '航天科工': 6,
        '兵器工业': 7,
        '中国华能': 8,
        '国家能源集团': 9,
        '中国一汽': 10,
        '比亚迪汽车': 11,
        '理想汽车': 12,
        '潍柴动力': 13,
        '中国中车': 14,
        '三一重工': 15,
        '东方航空': 16,
        '南方航空': 17
    }
};

/**
 * 获取合作伙伴图片文件
 */
async function getPartnerImages() {
    try {
        const files = await fs.readdir(config.partnerImageDir);
        
        const imageFiles = files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return config.supportedExtensions.includes(ext);
        });
        
        return imageFiles.map(file => {
            const nameWithoutExt = path.parse(file).name;
            const displayName = config.nameMapping[nameWithoutExt] || nameWithoutExt;
            const logoPath = `/images/partner/${file}`;
            const priority = config.sortPriority[displayName] || 999;
            
            return {
                fileName: file,
                companyName: displayName,
                logoPath: logoPath,
                priority: priority
            };
        });
        
    } catch (error) {
        console.error('读取合作伙伴图片目录失败:', error.message);
        return [];
    }
}

/**
 * 生成YAML配置
 */
function generatePartnerConfig(partners) {
    // 按优先级排序
    const sortedPartners = partners.sort((a, b) => a.priority - b.priority);
    
    let config = '# 应用企业\n';
    config += 'partner_companies_display:\n';
    config += '  enable: true\n';
    config += '  companies:\n';
    
    sortedPartners.forEach(partner => {
        config += `    - company_name: "${partner.companyName}"\n`;
        config += `      logo: "${partner.logoPath}"\n`;
    });
    
    return config;
}

/**
 * 更新首页配置文件
 */
async function updateIndexFile(newPartnerConfig) {
    try {
        const content = await fs.readFile(config.indexFile, 'utf8');
        
        // 找到应用企业配置的开始和结束位置
        const startPattern = /# 应用企业\npartner_companies_display:/;
        const endPattern = /---\n\n/;
        
        const startMatch = content.match(startPattern);
        if (!startMatch) {
            console.error('未找到应用企业配置开始标记');
            return false;
        }
        
        const startIndex = startMatch.index;
        const afterStart = content.substring(startIndex);
        const endMatch = afterStart.match(endPattern);
        
        if (!endMatch) {
            console.error('未找到配置结束标记');
            return false;
        }
        
        const endIndex = startIndex + endMatch.index;
        
        // 替换配置
        const newContent = content.substring(0, startIndex) + 
                          newPartnerConfig + 
                          content.substring(endIndex);
        
        await fs.writeFile(config.indexFile, newContent, 'utf8');
        return true;
        
    } catch (error) {
        console.error('更新首页配置文件失败:', error.message);
        return false;
    }
}

/**
 * 生成合作伙伴统计报告
 */
function generateReport(partners) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_partners: partners.length,
            image_formats: {},
            categories: {
                aerospace: 0,
                automotive: 0,
                energy: 0,
                manufacturing: 0,
                other: 0
            }
        },
        partners: partners.map(p => ({
            name: p.companyName,
            file: p.fileName,
            path: p.logoPath,
            priority: p.priority
        }))
    };
    
    // 统计图片格式
    partners.forEach(partner => {
        const ext = path.extname(partner.fileName).toLowerCase();
        report.summary.image_formats[ext] = (report.summary.image_formats[ext] || 0) + 1;
    });
    
    // 简单的行业分类（基于企业名称关键词）
    partners.forEach(partner => {
        const name = partner.companyName;
        if (name.includes('航天') || name.includes('航空') || name.includes('航发') || name.includes('中航')) {
            report.summary.categories.aerospace++;
        } else if (name.includes('汽车') || name.includes('一汽') || name.includes('比亚迪') || name.includes('理想') || name.includes('潍柴')) {
            report.summary.categories.automotive++;
        } else if (name.includes('华能') || name.includes('能源')) {
            report.summary.categories.energy++;
        } else if (name.includes('重工') || name.includes('中车') || name.includes('兵器')) {
            report.summary.categories.manufacturing++;
        } else {
            report.summary.categories.other++;
        }
    });
    
    return report;
}

/**
 * 主函数
 */
async function main() {
    console.log('🏢 VisNDT 合作伙伴配置生成器');
    console.log('='.repeat(50));
    
    try {
        // 获取合作伙伴图片
        console.log('\n📁 扫描合作伙伴图片...');
        const partners = await getPartnerImages();
        
        if (partners.length === 0) {
            console.log('⚠️ 未找到合作伙伴图片文件');
            return;
        }
        
        console.log(`✓ 找到 ${partners.length} 个合作伙伴图片`);
        
        // 显示找到的合作伙伴
        console.log('\n🏢 合作伙伴列表:');
        partners.forEach((partner, index) => {
            console.log(`  ${index + 1}. ${partner.companyName} (${partner.fileName})`);
        });
        
        // 生成配置
        console.log('\n⚙️ 生成配置...');
        const partnerConfig = generatePartnerConfig(partners);
        
        // 更新首页文件
        console.log('📝 更新首页配置...');
        const updateSuccess = await updateIndexFile(partnerConfig);
        
        if (updateSuccess) {
            console.log('✓ 首页配置更新成功');
        } else {
            console.log('✗ 首页配置更新失败');
            
            // 输出生成的配置供手动复制
            console.log('\n📋 生成的配置 (请手动复制):');
            console.log('-'.repeat(40));
            console.log(partnerConfig);
            console.log('-'.repeat(40));
        }
        
        // 生成报告
        const report = generateReport(partners);
        
        try {
            await fs.mkdir('scripts/reports', { recursive: true });
            await fs.writeFile(
                'scripts/reports/partner-config-report.json', 
                JSON.stringify(report, null, 2), 
                'utf8'
            );
            console.log('✓ 报告已保存: scripts/reports/partner-config-report.json');
        } catch (error) {
            console.log('⚠️ 保存报告失败:', error.message);
        }
        
        // 显示统计信息
        console.log('\n📊 统计信息:');
        console.log(`  • 总合作伙伴数: ${report.summary.total_partners}`);
        console.log(`  • 航空航天: ${report.summary.categories.aerospace}`);
        console.log(`  • 汽车制造: ${report.summary.categories.automotive}`);
        console.log(`  • 能源电力: ${report.summary.categories.energy}`);
        console.log(`  • 装备制造: ${report.summary.categories.manufacturing}`);
        console.log(`  • 其他行业: ${report.summary.categories.other}`);
        
        console.log('\n📁 图片格式分布:');
        Object.entries(report.summary.image_formats).forEach(([ext, count]) => {
            console.log(`  • ${ext}: ${count} 个`);
        });
        
        console.log('\n' + '='.repeat(50));
        console.log('🎉 合作伙伴配置生成完成！');
        
        console.log('\n💡 下一步:');
        console.log('  1. 检查生成的配置是否正确');
        console.log('  2. 重新构建网站: hugo');
        console.log('  3. 检查首页合作伙伴显示效果');
        
    } catch (error) {
        console.error('\n❌ 生成失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    getPartnerImages,
    generatePartnerConfig,
    updateIndexFile,
    config
};
