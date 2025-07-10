# Fix project encoding consistency issues

param(
    [switch]$DryRun = $false
)

Write-Host "=== Project Encoding Fix Tool ===" -ForegroundColor Green
Write-Host ""

$totalFiles = 0
$bomFiles = 0
$fixedFiles = 0

# File extensions to check
$textExtensions = @('.md', '.html', '.css', '.js', '.json', '.yaml', '.yml', '.toml', '.txt', '.xml')

# Directories to skip
$skipDirs = @('.git', 'node_modules', 'public', 'resources', 'static\uploads')

function Test-ShouldSkip {
    param([string]$Path)
    
    foreach ($skipDir in $skipDirs) {
        if ($Path -like "*\$skipDir\*" -or $Path -like "*/$skipDir/*") {
            return $true
        }
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
        return $false
    }
    catch {
        Write-Warning "Cannot read file: $FilePath"
        return $false
    }
}

function Remove-BOM {
    param([string]$FilePath)
    
    try {
        $content = Get-Content -Path $FilePath -Raw -Encoding UTF8
        if ($null -ne $content) {
            # Write back without BOM
            [System.IO.File]::WriteAllText($FilePath, $content, [System.Text.UTF8Encoding]::new($false))
            return $true
        }
        return $false
    }
    catch {
        Write-Error "Failed to fix file: $FilePath"
        return $false
    }
}

# Get all text files
Write-Host "Scanning project files..." -ForegroundColor Cyan
$allFiles = Get-ChildItem -Path . -Recurse -File | Where-Object {
    $ext = $_.Extension.ToLower()
    $textExtensions -contains $ext -and -not (Test-ShouldSkip $_.FullName)
}

Write-Host "Found $($allFiles.Count) text files to check" -ForegroundColor Cyan
Write-Host ""

# Check each file
foreach ($file in $allFiles) {
    $totalFiles++
    $relativePath = Resolve-Path -Path $file.FullName -Relative
    $hasBOM = Test-HasBOM -FilePath $file.FullName
    
    if ($hasBOM) {
        $bomFiles++
        Write-Host "BOM detected: $relativePath" -ForegroundColor Yellow
        
        if (-not $DryRun) {
            Write-Host "Fixing BOM: $relativePath" -ForegroundColor Green
            if (Remove-BOM -FilePath $file.FullName) {
                $fixedFiles++
            }
        }
    }
}

# Create .gitattributes file
$gitattributesContent = @"
# Ensure consistent line endings
* text=auto eol=lf

# Text files
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

# Binary files
*.jpg binary
*.jpeg binary
*.png binary
*.gif binary
*.ico binary
*.pdf binary
*.zip binary

# Windows files
*.bat text eol=crlf
*.cmd text eol=crlf
*.ps1 text eol=crlf
"@

if (-not $DryRun) {
    Write-Host ""
    Write-Host "Creating .gitattributes file..." -ForegroundColor Cyan
    try {
        [System.IO.File]::WriteAllText(".gitattributes", $gitattributesContent, [System.Text.UTF8Encoding]::new($false))
        Write-Host "Created .gitattributes file" -ForegroundColor Green
    }
    catch {
        Write-Error "Failed to create .gitattributes file"
    }
}

# Show results
Write-Host ""
Write-Host "=== Results ===" -ForegroundColor Green
Write-Host "Total files: $totalFiles" -ForegroundColor White
Write-Host "Files with BOM: $bomFiles" -ForegroundColor $(if ($bomFiles -gt 0) { "Yellow" } else { "Green" })

if (-not $DryRun) {
    Write-Host "Fixed files: $fixedFiles" -ForegroundColor Green
} else {
    Write-Host "Dry run mode - no files were modified" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "=== Next Steps ===" -ForegroundColor Green
Write-Host "1. Configure Git:" -ForegroundColor White
Write-Host "   git config core.autocrlf false" -ForegroundColor Gray
Write-Host "   git config core.eol lf" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Renormalize repository (if needed):" -ForegroundColor White
Write-Host "   git add --renormalize ." -ForegroundColor Gray
Write-Host "   git commit -m 'Normalize line endings'" -ForegroundColor Gray
Write-Host ""

if ($DryRun) {
    Write-Host "To perform actual fixes, run: .\fix-encoding-simple.ps1" -ForegroundColor Cyan
} else {
    Write-Host "Encoding fix completed!" -ForegroundColor Green
}
