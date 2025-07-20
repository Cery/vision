#!/usr/bin/env node

/**
 * 内容重组工具
 * 按照供应商和内容类型重新组织项目内容结构
 */

const fs = require('fs').promises;
const path = require('path');

class ContentReorganizer {
    constructor() {
        this.contentDir = './content';
        this.newsDir = path.join(this.contentDir, 'news');
        this.productsDir = path.join(this.contentDir, 'products');
        
        // 供应商映射
        this.supplierMapping = {
            'vis': '天津维森科技有限公司',
            'vs': '深圳市微视光电科技有限公司',
            'hk': '北京华科检测科技有限公司'
        };
        
        // 内容分类映射
        this.categoryMapping = {
            '技术文章': 'tech-article',
            '行业资讯': 'industry',
            '展会信息': 'exhibition'
        };
        
        this.moveLog = [];
    }
    
    // 读取文件的front matter
    async readFrontMatter(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const frontMatterMatch = content.match(/^---\n([\s\S]*?)\n---/);

            if (frontMatterMatch) {
                const frontMatter = {};
                const lines = frontMatterMatch[1].split('\n');
                let currentKey = null;
                let currentArray = [];

                lines.forEach(line => {
                    line = line.trim();
                    if (!line) return;

                    // 处理数组项 (以 - 开头)
                    if (line.startsWith('- ') && currentKey) {
                        const value = line.substring(2).trim();
                        currentArray.push(value);
                        return;
                    }

                    // 如果之前在处理数组，现在结束了
                    if (currentKey && currentArray.length > 0) {
                        frontMatter[currentKey] = currentArray;
                        currentKey = null;
                        currentArray = [];
                    }

                    // 处理键值对
                    const match = line.match(/^(\w+):\s*(.*)$/);
                    if (match) {
                        const key = match[1];
                        const value = match[2].trim();

                        if (value === '') {
                            // 可能是数组的开始
                            currentKey = key;
                            currentArray = [];
                        } else if (value.startsWith('[') && value.endsWith(']')) {
                            // 内联数组格式
                            const arrayContent = value.slice(1, -1);
                            const values = arrayContent.split(',').map(v => v.trim().replace(/"/g, ''));
                            frontMatter[key] = values;
                        } else {
                            // 普通键值对
                            frontMatter[key] = value.replace(/^"(.*)"$/, '$1');
                        }
                    }
                });

                // 处理最后一个数组
                if (currentKey && currentArray.length > 0) {
                    frontMatter[currentKey] = currentArray;
                }

                return { frontMatter, content };
            }

            return { frontMatter: {}, content };
        } catch (error) {
            console.error(`读取文件失败: ${filePath}`, error.message);
            return { frontMatter: {}, content: '' };
        }
    }
    
    // 确保目录存在
    async ensureDirectory(dirPath) {
        try {
            await fs.mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                console.error(`创建目录失败: ${dirPath}`, error.message);
            }
        }
    }
    
    // 分析新闻文件的分类
    async analyzeNewsFiles() {
        const newsFiles = await fs.readdir(this.newsDir);
        const analysis = {
            'tech-article': [],
            'industry': [],
            'exhibition': [],
            'unclassified': []
        };
        
        for (const file of newsFiles) {
            if (!file.endsWith('.md') || file === '_index.md') continue;
            
            const filePath = path.join(this.newsDir, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isFile()) {
                const { frontMatter } = await this.readFrontMatter(filePath);
                
                // 根据categories字段分类
                let category = 'unclassified';
                if (frontMatter.categories) {
                    const categories = Array.isArray(frontMatter.categories) 
                        ? frontMatter.categories 
                        : [frontMatter.categories];
                    
                    for (const cat of categories) {
                        if (cat === '技术文章') {
                            category = 'tech-article';
                            break;
                        } else if (cat === '行业资讯') {
                            category = 'industry';
                            break;
                        } else if (cat === '展会信息') {
                            category = 'exhibition';
                            break;
                        }
                    }
                }
                
                analysis[category].push({
                    file,
                    path: filePath,
                    frontMatter
                });
            }
        }
        
        return analysis;
    }
    
    // 分析产品文件的供应商
    async analyzeProductFiles() {
        const productFiles = await fs.readdir(this.productsDir);
        const analysis = {
            'vis': [],
            'vs': [],
            'hk': [],
            'unclassified': []
        };
        
        for (const file of productFiles) {
            if (!file.endsWith('.md') || file === '_index.md' || file === 'model.md') continue;
            
            const filePath = path.join(this.productsDir, file);
            const stat = await fs.stat(filePath);
            
            if (stat.isFile()) {
                const { frontMatter } = await this.readFrontMatter(filePath);
                
                // 根据supplier字段或文件名前缀分类
                let supplier = 'unclassified';
                
                if (frontMatter.supplier) {
                    if (frontMatter.supplier.includes('天津维森')) {
                        supplier = 'vis';
                    } else if (frontMatter.supplier.includes('深圳市微视')) {
                        supplier = 'vs';
                    } else if (frontMatter.supplier.includes('北京华科')) {
                        supplier = 'hk';
                    }
                } else {
                    // 根据文件名前缀判断
                    if (file.startsWith('VIS-')) {
                        supplier = 'vis';
                    } else if (file.startsWith('WS-')) {
                        supplier = 'vs';
                    } else if (file.startsWith('HK-')) {
                        supplier = 'hk';
                    }
                }
                
                analysis[supplier].push({
                    file,
                    path: filePath,
                    frontMatter
                });
            }
        }
        
        return analysis;
    }
    
    // 移动新闻文件
    async moveNewsFiles() {
        console.log('📰 开始移动新闻文件...');
        const analysis = await this.analyzeNewsFiles();
        
        for (const [category, files] of Object.entries(analysis)) {
            if (category === 'unclassified' || files.length === 0) continue;
            
            const targetDir = path.join(this.newsDir, category);
            await this.ensureDirectory(targetDir);
            
            console.log(`\n📁 移动 ${category} 类别文件 (${files.length} 个):`);
            
            for (const fileInfo of files) {
                const targetPath = path.join(targetDir, fileInfo.file);
                
                try {
                    await fs.rename(fileInfo.path, targetPath);
                    console.log(`   ✅ ${fileInfo.file} -> ${category}/`);
                    
                    this.moveLog.push({
                        type: 'news',
                        category,
                        from: fileInfo.path,
                        to: targetPath,
                        file: fileInfo.file
                    });
                } catch (error) {
                    console.error(`   ❌ 移动失败: ${fileInfo.file}`, error.message);
                }
            }
        }
        
        // 报告未分类文件
        if (analysis.unclassified.length > 0) {
            console.log(`\n⚠️  未分类的新闻文件 (${analysis.unclassified.length} 个):`);
            analysis.unclassified.forEach(file => {
                console.log(`   - ${file.file}`);
            });
        }
    }
    
    // 移动产品文件
    async moveProductFiles() {
        console.log('\n🔧 开始移动产品文件...');
        const analysis = await this.analyzeProductFiles();
        
        for (const [supplier, files] of Object.entries(analysis)) {
            if (supplier === 'unclassified' || files.length === 0) continue;
            
            const targetDir = path.join(this.productsDir, supplier);
            await this.ensureDirectory(targetDir);
            
            console.log(`\n📁 移动 ${supplier} 供应商文件 (${files.length} 个):`);
            
            for (const fileInfo of files) {
                const targetPath = path.join(targetDir, fileInfo.file);
                
                try {
                    await fs.rename(fileInfo.path, targetPath);
                    console.log(`   ✅ ${fileInfo.file} -> ${supplier}/`);
                    
                    this.moveLog.push({
                        type: 'product',
                        supplier,
                        from: fileInfo.path,
                        to: targetPath,
                        file: fileInfo.file
                    });
                } catch (error) {
                    console.error(`   ❌ 移动失败: ${fileInfo.file}`, error.message);
                }
            }
        }
        
        // 报告未分类文件
        if (analysis.unclassified.length > 0) {
            console.log(`\n⚠️  未分类的产品文件 (${analysis.unclassified.length} 个):`);
            analysis.unclassified.forEach(file => {
                console.log(`   - ${file.file}`);
            });
        }
    }
    
    // 生成移动报告
    generateMoveReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalMoved: this.moveLog.length,
                newsMoved: this.moveLog.filter(item => item.type === 'news').length,
                productsMoved: this.moveLog.filter(item => item.type === 'product').length
            },
            details: this.moveLog
        };
        
        return report;
    }
    
    // 执行重组
    async reorganize() {
        console.log('🚀 开始内容重组...\n');
        
        try {
            // 移动新闻文件
            await this.moveNewsFiles();
            
            // 移动产品文件
            await this.moveProductFiles();
            
            // 生成报告
            const report = this.generateMoveReport();
            
            console.log('\n📊 重组完成统计:');
            console.log(`   总共移动文件: ${report.summary.totalMoved} 个`);
            console.log(`   新闻文件: ${report.summary.newsMoved} 个`);
            console.log(`   产品文件: ${report.summary.productsMoved} 个`);
            
            // 保存详细报告
            const reportPath = './content-reorganize-report.json';
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📋 详细报告已保存: ${reportPath}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ 重组过程中发生错误:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const reorganizer = new ContentReorganizer();
    reorganizer.reorganize().catch(console.error);
}

module.exports = ContentReorganizer;
