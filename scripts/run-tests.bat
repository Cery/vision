@echo off
REM Vision NDT 全业务流程测试启动脚本 (Windows)

echo ========================================
echo Vision NDT 全业务流程测试
echo ========================================
echo.

REM 检查环境
echo [1/3] 检查测试环境...
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo 错误: 未找到 Node.js，请先安装 Node.js
    pause
    exit /b 1
)

where hugo >nul 2>&1
if %errorlevel% neq 0 (
    echo 警告: 未找到 Hugo，将跳过前端测试
)

echo [2/3] 选择测试环境...
echo 1. 本地开发环境 (localhost:8787)
echo 2. 生产环境 (api.visndt.com)
echo.
set /p choice="请选择 (1 或 2): "

if "%choice%"=="1" (
    set ENV=local
    echo 使用本地环境测试
) else if "%choice%"=="2" (
    set ENV=production
    echo 使用生产环境测试
) else (
    echo 无效选择，使用本地环境
    set ENV=local
)

echo.
echo [3/3] 运行测试...
echo.

cd /d %~dp0
node test-full-workflow.js %ENV%

echo.
echo ========================================
echo 测试完成
echo ========================================
pause

