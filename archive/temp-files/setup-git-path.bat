@echo off
title Setup Git PATH Environment Variable
color 0A

echo.
echo ========================================
echo     Setup Git PATH Environment Variable
echo ========================================
echo.

REM Check if running as administrator
net session >nul 2>&1
if %errorLevel% == 0 (
    echo [INFO] Running as Administrator - can modify system PATH
    set ADMIN_MODE=1
) else (
    echo [INFO] Running as User - will modify user PATH only
    set ADMIN_MODE=0
)

echo.

REM Check Git installation
echo [1/4] Checking Git installation...
if exist "C:\Program Files\Git\bin\git.exe" (
    echo [SUCCESS] Found Git at: C:\Program Files\Git\bin\git.exe
    set GIT_PATH=C:\Program Files\Git\bin
    set GIT_CMD_PATH=C:\Program Files\Git\cmd
) else (
    echo [ERROR] Git not found at expected location
    echo Please check your Git installation
    pause
    exit /b 1
)

echo.

REM Check current PATH
echo [2/4] Checking current PATH...
echo %PATH% | findstr /i "Git" >nul
if %errorlevel% == 0 (
    echo [INFO] Git paths already in PATH
    echo Current Git paths in PATH:
    for %%i in ("%PATH:;=" "%") do (
        echo %%i | findstr /i "Git" >nul
        if not errorlevel 1 echo   %%i
    )
    echo.
    echo Do you want to continue anyway? (y/n)
    set /p continue_choice="Enter choice: "
    if /i not "%continue_choice%"=="y" if /i not "%continue_choice%"=="yes" goto :end
) else (
    echo [INFO] Git not found in current PATH
)

echo.

REM Add Git to PATH
echo [3/4] Adding Git to PATH...

if %ADMIN_MODE% == 1 (
    echo [INFO] Adding to system PATH (all users)...
    
    REM Get current system PATH
    for /f "tokens=2*" %%A in ('reg query "HKLM\SYSTEM\CurrentControlSet\Control\Session Manager\Environment" /v PATH 2^>nul') do set SYSTEM_PATH=%%B
    
    REM Check if already in system PATH
    echo %SYSTEM_PATH% | findstr /i "Git" >nul
    if %errorlevel% == 0 (
        echo [INFO] Git already in system PATH
    ) else (
        echo [INFO] Adding Git to system PATH...
        setx PATH "%SYSTEM_PATH%;%GIT_PATH%;%GIT_CMD_PATH%" /M >nul 2>&1
        if %errorlevel% == 0 (
            echo [SUCCESS] Git added to system PATH
        ) else (
            echo [WARNING] Failed to add to system PATH, trying user PATH...
            goto :user_path
        )
    )
) else (
    :user_path
    echo [INFO] Adding to user PATH...
    
    REM Get current user PATH
    for /f "tokens=2*" %%A in ('reg query "HKCU\Environment" /v PATH 2^>nul') do set USER_PATH=%%B
    if "%USER_PATH%"=="" set USER_PATH=%PATH%
    
    REM Check if already in user PATH
    echo %USER_PATH% | findstr /i "Git" >nul
    if %errorlevel% == 0 (
        echo [INFO] Git already in user PATH
    ) else (
        echo [INFO] Adding Git to user PATH...
        setx PATH "%USER_PATH%;%GIT_PATH%;%GIT_CMD_PATH%" >nul 2>&1
        if %errorlevel% == 0 (
            echo [SUCCESS] Git added to user PATH
        ) else (
            echo [ERROR] Failed to add Git to PATH
            pause
            exit /b 1
        )
    )
)

echo.

REM Test Git command
echo [4/4] Testing Git command...
echo [INFO] Current session PATH may not be updated yet
echo [INFO] Testing with full path...

"C:\Program Files\Git\bin\git.exe" --version >nul 2>&1
if %errorlevel% == 0 (
    echo [SUCCESS] Git executable works
    "C:\Program Files\Git\bin\git.exe" --version
) else (
    echo [ERROR] Git executable test failed
    pause
    exit /b 1
)

echo.

REM Instructions for user
echo ========================================
echo           Setup Complete!
echo ========================================
echo.
echo Git has been added to your PATH environment variable.
echo.
echo IMPORTANT: You need to restart your command prompt
echo (or PowerShell) for the changes to take effect.
echo.
echo After restarting, you should be able to use:
echo   git --version
echo   git status
echo   git init
echo.
echo Next steps:
echo 1. Close this window
echo 2. Open a new command prompt or PowerShell
echo 3. Run: git --version
echo 4. If it works, run: setup-git-repository.bat
echo.

:end
echo Press any key to exit...
pause >nul
