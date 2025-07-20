@echo off
title Vision NDT Hugo Development Server
color 0A

echo.
echo ========================================
echo     Vision NDT Hugo Development Server
echo ========================================
echo.

echo [INFO] Starting Hugo development server...
echo [INFO] Website will be available at: http://localhost:1315
echo [INFO] Press Ctrl+C to stop the server
echo.

REM Start Hugo server with draft content
.\hugo.exe server -D --port 1315

echo.
echo [INFO] Hugo server stopped
pause
