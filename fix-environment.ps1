# Vision NDT 开发环境自动修复脚本
param(
    [switch]$FixAll,
    [switch]$FixGit,
    [switch]$FixHugo,
    [switch]$FixNpm,
    [switch]$FixPython
)

Write-Host "========================================" -ForegroundColor Green
Write-Host "     Vision NDT 环境自动修复工具" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 检查管理员权限
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if (-not $isAdmin) {
    Write-Host "⚠️  建议以管理员身份运行以获得最佳修复效果" -ForegroundColor Yellow
    Write-Host ""
}

# 修复PowerShell执行策略
function Fix-ExecutionPolicy {
    Write-Host "[修复] PowerShell执行策略..." -ForegroundColor Cyan
    try {
        $currentPolicy = Get-ExecutionPolicy -Scope CurrentUser
        if ($currentPolicy -eq "Restricted") {
            Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser -Force
            Write-Host "✅ PowerShell执行策略已修复" -ForegroundColor Green
        } else {
            Write-Host "✅ PowerShell执行策略正常" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ 无法修复PowerShell执行策略: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 修复Git PATH
function Fix-GitPath {
    Write-Host "[修复] Git环境..." -ForegroundColor Cyan
    
    # 常见Git安装路径
    $gitPaths = @(
        "C:\Program Files\Git\bin",
        "C:\Program Files\Git\cmd",
        "C:\Program Files (x86)\Git\bin",
        "C:\Program Files (x86)\Git\cmd"
    )
    
    $pathsToAdd = @()
    foreach ($path in $gitPaths) {
        if (Test-Path $path) {
            if ($env:PATH -notlike "*$path*") {
                $pathsToAdd += $path
            }
        }
    }
    
    if ($pathsToAdd.Count -gt 0) {
        try {
            $newPath = $env:PATH + ";" + ($pathsToAdd -join ";")
            [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::User)
            $env:PATH = $newPath
            Write-Host "✅ Git路径已添加到PATH: $($pathsToAdd -join ', ')" -ForegroundColor Green
        } catch {
            Write-Host "❌ 无法修复Git PATH: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️  未找到Git安装路径，请手动安装Git" -ForegroundColor Yellow
    }
}

# 修复Hugo PATH
function Fix-HugoPath {
    Write-Host "[修复] Hugo环境..." -ForegroundColor Cyan
    
    # 检查当前目录是否有Hugo
    if (Test-Path ".\hugo.exe") {
        $currentDir = Get-Location
        if ($env:PATH -notlike "*$currentDir*") {
            try {
                $newPath = $env:PATH + ";$currentDir"
                [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::User)
                $env:PATH = $newPath
                Write-Host "✅ 当前目录已添加到PATH (Hugo可用)" -ForegroundColor Green
            } catch {
                Write-Host "❌ 无法添加当前目录到PATH: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "✅ Hugo路径已在PATH中" -ForegroundColor Green
        }
    } else {
        Write-Host "⚠️  当前目录未找到hugo.exe，建议下载Hugo Extended版本" -ForegroundColor Yellow
        Write-Host "   下载地址: https://github.com/gohugoio/hugo/releases" -ForegroundColor Gray
    }
}

# 修复npm问题
function Fix-Npm {
    Write-Host "[修复] npm环境..." -ForegroundColor Cyan
    
    # 先修复执行策略
    Fix-ExecutionPolicy
    
    # 测试npm
    try {
        $npmVersion = & npm --version 2>$null
        if ($npmVersion) {
            Write-Host "✅ npm工作正常: $npmVersion" -ForegroundColor Green
        } else {
            Write-Host "⚠️  npm仍有问题，可能需要重新安装Node.js" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "⚠️  npm仍有问题: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 修复Python环境
function Fix-Python {
    Write-Host "[修复] Python环境..." -ForegroundColor Cyan
    
    # 检查是否有Python安装
    $pythonPaths = @(
        "C:\Python39",
        "C:\Python310", 
        "C:\Python311",
        "C:\Python312",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python39",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python310",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python311",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python312",
        "C:\Users\$env:USERNAME\AppData\Local\Programs\Python\Python313"
    )
    
    $foundPython = $false
    foreach ($path in $pythonPaths) {
        if (Test-Path "$path\python.exe") {
            Write-Host "✅ 找到Python安装: $path" -ForegroundColor Green
            
            # 添加到PATH
            if ($env:PATH -notlike "*$path*") {
                try {
                    $newPath = $env:PATH + ";$path;$path\Scripts"
                    [Environment]::SetEnvironmentVariable("Path", $newPath, [EnvironmentVariableTarget]::User)
                    $env:PATH = $newPath
                    Write-Host "✅ Python路径已添加到PATH" -ForegroundColor Green
                } catch {
                    Write-Host "❌ 无法添加Python到PATH: $($_.Exception.Message)" -ForegroundColor Red
                }
            }
            $foundPython = $true
            break
        }
    }
    
    if (-not $foundPython) {
        Write-Host "⚠️  未找到Python安装，建议从官网下载安装" -ForegroundColor Yellow
        Write-Host "   下载地址: https://www.python.org/downloads/" -ForegroundColor Gray
    }
}

# 安装项目依赖
function Install-Dependencies {
    Write-Host "[安装] 项目依赖..." -ForegroundColor Cyan
    
    if (Test-Path "package.json") {
        try {
            Write-Host "正在安装npm依赖..." -ForegroundColor Gray
            & npm install
            Write-Host "✅ npm依赖安装完成" -ForegroundColor Green
        } catch {
            Write-Host "❌ npm依赖安装失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    
    if (Test-Path "static\tools\python-crawler\requirements.txt") {
        try {
            Write-Host "正在安装Python依赖..." -ForegroundColor Gray
            & python -m pip install -r static\tools\python-crawler\requirements.txt
            Write-Host "✅ Python依赖安装完成" -ForegroundColor Green
        } catch {
            Write-Host "❌ Python依赖安装失败: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 验证修复结果
function Test-Environment {
    Write-Host "[验证] 环境修复结果..." -ForegroundColor Cyan
    Write-Host ""
    
    # 测试Git
    try {
        $gitVersion = & git --version 2>$null
        if ($gitVersion) {
            Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ Git仍不可用" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Git仍不可用" -ForegroundColor Red
    }
    
    # 测试Hugo
    try {
        $hugoVersion = & hugo version 2>$null
        if ($hugoVersion) {
            Write-Host "✅ Hugo: $hugoVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ Hugo仍不可用" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Hugo仍不可用" -ForegroundColor Red
    }
    
    # 测试Node.js和npm
    try {
        $nodeVersion = & node --version 2>$null
        if ($nodeVersion) {
            Write-Host "✅ Node.js: $nodeVersion" -ForegroundColor Green
        }
    } catch {
        Write-Host "❌ Node.js不可用" -ForegroundColor Red
    }
    
    try {
        $npmVersion = & npm --version 2>$null
        if ($npmVersion) {
            Write-Host "✅ npm: $npmVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ npm仍不可用" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ npm仍不可用" -ForegroundColor Red
    }
    
    # 测试Python
    try {
        $pythonVersion = & python --version 2>$null
        if ($pythonVersion) {
            Write-Host "✅ Python: $pythonVersion" -ForegroundColor Green
        } else {
            Write-Host "❌ Python仍不可用" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Python仍不可用" -ForegroundColor Red
    }
}

# 主修复流程
Write-Host "开始环境修复..." -ForegroundColor Cyan
Write-Host ""

if ($FixAll -or $FixGit) {
    Fix-GitPath
    Write-Host ""
}

if ($FixAll -or $FixHugo) {
    Fix-HugoPath
    Write-Host ""
}

if ($FixAll -or $FixNpm) {
    Fix-Npm
    Write-Host ""
}

if ($FixAll -or $FixPython) {
    Fix-Python
    Write-Host ""
}

if ($FixAll) {
    Install-Dependencies
    Write-Host ""
}

# 如果没有指定参数，执行全部修复
if (-not ($FixGit -or $FixHugo -or $FixNpm -or $FixPython)) {
    Fix-GitPath
    Write-Host ""
    Fix-HugoPath
    Write-Host ""
    Fix-Npm
    Write-Host ""
    Fix-Python
    Write-Host ""
    Install-Dependencies
    Write-Host ""
}

Test-Environment

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "           修复完成" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "建议重启命令提示符/PowerShell以确保PATH更改生效" -ForegroundColor Yellow
Write-Host ""
Write-Host "下一步操作:" -ForegroundColor Cyan
Write-Host "1. 重启终端" -ForegroundColor Gray
Write-Host "2. 运行: hugo server --port 1315" -ForegroundColor Gray
Write-Host "3. 访问: http://localhost:1315" -ForegroundColor Gray
