# Hugo命令别名设置脚本

Write-Host "=== 设置Hugo命令别名 ===" -ForegroundColor Cyan

# 设置Hugo别名
$hugoPath = "C:\Users\cery\Desktop\vision\hugo.exe"
$hugoNewPath = "C:\Users\cery\Desktop\vision\hugo_new.exe"

if (Test-Path $hugoPath) {
    Set-Alias -Name hugo -Value $hugoPath -Scope Global
    Write-Host "✅ 已设置hugo别名" -ForegroundColor Green
} else {
    Write-Host "❌ hugo.exe文件不存在" -ForegroundColor Red
}

if (Test-Path $hugoNewPath) {
    Set-Alias -Name hugo_new -Value $hugoNewPath -Scope Global
    Write-Host "✅ 已设置hugo_new别名" -ForegroundColor Green
} else {
    Write-Host "❌ hugo_new.exe文件不存在" -ForegroundColor Red
}

# 测试别名
Write-Host ""
Write-Host "测试Hugo命令..." -ForegroundColor Yellow

try {
    $version = & hugo version
    Write-Host "✅ Hugo命令可用: $version" -ForegroundColor Green
} catch {
    Write-Host "❌ Hugo命令测试失败" -ForegroundColor Red
}

Write-Host ""
Write-Host "现在您可以使用以下命令:" -ForegroundColor Cyan
Write-Host "  hugo server -D --port 1313" -ForegroundColor White
Write-Host "  hugo_new server -D --port 1313" -ForegroundColor White
Write-Host ""
Write-Host "注意: 别名仅在当前PowerShell会话中有效" -ForegroundColor Yellow
Write-Host "要永久生效，请重新启动PowerShell" -ForegroundColor Yellow
