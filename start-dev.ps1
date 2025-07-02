# 维森视觉检测仪器网站 - 开发环境启动脚本
# VisNDT Website Development Environment Startup Script

Write-Host "🚀 启动维森视觉检测仪器网站开发环境..." -ForegroundColor Green
Write-Host "Starting VisNDT Website Development Environment..." -ForegroundColor Green

# 刷新环境变量
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

# 检查必要的工具
Write-Host "🔍 检查开发环境..." -ForegroundColor Yellow

# 检查 Hugo
try {
    $hugoVersion = hugo version
    Write-Host "✅ Hugo: $hugoVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Hugo 未安装或不在 PATH 中" -ForegroundColor Red
    exit 1
}

# 检查 Node.js
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js 未安装或不在 PATH 中" -ForegroundColor Red
    exit 1
}

# 检查 npm
try {
    $npmVersion = npm --version
    Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 未安装或不在 PATH 中" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🌐 可用的开发命令:" -ForegroundColor Cyan
Write-Host "  npm run dev          - 启动完整开发环境 (Hugo + CMS + 产品服务器)" -ForegroundColor White
Write-Host "  npm run hugo         - 仅启动 Hugo 开发服务器" -ForegroundColor White
Write-Host "  npm run cms          - 仅启动 Netlify CMS 代理服务器" -ForegroundColor White
Write-Host "  npm run product-server - 仅启动产品服务器" -ForegroundColor White
Write-Host "  npm run build        - 构建生产版本" -ForegroundColor White
Write-Host ""

# 询问用户要启动什么
Write-Host "请选择要启动的服务:" -ForegroundColor Yellow
Write-Host "1. 完整开发环境 (推荐)" -ForegroundColor White
Write-Host "2. 仅 Hugo 开发服务器" -ForegroundColor White
Write-Host "3. 构建生产版本" -ForegroundColor White
Write-Host "4. 退出" -ForegroundColor White

$choice = Read-Host "请输入选择 (1-4)"

switch ($choice) {
    "1" {
        Write-Host "🚀 启动完整开发环境..." -ForegroundColor Green
        Write-Host "访问地址:" -ForegroundColor Cyan
        Write-Host "  网站: http://localhost:1313" -ForegroundColor White
        Write-Host "  CMS:  http://localhost:8081" -ForegroundColor White
        Write-Host "  API:  http://localhost:3000" -ForegroundColor White
        Write-Host ""
        Write-Host "按 Ctrl+C 停止所有服务" -ForegroundColor Yellow
        npm run dev
    }
    "2" {
        Write-Host "🚀 启动 Hugo 开发服务器..." -ForegroundColor Green
        Write-Host "访问地址: http://localhost:1313" -ForegroundColor Cyan
        Write-Host "按 Ctrl+C 停止服务" -ForegroundColor Yellow
        npm run hugo
    }
    "3" {
        Write-Host "🏗️ 构建生产版本..." -ForegroundColor Green
        npm run build
        Write-Host "✅ 构建完成！文件位于 public/ 目录" -ForegroundColor Green
    }
    "4" {
        Write-Host "👋 再见！" -ForegroundColor Green
        exit 0
    }
    default {
        Write-Host "❌ 无效选择" -ForegroundColor Red
        exit 1
    }
}
