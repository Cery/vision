#!/usr/bin/env node

/**
 * 优化的服务器启动脚本
 * 包含性能监控、内存管理和错误处理
 */

const cluster = require('cluster');
const os = require('os');
const path = require('path');

// 性能监控
const performanceMonitor = {
    startTime: Date.now(),
    requestCount: 0,
    errorCount: 0,
    
    logStats() {
        const uptime = Date.now() - this.startTime;
        const memUsage = process.memoryUsage();
        
        console.log('\n📊 性能统计:');
        console.log(`⏱️  运行时间: ${Math.floor(uptime / 1000)}秒`);
        console.log(`📈 请求总数: ${this.requestCount}`);
        console.log(`❌ 错误总数: ${this.errorCount}`);
        console.log(`💾 内存使用: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`);
        console.log(`📊 RSS内存: ${Math.round(memUsage.rss / 1024 / 1024)}MB`);
    }
};

// 定期输出性能统计
setInterval(() => {
    performanceMonitor.logStats();
}, 5 * 60 * 1000); // 每5分钟

// 内存监控和清理
function setupMemoryMonitoring() {
    setInterval(() => {
        const memUsage = process.memoryUsage();
        const heapUsedMB = memUsage.heapUsed / 1024 / 1024;
        
        // 如果内存使用超过500MB，触发垃圾回收
        if (heapUsedMB > 500) {
            console.log(`⚠️  内存使用过高: ${Math.round(heapUsedMB)}MB，触发垃圾回收`);
            if (global.gc) {
                global.gc();
            }
        }
    }, 30000); // 每30秒检查一次
}

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error);
    performanceMonitor.errorCount++;
    
    // 优雅关闭
    setTimeout(() => {
        process.exit(1);
    }, 1000);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
    performanceMonitor.errorCount++;
});

// 优雅关闭处理
process.on('SIGTERM', () => {
    console.log('\n🛑 收到SIGTERM信号，开始优雅关闭...');
    performanceMonitor.logStats();
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('\n🛑 收到SIGINT信号，开始优雅关闭...');
    performanceMonitor.logStats();
    process.exit(0);
});

// 主服务器启动逻辑
function startServer() {
    console.log('🚀 启动优化服务器...');
    
    // 设置环境变量
    process.env.NODE_ENV = process.env.NODE_ENV || 'development';
    process.env.SERVER_PORT = process.env.SERVER_PORT || '3002';
    process.env.PRODUCT_SERVER_PORT = process.env.PRODUCT_SERVER_PORT || '3003';
    process.env.CONTENT_SERVER_PORT = process.env.CONTENT_SERVER_PORT || '3001';
    
    // 启用垃圾回收（如果可用）
    if (global.gc) {
        console.log('✅ 垃圾回收已启用');
    } else {
        console.log('⚠️  垃圾回收未启用，建议使用 --expose-gc 参数启动');
    }
    
    // 设置内存监控
    setupMemoryMonitoring();
    
    // 启动主服务器
    const mainServer = require('./server.js');
    
    // 启动产品服务器
    setTimeout(() => {
        require('./product-server.js');
    }, 1000);
    
    // 启动内容服务器
    setTimeout(() => {
        require('./content-server.js');
    }, 2000);
    
    console.log('✅ 所有服务器启动完成');
    console.log('📊 性能监控已启用');
    console.log('🔧 使用 Ctrl+C 优雅关闭服务器');
    
    // 初始性能统计
    setTimeout(() => {
        performanceMonitor.logStats();
    }, 5000);
}

// 集群模式（可选）
if (process.env.CLUSTER_MODE === 'true') {
    const numCPUs = os.cpus().length;
    
    if (cluster.isMaster) {
        console.log(`🔧 集群模式启动，CPU核心数: ${numCPUs}`);
        
        // 创建工作进程
        for (let i = 0; i < Math.min(numCPUs, 4); i++) {
            cluster.fork();
        }
        
        cluster.on('exit', (worker, code, signal) => {
            console.log(`⚠️  工作进程 ${worker.process.pid} 退出`);
            cluster.fork(); // 重启工作进程
        });
    } else {
        startServer();
    }
} else {
    startServer();
}

module.exports = { performanceMonitor };
