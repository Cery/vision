# Vision项目环境变量配置脚本 - 简化版

Write-Host "=== Vision项目环境变量配置 ===" -ForegroundColor Cyan

# 获取当前项目根目录
$projectRoot = Get-Location
Write-Host "项目根目录: $projectRoot"

# 定义需要添加到PATH的目录
$pathsToAdd = @(
    $projectRoot.Path,
    "$($projectRoot.Path)\static\tools\python-crawler",
    "$($projectRoot.Path)\static\tools\python-testing",
    "$($projectRoot.Path)\scripts"
)

# 获取当前用户PATH
$currentUserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
if (-not $currentUserPath) {
    $currentUserPath = ""
}

$pathArray = $currentUserPath -split ";" | Where-Object { $_ -ne "" }
$addedCount = 0

foreach ($path in $pathsToAdd) {
    if (Test-Path $path) {
        if ($pathArray -notcontains $path) {
            $pathArray += $path
            $addedCount++
            Write-Host "添加: $path" -ForegroundColor Green
        } else {
            Write-Host "已存在: $path" -ForegroundColor Yellow
        }
    } else {
        Write-Host "路径不存在: $path" -ForegroundColor Red
    }
}

# 更新用户PATH环境变量
if ($addedCount -gt 0) {
    $newPath = $pathArray -join ";"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host ""
    Write-Host "用户PATH环境变量已更新! 新增了 $addedCount 个路径" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "所有路径都已存在于PATH中" -ForegroundColor Blue
}

Write-Host ""
Write-Host "可用工具:"
Write-Host "- hugo.exe / hugo_new.exe (Hugo静态网站生成器)"
Write-Host "- Python爬虫和测试工具"
Write-Host "- 项目管理脚本"
Write-Host ""
Write-Host "请重新启动PowerShell以使PATH更改生效" -ForegroundColor Yellow
