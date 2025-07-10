# 检查文件编码问题
$FilePath = "layouts/products/single.html"

Write-Host "检查文件编码: $FilePath" -ForegroundColor Cyan
Write-Host "=================================================="

if (Test-Path $FilePath) {
    $bytes = [System.IO.File]::ReadAllBytes($FilePath)

    Write-Host "文件大小: $($bytes.Length) 字节"

    # 检查BOM
    if ($bytes.Length -ge 3 -and $bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF) {
        Write-Host "❌ 检测到UTF-8 BOM字符" -ForegroundColor Red

        # 自动移除BOM
        $contentWithoutBOM = $bytes[3..($bytes.Length - 1)]
        [System.IO.File]::WriteAllBytes($FilePath, $contentWithoutBOM)
        Write-Host "✅ BOM字符已自动移除" -ForegroundColor Green
    } else {
        Write-Host "✅ 无BOM字符，编码正常" -ForegroundColor Green
    }

} else {
    Write-Host "❌ 文件不存在: $FilePath" -ForegroundColor Red
}

Write-Host "=================================================="
