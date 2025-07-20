#!/usr/bin/env node

/**
 * 修复图片扩展名工具
 * 将文件中的图片引用从JPG/JPEG修改为SVG（对应我们创建的占位符）
 */

const fs = require('fs');
const path = require('path');

class ImageExtensionFixer {
    constructor() {
        this.contentDir = './content';
        this.staticDir = './static';
        this.fixes = [];
        
        // 需要修复的扩展名映射
        this.extensionMappings = {
            '.jpg': '.svg',
            '.jpeg': '.svg',
            '.png': '.svg'
        };
    }
    
    // 递归扫描目录
    scanDirectorySync(dirPath) {
        const files = [];
        
        try {
            const items = fs.readdirSync(dirPath);
            
            for (const item of items) {
                const itemPath = path.join(dirPath, item);
                const stat = fs.statSync(itemPath);
                
                if (stat.isDirectory()) {
                    const subFiles = this.scanDirectorySync(itemPath);
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
    
    // 检查SVG文件是否存在
    svgExists(originalPath) {
        const ext = path.extname(originalPath);
        const svgPath = originalPath.replace(ext, '.svg');
        const fullPath = path.join(this.staticDir, svgPath.substring(1));
        
        return fs.existsSync(fullPath) ? svgPath : null;
    }
    
    // 修复单个文件
    fixFile(filePath) {
        try {
            let content = fs.readFileSync(filePath, 'utf8');
            let modified = false;
            const fileFixes = [];
            
            // 修复Markdown图片引用
            content = content.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, altText, imagePath) => {
                if (imagePath.startsWith('/images/')) {
                    const ext = path.extname(imagePath).toLowerCase();
                    if (this.extensionMappings[ext]) {
                        const svgPath = this.svgExists(imagePath);
                        if (svgPath) {
                            modified = true;
                            fileFixes.push({
                                type: 'markdown_image',
                                from: imagePath,
                                to: svgPath
                            });
                            return `![${altText}](${svgPath})`;
                        }
                    }
                }
                return match;
            });
            
            // 修复featured_image
            content = content.replace(/featured_image:\s*["']([^"']+)["']/g, (match, imagePath) => {
                if (imagePath.startsWith('/images/')) {
                    const ext = path.extname(imagePath).toLowerCase();
                    if (this.extensionMappings[ext]) {
                        const svgPath = this.svgExists(imagePath);
                        if (svgPath) {
                            modified = true;
                            fileFixes.push({
                                type: 'featured_image',
                                from: imagePath,
                                to: svgPath
                            });
                            return `featured_image: "${svgPath}"`;
                        }
                    }
                }
                return match;
            });
            
            // 修复gallery图片
            content = content.replace(/image:\s*["']([^"']+)["']/g, (match, imagePath) => {
                if (imagePath.startsWith('/images/')) {
                    const ext = path.extname(imagePath).toLowerCase();
                    if (this.extensionMappings[ext]) {
                        const svgPath = this.svgExists(imagePath);
                        if (svgPath) {
                            modified = true;
                            fileFixes.push({
                                type: 'gallery_image',
                                from: imagePath,
                                to: svgPath
                            });
                            return `image: "${svgPath}"`;
                        }
                    }
                }
                return match;
            });
            
            if (modified) {
                fs.writeFileSync(filePath, content, 'utf8');
                this.fixes.push({
                    file: filePath,
                    fixes: fileFixes
                });
                
                console.log(`✅ 修复文件: ${filePath}`);
                fileFixes.forEach(fix => {
                    console.log(`   ${fix.type}: ${fix.from} → ${fix.to}`);
                });
            }
            
        } catch (error) {
            console.error(`修复文件失败: ${filePath}`, error.message);
        }
    }
    
    // 执行修复
    fix() {
        console.log('🔧 开始修复图片扩展名...\n');
        
        try {
            // 扫描所有markdown文件
            const allFiles = this.scanDirectorySync(this.contentDir);
            console.log(`📁 找到 ${allFiles.length} 个markdown文件\n`);
            
            // 修复每个文件
            allFiles.forEach(filePath => {
                this.fixFile(filePath);
            });
            
            console.log('\n📊 修复完成统计:');
            console.log(`   修复文件数: ${this.fixes.length} 个`);
            
            const totalFixes = this.fixes.reduce((sum, file) => sum + file.fixes.length, 0);
            console.log(`   修复引用数: ${totalFixes} 个`);
            
            // 按类型统计
            const typeStats = {};
            this.fixes.forEach(file => {
                file.fixes.forEach(fix => {
                    typeStats[fix.type] = (typeStats[fix.type] || 0) + 1;
                });
            });
            
            if (Object.keys(typeStats).length > 0) {
                console.log('\n📋 修复类型统计:');
                Object.entries(typeStats).forEach(([type, count]) => {
                    console.log(`   ${type}: ${count} 个`);
                });
            }
            
            // 保存修复报告
            const report = {
                timestamp: new Date().toISOString(),
                totalFiles: allFiles.length,
                fixedFiles: this.fixes.length,
                totalFixes: totalFixes,
                fixes: this.fixes
            };
            
            fs.writeFileSync('./image-extension-fix-report.json', JSON.stringify(report, null, 2));
            console.log('\n📋 修复报告已保存: image-extension-fix-report.json');
            
            return report;
            
        } catch (error) {
            console.error('❌ 修复过程中发生错误:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const fixer = new ImageExtensionFixer();
    fixer.fix();
}

module.exports = ImageExtensionFixer;
