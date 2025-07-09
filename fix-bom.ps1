# Fix BOM issues in MD files
# PowerShell script to fix BOM encoding issues in content/products MD files

Write-Host "Starting BOM fix for MD files..." -ForegroundColor Green

# 检查content/products目录是否存在
$productsDir = "content\products"
if (-not (Test-Path $productsDir)) {
    Write-Host "❌ content/products目录不存在" -ForegroundColor Red
    exit 1
}

# 获取所有MD文件
$mdFiles = Get-ChildItem -Path $productsDir -Filter "*.md" -File

if ($mdFiles.Count -eq 0) {
    Write-Host "ℹ️ 没有找到MD文件" -ForegroundColor Yellow
    exit 0
}

Write-Host "📊 找到 $($mdFiles.Count) 个MD文件" -ForegroundColor Cyan

$fixedCount = 0
$errorCount = 0

foreach ($file in $mdFiles) {
    try {
        Write-Host "🔍 检查文件: $($file.Name)" -ForegroundColor White
        
        # 读取文件的原始字节
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        
        # 检查是否有BOM (EF BB BF)
        $hasBOM = $bytes.Length -ge 3 -and 
                  $bytes[0] -eq 0xEF -and 
                  $bytes[1] -eq 0xBB -and 
                  $bytes[2] -eq 0xBF
        
        if ($hasBOM) {
            Write-Host "⚠️ 发现BOM: $($file.Name)" -ForegroundColor Yellow
            
            # 创建备份
            $backupPath = $file.FullName + ".bak"
            Copy-Item $file.FullName $backupPath
            Write-Host "💾 已创建备份: $($file.Name).bak" -ForegroundColor Gray
            
            # 移除BOM并重新写入文件
            $contentWithoutBOM = $bytes[3..($bytes.Length - 1)]
            [System.IO.File]::WriteAllBytes($file.FullName, $contentWithoutBOM)
            
            Write-Host "✅ BOM已移除: $($file.Name)" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "✓ 无BOM问题: $($file.Name)" -ForegroundColor DarkGreen
        }
        
    } catch {
        Write-Host "❌ 处理文件失败: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "📊 修复完成统计:" -ForegroundColor Cyan
Write-Host "  - 修复的文件: $fixedCount" -ForegroundColor Green
Write-Host "  - 错误的文件: $errorCount" -ForegroundColor Red
Write-Host "  - 总计文件: $($mdFiles.Count)" -ForegroundColor White

if ($fixedCount -gt 0) {
    Write-Host ""
    Write-Host "💡 提示: 备份文件已保存为 .bak 扩展名" -ForegroundColor Yellow
    Write-Host "💡 如果修复后没有问题，可以删除备份文件" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "删除备份文件的命令:" -ForegroundColor Gray
    Write-Host "Remove-Item content\products\*.bak" -ForegroundColor Gray
}

if ($errorCount -eq 0 -and $fixedCount -gt 0) {
    Write-Host ""
    Write-Host "🎉 所有文件修复成功！" -ForegroundColor Green
} elseif ($fixedCount -eq 0) {
    Write-Host ""
    Write-Host "ℹ️ 没有发现需要修复的文件" -ForegroundColor Cyan
}

# 检查HTML文件是否也有BOM问题
Write-Host ""
Write-Host "🔍 检查HTML文件..." -ForegroundColor Cyan

$htmlFile = "static\admin\complete-content-manager.html"
if (Test-Path $htmlFile) {
    $htmlBytes = [System.IO.File]::ReadAllBytes($htmlFile)
    $htmlHasBOM = $htmlBytes.Length -ge 3 -and 
                  $htmlBytes[0] -eq 0xEF -and 
                  $htmlBytes[1] -eq 0xBB -and 
                  $htmlBytes[2] -eq 0xBF
    
    if ($htmlHasBOM) {
        Write-Host "⚠️ HTML文件也有BOM问题" -ForegroundColor Yellow
        
        try {
            # 创建备份
            Copy-Item $htmlFile ($htmlFile + ".bak")
            
            # 移除BOM
            $htmlContentWithoutBOM = $htmlBytes[3..($htmlBytes.Length - 1)]
            [System.IO.File]::WriteAllBytes($htmlFile, $htmlContentWithoutBOM)
            
            Write-Host "✅ HTML文件BOM已修复" -ForegroundColor Green
        } catch {
            Write-Host "❌ HTML文件修复失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "✓ HTML文件无BOM问题" -ForegroundColor DarkGreen
    }
} else {
    Write-Host "⚠️ HTML文件不存在" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🏁 修复脚本执行完成" -ForegroundColor Green
