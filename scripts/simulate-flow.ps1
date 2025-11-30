param(
    [string]$ApiBase = "http://127.0.0.1:8787/api"
)

function Post-Json {
    param($Url, $Body)
    try {
        $json = $Body | ConvertTo-Json -Depth 5 -Compress
        # Fix Chinese encoding for PowerShell 5
        $bytes = [System.Text.Encoding]::UTF8.GetBytes($json)
        $resp = Invoke-WebRequest -Uri $Url -Method POST -Body $bytes -ContentType "application/json" -Headers @{"X-Admin-Key"="admin123456"} -UseBasicParsing
        return $resp.Content | ConvertFrom-Json
    } catch {
        Write-Error "Request failed: $_"
        return $null
    }
}

Write-Host "=== Starting Simulation Flow ==="

# 1. Create Supplier
Write-Host "`n[1] Creating Simulated Supplier..."
$supBody = @{
    company = "Simulated Tech Supplier"
    name = "Sim Manager"
    contact_phone = "139-8888-9999"
    access_password_plain = "sim123"
    status = "active"
}
$supResp = Post-Json "$ApiBase/admin/suppliers/upsert" $supBody
$supplierId = $null
if ($supResp) {
    Write-Host "    > Supplier Created: $($supResp.supplier_id)"
    $supplierId = $supResp.supplier_id
}

# 2. Post Requirement (Demander)
Write-Host "`n[2] Posting Simulated Requirement..."
$reqBody = @{
    Title = "Urgent: High-Speed Industrial Camera"
    primaryCategory = "工业内窥镜"
    BudgetRange = "100w-200w"
    contactCompany = "Simulated Future Factory"
    contactName = "Director Li"
    contactPhone = "010-12345678"
    contactEmail = "li@future.com"
    ContactPublic = $true
    AllowOpenQuotes = $true
    PublicPreview = "Need a high-speed camera system for assembly line monitoring. 1000fps required."
}
$reqResp = Post-Json "$ApiBase/requirements" $reqBody
if ($reqResp) {
    Write-Host "    > Requirement Posted: $($reqResp.requirement_id)"
    Write-Host "    > (Demander 'Simulated Future Factory' should now exist with a generated password)"
}

# 3. Post Product (Supplier)
Write-Host "`n[3] Posting Simulated Product..."
if ($supplierId) {
    $prodBody = @{
        SupplierID = $supplierId
        Name = "Sim-Cam X1 High Speed"
        Model = "Sim-Cam X1"
        Series = "X-Series"
        PrimaryCategory = "Industrial Endoscope"
        Summary = "High speed camera for assembly lines."
        Parameters = @{
             Resolution = "1080p"
             FPS = "1000"
        }
    }
    $prodResp = Post-Json "$ApiBase/products" $prodBody
    if ($prodResp) {
        Write-Host "    > Product Posted: $($prodResp.product_id)"
    }
} else {
    Write-Error "    > Cannot post product: No Supplier ID returned from step 1."
}

Write-Host "`n=== Simulation Complete ==="
Write-Host "You can now:"
Write-Host "1. Check 'Simulated Future Factory' in Admin > Demanders (Check Requirements)"
Write-Host "2. Check 'Simulated Tech Supplier' in Admin > Suppliers (Check Products)"
Write-Host "3. Use the generated passwords to test the portals."
