# Vision项目环境变量配置脚本
# 将所有必要的工具添加到用户PATH环境变量中

Write-Host "=== Vision项目环境变量配置 ===" -ForegroundColor Cyan
Write-Host ""

# 获取当前项目根目录
$projectRoot = Get-Location
Write-Host "项目根目录: $projectRoot" -ForegroundColor Green

# 定义需要添加到PATH的目录
$pathsToAdd = @(
    $projectRoot.Path,                                          # 主目录 (hugo.exe, hugo_new.exe)
    "$($projectRoot.Path)\static\tools\python-crawler",        # Python爬虫工具
    "$($projectRoot.Path)\static\tools\python-testing",        # Python测试工具
    "$($projectRoot.Path)\scripts",                             # 项目脚本
    "$($projectRoot.Path)\archive\temp-files"                   # 临时工具文件
)

# 获取当前用户PATH
$currentUserPath = [Environment]::GetEnvironmentVariable("PATH", "User")
$pathArray = $currentUserPath -split ";" | Where-Object { $_ -ne "" }

Write-Host "正在检查和添加PATH路径..." -ForegroundColor Yellow
Write-Host ""

$addedPaths = @()
$skippedPaths = @()

foreach ($path in $pathsToAdd) {
    if (Test-Path $path) {
        if ($pathArray -notcontains $path) {
            $pathArray += $path
            $addedPaths += $path
            Write-Host "✅ 添加: $path" -ForegroundColor Green
        } else {
            $skippedPaths += $path
            Write-Host "⚠️  已存在: $path" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ 路径不存在: $path" -ForegroundColor Red
    }
}

# 更新用户PATH环境变量
if ($addedPaths.Count -gt 0) {
    $newPath = $pathArray -join ";"
    [Environment]::SetEnvironmentVariable("PATH", $newPath, "User")
    Write-Host ""
    Write-Host "✅ 用户PATH环境变量已更新!" -ForegroundColor Green
    Write-Host "新增了 $($addedPaths.Count) 个路径" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ℹ️  所有路径都已存在于PATH中" -ForegroundColor Blue
}

Write-Host ""
Write-Host "=== 配置摘要 ===" -ForegroundColor Cyan
Write-Host "新增路径数量: $($addedPaths.Count)" -ForegroundColor Green
Write-Host "已存在路径数量: $($skippedPaths.Count)" -ForegroundColor Yellow

if ($addedPaths.Count -gt 0) {
    Write-Host ""
    Write-Host "新增的路径:" -ForegroundColor Green
    foreach ($path in $addedPaths) {
        Write-Host "  - $path" -ForegroundColor White
    }
}

Write-Host ""
Write-Host "=== 可用工具 ===" -ForegroundColor Cyan
Write-Host "Hugo静态网站生成器:"
Write-Host "  - hugo.exe (标准版本)" -ForegroundColor White
Write-Host "  - hugo_new.exe (新版本)" -ForegroundColor White
Write-Host ""
Write-Host "Python工具:"
Write-Host "  - 爬虫工具 (static/tools/python-crawler/)" -ForegroundColor White
Write-Host "  - 测试工具 (static/tools/python-testing/)" -ForegroundColor White
Write-Host ""
Write-Host "项目脚本:"
Write-Host "  - 内容管理脚本 (scripts/)" -ForegroundColor White
Write-Host "  - 开发环境脚本 (archive/temp-files/)" -ForegroundColor White

Write-Host ""
Write-Host "⚠️  重要提示:" -ForegroundColor Yellow
Write-Host "请重新启动PowerShell或命令提示符以使PATH更改生效" -ForegroundColor Yellow
Write-Host ""
Write-Host "验证安装: 在新的PowerShell窗口中运行 'hugo version'" -ForegroundColor Cyan
