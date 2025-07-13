@echo off
title 快速启动图片抓取服务
echo 快速启动图片抓取服务...
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo 错误: 未找到Python
    echo 请先运行 check_python.bat 检测环境
    pause
    exit /b 1
)

REM 创建虚拟环境（如果不存在）
if not exist "venv" (
    echo 创建虚拟环境...
    python -m venv venv
)

REM 激活虚拟环境
call venv\Scripts\activate.bat

REM 安装依赖
echo 安装依赖包...
pip install -r requirements.txt -q

REM 启动服务
echo.
echo 启动服务: http://localhost:5000
echo 前端工具: http://localhost:1315/tools/image-processor.html
echo 按 Ctrl+C 停止服务
echo.

python image_crawler_service.py
