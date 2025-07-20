#!/usr/bin/env node

/**
 * 文件系统优化工具
 * 优化文件读取、目录扫描和缓存策略
 */

const fs = require('fs').promises;
const path = require('path');

class FileSystemOptimizer {
    constructor() {
        this.cache = new Map();
        this.stats = {
            cacheHits: 0,
            cacheMisses: 0,
            filesScanned: 0,
            directoriesScanned: 0,
            totalScanTime: 0
        };
        
        // 缓存配置
        this.cacheConfig = {
            maxSize: 1000, // 最大缓存条目数
            ttl: 5 * 60 * 1000, // 5分钟TTL
            cleanupInterval: 60 * 1000 // 1分钟清理间隔
        };
        
        this.startCleanupTimer();
    }
    
    // 启动缓存清理定时器
    startCleanupTimer() {
        setInterval(() => {
            this.cleanupExpiredCache();
        }, this.cacheConfig.cleanupInterval);
    }
    
    // 清理过期缓存
    cleanupExpiredCache() {
        const now = Date.now();
        let cleaned = 0;
        
        for (const [key, value] of this.cache.entries()) {
            if (now - value.timestamp > this.cacheConfig.ttl) {
                this.cache.delete(key);
                cleaned++;
            }
        }
        
        if (cleaned > 0) {
            console.log(`🧹 清理了 ${cleaned} 个过期缓存条目`);
        }
    }
    
    // 获取缓存键
    getCacheKey(operation, params) {
        return `${operation}:${JSON.stringify(params)}`;
    }
    
    // 设置缓存
    setCache(key, data) {
        // 如果缓存已满，删除最旧的条目
        if (this.cache.size >= this.cacheConfig.maxSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
        
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
    
    // 获取缓存
    getCache(key) {
        const cached = this.cache.get(key);
        
        if (cached) {
            const age = Date.now() - cached.timestamp;
            if (age < this.cacheConfig.ttl) {
                this.stats.cacheHits++;
                return cached.data;
            } else {
                this.cache.delete(key);
            }
        }
        
        this.stats.cacheMisses++;
        return null;
    }
    
    // 优化的文件读取
    async readFileOptimized(filePath, encoding = 'utf8') {
        const cacheKey = this.getCacheKey('readFile', { filePath, encoding });
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        try {
            const startTime = Date.now();
            const content = await fs.readFile(filePath, encoding);
            const readTime = Date.now() - startTime;
            
            // 只缓存小于1MB的文件
            if (content.length < 1024 * 1024) {
                this.setCache(cacheKey, content);
            }
            
            console.log(`📖 读取文件: ${filePath} (${readTime}ms)`);
            return content;
        } catch (error) {
            console.error(`❌ 读取文件失败: ${filePath}`, error.message);
            throw error;
        }
    }
    
    // 优化的目录扫描
    async scanDirectoryOptimized(dirPath, options = {}) {
        const {
            recursive = false,
            fileFilter = null,
            includeStats = false,
            maxDepth = 10
        } = options;
        
        const cacheKey = this.getCacheKey('scanDirectory', { dirPath, options });
        const cached = this.getCache(cacheKey);
        
        if (cached) {
            return cached;
        }
        
        const startTime = Date.now();
        const results = await this._scanDirectoryRecursive(dirPath, {
            recursive,
            fileFilter,
            includeStats,
            maxDepth,
            currentDepth: 0
        });
        
        const scanTime = Date.now() - startTime;
        this.stats.totalScanTime += scanTime;
        this.stats.directoriesScanned++;
        
        this.setCache(cacheKey, results);
        
        console.log(`📂 扫描目录: ${dirPath} (${results.length} 项, ${scanTime}ms)`);
        return results;
    }
    
    // 递归扫描目录
    async _scanDirectoryRecursive(dirPath, options) {
        const { recursive, fileFilter, includeStats, maxDepth, currentDepth } = options;
        
        if (currentDepth >= maxDepth) {
            return [];
        }
        
        try {
            const items = await fs.readdir(dirPath);
            const results = [];
            
            // 并行处理文件和目录
            const promises = items.map(async (item) => {
                const itemPath = path.join(dirPath, item);
                
                try {
                    const stats = await fs.stat(itemPath);
                    this.stats.filesScanned++;
                    
                    const itemInfo = {
                        name: item,
                        path: itemPath,
                        relativePath: path.relative(process.cwd(), itemPath),
                        isDirectory: stats.isDirectory(),
                        isFile: stats.isFile()
                    };
                    
                    if (includeStats) {
                        itemInfo.stats = {
                            size: stats.size,
                            mtime: stats.mtime,
                            ctime: stats.ctime
                        };
                    }
                    
                    // 应用文件过滤器
                    if (fileFilter && !fileFilter(itemInfo)) {
                        return null;
                    }
                    
                    // 如果是目录且需要递归扫描
                    if (stats.isDirectory() && recursive) {
                        const subItems = await this._scanDirectoryRecursive(itemPath, {
                            ...options,
                            currentDepth: currentDepth + 1
                        });
                        itemInfo.children = subItems;
                    }
                    
                    return itemInfo;
                } catch (error) {
                    console.error(`❌ 处理项目失败: ${itemPath}`, error.message);
                    return null;
                }
            });
            
            const resolvedItems = await Promise.all(promises);
            return resolvedItems.filter(item => item !== null);
            
        } catch (error) {
            console.error(`❌ 扫描目录失败: ${dirPath}`, error.message);
            return [];
        }
    }
    
    // 批量文件操作
    async batchFileOperation(filePaths, operation) {
        const batchSize = 10; // 每批处理10个文件
        const results = [];
        
        for (let i = 0; i < filePaths.length; i += batchSize) {
            const batch = filePaths.slice(i, i + batchSize);
            
            const batchPromises = batch.map(async (filePath) => {
                try {
                    return await operation(filePath);
                } catch (error) {
                    console.error(`❌ 批量操作失败: ${filePath}`, error.message);
                    return { error: error.message, filePath };
                }
            });
            
            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);
            
            // 小延迟避免过载
            if (i + batchSize < filePaths.length) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
        }
        
        return results;
    }
    
    // 获取优化统计信息
    getStats() {
        const cacheHitRate = this.stats.cacheHits + this.stats.cacheMisses > 0 
            ? (this.stats.cacheHits / (this.stats.cacheHits + this.stats.cacheMisses) * 100).toFixed(2)
            : 0;
        
        return {
            ...this.stats,
            cacheSize: this.cache.size,
            cacheHitRate: `${cacheHitRate}%`,
            avgScanTime: this.stats.directoriesScanned > 0 
                ? Math.round(this.stats.totalScanTime / this.stats.directoriesScanned)
                : 0
        };
    }
    
    // 清除所有缓存
    clearCache() {
        const size = this.cache.size;
        this.cache.clear();
        console.log(`🧹 清除了 ${size} 个缓存条目`);
    }
    
    // 预热缓存
    async warmupCache(directories) {
        console.log('🔥 开始预热缓存...');
        
        for (const dir of directories) {
            try {
                await this.scanDirectoryOptimized(dir, {
                    recursive: true,
                    includeStats: true,
                    fileFilter: (item) => {
                        // 只缓存常用文件类型
                        const ext = path.extname(item.name).toLowerCase();
                        return ['.md', '.json', '.js', '.css', '.html', '.jpg', '.png', '.gif'].includes(ext);
                    }
                });
            } catch (error) {
                console.error(`❌ 预热缓存失败: ${dir}`, error.message);
            }
        }
        
        console.log('✅ 缓存预热完成');
    }
    
    // 生成优化报告
    generateOptimizationReport() {
        const stats = this.getStats();
        
        return {
            timestamp: new Date().toISOString(),
            performance: {
                cacheHitRate: stats.cacheHitRate,
                avgScanTime: `${stats.avgScanTime}ms`,
                totalFilesScanned: stats.filesScanned,
                totalDirectoriesScanned: stats.directoriesScanned
            },
            cache: {
                size: stats.cacheSize,
                maxSize: this.cacheConfig.maxSize,
                utilization: `${(stats.cacheSize / this.cacheConfig.maxSize * 100).toFixed(1)}%`
            },
            recommendations: this.generateOptimizationRecommendations(stats)
        };
    }
    
    // 生成优化建议
    generateOptimizationRecommendations(stats) {
        const recommendations = [];
        
        if (parseFloat(stats.cacheHitRate) < 50) {
            recommendations.push({
                type: 'cache',
                message: '缓存命中率较低，建议增加缓存TTL或预热更多数据'
            });
        }
        
        if (stats.avgScanTime > 100) {
            recommendations.push({
                type: 'performance',
                message: '目录扫描时间较长，建议优化文件结构或增加缓存'
            });
        }
        
        if (stats.cacheSize / this.cacheConfig.maxSize > 0.9) {
            recommendations.push({
                type: 'memory',
                message: '缓存使用率过高，建议增加最大缓存大小'
            });
        }
        
        return recommendations;
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const optimizer = new FileSystemOptimizer();
    
    // 预热常用目录的缓存
    optimizer.warmupCache([
        './content',
        './static/images',
        './static/uploads'
    ]).then(() => {
        console.log('📊 优化报告:');
        console.log(JSON.stringify(optimizer.generateOptimizationReport(), null, 2));
    }).catch(console.error);
}

module.exports = FileSystemOptimizer;
