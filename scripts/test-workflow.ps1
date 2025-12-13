# Vision NDT 全业务流程测试脚本 (PowerShell)
# 测试：发布内容、发布需求、回应报价等完整流程

param(
    [string]$Environment = "local",  # local, production, all
    [string]$ApiBase = "",
    [string]$FrontendBase = "",
    [string]$AdminUser = "",
    [string]$AdminPassword = ""
)

$ErrorActionPreference = "Stop"

# 配置
$config = @{
    local = @{
        api = "http://localhost:8787"
        frontend = "http://localhost:1313"
    }
    production = @{
        api = "https://api.visndt.com"
        frontend = "https://www.visndt.com"
    }
}

# 测试结果
$script:results = @{
    passed = @()
    failed = @()
    warnings = @()
}

$script:testData = @{}

# 工具函数
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )

    try {
        $request = [System.Net.WebRequest]::Create($Url)
        $request.Method = $Method
        $request.ContentType = "application/json; charset=utf-8"

        foreach ($key in $Headers.Keys) {
            $request.Headers.Add($key, $Headers[$key])
        }

        if ($Body) {
            $bodyJson = $Body | ConvertTo-Json -Depth 10
            $bodyBytes = [System.Text.Encoding]::UTF8.GetBytes($bodyJson)
            $request.ContentLength = $bodyBytes.Length
            $requestStream = $request.GetRequestStream()
            $requestStream.Write($bodyBytes, 0, $bodyBytes.Length)
            $requestStream.Close()
        }

        $response = $request.GetResponse()
        $reader = New-Object System.IO.StreamReader($response.GetResponseStream())
        $responseText = $reader.ReadToEnd()
        $reader.Close()
        $response.Close()

        try {
            $json = $responseText | ConvertFrom-Json
            return @{
                Status = [int]$response.StatusCode
                Data = $json
                Raw = $responseText
            }
        } catch {
            return @{
                Status = [int]$response.StatusCode
                Data = $responseText
                Raw = $responseText
            }
        }
    } catch {
        $statusCode = 0
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode
        }
        return @{
            Status = $statusCode
            Data = $null
            Error = $_.Exception.Message
        }
    }
}

function Test-Step {
    param(
        [string]$Name,
        [scriptblock]$TestScript
    )

    Write-Host "`n🧪 测试: $Name" -ForegroundColor Cyan
    try {
        & $TestScript
        $script:results.passed += @{ Test = $Name; Env = $script:currentEnv }
        Write-Host "✅ 通过: $Name" -ForegroundColor Green
        return $true
    } catch {
        $script:results.failed += @{ Test = $Name; Env = $script:currentEnv; Error = $_.Exception.Message }
        Write-Host "❌ 失败: $Name - $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
}

# 测试用例
function Test-AdminLogin {
    $user = if ($AdminUser) { $AdminUser } else { "admin" }
    $pass = if ($AdminPassword) { $AdminPassword } else { "admin123456" }

    $response = Invoke-ApiRequest -Url "$($script:apiBase)/api/admin/login" `
        -Method "POST" `
        -Body @{
            username = $user
            password = $pass
        }

    if ($response.Status -ne 200 -or -not $response.Data.ok) {
        throw "登录失败: $($response.Data | ConvertTo-Json)"
    }

    if (-not $response.Data.token) {
        throw "未返回Token"
    }

    $script:testData.adminToken = $response.Data.token
    Write-Host "   获取Token: $($script:testData.adminToken.Substring(0, [Math]::Min(20, $script:testData.adminToken.Length)))..." -ForegroundColor Gray
}

function Test-CreateProduct {
    $productData = @{
        name = "测试产品-$(Get-Date -Format 'yyyyMMddHHmmss')"
        slug = "test-product-$(Get-Date -Format 'yyyyMMddHHmmss')"
        model = "TEST-001"
        series = "Test Series"
        primary_category = "电子内窥镜"
        secondary_category = "工业视频内窥镜"
        summary = "这是一个测试产品"
        description = "测试产品详细描述"
        status = "active"
        is_featured = 0
    }

    $response = Invoke-ApiRequest -Url "$($script:apiBase)/api/admin/products" `
        -Method "POST" `
        -Headers @{
            "Authorization" = "Bearer $($script:testData.adminToken)"
            "X-Admin-Key" = $script:testData.adminToken
        } `
        -Body $productData

    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "创建产品失败: $($response.Data | ConvertTo-Json)"
    }

    $script:testData.productId = $response.Data.product_id
    if (-not $script:testData.productId) {
        $script:testData.productId = $response.Data.id
    }
    Write-Host "   产品ID: $($script:testData.productId)" -ForegroundColor Gray
}

function Test-CreateNews {
    $newsData = @{
        title = "测试新闻-$(Get-Date -Format 'yyyyMMddHHmmss')"
        slug = "test-news-$(Get-Date -Format 'yyyyMMddHHmmss')"
        summary = "这是一条测试新闻"
        content = "测试新闻内容"
        category = "tech-article"
        status = "published"
        published_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }

    $response = Invoke-ApiRequest -Url "$($script:apiBase)/api/admin/news" `
        -Method "POST" `
        -Headers @{
            "Authorization" = "Bearer $($script:testData.adminToken)"
            "X-Admin-Key" = $script:testData.adminToken
        } `
        -Body $newsData

    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "创建新闻失败: $($response.Data | ConvertTo-Json)"
    }

    $script:testData.newsId = $response.Data.news_id
    if (-not $script:testData.newsId) {
        $script:testData.newsId = $response.Data.id
    }
    Write-Host "   新闻ID: $($script:testData.newsId)" -ForegroundColor Gray
}

function Test-CreateCase {
    $caseData = @{
        title = "测试案例-$(Get-Date -Format 'yyyyMMddHHmmss')"
        slug = "test-case-$(Get-Date -Format 'yyyyMMddHHmmss')"
        summary = "这是一个测试案例"
        content = "测试案例详细内容"
        industry = "aerospace"
        status = "published"
        published_at = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ssZ")
    }

    $response = Invoke-ApiRequest -Url "$($script:apiBase)/api/admin/cases" `
        -Method "POST" `
        -Headers @{
            "Authorization" = "Bearer $($script:testData.adminToken)"
            "X-Admin-Key" = $script:testData.adminToken
        } `
        -Body $caseData

    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "创建案例失败: $($response.Data | ConvertTo-Json)"
    }

    $script:testData.caseId = $response.Data.case_id
    if (-not $script:testData.caseId) {
        $script:testData.caseId = $response.Data.id
    }
    Write-Host "   案例ID: $($script:testData.caseId)" -ForegroundColor Gray
}

function Test-CreateRequirement {
    $requirementData = @{
        Title = "测试需求-$(Get-Date -Format 'yyyyMMddHHmmss')"
        primaryCategory = "电子内窥镜"
        contactName = "测试联系人"
        contactPhone = "13800138000"
        contactCompany = "测试公司"
        contactEmail = "test@example.com"
        PublicPreview = "这是一个测试需求"
        Status = "公开"
        Progress = "发布中"
    }

    $response = Invoke-ApiRequest -Url "$($script:apiBase)/api/markets" `
        -Method "POST" `
        -Body $requirementData

    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "发布需求失败: $($response.Data | ConvertTo-Json)"
    }

    $script:testData.requirementId = $response.Data.requirement_id
    if (-not $script:testData.requirementId) {
        $script:testData.requirementId = $response.Data.RequirementID
    }
    $script:testData.viewPassword = $response.Data.ViewPassword
    if (-not $script:testData.viewPassword) {
        $script:testData.viewPassword = $response.Data.view_password_plain
    }

    if (-not $script:testData.requirementId) {
        throw "未返回需求ID"
    }

    Write-Host "   需求ID: $($script:testData.requirementId)" -ForegroundColor Gray
    Write-Host "   查看密码: $($script:testData.viewPassword)" -ForegroundColor Gray
}

function Test-SupplierRegister {
    $supplierData = @{
        name = "测试供应商"
        company = "测试供应商公司-$(Get-Date -Format 'yyyyMMddHHmmss')"
        contact_phone = "13900139000"
        contact_email = "supplier@example.com"
    }

    $response = Invoke-ApiRequest -Url "$($script:apiBase)/api/suppliers/register" `
        -Method "POST" `
        -Body $supplierData

    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "供应商注册失败: $($response.Data | ConvertTo-Json)"
    }

    $script:testData.supplierId = $response.Data.supplier_id
    if (-not $script:testData.supplierId) {
        $script:testData.supplierId = $response.Data.id
    }
    Write-Host "   供应商ID: $($script:testData.supplierId)" -ForegroundColor Gray
}

function Test-SubmitQuote {
    if (-not $script:testData.requirementId) {
        throw "需求ID不存在，请先创建需求"
    }

    $quoteData = @{
        requirement_id = $script:testData.requirementId
        supplier_name = "测试供应商"
        supplier_phone = "13900139000"
        amount = 10000
        currency = "CNY"
        remarks = "这是测试报价"
    }

    $response = Invoke-ApiRequest -Url "$($script:apiBase)/api/quotes" `
        -Method "POST" `
        -Body $quoteData

    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "提交报价失败: $($response.Data | ConvertTo-Json)"
    }

    $script:testData.quoteId = $response.Data.quote_id
    if (-not $script:testData.quoteId) {
        $script:testData.quoteId = $response.Data.id
    }
    Write-Host "   报价ID: $($script:testData.quoteId)" -ForegroundColor Gray
}

function Test-FrontendData {
    # 测试产品列表
    $productsResponse = Invoke-ApiRequest -Url "$($script:frontendBase)/api/products?limit=10"
    if ($productsResponse.Status -ne 200) {
        throw "获取产品列表失败: $($productsResponse.Status)"
    }
    $productCount = if ($productsResponse.Data.items) { $productsResponse.Data.items.Count } else { 0 }
    Write-Host "   产品列表: $productCount 条" -ForegroundColor Gray

    # 测试新闻列表
    $newsResponse = Invoke-ApiRequest -Url "$($script:frontendBase)/api/news?limit=10"
    if ($newsResponse.Status -ne 200) {
        throw "获取新闻列表失败: $($newsResponse.Status)"
    }
    $newsCount = if ($newsResponse.Data.items) { $newsResponse.Data.items.Count } else { 0 }
    Write-Host "   新闻列表: $newsCount 条" -ForegroundColor Gray

    # 测试案例列表
    $casesResponse = Invoke-ApiRequest -Url "$($script:frontendBase)/api/cases?limit=10"
    if ($casesResponse.Status -ne 200) {
        throw "获取案例列表失败: $($casesResponse.Status)"
    }
    $caseCount = if ($casesResponse.Data.items) { $casesResponse.Data.items.Count } else { 0 }
    Write-Host "   案例列表: $caseCount 条" -ForegroundColor Gray

    # 测试需求列表
    $requirementsResponse = Invoke-ApiRequest -Url "$($script:frontendBase)/api/markets?limit=10"
    if ($requirementsResponse.Status -ne 200) {
        throw "获取需求列表失败: $($requirementsResponse.Status)"
    }
    $reqCount = if ($requirementsResponse.Data -is [Array]) { $requirementsResponse.Data.Count } else { 0 }
    Write-Host "   需求列表: $reqCount 条" -ForegroundColor Gray
}

function Test-AdminDataSync {
    # 测试统计接口
    $statsResponse = Invoke-ApiRequest -Url "$($script:apiBase)/api/admin/stats" `
        -Headers @{
            "Authorization" = "Bearer $($script:testData.adminToken)"
            "X-Admin-Key" = $script:testData.adminToken
        }

    if ($statsResponse.Status -ne 200) {
        throw "获取统计失败: $($statsResponse.Status)"
    }

    Write-Host "   统计数据:" -ForegroundColor Gray
    Write-Host "     - 需求: $($statsResponse.Data.requirements.total)" -ForegroundColor Gray
    Write-Host "     - 产品: $($statsResponse.Data.products)" -ForegroundColor Gray
    Write-Host "     - 供应商: $($statsResponse.Data.suppliers)" -ForegroundColor Gray
    Write-Host "     - 报价: $($statsResponse.Data.quotes)" -ForegroundColor Gray

    # 测试数据导出
    $exportResponse = Invoke-ApiRequest -Url "$($script:apiBase)/api/admin/export?table=requirements&format=json" `
        -Headers @{
            "Authorization" = "Bearer $($script:testData.adminToken)"
            "X-Admin-Key" = $script:testData.adminToken
        }

    if ($exportResponse.Status -ne 200) {
        $script:results.warnings += @{ Test = "数据导出"; Env = $script:currentEnv; Message = "导出功能可能未实现" }
    } else {
        Write-Host "   数据导出: 成功" -ForegroundColor Gray
    }
}

function Test-MatchSuppliers {
    if (-not $script:testData.requirementId) {
        throw "需求ID不存在，请先创建需求"
    }

    $response = Invoke-ApiRequest -Url "$($script:apiBase)/api/admin/match-suppliers" `
        -Method "POST" `
        -Headers @{
            "Authorization" = "Bearer $($script:testData.adminToken)"
            "X-Admin-Key" = $script:testData.adminToken
        } `
        -Body @{
            requirement_id = $script:testData.requirementId
        }

    if ($response.Status -ne 200) {
        throw "需求撮合失败: $($response.Data | ConvertTo-Json)"
    }

    $matchCount = if ($response.Data.matches) { $response.Data.matches.Count } else { 0 }
    Write-Host "   匹配结果: $matchCount 个供应商" -ForegroundColor Gray
}

function Run-TestSuite {
    param([string]$Env)

    $script:currentEnv = $Env
    $envConfig = $config[$Env]
    
    if ($ApiBase) {
        $script:apiBase = $ApiBase
    } else {
        $script:apiBase = $envConfig.api
    }
    
    if ($FrontendBase) {
        $script:frontendBase = $FrontendBase
    } else {
        $script:frontendBase = $envConfig.frontend
    }

    Write-Host "`n$('=' * 60)" -ForegroundColor Yellow
    Write-Host "🚀 开始测试环境: $($Env.ToUpper())" -ForegroundColor Yellow
    Write-Host "API地址: $script:apiBase" -ForegroundColor Gray
    Write-Host "前端地址: $script:frontendBase" -ForegroundColor Gray
    Write-Host "$('=' * 60)" -ForegroundColor Yellow

    # 基础功能测试
    Test-Step "管理员登录" { Test-AdminLogin }
    
    # 内容发布测试
    Test-Step "发布产品" { Test-CreateProduct }
    Test-Step "发布新闻" { Test-CreateNews }
    Test-Step "发布案例" { Test-CreateCase }
    
    # 需求市场测试
    Test-Step "发布需求" { Test-CreateRequirement }
    Test-Step "供应商注册" { Test-SupplierRegister }
    Test-Step "提交报价" { Test-SubmitQuote }
    
    # 前端数据测试
    Test-Step "前端数据获取" { Test-FrontendData }
    
    # 管理后台测试
    Test-Step "管理后台数据同步" { Test-AdminDataSync }
    Test-Step "需求撮合" { Test-MatchSuppliers }

    Write-Host "`n$('=' * 60)" -ForegroundColor Yellow
    Write-Host "✅ $($Env.ToUpper()) 环境测试完成" -ForegroundColor Green
    Write-Host "$('=' * 60)" -ForegroundColor Yellow
}

# 主函数
Write-Host @"

╔════════════════════════════════════════════════════════════╗
║         Vision NDT 全业务流程测试脚本                    ║
╚════════════════════════════════════════════════════════════╝
"@ -ForegroundColor Cyan

if (-not @("local", "production", "all") -contains $Environment) {
    Write-Host "❌ 错误: 测试环境必须是 local, production 或 all" -ForegroundColor Red
    exit 1
}

try {
    if ($Environment -eq "all" -or $Environment -eq "local") {
        Run-TestSuite "local"
    }

    if ($Environment -eq "all" -or $Environment -eq "production") {
        Write-Host "`n⏳ 等待5秒后测试生产环境..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
        Run-TestSuite "production"
    }

    # 输出测试结果
    Write-Host "`n$('=' * 60)" -ForegroundColor Yellow
    Write-Host "📊 测试结果汇总" -ForegroundColor Cyan
    Write-Host "$('=' * 60)" -ForegroundColor Yellow
    Write-Host "✅ 通过: $($script:results.passed.Count) 项" -ForegroundColor Green
    Write-Host "❌ 失败: $($script:results.failed.Count) 项" -ForegroundColor Red
    Write-Host "⚠️  警告: $($script:results.warnings.Count) 项" -ForegroundColor Yellow

    if ($script:results.failed.Count -gt 0) {
        Write-Host "`n❌ 失败的测试:" -ForegroundColor Red
        foreach ($f in $script:results.failed) {
            Write-Host "   - [$($f.Env)] $($f.Test): $($f.Error)" -ForegroundColor Red
        }
    }

    if ($script:results.warnings.Count -gt 0) {
        Write-Host "`n⚠️  警告:" -ForegroundColor Yellow
        foreach ($w in $script:results.warnings) {
            Write-Host "   - [$($w.Env)] $($w.Test): $($w.Message)" -ForegroundColor Yellow
        }
    }

    exit ($script:results.failed.Count -gt 0 ? 1 : 0)

} catch {
    Write-Host "`n❌ 测试执行错误: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host $_.Exception.StackTrace -ForegroundColor Red
    exit 1
}

