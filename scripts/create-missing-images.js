#!/usr/bin/env node

/**
 * 创建缺失图片工具
 * 为缺失的图片路径创建目录和占位图片
 */

const fs = require('fs');
const path = require('path');

class MissingImageCreator {
    constructor() {
        this.staticDir = './static';
        this.placeholderSvg = `<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="100%" height="100%" fill="#f0f0f0"/>
  <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="24" fill="#666" text-anchor="middle" dy=".3em">
    图片占位符
  </text>
  <text x="50%" y="60%" font-family="Arial, sans-serif" font-size="16" fill="#999" text-anchor="middle" dy=".3em">
    Placeholder Image
  </text>
</svg>`;
        
        this.createdDirs = [];
        this.createdFiles = [];
    }
    
    // 确保目录存在
    ensureDirectorySync(dirPath) {
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
            this.createdDirs.push(dirPath);
            console.log(`📁 创建目录: ${dirPath}`);
            return true;
        }
        return false;
    }
    
    // 创建占位图片
    createPlaceholderImage(imagePath) {
        const fullPath = path.join(this.staticDir, imagePath.substring(1));
        const dir = path.dirname(fullPath);
        
        // 确保目录存在
        this.ensureDirectorySync(dir);
        
        // 如果文件不存在，创建占位图片
        if (!fs.existsSync(fullPath)) {
            const ext = path.extname(fullPath).toLowerCase();
            
            if (ext === '.svg') {
                fs.writeFileSync(fullPath, this.placeholderSvg);
            } else {
                // 对于其他格式，复制现有的占位符或创建SVG
                const placeholderPath = path.join(this.staticDir, 'images', 'placeholder.svg');
                if (fs.existsSync(placeholderPath)) {
                    // 如果是SVG，直接复制
                    if (ext === '.svg') {
                        fs.copyFileSync(placeholderPath, fullPath);
                    } else {
                        // 对于其他格式，创建SVG占位符
                        const svgPath = fullPath.replace(/\.[^.]+$/, '.svg');
                        fs.writeFileSync(svgPath, this.placeholderSvg);
                        console.log(`📷 创建SVG占位符: ${svgPath} (原路径: ${fullPath})`);
                        this.createdFiles.push(svgPath);
                        return svgPath;
                    }
                } else {
                    fs.writeFileSync(fullPath, this.placeholderSvg);
                }
            }
            
            console.log(`📷 创建占位图片: ${fullPath}`);
            this.createdFiles.push(fullPath);
            return fullPath;
        }
        
        return null;
    }
    
    // 处理报告中的缺失图片
    processMissingImages() {
        console.log('🔧 开始创建缺失的图片和目录...\n');
        
        try {
            // 读取路径检查报告
            const reportPath = './simple-path-check-report.json';
            if (!fs.existsSync(reportPath)) {
                console.error('❌ 找不到路径检查报告文件');
                return;
            }
            
            const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
            
            // 收集所有缺失的图片路径
            const missingPaths = new Set();
            
            report.issues.forEach(fileIssue => {
                fileIssue.issues.forEach(issue => {
                    missingPaths.add(issue.path);
                });
            });
            
            console.log(`📊 发现 ${missingPaths.size} 个缺失的图片路径\n`);
            
            // 创建缺失的图片
            missingPaths.forEach(imagePath => {
                this.createPlaceholderImage(imagePath);
            });
            
            // 创建常用的目录结构
            this.createCommonDirectories();
            
            console.log('\n📊 创建完成统计:');
            console.log(`   创建目录: ${this.createdDirs.length} 个`);
            console.log(`   创建图片: ${this.createdFiles.length} 个`);
            
            if (this.createdDirs.length > 0) {
                console.log('\n📁 创建的目录:');
                this.createdDirs.forEach(dir => {
                    console.log(`   ${dir}`);
                });
            }
            
            // 生成创建报告
            const createReport = {
                timestamp: new Date().toISOString(),
                createdDirectories: this.createdDirs,
                createdFiles: this.createdFiles,
                summary: {
                    totalDirectories: this.createdDirs.length,
                    totalFiles: this.createdFiles.length
                }
            };
            
            fs.writeFileSync('./missing-images-creation-report.json', JSON.stringify(createReport, null, 2));
            console.log('\n📋 创建报告已保存: missing-images-creation-report.json');
            
        } catch (error) {
            console.error('❌ 处理过程中发生错误:', error);
        }
    }
    
    // 创建常用的目录结构
    createCommonDirectories() {
        console.log('\n📁 创建常用目录结构...');
        
        const commonDirs = [
            'static/images/applications',
            'static/images/news/tech-article',
            'static/images/news/industry',
            'static/images/news/exhibition',
            'static/images/products/vs/K-series',
            'static/images/products/vs/P-series',
            'static/images/products/vs/F-series',
            'static/images/products/vs/O-series',
            'static/images/products/vis',
            'static/images/products/hk',
            'static/images/products/K-series',
            'static/images/products/P60',
            'static/images/products/DZ'
        ];
        
        commonDirs.forEach(dir => {
            this.ensureDirectorySync(dir);
        });
        
        // 创建一些常用的占位图片
        const commonImages = [
            '/images/applications/automotive-inspection.jpg',
            '/images/applications/aerospace-inspection.jpg',
            '/images/applications/precision-machinery-inspection.jpg',
            '/images/applications/microelectronics-inspection.jpg',
            '/images/applications/medical-device-inspection.jpg',
            '/images/applications/manufacturing-inspection.jpg',
            '/images/applications/pipeline-inspection.jpg',
            '/images/applications/maintenance-inspection.jpg',
            '/images/applications/petrochemical-inspection.jpg',
            '/images/applications/power-equipment-inspection.jpg',
            '/images/applications/marine-inspection.jpg',
            '/images/applications/heavy-machinery-inspection.jpg',
            '/images/applications/infrastructure-inspection.jpg',
            '/images/applications/large-industrial-equipment.jpg',
            '/images/applications/special-equipment-inspection.jpg',
            '/images/products/K-series/K-3.jpg',
            '/images/products/P60/P-3.jpeg'
        ];
        
        console.log('\n📷 创建常用占位图片...');
        commonImages.forEach(imagePath => {
            this.createPlaceholderImage(imagePath);
        });
    }
    
    // 创建特定系列的图片
    createSeriesImages() {
        console.log('\n📷 创建产品系列图片...');
        
        // K系列图片
        const kSeriesImages = [];
        for (let i = 1; i <= 14; i++) {
            kSeriesImages.push(`/images/products/vs/K-series/KX-${i}.jpg`);
        }
        
        kSeriesImages.forEach(imagePath => {
            this.createPlaceholderImage(imagePath);
        });
        
        // P系列图片
        const pSeriesImages = [
            '/images/products/P60/P-MAIN.jpg',
            '/images/products/P60/P-1.jpg',
            '/images/products/P60/P-2.jpg',
            '/images/products/P60/P-3.jpeg'
        ];
        
        pSeriesImages.forEach(imagePath => {
            this.createPlaceholderImage(imagePath);
        });
        
        // DZ系列图片
        const dzSeriesImages = [
            '/images/products/vs/DZ/DZX-1.jpg'
        ];
        
        dzSeriesImages.forEach(imagePath => {
            this.createPlaceholderImage(imagePath);
        });
    }
    
    // 执行创建
    create() {
        this.processMissingImages();
        this.createSeriesImages();
        
        console.log('\n✅ 缺失图片创建完成！');
        console.log('\n💡 提示:');
        console.log('   - 所有缺失的图片都已创建为SVG占位符');
        console.log('   - 您可以稍后替换这些占位符为实际图片');
        console.log('   - 占位符使用统一的设计，便于识别');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const creator = new MissingImageCreator();
    creator.create();
}

module.exports = MissingImageCreator;
