# 清理产品文件中的YAML控制字符
param(
    [string]$ProductsPath = "content/products"
)

Write-Host "开始清理产品文件中的YAML控制字符..." -ForegroundColor Green

$cleanedCount = 0
$errorCount = 0

# 获取所有产品Markdown文件
$productFiles = Get-ChildItem -Path $ProductsPath -Filter "*.md" | Where-Object { $_.Name -ne "_index.md" }

foreach ($file in $productFiles) {
    try {
        Write-Host "处理文件: $($file.Name)" -ForegroundColor Yellow
        
        # 读取文件内容
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        if ($null -eq $content) {
            Write-Host "  跳过空文件" -ForegroundColor Gray
            continue
        }
        
        # 记录原始内容长度
        $originalLength = $content.Length
        
        # 清理控制字符，但保留必要的换行符、制表符等
        # 保留：空格(0x20)、制表符(0x09)、换行符(0x0A)、回车符(0x0D)、可打印ASCII字符(0x21-0x7E)、中文字符(0x4E00-0x9FFF)
        $cleanedContent = $content -replace '[^\x20-\x7E\x09\x0A\x0D\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]', ''
        
        # 清理特定的问题字符序列
        $cleanedContent = $cleanedContent -replace 'ææ¯åæ°', '技术参数'
        $cleanedContent = $cleanedContent -replace 'HJ____________', 'HJ-Technical-Specs'
        
        # 修复常见的编码问题
        $cleanedContent = $cleanedContent -replace '\\u[0-9a-fA-F]{4}', ''
        
        # 确保YAML字符串正确转义
        $lines = $cleanedContent -split "`n"
        $inYamlFrontMatter = $false
        $yamlEndFound = $false
        $processedLines = @()
        
        foreach ($line in $lines) {
            if ($line.Trim() -eq "---") {
                if (-not $inYamlFrontMatter) {
                    $inYamlFrontMatter = $true
                } else {
                    $yamlEndFound = $true
                    $inYamlFrontMatter = $false
                }
                $processedLines += $line
            } elseif ($inYamlFrontMatter -and -not $yamlEndFound) {
                # 在YAML front matter中，清理特殊字符
                if ($line -match '^\s*(file_title|title|summary|seo_title|seo_description):\s*"(.+)"') {
                    $fieldName = $matches[1]
                    $fieldValue = $matches[2]
                    
                    # 清理字段值中的控制字符
                    $cleanFieldValue = $fieldValue -replace '[^\x20-\x7E\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]', ''
                    $cleanFieldValue = $cleanFieldValue -replace '"', '\"'
                    
                    $processedLines += "  $fieldName" + ': "' + $cleanFieldValue + '"'
                } else {
                    $processedLines += $line
                }
            } else {
                $processedLines += $line
            }
        }
        
        $cleanedContent = $processedLines -join "`n"
        
        # 检查是否有变化
        if ($cleanedContent.Length -ne $originalLength -or $cleanedContent -ne $content) {
            # 备份原文件
            $backupPath = $file.FullName + ".backup"
            Copy-Item -Path $file.FullName -Destination $backupPath -Force
            
            # 写入清理后的内容
            $cleanedContent | Out-File -FilePath $file.FullName -Encoding UTF8 -NoNewline
            
            Write-Host "  ✅ 已清理 (原长度: $originalLength, 新长度: $($cleanedContent.Length))" -ForegroundColor Green
            $cleanedCount++
        } else {
            Write-Host "  ✓ 无需清理" -ForegroundColor Gray
        }
        
    } catch {
        Write-Host "  ❌ 处理失败: $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host "`n清理完成!" -ForegroundColor Green
Write-Host "已清理文件数: $cleanedCount" -ForegroundColor Yellow
Write-Host "错误文件数: $errorCount" -ForegroundColor Red

if ($cleanedCount -gt 0) {
    Write-Host "`n建议运行 'hugo server -D' 测试网站是否正常启动" -ForegroundColor Cyan
}
