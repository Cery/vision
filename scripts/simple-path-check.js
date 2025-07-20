#!/usr/bin/env node

/**
 * 简单路径检查工具
 * 快速检查图片路径和内部链接
 */

const fs = require('fs');
const path = require('path');

class SimplePathChecker {
    constructor() {
        this.contentDir = './content';
        this.staticDir = './static';
        this.issues = [];
    }
    
    // 同步扫描目录
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
    
    // 检查文件是否存在
    fileExistsSync(filePath) {
        try {
            fs.accessSync(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    // 检查单个文件
    checkFileSync(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileIssues = [];
            
            // 检查图片引用
            const imageMatches = content.match(/!\[([^\]]*)\]\(([^)]+)\)/g) || [];
            imageMatches.forEach(match => {
                const pathMatch = match.match(/!\[([^\]]*)\]\(([^)]+)\)/);
                if (pathMatch) {
                    const imagePath = pathMatch[2];
                    if (!imagePath.startsWith('http')) {
                        const fullPath = imagePath.startsWith('/') 
                            ? path.join(this.staticDir, imagePath.substring(1))
                            : path.resolve(path.dirname(filePath), imagePath);
                        
                        if (!this.fileExistsSync(fullPath)) {
                            fileIssues.push({
                                type: 'image',
                                match,
                                path: imagePath,
                                fullPath
                            });
                        }
                    }
                }
            });
            
            // 检查featured_image
            const featuredMatches = content.match(/featured_image:\s*["']([^"']+)["']/g) || [];
            featuredMatches.forEach(match => {
                const pathMatch = match.match(/featured_image:\s*["']([^"']+)["']/);
                if (pathMatch) {
                    const imagePath = pathMatch[1];
                    if (!imagePath.startsWith('http')) {
                        const fullPath = imagePath.startsWith('/') 
                            ? path.join(this.staticDir, imagePath.substring(1))
                            : path.resolve(path.dirname(filePath), imagePath);
                        
                        if (!this.fileExistsSync(fullPath)) {
                            fileIssues.push({
                                type: 'featured_image',
                                match,
                                path: imagePath,
                                fullPath
                            });
                        }
                    }
                }
            });
            
            // 检查gallery图片
            const galleryMatches = content.match(/image:\s*["']([^"']+)["']/g) || [];
            galleryMatches.forEach(match => {
                const pathMatch = match.match(/image:\s*["']([^"']+)["']/);
                if (pathMatch) {
                    const imagePath = pathMatch[1];
                    if (!imagePath.startsWith('http')) {
                        const fullPath = imagePath.startsWith('/') 
                            ? path.join(this.staticDir, imagePath.substring(1))
                            : path.resolve(path.dirname(filePath), imagePath);
                        
                        if (!this.fileExistsSync(fullPath)) {
                            fileIssues.push({
                                type: 'gallery_image',
                                match,
                                path: imagePath,
                                fullPath
                            });
                        }
                    }
                }
            });
            
            if (fileIssues.length > 0) {
                this.issues.push({
                    file: filePath,
                    issues: fileIssues
                });
            }
            
        } catch (error) {
            console.error(`检查文件失败: ${filePath}`, error.message);
        }
    }
    
    // 执行检查
    check() {
        console.log('🔍 开始路径检查...\n');
        
        try {
            // 扫描所有markdown文件
            const allFiles = this.scanDirectorySync(this.contentDir);
            console.log(`📁 找到 ${allFiles.length} 个markdown文件\n`);
            
            // 检查每个文件
            allFiles.forEach(filePath => {
                this.checkFileSync(filePath);
            });
            
            console.log('📊 检查结果:');
            console.log(`   有问题的文件: ${this.issues.length} 个`);
            
            if (this.issues.length > 0) {
                const totalIssues = this.issues.reduce((sum, file) => sum + file.issues.length, 0);
                console.log(`   问题总数: ${totalIssues} 个\n`);
                
                // 显示详细问题
                this.issues.forEach(fileIssue => {
                    console.log(`📄 ${fileIssue.file}:`);
                    fileIssue.issues.forEach(issue => {
                        console.log(`   ❌ ${issue.type}: ${issue.path}`);
                        console.log(`      完整路径: ${issue.fullPath}`);
                    });
                    console.log('');
                });
                
                // 按类型统计
                const typeStats = {};
                this.issues.forEach(file => {
                    file.issues.forEach(issue => {
                        typeStats[issue.type] = (typeStats[issue.type] || 0) + 1;
                    });
                });
                
                console.log('📋 问题类型统计:');
                Object.entries(typeStats).forEach(([type, count]) => {
                    console.log(`   ${type}: ${count} 个`);
                });
            } else {
                console.log('   ✅ 没有发现路径问题');
            }
            
            // 保存报告
            const report = {
                timestamp: new Date().toISOString(),
                totalFiles: allFiles.length,
                filesWithIssues: this.issues.length,
                totalIssues: this.issues.reduce((sum, file) => sum + file.issues.length, 0),
                issues: this.issues
            };
            
            fs.writeFileSync('./simple-path-check-report.json', JSON.stringify(report, null, 2));
            console.log('\n📋 报告已保存: simple-path-check-report.json');
            
            return report;
            
        } catch (error) {
            console.error('❌ 检查过程中发生错误:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const checker = new SimplePathChecker();
    checker.check();
}

module.exports = SimplePathChecker;
