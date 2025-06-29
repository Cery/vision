#!/usr/bin/env node

/**
 * 简化的文件编码修复工具
 * 解决Git提交时的encoding-check错误
 */

const fs = require('fs');
const path = require('path');

// 配置
const config = {
    // 需要检查的文件扩展名
    extensions: ['.html', '.css', '.js', '.md', '.yml', '.yaml', '.toml', '.json'],
    
    // 需要检查的目录
    directories: [
        'layouts',
        'static',
        'content',
        'data',
        'scripts'
    ],
    
    // 排除的目录和文件
    exclude: [
        'node_modules',
        '.git',
        'public',
        'resources',
        '.hugo_build.lock'
    ]
};

/**
 * 检查并移除BOM
 */
function removeBOM(filePath) {
    try {
        const buffer = fs.readFileSync(filePath);
        
        // 检查BOM (EF BB BF)
        if (buffer.length >= 3 && 
            buffer[0] === 0xEF && 
            buffer[1] === 0xBB && 
            buffer[2] === 0xBF) {
            
            // 移除BOM
            const withoutBom = buffer.slice(3);
            fs.writeFileSync(filePath, withoutBom);
            console.log(`  ✓ ${filePath} (移除BOM)`);
            return { success: true, action: 'remove-bom' };
        }
        
        // 检查是否包含非UTF-8字符
        const content = buffer.toString('utf8');
        if (content.includes('\uFFFD')) {
            console.log(`  ⚠️ ${filePath} (可能包含非UTF-8字符)`);
            return { success: false, action: 'encoding-issue' };
        }
        
        console.log(`  ✓ ${filePath} (编码正常)`);
        return { success: true, action: 'ok' };
        
    } catch (error) {
        console.log(`  ❌ ${filePath} (处理失败: ${error.message})`);
        return { success: false, action: 'error', error: error.message };
    }
}

/**
 * 获取所有需要处理的文件
 */
function getAllFiles() {
    const files = [];
    
    function scanDirectory(dir) {
        try {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    if (!config.exclude.includes(entry.name)) {
                        scanDirectory(fullPath);
                    }
                } else if (entry.isFile()) {
                    const ext = path.extname(entry.name).toLowerCase();
                    if (config.extensions.includes(ext)) {
                        files.push(fullPath);
                    }
                }
            }
        } catch (error) {
            console.warn(`警告: 无法扫描目录 ${dir}: ${error.message}`);
        }
    }
    
    for (const dir of config.directories) {
        if (fs.existsSync(dir)) {
            scanDirectory(dir);
        }
    }
    
    // 添加根目录的配置文件
    const rootFiles = ['hugo.toml', 'netlify.toml', 'package.json'];
    for (const file of rootFiles) {
        if (fs.existsSync(file)) {
            files.push(file);
        }
    }
    
    return files;
}

/**
 * 主函数
 */
function main() {
    console.log('🔧 简化编码修复工具\n');
    console.log('='.repeat(50));
    
    const files = getAllFiles();
    console.log(`\n📁 找到 ${files.length} 个文件需要检查\n`);
    
    const results = {
        total: 0,
        ok: 0,
        bomRemoved: 0,
        encodingIssues: 0,
        errors: 0
    };
    
    for (const file of files) {
        results.total++;
        
        const result = removeBOM(file);
        
        if (result.success) {
            switch (result.action) {
                case 'ok':
                    results.ok++;
                    break;
                case 'remove-bom':
                    results.bomRemoved++;
                    break;
            }
        } else {
            if (result.action === 'encoding-issue') {
                results.encodingIssues++;
            } else {
                results.errors++;
            }
        }
    }
    
    // 输出统计结果
    console.log('\n' + '='.repeat(50));
    console.log('📊 处理结果统计:');
    console.log(`   总文件数: ${results.total}`);
    console.log(`   编码正常: ${results.ok}`);
    console.log(`   移除BOM: ${results.bomRemoved}`);
    console.log(`   编码问题: ${results.encodingIssues}`);
    console.log(`   处理失败: ${results.errors}`);
    
    if (results.bomRemoved > 0) {
        console.log('\n✅ BOM移除完成！');
    } else {
        console.log('\n✅ 所有文件编码正常，无需修复。');
    }
    
    if (results.encodingIssues > 0 || results.errors > 0) {
        console.log('\n⚠️ 发现一些问题，请手动检查相关文件。');
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    try {
        main();
    } catch (error) {
        console.error('❌ 程序执行失败:', error);
        process.exit(1);
    }
}

module.exports = { main, removeBOM };
