@echo off
title Push to GitHub Safely
color 0A

echo.
echo ========================================
echo     Push to GitHub Safely
echo ========================================
echo.

REM Set Git PATH
set PATH=%PATH%;C:\Program Files\Git\bin;C:\Program Files\Git\cmd

echo [1/4] Checking Git status...
git status

echo.
echo [2/4] Adding any new files...
git add .

echo.
echo [3/4] Creating commit if needed...
git diff --cached --quiet
if errorlevel 1 (
    echo [INFO] Creating commit for new changes...
    git commit -m "docs: add GitHub authorization guide and safe push script"
) else (
    echo [INFO] No new changes to commit
)

echo.
echo [4/4] Pushing to GitHub...
echo.
echo You will be prompted for GitHub credentials:
echo Username: Cery
echo Password: [Use your Personal Access Token - NOT your GitHub password]
echo.
echo Note: Personal Access Token should start with 'github_pat_'
echo.

pause

REM Push to GitHub
git push origin main

if errorlevel 1 (
    echo.
    echo [ERROR] Push failed. Please check:
    echo 1. Repository exists: https://github.com/Cery/vision
    echo 2. Token has correct permissions
    echo 3. Network connection is working
    echo.
    pause
) else (
    echo.
    echo ========================================
    echo           SUCCESS!
    echo ========================================
    echo.
    echo Code successfully pushed to GitHub!
    echo Repository: https://github.com/Cery/vision
    echo.
)

pause
