@echo off
title Python Environment Diagnosis and Fix Tool
color 0E

echo.
echo ========================================
echo   Python Environment Diagnosis Tool
echo ========================================
echo.

echo [STEP 1] Checking current environment...
echo Current directory: %CD%
echo Current PATH: %PATH%
echo.

echo [STEP 2] Testing Python commands...
echo.

REM Test different Python commands
set PYTHON_FOUND=0
set PYTHON_CMD=

echo Testing 'python'...
python --version >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] python command works
    python --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=python
    goto :python_works
) else (
    echo [FAILED] python command failed
)

echo.
echo Testing 'python3'...
python3 --version >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] python3 command works
    python3 --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=python3
    goto :python_works
) else (
    echo [FAILED] python3 command failed
)

echo.
echo Testing 'py'...
py --version >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] py command works
    py --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=py
    goto :python_works
) else (
    echo [FAILED] py command failed
)

echo.
echo [STEP 3] Searching for Python installations...
echo.

REM Search common Python installation paths
set SEARCH_PATHS=C:\Python* C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python* "C:\Program Files\Python*" "C:\Program Files (x86)\Python*"

for %%P in (%SEARCH_PATHS%) do (
    if exist "%%P\python.exe" (
        echo [FOUND] Python installation at: %%P
        echo Testing: "%%P\python.exe" --version
        "%%P\python.exe" --version 2>nul
        if not errorlevel 1 (
            echo [SUCCESS] This Python installation works!
            set PYTHON_FOUND=1
            set PYTHON_CMD="%%P\python.exe"
            goto :python_works
        )
    )
)

REM Check Windows Store Python
if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" (
    echo [FOUND] Windows Store Python at: %LOCALAPPDATA%\Microsoft\WindowsApps\python.exe
    "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" --version 2>nul
    if not errorlevel 1 (
        echo [SUCCESS] Windows Store Python works!
        set PYTHON_FOUND=1
        set PYTHON_CMD="%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe"
        goto :python_works
    )
)

echo.
echo [STEP 4] No working Python found
echo.
echo Possible solutions:
echo 1. Python is not installed
echo 2. Python is installed but not in PATH
echo 3. Python installation is corrupted
echo.
echo Recommended actions:
echo 1. Download Python from https://www.python.org/downloads/
echo 2. During installation, CHECK "Add Python to PATH"
echo 3. If already installed, try repairing the installation
echo 4. Restart command prompt after installation
echo.
goto :end

:python_works
echo.
echo ========================================
echo [SUCCESS] Python is working!
echo ========================================
echo.
echo Python command: %PYTHON_CMD%
echo.

echo [STEP 4] Testing pip...
%PYTHON_CMD% -m pip --version >nul 2>&1
if not errorlevel 1 (
    echo [SUCCESS] pip is working
    %PYTHON_CMD% -m pip --version
) else (
    echo [FAILED] pip is not working
    echo Try: %PYTHON_CMD% -m ensurepip --upgrade
)

echo.
echo [STEP 5] Creating fixed startup script...
echo.

REM Create a custom startup script with the working Python command
(
echo @echo off
echo title Image Crawler Service - Fixed Version
echo echo Starting Image Crawler Service...
echo echo Python command: %PYTHON_CMD%
echo echo.
echo.
echo REM Create virtual environment
echo if not exist "venv" ^(
echo     echo Creating virtual environment...
echo     %PYTHON_CMD% -m venv venv
echo ^)
echo.
echo REM Activate virtual environment
echo echo Activating virtual environment...
echo call venv\Scripts\activate.bat
echo.
echo REM Install dependencies
echo echo Installing dependencies...
echo pip install -r requirements.txt
echo.
echo REM Start service
echo echo.
echo echo ========================================
echo echo Service starting on http://localhost:5000
echo echo Frontend: http://localhost:1315/tools/image-processor.html
echo echo Press Ctrl+C to stop
echo echo ========================================
echo echo.
echo %PYTHON_CMD% image_crawler_service.py
echo.
echo echo Service stopped.
echo pause
) > start_service_fixed.bat

echo [SUCCESS] Created start_service_fixed.bat
echo.
echo You can now use start_service_fixed.bat to start the service!
echo.

:end
echo ========================================
echo Press any key to exit...
pause >nul
