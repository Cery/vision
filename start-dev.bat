@echo off
echo ========================================
echo 维森视觉检测仪器网站 - 开发环境启动
echo ========================================

echo.
echo 检查 Hugo 是否可用...
if exist hugo.exe (
    echo ✓ Hugo 已找到
) else (
    echo ✗ Hugo 未找到，请先运行安装脚本
    pause
    exit /b 1
)

echo.
echo 检查 Node.js 依赖...
if exist node_modules (
    echo ✓ Node.js 依赖已安装
) else (
    echo 正在安装 Node.js 依赖...
    npm install
)

echo.
echo 启动开发服务器...
echo.

echo 启动 Hugo 开发服务器 (端口 1313)...
start "Hugo Server" cmd /k "hugo.exe server -D --bind 0.0.0.0"

timeout /t 3 /nobreak >nul

echo 启动 Node.js 后端服务器 (端口 3002)...
start "Node Server" cmd /k "node server.js"

timeout /t 2 /nobreak >nul

echo.
echo ========================================
echo 开发环境已启动！
echo ========================================
echo.
echo 前端网站: http://localhost:1313
echo CMS 管理: http://localhost:1313/admin
echo 后端 API: http://localhost:3002
echo.
echo 按任意键打开浏览器...
pause >nul

start http://localhost:1313

echo.
echo 开发环境正在运行...
echo 关闭此窗口将停止所有服务器
pause
