@echo off
title Image Crawler Service - Final Version
color 0A

echo.
echo ========================================
echo      Image Crawler Service v1.0
echo ========================================
echo.

REM Use the working Python path we discovered
set PYTHON_EXE=C:\Users\Cery\AppData\Local\Programs\Python\Python313\python.exe

echo [INFO] Using Python: %PYTHON_EXE%
echo.

REM Verify Python works
echo [1/4] Verifying Python installation...
"%PYTHON_EXE%" --version
if errorlevel 1 (
    echo [ERROR] Python not working. Please check installation.
    pause
    exit /b 1
)
echo [SUCCESS] Python verified
echo.

REM Check required files
echo [2/4] Checking required files...
if not exist "image_crawler_service.py" (
    echo [ERROR] image_crawler_service.py not found
    echo Please make sure you're in the correct directory
    pause
    exit /b 1
)
echo [SUCCESS] Service file found
echo.

REM Install dependencies (if needed)
echo [3/4] Checking dependencies...
"%PYTHON_EXE%" -c "import flask, flask_cors, requests, bs4, PIL" >nul 2>&1
if errorlevel 1 (
    echo [INFO] Installing missing dependencies...
    "%PYTHON_EXE%" -m pip install flask flask-cors requests beautifulsoup4 pillow lxml
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo [SUCCESS] Dependencies installed
) else (
    echo [SUCCESS] All dependencies available
)
echo.

REM Start service
echo [4/4] Starting service...
echo.
echo ========================================
echo           Service Information
echo ========================================
echo.
echo Service URL: http://localhost:5000
echo Health Check: http://localhost:5000/api/health
echo Frontend Tool: http://localhost:1315/tools/image-processor.html
echo.
echo Press Ctrl+C to stop the service
echo.
echo ========================================
echo Service Log:
echo.

REM Start the Flask application
"%PYTHON_EXE%" image_crawler_service.py

echo.
echo ========================================
echo Service stopped
echo ========================================
pause
