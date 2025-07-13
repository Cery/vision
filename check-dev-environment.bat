@echo off
title Vision NDT 开发环境检查
color 0A

echo.
echo ========================================
echo     Vision NDT 开发环境检查
echo ========================================
echo.

set ISSUES_FOUND=0
set WARNINGS_FOUND=0

echo [1/8] 检查 Git 环境...
echo.

REM 检查 Git 安装
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git 未安装或未添加到 PATH
    set /a ISSUES_FOUND+=1
    echo    建议: 安装 Git for Windows 并添加到 PATH
) else (
    echo ✅ Git 已安装
    git --version
    
    REM 检查 Git 配置
    git config user.name >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Git 用户名未配置
        set /a WARNINGS_FOUND+=1
        echo    建议: git config --global user.name "Your Name"
    ) else (
        echo ✅ Git 用户名: 
        git config user.name
    )
    
    git config user.email >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Git 邮箱未配置
        set /a WARNINGS_FOUND+=1
        echo    建议: git config --global user.email "your@email.com"
    ) else (
        echo ✅ Git 邮箱: 
        git config user.email
    )
)

echo.
echo [2/8] 检查 Hugo 环境...
echo.

hugo version >nul 2>&1
if errorlevel 1 (
    echo ❌ Hugo 未安装或未添加到 PATH
    set /a ISSUES_FOUND+=1
    echo    建议: 下载 Hugo Extended 版本并添加到 PATH
) else (
    echo ✅ Hugo 已安装
    hugo version
    
    REM 检查是否为 Extended 版本
    hugo version | findstr /i "extended" >nul
    if errorlevel 1 (
        echo ⚠️  建议使用 Hugo Extended 版本以支持 SCSS
        set /a WARNINGS_FOUND+=1
    ) else (
        echo ✅ Hugo Extended 版本已安装
    )
)

echo.
echo [3/8] 检查 Node.js 环境...
echo.

node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js 未安装或未添加到 PATH
    set /a ISSUES_FOUND+=1
    echo    建议: 安装 Node.js LTS 版本
) else (
    echo ✅ Node.js 已安装
    node --version
    
    REM 检查版本是否足够新
    for /f "tokens=1 delims=." %%a in ('node --version') do (
        set NODE_MAJOR=%%a
    )
    set NODE_MAJOR=%NODE_MAJOR:v=%
    if %NODE_MAJOR% LSS 16 (
        echo ⚠️  Node.js 版本较旧，建议升级到 16+ 版本
        set /a WARNINGS_FOUND+=1
    ) else (
        echo ✅ Node.js 版本符合要求
    )
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm 未安装
    set /a ISSUES_FOUND+=1
) else (
    echo ✅ npm 已安装
    npm --version
)

echo.
echo [4/8] 检查 Python 环境...
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Python 未安装或未添加到 PATH
    set /a WARNINGS_FOUND+=1
    echo    注意: Python 用于图片抓取服务
) else (
    echo ✅ Python 已安装
    python --version
)

pip --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  pip 未安装
    set /a WARNINGS_FOUND+=1
) else (
    echo ✅ pip 已安装
    pip --version
)

echo.
echo [5/8] 检查项目依赖...
echo.

if exist "package.json" (
    echo ✅ package.json 存在
    
    if exist "node_modules" (
        echo ✅ node_modules 目录存在
    ) else (
        echo ⚠️  node_modules 目录不存在
        set /a WARNINGS_FOUND+=1
        echo    建议: 运行 npm install
    )
) else (
    echo ⚠️  package.json 不存在
    set /a WARNINGS_FOUND+=1
)

if exist "hugo.toml" (
    echo ✅ Hugo 配置文件存在
) else (
    echo ❌ Hugo 配置文件不存在
    set /a ISSUES_FOUND+=1
)

echo.
echo [6/8] 检查环境变量...
echo.

echo PATH 中的相关路径:
echo %PATH% | findstr /i "git" >nul && echo ✅ Git 在 PATH 中 || echo ⚠️  Git 可能不在 PATH 中
echo %PATH% | findstr /i "hugo" >nul && echo ✅ Hugo 在 PATH 中 || echo ⚠️  Hugo 可能不在 PATH 中
echo %PATH% | findstr /i "node" >nul && echo ✅ Node.js 在 PATH 中 || echo ⚠️  Node.js 可能不在 PATH 中

echo.
echo [7/8] 检查项目结构...
echo.

if exist "content" (
    echo ✅ content 目录存在
) else (
    echo ❌ content 目录不存在
    set /a ISSUES_FOUND+=1
)

if exist "layouts" (
    echo ✅ layouts 目录存在
) else (
    echo ❌ layouts 目录不存在
    set /a ISSUES_FOUND+=1
)

if exist "static" (
    echo ✅ static 目录存在
) else (
    echo ❌ static 目录不存在
    set /a ISSUES_FOUND+=1
)

echo.
echo [8/8] 检查开发服务...
echo.

REM 检查端口占用
netstat -an | findstr ":1315" >nul
if not errorlevel 1 (
    echo ⚠️  端口 1315 已被占用 (Hugo 默认端口)
    set /a WARNINGS_FOUND+=1
) else (
    echo ✅ 端口 1315 可用
)

netstat -an | findstr ":5000" >nul
if not errorlevel 1 (
    echo ⚠️  端口 5000 已被占用 (Python 服务端口)
    set /a WARNINGS_FOUND+=1
) else (
    echo ✅ 端口 5000 可用
)

echo.
echo ========================================
echo           检查结果总结
echo ========================================
echo.

if %ISSUES_FOUND% EQU 0 (
    echo ✅ 未发现严重问题
) else (
    echo ❌ 发现 %ISSUES_FOUND% 个严重问题需要解决
)

if %WARNINGS_FOUND% EQU 0 (
    echo ✅ 未发现警告
) else (
    echo ⚠️  发现 %WARNINGS_FOUND% 个警告建议处理
)

echo.
echo 建议的下一步操作:
if %ISSUES_FOUND% GTR 0 (
    echo 1. 解决上述严重问题
    echo 2. 重新运行此检查脚本
)
if %WARNINGS_FOUND% GTR 0 (
    echo 3. 处理警告项目以获得最佳体验
)
echo 4. 运行 'hugo server' 启动开发服务器
echo 5. 运行 Python 图片抓取服务 (如需要)

echo.
pause
