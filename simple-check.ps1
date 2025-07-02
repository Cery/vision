# Simple Environment Check for VisNDT Website

Write-Host "Checking VisNDT Website Development Environment..." -ForegroundColor Green
Write-Host ""

# Refresh PATH
$env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")

$allGood = $true

# Check Git
Write-Host "Checking Git..." -ForegroundColor Yellow
try {
    $gitVersion = git --version
    Write-Host "OK: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Git not found" -ForegroundColor Red
    $allGood = $false
}

# Check Hugo
Write-Host "Checking Hugo..." -ForegroundColor Yellow
try {
    $hugoVersion = hugo version
    Write-Host "OK: Hugo installed" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Hugo not found" -ForegroundColor Red
    $allGood = $false
}

# Check Node.js
Write-Host "Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version
    Write-Host "OK: Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: Node.js not found" -ForegroundColor Red
    $allGood = $false
}

# Check npm
Write-Host "Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version
    Write-Host "OK: npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "ERROR: npm not found" -ForegroundColor Red
    $allGood = $false
}

# Check project files
Write-Host "Checking project files..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "OK: package.json exists" -ForegroundColor Green
} else {
    Write-Host "ERROR: package.json not found" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "hugo.toml") {
    Write-Host "OK: hugo.toml exists" -ForegroundColor Green
} else {
    Write-Host "ERROR: hugo.toml not found" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "node_modules") {
    Write-Host "OK: node_modules exists" -ForegroundColor Green
} else {
    Write-Host "WARNING: node_modules not found - run 'npm install'" -ForegroundColor Yellow
}

Write-Host ""
if ($allGood) {
    Write-Host "Environment check PASSED!" -ForegroundColor Green
    Write-Host "You can start development with: npm run dev" -ForegroundColor Cyan
} else {
    Write-Host "Environment check FAILED!" -ForegroundColor Red
    Write-Host "Please install missing components." -ForegroundColor Yellow
}
