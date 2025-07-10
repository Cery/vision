# Fix project encoding consistency issues

param(
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

Write-Host "=== Project Encoding Consistency Check and Fix Tool ===" -ForegroundColor Green
Write-Host ""

# 统计变量
$totalFiles = 0
$bomFiles = 0
$fixedFiles = 0
$errorFiles = 0
$skippedFiles = 0

# File extensions to check
$textExtensions = @('.md', '.html', '.css', '.js', '.json', '.yaml', '.yml', '.toml', '.txt', '.xml')

# Directories to skip
$skipDirs = @('.git', 'node_modules', 'public', '.hugo_build.lock', 'resources', 'static\uploads')

# Files to skip
$skipFiles = @('package-lock.json', '.gitignore', 'LICENSE')

function Test-ShouldSkip {
    param([string]$Path)
    
    foreach ($skipDir in $skipDirs) {
        if ($Path -like "*\$skipDir\*" -or $Path -like "*/$skipDir/*") {
            return $true
        }
    }
    
    $fileName = Split-Path $Path -Leaf
    if ($skipFiles -contains $fileName) {
        return $true
    }
    
    return $false
}

function Test-HasBOM {
    param([string]$FilePath)
    
    try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        if ($bytes.Length -ge 3) {
            # UTF-8 BOM: EF BB BF
            if ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
                return $true
            }
        }
        if ($bytes.Length -ge 2) {
            # UTF-16 LE BOM: FF FE
            if ($bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
                return $true
            }
            # UTF-16 BE BOM: FE FF
            if ($bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
                return $true
            }
        }
        return $false
    }
    catch {
        Write-Warning "Cannot read file: $FilePath - $($_.Exception.Message)"
        return $false
    }
}

function Remove-BOM {
    param([string]$FilePath)
    
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        if ($null -ne $content) {
            # 使用UTF8NoBOM编码写回文件
            [System.IO.File]::WriteAllText($FilePath, $content, [System.Text.UTF8Encoding]::new($false))
            return $true
        }
        return $false
    }
    catch {
        Write-Error "修复文件失败: $FilePath - $($_.Exception.Message)"
        return $false
    }
}

function Get-FileEncoding {
    param([string]$FilePath)
    
    try {
        $bytes = [System.IO.File]::ReadAllBytes($FilePath)
        if ($bytes.Length -eq 0) {
            return "Empty"
        }
        
        # 检查BOM
        if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
            return "UTF-8 with BOM"
        }
        if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFF -and $bytes[1] -eq 0xFE) {
            return "UTF-16 LE with BOM"
        }
        if ($bytes.Length -ge 2 -and $bytes[0] -eq 0xFE -and $bytes[1] -eq 0xFF) {
            return "UTF-16 BE with BOM"
        }
        
        # 尝试检测编码
        try {
            $utf8 = [System.Text.Encoding]::UTF8.GetString($bytes)
            $utf8Bytes = [System.Text.Encoding]::UTF8.GetBytes($utf8)
            if ($bytes.Length -eq $utf8Bytes.Length) {
                $match = $true
                for ($i = 0; $i -lt $bytes.Length; $i++) {
                    if ($bytes[$i] -ne $utf8Bytes[$i]) {
                        $match = $false
                        break
                    }
                }
                if ($match) {
                    return "UTF-8 without BOM"
                }
            }
        }
        catch {
            # UTF-8解码失败
        }
        
        return "Unknown/Binary"
    }
    catch {
        return "Error"
    }
}

# 获取所有需要检查的文件
Write-Host "正在扫描项目文件..." -ForegroundColor Cyan
$allFiles = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $ext = $_.Extension.ToLower()
    $textExtensions -contains $ext -and -not (Test-ShouldSkip $_.FullName)
}

Write-Host "找到 $($allFiles.Count) 个文本文件需要检查" -ForegroundColor Cyan
Write-Host ""

# 检查每个文件
$results = @()

foreach ($file in $allFiles) {
    $totalFiles++
    $relativePath = Resolve-Path -Path $file.FullName -Relative
    $encoding = Get-FileEncoding -FilePath $file.FullName
    $hasBOM = Test-HasBOM -FilePath $file.FullName
    
    $result = [PSCustomObject]@{
        Path = $relativePath
        Encoding = $encoding
        HasBOM = $hasBOM
        Size = $file.Length
        Status = "OK"
    }
    
    if ($hasBOM) {
        $bomFiles++
        $result.Status = "Has BOM"
        
        if ($Verbose) {
            Write-Host "🔍 BOM检测: $relativePath ($encoding)" -ForegroundColor Yellow
        }
        
        if (-not $DryRun) {
            Write-Host "🔧 修复BOM: $relativePath" -ForegroundColor Green
            if (Remove-BOM -FilePath $file.FullName) {
                $fixedFiles++
                $result.Status = "Fixed"
            } else {
                $errorFiles++
                $result.Status = "Error"
            }
        }
    } else {
        if ($Verbose) {
            Write-Host "✅ 编码正常: $relativePath ($encoding)" -ForegroundColor Green
        }
    }
    
    $results += $result
}

# 显示结果统计
Write-Host ""
Write-Host "=== 检查结果统计 ===" -ForegroundColor Green
Write-Host "总文件数: $totalFiles" -ForegroundColor White
Write-Host "有BOM的文件: $bomFiles" -ForegroundColor $(if ($bomFiles -gt 0) { "Yellow" } else { "Green" })

if (-not $DryRun) {
    Write-Host "成功修复: $fixedFiles" -ForegroundColor Green
    Write-Host "修复失败: $errorFiles" -ForegroundColor $(if ($errorFiles -gt 0) { "Red" } else { "Green" })
} else {
    Write-Host "模拟运行模式 - 未进行实际修复" -ForegroundColor Cyan
}

# 显示有问题的文件列表
if ($bomFiles -gt 0) {
    Write-Host ""
    Write-Host "=== 有BOM的文件列表 ===" -ForegroundColor Yellow
    $results | Where-Object { $_.HasBOM } | ForEach-Object {
        $statusColor = switch ($_.Status) {
            "Has BOM" { "Yellow" }
            "Fixed" { "Green" }
            "Error" { "Red" }
            default { "White" }
        }
        Write-Host "  $($_.Status): $($_.Path) ($($_.Encoding))" -ForegroundColor $statusColor
    }
}

# 创建.gitattributes文件确保一致的行结束符
$gitattributesPath = ".gitattributes"
$gitattributesContent = @"
# 确保文本文件使用LF行结束符
* text=auto eol=lf

# 明确指定文本文件
*.md text eol=lf
*.html text eol=lf
*.css text eol=lf
*.js text eol=lf
*.json text eol=lf
*.yaml text eol=lf
*.yml text eol=lf
*.toml text eol=lf
*.txt text eol=lf
*.xml text eol=lf

# 二进制文件
*.jpg binary
*.jpeg binary
*.png binary
*.gif binary
*.ico binary
*.pdf binary
*.zip binary
*.tar.gz binary

# 保持Windows行结束符的文件
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf
"@

if (-not $DryRun) {
    Write-Host ""
    Write-Host "正在创建/更新 .gitattributes 文件..." -ForegroundColor Cyan
    try {
        [System.IO.File]::WriteAllText($gitattributesPath, $gitattributesContent, [System.Text.UTF8Encoding]::new($false))
        Write-Host "✅ .gitattributes 文件已创建/更新" -ForegroundColor Green
    }
    catch {
        Write-Error "创建 .gitattributes 文件失败: $($_.Exception.Message)"
    }
}

# 显示建议
Write-Host ""
Write-Host "=== 建议和后续步骤 ===" -ForegroundColor Green
Write-Host "1. 配置Git自动转换行结束符:" -ForegroundColor White
Write-Host "   git config core.autocrlf false" -ForegroundColor Gray
Write-Host "   git config core.eol lf" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 重新标准化仓库 (如果需要):" -ForegroundColor White
Write-Host "   git add --renormalize ." -ForegroundColor Gray
Write-Host "   git commit -m 'Normalize line endings'" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 配置编辑器使用UTF-8无BOM编码" -ForegroundColor White
Write-Host ""

if ($DryRun) {
    Write-Host "要执行实际修复，请运行: .\fix-encoding-issues.ps1" -ForegroundColor Cyan
} else {
    Write-Host "🎉 编码修复完成！" -ForegroundColor Green
}

# 返回结果
return @{
    TotalFiles = $totalFiles
    BOMFiles = $bomFiles
    FixedFiles = $fixedFiles
    ErrorFiles = $errorFiles
    Success = ($errorFiles -eq 0)
}
