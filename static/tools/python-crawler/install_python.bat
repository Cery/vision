@echo off
title Python Installation Helper

echo.
echo ========================================
echo         Python Installation Helper
echo ========================================
echo.

echo This tool will help you install Python for the image crawler service.
echo.

REM Check if Python is already installed
python --version >nul 2>&1
if not errorlevel 1 (
    echo [INFO] Python is already installed:
    python --version
    echo.
    echo You can run start_service.bat to start the service.
    echo.
    echo Press any key to exit...
    pause >nul
    exit /b 0
)

echo [INFO] Python is not installed on this system.
echo.
echo ========================================
echo         Installation Options
echo ========================================
echo.
echo 1. Download Python from official website
echo 2. Install Python from Microsoft Store
echo 3. Check installation guide
echo 4. Exit
echo.

set /p choice="Please select an option (1-4): "

if "%choice%"=="1" goto :download_official
if "%choice%"=="2" goto :microsoft_store
if "%choice%"=="3" goto :installation_guide
if "%choice%"=="4" goto :exit
goto :invalid_choice

:download_official
echo.
echo Opening Python official download page...
echo URL: https://www.python.org/downloads/
echo.
echo IMPORTANT INSTALLATION STEPS:
echo 1. Download Python 3.9+ version
echo 2. Run the installer
echo 3. CHECK "Add Python to PATH" option
echo 4. Click "Install Now"
echo 5. Wait for installation to complete
echo 6. Restart command prompt
echo 7. Run check_python_simple.bat to verify
echo.
start https://www.python.org/downloads/
goto :exit

:microsoft_store
echo.
echo Opening Microsoft Store Python page...
echo.
echo This will install Python from Microsoft Store.
echo The PATH will be configured automatically.
echo.
start ms-windows-store://pdp/?productid=9NRWMJP3717K
goto :exit

:installation_guide
echo.
echo ========================================
echo         Installation Guide
echo ========================================
echo.
echo Step 1: Download Python
echo   - Visit: https://www.python.org/downloads/
echo   - Click the yellow "Download Python 3.x.x" button
echo   - Save the installer file
echo.
echo Step 2: Install Python
echo   - Run the downloaded installer
echo   - IMPORTANT: Check "Add Python to PATH"
echo   - Click "Install Now"
echo   - Wait for installation to complete
echo.
echo Step 3: Verify Installation
echo   - Open new command prompt
echo   - Type: python --version
echo   - Should show Python version number
echo.
echo Step 4: Start Service
echo   - Run: start_service.bat
echo   - Wait for dependencies to install
echo   - Service will start on http://localhost:5000
echo.
goto :exit

:invalid_choice
echo.
echo [ERROR] Invalid choice. Please select 1-4.
echo.
pause
goto :start

:exit
echo.
echo Press any key to exit...
pause >nul
