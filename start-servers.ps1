# VisNDT 开发服务器启动脚本
# 同时启动Hugo服务器和Content Server

Write-Host "🚀 启动 VisNDT 开发环境..." -ForegroundColor Green
Write-Host ""

# 检查Node.js是否安装
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js 版本: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到 Node.js，请先安装 Node.js" -ForegroundColor Red
    exit 1
}

# 检查Hugo是否安装
try {
    $hugoVersion = hugo version
    Write-Host "✅ Hugo 已安装" -ForegroundColor Green
} catch {
    Write-Host "❌ 未找到 Hugo，请先安装 Hugo" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "📦 检查依赖..." -ForegroundColor Yellow

# 检查package.json是否存在，如果不存在则创建
if (-not (Test-Path "package.json")) {
    Write-Host "📝 创建 package.json..." -ForegroundColor Yellow
    @"
{
  "name": "visndt-content-server",
  "version": "1.0.0",
  "description": "VisNDT Content Management Server",
  "main": "content-server.js",
  "scripts": {
    "start": "node content-server.js",
    "dev": "nodemon content-server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^3.0.1"
  }
}
"@ | Out-File -FilePath "package.json" -Encoding UTF8
}

# 安装依赖
if (-not (Test-Path "node_modules")) {
    Write-Host "📦 安装 Node.js 依赖..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ 依赖安装失败" -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ 依赖安装完成" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔧 启动服务..." -ForegroundColor Yellow

# 检查端口是否被占用
$hugoPort = 1313
$contentPort = 3001

# 检查Hugo端口
$hugoProcess = Get-NetTCPConnection -LocalPort $hugoPort -ErrorAction SilentlyContinue
if ($hugoProcess) {
    Write-Host "⚠️  端口 $hugoPort 已被占用，尝试终止现有进程..." -ForegroundColor Yellow
    Stop-Process -Id $hugoProcess.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

# 检查Content Server端口
$contentProcess = Get-NetTCPConnection -LocalPort $contentPort -ErrorAction SilentlyContinue
if ($contentProcess) {
    Write-Host "⚠️  端口 $contentPort 已被占用，尝试终止现有进程..." -ForegroundColor Yellow
    Stop-Process -Id $contentProcess.OwningProcess -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}

Write-Host ""
Write-Host "🌐 启动 Hugo 服务器 (端口 $hugoPort)..." -ForegroundColor Cyan

# 启动Hugo服务器（后台运行）
$hugoJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    hugo server --port 1313 --bind 0.0.0.0 --baseURL http://localhost:1313
}

Start-Sleep -Seconds 3

Write-Host "📡 启动 Content Server (端口 $contentPort)..." -ForegroundColor Cyan

# 启动Content Server（后台运行）
$contentJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    node content-server.js
}

Start-Sleep -Seconds 2

Write-Host ""
Write-Host "✅ 服务启动完成！" -ForegroundColor Green
Write-Host ""
Write-Host "📋 服务信息:" -ForegroundColor White
Write-Host "  🌐 Hugo 网站: http://localhost:1313" -ForegroundColor Cyan
Write-Host "  🎛️  管理后台: http://localhost:1313/admin/complete-content-manager.html" -ForegroundColor Cyan
Write-Host "  📡 Content API: http://localhost:3001" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔧 功能特性:" -ForegroundColor White
Write-Host "  ✅ 自动保存MD文件到content目录" -ForegroundColor Green
Write-Host "  ✅ 媒体库文件选择（从项目images和uploads）" -ForegroundColor Green
Write-Host "  ✅ 图片自动上传和路径转换" -ForegroundColor Green
Write-Host "  ✅ 实时数据同步" -ForegroundColor Green
Write-Host ""
Write-Host "⌨️  按 Ctrl+C 停止所有服务" -ForegroundColor Yellow

# 等待用户中断
try {
    while ($true) {
        Start-Sleep -Seconds 1
        
        # 检查作业状态
        if ($hugoJob.State -eq "Failed" -or $hugoJob.State -eq "Stopped") {
            Write-Host "❌ Hugo 服务器已停止" -ForegroundColor Red
            break
        }
        
        if ($contentJob.State -eq "Failed" -or $contentJob.State -eq "Stopped") {
            Write-Host "❌ Content Server 已停止" -ForegroundColor Red
            break
        }
    }
} catch {
    Write-Host ""
    Write-Host "🛑 正在停止服务..." -ForegroundColor Yellow
}

# 清理作业
Write-Host "🧹 清理后台进程..." -ForegroundColor Yellow
Stop-Job $hugoJob -ErrorAction SilentlyContinue
Stop-Job $contentJob -ErrorAction SilentlyContinue
Remove-Job $hugoJob -ErrorAction SilentlyContinue
Remove-Job $contentJob -ErrorAction SilentlyContinue

Write-Host "✅ 所有服务已停止" -ForegroundColor Green
