# VisNDT Website Environment Check Script

Write-Host "Checking VisNDT Website Development Environment..." -ForegroundColor Green
Write-Host ""

# Refresh environment variables
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

$allGood = $true

# Check Git
Write-Host "Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "OK: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git not found" -ForegroundColor Red
    $allGood = $false
}

# 检查 Hugo
Write-Host "📦 检查 Hugo..." -ForegroundColor Yellow
try {
    $hugoVersion = hugo version
    Write-Host "✅ $hugoVersion" -ForegroundColor Green
    
    # 检查是否是 Extended 版本
    if ($hugoVersion -match "extended") {
        Write-Host "✅ Hugo Extended 版本 - 支持 SCSS/Sass" -ForegroundColor Green
    } else {
        Write-Host "⚠️  建议使用 Hugo Extended 版本以获得完整功能" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Hugo 未安装或不在 PATH 中" -ForegroundColor Red
    Write-Host "   请运行: winget install Hugo.Hugo.Extended" -ForegroundColor Cyan
    $allGood = $false
}

# 检查 Node.js
Write-Host "📦 检查 Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js $nodeVersion" -ForegroundColor Green
    
    # 检查版本是否满足要求 (>= 14)
    $versionNumber = [int]($nodeVersion -replace "v(\d+)\..*", '$1')
    if ($versionNumber -ge 14) {
        Write-Host "✅ Node.js 版本满足要求 (>= 14)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  建议升级到 Node.js 14 或更高版本" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Node.js 未安装或不在 PATH 中" -ForegroundColor Red
    Write-Host "   请运行: winget install OpenJS.NodeJS.LTS" -ForegroundColor Cyan
    $allGood = $false
}

# 检查 npm
Write-Host "📦 检查 npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "✅ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm 未安装或不在 PATH 中" -ForegroundColor Red
    $allGood = $false
}

# 检查项目依赖
Write-Host "📦 检查项目依赖..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "✅ node_modules 目录存在" -ForegroundColor Green
    
    # 检查关键依赖
    $keyDeps = @("express", "netlify-cms-app", "netlify-cms-proxy-server", "npm-run-all")
    foreach ($dep in $keyDeps) {
        if (Test-Path "node_modules/$dep") {
            Write-Host "✅ $dep 已安装" -ForegroundColor Green
        } else {
            Write-Host "❌ $dep 未安装" -ForegroundColor Red
            $allGood = $false
        }
    }
} else {
    Write-Host "❌ node_modules 目录不存在" -ForegroundColor Red
    Write-Host "   请运行: npm install" -ForegroundColor Cyan
    $allGood = $false
}

# 检查配置文件
Write-Host "📦 检查配置文件..." -ForegroundColor Yellow
$configFiles = @("hugo.toml", "package.json", "netlify.toml")
foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file 存在" -ForegroundColor Green
    } else {
        Write-Host "❌ $file 不存在" -ForegroundColor Red
        $allGood = $false
    }
}

# 检查主题
Write-Host "📦 检查主题..." -ForegroundColor Yellow
if (Test-Path "themes/ananke") {
    Write-Host "✅ Ananke 主题已安装" -ForegroundColor Green
} else {
    Write-Host "❌ Ananke 主题未找到" -ForegroundColor Red
    $allGood = $false
}

# 检查内容目录
Write-Host "📦 检查内容目录..." -ForegroundColor Yellow
$contentDirs = @("content", "static", "layouts")
foreach ($dir in $contentDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir 目录存在" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir 目录不存在" -ForegroundColor Red
        $allGood = $false
    }
}

Write-Host ""
Write-Host "=" * 50 -ForegroundColor Gray

if ($allGood) {
    Write-Host "🎉 环境检查通过！所有必需组件都已正确安装。" -ForegroundColor Green
    Write-Host "🚀 您可以运行以下命令启动开发环境:" -ForegroundColor Cyan
    Write-Host "   .\start-dev.ps1" -ForegroundColor White
    Write-Host "   或者直接运行: npm run dev" -ForegroundColor White
} else {
    Write-Host "❌ 环境检查失败！请安装缺失的组件。" -ForegroundColor Red
    Write-Host "💡 安装建议:" -ForegroundColor Yellow
    Write-Host "   1. 安装 Git: winget install Git.Git" -ForegroundColor White
    Write-Host "   2. 安装 Hugo: winget install Hugo.Hugo.Extended" -ForegroundColor White
    Write-Host "   3. 安装 Node.js: winget install OpenJS.NodeJS.LTS" -ForegroundColor White
    Write-Host "   4. 安装项目依赖: npm install" -ForegroundColor White
}

Write-Host ""
