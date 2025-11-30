@echo off
title 一键启动Python抓取服务
color 0A

echo.
echo ========================================
echo        一键启动Python抓取服务
echo ========================================
echo.

echo [INFO] 正在检查Python环境...

REM 检查Python是否可用
python --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Python未安装或未添加到PATH
    echo.
    echo 请先安装Python:
    echo 1. 访问 https://www.python.org/downloads/
    echo 2. 下载Python 3.8+版本
    echo 3. 安装时勾选 "Add Python to PATH"
    echo 4. 重启命令提示符后重新运行此脚本
    echo.
    pause
    exit /b 1
)

echo [OK] Python已安装
python --version

echo.
echo [INFO] 正在检查依赖包...

REM 检查关键依赖
python -c "import flask, requests, bs4, PIL" >nul 2>&1
if errorlevel 1 (
    echo [WARN] 依赖包不完整，正在安装...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        echo [ERROR] 依赖包安装失败
        echo 请检查网络连接或尝试使用国内镜像:
        echo pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
        pause
        exit /b 1
    )
    echo [OK] 依赖包安装完成
) else (
    echo [OK] 依赖包已安装
)

echo.
echo [INFO] 正在启动Python抓取服务...
echo [INFO] 服务地址: http://localhost:5000
echo [INFO] 按 Ctrl+C 停止服务
echo.

REM 启动服务
python image_crawler_service.py

echo.
echo [INFO] 服务已停止
pause
