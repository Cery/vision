@echo off
chcp 65001 >nul
title Vision NDT 综合测试服务

echo.
echo ========================================
echo   Vision NDT 综合测试服务启动器
echo ========================================
echo.

REM 检查Python
python --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Python未安装或未添加到PATH
    echo 请先安装Python 3.8+并添加到环境变量
    pause
    exit /b 1
)

echo ✅ Python已安装
python --version

echo.
echo 📦 检查依赖包...

REM 检查关键依赖
python -c "import flask, requests, selenium, psutil, pytest" >nul 2>&1
if errorlevel 1 (
    echo ⚠️  依赖包不完整，正在安装...
    echo.
    pip install -r requirements.txt
    if errorlevel 1 (
        echo ❌ 依赖包安装失败
        echo 请检查网络连接或尝试使用国内镜像:
        echo pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
        pause
        exit /b 1
    )
    echo ✅ 依赖包安装完成
) else (
    echo ✅ 依赖包已安装
)

echo.
echo 🌐 检查Chrome浏览器...

REM 检查Chrome是否安装
where chrome >nul 2>&1
if errorlevel 1 (
    where "C:\Program Files\Google\Chrome\Application\chrome.exe" >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Chrome浏览器未找到
        echo 前端测试功能可能受限
        echo 建议安装Chrome浏览器以获得完整测试功能
    ) else (
        echo ✅ Chrome浏览器已安装
    )
) else (
    echo ✅ Chrome浏览器已安装
)

echo.
echo 🚀 启动综合测试服务...
echo 📍 服务地址: http://localhost:5002
echo 📖 API文档:
echo   GET  /health - 健康检查
echo   POST /test/frontend - 前端测试
echo   POST /test/backend - 后端测试
echo   POST /test/performance - 性能测试
echo   POST /test/comprehensive - 全面测试
echo.
echo ⏹️  按 Ctrl+C 停止服务
echo.

REM 启动服务
python comprehensive_test_service.py

echo.
echo 📊 服务已停止
pause
