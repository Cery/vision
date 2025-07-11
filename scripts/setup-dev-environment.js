#!/usr/bin/env node

/**
 * 开发环境设置脚本
 * 自动检查和安装所需的依赖和工具
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

// 配置
const config = {
    // 必需的全局工具
    globalTools: [
        { name: 'Hugo', command: 'hugo version', install: 'winget install Hugo.Hugo.Extended' },
        { name: 'Git', command: 'git --version', install: 'winget install Git.Git' },
        { name: 'Node.js', command: 'node --version', install: 'winget install OpenJS.NodeJS' }
    ],
    
    // 必需的 npm 包
    requiredPackages: [
        'sharp',
        'glob',
        'js-yaml',
        'gray-matter'
    ],
    
    // 可选的 npm 包
    optionalPackages: [
        'imagemin',
        'imagemin-webp',
        'imagemin-mozjpeg'
    ],
    
    // 需要创建的目录
    directories: [
        'static/images/optimized',
        'static/images/placeholders',
        'static/uploads',
        'optimization-results',
        'logs'
    ],
    
    // 需要检查的配置文件
    configFiles: [
        { file: '.env', template: '.env.example' },
        { file: 'postcss.config.js', required: true },
        { file: 'hugo.toml', required: true },
        { file: 'netlify.toml', required: true }
    ]
};

/**
 * 日志工具
 */
class Logger {
    static info(message) {
        console.log(`ℹ️  ${message}`);
    }
    
    static success(message) {
        console.log(`✅ ${message}`);
    }
    
    static warn(message) {
        console.log(`⚠️  ${message}`);
    }
    
    static error(message) {
        console.log(`❌ ${message}`);
    }
    
    static section(title) {
        console.log(`\n${'='.repeat(50)}`);
        console.log(`🔧 ${title}`);
        console.log('='.repeat(50));
    }
}

/**
 * 检查全局工具
 */
async function checkGlobalTools() {
    Logger.section('检查全局工具');
    
    const missing = [];
    
    for (const tool of config.globalTools) {
        try {
            execSync(tool.command, { stdio: 'ignore' });
            Logger.success(`${tool.name} 已安装`);
        } catch (error) {
            Logger.error(`${tool.name} 未安装`);
            missing.push(tool);
        }
    }
    
    if (missing.length > 0) {
        Logger.warn('缺少以下工具，请手动安装:');
        missing.forEach(tool => {
            Logger.info(`  ${tool.install}`);
        });
        return false;
    }
    
    return true;
}

/**
 * 检查和安装 npm 包
 */
async function checkNpmPackages() {
    Logger.section('检查 npm 包');
    
    const missing = [];
    const optional = [];
    
    // 检查必需包
    for (const pkg of config.requiredPackages) {
        try {
            require.resolve(pkg);
            Logger.success(`${pkg} 已安装`);
        } catch (error) {
            missing.push(pkg);
            Logger.error(`${pkg} 未安装 (必需)`);
        }
    }
    
    // 检查可选包
    for (const pkg of config.optionalPackages) {
        try {
            require.resolve(pkg);
            Logger.success(`${pkg} 已安装`);
        } catch (error) {
            optional.push(pkg);
            Logger.warn(`${pkg} 未安装 (可选)`);
        }
    }
    
    // 安装缺失的必需包
    if (missing.length > 0) {
        Logger.info('安装缺失的必需包...');
        try {
            execSync(`npm install ${missing.join(' ')} --save-dev`, { stdio: 'inherit' });
            Logger.success('必需包安装完成');
        } catch (error) {
            Logger.error('包安装失败');
            return false;
        }
    }
    
    // 提示安装可选包
    if (optional.length > 0) {
        Logger.warn('建议安装以下可选包以获得更好的功能:');
        Logger.info(`npm install ${optional.join(' ')} --save-dev`);
    }
    
    return true;
}

/**
 * 创建必需目录
 */
async function createDirectories() {
    Logger.section('创建目录结构');
    
    for (const dir of config.directories) {
        try {
            await fs.mkdir(dir, { recursive: true });
            Logger.success(`创建目录: ${dir}`);
        } catch (error) {
            Logger.error(`创建目录失败: ${dir}`);
        }
    }
}

/**
 * 检查配置文件
 */
async function checkConfigFiles() {
    Logger.section('检查配置文件');
    
    for (const configFile of config.configFiles) {
        try {
            await fs.access(configFile.file);
            Logger.success(`配置文件存在: ${configFile.file}`);
        } catch (error) {
            if (configFile.template) {
                Logger.warn(`配置文件不存在: ${configFile.file}`);
                Logger.info(`请复制 ${configFile.template} 为 ${configFile.file} 并配置`);
            } else if (configFile.required) {
                Logger.error(`必需配置文件缺失: ${configFile.file}`);
            }
        }
    }
}

/**
 * 主函数
 */
async function main() {
    console.log('🚀 VisNDT 开发环境设置工具\n');
    
    try {
        // 检查全局工具
        const toolsOk = await checkGlobalTools();
        
        // 检查 npm 包
        const packagesOk = await checkNpmPackages();
        
        // 创建目录
        await createDirectories();
        
        // 检查配置文件
        await checkConfigFiles();
        
        Logger.section('设置完成');
        
        if (toolsOk && packagesOk) {
            Logger.success('开发环境设置完成！');
            Logger.info('现在可以运行: npm run dev');
        } else {
            Logger.warn('开发环境设置部分完成，请检查上述错误');
        }
        
    } catch (error) {
        Logger.error(`设置失败: ${error.message}`);
        process.exit(1);
    }
}

// 运行主函数
if (require.main === module) {
    main();
}

module.exports = { main, Logger };
