@echo off
chcp 65001 >nul
title Vision NDT Development Environment Check
color 0A

echo.
echo ========================================
echo     Vision NDT Development Environment Check
echo ========================================
echo.

set ISSUES=0
set WARNINGS=0

echo [1/8] Checking Git...
git --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Git not installed or not in PATH
    set /a ISSUES+=1
) else (
    echo ✅ Git installed
    git --version
    
    git config user.name >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Git username not configured
        set /a WARNINGS+=1
    ) else (
        echo ✅ Git username configured
    )
    
    git config user.email >nul 2>&1
    if errorlevel 1 (
        echo ⚠️  Git email not configured
        set /a WARNINGS+=1
    ) else (
        echo ✅ Git email configured
    )
)

echo.
echo [2/8] Checking Hugo...
hugo version >nul 2>&1
if errorlevel 1 (
    echo ❌ Hugo not installed or not in PATH
    set /a ISSUES+=1
) else (
    echo ✅ Hugo installed
    hugo version
    
    hugo version | findstr /i "extended" >nul
    if errorlevel 1 (
        echo ⚠️  Recommend Hugo Extended version
        set /a WARNINGS+=1
    ) else (
        echo ✅ Hugo Extended version detected
    )
)

echo.
echo [3/8] Checking Node.js...
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js not installed or not in PATH
    set /a ISSUES+=1
) else (
    echo ✅ Node.js installed
    node --version
)

npm --version >nul 2>&1
if errorlevel 1 (
    echo ❌ npm not installed
    set /a ISSUES+=1
) else (
    echo ✅ npm installed
    npm --version
)

echo.
echo [4/8] Checking Python...
python --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Python not installed (needed for image crawler)
    set /a WARNINGS+=1
) else (
    echo ✅ Python installed
    python --version
)

pip --version >nul 2>&1
if errorlevel 1 (
    echo ⚠️  pip not installed
    set /a WARNINGS+=1
) else (
    echo ✅ pip installed
    pip --version
)

echo.
echo [5/8] Checking project files...
if exist "package.json" (
    echo ✅ package.json exists
) else (
    echo ⚠️  package.json not found
    set /a WARNINGS+=1
)

if exist "hugo.toml" (
    echo ✅ Hugo config file exists
) else (
    echo ❌ Hugo config file not found
    set /a ISSUES+=1
)

if exist "node_modules" (
    echo ✅ node_modules directory exists
) else (
    echo ⚠️  node_modules not found, run 'npm install'
    set /a WARNINGS+=1
)

echo.
echo [6/8] Checking project structure...
if exist "content" (
    echo ✅ content directory exists
) else (
    echo ❌ content directory not found
    set /a ISSUES+=1
)

if exist "layouts" (
    echo ✅ layouts directory exists
) else (
    echo ❌ layouts directory not found
    set /a ISSUES+=1
)

if exist "static" (
    echo ✅ static directory exists
) else (
    echo ❌ static directory not found
    set /a ISSUES+=1
)

echo.
echo [7/8] Checking environment variables...
echo %PATH% | findstr /i "git" >nul && echo ✅ Git in PATH || echo ⚠️  Git may not be in PATH
echo %PATH% | findstr /i "hugo" >nul && echo ✅ Hugo in PATH || echo ⚠️  Hugo may not be in PATH
echo %PATH% | findstr /i "node" >nul && echo ✅ Node.js in PATH || echo ⚠️  Node.js may not be in PATH

echo.
echo [8/8] Checking development ports...
netstat -an | findstr ":1315" >nul
if not errorlevel 1 (
    echo ⚠️  Port 1315 is in use (Hugo default port)
    set /a WARNINGS+=1
) else (
    echo ✅ Port 1315 available
)

netstat -an | findstr ":5000" >nul
if not errorlevel 1 (
    echo ⚠️  Port 5000 is in use (Python service port)
    set /a WARNINGS+=1
) else (
    echo ✅ Port 5000 available
)

echo.
echo ========================================
echo           Summary
echo ========================================
echo.

if %ISSUES% EQU 0 (
    echo ✅ No critical issues found
) else (
    echo ❌ Found %ISSUES% critical issues that need to be resolved
)

if %WARNINGS% EQU 0 (
    echo ✅ No warnings
) else (
    echo ⚠️  Found %WARNINGS% warnings that should be addressed
)

echo.
echo Recommended next steps:
echo 1. Run 'hugo server --port 1315' to start development server
echo 2. Visit http://localhost:1315 to view the website
echo 3. Start Python service if image crawler is needed
echo 4. Run 'npm install' if node_modules is missing

echo.
pause
