@echo off
title Fix Windows Store Python Issue
color 0C

echo.
echo ========================================
echo    Fix Windows Store Python Issue
echo ========================================
echo.

echo [ISSUE] Windows Store Python stub detected
echo.
echo The system has a Windows Store Python stub that redirects
echo to the Microsoft Store instead of running Python.
echo.
echo [SOLUTION] We need to either:
echo 1. Install proper Python from python.org
echo 2. Disable the Windows Store Python stub
echo.

echo [STEP 1] Checking Windows Store Python stub...
echo.

if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" (
    echo [FOUND] Windows Store Python stub at:
    echo %LOCALAPPDATA%\Microsoft\WindowsApps\python.exe
    echo.
    echo This is likely a stub that redirects to Microsoft Store.
) else (
    echo [NOT FOUND] Windows Store Python stub not found.
)

echo.
echo [STEP 2] Solutions
echo.
echo Choose a solution:
echo.
echo 1. Install Python from python.org (Recommended)
echo 2. Disable Windows Store Python aliases
echo 3. Try to use existing Python installation
echo 4. Exit
echo.

set /p choice="Enter your choice (1-4): "

if "%choice%"=="1" goto :install_python
if "%choice%"=="2" goto :disable_store_aliases
if "%choice%"=="3" goto :find_existing_python
if "%choice%"=="4" goto :exit
goto :invalid_choice

:install_python
echo.
echo [SOLUTION 1] Installing Python from python.org
echo.
echo Opening Python download page...
echo.
echo IMPORTANT STEPS:
echo 1. Download Python 3.9+ from the official website
echo 2. Run the installer
echo 3. CHECK "Add Python to PATH" option
echo 4. CHECK "Disable path length limit" option
echo 5. Complete the installation
echo 6. Restart command prompt
echo 7. Run this tool again to verify
echo.
start https://www.python.org/downloads/
goto :exit

:disable_store_aliases
echo.
echo [SOLUTION 2] Disabling Windows Store Python aliases
echo.
echo This will disable the Windows Store Python redirects.
echo.
echo Steps to disable:
echo 1. Open Windows Settings (Win + I)
echo 2. Go to Apps ^> Apps ^& features
echo 3. Click "App execution aliases" on the right
echo 4. Turn OFF the toggles for:
echo    - App Installer python.exe
echo    - App Installer python3.exe
echo 5. Close Settings
echo 6. Restart command prompt
echo 7. Install Python from python.org
echo.
echo Opening Windows Settings...
start ms-settings:appsfeatures-app
goto :exit

:find_existing_python
echo.
echo [SOLUTION 3] Searching for existing Python installations
echo.

REM Search for Python installations
set FOUND_PYTHON=0

echo Searching common installation paths...
echo.

for %%P in (C:\Python* C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python*) do (
    if exist "%%P\python.exe" (
        echo [FOUND] %%P\python.exe
        "%%P\python.exe" --version 2>nul
        if not errorlevel 1 (
            echo [WORKING] This Python installation works!
            echo.
            echo Creating custom startup script...
            
            REM Create custom script with full path
            (
            echo @echo off
            echo title Image Crawler Service
            echo echo Using Python: %%P\python.exe
            echo echo.
            echo if not exist "venv" ^(
            echo     echo Creating virtual environment...
            echo     "%%P\python.exe" -m venv venv
            echo ^)
            echo call venv\Scripts\activate.bat
            echo pip install -r requirements.txt
            echo echo.
            echo echo Service starting on http://localhost:5000
            echo echo.
            echo "%%P\python.exe" image_crawler_service.py
            echo pause
            ) > start_service_custom.bat
            
            echo [SUCCESS] Created start_service_custom.bat
            echo You can now use this script to start the service!
            set FOUND_PYTHON=1
            goto :exit
        ) else (
            echo [FAILED] This installation doesn't work
        )
        echo.
    )
)

if %FOUND_PYTHON%==0 (
    echo [NOT FOUND] No working Python installation found.
    echo Please install Python from python.org
)

goto :exit

:invalid_choice
echo.
echo [ERROR] Invalid choice. Please enter 1-4.
echo.
pause
goto :start

:exit
echo.
echo ========================================
echo.
echo Next steps:
echo 1. Follow the solution you chose above
echo 2. Restart command prompt after making changes
echo 3. Run diagnose_and_fix.bat to verify the fix
echo.
echo ========================================
echo Press any key to exit...
pause >nul
