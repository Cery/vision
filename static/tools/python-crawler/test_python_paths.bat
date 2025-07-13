@echo off
title Test Python Paths
echo Testing different Python paths...
echo.

echo [1] Testing standard python command...
python --version
echo Error level: %errorlevel%
echo.

echo [2] Testing python3 command...
python3 --version
echo Error level: %errorlevel%
echo.

echo [3] Testing py command...
py --version
echo Error level: %errorlevel%
echo.

echo [4] Testing Windows Store Python directly...
if exist "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" (
    echo Found Windows Store Python, testing...
    "%LOCALAPPDATA%\Microsoft\WindowsApps\python.exe" --version
    echo Error level: %errorlevel%
) else (
    echo Windows Store Python not found
)
echo.

echo [5] Searching for Python installations...
for /d %%i in (C:\Python*) do (
    if exist "%%i\python.exe" (
        echo Found: %%i\python.exe
        "%%i\python.exe" --version
    )
)

for /d %%i in (C:\Users\%USERNAME%\AppData\Local\Programs\Python\Python*) do (
    if exist "%%i\python.exe" (
        echo Found: %%i\python.exe
        "%%i\python.exe" --version
    )
)

echo.
echo [6] Checking PATH environment...
echo PATH=%PATH%
echo.

echo [7] Checking if python.exe exists in PATH directories...
for %%i in (python.exe) do (
    echo Found python.exe at: %%~$PATH:i
)

echo.
echo Test complete.
pause
