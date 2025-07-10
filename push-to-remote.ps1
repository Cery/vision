# 推送到远程仓库的脚本
# Push to remote repository script

Write-Host "开始推送到远程仓库..." -ForegroundColor Green
Write-Host "Starting push to remote repository..." -ForegroundColor Green

# 检查网络连接
Write-Host "检查网络连接..." -ForegroundColor Cyan
try {
    $response = Test-NetConnection -ComputerName "github.com" -Port 443 -InformationLevel Quiet
    if ($response) {
        Write-Host "✅ 网络连接正常" -ForegroundColor Green
    } else {
        Write-Host "❌ 无法连接到GitHub" -ForegroundColor Red
        Write-Host "请检查网络连接或稍后重试" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "⚠️ 网络检查失败，继续尝试推送..." -ForegroundColor Yellow
}

# 检查当前状态
Write-Host "检查Git状态..." -ForegroundColor Cyan
git status --porcelain

# 显示最近的提交
Write-Host "最近的提交:" -ForegroundColor Cyan
git log --oneline -3

# 尝试推送
Write-Host "尝试推送到远程仓库..." -ForegroundColor Cyan

$pushAttempts = 0
$maxAttempts = 3
$success = $false

while ($pushAttempts -lt $maxAttempts -and -not $success) {
    $pushAttempts++
    Write-Host "推送尝试 $pushAttempts/$maxAttempts..." -ForegroundColor Yellow
    
    try {
        git push origin main
        if ($LASTEXITCODE -eq 0) {
            $success = $true
            Write-Host "✅ 推送成功！" -ForegroundColor Green
        } else {
            Write-Host "❌ 推送失败，退出代码: $LASTEXITCODE" -ForegroundColor Red
            
            if ($pushAttempts -lt $maxAttempts) {
                Write-Host "等待10秒后重试..." -ForegroundColor Yellow
                Start-Sleep -Seconds 10
            }
        }
    } catch {
        Write-Host "❌ 推送过程中发生错误: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($pushAttempts -lt $maxAttempts) {
            Write-Host "等待10秒后重试..." -ForegroundColor Yellow
            Start-Sleep -Seconds 10
        }
    }
}

if (-not $success) {
    Write-Host "❌ 所有推送尝试都失败了" -ForegroundColor Red
    Write-Host "可能的解决方案:" -ForegroundColor Yellow
    Write-Host "1. 检查网络连接" -ForegroundColor White
    Write-Host "2. 检查GitHub访问权限" -ForegroundColor White
    Write-Host "3. 尝试使用VPN或代理" -ForegroundColor White
    Write-Host "4. 稍后重试" -ForegroundColor White
    Write-Host ""
    Write-Host "手动推送命令:" -ForegroundColor Cyan
    Write-Host "git push origin main" -ForegroundColor White
    Write-Host "或者使用强制推送:" -ForegroundColor White
    Write-Host "git push --force-with-lease origin main" -ForegroundColor White
    exit 1
} else {
    Write-Host ""
    Write-Host "🎉 推送完成！" -ForegroundColor Green
    Write-Host "远程仓库已更新" -ForegroundColor Green
}

# 显示远程状态
Write-Host ""
Write-Host "检查远程状态..." -ForegroundColor Cyan
git remote show origin
