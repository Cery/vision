#!/usr/bin/env node

/**
 * 性能测试脚本
 * 测试优化后的服务器性能
 */

const http = require('http');
const { performance } = require('perf_hooks');

class PerformanceTester {
    constructor() {
        this.servers = [
            { name: 'Main Server', port: 3002, endpoints: ['/', '/api/products/list', '/api/media/list'] },
            { name: 'Product Server', port: 3003, endpoints: ['/'] },
            { name: 'Content Server', port: 3001, endpoints: ['/'] }
        ];
        
        this.results = {
            responseTime: [],
            throughput: [],
            errors: []
        };
    }
    
    // 发送HTTP请求
    async makeRequest(port, path = '/') {
        return new Promise((resolve) => {
            const startTime = performance.now();
            
            const req = http.request({
                hostname: 'localhost',
                port: port,
                path: path,
                method: 'GET',
                timeout: 10000
            }, (res) => {
                let data = '';
                res.on('data', chunk => data += chunk);
                res.on('end', () => {
                    const endTime = performance.now();
                    resolve({
                        success: true,
                        statusCode: res.statusCode,
                        responseTime: endTime - startTime,
                        dataSize: data.length
                    });
                });
            });
            
            req.on('error', (error) => {
                const endTime = performance.now();
                resolve({
                    success: false,
                    error: error.message,
                    responseTime: endTime - startTime
                });
            });
            
            req.on('timeout', () => {
                req.destroy();
                const endTime = performance.now();
                resolve({
                    success: false,
                    error: 'Timeout',
                    responseTime: endTime - startTime
                });
            });
            
            req.end();
        });
    }
    
    // 测试单个端点
    async testEndpoint(port, path, iterations = 10) {
        console.log(`🧪 测试 localhost:${port}${path} (${iterations}次请求)`);
        
        const results = [];
        const startTime = performance.now();
        
        // 串行测试
        for (let i = 0; i < iterations; i++) {
            const result = await this.makeRequest(port, path);
            results.push(result);
            
            if (result.success) {
                process.stdout.write('✅');
            } else {
                process.stdout.write('❌');
            }
        }
        
        const totalTime = performance.now() - startTime;
        console.log(''); // 换行
        
        // 计算统计信息
        const successfulRequests = results.filter(r => r.success);
        const failedRequests = results.filter(r => !r.success);
        
        if (successfulRequests.length > 0) {
            const responseTimes = successfulRequests.map(r => r.responseTime);
            const avgResponseTime = responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length;
            const minResponseTime = Math.min(...responseTimes);
            const maxResponseTime = Math.max(...responseTimes);
            const throughput = (successfulRequests.length / totalTime) * 1000; // 请求/秒
            
            return {
                endpoint: `${port}${path}`,
                totalRequests: iterations,
                successfulRequests: successfulRequests.length,
                failedRequests: failedRequests.length,
                successRate: (successfulRequests.length / iterations * 100).toFixed(2) + '%',
                avgResponseTime: Math.round(avgResponseTime),
                minResponseTime: Math.round(minResponseTime),
                maxResponseTime: Math.round(maxResponseTime),
                throughput: throughput.toFixed(2),
                totalTime: Math.round(totalTime)
            };
        } else {
            return {
                endpoint: `${port}${path}`,
                totalRequests: iterations,
                successfulRequests: 0,
                failedRequests: failedRequests.length,
                successRate: '0%',
                error: '所有请求都失败了'
            };
        }
    }
    
    // 并发测试
    async testConcurrency(port, path, concurrency = 5, iterations = 20) {
        console.log(`🚀 并发测试 localhost:${port}${path} (${concurrency}个并发, ${iterations}次请求)`);
        
        const startTime = performance.now();
        const promises = [];
        
        for (let i = 0; i < iterations; i++) {
            promises.push(this.makeRequest(port, path));
            
            // 控制并发数
            if (promises.length >= concurrency) {
                const results = await Promise.all(promises);
                results.forEach(result => {
                    if (result.success) {
                        process.stdout.write('✅');
                    } else {
                        process.stdout.write('❌');
                    }
                });
                promises.length = 0; // 清空数组
            }
        }
        
        // 处理剩余的请求
        if (promises.length > 0) {
            const results = await Promise.all(promises);
            results.forEach(result => {
                if (result.success) {
                    process.stdout.write('✅');
                } else {
                    process.stdout.write('❌');
                }
            });
        }
        
        const totalTime = performance.now() - startTime;
        console.log(''); // 换行
        
        return {
            endpoint: `${port}${path}`,
            concurrency: concurrency,
            totalRequests: iterations,
            totalTime: Math.round(totalTime),
            throughput: (iterations / totalTime * 1000).toFixed(2)
        };
    }
    
    // 运行完整测试套件
    async runFullTest() {
        console.log('🔬 开始性能测试...\n');
        
        const testResults = [];
        
        // 测试每个服务器的每个端点
        for (const server of this.servers) {
            console.log(`\n📊 测试 ${server.name} (端口 ${server.port})`);
            console.log('='.repeat(50));
            
            for (const endpoint of server.endpoints) {
                try {
                    // 基础性能测试
                    const basicResult = await this.testEndpoint(server.port, endpoint, 10);
                    testResults.push({ type: 'basic', server: server.name, ...basicResult });
                    
                    // 如果基础测试成功，进行并发测试
                    if (basicResult.successfulRequests > 0) {
                        const concurrencyResult = await this.testConcurrency(server.port, endpoint, 5, 20);
                        testResults.push({ type: 'concurrency', server: server.name, ...concurrencyResult });
                    }
                    
                    console.log(''); // 空行分隔
                } catch (error) {
                    console.error(`❌ 测试失败: ${server.name}${endpoint}`, error.message);
                }
            }
        }
        
        // 生成测试报告
        this.generateReport(testResults);
    }
    
    // 生成测试报告
    generateReport(results) {
        console.log('\n📋 性能测试报告');
        console.log('='.repeat(60));
        
        const basicResults = results.filter(r => r.type === 'basic');
        const concurrencyResults = results.filter(r => r.type === 'concurrency');
        
        // 基础性能统计
        console.log('\n🎯 基础性能测试结果:');
        basicResults.forEach(result => {
            if (result.avgResponseTime) {
                console.log(`   ${result.server} ${result.endpoint}:`);
                console.log(`      成功率: ${result.successRate}`);
                console.log(`      平均响应时间: ${result.avgResponseTime}ms`);
                console.log(`      响应时间范围: ${result.minResponseTime}-${result.maxResponseTime}ms`);
                console.log(`      吞吐量: ${result.throughput} 请求/秒`);
            } else {
                console.log(`   ${result.server} ${result.endpoint}: ❌ ${result.error}`);
            }
        });
        
        // 并发性能统计
        if (concurrencyResults.length > 0) {
            console.log('\n🚀 并发性能测试结果:');
            concurrencyResults.forEach(result => {
                console.log(`   ${result.server} ${result.endpoint}:`);
                console.log(`      并发数: ${result.concurrency}`);
                console.log(`      总请求数: ${result.totalRequests}`);
                console.log(`      总耗时: ${result.totalTime}ms`);
                console.log(`      并发吞吐量: ${result.throughput} 请求/秒`);
            });
        }
        
        // 性能评估
        console.log('\n📈 性能评估:');
        const avgResponseTimes = basicResults
            .filter(r => r.avgResponseTime)
            .map(r => r.avgResponseTime);
        
        if (avgResponseTimes.length > 0) {
            const overallAvgResponseTime = avgResponseTimes.reduce((a, b) => a + b, 0) / avgResponseTimes.length;
            console.log(`   整体平均响应时间: ${Math.round(overallAvgResponseTime)}ms`);
            
            if (overallAvgResponseTime < 500) {
                console.log('   ✅ 性能优秀 (< 500ms)');
            } else if (overallAvgResponseTime < 1000) {
                console.log('   ⚠️  性能良好 (500-1000ms)');
            } else {
                console.log('   ❌ 性能需要改进 (> 1000ms)');
            }
        }
        
        console.log('\n✅ 性能测试完成!');
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const tester = new PerformanceTester();
    
    console.log('⚠️  请确保服务器已启动 (npm run start:optimized)');
    console.log('按 Enter 键开始测试...');
    
    process.stdin.once('data', () => {
        tester.runFullTest().catch(console.error);
    });
}

module.exports = PerformanceTester;
