param(
  [string]$ApiBase = "http://127.0.0.1:8787/api",
  [string]$AdminKey = "admin123456"
)

function Invoke-Json {
  param([string]$Method,[string]$Url,[hashtable]$Headers=@{},[object]$Body=$null)
  if ($Body -ne $null) {
    $json = (ConvertTo-Json $Body -Depth 6)
    $Headers['Content-Type'] = 'application/json'
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -Body $json -TimeoutSec 30
  } else {
    return Invoke-RestMethod -Method $Method -Uri $Url -Headers $Headers -TimeoutSec 30
  }
}

function New-Requirement {
  param(
    [string]$Title,[string]$Primary,[string]$ContactName,[string]$ContactPhone,[string]$Company,[string]$Preview,[string]$Budget
  )
  $payload = @{ Title=$Title; primaryCategory=$Primary; contactName=$ContactName; contactPhone=$ContactPhone; contactCompany=$Company; PublicPreview=$Preview; BudgetRange=$Budget; ContactPublic=$true }
  return Invoke-Json -Method 'POST' -Url ("$ApiBase/requirements") -Body $payload
}

function Patch-Requirement {
  param([string]$Rid,[hashtable]$Fields)
  $headers = @{ 'X-Admin-Key' = $AdminKey }
  return Invoke-Json -Method 'PATCH' -Url ("$ApiBase/admin/requirements/$Rid") -Headers $headers -Body $Fields
}

function New-Demander {
  param([string]$Company,[string]$Name,[string]$Phone,[string]$Email,[string]$Password)
  $payload = @{ name=$Name; company=$Company; contact_phone=$Phone; contact_email=$Email; metadata_json=@{ contact_public=$true; password_plain=$Password } }
  return Invoke-Json -Method 'POST' -Url ("$ApiBase/admin/demanders") -Headers @{ 'X-Admin-Key' = $AdminKey } -Body $payload
}

Write-Host "== 创建需求 ==" -ForegroundColor Cyan
$r1 = New-Requirement '电子内窥镜采购项目（试剂室）' '电子内窥镜' '张三' '021-66668888' '华东医疗集团' '用于试剂室常规检查，含主机与镜体' '30万-80万'
$r2 = New-Requirement '光纤内窥镜维保与更新' '光纤内窥镜' '李四' '0755-12345678' '南方医疗设备有限公司' '现网维保及型号更新，含冷光源' '10万-30万'
$r3 = New-Requirement '硬性内窥镜成套设备采购' '硬性内窥镜' '王五' '010-66667777' '首都临床中心' '含镜体、主机、插入管及配套' '60万-120万'
Write-Host (ConvertTo-Json $r1)
Write-Host (ConvertTo-Json $r2)
Write-Host (ConvertTo-Json $r3)

Write-Host "== 补充并审批 ==" -ForegroundColor Cyan
Patch-Requirement ($r1.RequirementID) @{ allow_open_quotes=$true; contact_public=$true; progress='发布中'; approved=1; approved_at=(Get-Date).ToString('s')+'Z' } | Out-Null
Patch-Requirement ($r2.RequirementID) @{ allow_open_quotes=$true; contact_public=$true; progress='发布中'; approved=1; approved_at=(Get-Date).ToString('s')+'Z' } | Out-Null
Patch-Requirement ($r3.RequirementID) @{ allow_open_quotes=$true; contact_public=$true; progress='发布中'; approved=1; approved_at=(Get-Date).ToString('s')+'Z' } | Out-Null

Write-Host "== 创建需求方 ==" -ForegroundColor Cyan
New-Demander '华东医疗集团' '张三' '021-66668888' 'z3@eastmed.example.com' '123456' | Out-Null
New-Demander '南方医疗设备有限公司' '李四' '0755-12345678' 'l4@nanyishebei.example.com' '123456' | Out-Null
New-Demander '首都临床中心' '王五' '010-66667777' 'w5@capitalclinic.example.com' '123456' | Out-Null

$list = Invoke-Json -Method 'GET' -Url ("$ApiBase/requirements?limit=50")
Write-Host ("Total requirements: " + $list.Length)