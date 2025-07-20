#!/usr/bin/env node

/**
 * 内容结构验证工具
 * 验证内容重组后的文件完整性和结构正确性
 */

const fs = require('fs').promises;
const path = require('path');

class ContentStructureVerifier {
    constructor() {
        this.contentDir = './content';
        this.verificationResults = {
            news: {
                'tech-article': [],
                'industry': [],
                'exhibition': []
            },
            products: {
                'vis': [],
                'vs': [],
                'hk': []
            },
            missing: [],
            errors: []
        };
    }
    
    // 扫描目录中的文件
    async scanDirectory(dirPath) {
        try {
            const items = await fs.readdir(dirPath);
            const files = [];
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stat = await fs.stat(itemPath);
                
                if (stat.isFile() && item.endsWith('.md') && item !== '_index.md') {
                    files.push({
                        name: item,
                        path: itemPath,
                        size: stat.size,
                        modified: stat.mtime
                    });
                }
            }
            
            return files;
        } catch (error) {
            this.verificationResults.errors.push({
                type: 'directory_scan',
                path: dirPath,
                error: error.message
            });
            return [];
        }
    }
    
    // 验证文件的front matter
    async verifyFrontMatter(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);
            
            if (!frontMatterMatch) {
                return {
                    valid: false,
                    error: 'No front matter found'
                };
            }
            
            const frontMatter = {};
            const lines = frontMatterMatch[1].split('\n');
            let currentKey = null;
            let currentArray = [];
            
            lines.forEach(line => {
                line = line.trim();
                if (!line) return;
                
                if (line.startsWith('- ') && currentKey) {
                    currentArray.push(line.substring(2).trim());
                    return;
                }
                
                if (currentKey && currentArray.length > 0) {
                    frontMatter[currentKey] = currentArray;
                    currentKey = null;
                    currentArray = [];
                }
                
                const match = line.match(/^(\w+):\s*(.*)$/);
                if (match) {
                    const key = match[1];
                    const value = match[2].trim();
                    
                    if (value === '') {
                        currentKey = key;
                        currentArray = [];
                    } else {
                        frontMatter[key] = value.replace(/^"(.*)"$/, '$1');
                    }
                }
            });
            
            if (currentKey && currentArray.length > 0) {
                frontMatter[currentKey] = currentArray;
            }
            
            return {
                valid: true,
                frontMatter
            };
        } catch (error) {
            return {
                valid: false,
                error: error.message
            };
        }
    }
    
    // 验证新闻内容结构
    async verifyNewsStructure() {
        console.log('📰 验证新闻内容结构...');
        
        const newsCategories = ['tech-article', 'industry', 'exhibition'];
        
        for (const category of newsCategories) {
            const categoryPath = path.join(this.contentDir, 'news', category);
            
            try {
                // 检查目录是否存在
                await fs.access(categoryPath);
                
                // 检查_index.md是否存在
                const indexPath = path.join(categoryPath, '_index.md');
                try {
                    await fs.access(indexPath);
                    console.log(`   ✅ ${category}/_index.md 存在`);
                } catch {
                    this.verificationResults.missing.push(`news/${category}/_index.md`);
                    console.log(`   ❌ ${category}/_index.md 缺失`);
                }
                
                // 扫描文件
                const files = await this.scanDirectory(categoryPath);
                this.verificationResults.news[category] = files;
                
                console.log(`   📁 ${category}: ${files.length} 个文件`);
                
                // 验证每个文件的front matter
                for (const file of files) {
                    const verification = await this.verifyFrontMatter(file.path);
                    if (!verification.valid) {
                        this.verificationResults.errors.push({
                            type: 'front_matter',
                            file: file.path,
                            error: verification.error
                        });
                        console.log(`     ⚠️  ${file.name}: front matter错误`);
                    }
                }
                
            } catch (error) {
                this.verificationResults.errors.push({
                    type: 'directory_missing',
                    path: categoryPath,
                    error: error.message
                });
                console.log(`   ❌ ${category} 目录不存在`);
            }
        }
    }
    
    // 验证产品内容结构
    async verifyProductsStructure() {
        console.log('\n🔧 验证产品内容结构...');
        
        const suppliers = ['vis', 'vs', 'hk'];
        
        for (const supplier of suppliers) {
            const supplierPath = path.join(this.contentDir, 'products', supplier);
            
            try {
                // 检查目录是否存在
                await fs.access(supplierPath);
                
                // 检查_index.md是否存在
                const indexPath = path.join(supplierPath, '_index.md');
                try {
                    await fs.access(indexPath);
                    console.log(`   ✅ ${supplier}/_index.md 存在`);
                } catch {
                    this.verificationResults.missing.push(`products/${supplier}/_index.md`);
                    console.log(`   ❌ ${supplier}/_index.md 缺失`);
                }
                
                // 扫描文件
                const files = await this.scanDirectory(supplierPath);
                this.verificationResults.products[supplier] = files;
                
                console.log(`   📁 ${supplier}: ${files.length} 个产品文件`);
                
                // 验证每个文件的front matter
                for (const file of files) {
                    const verification = await this.verifyFrontMatter(file.path);
                    if (!verification.valid) {
                        this.verificationResults.errors.push({
                            type: 'front_matter',
                            file: file.path,
                            error: verification.error
                        });
                        console.log(`     ⚠️  ${file.name}: front matter错误`);
                    } else {
                        // 验证供应商信息是否正确
                        const { frontMatter } = verification;
                        if (frontMatter.supplier) {
                            const expectedSuppliers = {
                                'vis': '天津维森科技有限公司',
                                'vs': '深圳市微视光电科技有限公司',
                                'hk': '北京华科检测科技有限公司'
                            };
                            
                            if (!frontMatter.supplier.includes(expectedSuppliers[supplier])) {
                                console.log(`     ⚠️  ${file.name}: 供应商信息可能不匹配`);
                            }
                        }
                    }
                }
                
            } catch (error) {
                this.verificationResults.errors.push({
                    type: 'directory_missing',
                    path: supplierPath,
                    error: error.message
                });
                console.log(`   ❌ ${supplier} 目录不存在`);
            }
        }
    }
    
    // 验证Hugo配置
    async verifyHugoConfig() {
        console.log('\n⚙️ 验证Hugo配置...');
        
        try {
            const configPath = './hugo.toml';
            const content = await fs.readFile(configPath, 'utf8');
            
            // 检查菜单配置
            const hasNewsSubmenus = content.includes('tech-article') && 
                                   content.includes('industry') && 
                                   content.includes('exhibition');
            
            const hasProductSubmenus = content.includes('vis') && 
                                      content.includes('vs') && 
                                      content.includes('hk');
            
            if (hasNewsSubmenus) {
                console.log('   ✅ 新闻子菜单配置正确');
            } else {
                console.log('   ⚠️  新闻子菜单配置可能缺失');
            }
            
            if (hasProductSubmenus) {
                console.log('   ✅ 产品子菜单配置正确');
            } else {
                console.log('   ⚠️  产品子菜单配置可能缺失');
            }
            
        } catch (error) {
            this.verificationResults.errors.push({
                type: 'config_error',
                file: 'hugo.toml',
                error: error.message
            });
            console.log('   ❌ Hugo配置文件读取失败');
        }
    }
    
    // 生成验证报告
    generateVerificationReport() {
        const totalNewsFiles = Object.values(this.verificationResults.news)
            .reduce((sum, files) => sum + files.length, 0);
        
        const totalProductFiles = Object.values(this.verificationResults.products)
            .reduce((sum, files) => sum + files.length, 0);
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalNewsFiles,
                totalProductFiles,
                totalErrors: this.verificationResults.errors.length,
                missingFiles: this.verificationResults.missing.length
            },
            details: {
                news: this.verificationResults.news,
                products: this.verificationResults.products,
                errors: this.verificationResults.errors,
                missing: this.verificationResults.missing
            }
        };
        
        return report;
    }
    
    // 执行验证
    async verify() {
        console.log('🔍 开始验证内容结构...\n');
        
        try {
            // 验证新闻结构
            await this.verifyNewsStructure();
            
            // 验证产品结构
            await this.verifyProductsStructure();
            
            // 验证Hugo配置
            await this.verifyHugoConfig();
            
            // 生成报告
            const report = this.generateVerificationReport();
            
            console.log('\n📊 验证完成统计:');
            console.log(`   新闻文件总数: ${report.summary.totalNewsFiles} 个`);
            console.log(`   产品文件总数: ${report.summary.totalProductFiles} 个`);
            console.log(`   错误数量: ${report.summary.totalErrors} 个`);
            console.log(`   缺失文件: ${report.summary.missingFiles} 个`);
            
            // 详细统计
            console.log('\n📋 详细统计:');
            console.log('   新闻分类:');
            Object.entries(report.details.news).forEach(([category, files]) => {
                console.log(`     ${category}: ${files.length} 个文件`);
            });
            
            console.log('   产品分类:');
            Object.entries(report.details.products).forEach(([supplier, files]) => {
                console.log(`     ${supplier}: ${files.length} 个产品`);
            });
            
            if (report.summary.totalErrors > 0) {
                console.log('\n⚠️  发现的错误:');
                report.details.errors.forEach(error => {
                    console.log(`   - ${error.type}: ${error.file || error.path} - ${error.error}`);
                });
            }
            
            if (report.summary.missingFiles > 0) {
                console.log('\n❌ 缺失的文件:');
                report.details.missing.forEach(file => {
                    console.log(`   - ${file}`);
                });
            }
            
            // 保存详细报告
            const reportPath = './content-structure-verification.json';
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📋 详细报告已保存: ${reportPath}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ 验证过程中发生错误:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const verifier = new ContentStructureVerifier();
    verifier.verify().catch(console.error);
}

module.exports = ContentStructureVerifier;
