param(
  [string]$ConfigPath = "cloudflare\wrangler.toml",
  [string]$AdminKey = "",
  [string]$AdminPassword = "",
  [switch]$DryRun,
  [switch]$SkipVerify,
  [switch]$Dev,
  [string]$ApiBase = "https://api.visndt.com/api"
)

function Exec($cmd, [switch]$silent) {
  try {
    if ($silent) { iex $cmd | Out-Null } else { iex $cmd }
    return $true
  } catch {
    Write-Host ("[ERROR] " + $_.Exception.Message) -ForegroundColor Red
    return $false
  }
}

function Put-Secret($name, $value, $cfg) {
  if (-not $value) { $value = Read-Host "Enter $name" }
  Write-Host "Setting $name ..." -ForegroundColor Cyan
  try {
    $value | & npx wrangler secret put $name --config $cfg
  } catch {
    Write-Host "Failed to set. Run manually: npx wrangler secret put $name --config `"$cfg`"" -ForegroundColor Yellow
    throw $_
  }
}

Write-Host "==== Cloudflare Workers Deploy ====" -ForegroundColor Cyan

if (-not (Test-Path $ConfigPath)) { Write-Host "Config file not found: $ConfigPath" -ForegroundColor Red; exit 1 }

if (-not (Exec 'npx --version' -silent)) { Write-Host "npx not found. Install Node.js" -ForegroundColor Red; exit 1 }

$whoamiOK = Exec 'npx wrangler whoami'
if (-not $whoamiOK) {
  if ($DryRun) { Write-Host "Not logged in (DryRun skips login)" -ForegroundColor Yellow }
  else {
    Write-Host "Opening login..." -ForegroundColor Cyan
    if (-not (Exec 'npx wrangler login')) { Write-Host "Login failed" -ForegroundColor Red; exit 1 }
  }
}

if (-not $DryRun -and -not $Dev) {
  if (-not $AdminKey) { $AdminKey = Read-Host "Enter ADMIN_KEY (required)" }
  if ($AdminKey) { Put-Secret -name 'ADMIN_KEY' -value $AdminKey -cfg $ConfigPath }
  if ($AdminPassword) { Put-Secret -name 'ADMIN_PASSWORD' -value $AdminPassword -cfg $ConfigPath }
}

if ($Dev) {
  Write-Host "Starting local dev..." -ForegroundColor Cyan
  if (-not (Exec "npx wrangler dev --config `"$ConfigPath`" --local --port 8787")) { Write-Host "Dev failed" -ForegroundColor Red; exit 1 }
  exit 0
}

if ($DryRun) {
  Write-Host "DryRun: will run => npx wrangler publish --config `"$ConfigPath`"" -ForegroundColor Yellow
} else {
  Write-Host "Publishing..." -ForegroundColor Cyan
  if (-not (Exec "npx wrangler publish --config `"$ConfigPath`"")) { Write-Host "Publish failed" -ForegroundColor Red; exit 1 }
}

if (-not $SkipVerify -and -not $DryRun) {
  Write-Host "Verifying endpoints..." -ForegroundColor Cyan
  try {
    $health = Invoke-WebRequest -UseBasicParsing -Uri "$ApiBase/health" -Method GET -TimeoutSec 30
    Write-Host ("health => " + $health.Content)
  } catch { Write-Host ("[ERROR] health verify failed: " + $_.Exception.Message) -ForegroundColor Yellow }
  try {
    $stats = Invoke-WebRequest -UseBasicParsing -Uri "$ApiBase/admin/stats" -Method GET -Headers @{"X-Admin-Key"=$AdminKey} -TimeoutSec 30
    Write-Host ("admin/stats => " + $stats.Content)
  } catch { Write-Host ("[ERROR] admin/stats verify failed: " + $_.Exception.Message) -ForegroundColor Yellow }
  try {
    $assets = Invoke-WebRequest -UseBasicParsing -Uri "$ApiBase/admin/assets?limit=1" -Method GET -Headers @{"X-Admin-Key"=$AdminKey} -TimeoutSec 30
    Write-Host ("admin/assets => " + $assets.Content)
  } catch { Write-Host ("[ERROR] admin/assets verify failed: " + $_.Exception.Message) -ForegroundColor Yellow }
}

Write-Host "Done." -ForegroundColor Green
