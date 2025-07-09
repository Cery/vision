# Simple BOM fix script
Write-Host "Starting BOM fix..." -ForegroundColor Green

$productsDir = "content\products"
if (-not (Test-Path $productsDir)) {
    Write-Host "Directory not found: $productsDir" -ForegroundColor Red
    exit 1
}

$mdFiles = Get-ChildItem -Path $productsDir -Filter "*.md" -File
Write-Host "Found $($mdFiles.Count) MD files" -ForegroundColor Cyan

$fixedCount = 0

foreach ($file in $mdFiles) {
    try {
        $bytes = [System.IO.File]::ReadAllBytes($file.FullName)
        
        # Check for BOM (EF BB BF)
        $hasBOM = $bytes.Length -ge 3 -and 
                  $bytes[0] -eq 0xEF -and 
                  $bytes[1] -eq 0xBB -and 
                  $bytes[2] -eq 0xBF
        
        if ($hasBOM) {
            Write-Host "Fixing BOM in: $($file.Name)" -ForegroundColor Yellow
            
            # Create backup
            $backupPath = $file.FullName + ".bak"
            Copy-Item $file.FullName $backupPath
            
            # Remove BOM and rewrite file
            $contentWithoutBOM = $bytes[3..($bytes.Length - 1)]
            [System.IO.File]::WriteAllBytes($file.FullName, $contentWithoutBOM)
            
            Write-Host "Fixed: $($file.Name)" -ForegroundColor Green
            $fixedCount++
        } else {
            Write-Host "OK: $($file.Name)" -ForegroundColor DarkGreen
        }
        
    } catch {
        Write-Host "Error processing: $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Fixed files: $fixedCount" -ForegroundColor Green
Write-Host "  Total files: $($mdFiles.Count)" -ForegroundColor White

# Check HTML file
$htmlFile = "static\admin\complete-content-manager.html"
if (Test-Path $htmlFile) {
    $htmlBytes = [System.IO.File]::ReadAllBytes($htmlFile)
    $htmlHasBOM = $htmlBytes.Length -ge 3 -and 
                  $htmlBytes[0] -eq 0xEF -and 
                  $htmlBytes[1] -eq 0xBB -and 
                  $htmlBytes[2] -eq 0xBF
    
    if ($htmlHasBOM) {
        Write-Host "Fixing HTML BOM..." -ForegroundColor Yellow
        
        try {
            Copy-Item $htmlFile ($htmlFile + ".bak")
            $htmlContentWithoutBOM = $htmlBytes[3..($htmlBytes.Length - 1)]
            [System.IO.File]::WriteAllBytes($htmlFile, $htmlContentWithoutBOM)
            Write-Host "HTML BOM fixed" -ForegroundColor Green
        } catch {
            Write-Host "HTML fix failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "HTML file OK" -ForegroundColor DarkGreen
    }
}

Write-Host "BOM fix completed" -ForegroundColor Green
