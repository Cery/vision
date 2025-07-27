---
title: "需求中心"
description: "发布和浏览工业内窥镜设备需求，专业的供需对接平台"
date: 2025-01-15T10:00:00+08:00
draft: false
layout: "single"
type: "requirements"
seo_title: "工业内窥镜需求中心 - 专业供需对接平台"
seo_description: "Vision NDT需求中心提供工业内窥镜设备需求发布和浏览服务，支持电子内窥镜、光纤内窥镜、光学内窥镜等产品类型的专业对接。"
seo_keywords: ["需求中心", "工业内窥镜", "设备需求", "供需对接", "技术方案"]
---

<div id="app" class="requirements-center-app">
    <!-- 页面头部 -->
    <div class="app-header">
        <div class="container-fluid">
            <div class="row align-items-center">
                <div class="col-md-8">
                    <h1 class="mb-1">
                        <i class="bi bi-building me-2"></i>工业内窥镜需求中心
                    </h1>
                    <p class="text-muted mb-0">专业的设备需求发布与供需对接平台</p>
                </div>
                <div class="col-md-4 text-end">
                    <div class="stats-info">
                        <span class="badge bg-primary me-2">
                            <i class="bi bi-file-text me-1"></i>
                            活跃需求: <span id="activeRequirements">0</span>
                        </span>
                        <span class="badge bg-success">
                            <i class="bi bi-people me-1"></i>
                            今日新增: <span id="todayNew">0</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="app-main">
        <div class="container-fluid">
            <div class="row g-0">
                <!-- 左侧：需求发布面板 -->
                <div class="col-lg-6 publish-panel">
                    <div class="panel-header">
                        <h3>
                            <i class="bi bi-plus-circle me-2"></i>发布需求
                        </h3>
                        <p class="text-muted mb-0">填写您的设备需求，获得专业解决方案</p>
                    </div>

                    <div class="panel-content">
                        <!-- 需求发布表单 -->
                        <form id="requirementForm" class="requirement-form">
                            <!-- 基本信息 -->
                            <div class="form-section">
                                <h5 class="section-title">
                                    <i class="bi bi-person me-2"></i>基本信息
                                </h5>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">联系人姓名 <span class="text-danger">*</span></label>
                                        <input type="text" class="form-control" name="contactName" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">联系电话 <span class="text-danger">*</span></label>
                                        <input type="tel" class="form-control" name="contactPhone" required>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">公司名称</label>
                                        <input type="text" class="form-control" name="companyName">
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">所在地区</label>
                                        <select class="form-select" name="region">
                                            <option value="">请选择地区</option>
                                            <option value="华北">华北地区</option>
                                            <option value="华东">华东地区</option>
                                            <option value="华南">华南地区</option>
                                            <option value="华中">华中地区</option>
                                            <option value="西南">西南地区</option>
                                            <option value="西北">西北地区</option>
                                            <option value="东北">东北地区</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- 产品类型选择 -->
                            <div class="form-section">
                                <h5 class="section-title">
                                    <i class="bi bi-gear me-2"></i>产品类型 <span class="text-danger">*</span>
                                </h5>
                                <div class="product-type-selection">
                                    <div class="row g-3">
                                        <div class="col-md-4">
                                            <input type="radio" class="btn-check" name="productType" id="electronic" value="electronic" required>
                                            <label class="btn btn-outline-primary w-100 h-100" for="electronic">
                                                <i class="bi bi-camera-video d-block mb-2" style="font-size: 2rem;"></i>
                                                <strong>电子内窥镜</strong>
                                                <small class="d-block text-muted">数字成像，高精度</small>
                                            </label>
                                        </div>
                                        <div class="col-md-4">
                                            <input type="radio" class="btn-check" name="productType" id="fiber" value="fiber" required>
                                            <label class="btn btn-outline-warning w-100 h-100" for="fiber">
                                                <i class="bi bi-bezier d-block mb-2" style="font-size: 2rem;"></i>
                                                <strong>光纤内窥镜</strong>
                                                <small class="d-block text-muted">柔性检测，复杂路径</small>
                                            </label>
                                        </div>
                                        <div class="col-md-4">
                                            <input type="radio" class="btn-check" name="productType" id="optical" value="optical" required>
                                            <label class="btn btn-outline-info w-100 h-100" for="optical">
                                                <i class="bi bi-eye d-block mb-2" style="font-size: 2rem;"></i>
                                                <strong>光学内窥镜</strong>
                                                <small class="d-block text-muted">直线检测，高清成像</small>
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- 技术参数（动态显示） -->
                            <div class="form-section" id="technicalParams" style="display: none;">
                                <h5 class="section-title">
                                    <i class="bi bi-sliders me-2"></i>技术参数
                                </h5>
                                <div id="parameterFields">
                                    <!-- 动态生成的参数字段 -->
                                </div>
                            </div>

                            <!-- 需求描述 -->
                            <div class="form-section">
                                <h5 class="section-title">
                                    <i class="bi bi-file-text me-2"></i>需求描述 <span class="text-danger">*</span>
                                </h5>
                                <textarea class="form-control" name="description" rows="4"
                                    placeholder="请详细描述您的检测需求、应用环境、检测对象等..." required></textarea>
                            </div>

                            <!-- 预算和时间 -->
                            <div class="form-section">
                                <h5 class="section-title">
                                    <i class="bi bi-currency-dollar me-2"></i>预算与时间
                                </h5>
                                <div class="row g-3">
                                    <div class="col-md-6">
                                        <label class="form-label">预算范围</label>
                                        <select class="form-select" name="budget">
                                            <option value="">请选择预算范围</option>
                                            <option value="1-5万">1-5万元</option>
                                            <option value="5-10万">5-10万元</option>
                                            <option value="10-20万">10-20万元</option>
                                            <option value="20-50万">20-50万元</option>
                                            <option value="50万以上">50万元以上</option>
                                        </select>
                                    </div>
                                    <div class="col-md-6">
                                        <label class="form-label">期望交付时间</label>
                                        <select class="form-select" name="deliveryTime">
                                            <option value="">请选择交付时间</option>
                                            <option value="1周内">1周内</option>
                                            <option value="2周内">2周内</option>
                                            <option value="1个月内">1个月内</option>
                                            <option value="2个月内">2个月内</option>
                                            <option value="3个月内">3个月内</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <!-- 提交按钮 -->
                            <div class="form-section">
                                <div class="d-grid gap-2">
                                    <button type="submit" class="btn btn-primary btn-lg">
                                        <i class="bi bi-send me-2"></i>发布需求
                                    </button>
                                    <small class="text-muted text-center">
                                        <i class="bi bi-shield-check me-1"></i>
                                        您的信息将被严格保密，仅用于需求匹配服务
                                    </small>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                <!-- 右侧：需求展示面板 -->
                <div class="col-lg-6 display-panel">
                    <div class="panel-header">
                        <div class="d-flex justify-content-between align-items-center">
                            <div>
                                <h3>
                                    <i class="bi bi-list-ul me-2"></i>最新需求
                                </h3>
                                <p class="text-muted mb-0">查看其他用户发布的设备需求</p>
                            </div>
                            <div class="filter-controls">
                                <select class="form-select form-select-sm" id="typeFilter">
                                    <option value="">所有类型</option>
                                    <option value="electronic">电子内窥镜</option>
                                    <option value="fiber">光纤内窥镜</option>
                                    <option value="optical">光学内窥镜</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="panel-content">
                        <div class="requirements-list" id="requirementsList">
                            <!-- 动态加载的需求列表 -->
                            <div class="loading-state text-center py-5">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">加载中...</span>
                                </div>
                                <p class="mt-2 text-muted">正在加载需求信息...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

        <!-- 产品类型选择 -->
        <div class="row mb-5">
            <div class="col-12">
                <h2 class="text-center mb-4">选择产品类型</h2>
                <p class="text-center text-muted mb-5">
                    请根据您的检测需求选择合适的产品类型，我们将为您提供专业的参数配置表单
                </p>
            </div>
        </div>

        <div class="row g-4 mb-5">
            <!-- 电子内窥镜 -->
            <div class="col-lg-4">
                <div class="product-type-card h-100" data-type="electronic">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="product-icon mb-3">
                                <i class="bi bi-camera-video text-primary" style="font-size: 3rem;"></i>
                            </div>
                            <h4 class="card-title text-primary mb-3">电子内窥镜</h4>
                            <ul class="list-unstyled text-start mb-4">
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>高精度数字成像</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>支持测量录像</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>WiFi无线传输</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>图像处理功能</li>
                            </ul>
                            <div class="mb-3">
                                <small class="text-muted">
                                    <strong>适用行业：</strong>汽车、航空、精密制造
                                </small>
                            </div>
                            <button class="btn btn-primary w-100" onclick="selectProductType('electronic')">
                                选择此类型
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 光纤内窥镜 -->
            <div class="col-lg-4">
                <div class="product-type-card h-100" data-type="fiber">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="product-icon mb-3">
                                <i class="bi bi-bezier text-warning" style="font-size: 3rem;"></i>
                            </div>
                            <h4 class="card-title text-warning mb-3">光纤内窥镜</h4>
                            <ul class="list-unstyled text-start mb-4">
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>柔性检测路径</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>复杂环境适应</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>成像清晰稳定</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>多种视向角度</li>
                            </ul>
                            <div class="mb-3">
                                <small class="text-muted">
                                    <strong>适用场景：</strong>管道、容器、机械内部
                                </small>
                            </div>
                            <button class="btn btn-warning w-100" onclick="selectProductType('fiber')">
                                选择此类型
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 光学内窥镜 -->
            <div class="col-lg-4">
                <div class="product-type-card h-100" data-type="optical">
                    <div class="card h-100 border-0 shadow-sm">
                        <div class="card-body text-center p-4">
                            <div class="product-icon mb-3">
                                <i class="bi bi-eye text-info" style="font-size: 3rem;"></i>
                            </div>
                            <h4 class="card-title text-info mb-3">光学内窥镜</h4>
                            <ul class="list-unstyled text-start mb-4">
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>优异成像质量</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>操作简便可靠</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>直线检测专用</li>
                                <li class="mb-2"><i class="bi bi-check text-success me-2"></i>Hopkins光学系统</li>
                            </ul>
                            <div class="mb-3">
                                <small class="text-muted">
                                    <strong>适用检测：</strong>精密零件、医疗器械
                                </small>
                            </div>
                            <button class="btn btn-info w-100" onclick="selectProductType('optical')">
                                选择此类型
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 需求表单区域 -->
        <div id="requirementForm" class="requirement-form-section" style="display: none;">
            <div class="card border-0 shadow">
                <div class="card-header bg-primary text-white">
                    <h4 class="mb-0">
                        <i class="bi bi-form-check me-2"></i>
                        <span id="formTitle">需求详情表单</span>
                    </h4>
                </div>
                <div class="card-body p-4">
                    <!-- 动态生成的表单内容 -->
                    <div id="formContent"></div>
                </div>
            </div>
        </div>

        <!-- 联系方式区域 -->
        <div class="contact-section mt-5 mb-5">
            <div class="card border-0 shadow-sm bg-light">
                <div class="card-body p-4">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="mb-2">
                                <i class="bi bi-headset me-2 text-primary"></i>
                                需要帮助？联系我们的专业团队
                            </h5>
                            <p class="text-muted mb-0">
                                我们的技术专家随时为您提供选型建议和技术咨询服务
                            </p>
                        </div>
                        <div class="col-md-4 text-center">
                            <button class="btn btn-primary" onclick="showContactMethods()">
                                <i class="bi bi-telephone me-1"></i>联系我们
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<!-- 联系方式模态框 -->
<div class="modal fade" id="contactModal" tabindex="-1">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <div class="modal-header bg-primary text-white">
                <h5 class="modal-title">
                    <i class="bi bi-telephone me-2"></i>联系方式
                </h5>
                <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">
                <div class="row g-4">
                    <!-- 电话咨询 -->
                    <div class="col-md-6">
                        <div class="contact-method-card h-100">
                            <div class="text-center p-3 border rounded">
                                <i class="bi bi-telephone-fill text-primary mb-3" style="font-size: 2rem;"></i>
                                <h6>电话咨询</h6>
                                <p class="text-muted small mb-2">工作时间：9:00-18:00</p>
                                <a href="tel:400-XXX-XXXX" class="btn btn-outline-primary btn-sm">
                                    400-XXX-XXXX
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- 微信咨询 -->
                    <div class="col-md-6">
                        <div class="contact-method-card h-100">
                            <div class="text-center p-3 border rounded">
                                <i class="bi bi-wechat text-success mb-3" style="font-size: 2rem;"></i>
                                <h6>微信咨询</h6>
                                <p class="text-muted small mb-2">扫码添加技术顾问</p>
                                <button class="btn btn-outline-success btn-sm" onclick="showWechatQR()">
                                    扫码咨询
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- 邮件咨询 -->
                    <div class="col-md-6">
                        <div class="contact-method-card h-100">
                            <div class="text-center p-3 border rounded">
                                <i class="bi bi-envelope-fill text-info mb-3" style="font-size: 2rem;"></i>
                                <h6>邮件咨询</h6>
                                <p class="text-muted small mb-2">详细需求描述</p>
                                <a href="mailto:tech@vision-ndt.com" class="btn btn-outline-info btn-sm">
                                    发送邮件
                                </a>
                            </div>
                        </div>
                    </div>

                    <!-- 在线表单 -->
                    <div class="col-md-6">
                        <div class="contact-method-card h-100">
                            <div class="text-center p-3 border rounded">
                                <i class="bi bi-chat-dots-fill text-warning mb-3" style="font-size: 2rem;"></i>
                                <h6>在线表单</h6>
                                <p class="text-muted small mb-2">填写详细需求</p>
                                <button class="btn btn-outline-warning btn-sm" onclick="showOnlineForm()">
                                    填写表单
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="mt-4 p-3 bg-light rounded">
                    <h6 class="text-primary mb-2">
                        <i class="bi bi-info-circle me-1"></i>服务承诺
                    </h6>
                    <ul class="list-unstyled mb-0 small">
                        <li class="mb-1">✓ 24小时内专业响应</li>
                        <li class="mb-1">✓ 免费技术咨询服务</li>
                        <li class="mb-1">✓ 多家供应商方案对比</li>
                        <li class="mb-1">✓ 全程采购指导服务</li>
                    </ul>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
:root {
    --primary: #667eea;
    --secondary: #764ba2;
    --success: #28a745;
    --warning: #ffc107;
    --info: #17a2b8;
    --border: #e9ecef;
    --bg-light: #f8f9fa;
    --text-muted: #6c757d;
}

body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background-color: var(--bg-light);
}

.requirements-center-app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
}

.app-header {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    color: white;
    padding: 1.5rem 0;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.app-header h1 {
    font-size: 1.8rem;
    font-weight: 600;
}

.stats-info .badge {
    font-size: 0.85rem;
    padding: 0.5rem 0.75rem;
}

.app-main {
    flex: 1;
    padding: 0;
}

.publish-panel, .display-panel {
    height: calc(100vh - 120px);
    display: flex;
    flex-direction: column;
}

.publish-panel {
    background: white;
    border-right: 1px solid var(--border);
}

.display-panel {
    background: #fafafa;
}

.panel-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border);
    background: white;
}

.panel-header h3 {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #333;
}

.panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 1.5rem;
}

.requirement-form {
    max-width: 100%;
}

.form-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 12px;
    border: 1px solid var(--border);
}

.section-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid var(--primary);
}

.product-type-selection .btn-check:checked + .btn {
    background-color: var(--primary);
    border-color: var(--primary);
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.product-type-selection .btn {
    padding: 1rem;
    height: 120px;
    transition: all 0.3s ease;
    border: 2px solid #dee2e6;
}

.product-type-selection .btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.form-control, .form-select {
    border: 1px solid #dee2e6;
    border-radius: 8px;
    padding: 0.75rem;
    transition: border-color 0.3s ease, box-shadow 0.3s ease;
}

.form-control:focus, .form-select:focus {
    border-color: var(--primary);
    box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
}

.btn-primary {
    background: linear-gradient(135deg, var(--primary) 0%, var(--secondary) 100%);
    border: none;
    border-radius: 8px;
    padding: 0.75rem 1.5rem;
    font-weight: 600;
    transition: all 0.3s ease;
}

.btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
}

.requirements-list {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
}

.requirement-item {
    background: white;
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 1.5rem;
    margin-bottom: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;
}

.requirement-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.1);
    border-color: var(--primary);
}

.requirement-item.featured {
    border-left: 4px solid var(--warning);
    background: linear-gradient(135deg, #fff9e6 0%, #ffffff 100%);
}

.requirement-item.urgent {
    border-left: 4px solid #dc3545;
    background: linear-gradient(135deg, #ffe6e6 0%, #ffffff 100%);
}

.requirement-header {
    display: flex;
    justify-content-between;
    align-items-start;
    margin-bottom: 1rem;
}

.requirement-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #333;
    margin-bottom: 0.5rem;
}

.requirement-meta {
    display: flex;
    gap: 0.5rem;
    flex-wrap: wrap;
    margin-bottom: 1rem;
}

.requirement-meta .badge {
    font-size: 0.75rem;
    padding: 0.4rem 0.6rem;
}

.requirement-description {
    color: var(--text-muted);
    font-size: 0.9rem;
    line-height: 1.5;
    margin-bottom: 1rem;
}

.requirement-footer {
    display: flex;
    justify-content-between;
    align-items-center;
    padding-top: 1rem;
    border-top: 1px solid #f0f0f0;
}

.requirement-id {
    font-size: 0.8rem;
    color: var(--text-muted);
}

.contact-btn {
    font-size: 0.85rem;
    padding: 0.4rem 0.8rem;
}

.filter-controls .form-select {
    width: auto;
    min-width: 150px;
}

.loading-state {
    color: var(--text-muted);
}

.empty-state {
    text-align: center;
    padding: 3rem 1rem;
    color: var(--text-muted);
}

.empty-state i {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

/* 响应式设计 */
@media (max-width: 992px) {
    .app-main .row {
        flex-direction: column;
    }

    .publish-panel, .display-panel {
        height: auto;
        min-height: 50vh;
    }

    .publish-panel {
        border-right: none;
        border-bottom: 1px solid var(--border);
    }

    .panel-content {
        max-height: 60vh;
    }
}

@media (max-width: 768px) {
    .app-header {
        padding: 1rem 0;
    }

    .app-header h1 {
        font-size: 1.4rem;
    }

    .stats-info {
        margin-top: 0.5rem;
    }

    .panel-content {
        padding: 1rem;
    }

    .form-section {
        padding: 1rem;
    }

    .product-type-selection .btn {
        height: 100px;
        padding: 0.75rem;
    }
}

/* 动画效果 */
@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.requirement-item {
    animation: fadeInUp 0.3s ease;
}

.form-section {
    animation: fadeInUp 0.3s ease;
}

/* 滚动条样式 */
.panel-content::-webkit-scrollbar,
.requirements-list::-webkit-scrollbar {
    width: 6px;
}

.panel-content::-webkit-scrollbar-track,
.requirements-list::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb,
.requirements-list::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
}

.panel-content::-webkit-scrollbar-thumb:hover,
.requirements-list::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
}
</style>

<!-- JavaScript代码已移动到外部文件 -->
<script src="/js/requirements-publish.js"></script>

















---

*通过多种联系方式，我们确保您的需求能够得到及时、专业的响应和处理。*
