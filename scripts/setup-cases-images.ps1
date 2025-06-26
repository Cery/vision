# PowerShell脚本：为cases文件夹创建更多图片资源
# 使用现有图片复制并重命名

Write-Host "开始设置案例图片资源..." -ForegroundColor Green

# 设置路径
$casesDir = "static/images/cases"

# 确保目录存在
if (!(Test-Path $casesDir)) {
    New-Item -ItemType Directory -Path $casesDir -Force
    Write-Host "创建cases目录: $casesDir" -ForegroundColor Yellow
}

# 为cases文件夹创建更多图片（如果只有一张的话）
$casesFiles = Get-ChildItem -Path $casesDir -File
if ($casesFiles.Count -eq 1) {
    $sourceFile = $casesFiles[0].FullName
    $extension = $casesFiles[0].Extension
    
    Write-Host "为cases文件夹创建更多图片资源..." -ForegroundColor Cyan
    
    # 创建case-2.webp到case-8.webp
    for ($i = 2; $i -le 8; $i++) {
        $targetFile = Join-Path $casesDir "case-$i$extension"
        if (!(Test-Path $targetFile)) {
            Copy-Item $sourceFile $targetFile
            Write-Host "创建: case-$i$extension" -ForegroundColor Gray
        }
    }
}

# 显示最终的文件列表
Write-Host "`n=== Cases文件夹内容 ===" -ForegroundColor Green
Get-ChildItem -Path $casesDir -File | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor White }

Write-Host "`n案例图片资源设置完成！" -ForegroundColor Green
Write-Host "现在可以使用本地案例图片替代外部占位服务了。" -ForegroundColor Yellow

# 提示用户如何使用
Write-Host "`n使用说明：" -ForegroundColor Cyan
Write-Host "1. Cases图片：/images/cases/case-1.webp 到 case-8.webp" -ForegroundColor White
Write-Host "2. 用于首页案例展示、案例列表页面、案例详情页面" -ForegroundColor White
Write-Host "3. WebP格式，文件小，加载快" -ForegroundColor White
