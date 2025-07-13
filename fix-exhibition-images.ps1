# PowerShell脚本：修复展会文件中的图片路径
# 将包含特殊字符的picsum.photos URL替换为有效的本地路径

$newsPath = "content/news"
$files = @(
    "2025-ep-shanghai-electric-power-exhibition.md",
    "2025-cimt-china-international-machine-tool-exhibition.md",
    "2025-china-foundry-expo-beijing.md",
    "2025-china-airshow-zhuhai.md",
    "2025-china-petrochemical-expo-shanghai.md",
    "2025-china-ndt-expo-shanghai.md",
    "2025-china-precision-manufacturing-expo-shenzhen.md",
    "2025-china-industrial-automation-expo-shanghai.md",
    "2025-china-new-materials-expo-beijing.md",
    "2025-china-welding-expo-shanghai.md",
    "2025-china-heat-treatment-expo-beijing.md",
    "2025-china-mould-expo-shanghai.md",
    "2025-china-surface-treatment-expo-guangzhou.md",
    "2025-china-industrial-furnace-expo-shanghai.md"
)

$coverImages = @{
    "2025-ep-shanghai-electric-power-exhibition.md" = "exhibition-cover-power.jpg"
    "2025-cimt-china-international-machine-tool-exhibition.md" = "exhibition-cover-machine.jpg"
    "2025-china-foundry-expo-beijing.md" = "exhibition-cover-foundry.jpg"
    "2025-china-airshow-zhuhai.md" = "exhibition-cover-aerospace.jpg"
    "2025-china-petrochemical-expo-shanghai.md" = "exhibition-cover-petro.jpg"
    "2025-china-ndt-expo-shanghai.md" = "exhibition-cover-ndt.jpg"
    "2025-china-precision-manufacturing-expo-shenzhen.md" = "exhibition-cover-precision.jpg"
    "2025-china-industrial-automation-expo-shanghai.md" = "exhibition-cover-automation.jpg"
    "2025-china-new-materials-expo-beijing.md" = "exhibition-cover-materials.jpg"
    "2025-china-welding-expo-shanghai.md" = "exhibition-cover-welding.jpg"
    "2025-china-heat-treatment-expo-beijing.md" = "exhibition-cover-heat.jpg"
    "2025-china-mould-expo-shanghai.md" = "exhibition-cover-mould.jpg"
    "2025-china-surface-treatment-expo-guangzhou.md" = "exhibition-cover-surface.jpg"
    "2025-china-industrial-furnace-expo-shanghai.md" = "exhibition-cover-furnace.jpg"
}

foreach ($file in $files) {
    $filePath = Join-Path $newsPath $file
    if (Test-Path $filePath) {
        Write-Host "Processing $file..."
        
        $content = Get-Content $filePath -Raw
        $coverImage = $coverImages[$file]
        
        # 替换封面图片
        $content = $content -replace 'cover: "https://picsum\.photos/800/600\?random=\d+"', "cover: `"/images/news/$coverImage`""
        $content = $content -replace 'featured_image: "https://picsum\.photos/800/600\?random=\d+"', "featured_image: `"/images/news/$coverImage`""
        
        # 替换历届视图图片
        $content = $content -replace 'image: "https://picsum\.photos/400/300\?random=\d+"', 'image: "/images/news/exhibition-history-1.jpg"'
        
        # 逐个替换历届视图的4张图片
        $content = $content -replace '  - image: "/images/news/exhibition-history-1\.jpg"\s*\n  - image: "/images/news/exhibition-history-1\.jpg"\s*\n  - image: "/images/news/exhibition-history-1\.jpg"\s*\n  - image: "/images/news/exhibition-history-1\.jpg"', 
        @"
  - image: "/images/news/exhibition-history-1.jpg"
  - image: "/images/news/exhibition-history-2.jpg"
  - image: "/images/news/exhibition-history-3.jpg"
  - image: "/images/news/exhibition-history-4.jpg"
"@
        
        Set-Content $filePath $content -Encoding UTF8
        Write-Host "Fixed $file"
    }
}

Write-Host "All exhibition image paths have been fixed!"
