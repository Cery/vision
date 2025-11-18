# Vision NDT Requirements Market API – PowerShell Self-Test
# 说明：覆盖三条生产入口（api.visndt.com、visndt.com/api、www.visndt.com/api），
# 可选附加 workers.dev 入口；验证 admin/verify、requirements 列表与详情、quotes 列表、
# admin 端列表、统计与导出。

param(
  [Parameter(Mandatory=$true)][string]$AdminKey,
  [string]$WorkersDevBase = ""
)

$Bases = @(
  "https://api.visndt.com/api",
  "https://visndt.com/api",
  "https://www.visndt.com/api"
)
if ($WorkersDevBase) {
  $Bases += ($WorkersDevBase.TrimEnd('/'))
}

function Write-Section($title) { Write-Host "==== $title ====" -ForegroundColor Cyan }

function Invoke-Json {
  param(
    [string]$Method,
    [string]$Url,
    [hashtable]$Headers = @{},
    [object]$Body = $null
  )
  try {
    if ($Body) {
      $json = (ConvertTo-Json $Body -Depth 6)
      $Headers['Content-Type'] = 'application/json'
      $res = Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -Body $json -TimeoutSec 30
    } else {
      $res = Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -TimeoutSec 30
    }
    return $res
  } catch {
    Write-Host ("[ERROR] {0} {1} -> {2}" -f $Method, $Url, $_.Exception.Message) -ForegroundColor Red
    if ($_.Exception.Response) {
      try {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $body = $reader.ReadToEnd()
        Write-Host ("Response: " + $body) -ForegroundColor DarkRed
      } catch {}
    }
    return $null
  }
}

$adminHeaders = @{ 'X-Admin-Key' = $AdminKey }
foreach ($base in $Bases) {
  Write-Section "Base: $base"

  # Admin verify GET
  $verifyGet = Invoke-Json -Method 'GET' -Url "$base/admin/verify" -Headers $adminHeaders
  if ($verifyGet) { Write-Host "GET admin/verify => " (ConvertTo-Json $verifyGet) }

  # Admin verify POST（Header 验证）
  $verifyPost = Invoke-Json -Method 'POST' -Url "$base/admin/verify" -Headers $adminHeaders -Body @{}
  if ($verifyPost) { Write-Host "POST admin/verify (header) => " (ConvertTo-Json $verifyPost) }

  # Public requirements list
  $reqList = Invoke-Json -Method 'GET' -Url "$base/requirements"
  if ($reqList) {
    $count = $reqList.Length
    Write-Host "requirements => $count items"
    if ($count -gt 0) {
      $first = $reqList[0]
      $rid = $first.RequirementID
      Write-Host "First RequirementID: $rid"

      # Requirement detail
      $detail = Invoke-Json -Method 'GET' -Url "$base/requirements/$rid"
      if ($detail) { Write-Host "requirements/$rid => " (ConvertTo-Json $detail) }

      # Quotes list for this requirement（admin）
      $quotes = Invoke-Json -Method 'GET' -Url "$base/quotes?requirement_id=$rid" -Headers $adminHeaders
      if ($quotes) { Write-Host "quotes?requirement_id=$rid => count: $($quotes.Length)" }
    }
  }

  # Admin requirements list
  $admList = Invoke-Json -Method 'GET' -Url "$base/admin/requirements?limit=5" -Headers $adminHeaders
  if ($admList) {
    $n = ($admList.items | Measure-Object).Count
    Write-Host "admin/requirements => $n items"
    if ($n -gt 0) {
      $firstAdmRid = $admList.items[0].requirement_id
      Write-Host "First Admin Requirement ID: $firstAdmRid"
      # 可选 PATCH（默认注释，避免改动生产数据）
      # $patch = Invoke-Json -Method 'PATCH' -Url "$base/admin/requirements/$firstAdmRid" -Headers $adminHeaders -Body @{ contact_public = 1 }
      # if ($patch) { Write-Host "PATCH admin/requirements/$firstAdmRid => " (ConvertTo-Json $patch) }
    }
  }

  # Admin stats
  $stats = Invoke-Json -Method 'GET' -Url "$base/admin/demanders/stats" -Headers $adminHeaders
  if ($stats) { Write-Host "admin/demanders/stats => " (ConvertTo-Json $stats) }

  # Suppliers export（CSV）显示前三行
  try {
    $csvSup = Invoke-WebRequest -UseBasicParsing -Method 'GET' -Uri "$base/admin/suppliers/export" -Headers $adminHeaders -TimeoutSec 30
    $lines = $csvSup.Content -split "`r?`n"
    Write-Host "admin/suppliers/export (first lines):"
    $lines | Select-Object -First 3 | ForEach-Object { Write-Host $_ }
  } catch {
    Write-Host "[ERROR] suppliers/export => $($_.Exception.Message)" -ForegroundColor DarkRed
  }

  # Demanders export（CSV）显示前三行
  try {
    $csvDem = Invoke-WebRequest -UseBasicParsing -Method 'GET' -Uri "$base/admin/demanders/export" -Headers $adminHeaders -TimeoutSec 30
    $lines = $csvDem.Content -split "`r?`n"
    Write-Host "admin/demanders/export (first lines):"
    $lines | Select-Object -First 3 | ForEach-Object { Write-Host $_ }
  } catch {
    Write-Host "[ERROR] demanders/export => $($_.Exception.Message)" -ForegroundColor DarkRed
  }

  Write-Host ""
}

Write-Host "Done." -ForegroundColor Green