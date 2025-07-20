# Vision NDT 开发环境检查脚本
Write-Host "========================================" -ForegroundColor Green
Write-Host "     Vision NDT 开发环境检查" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$issuesFound = 0
$warningsFound = 0

# 检查 Git
Write-Host "[1/8] 检查 Git 环境..." -ForegroundColor Cyan
Write-Host ""

try {
    $gitVersion = git --version 2>$null
    if ($gitVersion) {
        Write-Host "✅ Git 已安装: $gitVersion" -ForegroundColor Green
        
        # 检查 Git 配置
        try {
            $gitUser = git config user.name 2>$null
            if ($gitUser) {
                Write-Host "✅ Git 用户名: $gitUser" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Git 用户名未配置" -ForegroundColor Yellow
                Write-Host "   建议: git config --global user.name `"Your Name`"" -ForegroundColor Gray
                $warningsFound++
            }
        } catch {
            Write-Host "⚠️  无法检查 Git 用户配置" -ForegroundColor Yellow
            $warningsFound++
        }
        
        try {
            $gitEmail = git config user.email 2>$null
            if ($gitEmail) {
                Write-Host "✅ Git 邮箱: $gitEmail" -ForegroundColor Green
            } else {
                Write-Host "⚠️  Git 邮箱未配置" -ForegroundColor Yellow
                Write-Host "   建议: git config --global user.email `"your@email.com`"" -ForegroundColor Gray
                $warningsFound++
            }
        } catch {
            Write-Host "⚠️  无法检查 Git 邮箱配置" -ForegroundColor Yellow
            $warningsFound++
        }
    } else {
        Write-Host "❌ Git 未安装或未添加到 PATH" -ForegroundColor Red
        Write-Host "   建议: 安装 Git for Windows 并添加到 PATH" -ForegroundColor Gray
        $issuesFound++
    }
} catch {
    Write-Host "❌ Git 未安装或未添加到 PATH" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# 检查 Hugo
Write-Host "[2/8] 检查 Hugo 环境..." -ForegroundColor Cyan
Write-Host ""

try {
    $hugoVersion = hugo version 2>$null
    if ($hugoVersion) {
        Write-Host "✅ Hugo 已安装: $hugoVersion" -ForegroundColor Green
        
        if ($hugoVersion -match "extended") {
            Write-Host "✅ Hugo Extended 版本已安装" -ForegroundColor Green
        } else {
            Write-Host "⚠️  建议使用 Hugo Extended 版本以支持 SCSS" -ForegroundColor Yellow
            $warningsFound++
        }
    } else {
        Write-Host "❌ Hugo 未安装或未添加到 PATH" -ForegroundColor Red
        Write-Host "   建议: 下载 Hugo Extended 版本并添加到 PATH" -ForegroundColor Gray
        $issuesFound++
    }
} catch {
    Write-Host "❌ Hugo 未安装或未添加到 PATH" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# 检查 Node.js
Write-Host "[3/8] 检查 Node.js 环境..." -ForegroundColor Cyan
Write-Host ""

try {
    $nodeVersion = node --version 2>$null
    if ($nodeVersion) {
        Write-Host "✅ Node.js 已安装: $nodeVersion" -ForegroundColor Green
        
        # 检查版本
        $majorVersion = [int]($nodeVersion -replace 'v(\d+)\..*', '$1')
        if ($majorVersion -ge 16) {
            Write-Host "✅ Node.js 版本符合要求 (>= 16)" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Node.js 版本较旧，建议升级到 16+ 版本" -ForegroundColor Yellow
            $warningsFound++
        }
    } else {
        Write-Host "❌ Node.js 未安装或未添加到 PATH" -ForegroundColor Red
        Write-Host "   建议: 安装 Node.js LTS 版本" -ForegroundColor Gray
        $issuesFound++
    }
} catch {
    Write-Host "❌ Node.js 未安装或未添加到 PATH" -ForegroundColor Red
    $issuesFound++
}

try {
    $npmVersion = npm --version 2>$null
    if ($npmVersion) {
        Write-Host "✅ npm 已安装: $npmVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ npm 未安装" -ForegroundColor Red
        $issuesFound++
    }
} catch {
    Write-Host "❌ npm 未安装" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# 检查 Python
Write-Host "[4/8] 检查 Python 环境..." -ForegroundColor Cyan
Write-Host ""

try {
    $pythonVersion = python --version 2>$null
    if ($pythonVersion) {
        Write-Host "✅ Python 已安装: $pythonVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Python 未安装或未添加到 PATH" -ForegroundColor Yellow
        Write-Host "   注意: Python 用于图片抓取服务" -ForegroundColor Gray
        $warningsFound++
    }
} catch {
    Write-Host "⚠️  Python 未安装或未添加到 PATH" -ForegroundColor Yellow
    $warningsFound++
}

try {
    $pipVersion = pip --version 2>$null
    if ($pipVersion) {
        Write-Host "✅ pip 已安装: $pipVersion" -ForegroundColor Green
    } else {
        Write-Host "⚠️  pip 未安装" -ForegroundColor Yellow
        $warningsFound++
    }
} catch {
    Write-Host "⚠️  pip 未安装" -ForegroundColor Yellow
    $warningsFound++
}

Write-Host ""

# 检查项目依赖
Write-Host "[5/8] 检查项目依赖..." -ForegroundColor Cyan
Write-Host ""

if (Test-Path "package.json") {
    Write-Host "✅ package.json 存在" -ForegroundColor Green
    
    if (Test-Path "node_modules") {
        Write-Host "✅ node_modules 目录存在" -ForegroundColor Green
    } else {
        Write-Host "⚠️  node_modules 目录不存在" -ForegroundColor Yellow
        Write-Host "   建议: 运行 npm install" -ForegroundColor Gray
        $warningsFound++
    }
} else {
    Write-Host "⚠️  package.json 不存在" -ForegroundColor Yellow
    $warningsFound++
}

if (Test-Path "hugo.toml") {
    Write-Host "✅ Hugo 配置文件存在" -ForegroundColor Green
} else {
    Write-Host "❌ Hugo 配置文件不存在" -ForegroundColor Red
    $issuesFound++
}

Write-Host ""

# 检查环境变量
Write-Host "[6/8] 检查环境变量..." -ForegroundColor Cyan
Write-Host ""

$pathVar = $env:PATH
if ($pathVar -match "git") {
    Write-Host "✅ Git 在 PATH 中" -ForegroundColor Green
} else {
    Write-Host "⚠️  Git 可能不在 PATH 中" -ForegroundColor Yellow
}

if ($pathVar -match "hugo") {
    Write-Host "✅ Hugo 在 PATH 中" -ForegroundColor Green
} else {
    Write-Host "⚠️  Hugo 可能不在 PATH 中" -ForegroundColor Yellow
}

if ($pathVar -match "node") {
    Write-Host "✅ Node.js 在 PATH 中" -ForegroundColor Green
} else {
    Write-Host "⚠️  Node.js 可能不在 PATH 中" -ForegroundColor Yellow
}

Write-Host ""

# 检查项目结构
Write-Host "[7/8] 检查项目结构..." -ForegroundColor Cyan
Write-Host ""

$requiredDirs = @("content", "layouts", "static")
foreach ($dir in $requiredDirs) {
    if (Test-Path $dir) {
        Write-Host "✅ $dir 目录存在" -ForegroundColor Green
    } else {
        Write-Host "❌ $dir 目录不存在" -ForegroundColor Red
        $issuesFound++
    }
}

Write-Host ""

# 检查端口占用
Write-Host "[8/8] 检查开发服务端口..." -ForegroundColor Cyan
Write-Host ""

$port1315 = Get-NetTCPConnection -LocalPort 1315 -ErrorAction SilentlyContinue
if ($port1315) {
    Write-Host "⚠️  端口 1315 已被占用 (Hugo 默认端口)" -ForegroundColor Yellow
    $warningsFound++
} else {
    Write-Host "✅ 端口 1315 可用" -ForegroundColor Green
}

$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
if ($port5000) {
    Write-Host "⚠️  端口 5000 已被占用 (Python 服务端口)" -ForegroundColor Yellow
    $warningsFound++
} else {
    Write-Host "✅ 端口 5000 可用" -ForegroundColor Green
}

Write-Host ""

# 总结
Write-Host "========================================" -ForegroundColor Green
Write-Host "           检查结果总结" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

if ($issuesFound -eq 0) {
    Write-Host "✅ 未发现严重问题" -ForegroundColor Green
} else {
    Write-Host "❌ 发现 $issuesFound 个严重问题需要解决" -ForegroundColor Red
}

if ($warningsFound -eq 0) {
    Write-Host "✅ 未发现警告" -ForegroundColor Green
} else {
    Write-Host "⚠️  发现 $warningsFound 个警告建议处理" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "建议的下一步操作:" -ForegroundColor Cyan
if ($issuesFound -gt 0) {
    Write-Host "1. 解决上述严重问题" -ForegroundColor Gray
    Write-Host "2. 重新运行此检查脚本" -ForegroundColor Gray
}
if ($warningsFound -gt 0) {
    Write-Host "3. 处理警告项目以获得最佳体验" -ForegroundColor Gray
}
Write-Host "4. 运行 'hugo server' 启动开发服务器" -ForegroundColor Gray
Write-Host "5. 运行 Python 图片抓取服务 (如需要)" -ForegroundColor Gray

Write-Host ""
Read-Host "按 Enter 键继续"
