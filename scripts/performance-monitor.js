#!/usr/bin/env node

/**
 * 性能监控工具
 * 监控服务器性能、内存使用、响应时间等指标
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            startTime: Date.now(),
            requests: {
                total: 0,
                success: 0,
                error: 0,
                avgResponseTime: 0
            },
            memory: {
                peak: 0,
                current: 0,
                history: []
            },
            cache: {
                hits: 0,
                misses: 0,
                size: 0
            }
        };
        
        this.servers = [
            { name: 'Main Server', port: 3002 },
            { name: 'Product Server', port: 3003 },
            { name: 'Content Server', port: 3001 }
        ];
        
        this.logFile = path.join(__dirname, '../logs/performance.log');
        this.ensureLogDirectory();
    }
    
    ensureLogDirectory() {
        const logDir = path.dirname(this.logFile);
        if (!fs.existsSync(logDir)) {
            fs.mkdirSync(logDir, { recursive: true });
        }
    }
    
    // 检查服务器状态
    async checkServerHealth() {
        const results = [];
        
        for (const server of this.servers) {
            try {
                const startTime = Date.now();
                const isHealthy = await this.pingServer(server.port);
                const responseTime = Date.now() - startTime;
                
                results.push({
                    name: server.name,
                    port: server.port,
                    status: isHealthy ? 'healthy' : 'unhealthy',
                    responseTime: responseTime
                });
            } catch (error) {
                results.push({
                    name: server.name,
                    port: server.port,
                    status: 'error',
                    error: error.message
                });
            }
        }
        
        return results;
    }
    
    // Ping服务器
    pingServer(port) {
        return new Promise((resolve) => {
            const req = http.request({
                hostname: 'localhost',
                port: port,
                path: '/',
                method: 'GET',
                timeout: 5000
            }, (res) => {
                resolve(res.statusCode < 400);
            });
            
            req.on('error', () => resolve(false));
            req.on('timeout', () => {
                req.destroy();
                resolve(false);
            });
            
            req.end();
        });
    }
    
    // 收集内存指标
    collectMemoryMetrics() {
        const memUsage = process.memoryUsage();
        const memInfo = {
            timestamp: Date.now(),
            heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024), // MB
            heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024), // MB
            rss: Math.round(memUsage.rss / 1024 / 1024), // MB
            external: Math.round(memUsage.external / 1024 / 1024) // MB
        };
        
        this.metrics.memory.current = memInfo.heapUsed;
        this.metrics.memory.peak = Math.max(this.metrics.memory.peak, memInfo.heapUsed);
        this.metrics.memory.history.push(memInfo);
        
        // 只保留最近100条记录
        if (this.metrics.memory.history.length > 100) {
            this.metrics.memory.history.shift();
        }
        
        return memInfo;
    }
    
    // 生成性能报告
    async generateReport() {
        const serverHealth = await this.checkServerHealth();
        const memoryInfo = this.collectMemoryMetrics();
        const uptime = Date.now() - this.metrics.startTime;
        
        const report = {
            timestamp: new Date().toISOString(),
            uptime: {
                seconds: Math.floor(uptime / 1000),
                formatted: this.formatUptime(uptime)
            },
            servers: serverHealth,
            memory: {
                current: memoryInfo,
                peak: this.metrics.memory.peak,
                average: this.calculateAverageMemory()
            },
            requests: this.metrics.requests,
            cache: this.metrics.cache,
            recommendations: this.generateRecommendations(memoryInfo, serverHealth)
        };
        
        return report;
    }
    
    // 计算平均内存使用
    calculateAverageMemory() {
        if (this.metrics.memory.history.length === 0) return 0;
        
        const sum = this.metrics.memory.history.reduce((acc, item) => acc + item.heapUsed, 0);
        return Math.round(sum / this.metrics.memory.history.length);
    }
    
    // 格式化运行时间
    formatUptime(uptime) {
        const seconds = Math.floor(uptime / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (days > 0) return `${days}天 ${hours % 24}小时 ${minutes % 60}分钟`;
        if (hours > 0) return `${hours}小时 ${minutes % 60}分钟`;
        if (minutes > 0) return `${minutes}分钟 ${seconds % 60}秒`;
        return `${seconds}秒`;
    }
    
    // 生成优化建议
    generateRecommendations(memoryInfo, serverHealth) {
        const recommendations = [];
        
        // 内存建议
        if (memoryInfo.heapUsed > 300) {
            recommendations.push({
                type: 'memory',
                level: 'warning',
                message: `内存使用过高 (${memoryInfo.heapUsed}MB)，建议检查内存泄漏`
            });
        }
        
        if (memoryInfo.heapUsed > 500) {
            recommendations.push({
                type: 'memory',
                level: 'critical',
                message: `内存使用严重过高 (${memoryInfo.heapUsed}MB)，建议立即重启服务器`
            });
        }
        
        // 服务器健康建议
        const unhealthyServers = serverHealth.filter(s => s.status !== 'healthy');
        if (unhealthyServers.length > 0) {
            recommendations.push({
                type: 'server',
                level: 'error',
                message: `发现 ${unhealthyServers.length} 个不健康的服务器: ${unhealthyServers.map(s => s.name).join(', ')}`
            });
        }
        
        // 响应时间建议
        const slowServers = serverHealth.filter(s => s.responseTime > 1000);
        if (slowServers.length > 0) {
            recommendations.push({
                type: 'performance',
                level: 'warning',
                message: `发现 ${slowServers.length} 个响应缓慢的服务器 (>1s)`
            });
        }
        
        return recommendations;
    }
    
    // 保存报告到日志文件
    async saveReport(report) {
        const logEntry = `${report.timestamp} - ${JSON.stringify(report)}\n`;
        
        try {
            await fs.promises.appendFile(this.logFile, logEntry);
        } catch (error) {
            console.error('保存性能日志失败:', error);
        }
    }
    
    // 显示实时监控
    displayRealTimeMonitor() {
        console.clear();
        console.log('🔍 实时性能监控');
        console.log('================');
        
        setInterval(async () => {
            const report = await this.generateReport();
            
            console.clear();
            console.log('🔍 实时性能监控');
            console.log('================');
            console.log(`⏱️  运行时间: ${report.uptime.formatted}`);
            console.log(`💾 内存使用: ${report.memory.current.heapUsed}MB (峰值: ${report.memory.peak}MB)`);
            console.log('');
            
            console.log('🖥️  服务器状态:');
            report.servers.forEach(server => {
                const status = server.status === 'healthy' ? '✅' : '❌';
                const time = server.responseTime ? `(${server.responseTime}ms)` : '';
                console.log(`   ${status} ${server.name} :${server.port} ${time}`);
            });
            
            if (report.recommendations.length > 0) {
                console.log('');
                console.log('⚠️  建议:');
                report.recommendations.forEach(rec => {
                    const icon = rec.level === 'critical' ? '🚨' : rec.level === 'warning' ? '⚠️' : 'ℹ️';
                    console.log(`   ${icon} ${rec.message}`);
                });
            }
            
            console.log('');
            console.log('按 Ctrl+C 退出监控');
        }, 2000);
    }
    
    // 启动监控
    async start() {
        console.log('🚀 启动性能监控...');
        
        // 生成初始报告
        const initialReport = await this.generateReport();
        await this.saveReport(initialReport);
        
        // 定期生成报告
        setInterval(async () => {
            const report = await this.generateReport();
            await this.saveReport(report);
        }, 60000); // 每分钟
        
        // 显示实时监控
        this.displayRealTimeMonitor();
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const monitor = new PerformanceMonitor();
    monitor.start().catch(console.error);
}

module.exports = PerformanceMonitor;
