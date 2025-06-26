# PowerShell脚本：为news和company-logo文件夹创建更多图片资源
# 使用现有图片复制并重命名

Write-Host "开始设置本地图片资源..." -ForegroundColor Green

# 设置路径
$newsDir = "static/images/news"
$companyDir = "static/images/company-logo"
$applicationDir = "static/images/application"

# 确保目录存在
if (!(Test-Path $newsDir)) {
    New-Item -ItemType Directory -Path $newsDir -Force
    Write-Host "创建news目录: $newsDir" -ForegroundColor Yellow
}

if (!(Test-Path $companyDir)) {
    New-Item -ItemType Directory -Path $companyDir -Force
    Write-Host "创建company-logo目录: $companyDir" -ForegroundColor Yellow
}

# 为news文件夹创建更多图片（如果只有一张的话）
$newsFiles = Get-ChildItem -Path $newsDir -File
if ($newsFiles.Count -eq 1) {
    $sourceFile = $newsFiles[0].FullName
    $extension = $newsFiles[0].Extension
    
    Write-Host "为news文件夹创建更多图片资源..." -ForegroundColor Cyan
    
    # 创建news-2.jpeg到news-6.jpeg
    for ($i = 2; $i -le 6; $i++) {
        $targetFile = Join-Path $newsDir "news-$i$extension"
        if (!(Test-Path $targetFile)) {
            Copy-Item $sourceFile $targetFile
            Write-Host "创建: news-$i$extension" -ForegroundColor Gray
        }
    }
}

# 为company-logo文件夹创建更多logo文件
$companyFiles = Get-ChildItem -Path $companyDir -File
if ($companyFiles.Count -eq 1) {
    $sourceFile = $companyFiles[0].FullName
    $extension = $companyFiles[0].Extension
    
    Write-Host "为company-logo文件夹创建更多logo资源..." -ForegroundColor Cyan
    
    # 创建logo-2.svg到logo-6.svg
    for ($i = 2; $i -le 6; $i++) {
        $targetFile = Join-Path $companyDir "logo-$i$extension"
        if (!(Test-Path $targetFile)) {
            Copy-Item $sourceFile $targetFile
            Write-Host "创建: logo-$i$extension" -ForegroundColor Gray
        }
    }
}

# 显示最终的文件列表
Write-Host "`n=== News文件夹内容 ===" -ForegroundColor Green
Get-ChildItem -Path $newsDir -File | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor White }

Write-Host "`n=== Company-Logo文件夹内容 ===" -ForegroundColor Green
Get-ChildItem -Path $companyDir -File | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor White }

Write-Host "`n=== Application文件夹内容 ===" -ForegroundColor Green
Get-ChildItem -Path $applicationDir -File | ForEach-Object { Write-Host "  $($_.Name)" -ForegroundColor White }

Write-Host "`n本地图片资源设置完成！" -ForegroundColor Green
Write-Host "现在可以使用本地图片替代外部占位服务了。" -ForegroundColor Yellow

# 提示用户如何使用
Write-Host "`n使用说明：" -ForegroundColor Cyan
Write-Host "1. News图片：/images/news/news-1.jpeg 到 news-6.jpeg" -ForegroundColor White
Write-Host "2. Company Logo：/images/company-logo/logo.svg 到 logo-6.svg" -ForegroundColor White
Write-Host "3. Application图片：/images/application/ 文件夹中的6张图片" -ForegroundColor White
