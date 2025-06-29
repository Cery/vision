#!/usr/bin/env node

/**
 * 文件编码修复工具
 * 将所有文件统一转换为UTF-8编码，解决Git提交时的encoding-check错误
 */

const fs = require('fs').promises;
const path = require('path');
const iconv = require('iconv-lite');

// 配置
const config = {
    // 需要检查的文件扩展名
    extensions: ['.html', '.css', '.js', '.md', '.yml', '.yaml', '.toml', '.json', '.svg'],
    
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
    ],
    
    // 支持的编码格式
    supportedEncodings: ['utf8', 'gbk', 'gb2312', 'big5', 'ascii']
};

/**
 * 检测文件编码
 */
function detectEncoding(buffer) {
    // 检查BOM
    if (buffer.length >= 3 && buffer[0] === 0xEF && buffer[1] === 0xBB && buffer[2] === 0xBF) {
        return 'utf8-bom';
    }
    
    // 尝试UTF-8解码
    try {
        const decoded = iconv.decode(buffer, 'utf8');
        if (iconv.encode(decoded, 'utf8').equals(buffer)) {
            return 'utf8';
        }
    } catch (e) {
        // UTF-8解码失败
    }
    
    // 尝试其他编码
    for (const encoding of config.supportedEncodings) {
        if (encoding === 'utf8') continue;
        
        try {
            const decoded = iconv.decode(buffer, encoding);
            if (decoded && decoded.length > 0) {
                return encoding;
            }
        } catch (e) {
            // 继续尝试下一个编码
        }
    }
    
    return 'unknown';
}

/**
 * 转换文件编码为UTF-8
 */
async function convertToUtf8(filePath, originalEncoding) {
    try {
        const buffer = await fs.readFile(filePath);
        
        if (originalEncoding === 'utf8') {
            console.log(`  ✓ ${filePath} (已是UTF-8)`);
            return { success: true, action: 'skip' };
        }
        
        if (originalEncoding === 'utf8-bom') {
            // 移除BOM
            const withoutBom = buffer.slice(3);
            await fs.writeFile(filePath, withoutBom);
            console.log(`  ✓ ${filePath} (移除BOM)`);
            return { success: true, action: 'remove-bom' };
        }
        
        if (originalEncoding === 'unknown') {
            console.log(`  ⚠️ ${filePath} (未知编码，跳过)`);
            return { success: false, action: 'skip', reason: 'unknown-encoding' };
        }
        
        // 转换编码
        const decoded = iconv.decode(buffer, originalEncoding);
        const utf8Buffer = iconv.encode(decoded, 'utf8');
        
        await fs.writeFile(filePath, utf8Buffer);
        console.log(`  ✓ ${filePath} (${originalEncoding} → UTF-8)`);
        return { success: true, action: 'convert', from: originalEncoding };
        
    } catch (error) {
        console.log(`  ❌ ${filePath} (转换失败: ${error.message})`);
        return { success: false, action: 'error', error: error.message };
    }
}

/**
 * 获取所有需要处理的文件
 */
async function getAllFiles() {
    const files = [];
    
    async function scanDirectory(dir) {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });
            
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                
                if (entry.isDirectory()) {
                    if (!config.exclude.includes(entry.name)) {
                        await scanDirectory(fullPath);
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
        await scanDirectory(dir);
    }
    
    // 添加根目录的配置文件
    const rootFiles = ['hugo.toml', 'netlify.toml', 'package.json'];
    for (const file of rootFiles) {
        try {
            await fs.access(file);
            files.push(file);
        } catch {
            // 文件不存在，跳过
        }
    }
    
    return files;
}

/**
 * 主函数
 */
async function main() {
    console.log('🔧 文件编码修复工具\n');
    console.log('='.repeat(50));
    
    const files = await getAllFiles();
    console.log(`\n📁 找到 ${files.length} 个文件需要检查\n`);
    
    const results = {
        total: 0,
        utf8: 0,
        converted: 0,
        bomRemoved: 0,
        skipped: 0,
        errors: 0
    };
    
    for (const file of files) {
        results.total++;
        
        try {
            const buffer = await fs.readFile(file);
            const encoding = detectEncoding(buffer);
            const result = await convertToUtf8(file, encoding);
            
            if (result.success) {
                switch (result.action) {
                    case 'skip':
                        results.utf8++;
                        break;
                    case 'convert':
                        results.converted++;
                        break;
                    case 'remove-bom':
                        results.bomRemoved++;
                        break;
                }
            } else {
                if (result.reason === 'unknown-encoding') {
                    results.skipped++;
                } else {
                    results.errors++;
                }
            }
        } catch (error) {
            console.log(`  ❌ ${file} (读取失败: ${error.message})`);
            results.errors++;
        }
    }
    
    // 输出统计结果
    console.log('\n' + '='.repeat(50));
    console.log('📊 处理结果统计:');
    console.log(`   总文件数: ${results.total}`);
    console.log(`   已是UTF-8: ${results.utf8}`);
    console.log(`   编码转换: ${results.converted}`);
    console.log(`   移除BOM: ${results.bomRemoved}`);
    console.log(`   跳过处理: ${results.skipped}`);
    console.log(`   处理失败: ${results.errors}`);
    
    if (results.converted > 0 || results.bomRemoved > 0) {
        console.log('\n✅ 编码修复完成！所有文件现在都使用UTF-8编码。');
    } else {
        console.log('\n✅ 所有文件编码正常，无需修复。');
    }
}

// 运行主函数
if (require.main === module) {
    main().catch(error => {
        console.error('❌ 程序执行失败:', error);
        process.exit(1);
    });
}

module.exports = { main, detectEncoding, convertToUtf8 };
