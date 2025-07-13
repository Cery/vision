@echo off
title Image Crawler Service - Working Version
color 0A

echo.
echo ========================================
echo     Image Crawler Service (Working)
echo ========================================
echo.

REM Use the Python installation we found
set PYTHON_PATH=C:\Users\Cery\AppData\Local\Programs\Python\Python313\python.exe

echo [INFO] Using Python installation:
echo %PYTHON_PATH%
echo.

REM Verify Python works
echo [1/5] Verifying Python installation...
"%PYTHON_PATH%" --version
if errorlevel 1 (
    echo [ERROR] Python verification failed
    echo Please check if Python is properly installed
    pause
    exit /b 1
)
echo [SUCCESS] Python verification passed
echo.

REM Check current directory
echo [2/5] Checking current directory...
echo Current directory: %CD%
if not exist "requirements.txt" (
    echo [ERROR] requirements.txt not found
    echo Please make sure you're in the correct directory
    pause
    exit /b 1
)
if not exist "image_crawler_service.py" (
    echo [ERROR] image_crawler_service.py not found
    echo Please make sure you're in the correct directory
    pause
    exit /b 1
)
echo [SUCCESS] Required files found
echo.

REM Create virtual environment
echo [3/5] Setting up virtual environment...
if not exist "venv" (
    echo Creating virtual environment...
    "%PYTHON_PATH%" -m venv venv
    if errorlevel 1 (
        echo [ERROR] Failed to create virtual environment
        pause
        exit /b 1
    )
    echo [SUCCESS] Virtual environment created
) else (
    echo [INFO] Virtual environment already exists
)
echo.

REM Activate virtual environment
echo [4/5] Activating virtual environment...
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment activation script not found
    pause
    exit /b 1
)

call venv\Scripts\activate.bat
if errorlevel 1 (
    echo [ERROR] Failed to activate virtual environment
    pause
    exit /b 1
)
echo [SUCCESS] Virtual environment activated
echo.

REM Install dependencies
echo [5/5] Installing dependencies...
echo Installing required packages...
pip install -r requirements.txt
if errorlevel 1 (
    echo [WARNING] Some packages failed to install, trying with mirror...
    pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/
    if errorlevel 1 (
        echo [ERROR] Failed to install dependencies
        echo Please check your internet connection
        pause
        exit /b 1
    )
)
echo [SUCCESS] Dependencies installed
echo.

REM Start the service
echo ========================================
echo           Service Starting
echo ========================================
echo.
echo Service URL: http://localhost:5000
echo Health Check: http://localhost:5000/api/health
echo Frontend Tool: http://localhost:1315/tools/image-processor.html
echo.
echo Press Ctrl+C to stop the service
echo.
echo ========================================
echo.

REM Start the Flask service
python image_crawler_service.py

echo.
echo ========================================
echo Service has stopped
echo ========================================
echo.
pause
