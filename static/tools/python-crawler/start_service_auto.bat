@echo off
title Image Crawler Service - Auto Detection
color 0A

echo.
echo ========================================
echo   Image Crawler Service (Auto-Detect)
echo ========================================
echo.

REM Auto-detect Python installation
set PYTHON_EXE=
set PYTHON_FOUND=0

echo [1/5] Auto-detecting Python installation...
echo.

REM Try standard commands first
python --version >nul 2>&1
if not errorlevel 1 (
    echo [FOUND] Standard python command works
    python --version
    set PYTHON_EXE=python
    set PYTHON_FOUND=1
    goto :python_detected
)

py --version >nul 2>&1
if not errorlevel 1 (
    echo [FOUND] Python launcher (py) works
    py --version
    set PYTHON_EXE=py
    set PYTHON_FOUND=1
    goto :python_detected
)

REM Search for Python installations
echo [INFO] Searching for Python installations...

REM Check common installation paths
for /d %%i in (C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python*) do (
    if exist "%%i\python.exe" (
        echo [TESTING] %%i\python.exe
        "%%i\python.exe" --version >nul 2>&1
        if not errorlevel 1 (
            echo [SUCCESS] Found working Python at %%i
            "%%i\python.exe" --version
            set PYTHON_EXE="%%i\python.exe"
            set PYTHON_FOUND=1
            goto :python_detected
        )
    )
)

REM Check system-wide installations
for /d %%i in (C:\Python*) do (
    if exist "%%i\python.exe" (
        echo [TESTING] %%i\python.exe
        "%%i\python.exe" --version >nul 2>&1
        if not errorlevel 1 (
            echo [SUCCESS] Found working Python at %%i
            "%%i\python.exe" --version
            set PYTHON_EXE="%%i\python.exe"
            set PYTHON_FOUND=1
            goto :python_detected
        )
    )
)

REM If no Python found
if %PYTHON_FOUND%==0 (
    echo [ERROR] No working Python installation found
    echo.
    echo Please install Python from https://www.python.org/downloads/
    echo Make sure to check "Add Python to PATH" during installation
    echo.
    pause
    exit /b 1
)

:python_detected
echo.
echo [SUCCESS] Using Python: %PYTHON_EXE%
echo.

REM Check required files
echo [2/5] Checking required files...
if not exist "image_crawler_service.py" (
    echo [ERROR] image_crawler_service.py not found
    echo Current directory: %CD%
    pause
    exit /b 1
)
echo [SUCCESS] Service file found
echo.

REM Check dependencies
echo [3/5] Checking dependencies...
%PYTHON_EXE% -c "import flask, flask_cors, requests, bs4, PIL" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing dependencies...
    %PYTHON_EXE% -m pip install flask flask-cors requests beautifulsoup4 pillow lxml
    if errorlevel 1 (
        echo [WARNING] Installation failed, trying with mirror...
        %PYTHON_EXE% -m pip install flask flask-cors requests beautifulsoup4 pillow lxml -i https://pypi.tuna.tsinghua.edu.cn/simple/
    )
) else (
    echo [SUCCESS] All dependencies available
)
echo.

REM Test service file
echo [4/5] Testing service file...
%PYTHON_EXE% -c "import image_crawler_service" >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Service file has errors
    echo Please check image_crawler_service.py
    pause
    exit /b 1
)
echo [SUCCESS] Service file is valid
echo.

REM Start service
echo [5/5] Starting service...
echo.
echo ========================================
echo           Service Starting
echo ========================================
echo.
echo Service URL: http://localhost:5000
echo Health Check: http://localhost:5000/api/health
echo Frontend: http://localhost:1315/tools/image-processor.html
echo.
echo Press Ctrl+C to stop
echo.
echo ========================================
echo.

%PYTHON_EXE% image_crawler_service.py

echo.
echo Service stopped.
pause
