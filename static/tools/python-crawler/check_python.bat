@echo off
title Python环境检测工具

echo.
echo ========================================
echo         Python环境检测工具
echo ========================================
echo.

echo 正在检测Python环境...
echo.

REM 检查各种Python命令
set PYTHON_FOUND=0

echo [1] 检测 python 命令...
python --version >nul 2>&1
if not errorlevel 1 (
    echo [OK] python 命令可用
    python --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=python
) else (
    echo [NO] python 命令不可用
)

echo.
echo [2] 检测 python3 命令...
python3 --version >nul 2>&1
if not errorlevel 1 (
    echo [OK] python3 命令可用
    python3 --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=python3
) else (
    echo [NO] python3 命令不可用
)

echo.
echo [3] 检测 py 命令...
py --version >nul 2>&1
if not errorlevel 1 (
    echo [OK] py 命令可用
    py --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=py
) else (
    echo [NO] py 命令不可用
)

echo.
echo ========================================

if %PYTHON_FOUND%==1 (
    echo [SUCCESS] Python环境检测成功！
    echo.
    echo 环境信息:
    echo    推荐命令: %PYTHON_CMD%
    echo    版本信息:
    %PYTHON_CMD% --version
    echo.
    echo 检测pip...
    %PYTHON_CMD% -m pip --version >nul 2>&1
    if not errorlevel 1 (
        echo [OK] pip 可用
        %PYTHON_CMD% -m pip --version
    ) else (
        echo [ERROR] pip 不可用，请重新安装Python
    )
    echo.
    echo 您可以运行 start_service.bat 启动服务了！
) else (
    echo [ERROR] 未检测到Python环境
    echo.
    echo 请按以下步骤安装Python:
    echo.
    echo 1. 访问 https://www.python.org/downloads/
    echo 2. 下载 Python 3.9+ 版本
    echo 3. 运行安装程序
    echo 4. 重要: 勾选 "Add Python to PATH" 选项
    echo 5. 完成安装后重启命令提示符
    echo 6. 重新运行此检测工具
    echo.
    echo 详细安装指南请查看 README.md 文件
)

echo.
echo ========================================
echo 按任意键退出...
pause >nul
