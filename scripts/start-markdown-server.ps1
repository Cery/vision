# Markdown文件服务器启动脚本
param(
    [switch]$Install,
    [switch]$Stop,
    [switch]$Status
)

$ServerDir = "scripts"
$ServerScript = "markdown-server.js"
$PackageJson = "package.json"

Write-Host "🚀 Vision CMS Markdown服务器管理工具" -ForegroundColor Green
Write-Host "=" * 50

# 检查Node.js是否安装
function Test-NodeJS {
    try {
        $nodeVersion = node --version
        Write-Host "✅ Node.js版本: $nodeVersion" -ForegroundColor Green
        return $true
    } catch {
        Write-Host "❌ 未找到Node.js，请先安装Node.js" -ForegroundColor Red
        Write-Host "   下载地址: https://nodejs.org/" -ForegroundColor Yellow
        return $false
    }
}

# 安装依赖
function Install-Dependencies {
    Write-Host "📦 安装依赖包..." -ForegroundColor Yellow
    
    Push-Location $ServerDir
    try {
        if (!(Test-Path $PackageJson)) {
            Write-Host "❌ 未找到package.json文件" -ForegroundColor Red
            return $false
        }
        
        npm install
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ 依赖安装完成" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ 依赖安装失败" -ForegroundColor Red
            return $false
        }
    } finally {
        Pop-Location
    }
}

# 检查服务器状态
function Get-ServerStatus {
    try {
        $response = Invoke-RestMethod -Uri "http://localhost:3001/api/health" -Method GET -TimeoutSec 5
        if ($response.success) {
            Write-Host "✅ Markdown服务器正在运行" -ForegroundColor Green
            Write-Host "   地址: http://localhost:3001" -ForegroundColor Cyan
            Write-Host "   状态: $($response.message)" -ForegroundColor Gray
            return $true
        }
    } catch {
        Write-Host "❌ Markdown服务器未运行" -ForegroundColor Red
        return $false
    }
}

# 停止服务器
function Stop-Server {
    Write-Host "🛑 停止Markdown服务器..." -ForegroundColor Yellow
    
    try {
        # 查找并终止Node.js进程
        $processes = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
            $_.CommandLine -like "*markdown-server.js*"
        }
        
        if ($processes) {
            $processes | ForEach-Object {
                Stop-Process -Id $_.Id -Force
                Write-Host "✅ 已停止进程 ID: $($_.Id)" -ForegroundColor Green
            }
        } else {
            Write-Host "ℹ️ 未找到运行中的Markdown服务器进程" -ForegroundColor Gray
        }
        
        # 也尝试通过端口查找
        $netstat = netstat -ano | Select-String ":3001"
        if ($netstat) {
            $netstat | ForEach-Object {
                $line = $_.Line
                if ($line -match "\s+(\d+)$") {
                    $pid = $matches[1]
                    try {
                        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
                        Write-Host "✅ 已停止端口3001上的进程 ID: $pid" -ForegroundColor Green
                    } catch {
                        Write-Host "⚠️ 无法停止进程 ID: $pid" -ForegroundColor Yellow
                    }
                }
            }
        }
        
    } catch {
        Write-Host "⚠️ 停止服务器时出现错误: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 启动服务器
function Start-Server {
    Write-Host "🚀 启动Markdown服务器..." -ForegroundColor Yellow
    
    # 检查是否已经运行
    if (Get-ServerStatus) {
        Write-Host "ℹ️ 服务器已在运行，无需重复启动" -ForegroundColor Gray
        return
    }
    
    Push-Location $ServerDir
    try {
        if (!(Test-Path $ServerScript)) {
            Write-Host "❌ 未找到服务器脚本: $ServerScript" -ForegroundColor Red
            return
        }
        
        if (!(Test-Path "node_modules")) {
            Write-Host "📦 首次运行，正在安装依赖..." -ForegroundColor Yellow
            if (!(Install-Dependencies)) {
                return
            }
        }
        
        Write-Host "🔄 正在启动服务器..." -ForegroundColor Cyan
        Write-Host "   脚本: $ServerScript" -ForegroundColor Gray
        Write-Host "   端口: 3001" -ForegroundColor Gray
        Write-Host "   按 Ctrl+C 停止服务器" -ForegroundColor Yellow
        Write-Host ""
        
        # 启动服务器
        node $ServerScript
        
    } finally {
        Pop-Location
    }
}

# 主逻辑
if (!(Test-NodeJS)) {
    exit 1
}

switch ($true) {
    $Install {
        Install-Dependencies
    }
    $Stop {
        Stop-Server
    }
    $Status {
        Get-ServerStatus
    }
    default {
        Start-Server
    }
}

Write-Host ""
Write-Host "💡 使用提示:" -ForegroundColor Cyan
Write-Host "   启动服务器: .\start-markdown-server.ps1" -ForegroundColor Gray
Write-Host "   安装依赖:   .\start-markdown-server.ps1 -Install" -ForegroundColor Gray
Write-Host "   检查状态:   .\start-markdown-server.ps1 -Status" -ForegroundColor Gray
Write-Host "   停止服务器: .\start-markdown-server.ps1 -Stop" -ForegroundColor Gray
