@echo off
title Python Environment Check

echo.
echo ========================================
echo         Python Environment Check
echo ========================================
echo.

echo Checking Python environment...
echo.

REM Check Python commands
set PYTHON_FOUND=0

echo [1] Checking python command...
python --version >nul 2>&1
if not errorlevel 1 (
    echo [OK] python command available
    python --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=python
) else (
    echo [NO] python command not found
)

echo.
echo [2] Checking python3 command...
python3 --version >nul 2>&1
if not errorlevel 1 (
    echo [OK] python3 command available
    python3 --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=python3
) else (
    echo [NO] python3 command not found
)

echo.
echo [3] Checking py command...
py --version >nul 2>&1
if not errorlevel 1 (
    echo [OK] py command available
    py --version
    set PYTHON_FOUND=1
    set PYTHON_CMD=py
) else (
    echo [NO] py command not found
)

echo.
echo ========================================

if %PYTHON_FOUND%==1 (
    echo [SUCCESS] Python environment detected!
    echo.
    echo Environment info:
    echo    Recommended command: %PYTHON_CMD%
    echo    Version: 
    %PYTHON_CMD% --version
    echo.
    echo Checking pip...
    %PYTHON_CMD% -m pip --version >nul 2>&1
    if not errorlevel 1 (
        echo [OK] pip available
        %PYTHON_CMD% -m pip --version
    ) else (
        echo [ERROR] pip not available
    )
    echo.
    echo You can now run start_service.bat to start the service!
) else (
    echo [ERROR] No Python environment found
    echo.
    echo Please install Python:
    echo.
    echo 1. Visit https://www.python.org/downloads/
    echo 2. Download Python 3.9+ version
    echo 3. Run the installer
    echo 4. IMPORTANT: Check "Add Python to PATH" option
    echo 5. Restart command prompt after installation
    echo 6. Run this check tool again
    echo.
    echo See README.md for detailed installation guide
)

echo.
echo ========================================
echo Press any key to exit...
pause >nul
