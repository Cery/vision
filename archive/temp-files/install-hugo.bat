@echo off
echo ========================================
echo Hugo 安装脚本 - Windows
echo ========================================

echo.
echo 检查是否已安装 Hugo...
hugo version >nul 2>&1
if %errorlevel% == 0 (
    echo ✓ Hugo 已安装在系统中
    hugo version
    goto :end
)

if exist hugo.exe (
    echo ✓ Hugo 可执行文件已存在
    hugo.exe version
    goto :end
)

echo.
echo 正在下载 Hugo Extended v0.147.1...
curl -L -o hugo.zip "https://github.com/gohugoio/hugo/releases/download/v0.147.1/hugo_extended_0.147.1_windows-amd64.zip"

if %errorlevel% neq 0 (
    echo ✗ 下载失败，请检查网络连接
    pause
    exit /b 1
)

echo.
echo 正在解压 Hugo...
powershell -command "Expand-Archive -Path 'hugo.zip' -DestinationPath '.' -Force"

if %errorlevel% neq 0 (
    echo ✗ 解压失败
    pause
    exit /b 1
)

echo.
echo 清理临时文件...
del hugo.zip

echo.
echo ✓ Hugo 安装完成！
hugo.exe version

:end
echo.
echo ========================================
echo 安装完成！现在可以运行 start-dev.bat
echo ========================================
pause
