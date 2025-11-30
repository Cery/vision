# Python抓取服务诊断脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "     Python抓取服务诊断工具" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$issuesFound = 0
$pythonCmd = $null

# 检查Python安装
Write-Host "[1/6] 检查Python安装..." -ForegroundColor Cyan

# 尝试不同的Python命令
$pythonCommands = @("python", "py", "python3")
foreach ($cmd in $pythonCommands) {
    try {
        $version = & $cmd --version 2>$null
        if ($version) {
            Write-Host "✅ Python已安装: $version" -ForegroundColor Green
            $pythonCmd = $cmd
            break
        }
    } catch {
        continue
    }
}

if (-not $pythonCmd) {
    Write-Host "❌ Python未安装或未添加到PATH" -ForegroundColor Red
    Write-Host "解决方案:" -ForegroundColor Yellow
    Write-Host "1. 访问 https://www.python.org/downloads/" -ForegroundColor Gray
    Write-Host "2. 下载Python 3.8或更高版本" -ForegroundColor Gray
    Write-Host "3. 安装时必须勾选 'Add Python to PATH'" -ForegroundColor Gray
    $issuesFound++
    Write-Host ""
    Write-Host "按任意键退出..." -ForegroundColor Gray
    Read-Host
    exit
}

Write-Host ""

# 检查pip
Write-Host "[2/6] 检查pip包管理器..." -ForegroundColor Cyan
try {
    $pipVersion = & $pythonCmd -m pip --version 2>$null
    if ($pipVersion) {
        Write-Host "✅ pip可用: $pipVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ pip不可用" -ForegroundColor Red
        $issuesFound++
    }
} catch {
    Write-Host "❌ pip不可用" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# 检查依赖包
Write-Host "[3/6] 检查依赖包..." -ForegroundColor Cyan
$packages = @("flask", "requests", "bs4", "PIL")
$missingPackages = 0

foreach ($package in $packages) {
    try {
        & $pythonCmd -c "import $package" 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ $package 已安装" -ForegroundColor Green
        } else {
            Write-Host "❌ $package 未安装" -ForegroundColor Red
            $missingPackages++
        }
    } catch {
        Write-Host "❌ $package 未安装" -ForegroundColor Red
        $missingPackages++
    }
}

if ($missingPackages -gt 0) {
    Write-Host "⚠️  发现 $missingPackages 个缺失的依赖包" -ForegroundColor Yellow
    Write-Host "解决方案: $pythonCmd -m pip install -r requirements.txt" -ForegroundColor Gray
    $issuesFound++
}

Write-Host ""

# 检查服务文件
Write-Host "[4/6] 检查服务文件..." -ForegroundColor Cyan
if (Test-Path "image_crawler_service.py") {
    Write-Host "✅ 服务文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ 服务文件不存在" -ForegroundColor Red
    $issuesFound++
}

if (Test-Path "requirements.txt") {
    Write-Host "✅ 依赖配置文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ requirements.txt不存在" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# 检查端口占用
Write-Host "[5/6] 检查端口占用..." -ForegroundColor Cyan
try {
    $port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
    if ($port5000) {
        Write-Host "⚠️  端口5000已被占用" -ForegroundColor Yellow
        Write-Host "可能Python服务已在运行或被其他程序占用" -ForegroundColor Gray
    } else {
        Write-Host "✅ 端口5000可用" -ForegroundColor Green
    }
} catch {
    Write-Host "✅ 端口5000可用" -ForegroundColor Green
}

Write-Host ""

# 总结
Write-Host "[6/6] 诊断结果总结..." -ForegroundColor Cyan
Write-Host ""

if ($issuesFound -eq 0) {
    Write-Host "✅ 所有检查通过，可以启动服务" -ForegroundColor Green
    Write-Host ""
    Write-Host "启动服务命令:" -ForegroundColor Cyan
    Write-Host "$pythonCmd image_crawler_service.py" -ForegroundColor Gray
    Write-Host ""
    Write-Host "是否现在启动服务? (y/n): " -ForegroundColor Yellow -NoNewline
    $response = Read-Host
    if ($response -eq "y" -or $response -eq "Y") {
        Write-Host "正在启动Python抓取服务..." -ForegroundColor Green
        Write-Host "服务将在 http://localhost:5000 运行" -ForegroundColor Gray
        Write-Host "按 Ctrl+C 可停止服务" -ForegroundColor Gray
        Write-Host ""
        & $pythonCmd image_crawler_service.py
    }
} else {
    Write-Host "❌ 发现 $issuesFound 个问题需要解决" -ForegroundColor Red
    Write-Host ""
    Write-Host "建议操作:" -ForegroundColor Yellow
    if ($missingPackages -gt 0) {
        Write-Host "1. 安装缺失的依赖包:" -ForegroundColor Gray
        Write-Host "   $pythonCmd -m pip install -r requirements.txt" -ForegroundColor Gray
    }
    Write-Host "2. 解决上述问题后重新运行此脚本" -ForegroundColor Gray
    Write-Host "3. 参考 Python抓取服务启动指南.md 获取详细帮助" -ForegroundColor Gray
}

Write-Host ""
Write-Host "按任意键退出..." -ForegroundColor Gray
Read-Host
