# PowerShell脚本：批量更新新闻文章的featured_image

Write-Host "📰 批量更新新闻文章图片" -ForegroundColor Green
Write-Host "=" * 40

# 定义文件和对应的图片
$newsFiles = @{
    "industry-news-2.md" = "/images/news/news-1.jpeg"
    "industry-news-3.md" = "/images/news/news-2.jpeg"
    "industry-news-4.md" = "/images/news/news-3.jpeg"
    "industry-news-5.md" = "/images/news/news-4.jpeg"
    
    "exhibition-news-2.md" = "/images/news/news-5.jpeg"
    "exhibition-news-3.md" = "/images/news/news-6.jpeg"
    "exhibition-news-4.md" = "/images/news/news-1.jpeg"
    "exhibition-news-5.md" = "/images/news/news-2.jpeg"
    "exhibition-news-6.md" = "/images/news/news-3.jpeg"
    "exhibition-news-7.md" = "/images/news/news-4.jpeg"
    "exhibition-news-8.md" = "/images/news/news-5.jpeg"
    "exhibition-news-9.md" = "/images/news/news-6.jpeg"
    "exhibition-news-10.md" = "/images/news/展会.webp"
    "exhibition-news-11.md" = "/images/news/news-1.jpeg"
    "exhibition-news-12.md" = "/images/news/news-2.jpeg"
    
    "tech-article-2.md" = "/images/news/news-3.jpeg"
    "tech-article-3.md" = "/images/news/news-4.jpeg"
    "tech-article-4.md" = "/images/news/news-5.jpeg"
    "tech-article-5.md" = "/images/news/news-6.jpeg"
    
    "2024-01-16-exhibition-news.md" = "/images/news/展会.webp"
    "2024-01-20-product-launch.md" = "/images/news/news-1.jpeg"
    "2024-03-14-tech-trends.md" = "/images/news/新闻.webp"
}

$successCount = 0
$totalCount = $newsFiles.Count

foreach ($file in $newsFiles.Keys) {
    $filePath = "content/news/$file"
    $imagePath = $newsFiles[$file]
    
    if (Test-Path $filePath) {
        try {
            # 读取文件内容
            $content = Get-Content $filePath -Raw -Encoding UTF8
            
            # 检查是否有front matter
            if ($content -match '^(---\r?\n)([\s\S]*?)(\r?\n---)') {
                $frontMatterStart = $matches[1]
                $frontMatter = $matches[2]
                $frontMatterEnd = $matches[3]
                
                # 检查是否已有featured_image
                if ($frontMatter -match 'featured_image:\s*[^\r\n]*') {
                    # 替换现有的featured_image
                    $newFrontMatter = $frontMatter -replace 'featured_image:\s*[^\r\n]*', "featured_image: `"$imagePath`""
                    $newContent = $content -replace '^(---\r?\n)([\s\S]*?)(\r?\n---)', "$frontMatterStart$newFrontMatter$frontMatterEnd"
                } else {
                    # 添加featured_image
                    $newFrontMatter = $frontMatter + "`nfeatured_image: `"$imagePath`""
                    $newContent = $content -replace '^(---\r?\n)([\s\S]*?)(\r?\n---)', "$frontMatterStart$newFrontMatter$frontMatterEnd"
                }
                
                # 写入文件
                $newContent | Out-File -FilePath $filePath -Encoding UTF8 -NoNewline
                Write-Host "✓ $file : 更新成功" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "⚠️ $file : 没有找到front matter" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "✗ $file : $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ $file : 文件不存在" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=" * 40
Write-Host "🎉 批量更新完成！" -ForegroundColor Green
Write-Host "📊 成功: $successCount/$totalCount" -ForegroundColor Cyan

Write-Host ""
Write-Host "💡 下一步:" -ForegroundColor Yellow
Write-Host "  1. 重新构建网站: hugo --gc --minify"
Write-Host "  2. 检查新闻页面图片显示"
