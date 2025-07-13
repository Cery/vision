@echo off
title Git Repository Setup for Vision NDT
color 0A

echo.
echo ========================================
echo     Git Repository Setup for Vision NDT
echo ========================================
echo.

REM Check if Git is installed
echo [1/6] Checking Git installation...
git --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Git is not installed or not in PATH
    echo.
    echo Please install Git first:
    echo 1. Visit https://git-scm.com/download/windows
    echo 2. Download and install Git for Windows
    echo 3. Make sure to check "Add Git to PATH" during installation
    echo 4. Restart command prompt and run this script again
    echo.
    echo Opening Git download page...
    start https://git-scm.com/download/windows
    pause
    exit /b 1
) else (
    echo [SUCCESS] Git is installed
    git --version
)

echo.

REM Check if already a Git repository
echo [2/6] Checking if directory is already a Git repository...
if exist ".git" (
    echo [INFO] This directory is already a Git repository
    echo.
    echo Current status:
    git status --porcelain
    echo.
    echo Do you want to add and commit all changes? (y/n)
    set /p commit_choice="Enter choice: "
    if /i "%commit_choice%"=="y" goto :commit_changes
    if /i "%commit_choice%"=="yes" goto :commit_changes
    goto :push_changes
) else (
    echo [INFO] Not a Git repository yet, will initialize
)

echo.

REM Initialize Git repository
echo [3/6] Initializing Git repository...
git init
if errorlevel 1 (
    echo [ERROR] Failed to initialize Git repository
    pause
    exit /b 1
)
echo [SUCCESS] Git repository initialized

echo.

REM Configure Git (if not already configured)
echo [4/6] Checking Git configuration...
git config user.name >nul 2>&1
if errorlevel 1 (
    echo [INFO] Git user not configured
    set /p git_name="Enter your name: "
    set /p git_email="Enter your email: "
    git config --global user.name "%git_name%"
    git config --global user.email "%git_email%"
    echo [SUCCESS] Git user configured
) else (
    echo [INFO] Git user already configured:
    echo Name: 
    git config user.name
    echo Email: 
    git config user.email
)

echo.

:commit_changes
REM Add and commit files
echo [5/6] Adding and committing files...
echo [INFO] Adding all files to Git...
git add .

echo [INFO] Creating initial commit...
git commit -m "feat: Complete Vision NDT project with Python image crawler

- Hugo static site with responsive design
- Python Flask image crawler service with web interface
- Image processing tools with URL auto-correction
- Exhibition content management system
- SEO optimization and performance improvements
- Mobile-responsive design
- Comprehensive documentation and setup guides"

if errorlevel 1 (
    echo [WARNING] Commit failed or no changes to commit
) else (
    echo [SUCCESS] Files committed successfully
)

echo.

:push_changes
REM Setup remote repository
echo [6/6] Setting up remote repository...
echo.
echo Choose your Git hosting service:
echo 1. GitHub
echo 2. GitLab
echo 3. Skip remote setup (local only)
echo 4. Custom remote URL
echo.

set /p remote_choice="Enter choice (1-4): "

if "%remote_choice%"=="1" goto :setup_github
if "%remote_choice%"=="2" goto :setup_gitlab
if "%remote_choice%"=="3" goto :local_only
if "%remote_choice%"=="4" goto :custom_remote
goto :invalid_choice

:setup_github
echo.
echo [INFO] Setting up GitHub repository...
echo.
echo Please follow these steps:
echo 1. Go to https://github.com
echo 2. Click "New repository"
echo 3. Repository name: vision-ndt
echo 4. Description: Vision NDT - Professional NDT Equipment and Services Website
echo 5. Choose Public or Private
echo 6. Do NOT initialize with README
echo 7. Click "Create repository"
echo 8. Copy the repository URL (https://github.com/username/vision-ndt.git)
echo.
echo Opening GitHub...
start https://github.com/new
echo.
set /p github_url="Enter the repository URL: "
git remote add origin "%github_url%"
goto :push_to_remote

:setup_gitlab
echo.
echo [INFO] Setting up GitLab repository...
echo.
echo Please follow these steps:
echo 1. Go to https://gitlab.com
echo 2. Click "New project"
echo 3. Choose "Create blank project"
echo 4. Project name: vision-ndt
echo 5. Description: Vision NDT - Professional NDT Equipment and Services Website
echo 6. Choose visibility level
echo 7. Click "Create project"
echo 8. Copy the repository URL (https://gitlab.com/username/vision-ndt.git)
echo.
echo Opening GitLab...
start https://gitlab.com/projects/new
echo.
set /p gitlab_url="Enter the repository URL: "
git remote add origin "%gitlab_url%"
goto :push_to_remote

:custom_remote
echo.
set /p custom_url="Enter the remote repository URL: "
git remote add origin "%custom_url%"
goto :push_to_remote

:push_to_remote
echo.
echo [INFO] Pushing to remote repository...
git branch -M main
git push -u origin main
if errorlevel 1 (
    echo [WARNING] Push failed. This might be due to:
    echo - Authentication issues
    echo - Network problems
    echo - Repository access permissions
    echo.
    echo You can try pushing manually later with:
    echo git push -u origin main
) else (
    echo [SUCCESS] Successfully pushed to remote repository!
)
goto :completion

:local_only
echo.
echo [INFO] Repository setup complete (local only)
echo You can add a remote repository later with:
echo git remote add origin [repository-url]
echo git push -u origin main
goto :completion

:invalid_choice
echo [ERROR] Invalid choice
goto :push_changes

:completion
echo.
echo ========================================
echo           Setup Complete!
echo ========================================
echo.
echo Your Vision NDT project is now under Git version control.
echo.
echo Useful Git commands:
echo - git status          : Check repository status
echo - git add .           : Add all changes
echo - git commit -m "msg" : Commit changes
echo - git push            : Push to remote repository
echo - git pull            : Pull from remote repository
echo.
echo Project structure:
echo - Python service: static/tools/python-crawler/
echo - Hugo content: content/
echo - Templates: layouts/
echo - Static files: static/
echo.
pause
