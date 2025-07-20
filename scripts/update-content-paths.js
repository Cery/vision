#!/usr/bin/env node

/**
 * 内容路径更新工具
 * 更新移动后文件的内部路径引用
 */

const fs = require('fs').promises;
const path = require('path');

class ContentPathUpdater {
    constructor() {
        this.contentDir = './content';
        this.updateLog = [];
        
        // 路径映射规则
        this.pathMappings = {
            // 新闻路径映射
            '/news/': {
                'tech-article/': '/news/tech-article/',
                'industry/': '/news/industry/',
                'exhibition/': '/news/exhibition/'
            },
            // 产品路径映射
            '/products/': {
                'vis/': '/products/vis/',
                'vs/': '/products/vs/',
                'hk/': '/products/hk/'
            }
        };
    }
    
    // 递归扫描目录
    async scanDirectory(dirPath) {
        const files = [];
        
        try {
            const items = await fs.readdir(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stat = await fs.stat(itemPath);
                
                if (stat.isDirectory()) {
                    const subFiles = await this.scanDirectory(itemPath);
                    files.push(...subFiles);
                } else if (item.endsWith('.md')) {
                    files.push(itemPath);
                }
            }
        } catch (error) {
            console.error(`扫描目录失败: ${dirPath}`, error.message);
        }
        
        return files;
    }
    
    // 更新文件中的路径引用
    async updateFileReferences(filePath) {
        try {
            let content = await fs.readFile(filePath, 'utf8');
            let updated = false;
            const originalContent = content;
            
            // 更新图片路径
            content = content.replace(/\/images\/([^\/]+)\//g, (match, category) => {
                // 保持图片路径不变，因为图片没有移动
                return match;
            });
            
            // 更新内部链接
            content = content.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => {
                if (url.startsWith('/') || url.startsWith('http')) {
                    // 绝对路径或外部链接，不需要更新
                    return match;
                }
                
                // 相对路径可能需要更新
                if (url.includes('../')) {
                    // 处理相对路径
                    const newUrl = this.adjustRelativePath(filePath, url);
                    if (newUrl !== url) {
                        updated = true;
                        return `[${text}](${newUrl})`;
                    }
                }
                
                return match;
            });
            
            // 更新Hugo shortcodes中的路径
            content = content.replace(/{{<\s*([^>]+)\s*>}}/g, (match, shortcode) => {
                if (shortcode.includes('ref ') || shortcode.includes('relref ')) {
                    // 处理Hugo引用
                    const newShortcode = this.updateHugoRef(shortcode, filePath);
                    if (newShortcode !== shortcode) {
                        updated = true;
                        return `{{< ${newShortcode} >}}`;
                    }
                }
                return match;
            });
            
            // 如果内容有更新，写回文件
            if (updated) {
                await fs.writeFile(filePath, content, 'utf8');
                this.updateLog.push({
                    file: filePath,
                    updated: true,
                    changes: this.getChanges(originalContent, content)
                });
                console.log(`✅ 更新路径: ${filePath}`);
            }
            
            return updated;
        } catch (error) {
            console.error(`更新文件失败: ${filePath}`, error.message);
            return false;
        }
    }
    
    // 调整相对路径
    adjustRelativePath(currentFilePath, relativePath) {
        const currentDir = path.dirname(currentFilePath);
        const targetPath = path.resolve(currentDir, relativePath);
        const contentRoot = path.resolve(this.contentDir);
        
        // 计算从content根目录的相对路径
        const relativeFromContent = path.relative(contentRoot, targetPath);
        
        // 计算新的相对路径
        const newRelativePath = path.relative(currentDir, targetPath);
        
        return newRelativePath.replace(/\\/g, '/');
    }
    
    // 更新Hugo引用
    updateHugoRef(shortcode, currentFilePath) {
        // 提取引用的路径
        const refMatch = shortcode.match(/(ref|relref)\s+"([^"]+)"/);
        if (refMatch) {
            const refType = refMatch[1];
            const refPath = refMatch[2];
            
            // 根据当前文件位置调整引用路径
            const newRefPath = this.adjustHugoRefPath(refPath, currentFilePath);
            if (newRefPath !== refPath) {
                return shortcode.replace(`"${refPath}"`, `"${newRefPath}"`);
            }
        }
        
        return shortcode;
    }
    
    // 调整Hugo引用路径
    adjustHugoRefPath(refPath, currentFilePath) {
        // 如果引用路径以/开头，它是绝对路径，需要根据新的目录结构调整
        if (refPath.startsWith('/')) {
            return refPath; // 绝对路径通常不需要调整
        }
        
        // 相对路径需要根据文件的新位置调整
        const currentDir = path.dirname(currentFilePath);
        const contentRoot = path.resolve(this.contentDir);
        const currentRelativeDir = path.relative(contentRoot, currentDir);
        
        // 计算新的相对路径
        const depth = currentRelativeDir.split(path.sep).length;
        const prefix = '../'.repeat(depth);
        
        return prefix + refPath;
    }
    
    // 获取变更详情
    getChanges(original, updated) {
        const changes = [];
        const originalLines = original.split('\n');
        const updatedLines = updated.split('\n');
        
        for (let i = 0; i < Math.max(originalLines.length, updatedLines.length); i++) {
            if (originalLines[i] !== updatedLines[i]) {
                changes.push({
                    line: i + 1,
                    from: originalLines[i] || '',
                    to: updatedLines[i] || ''
                });
            }
        }
        
        return changes;
    }
    
    // 更新Hugo配置文件
    async updateHugoConfig() {
        const configFiles = ['hugo.toml', 'config.toml', 'config.yaml', 'config.yml'];
        
        for (const configFile of configFiles) {
            try {
                const configPath = path.join('.', configFile);
                const stat = await fs.stat(configPath);
                
                if (stat.isFile()) {
                    console.log(`📝 检查Hugo配置文件: ${configFile}`);
                    
                    let content = await fs.readFile(configPath, 'utf8');
                    let updated = false;
                    
                    // 更新菜单配置中的URL
                    if (content.includes('menu') || content.includes('navigation')) {
                        // 这里可以添加具体的菜单URL更新逻辑
                        console.log(`   ℹ️  请手动检查 ${configFile} 中的菜单配置`);
                    }
                    
                    if (updated) {
                        await fs.writeFile(configPath, content, 'utf8');
                        console.log(`✅ 更新配置文件: ${configFile}`);
                    }
                }
            } catch (error) {
                // 文件不存在，跳过
                continue;
            }
        }
    }
    
    // 更新模板文件
    async updateTemplates() {
        const templateDirs = ['layouts', 'themes'];
        
        for (const templateDir of templateDirs) {
            try {
                const templatePath = path.join('.', templateDir);
                const stat = await fs.stat(templatePath);
                
                if (stat.isDirectory()) {
                    console.log(`📝 检查模板目录: ${templateDir}`);
                    const templateFiles = await this.scanDirectory(templatePath);
                    
                    for (const templateFile of templateFiles) {
                        if (templateFile.endsWith('.html')) {
                            await this.updateTemplateFile(templateFile);
                        }
                    }
                }
            } catch (error) {
                // 目录不存在，跳过
                continue;
            }
        }
    }
    
    // 更新模板文件
    async updateTemplateFile(templatePath) {
        try {
            let content = await fs.readFile(templatePath, 'utf8');
            let updated = false;
            
            // 更新Hugo模板中的路径引用
            content = content.replace(/\.GetPage\s+"([^"]+)"/g, (match, pagePath) => {
                // 根据新的目录结构更新页面路径
                const newPath = this.updatePagePath(pagePath);
                if (newPath !== pagePath) {
                    updated = true;
                    return `.GetPage "${newPath}"`;
                }
                return match;
            });
            
            // 更新range查询
            content = content.replace(/range\s+\.Site\.GetPage\s+"([^"]+)"/g, (match, sectionPath) => {
                const newPath = this.updateSectionPath(sectionPath);
                if (newPath !== sectionPath) {
                    updated = true;
                    return `range .Site.GetPage "${newPath}"`;
                }
                return match;
            });
            
            if (updated) {
                await fs.writeFile(templatePath, content, 'utf8');
                console.log(`✅ 更新模板: ${templatePath}`);
            }
        } catch (error) {
            console.error(`更新模板失败: ${templatePath}`, error.message);
        }
    }
    
    // 更新页面路径
    updatePagePath(pagePath) {
        // 根据新的目录结构更新路径
        if (pagePath.startsWith('/news/') && !pagePath.includes('/tech-article/') && !pagePath.includes('/industry/') && !pagePath.includes('/exhibition/')) {
            // 可能需要添加子目录
            return pagePath;
        }
        
        if (pagePath.startsWith('/products/') && !pagePath.includes('/vis/') && !pagePath.includes('/vs/') && !pagePath.includes('/hk/')) {
            // 可能需要添加供应商子目录
            return pagePath;
        }
        
        return pagePath;
    }
    
    // 更新section路径
    updateSectionPath(sectionPath) {
        return this.updatePagePath(sectionPath);
    }
    
    // 生成更新报告
    generateUpdateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFilesProcessed: this.updateLog.length,
                filesUpdated: this.updateLog.filter(item => item.updated).length,
                totalChanges: this.updateLog.reduce((sum, item) => sum + (item.changes ? item.changes.length : 0), 0)
            },
            details: this.updateLog
        };
        
        return report;
    }
    
    // 执行路径更新
    async updatePaths() {
        console.log('🔄 开始更新内容路径...\n');
        
        try {
            // 扫描所有markdown文件
            const allFiles = await this.scanDirectory(this.contentDir);
            console.log(`📁 找到 ${allFiles.length} 个markdown文件`);
            
            // 更新每个文件
            for (const filePath of allFiles) {
                await this.updateFileReferences(filePath);
            }
            
            // 更新Hugo配置
            await this.updateHugoConfig();
            
            // 更新模板文件
            await this.updateTemplates();
            
            // 生成报告
            const report = this.generateUpdateReport();
            
            console.log('\n📊 路径更新完成统计:');
            console.log(`   处理文件总数: ${report.summary.totalFilesProcessed} 个`);
            console.log(`   更新文件数量: ${report.summary.filesUpdated} 个`);
            console.log(`   总变更数量: ${report.summary.totalChanges} 处`);
            
            // 保存详细报告
            const reportPath = './path-update-report.json';
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📋 详细报告已保存: ${reportPath}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ 路径更新过程中发生错误:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const updater = new ContentPathUpdater();
    updater.updatePaths().catch(console.error);
}

module.exports = ContentPathUpdater;
