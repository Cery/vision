# Vision NDT 全业务流程测试脚本 (PowerShell版本)
# 测试发布内容、发布需求、回应报价等完整流程

param(
    [string]$Environment = "local",
    [string]$ApiBase = "",
    [string]$AdminUser = "",
    [string]$AdminPassword = ""
)

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

# 选择环境
if ($ApiBase) {
    $apiBase = $ApiBase
} else {
    $apiBase = $config[$Environment].api
}

$frontendBase = $config[$Environment].frontend

Write-Host "`n🧪 开始测试 - 环境: $Environment" -ForegroundColor Cyan
Write-Host "API地址: $apiBase"
Write-Host "前端地址: $frontendBase`n"

# 测试结果
$testResults = @{
    passed = 0
    failed = 0
    errors = @()
}

# 工具函数
function Invoke-ApiRequest {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [hashtable]$Headers = @{},
        [object]$Body = $null
    )
    
    try {
        $headers["Content-Type"] = "application/json"
        
        $params = @{
            Uri = $Url
            Method = $Method
            Headers = $Headers
            UseBasicParsing = $true
        }
        
        if ($Body) {
            $params.Body = ($Body | ConvertTo-Json -Depth 10)
        }
        
        $response = Invoke-WebRequest @params -ErrorAction Stop
        $data = $response.Content | ConvertFrom-Json
        
        return @{
            Status = $response.StatusCode
            Data = $data
        }
    } catch {
        $statusCode = $_.Exception.Response.StatusCode.value__
        $errorContent = $_.ErrorDetails.Message
        try {
            $errorData = $errorContent | ConvertFrom-Json
        } catch {
            $errorData = @{ error = $errorContent }
        }
        
        return @{
            Status = $statusCode
            Data = $errorData
        }
    }
}

# 测试函数
function Test-Step {
    param(
        [string]$Name,
        [scriptblock]$TestScript
    )
    
    Write-Host "`n📋 测试: $Name" -ForegroundColor Yellow
    
    try {
        & $TestScript
        $testResults.passed++
        Write-Host "✅ 通过: $Name" -ForegroundColor Green
    } catch {
        $testResults.failed++
        $testResults.errors += @{ Name = $Name; Error = $_.Exception.Message }
        Write-Host "❌ 失败: $Name" -ForegroundColor Red
        Write-Host "   错误: $_.Exception.Message" -ForegroundColor Red
    }
}

# 全局变量
$script:adminToken = ""
$script:adminUser = $null
$script:productId = ""
$script:newsId = ""
$script:caseId = ""
$script:requirementId = ""
$script:viewPassword = ""
$script:quoteId = ""

# 1. 测试登录
Test-Step "管理员登录" {
    $username = if ($AdminUser) { $AdminUser } else { "admin" }
    $password = if ($AdminPassword) { $AdminPassword } else { "admin123456" }
    
    $response = Invoke-ApiRequest -Url "$apiBase/api/admin/login" -Method POST -Body @{
        username = $username
        password = $password
    }
    
    if (-not $response.Data.ok -or -not $response.Data.token) {
        throw "登录失败: $($response.Data | ConvertTo-Json)"
    }
    
    $script:adminToken = $response.Data.token
    $script:adminUser = $response.Data.user
    
    Write-Host "   Token: $($script:adminToken.Substring(0, [Math]::Min(20, $script:adminToken.Length)))..."
    Write-Host "   用户: $($script:adminUser.username)"
}

# 2. 测试发布产品
Test-Step "发布产品" {
    $productData = @{
        name = "测试产品-$(Get-Date -Format 'yyyyMMddHHmmss')"
        model = "TEST-$(Get-Date -Format 'yyyyMMddHHmmss')"
        series = "Test Series"
        primary_category = "电子内窥镜"
        secondary_category = "工业视频内窥镜"
        summary = "这是自动化测试创建的产品"
        description = "详细的产品描述内容..."
        status = "published"
        seo_title = "测试产品-$(Get-Date -Format 'yyyyMMddHHmmss') | Vision NDT"
        seo_keywords = "测试,产品,内窥镜"
        seo_description = "测试产品描述"
    }
    
    $response = Invoke-ApiRequest -Url "$apiBase/api/admin/products" -Method POST `
        -Headers @{ "Authorization" = "Bearer $script:adminToken"; "X-Admin-Key" = $script:adminToken } `
        -Body $productData
    
    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "创建产品失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    $script:productId = $response.Data.product_id
    if (-not $script:productId) { $script:productId = $response.Data.id }
    
    Write-Host "   产品ID: $script:productId"
}

# 3. 测试发布新闻
Test-Step "发布新闻" {
    $newsData = @{
        title = "测试新闻-$(Get-Date -Format 'yyyyMMddHHmmss')"
        category = "技术文章"
        summary = "这是自动化测试创建的新闻"
        content = "新闻正文内容..."
        tags = "测试,技术"
        author = "测试作者"
        status = "published"
        seo_title = "测试新闻-$(Get-Date -Format 'yyyyMMddHHmmss') | Vision NDT"
    }
    
    $response = Invoke-ApiRequest -Url "$apiBase/api/admin/news" -Method POST `
        -Headers @{ "Authorization" = "Bearer $script:adminToken"; "X-Admin-Key" = $script:adminToken } `
        -Body $newsData
    
    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "创建新闻失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    $script:newsId = $response.Data.news_id
    if (-not $script:newsId) { $script:newsId = $response.Data.id }
    
    Write-Host "   新闻ID: $script:newsId"
}

# 4. 测试发布案例
Test-Step "发布案例" {
    $caseData = @{
        title = "测试案例-$(Get-Date -Format 'yyyyMMddHHmmss')"
        industry = "航空航天"
        summary = "这是自动化测试创建的案例"
        content = "案例详细内容..."
        status = "published"
        seo_title = "测试案例-$(Get-Date -Format 'yyyyMMddHHmmss') | Vision NDT"
    }
    
    $response = Invoke-ApiRequest -Url "$apiBase/api/admin/cases" -Method POST `
        -Headers @{ "Authorization" = "Bearer $script:adminToken"; "X-Admin-Key" = $script:adminToken } `
        -Body $caseData
    
    if ($response.Status -ne 200 -and $response.Status -ne 201) {
        throw "创建案例失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    $script:caseId = $response.Data.case_id
    if (-not $script:caseId) { $script:caseId = $response.Data.id }
    
    Write-Host "   案例ID: $script:caseId"
}

# 5. 测试发布需求
Test-Step "发布需求" {
    $phone = "138" + (Get-Random -Minimum 10000000 -Maximum 99999999).ToString()
    $requirementData = @{
        Title = "测试需求-$(Get-Date -Format 'yyyyMMddHHmmss')"
        primaryCategory = "工业内窥镜"
        contactName = "测试联系人"
        contactPhone = $phone
        contactCompany = "测试公司"
        contactEmail = "test@example.com"
        public_preview = "这是自动化测试创建的需求"
        budget_range = "10-50万"
        status = "公开"
    }
    
    $response = Invoke-ApiRequest -Url "$apiBase/api/markets" -Method POST -Body $requirementData
    
    if (-not $response.Data.ok -and -not $response.Data.requirement_id) {
        throw "创建需求失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    $script:requirementId = $response.Data.requirement_id
    if (-not $script:requirementId) { $script:requirementId = $response.Data.RequirementID }
    
    $script:viewPassword = $response.Data.ViewPassword
    if (-not $script:viewPassword) { $script:viewPassword = $response.Data.view_password_plain }
    
    Write-Host "   需求ID: $script:requirementId"
    Write-Host "   查看密码: $script:viewPassword"
}

# 6. 测试需求审核
Test-Step "审核需求" {
    $response = Invoke-ApiRequest -Url "$apiBase/api/admin/markets/$script:requirementId" -Method PATCH `
        -Headers @{ "Authorization" = "Bearer $script:adminToken"; "X-Admin-Key" = $script:adminToken } `
        -Body @{
            approved = 1
            approved_at = (Get-Date -Format 'o')
            status = "公开"
            progress = "发布中"
        }
    
    if ($response.Status -ne 200) {
        throw "审核需求失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    Write-Host "   审核成功"
}

# 7. 测试需求撮合
Test-Step "需求撮合" {
    $response = Invoke-ApiRequest -Url "$apiBase/api/admin/match-suppliers" -Method POST `
        -Headers @{ "Authorization" = "Bearer $script:adminToken"; "X-Admin-Key" = $script:adminToken } `
        -Body @{ requirement_id = $script:requirementId }
    
    if ($response.Status -ne 200) {
        throw "需求撮合失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    $matches = $response.Data.matches
    if (-not $matches) { $matches = @() }
    
    Write-Host "   匹配到 $($matches.Count) 个供应商"
    if ($matches.Count -gt 0) {
        Write-Host "   最高分: $($matches[0].score)"
    }
}

# 8. 测试提交报价
Test-Step "提交报价" {
    $phone = "137" + (Get-Random -Minimum 10000000 -Maximum 99999999).ToString()
    $quoteData = @{
        requirement_id = $script:requirementId
        supplier_name = "测试供应商"
        supplier_phone = $phone
        amount = 150000
        currency = "CNY"
        remarks = "这是自动化测试创建的报价"
        supplier_access_password = "888888"
    }
    
    $response = Invoke-ApiRequest -Url "$apiBase/api/quotes" -Method POST -Body $quoteData
    
    if (-not $response.Data.ok -and -not $response.Data.quote_id) {
        throw "提交报价失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    $script:quoteId = $response.Data.quote_id
    if (-not $script:quoteId) { $script:quoteId = $response.Data.id }
    
    Write-Host "   报价ID: $script:quoteId"
}

# 9. 测试查看报价
Test-Step "查看报价列表" {
    $response = Invoke-ApiRequest -Url "$apiBase/api/quotes?requirement_id=$script:requirementId" -Method GET `
        -Headers @{ "Authorization" = "Bearer $script:adminToken"; "X-Admin-Key" = $script:adminToken }
    
    if ($response.Status -ne 200) {
        throw "查看报价失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    $quotes = $response.Data
    if (-not $quotes) { $quotes = @() }
    if ($quotes -is [PSCustomObject]) {
        if ($quotes.items) { $quotes = $quotes.items }
        else { $quotes = @($quotes) }
    }
    
    Write-Host "   找到 $($quotes.Count) 条报价"
}

# 10. 测试数据同步
Test-Step "数据同步检查" {
    # 检查产品
    $productsResponse = Invoke-ApiRequest -Url "$apiBase/api/products" -Method GET
    
    if ($productsResponse.Status -ne 200) {
        throw "获取产品列表失败: $($productsResponse.Status)"
    }
    
    $products = $productsResponse.Data.items
    if (-not $products) { $products = @() }
    
    $foundProduct = $products | Where-Object { $_.id -eq $script:productId }
    if (-not $foundProduct) {
        Write-Host "   ⚠️  产品 $script:productId 未在前端API中找到（可能需要同步）" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ 产品已同步到前端API" -ForegroundColor Green
    }
    
    # 检查新闻
    $newsResponse = Invoke-ApiRequest -Url "$apiBase/api/news" -Method GET
    
    if ($newsResponse.Status -ne 200) {
        throw "获取新闻列表失败: $($newsResponse.Status)"
    }
    
    $news = $newsResponse.Data.items
    if (-not $news) { $news = @() }
    
    $foundNews = $news | Where-Object { $_.id -eq $script:newsId }
    if (-not $foundNews) {
        Write-Host "   ⚠️  新闻 $script:newsId 未在前端API中找到（可能需要同步）" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ 新闻已同步到前端API" -ForegroundColor Green
    }
}

# 11. 测试管理后台统计
Test-Step "管理后台统计" {
    $response = Invoke-ApiRequest -Url "$apiBase/api/admin/stats" -Method GET `
        -Headers @{ "Authorization" = "Bearer $script:adminToken"; "X-Admin-Key" = $script:adminToken }
    
    if ($response.Status -ne 200) {
        throw "获取统计失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    Write-Host "   需求总数: $($response.Data.requirements.total)"
    Write-Host "   产品总数: $($response.Data.products)"
    Write-Host "   供应商总数: $($response.Data.suppliers)"
    Write-Host "   报价总数: $($response.Data.quotes)"
}

# 12. 测试数据导出
Test-Step "数据导出" {
    $response = Invoke-ApiRequest -Url "$apiBase/api/admin/export?table=requirements&format=json" -Method GET `
        -Headers @{ "Authorization" = "Bearer $script:adminToken"; "X-Admin-Key" = $script:adminToken }
    
    if ($response.Status -ne 200) {
        throw "导出数据失败: $($response.Status) - $($response.Data | ConvertTo-Json)"
    }
    
    $data = $response.Data.data
    if (-not $data) { $data = @() }
    
    Write-Host "   导出 $($data.Count) 条需求数据"
}

# 主测试流程
Write-Host "=" * 60
Write-Host "Vision NDT 全业务流程测试"
Write-Host "=" * 60

# 执行测试
if (-not $script:adminToken) {
    Write-Host "`n❌ 登录失败，无法继续测试" -ForegroundColor Red
    exit 1
}

# 输出测试结果
Write-Host "`n" + ("=" * 60)
Write-Host "测试结果汇总"
Write-Host "=" * 60
Write-Host "✅ 通过: $($testResults.passed)" -ForegroundColor Green
Write-Host "❌ 失败: $($testResults.failed)" -ForegroundColor Red

$total = $testResults.passed + $testResults.failed
if ($total -gt 0) {
    $passRate = [Math]::Round(($testResults.passed / $total) * 100, 1)
    Write-Host "📊 通过率: $passRate%"
}

if ($testResults.errors.Count -gt 0) {
    Write-Host "`n错误详情:" -ForegroundColor Yellow
    for ($i = 0; $i -lt $testResults.errors.Count; $i++) {
        $err = $testResults.errors[$i]
        Write-Host "$($i + 1). $($err.Name): $($err.Error)"
    }
}

Write-Host "`n" + ("=" * 60)

# 返回退出码
if ($testResults.failed -gt 0) {
    exit 1
} else {
    exit 0
}

