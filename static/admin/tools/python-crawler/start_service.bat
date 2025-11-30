@echo off
chcp 65001 >nul 2>&1
title 图片抓取服务启动器
color 0A

echo.
echo ========================================
echo           图片抓取服务启动器
echo ========================================
echo 版本: v1.0.0
echo 项目: Vision NDT 图片处理工具
echo ========================================
echo.

REM 显示当前目录
echo 📁 当前目录: %CD%
echo.

REM 检查Python是否安装
echo [1/5] 检查Python环境...
echo.

REM 尝试多种Python命令
python --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ 找到Python命令: python
    python --version
    set PYTHON_CMD=python
    goto :python_found
)

python3 --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ 找到Python命令: python3
    python3 --version
    set PYTHON_CMD=python3
    goto :python_found
)

py --version >nul 2>&1
if not errorlevel 1 (
    echo ✅ 找到Python命令: py
    py --version
    set PYTHON_CMD=py
    goto :python_found
)

REM 如果都没找到Python
echo ❌ 错误: 未找到Python，请先安装Python 3.7+
echo.
echo 🔍 诊断信息:
echo    - 尝试了 python, python3, py 命令
echo    - 都无法找到Python解释器
echo.
echo 📥 解决方案:
echo    1. 下载Python: https://www.python.org/downloads/
echo    2. 安装时勾选 "Add Python to PATH" 选项
echo    3. 重启命令提示符后重试
echo.
echo 📖 详细安装指南请查看 README.md 文件
echo.
echo 按任意键退出...
pause >nul
exit /b 1

:python_found

echo ✅ Python环境检查通过
echo.

REM 检查是否存在虚拟环境
echo [2/5] 检查虚拟环境...
if not exist "venv" (
    echo 📦 创建Python虚拟环境...
    echo    命令: %PYTHON_CMD% -m venv venv
    %PYTHON_CMD% -m venv venv
    if errorlevel 1 (
        echo ❌ 虚拟环境创建失败
        echo.
        echo 🔍 可能的原因:
        echo    - Python版本过低（需要3.7+）
        echo    - 权限不足
        echo    - 磁盘空间不足
        echo.
        echo 按任意键退出...
        pause >nul
        exit /b 1
    )
    echo ✅ 虚拟环境创建成功
) else (
    echo ✅ 虚拟环境已存在
)

echo.

REM 激活虚拟环境
echo [3/5] 激活虚拟环境...
if not exist "venv\Scripts\activate.bat" (
    echo ❌ 虚拟环境激活脚本不存在
    echo    路径: venv\Scripts\activate.bat
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo ❌ 虚拟环境激活失败
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)
echo ✅ 虚拟环境激活成功

echo.

REM 检查requirements.txt文件
echo [4/5] 安装Python依赖包...
if not exist "requirements.txt" (
    echo ❌ 找不到 requirements.txt 文件
    echo    当前目录: %CD%
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

echo 📥 正在安装依赖包，首次运行可能需要几分钟...
echo    文件: requirements.txt
echo.

pip install -r requirements.txt
if errorlevel 1 (
    echo ❌ 依赖包安装失败，尝试使用国内镜像源...
    pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
    if errorlevel 1 (
        echo ❌ 依赖包安装失败
        echo.
        echo 🔍 可能的原因:
        echo    - 网络连接问题
        echo    - pip版本过低
        echo    - 权限不足
        echo.
        echo 💡 建议尝试:
        echo    1. 检查网络连接
        echo    2. 升级pip: python -m pip install --upgrade pip
        echo    3. 使用管理员权限运行
        echo.
        echo 按任意键退出...
        pause >nul
        exit /b 1
    )
)
echo ✅ 依赖包安装完成

echo.

REM 启动服务
echo [5/5] 启动图片抓取服务...

REM 检查服务文件
if not exist "image_crawler_service.py" (
    echo ❌ 找不到服务文件: image_crawler_service.py
    echo    当前目录: %CD%
    echo.
    echo 按任意键退出...
    pause >nul
    exit /b 1
)

echo.
echo ========================================
echo 🚀 服务启动中...
echo 📡 服务地址: http://localhost:5000
echo 🌐 前端工具: http://localhost:1315/tools/image-processor.html
echo 🔍 健康检查: http://localhost:5000/api/health
echo ⏹️  按 Ctrl+C 停止服务
echo ========================================
echo.
echo 📋 服务日志:
echo.

python image_crawler_service.py

echo.
echo ========================================
echo 服务已停止
echo ========================================
echo.
echo 按任意键退出...
pause >nul
