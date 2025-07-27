# Vision项目工具验证脚本

Write-Host "=== Vision项目工具验证 ===" -ForegroundColor Cyan
Write-Host ""

# 验证Hugo工具
Write-Host "检查Hugo工具..." -ForegroundColor Yellow
try {
    $hugoVersion = & hugo version 2>$null
    if ($hugoVersion) {
        Write-Host "✅ Hugo (标准版): $hugoVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Hugo (标准版): 未找到" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Hugo (标准版): 未找到" -ForegroundColor Red
}

try {
    $hugoNewVersion = & hugo_new version 2>$null
    if ($hugoNewVersion) {
        Write-Host "✅ Hugo (新版): $hugoNewVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Hugo (新版): 未找到" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Hugo (新版): 未找到" -ForegroundColor Red
}

Write-Host ""

# 验证Python工具
Write-Host "检查Python工具..." -ForegroundColor Yellow
$pythonCrawlerPath = "C:\Users\cery\Desktop\vision\static\tools\python-crawler"
$pythonTestingPath = "C:\Users\cery\Desktop\vision\static\tools\python-testing"

if (Test-Path $pythonCrawlerPath) {
    $crawlerFiles = Get-ChildItem $pythonCrawlerPath -Filter "*.bat" | Measure-Object
    Write-Host "✅ Python爬虫工具: 找到 $($crawlerFiles.Count) 个批处理文件" -ForegroundColor Green
} else {
    Write-Host "❌ Python爬虫工具: 目录不存在" -ForegroundColor Red
}

if (Test-Path $pythonTestingPath) {
    $testingFiles = Get-ChildItem $pythonTestingPath -Filter "*.bat" | Measure-Object
    Write-Host "✅ Python测试工具: 找到 $($testingFiles.Count) 个批处理文件" -ForegroundColor Green
} else {
    Write-Host "❌ Python测试工具: 目录不存在" -ForegroundColor Red
}

Write-Host ""

# 验证项目脚本
Write-Host "检查项目脚本..." -ForegroundColor Yellow
$scriptsPath = "C:\Users\cery\Desktop\vision\scripts"

if (Test-Path $scriptsPath) {
    $scriptFiles = Get-ChildItem $scriptsPath -Filter "*.js" | Measure-Object
    Write-Host "✅ 项目脚本: 找到 $($scriptFiles.Count) 个JavaScript文件" -ForegroundColor Green
} else {
    Write-Host "❌ 项目脚本: 目录不存在" -ForegroundColor Red
}

Write-Host ""

# 验证PATH配置
Write-Host "检查PATH配置..." -ForegroundColor Yellow
$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$visionPaths = $userPath -split ';' | Where-Object { $_ -like "*vision*" }

Write-Host "PATH中的Vision相关路径:" -ForegroundColor Cyan
foreach ($path in $visionPaths) {
    if (Test-Path $path) {
        Write-Host "✅ $path" -ForegroundColor Green
    } else {
        Write-Host "❌ $path (路径不存在)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "=== 验证完成 ===" -ForegroundColor Cyan
Write-Host "注意: 如果某些工具显示未找到，请重新启动PowerShell后再试" -ForegroundColor Yellow
