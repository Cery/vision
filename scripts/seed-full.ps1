
param(
    [string]$ApiBase = "http://127.0.0.1:8787/api"
)

function PostRawJson { param([string]$Url,[string]$Json); try { Invoke-RestMethod -Method POST -Uri $Url -Body $Json -ContentType 'application/json' -TimeoutSec 10 } catch { Write-Warning "POST failed: $_" } }

# 1. Seed Suppliers
Write-Host "Seeding Suppliers..."
PostRawJson "$ApiBase/debug/seed" "{}"

# 2. Seed Requirements
# Using JSON strings directly to avoid PowerShell encoding issues with Chinese characters
# "电子内窥镜" = \u7535\u5B50\u5185\u77A7\u955C
# "光纤内窥镜" = \u5149\u7EA4\u5185\u77A7\u955C
# "工业内窥镜" = \u5DE5\u4E1A\u5185\u77A7\u955C

$j1 = '{"Title":"High-Def Endoscope System","primaryCategory":"\u7535\u5B50\u5185\u77A7\u955C","BudgetRange":"50w-80w","contactCompany":"Beijing Health Hospital","contactName":"Dr. Liu","contactPhone":"13800138000","contactEmail":"liu@bhh.com","ContactPublic":true,"AllowOpenQuotes":true}'
$j2 = '{"Title":"Fiber Optic Scope Replacement","primaryCategory":"\u5149\u7EA4\u5185\u77A7\u955C","BudgetRange":"20w-30w","contactCompany":"Shanghai First Clinic","contactName":"Manager Zhang","contactPhone":"13900139000","contactEmail":"zhang@sfc.com","ContactPublic":false,"AllowOpenQuotes":true}'
$j3 = '{"Title":"Industrial Pipe Inspection","primaryCategory":"\u5DE5\u4E1A\u5185\u77A7\u955C","BudgetRange":"10w-20w","contactCompany":"Shenzhen Tech Corp","contactName":"Eng. Wang","contactPhone":"13700137000","contactEmail":"wang@sztech.com","ContactPublic":true,"AllowOpenQuotes":false}'

$reqs = @($j1, $j2, $j3)

foreach($json in $reqs) {
    $resp = PostRawJson "$ApiBase/requirements" $json
    if ($resp) {
        Write-Host "Created Requirement: $($resp.requirement_id) - Demander Extracted"
    }
}

Write-Host "Done. Please check Admin Panel > Demanders to see extracted companies and passwords."
