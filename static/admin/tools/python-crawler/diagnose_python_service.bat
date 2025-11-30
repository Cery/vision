@echo off
chcp 65001 >nul 2>&1
title Python抓取服务诊断工具
color 0A

echo.
echo ========================================
echo      Python抓取服务诊断工具
echo ========================================
echo 版本: v1.0.0
echo 功能: 自动诊断和修复Python服务问题
echo ========================================
echo.

set ISSUES_FOUND=0
set PYTHON_PATH=""

echo [1/6] 检查Python安装...
echo.

REM 尝试不同的Python命令
python --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ Python 已安装
    python --version
    set PYTHON_PATH=python
    goto :check_pip
)

py --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ Python 已安装 (通过py命令)
    py --version
    set PYTHON_PATH=py
    goto :check_pip
)

python3 --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ Python 已安装 (通过python3命令)
    python3 --version
    set PYTHON_PATH=python3
    goto :check_pip
)

echo ❌ Python 未安装或未添加到PATH
echo.
echo 解决方案:
echo 1. 访问 https://www.python.org/downloads/
echo 2. 下载Python 3.8或更高版本
echo 3. 安装时必须勾选 "Add Python to PATH"
echo 4. 重启命令提示符后重新运行此脚本
echo.
set /a ISSUES_FOUND+=1
goto :summary

:check_pip
echo.
echo [2/6] 检查pip包管理器...
echo.

%PYTHON_PATH% -m pip --version >nul 2>&1
if errorlevel 1 (
    echo ❌ pip 不可用
    echo 解决方案: %PYTHON_PATH% -m ensurepip --upgrade
    set /a ISSUES_FOUND+=1
) else (
    echo ✅ pip 可用
    %PYTHON_PATH% -m pip --version
)

echo.
echo [3/6] 检查依赖包...
echo.

REM 检查关键依赖包
set MISSING_PACKAGES=0

%PYTHON_PATH% -c "import flask" >nul 2>&1
if errorlevel 1 (
    echo ❌ Flask 未安装
    set /a MISSING_PACKAGES+=1
) else (
    echo ✅ Flask 已安装
)

%PYTHON_PATH% -c "import requests" >nul 2>&1
if errorlevel 1 (
    echo ❌ requests 未安装
    set /a MISSING_PACKAGES+=1
) else (
    echo ✅ requests 已安装
)

%PYTHON_PATH% -c "import bs4" >nul 2>&1
if errorlevel 1 (
    echo ❌ beautifulsoup4 未安装
    set /a MISSING_PACKAGES+=1
) else (
    echo ✅ beautifulsoup4 已安装
)

%PYTHON_PATH% -c "import PIL" >nul 2>&1
if errorlevel 1 (
    echo ❌ Pillow 未安装
    set /a MISSING_PACKAGES+=1
) else (
    echo ✅ Pillow 已安装
)

if %MISSING_PACKAGES% GTR 0 (
    echo.
    echo ⚠️  发现 %MISSING_PACKAGES% 个缺失的依赖包
    echo 解决方案: %PYTHON_PATH% -m pip install -r requirements.txt
    set /a ISSUES_FOUND+=1
)

echo.
echo [4/6] 检查服务文件...
echo.

if exist "image_crawler_service.py" (
    echo ✅ 服务文件存在
) else (
    echo ❌ 服务文件不存在
    echo 当前目录: %CD%
    echo 请确保在正确的目录中运行此脚本
    set /a ISSUES_FOUND+=1
)

if exist "requirements.txt" (
    echo ✅ 依赖配置文件存在
) else (
    echo ❌ requirements.txt 不存在
    set /a ISSUES_FOUND+=1
)

echo.
echo [5/6] 检查端口占用...
echo.

netstat -an | findstr ":5000" >nul
if not errorlevel 1 (
    echo ⚠️  端口 5000 已被占用
    echo 可能的原因:
    echo 1. Python服务已在运行
    echo 2. 其他程序占用了端口
    echo.
    echo 解决方案:
    echo 1. 检查是否已有服务在运行
    echo 2. 结束占用端口的进程
    netstat -ano | findstr ":5000"
) else (
    echo ✅ 端口 5000 可用
)

echo.
echo [6/6] 尝试启动服务...
echo.

if %ISSUES_FOUND% GTR 0 (
    echo ❌ 发现 %ISSUES_FOUND% 个问题，请先解决后再启动服务
    goto :summary
)

echo 正在启动Python抓取服务...
echo 如果成功，服务将在 http://localhost:5000 运行
echo 按 Ctrl+C 可停止服务
echo.

%PYTHON_PATH% image_crawler_service.py

:summary
echo.
echo ========================================
echo           诊断结果总结
echo ========================================
echo.

if %ISSUES_FOUND% EQU 0 (
    echo ✅ 所有检查通过，服务应该可以正常运行
    echo.
    echo 下一步:
    echo 1. 访问 http://localhost:5000/api/health 测试服务
    echo 2. 在图片处理工具中使用Python抓取功能
) else (
    echo ❌ 发现 %ISSUES_FOUND% 个问题需要解决
    echo.
    echo 建议操作:
    if %PYTHON_PATH%=="" (
        echo 1. 安装Python并添加到PATH
    ) else (
        echo 1. 安装缺失的依赖包: %PYTHON_PATH% -m pip install -r requirements.txt
    )
    echo 2. 解决上述问题后重新运行此脚本
    echo 3. 参考 Python抓取服务启动指南.md 获取详细帮助
)

echo.
echo 按任意键退出...
pause >nul
