param(
  [string]$ApiBase = "http://127.0.0.1:8787/api",
  [string]$AdminKey = "admin123456"
)

function PostRawJson { param([string]$Url,[string]$Json); Invoke-RestMethod -Method POST -Uri $Url -Body $Json -ContentType 'application/json' -TimeoutSec 30 }
function PatchRawJson { param([string]$Url,[string]$Json,[string]$Key); Invoke-RestMethod -Method PATCH -Uri $Url -Body $Json -ContentType 'application/json' -Headers @{ 'X-Admin-Key' = $Key } -TimeoutSec 30 }

$j1 = '{"Title":"\u6D4B\u8BD5\u7535\u5B50\u5185\u77A7\u955C","primaryCategory":"\u7535\u5B50\u5185\u77A7\u955C","contactName":"Zhang San","contactPhone":"021-66668888","contactCompany":"East Medical Group","PublicPreview":"Demo use","BudgetRange":"30\u4E07-80\u4E07","ContactPublic":true,"procurement_plan":"2025Q1 procurement, simple comparison, one-year warranty","parameters_json":{"sensor":"CMOS","probe_diameter":"6.0mm","working_length":"2.0m","resolution":"1080p","illumination":"LED"}}'
$j2 = '{"Title":"\u6D4B\u8BD5\u5149\u7EA4\u5185\u77A7\u955C","primaryCategory":"\u5149\u7EA4\u5185\u77A7\u955C","contactName":"Li Si","contactPhone":"0755-12345678","contactCompany":"South Medical Devices Co.","PublicPreview":"Field maintenance","BudgetRange":"10\u4E07-30\u4E07","ContactPublic":true,"procurement_plan":"2025Q2 procurement, invited bidding, 60-day delivery","parameters_json":{"fiber_count":30000,"probe_diameter":"4.0mm","working_length":"1.5m","bending_angle":"Up 130 deg / Down 130 deg","temperature_range":"-10C~50C"}}'
$j3 = '{"Title":"\u6D4B\u8BD5\u786C\u6027\u5185\u77A7\u955C","primaryCategory":"\u786C\u6027\u5185\u77A7\u955C","contactName":"Wang Wu","contactPhone":"010-66667777","contactCompany":"Capital Clinical Center","PublicPreview":"Rigid tube + console","BudgetRange":"60\u4E07-120\u4E07","ContactPublic":true,"procurement_plan":"2025Q3 procurement, negotiation, training required","parameters_json":{"rigid_tube_material":"Stainless steel","diameter":"8.0mm","length":"300mm","dof":"10mm-60mm","field_of_view":"90deg"}}'
$j4 = '{"Title":"Engine Blade Inspection","primaryCategory":"\u5DE5\u4E1A\u5185\u77A7\u955C","contactName":"Zhao Engineer","contactPhone":"022-55558888","contactCompany":"Aero Manufacturing Co.","PublicPreview":"Engine blade defect detection","BudgetRange":"80\u4E07-200\u4E07","ContactPublic":true,"procurement_plan":"2025Q2 procurement, single-source, fixture compatibility","parameters_json":{"probe_diameter":"3.9mm","working_length":"3.0m","articulation":"4-way","inspection_mode":"crack/wear","image_storage":"SSD 512GB"}}'
$j5 = '{"Title":"Petrochemical Pipeline Corrosion","primaryCategory":"\u5DE5\u4E1A\u5185\u77A7\u955C","contactName":"Qian Engineer","contactPhone":"021-77778888","contactCompany":"East Petro Equipment","PublicPreview":"Long-distance pipeline internal corrosion & fouling","BudgetRange":"50\u4E07-150\u4E07","ContactPublic":true,"procurement_plan":"2025Q1 procurement, public bidding, explosion-proof","parameters_json":{"probe_diameter":"10mm","working_length":"10m","explosion_proof":"Ex ib IIC T4 Gb","lighting":"Xenon high-bright","reporting":"PDF auto"}}'
$j6 = '{"Title":"Power Boiler Inspection","primaryCategory":"\u5DE5\u4E1A\u5185\u77A7\u955C","contactName":"Sun Engineer","contactPhone":"023-99990000","contactCompany":"Southwest Power Service","PublicPreview":"Boiler surface ash & cracks","BudgetRange":"40\u4E07-100\u4E07","ContactPublic":true,"procurement_plan":"2025Q4 procurement, framework agreement, night work support","parameters_json":{"probe_diameter":"6mm","working_length":"5m","heat_resistance":"to 120C","overlay_analysis":"corrosion/ash overlay","maintenance":"annual service"}}'

$r1 = PostRawJson ("$ApiBase/requirements") $j1
$r2 = PostRawJson ("$ApiBase/requirements") $j2
$r3 = PostRawJson ("$ApiBase/requirements") $j3
$r4 = PostRawJson ("$ApiBase/requirements") $j4
$r5 = PostRawJson ("$ApiBase/requirements") $j5
$r6 = PostRawJson ("$ApiBase/requirements") $j6
$created = @($r1,$r2,$r3,$r4,$r5,$r6)
Write-Host ($r1 | ConvertTo-Json)
Write-Host ($r2 | ConvertTo-Json)
Write-Host ($r3 | ConvertTo-Json)
Write-Host ($r4 | ConvertTo-Json)
Write-Host ($r5 | ConvertTo-Json)
Write-Host ($r6 | ConvertTo-Json)

$patch = @{ allow_open_quotes = $true; contact_public = $true; approved = 1; approved_at = ((Get-Date).ToString('s')+'Z'); progress = "发布中" } | ConvertTo-Json -Compress
foreach ($it in $created) {
  try { PatchRawJson ("$ApiBase/admin/requirements/" + ($it.RequirementID)) $patch $AdminKey | Out-Null } catch { Write-Warning "Patch failed for $($it.RequirementID): $($_.Exception.Message)" }
}

$list = Invoke-RestMethod -Method GET -Uri ("$ApiBase/requirements?limit=100") -TimeoutSec 30
Write-Host ("Total requirements: " + $list.Length)