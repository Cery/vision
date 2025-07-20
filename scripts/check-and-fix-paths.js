#!/usr/bin/env node

/**
 * 全面路径检查和修复工具
 * 检查所有文件中的图片引用路径、内部链接等，并进行修复
 */

const fs = require('fs').promises;
const path = require('path');

class PathChecker {
    constructor() {
        this.contentDir = './content';
        this.staticDir = './static';
        this.issues = [];
        this.fixes = [];
        
        // 路径模式
        this.patterns = {
            images: /!\[([^\]]*)\]\(([^)]+)\)/g,
            featuredImage: /featured_image:\s*["']([^"']+)["']/g,
            galleryImages: /image:\s*["']([^"']+)["']/g,
            links: /\[([^\]]+)\]\(([^)]+)\)/g,
            hugoRefs: /{{<\s*(ref|relref)\s+"([^"]+)"\s*>}}/g
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
    
    // 检查文件是否存在
    async fileExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }
    
    // 检查图片路径
    async checkImagePath(imagePath, sourceFile) {
        // 如果是外部链接，跳过检查
        if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
            return { valid: true, type: 'external' };
        }
        
        // 处理相对路径
        let fullPath;
        if (imagePath.startsWith('/')) {
            // 绝对路径（相对于static目录）
            fullPath = path.join(this.staticDir, imagePath.substring(1));
        } else {
            // 相对路径
            const sourceDir = path.dirname(sourceFile);
            fullPath = path.resolve(sourceDir, imagePath);
        }
        
        const exists = await this.fileExists(fullPath);
        
        return {
            valid: exists,
            type: 'local',
            fullPath,
            originalPath: imagePath
        };
    }
    
    // 检查单个文件
    async checkFile(filePath) {
        try {
            const content = await fs.readFile(filePath, 'utf8');
            const fileIssues = [];
            
            // 检查Markdown图片引用
            let match;
            const imagePattern = new RegExp(this.patterns.images.source, 'g');
            while ((match = imagePattern.exec(content)) !== null) {
                const [fullMatch, altText, imagePath] = match;
                const result = await this.checkImagePath(imagePath, filePath);
                
                if (!result.valid && result.type === 'local') {
                    fileIssues.push({
                        type: 'markdown_image',
                        line: this.getLineNumber(content, match.index),
                        match: fullMatch,
                        path: imagePath,
                        issue: 'File not found',
                        suggestion: this.suggestImagePath(imagePath)
                    });
                }
            }
            
            // 检查featured_image
            const featuredPattern = new RegExp(this.patterns.featuredImage.source, 'g');
            while ((match = featuredPattern.exec(content)) !== null) {
                const [fullMatch, imagePath] = match;
                const result = await this.checkImagePath(imagePath, filePath);
                
                if (!result.valid && result.type === 'local') {
                    fileIssues.push({
                        type: 'featured_image',
                        line: this.getLineNumber(content, match.index),
                        match: fullMatch,
                        path: imagePath,
                        issue: 'File not found',
                        suggestion: this.suggestImagePath(imagePath)
                    });
                }
            }
            
            // 检查gallery图片
            const galleryPattern = new RegExp(this.patterns.galleryImages.source, 'g');
            while ((match = galleryPattern.exec(content)) !== null) {
                const [fullMatch, imagePath] = match;
                const result = await this.checkImagePath(imagePath, filePath);
                
                if (!result.valid && result.type === 'local') {
                    fileIssues.push({
                        type: 'gallery_image',
                        line: this.getLineNumber(content, match.index),
                        match: fullMatch,
                        path: imagePath,
                        issue: 'File not found',
                        suggestion: this.suggestImagePath(imagePath)
                    });
                }
            }
            
            // 检查内部链接
            const linkPattern = new RegExp(this.patterns.links.source, 'g');
            while ((match = linkPattern.exec(content)) !== null) {
                const [fullMatch, linkText, linkPath] = match;
                
                // 跳过外部链接和邮箱链接
                if (linkPath.startsWith('http://') || linkPath.startsWith('https://') || 
                    linkPath.startsWith('mailto:') || linkPath.startsWith('#')) {
                    continue;
                }
                
                // 检查内部链接
                const result = await this.checkInternalLink(linkPath, filePath);
                if (!result.valid) {
                    fileIssues.push({
                        type: 'internal_link',
                        line: this.getLineNumber(content, match.index),
                        match: fullMatch,
                        path: linkPath,
                        issue: result.issue,
                        suggestion: result.suggestion
                    });
                }
            }
            
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
    
    // 获取行号
    getLineNumber(content, index) {
        return content.substring(0, index).split('\n').length;
    }
    
    // 建议图片路径
    suggestImagePath(originalPath) {
        // 尝试找到相似的路径
        const suggestions = [];
        
        // 常见的图片路径修正
        if (originalPath.includes('/products/')) {
            suggestions.push(originalPath.replace('/products/', '/images/products/'));
        }
        
        if (originalPath.includes('/cases/')) {
            suggestions.push(originalPath.replace('/cases/', '/images/cases/'));
        }
        
        if (originalPath.includes('/news/')) {
            suggestions.push(originalPath.replace('/news/', '/images/news/'));
        }
        
        // 如果没有/images/前缀，添加它
        if (!originalPath.startsWith('/images/') && originalPath.startsWith('/')) {
            suggestions.push('/images' + originalPath);
        }
        
        return suggestions.length > 0 ? suggestions[0] : null;
    }
    
    // 检查内部链接
    async checkInternalLink(linkPath, sourceFile) {
        // Hugo的相对引用
        if (linkPath.startsWith('/')) {
            const contentPath = path.join(this.contentDir, linkPath.substring(1));
            const exists = await this.fileExists(contentPath) || 
                          await this.fileExists(contentPath + '.md') ||
                          await this.fileExists(path.join(contentPath, '_index.md'));
            
            return {
                valid: exists,
                issue: exists ? null : 'Content not found',
                suggestion: exists ? null : this.suggestContentPath(linkPath)
            };
        }
        
        // 相对路径
        const sourceDir = path.dirname(sourceFile);
        const targetPath = path.resolve(sourceDir, linkPath);
        const exists = await this.fileExists(targetPath);
        
        return {
            valid: exists,
            issue: exists ? null : 'File not found',
            suggestion: exists ? null : null
        };
    }
    
    // 建议内容路径
    suggestContentPath(originalPath) {
        // 根据新的目录结构建议路径
        if (originalPath.includes('/news/') && !originalPath.includes('/tech-article/') && 
            !originalPath.includes('/industry/') && !originalPath.includes('/exhibition/')) {
            return originalPath.replace('/news/', '/news/tech-article/');
        }
        
        if (originalPath.includes('/products/') && !originalPath.includes('/vis/') && 
            !originalPath.includes('/vs/') && !originalPath.includes('/hk/')) {
            return originalPath.replace('/products/', '/products/vs/');
        }
        
        return null;
    }
    
    // 自动修复路径
    async autoFixPaths() {
        console.log('🔧 开始自动修复路径...\n');
        
        for (const fileIssue of this.issues) {
            const filePath = fileIssue.file;
            let content = await fs.readFile(filePath, 'utf8');
            let modified = false;
            
            console.log(`📝 修复文件: ${filePath}`);
            
            for (const issue of fileIssue.issues) {
                if (issue.suggestion) {
                    // 检查建议的路径是否存在
                    const suggestionValid = await this.checkImagePath(issue.suggestion, filePath);
                    
                    if (suggestionValid.valid || issue.type === 'internal_link') {
                        content = content.replace(issue.match, issue.match.replace(issue.path, issue.suggestion));
                        modified = true;
                        
                        this.fixes.push({
                            file: filePath,
                            type: issue.type,
                            from: issue.path,
                            to: issue.suggestion,
                            line: issue.line
                        });
                        
                        console.log(`   ✅ ${issue.type} (行${issue.line}): ${issue.path} → ${issue.suggestion}`);
                    } else {
                        console.log(`   ⚠️  ${issue.type} (行${issue.line}): ${issue.path} - 建议路径也不存在`);
                    }
                } else {
                    console.log(`   ❌ ${issue.type} (行${issue.line}): ${issue.path} - 无法自动修复`);
                }
            }
            
            if (modified) {
                await fs.writeFile(filePath, content, 'utf8');
                console.log(`   💾 文件已保存`);
            }
            
            console.log('');
        }
    }
    
    // 生成检查报告
    generateReport() {
        const totalFiles = this.issues.length;
        const totalIssues = this.issues.reduce((sum, file) => sum + file.issues.length, 0);
        const totalFixes = this.fixes.length;
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalFiles,
                totalIssues,
                totalFixes,
                unfixedIssues: totalIssues - totalFixes
            },
            issuesByType: {},
            fixesByType: {},
            details: {
                issues: this.issues,
                fixes: this.fixes
            }
        };
        
        // 按类型统计问题
        this.issues.forEach(file => {
            file.issues.forEach(issue => {
                report.issuesByType[issue.type] = (report.issuesByType[issue.type] || 0) + 1;
            });
        });
        
        // 按类型统计修复
        this.fixes.forEach(fix => {
            report.fixesByType[fix.type] = (report.fixesByType[fix.type] || 0) + 1;
        });
        
        return report;
    }
    
    // 执行检查
    async check() {
        console.log('🔍 开始全面路径检查...\n');
        
        try {
            // 扫描所有markdown文件
            const allFiles = await this.scanDirectory(this.contentDir);
            console.log(`📁 找到 ${allFiles.length} 个markdown文件`);
            
            // 检查每个文件
            for (const filePath of allFiles) {
                await this.checkFile(filePath);
            }
            
            console.log(`\n📊 检查完成:`);
            console.log(`   有问题的文件: ${this.issues.length} 个`);
            console.log(`   问题总数: ${this.issues.reduce((sum, file) => sum + file.issues.length, 0)} 个`);
            
            // 显示问题统计
            const issueTypes = {};
            this.issues.forEach(file => {
                file.issues.forEach(issue => {
                    issueTypes[issue.type] = (issueTypes[issue.type] || 0) + 1;
                });
            });
            
            if (Object.keys(issueTypes).length > 0) {
                console.log('\n📋 问题类型统计:');
                Object.entries(issueTypes).forEach(([type, count]) => {
                    console.log(`   ${type}: ${count} 个`);
                });
            }
            
            // 自动修复
            if (this.issues.length > 0) {
                await this.autoFixPaths();
            }
            
            // 生成报告
            const report = this.generateReport();
            
            console.log('\n📊 修复完成统计:');
            console.log(`   修复问题数: ${report.summary.totalFixes} 个`);
            console.log(`   未修复问题: ${report.summary.unfixedIssues} 个`);
            
            // 保存详细报告
            const reportPath = './path-check-report.json';
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
            console.log(`\n📋 详细报告已保存: ${reportPath}`);
            
            return report;
            
        } catch (error) {
            console.error('❌ 检查过程中发生错误:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const checker = new PathChecker();
    checker.check().catch(console.error);
}

module.exports = PathChecker;
