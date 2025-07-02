# Encoding Check Script
# Check encoding format of all text files in the project

param(
    [string]$Path = ".",
    [switch]$Fix = $false
)

Write-Host "Checking file encoding formats..." -ForegroundColor Green

# 需要检查的文件扩展名
$textExtensions = @('.md', '.html', '.css', '.js', '.json', '.yml', '.yaml', '.toml', '.txt', '.xml', '.svg')

# 排除的目录
$excludeDirs = @('node_modules', 'public', 'resources', '.git', 'docs')

# 获取所有文本文件
$files = Get-ChildItem -Path $Path -Recurse -File | Where-Object {
    $_.Extension -in $textExtensions -and
    $excludeDirs -notcontains $_.Directory.Name -and
    $_.FullName -notmatch '\\(' + ($excludeDirs -join '|') + ')\\'
}

$issues = @()
$totalFiles = $files.Count
$currentFile = 0

foreach ($file in $files) {
    $currentFile++
    Write-Progress -Activity "检查文件编码" -Status "处理文件 $currentFile/$totalFiles" -PercentComplete (($currentFile / $totalFiles) * 100)
    
    try {
        # 检测文件编码
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        
        if ($bytes.Length -eq 0) {
            continue
        }
        
        # 检查BOM
        $hasBOM = $false
        $encoding = "Unknown"
        
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            $encoding = "UTF-8 with BOM"
            $hasBOM = $true
        }
        elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
            $encoding = "UTF-16 LE"
        }
        elseif ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
            $encoding = "UTF-16 BE"
        }
        else {
            # 尝试检测是否为UTF-8
            try {
                $content = [System.IO.File]::ReadAllText($file.FullName, [System.Text.Encoding]::UTF8)
                $encoding = "UTF-8"
            }
            catch {
                $encoding = "Non-UTF-8"
            }
        }
        
        # 检查行结束符
        $content = [System.IO.File]::ReadAllText($file.FullName)
        $lineEnding = "Unknown"
        
        if ($content -match "`r`n") {
            $lineEnding = "CRLF"
        }
        elseif ($content -match "`n") {
            $lineEnding = "LF"
        }
        elseif ($content -match "`r") {
            $lineEnding = "CR"
        }
        
        # 记录问题
        $hasIssue = $false
        $issueDescription = @()
        
        if ($hasBOM) {
            $hasIssue = $true
            $issueDescription += "有BOM"
        }
        
        if ($encoding -ne "UTF-8") {
            $hasIssue = $true
            $issueDescription += "编码: $encoding"
        }
        
        if ($lineEnding -eq "CRLF") {
            $hasIssue = $true
            $issueDescription += "行结束符: CRLF"
        }
        
        if ($hasIssue) {
            $issues += [PSCustomObject]@{
                File = $file.FullName.Replace((Get-Location).Path + '\', '')
                Encoding = $encoding
                LineEnding = $lineEnding
                HasBOM = $hasBOM
                Issues = $issueDescription -join ", "
            }
            
            # 如果指定了修复选项
            if ($Fix) {
                Write-Host "🔧 修复文件: $($file.Name)" -ForegroundColor Yellow
                
                # 读取内容并转换为UTF-8无BOM，LF行结束符
                $content = [System.IO.File]::ReadAllText($file.FullName)
                $content = $content -replace "`r`n", "`n"  # CRLF -> LF
                $content = $content -replace "`r", "`n"    # CR -> LF
                
                # 写入文件（UTF-8无BOM）
                $utf8NoBom = New-Object System.Text.UTF8Encoding $false
                [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            }
        }
    }
    catch {
        Write-Warning "无法处理文件: $($file.FullName) - $($_.Exception.Message)"
    }
}

Write-Progress -Activity "检查文件编码" -Completed

# 显示结果
if ($issues.Count -eq 0) {
    Write-Host "✅ 所有文件编码格式正确！" -ForegroundColor Green
}
else {
    Write-Host "⚠️  发现 $($issues.Count) 个编码问题:" -ForegroundColor Yellow
    $issues | Format-Table -AutoSize
    
    if (-not $Fix) {
        Write-Host "💡 使用 -Fix 参数自动修复这些问题" -ForegroundColor Cyan
    }
    else {
        Write-Host "✅ 已修复所有编码问题！" -ForegroundColor Green
    }
}

return $issues.Count
