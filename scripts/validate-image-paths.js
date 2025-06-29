#!/usr/bin/env node

/**
 * 图片路径验证工具
 * 检查项目中所有图片引用是否指向存在的文件
 */

const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    // 需要检查的文件
    contentFiles: [
        'content/_index.md',
        'hugo.toml'
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
            /src=["']([^"']*\.(?:jpg|jpeg|png|webp|svg|gif))["']/gi,
            /url\(["']?([^"')]*\.(?:jpg|jpeg|png|webp|svg|gif))["']?\)/gi
        ];
        
        patterns.forEach(pattern => {
            let match;
            while ((match = pattern.exec(content)) !== null) {
                const imagePath = match[1];
                
                // 跳过外部URL
                if (config.ignoreExternalUrls && imagePath.startsWith('http')) {
                    continue;
                }
                
                imagePaths.push({
                    path: imagePath,
                    file: filePath,
                    line: content.substring(0, match.index).split('\n').length
                });
            }
        });
        
        return imagePaths;
    } catch (error) {
        console.warn(`警告: 无法读取文件 ${filePath}:`, error.message);
        return [];
    }
}

/**
 * 检查图片文件是否存在
 */
async function checkImageExists(imagePath) {
    // 处理相对路径
    let fullPath = imagePath;
    if (imagePath.startsWith('/')) {
        fullPath = path.join(config.staticDir, imagePath);
    } else {
        fullPath = path.join(config.staticDir, 'images', imagePath);
    }
    
    try {
        await fs.access(fullPath);
        return { exists: true, fullPath };
    } catch {
        return { exists: false, fullPath };
    }
}

/**
 * 主验证函数
 */
async function validateImagePaths() {
    console.log('🔍 图片路径验证工具\n');
    console.log('='.repeat(50));
    
    const results = {
        total: 0,
        valid: 0,
        invalid: 0,
        issues: []
    };
    
    // 检查所有配置文件
    for (const file of config.contentFiles) {
        console.log(`\n📄 检查文件: ${file}`);
        
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
                
                results.issues.push({
                    file: imageRef.file,
                    line: imageRef.line,
                    path: imageRef.path,
                    fullPath: checkResult.fullPath,
                    type: 'missing'
                });
            }
        }
    }
    
    // 输出总结
    console.log('\n📊 验证结果');
    console.log('='.repeat(30));
    console.log(`总计图片引用: ${results.total}`);
    console.log(`有效路径: ${results.valid}`);
    console.log(`无效路径: ${results.invalid}`);
    
    if (results.issues.length > 0) {
        console.log('\n❌ 发现的问题:');
        results.issues.forEach((issue, index) => {
            console.log(`${index + 1}. ${issue.file}:${issue.line}`);
            console.log(`   路径: ${issue.path}`);
            console.log(`   完整路径: ${issue.fullPath}`);
            console.log('');
        });
        
        // 生成修复建议
        console.log('🔧 修复建议:');
        console.log('1. 检查图片文件是否存在于正确位置');
        console.log('2. 验证图片路径拼写是否正确');
        console.log('3. 确认图片文件扩展名是否匹配');
        console.log('4. 考虑使用占位图片替代缺失的图片');
    } else {
        console.log('\n✅ 所有图片路径都有效！');
    }
    
    return results;
}

// 运行验证
if (require.main === module) {
    validateImagePaths()
        .then(results => {
            process.exit(results.invalid > 0 ? 1 : 0);
        })
        .catch(error => {
            console.error('验证过程中发生错误:', error);
            process.exit(1);
        });
}

module.exports = { validateImagePaths, extractImagePaths, checkImageExists };
