# Fix file encoding issues
param(
    [string]$Path = "."
)

Write-Host "Fixing file encoding issues..." -ForegroundColor Green

# Text file extensions to check
$textExtensions = @('.md', '.html', '.css', '.js', '.json', '.yml', '.yaml', '.toml', '.txt')

# Directories to exclude
$excludeDirs = @('node_modules', 'public', 'resources', '.git')

# Get all text files
$files = Get-ChildItem -Path $Path -Recurse -File | Where-Object {
    $_.Extension -in $textExtensions -and
    $excludeDirs -notcontains $_.Directory.Name
}

$fixedCount = 0

foreach ($file in $files) {
    try {
        # Read file content
        $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
        
        if ($null -eq $content) {
            continue
        }
        
        # Convert CRLF to LF
        $content = $content -replace "`r`n", "`n"
        $content = $content -replace "`r", "`n"
        
        # Write back as UTF-8 without BOM
        $utf8NoBom = New-Object System.Text.UTF8Encoding $false
        [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
        
        $fixedCount++
        Write-Host "Fixed: $($file.Name)" -ForegroundColor Yellow
    }
    catch {
        Write-Warning "Could not process file: $($file.FullName)"
    }
}

Write-Host "Fixed $fixedCount files" -ForegroundColor Green
