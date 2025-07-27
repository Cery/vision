# 刷新当前PowerShell会话的PATH环境变量

Write-Host "=== 刷新PATH环境变量 ===" -ForegroundColor Cyan

# 获取机器级和用户级PATH
$machinePath = [Environment]::GetEnvironmentVariable("PATH", "Machine")
$userPath = [Environment]::GetEnvironmentVariable("PATH", "User")

# 合并PATH
$newPath = $machinePath + ";" + $userPath

# 更新当前会话的PATH
$env:PATH = $newPath

Write-Host "PATH环境变量已刷新" -ForegroundColor Green

# 验证vision路径是否存在
$visionPaths = $env:PATH -split ';' | Where-Object { $_ -like "*vision*" }

if ($visionPaths) {
    Write-Host ""
    Write-Host "找到Vision相关路径:" -ForegroundColor Yellow
    foreach ($path in $visionPaths) {
        Write-Host "  - $path" -ForegroundColor White
    }
} else {
    Write-Host ""
    Write-Host "警告: 未找到Vision相关路径" -ForegroundColor Red
    Write-Host "请检查用户环境变量是否正确设置" -ForegroundColor Yellow
}

# 测试hugo命令
Write-Host ""
Write-Host "测试Hugo命令..." -ForegroundColor Yellow

try {
    $hugoVersion = hugo version 2>$null
    if ($hugoVersion) {
        Write-Host "✅ Hugo命令可用: $hugoVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Hugo命令不可用" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Hugo命令不可用" -ForegroundColor Red
}

Write-Host ""
Write-Host "如果Hugo命令仍不可用，请:" -ForegroundColor Cyan
Write-Host "1. 重新启动PowerShell" -ForegroundColor White
Write-Host "2. 或者使用完整路径: .\hugo.exe" -ForegroundColor White
