#!/usr/bin/env node

/**
 * 全面图片路径验证工具
 * 检查项目中所有图片引用是否指向存在的文件
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    // 需要检查的文件
    checkFiles: [
        'content/_index.md',
        'hugo.toml',
        'layouts/partials/header.html',
        'layouts/partials/head.html',
        'layouts/news/single.html',
        'static/css/main.css',
        'static/js/image-handler.js',
        'static/admin/config.yml'
    ],
    
    // 静态资源目录
    staticDir: 'static',
    
    // 图片扩展名
    imageExtensions: ['.jpg', '.jpeg', '.png', '.webp', '.svg', '.gif'],
    
    // 忽略的外部URL
    ignoreExternalUrls: true
};

/**
 * 提取文件中的图片路径
 */
async function extractImagePaths(filePath) {
    try {
        const content = await fs.readFile(filePath, 'utf8');
        const imagePaths = [];
        
        // 匹配各种图片路径格式
        const patterns = [
            /image:\s*["']([^"']+)["']/g,
            /logo:\s*["']([^"']+)["']/g,
            /src=["']([^"']*\.(?:jpg|jpeg|png|webp|svg|gif))["']/gi,
            /url\(["']?([^"')]*\.(?:jpg|jpeg|png|webp|svg|gif))["']?\)/gi,
            /content:\s*url\(["']?([^"')]*\.(?:jpg|jpeg|png|webp|svg|gif))["']?\)/gi,
            /logo_url:\s*[^"']*["']([^"']*\.(?:jpg|jpeg|png|webp|svg|gif))["']/gi
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const imagePath = match[1];
                
                // 跳过外部URL
                if (config.ignoreExternalUrls && imagePath.startsWith('http')) {
                    continue;
                }
                
                // 跳过占位符
                if (imagePath.includes('placeholder') || imagePath.includes('picsum')) {
                    continue;
                }
                
                imagePaths.push({
                    path: imagePath,
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length,
                    context: match[0]
                });
            }
        });
        
        return imagePaths;
    } catch (error) {
        console.error(`❌ 读取文件失败 ${filePath}:`, error.message);
        return [];
    }
}

/**
 * 检查图片文件是否存在
 */
async function checkImageExists(imagePath) {
    // 处理绝对路径
    let checkPath = imagePath;
    if (checkPath.startsWith('/')) {
        checkPath = checkPath.substring(1);
    }
    
    const fullPath = path.join(config.staticDir, checkPath);
    
    try {
        await fs.access(fullPath);
        return { exists: true, fullPath };
    } catch {
        return { exists: false, fullPath };
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('🔍 全面图片路径验证工具\n');
    console.log('='.repeat(60));
    
    const results = {
        total: 0,
        valid: 0,
        invalid: 0,
        issues: []
    };
    
    // 检查所有配置文件
    for (const file of config.checkFiles) {
        console.log(`\n📄 检查文件: ${file}`);
        
        try {
            await fs.access(file);
        } catch {
            console.log(`   ⚠️ 文件不存在，跳过`);
            continue;
        }
        
        const imagePaths = await extractImagePaths(file);
        console.log(`   找到 ${imagePaths.length} 个图片引用`);
        
        for (const imageRef of imagePaths) {
            results.total++;
            
            const checkResult = await checkImageExists(imageRef.path);
            
            if (checkResult.exists) {
                results.valid++;
                console.log(`   ✅ ${imageRef.path}`);
            } else {
                results.invalid++;
                console.log(`   ❌ ${imageRef.path} (第${imageRef.line}行)`);
                console.log(`      上下文: ${imageRef.context}`);
                
                results.issues.push({
                    file: imageRef.file,
                    line: imageRef.line,
                    path: imageRef.path,
                    fullPath: checkResult.fullPath,
                    context: imageRef.context,
                    type: 'missing'
                });
            }
        }
    }
    
    // 输出统计结果
    console.log('\n' + '='.repeat(60));
    console.log('📊 验证结果统计:');
    console.log(`   总图片引用: ${results.total}`);
    console.log(`   有效路径: ${results.valid}`);
    console.log(`   无效路径: ${results.invalid}`);
    
    if (results.invalid > 0) {
        console.log('\n❌ 发现问题:');
        results.issues.forEach((issue, index) => {
            console.log(`\n${index + 1}. ${issue.file}:${issue.line}`);
            console.log(`   路径: ${issue.path}`);
            console.log(`   完整路径: ${issue.fullPath}`);
            console.log(`   上下文: ${issue.context}`);
        });
        
        console.log('\n🔧 修复建议:');
        console.log('1. 检查图片文件是否存在于正确位置');
        console.log('2. 确认图片路径映射是否正确');
        console.log('3. 运行图片路径修复工具');
        
        process.exit(1);
    } else {
        console.log('\n✅ 所有图片路径验证通过！');
        process.exit(0);
    }
}

// 运行主函数
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 程序执行失败:', error);
        process.exit(1);
    });
}

module.exports = { main, extractImagePaths, checkImageExists };
