# 修复文件编码一致性脚本
# 将所有文本文件转换为UTF-8无BOM格式

Write-Host "🔧 开始修复文件编码一致性..." -ForegroundColor Green

# 定义需要处理的文件扩展名
$textExtensions = @(
    "*.md", "*.html", "*.css", "*.js", "*.json", 
    "*.yml", "*.yaml", "*.toml", "*.xml", "*.txt",
    "*.config", "*.gitignore", "*.gitattributes"
)

# 定义排除的目录
$excludeDirs = @(
    "node_modules", ".git", "public", "resources", 
    ".hugo_build.lock", "dist", "build"
)

$totalFiles = 0
$processedFiles = 0
$errorFiles = 0

foreach ($extension in $textExtensions) {
    Write-Host "📁 处理 $extension 文件..." -ForegroundColor Yellow
    
    $files = Get-ChildItem -Path . -Recurse -Include $extension | Where-Object {
        $exclude = $false
        foreach ($excludeDir in $excludeDirs) {
            if ($_.FullName -like "*\$excludeDir\*") {
                $exclude = $true
                break
            }
        }
        return -not $exclude
    }
    
    foreach ($file in $files) {
        $totalFiles++
        
        try {
            # 读取文件内容
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            
            if ($content -ne $null) {
                # 写回文件，确保UTF-8无BOM格式
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
                
                $processedFiles++
                Write-Host "  ✅ $($file.Name)" -ForegroundColor Green
            }
        }
        catch {
            $errorFiles++
            Write-Host "  ❌ $($file.Name): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n📊 处理完成统计:" -ForegroundColor Cyan
Write-Host "  总文件数: $totalFiles" -ForegroundColor White
Write-Host "  成功处理: $processedFiles" -ForegroundColor Green
Write-Host "  处理失败: $errorFiles" -ForegroundColor Red

if ($errorFiles -eq 0) {
    Write-Host "`n🎉 所有文件编码已统一为UTF-8无BOM格式！" -ForegroundColor Green
} else {
    Write-Host "`n⚠️ 部分文件处理失败，请检查错误信息。" -ForegroundColor Yellow
}

# 更新Git配置
Write-Host "`n🔧 更新Git配置..." -ForegroundColor Yellow
git config core.autocrlf false
git config core.safecrlf false
git config core.filemode false

Write-Host "✅ Git配置已更新" -ForegroundColor Green

Write-Host "`n📝 建议执行以下命令完成修复:" -ForegroundColor Cyan
Write-Host "  git add ." -ForegroundColor White
Write-Host "  git commit -m '修复文件编码一致性：统一为UTF-8无BOM格式'" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
