#!/usr/bin/env node

/**
 * 图片管理优化执行脚本
 * 一键执行所有图片优化任务
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    scripts: [
        {
            name: '生成占位图片',
            script: 'scripts/create-placeholder-images.js',
            description: '创建本地占位图片系统，替换外部占位服务'
        },
        {
            name: '替换占位服务',
            script: 'scripts/replace-placeholder-services.js',
            description: '将外部占位图片服务替换为本地占位图'
        },
        {
            name: '优化图片',
            script: 'scripts/optimize-images.js',
            description: '压缩和优化现有图片文件'
        }
    ],
    
    // 依赖检查
    dependencies: [
        { name: 'glob', package: 'glob' },
        { name: 'sharp', package: 'sharp', optional: true }
    ],
    
    // 输出目录
    outputDir: 'optimization-results',
    
    // 日志文件
    logFile: 'optimization-results/optimization.log'
};

/**
 * 日志记录器
 */
class Logger {
    constructor(logFile) {
        this.logFile = logFile;
        this.logs = [];
    }

    log(level, message) {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}`;
        
        console.log(logEntry);
        this.logs.push(logEntry);
    }

    info(message) {
        this.log('info', message);
    }

    warn(message) {
        this.log('warn', message);
    }

    error(message) {
        this.log('error', message);
    }

    success(message) {
        this.log('success', message);
    }

    async save() {
        try {
            const logDir = path.dirname(this.logFile);
            await fs.mkdir(logDir, { recursive: true });
            await fs.writeFile(this.logFile, this.logs.join('\n'), 'utf8');
        } catch (error) {
            console.error('保存日志失败:', error.message);
        }
    }
}

/**
 * 检查依赖
 */
async function checkDependencies(logger) {
    logger.info('检查依赖包...');
    
    const missing = [];
    const optional = [];
    
    for (const dep of config.dependencies) {
        try {
            require.resolve(dep.package);
            logger.success(`✓ ${dep.name} 已安装`);
        } catch (error) {
            if (dep.optional) {
                optional.push(dep);
                logger.warn(`⚠ ${dep.name} 未安装 (可选)`);
            } else {
                missing.push(dep);
                logger.error(`✗ ${dep.name} 未安装 (必需)`);
            }
        }
    }
    
    if (missing.length > 0) {
        logger.error('缺少必需的依赖包，请先安装:');
        missing.forEach(dep => {
            logger.error(`  npm install ${dep.package}`);
        });
        return false;
    }
    
    if (optional.length > 0) {
        logger.warn('建议安装以下可选依赖以获得更好的功能:');
        optional.forEach(dep => {
            logger.warn(`  npm install ${dep.package}`);
        });
    }
    
    return true;
}

/**
 * 执行脚本
 */
async function executeScript(scriptPath, logger) {
    return new Promise((resolve, reject) => {
        logger.info(`开始执行: ${scriptPath}`);
        
        const child = spawn('node', [scriptPath], {
            stdio: ['inherit', 'pipe', 'pipe'],
            cwd: process.cwd()
        });
        
        let stdout = '';
        let stderr = '';
        
        child.stdout.on('data', (data) => {
            const output = data.toString();
            stdout += output;
            // 实时显示输出
            process.stdout.write(output);
        });
        
        child.stderr.on('data', (data) => {
            const output = data.toString();
            stderr += output;
            process.stderr.write(output);
        });
        
        child.on('close', (code) => {
            if (code === 0) {
                logger.success(`✓ ${scriptPath} 执行成功`);
                resolve({ success: true, stdout, stderr });
            } else {
                logger.error(`✗ ${scriptPath} 执行失败 (退出码: ${code})`);
                reject(new Error(`脚本执行失败: ${scriptPath}`));
            }
        });
        
        child.on('error', (error) => {
            logger.error(`✗ ${scriptPath} 执行错误: ${error.message}`);
            reject(error);
        });
    });
}

/**
 * 生成执行报告
 */
async function generateReport(results, logger) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            total_scripts: config.scripts.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            duration: results.reduce((sum, r) => sum + (r.duration || 0), 0)
        },
        scripts: results,
        logs: logger.logs
    };
    
    const reportPath = path.join(config.outputDir, 'optimization-report.json');
    await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
    
    return report;
}

/**
 * 创建默认占位图
 */
async function createDefaultPlaceholder() {
    const placeholderSvg = `<svg width="400" height="300" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f8f9fa"/>
        <rect width="100%" height="100%" fill="url(#grid)" opacity="0.1"/>
        <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#dee2e6" stroke-width="1"/>
            </pattern>
        </defs>
        <circle cx="200" cy="120" r="40" fill="#6c757d" opacity="0.3"/>
        <text x="200" y="180" font-family="Arial, sans-serif" font-size="16" 
              fill="#6c757d" text-anchor="middle" font-weight="bold">
            VisNDT
        </text>
        <text x="200" y="200" font-family="Arial, sans-serif" font-size="12" 
              fill="#6c757d" text-anchor="middle" opacity="0.7">
            默认占位图
        </text>
        <text x="200" y="220" font-family="Arial, sans-serif" font-size="10" 
              fill="#6c757d" text-anchor="middle" opacity="0.5">
            400 × 300
        </text>
    </svg>`;
    
    try {
        await fs.mkdir('static/images', { recursive: true });
        await fs.writeFile('static/images/placeholder.svg', placeholderSvg, 'utf8');
        return true;
    } catch (error) {
        return false;
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 VisNDT 图片管理优化工具');
    console.log('='.repeat(60));
    console.log('');
    
    // 创建日志记录器
    const logger = new Logger(config.logFile);
    
    try {
        // 创建输出目录
        await fs.mkdir(config.outputDir, { recursive: true });
        logger.info(`创建输出目录: ${config.outputDir}`);
        
        // 创建默认占位图
        logger.info('创建默认占位图...');
        const placeholderCreated = await createDefaultPlaceholder();
        if (placeholderCreated) {
            logger.success('✓ 默认占位图创建成功');
        } else {
            logger.warn('⚠ 默认占位图创建失败');
        }
        
        // 检查依赖
        const dependenciesOk = await checkDependencies(logger);
        if (!dependenciesOk) {
            logger.error('依赖检查失败，请安装缺少的依赖包后重试');
            process.exit(1);
        }
        
        logger.info('开始执行优化脚本...');
        console.log('');
        
        // 执行所有脚本
        const results = [];
        
        for (let i = 0; i < config.scripts.length; i++) {
            const scriptConfig = config.scripts[i];
            
            console.log(`\n📋 步骤 ${i + 1}/${config.scripts.length}: ${scriptConfig.name}`);
            console.log(`📝 ${scriptConfig.description}`);
            console.log('-'.repeat(50));
            
            const startTime = Date.now();
            
            try {
                const result = await executeScript(scriptConfig.script, logger);
                const duration = Date.now() - startTime;
                
                results.push({
                    name: scriptConfig.name,
                    script: scriptConfig.script,
                    success: true,
                    duration,
                    output: result.stdout
                });
                
                logger.success(`✓ ${scriptConfig.name} 完成 (耗时: ${duration}ms)`);
                
            } catch (error) {
                const duration = Date.now() - startTime;
                
                results.push({
                    name: scriptConfig.name,
                    script: scriptConfig.script,
                    success: false,
                    duration,
                    error: error.message
                });
                
                logger.error(`✗ ${scriptConfig.name} 失败: ${error.message}`);
                
                // 询问是否继续
                console.log('\n是否继续执行剩余脚本？(y/N)');
                // 在实际环境中，这里可以添加用户输入处理
                // 现在默认继续执行
            }
        }
        
        // 生成报告
        logger.info('生成执行报告...');
        const report = await generateReport(results, logger);
        
        // 保存日志
        await logger.save();
        
        // 显示最终结果
        console.log('\n' + '='.repeat(60));
        console.log('🎉 图片优化完成！');
        console.log('\n📊 执行统计:');
        console.log(`   • 总脚本数: ${report.summary.total_scripts}`);
        console.log(`   • 成功执行: ${report.summary.successful}`);
        console.log(`   • 执行失败: ${report.summary.failed}`);
        console.log(`   • 总耗时: ${report.summary.duration}ms`);
        
        console.log('\n📁 输出文件:');
        console.log(`   • 执行报告: ${config.outputDir}/optimization-report.json`);
        console.log(`   • 执行日志: ${config.logFile}`);
        console.log(`   • 占位图片: static/images/placeholders/`);
        console.log(`   • 优化图片: static/images/optimized/`);
        
        console.log('\n🔗 管理界面:');
        console.log('   • 统一图片管理器: /admin/unified-image-manager.html');
        
        console.log('\n💡 下一步建议:');
        console.log('   1. 检查生成的占位图片');
        console.log('   2. 验证外部链接替换结果');
        console.log('   3. 测试网站图片加载');
        console.log('   4. 更新 Hugo 配置使用优化后的图片');
        
        if (report.summary.failed > 0) {
            console.log('\n⚠️ 注意: 有脚本执行失败，请检查日志文件');
            process.exit(1);
        }
        
    } catch (error) {
        logger.error(`执行失败: ${error.message}`);
        await logger.save();
        console.error('\n❌ 优化失败:', error.message);
        process.exit(1);
    }
}

// 运行脚本
if (require.main === module) {
    main();
}

module.exports = {
    executeScript,
    checkDependencies,
    generateReport,
    config
};
