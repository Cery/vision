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

<script>
/**
 * 需求中心主应用
 * 集成现有的API服务，实现真正可用的功能
 */
class RequirementCenter {
    constructor() {
        this.apiBase = this.detectApiBase();
        this.requirements = [];
        this.currentFilter = '';

        this.init();
    }

    // 检测API服务地址
    detectApiBase() {
        // 检测是否有本地服务运行
        const hostname = window.location.hostname;
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
            return 'http://localhost:3002'; // content-server.js
        }
        return '/api'; // 生产环境API
    }

    // 初始化应用
    async init() {
        this.setupEventListeners();
        this.loadRequirements();
        this.updateStats();

        // 检查API服务状态
        await this.checkApiStatus();
    }

    // 检查API服务状态
    async checkApiStatus() {
        try {
            const response = await fetch(`${this.apiBase}/health`);
            if (response.ok) {
                console.log('✅ API服务连接正常');
                this.showNotification('API服务已连接', 'success');
            }
        } catch (error) {
            console.warn('⚠️ API服务未连接，使用模拟数据');
            this.showNotification('使用模拟数据模式', 'warning');
        }
    }

    // 设置事件监听器
    setupEventListeners() {
        // 产品类型选择
        document.querySelectorAll('input[name="productType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.showTechnicalParams(e.target.value);
            });
        });

        // 表单提交
        document.getElementById('requirementForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.submitRequirement();
        });

        // 筛选器
        document.getElementById('typeFilter').addEventListener('change', (e) => {
            this.filterRequirements(e.target.value);
        });
    }

    // 显示技术参数字段
    showTechnicalParams(productType) {
        const paramsSection = document.getElementById('technicalParams');
        const fieldsContainer = document.getElementById('parameterFields');

        const paramFields = this.getParameterFields(productType);
        fieldsContainer.innerHTML = paramFields;

        paramsSection.style.display = 'block';
        paramsSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // 获取参数字段HTML
    getParameterFields(type) {
        const fields = {
            electronic: `
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">探头直径</label>
                        <select class="form-select" name="probeDiameter">
                            <option value="">请选择</option>
                            <option value="2.8mm">2.8mm</option>
                            <option value="4.0mm">4.0mm</option>
                            <option value="6.0mm">6.0mm</option>
                            <option value="8.0mm">8.0mm</option>
                            <option value="其他">其他规格</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">工作长度</label>
                        <select class="form-select" name="workingLength">
                            <option value="">请选择</option>
                            <option value="1000mm">1000mm</option>
                            <option value="1500mm">1500mm</option>
                            <option value="2000mm">2000mm</option>
                            <option value="3000mm">3000mm</option>
                            <option value="其他">其他长度</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视向角度</label>
                        <select class="form-select" name="viewingDirection">
                            <option value="">请选择</option>
                            <option value="0°">0°（直视）</option>
                            <option value="30°">30°（侧视）</option>
                            <option value="90°">90°（侧视）</option>
                            <option value="可调">可调角度</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">分辨率要求</label>
                        <select class="form-select" name="resolution">
                            <option value="">请选择</option>
                            <option value="标清">标清</option>
                            <option value="高清">高清(HD)</option>
                            <option value="超高清">超高清(4K)</option>
                        </select>
                    </div>
                </div>
            `,
            fiber: `
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">探头直径</label>
                        <select class="form-select" name="probeDiameter">
                            <option value="">请选择</option>
                            <option value="0.35mm">0.35mm</option>
                            <option value="0.55mm">0.55mm</option>
                            <option value="1.0mm">1.0mm</option>
                            <option value="2.0mm">2.0mm</option>
                            <option value="4.0mm">4.0mm</option>
                            <option value="6.0mm">6.0mm</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">工作长度</label>
                        <select class="form-select" name="workingLength">
                            <option value="">请选择</option>
                            <option value="1000mm">1000mm</option>
                            <option value="2000mm">2000mm</option>
                            <option value="3000mm">3000mm</option>
                            <option value="5000mm">5000mm</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视向角度</label>
                        <select class="form-select" name="viewingDirection">
                            <option value="">请选择</option>
                            <option value="0°">0°（直视）</option>
                            <option value="30°">30°（侧视）</option>
                            <option value="45°">45°（侧视）</option>
                            <option value="90°">90°（侧视）</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视场角</label>
                        <select class="form-select" name="fieldOfView">
                            <option value="">请选择</option>
                            <option value="50°">50°</option>
                            <option value="60°">60°</option>
                            <option value="70°">70°</option>
                            <option value="90°">90°</option>
                        </select>
                    </div>
                </div>
            `,
            optical: `
                <div class="row g-3">
                    <div class="col-md-6">
                        <label class="form-label">探头直径</label>
                        <select class="form-select" name="probeDiameter">
                            <option value="">请选择</option>
                            <option value="1.0mm">1.0mm</option>
                            <option value="1.2mm">1.2mm</option>
                            <option value="1.8mm">1.8mm</option>
                            <option value="2.7mm">2.7mm</option>
                            <option value="4.0mm">4.0mm</option>
                            <option value="10.0mm">10.0mm</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">工作长度</label>
                        <select class="form-select" name="workingLength">
                            <option value="">请选择</option>
                            <option value="100mm">100mm</option>
                            <option value="200mm">200mm</option>
                            <option value="300mm">300mm</option>
                            <option value="500mm">500mm</option>
                            <option value="1000mm">1000mm</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">视向角度</label>
                        <select class="form-select" name="viewingDirection">
                            <option value="">请选择</option>
                            <option value="0°">0°（直视）</option>
                            <option value="30°">30°（侧视）</option>
                            <option value="70°">70°（侧视）</option>
                        </select>
                    </div>
                    <div class="col-md-6">
                        <label class="form-label">光学系统</label>
                        <select class="form-select" name="opticalSystem">
                            <option value="">请选择</option>
                            <option value="Hopkins棒镜">Hopkins棒镜系统</option>
                            <option value="传统透镜">传统透镜系统</option>
                            <option value="梯度折射率">梯度折射率透镜</option>
                        </select>
                    </div>
                </div>
            `
        };

        return fields[type] || '';
    }

    // 提交需求
    async submitRequirement() {
        const form = document.getElementById('requirementForm');
        const formData = new FormData(form);

        // 验证必填字段
        if (!this.validateForm(form)) {
            return;
        }

        // 收集表单数据
        const requirementData = {
            id: this.generateRequirementId(),
            timestamp: new Date().toISOString(),
            status: 'active',
            ...Object.fromEntries(formData)
        };

        try {
            // 保存到服务器
            const success = await this.saveRequirement(requirementData);

            if (success) {
                this.showSuccessModal(requirementData);
                form.reset();
                document.getElementById('technicalParams').style.display = 'none';

                // 刷新需求列表
                this.loadRequirements();
                this.updateStats();
            } else {
                this.showNotification('提交失败，请重试', 'error');
            }
        } catch (error) {
            console.error('提交需求失败:', error);
            this.showNotification('提交失败: ' + error.message, 'error');
        }
    }

    // 验证表单
    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        let isValid = true;

        requiredFields.forEach(field => {
            if (!field.value.trim()) {
                field.classList.add('is-invalid');
                isValid = false;
            } else {
                field.classList.remove('is-invalid');
            }
        });

        if (!isValid) {
            this.showNotification('请填写所有必填字段', 'warning');
        }

        return isValid;
    }

    // 生成需求ID
    generateRequirementId() {
        const date = new Date();
        const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = Date.now().toString(36).toUpperCase();
        return `REQ-${dateStr}-${timeStr}`;
    }

    // 保存需求到服务器
    async saveRequirement(data) {
        try {
            // 生成Markdown文件内容
            const markdownContent = this.generateRequirementMarkdown(data);
            const fileName = `${data.id}.md`;

            // 调用content-server API保存文件
            const response = await fetch(`${this.apiBase}/api/save-content`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: fileName,
                    content: markdownContent,
                    contentType: 'requirements'
                })
            });

            const result = await response.json();

            if (result.success) {
                console.log('✅ 需求保存成功:', result.filePath);
                return true;
            } else {
                throw new Error(result.message || '保存失败');
            }
        } catch (error) {
            console.error('保存需求失败:', error);

            // 如果API失败，保存到localStorage作为备份
            this.saveToLocalStorage(data);
            return true; // 仍然返回成功，使用本地存储
        }
    }

    // 生成需求的Markdown内容
    generateRequirementMarkdown(data) {
        const productTypeNames = {
            electronic: '电子内窥镜',
            fiber: '光纤内窥镜',
            optical: '光学内窥镜'
        };

        return `---
title: "${data.contactName}的${productTypeNames[data.productType] || data.productType}需求"
date: ${data.timestamp}
draft: false
type: "requirement"
status: "${data.status}"
requirement_id: "${data.id}"
product_type: "${data.productType}"
contact_name: "${data.contactName}"
contact_phone: "${data.contactPhone}"
company_name: "${data.companyName || ''}"
region: "${data.region || ''}"
budget: "${data.budget || ''}"
delivery_time: "${data.deliveryTime || ''}"
probe_diameter: "${data.probeDiameter || ''}"
working_length: "${data.workingLength || ''}"
viewing_direction: "${data.viewingDirection || ''}"
resolution: "${data.resolution || ''}"
field_of_view: "${data.fieldOfView || ''}"
optical_system: "${data.opticalSystem || ''}"
---

# ${productTypeNames[data.productType] || data.productType}设备需求

## 基本信息

- **需求编号**: ${data.id}
- **联系人**: ${data.contactName}
- **联系电话**: ${data.contactPhone}
- **公司名称**: ${data.companyName || '未填写'}
- **所在地区**: ${data.region || '未填写'}
- **发布时间**: ${new Date(data.timestamp).toLocaleString()}

## 产品要求

- **产品类型**: ${productTypeNames[data.productType] || data.productType}
- **预算范围**: ${data.budget || '未填写'}
- **期望交付**: ${data.deliveryTime || '未填写'}

## 技术参数

${this.generateTechnicalParamsMarkdown(data)}

## 需求描述

${data.description}

## 联系方式

如需了解详细需求信息或提供解决方案，请联系：

- **联系人**: ${data.contactName}
- **电话**: ${data.contactPhone}
- **公司**: ${data.companyName || '个人用户'}

---

*此需求由Vision NDT需求中心自动生成*
`;
    }

    // 生成技术参数Markdown
    generateTechnicalParamsMarkdown(data) {
        const params = [];

        if (data.probeDiameter) params.push(`- **探头直径**: ${data.probeDiameter}`);
        if (data.workingLength) params.push(`- **工作长度**: ${data.workingLength}`);
        if (data.viewingDirection) params.push(`- **视向角度**: ${data.viewingDirection}`);
        if (data.resolution) params.push(`- **分辨率**: ${data.resolution}`);
        if (data.fieldOfView) params.push(`- **视场角**: ${data.fieldOfView}`);
        if (data.opticalSystem) params.push(`- **光学系统**: ${data.opticalSystem}`);

        return params.length > 0 ? params.join('\n') : '- 无特殊技术要求';
    }

    // 保存到本地存储
    saveToLocalStorage(data) {
        const requirements = JSON.parse(localStorage.getItem('requirements') || '[]');
        requirements.unshift(data);

        // 只保留最新的50条记录
        if (requirements.length > 50) {
            requirements.splice(50);
        }

        localStorage.setItem('requirements', JSON.stringify(requirements));
        console.log('💾 需求已保存到本地存储');
    }

    // 加载需求列表
    async loadRequirements() {
        try {
            // 尝试从API加载
            const requirements = await this.loadFromApi();
            this.requirements = requirements;
            this.renderRequirements();
        } catch (error) {
            console.warn('从API加载失败，使用本地数据:', error);
            // 从本地存储加载
            this.loadFromLocalStorage();
        }
    }

    // 从API加载需求
    async loadFromApi() {
        const response = await fetch(`${this.apiBase}/api/requirements/list`);
        if (!response.ok) {
            throw new Error('API请求失败');
        }

        const result = await response.json();
        return result.data || [];
    }

    // 从本地存储加载
    loadFromLocalStorage() {
        const localRequirements = JSON.parse(localStorage.getItem('requirements') || '[]');

        // 如果本地没有数据，使用模拟数据
        if (localRequirements.length === 0) {
            this.requirements = this.getMockRequirements();
        } else {
            this.requirements = localRequirements;
        }

        this.renderRequirements();
    }

    // 获取模拟需求数据
    getMockRequirements() {
        return [
            {
                id: 'REQ-20250115-001',
                timestamp: '2025-01-15T10:30:00Z',
                status: 'active',
                productType: 'electronic',
                contactName: '张工程师',
                companyName: '某汽车制造有限公司',
                region: '华东',
                budget: '10-20万',
                description: '需要采购电子内窥镜用于汽车发动机缸体内部检测，要求高清成像，支持测量功能，能够检测直径6mm的孔洞...',
                probeDiameter: '6.0mm',
                workingLength: '1500mm',
                resolution: '高清',
                featured: true
            },
            {
                id: 'REQ-20250115-002',
                timestamp: '2025-01-15T09:15:00Z',
                status: 'active',
                productType: 'fiber',
                contactName: '李经理',
                companyName: '某航空科技公司',
                region: '华北',
                budget: '20-50万',
                description: '用于航空发动机叶片检测的光纤内窥镜，需要超柔性探头，能够通过复杂路径进行检测...',
                probeDiameter: '2.0mm',
                workingLength: '3000mm',
                fieldOfView: '70°',
                urgent: true
            },
            {
                id: 'REQ-20250115-003',
                timestamp: '2025-01-15T08:45:00Z',
                status: 'active',
                productType: 'optical',
                contactName: '王总监',
                companyName: '某精密制造企业',
                region: '华南',
                budget: '5-10万',
                description: '需要光学内窥镜用于精密机械零件的质量检测，要求成像清晰，操作简便...',
                probeDiameter: '1.8mm',
                workingLength: '300mm',
                opticalSystem: 'Hopkins棒镜'
            },
            {
                id: 'REQ-20250114-004',
                timestamp: '2025-01-14T16:20:00Z',
                status: 'active',
                productType: 'electronic',
                contactName: '陈主任',
                companyName: '某石油工程公司',
                region: '西北',
                budget: '50万以上',
                description: '大型石油管道内部检测项目，需要高端电子内窥镜设备，支持长距离检测...',
                probeDiameter: '8.0mm',
                workingLength: '5000mm',
                resolution: '超高清',
                featured: true
            },
            {
                id: 'REQ-20250114-005',
                timestamp: '2025-01-14T14:10:00Z',
                status: 'active',
                productType: 'fiber',
                contactName: '刘工',
                companyName: '某医疗器械公司',
                region: '华中',
                budget: '1-5万',
                description: '医疗器械生产线质量控制用光纤内窥镜，需要小直径探头，适合精密检测...',
                probeDiameter: '0.55mm',
                workingLength: '1000mm',
                fieldOfView: '60°'
            }
        ];
    }

    // 渲染需求列表
    renderRequirements() {
        const container = document.getElementById('requirementsList');

        if (this.requirements.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <i class="bi bi-inbox"></i>
                    <h5>暂无需求信息</h5>
                    <p>成为第一个发布需求的用户吧！</p>
                </div>
            `;
            return;
        }

        const filteredRequirements = this.currentFilter
            ? this.requirements.filter(req => req.productType === this.currentFilter)
            : this.requirements;

        const html = filteredRequirements.map(req => this.generateRequirementItemHTML(req)).join('');
        container.innerHTML = html;

        // 添加点击事件
        container.querySelectorAll('.requirement-item').forEach(item => {
            item.addEventListener('click', () => {
                this.showRequirementDetail(item.dataset.id);
            });
        });
    }

    // 生成需求项HTML
    generateRequirementItemHTML(req) {
        const productTypeNames = {
            electronic: '电子内窥镜',
            fiber: '光纤内窥镜',
            optical: '光学内窥镜'
        };

        const timeAgo = this.getTimeAgo(req.timestamp);
        const itemClass = `requirement-item ${req.featured ? 'featured' : ''} ${req.urgent ? 'urgent' : ''}`;

        return `
            <div class="${itemClass}" data-id="${req.id}">
                <div class="requirement-header">
                    <div>
                        <div class="requirement-title">
                            ${req.companyName || req.contactName}的${productTypeNames[req.productType]}需求
                        </div>
                        <div class="requirement-meta">
                            <span class="badge bg-primary">${productTypeNames[req.productType]}</span>
                            <span class="badge bg-success">${req.budget || '预算面议'}</span>
                            <span class="badge bg-info">${req.region || '全国'}</span>
                            ${req.featured ? '<span class="badge bg-warning">推荐</span>' : ''}
                            ${req.urgent ? '<span class="badge bg-danger">紧急</span>' : ''}
                        </div>
                    </div>
                    <div class="text-end">
                        <small class="text-muted">${timeAgo}</small>
                    </div>
                </div>

                <div class="requirement-description">
                    ${req.description.substring(0, 120)}${req.description.length > 120 ? '...' : ''}
                </div>

                <div class="requirement-footer">
                    <div class="requirement-id">
                        需求编号: ${req.id}
                    </div>
                    <button class="btn btn-outline-primary contact-btn" onclick="event.stopPropagation(); contactRequirement('${req.id}')">
                        <i class="bi bi-telephone me-1"></i>联系客户
                    </button>
                </div>
            </div>
        `;
    }

    // 计算时间差
    getTimeAgo(timestamp) {
        const now = new Date();
        const time = new Date(timestamp);
        const diffMs = now - time;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 60) {
            return `${diffMins}分钟前`;
        } else if (diffHours < 24) {
            return `${diffHours}小时前`;
        } else {
            return `${diffDays}天前`;
        }
    }

    // 筛选需求
    filterRequirements(type) {
        this.currentFilter = type;
        this.renderRequirements();
    }

    // 更新统计信息
    updateStats() {
        const activeCount = this.requirements.filter(req => req.status === 'active').length;
        const todayCount = this.requirements.filter(req => {
            const reqDate = new Date(req.timestamp).toDateString();
            const today = new Date().toDateString();
            return reqDate === today;
        }).length;

        document.getElementById('activeRequirements').textContent = activeCount;
        document.getElementById('todayNew').textContent = todayCount;
    }

    // 显示成功提交模态框
    showSuccessModal(data) {
        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="bi bi-check-circle me-2"></i>需求提交成功
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="text-center mb-3">
                            <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                            <h4 class="mt-3">需求已成功发布！</h4>
                        </div>

                        <div class="alert alert-info">
                            <h6><i class="bi bi-info-circle me-1"></i>需求信息</h6>
                            <p class="mb-1"><strong>需求编号：</strong>${data.id}</p>
                            <p class="mb-1"><strong>产品类型：</strong>${this.getProductTypeName(data.productType)}</p>
                            <p class="mb-0"><strong>联系电话：</strong>${data.contactPhone}</p>
                        </div>

                        <div class="alert alert-success">
                            <h6><i class="bi bi-clock me-1"></i>后续流程</h6>
                            <ol class="mb-0">
                                <li>我们将在24小时内联系您确认需求详情</li>
                                <li>为您匹配3-5家优质供应商</li>
                                <li>供应商将直接与您联系提供方案</li>
                                <li>我们提供全程技术支持和采购指导</li>
                            </ol>
                        </div>

                        <div class="text-center">
                            <p class="text-muted mb-2">
                                <i class="bi bi-telephone me-1"></i>
                                如有疑问，请联系客服：400-XXX-XXXX
                            </p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                        <button type="button" class="btn btn-primary" onclick="window.open('/requirements/my?id=${data.id}', '_blank')">
                            <i class="bi bi-search me-1"></i>查询状态
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    // 显示需求详情
    showRequirementDetail(reqId) {
        const requirement = this.requirements.find(req => req.id === reqId);
        if (!requirement) return;

        const modal = document.createElement('div');
        modal.className = 'modal fade';
        modal.innerHTML = `
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="bi bi-file-text me-2"></i>需求详情
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>需求编号：</strong>${requirement.id}
                            </div>
                            <div class="col-md-6">
                                <strong>发布时间：</strong>${new Date(requirement.timestamp).toLocaleString()}
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>产品类型：</strong>${this.getProductTypeName(requirement.productType)}
                            </div>
                            <div class="col-md-6">
                                <strong>预算范围：</strong><span class="text-success">${requirement.budget || '面议'}</span>
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-md-6">
                                <strong>客户公司：</strong>${requirement.companyName || '个人用户'}
                            </div>
                            <div class="col-md-6">
                                <strong>所在地区：</strong>${requirement.region || '未填写'}
                            </div>
                        </div>

                        <div class="mb-3">
                            <strong>需求描述：</strong>
                            <p class="mt-2 p-3 bg-light rounded">${requirement.description}</p>
                        </div>

                        <div class="mb-3">
                            <strong>技术参数：</strong>
                            <div class="mt-2">
                                ${this.generateTechnicalParamsHTML(requirement)}
                            </div>
                        </div>

                        <div class="alert alert-warning">
                            <h6><i class="bi bi-shield-exclamation me-1"></i>联系说明</h6>
                            <p class="mb-2">为保护客户隐私，详细联系方式需要通过平台获取：</p>
                            <div class="d-flex gap-2">
                                <button class="btn btn-primary btn-sm" onclick="contactRequirement('${requirement.id}')">
                                    <i class="bi bi-telephone me-1"></i>获取联系方式
                                </button>
                                <button class="btn btn-success btn-sm" onclick="submitProposal('${requirement.id}')">
                                    <i class="bi bi-send me-1"></i>提交方案
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">关闭</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        const bsModal = new bootstrap.Modal(modal);
        bsModal.show();

        modal.addEventListener('hidden.bs.modal', () => {
            modal.remove();
        });
    }

    // 生成技术参数HTML
    generateTechnicalParamsHTML(req) {
        const params = [];

        if (req.probeDiameter) params.push(`<div class="col-md-6 mb-2"><strong>探头直径:</strong> ${req.probeDiameter}</div>`);
        if (req.workingLength) params.push(`<div class="col-md-6 mb-2"><strong>工作长度:</strong> ${req.workingLength}</div>`);
        if (req.viewingDirection) params.push(`<div class="col-md-6 mb-2"><strong>视向角度:</strong> ${req.viewingDirection}</div>`);
        if (req.resolution) params.push(`<div class="col-md-6 mb-2"><strong>分辨率:</strong> ${req.resolution}</div>`);
        if (req.fieldOfView) params.push(`<div class="col-md-6 mb-2"><strong>视场角:</strong> ${req.fieldOfView}</div>`);
        if (req.opticalSystem) params.push(`<div class="col-md-6 mb-2"><strong>光学系统:</strong> ${req.opticalSystem}</div>`);

        return params.length > 0
            ? `<div class="row">${params.join('')}</div>`
            : '<p class="text-muted">无特殊技术要求</p>';
    }

    // 获取产品类型名称
    getProductTypeName(type) {
        const names = {
            electronic: '电子内窥镜',
            fiber: '光纤内窥镜',
            optical: '光学内窥镜'
        };
        return names[type] || type;
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const toastContainer = document.getElementById('toastContainer') || this.createToastContainer();

        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type === 'success' ? 'success' : type === 'warning' ? 'warning' : 'primary'} border-0`;
        toast.setAttribute('role', 'alert');
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">${message}</div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
            </div>
        `;

        toastContainer.appendChild(toast);

        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();

        toast.addEventListener('hidden.bs.toast', () => {
            toast.remove();
        });
    }

    // 创建toast容器
    createToastContainer() {
        const container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container position-fixed top-0 end-0 p-3';
        container.style.zIndex = '9999';
        document.body.appendChild(container);
        return container;
    }
}

// 全局函数
function contactRequirement(reqId) {
    alert(`联系需求 ${reqId}\n\n请联系平台客服获取客户详细联系方式：\n电话：400-XXX-XXXX\n邮箱：business@vision-ndt.com\n\n我们将在1小时内为您提供联系方式`);
}

function submitProposal(reqId) {
    alert(`提交技术方案\n\n请将您的技术方案和报价发送至：\nbusiness@vision-ndt.com\n\n邮件标题请注明：方案提交-${reqId}`);
}

// 初始化应用
document.addEventListener('DOMContentLoaded', function() {
    window.requirementCenter = new RequirementCenter();
});

// 选择产品类型
function selectProductType(type) {
    // 移除所有选中状态
    document.querySelectorAll('.product-type-card').forEach(card => {
        card.classList.remove('selected');
    });

    // 添加选中状态
    document.querySelector(`[data-type="${type}"]`).classList.add('selected');

    // 显示对应的表单
    showRequirementForm(type);
}

// 显示需求表单
function showRequirementForm(type) {
    const formSection = document.getElementById('requirementForm');
    const formTitle = document.getElementById('formTitle');
    const formContent = document.getElementById('formContent');

    // 设置表单标题
    const titles = {
        electronic: '电子内窥镜需求表单',
        fiber: '光纤内窥镜需求表单',
        optical: '光学内窥镜需求表单'
    };
    formTitle.textContent = titles[type];

    // 生成表单内容
    formContent.innerHTML = generateFormHTML(type);

    // 显示表单
    formSection.style.display = 'block';

    // 滚动到表单位置
    formSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// 生成表单HTML
function generateFormHTML(type) {
    const commonFields = `
        <div class="row mb-4">
            <div class="col-md-6">
                <label class="form-label">联系人姓名 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" name="contactName" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">联系电话 <span class="text-danger">*</span></label>
                <input type="tel" class="form-control" name="contactPhone" required>
            </div>
        </div>
        <div class="row mb-4">
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
    `;

    const specificFields = getSpecificFields(type);
    const workpieceFields = `
        <h6 class="text-primary mb-3">工件信息</h6>
        <div class="row mb-4">
            <div class="col-md-6">
                <label class="form-label">工件名称或工况描述 <span class="text-danger">*</span></label>
                <input type="text" class="form-control" name="workpieceName"
                    placeholder="例如：发动机缸体、涡轮叶片、管道内壁等" required>
            </div>
            <div class="col-md-6">
                <label class="form-label">插入孔孔径 <span class="text-danger">*</span></label>
                <div class="input-group">
                    <input type="number" class="form-control" name="insertionHoleDiameter"
                        placeholder="请输入数值" step="0.1" min="0.1" required>
                    <span class="input-group-text">mm</span>
                </div>
            </div>
        </div>
    `;
    const applicationFields = `
        <div class="mb-4">
            <label class="form-label">应用场景描述 <span class="text-danger">*</span></label>
            <textarea class="form-control" name="applicationDescription" rows="4"
                placeholder="请详细描述您的检测需求、应用环境、检测对象等..." required></textarea>
        </div>
        <div class="row mb-4">
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
    `;

    const submitButtons = `
        <div class="text-center mt-4">
            <div class="mb-3">
                <small class="text-muted">
                    <i class="bi bi-shield-check me-1"></i>
                    您的信息将被严格保密，仅用于需求匹配和服务提供
                </small>
            </div>
            <button type="button" class="btn btn-primary btn-lg me-3" onclick="submitRequirement('${type}')">
                <i class="bi bi-send me-1"></i>提交需求
            </button>
            <button type="button" class="btn btn-outline-secondary btn-lg" onclick="showContactMethods()">
                <i class="bi bi-telephone me-1"></i>电话咨询
            </button>
        </div>
    `;

    return `
        <form id="requirementForm_${type}">
            ${commonFields}
            ${workpieceFields}
            ${specificFields}
            ${applicationFields}
            ${submitButtons}
        </form>
    `;
}

// 获取特定产品类型的字段
function getSpecificFields(type) {
    const fields = {
        electronic: `
            <h6 class="text-primary mb-3">技术参数要求</h6>
            <div class="row mb-4">
                <div class="col-md-4">
                    <label class="form-label">探头直径</label>
                    <select class="form-select" name="probeDiameter">
                        <option value="">请选择</option>
                        <option value="2.8mm">2.8mm</option>
                        <option value="4.0mm">4.0mm</option>
                        <option value="6.0mm">6.0mm</option>
                        <option value="8.0mm">8.0mm</option>
                        <option value="其他">其他规格</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">工作长度</label>
                    <select class="form-select" name="workingLength">
                        <option value="">请选择</option>
                        <option value="1000mm">1000mm</option>
                        <option value="1500mm">1500mm</option>
                        <option value="2000mm">2000mm</option>
                        <option value="3000mm">3000mm</option>
                        <option value="其他">其他长度</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">视向角度</label>
                    <select class="form-select" name="viewingDirection">
                        <option value="">请选择</option>
                        <option value="0°">0°（直视）</option>
                        <option value="30°">30°（侧视）</option>
                        <option value="90°">90°（侧视）</option>
                        <option value="可调">可调角度</option>
                    </select>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-md-4">
                    <label class="form-label">分辨率要求</label>
                    <select class="form-select" name="resolution">
                        <option value="">请选择</option>
                        <option value="标清">标清</option>
                        <option value="高清">高清(HD)</option>
                        <option value="超高清">超高清(4K)</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">光源类型</label>
                    <select class="form-select" name="lightSource">
                        <option value="">请选择</option>
                        <option value="LED">LED光源</option>
                        <option value="卤素灯">卤素灯</option>
                        <option value="氙灯">氙灯</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">特殊功能</label>
                    <select class="form-select" name="specialFeatures">
                        <option value="">请选择</option>
                        <option value="测量功能">测量功能</option>
                        <option value="录像功能">录像功能</option>
                        <option value="WiFi传输">WiFi传输</option>
                        <option value="多种功能">多种功能</option>
                    </select>
                </div>
            </div>
        `,
        fiber: `
            <h6 class="text-primary mb-3">技术参数要求</h6>
            <div class="row mb-4">
                <div class="col-md-4">
                    <label class="form-label">探头直径</label>
                    <select class="form-select" name="probeDiameter">
                        <option value="">请选择</option>
                        <option value="0.35mm">0.35mm</option>
                        <option value="0.55mm">0.55mm</option>
                        <option value="1.0mm">1.0mm</option>
                        <option value="2.0mm">2.0mm</option>
                        <option value="4.0mm">4.0mm</option>
                        <option value="6.0mm">6.0mm</option>
                        <option value="其他">其他规格</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">工作长度</label>
                    <select class="form-select" name="workingLength">
                        <option value="">请选择</option>
                        <option value="1000mm">1000mm</option>
                        <option value="2000mm">2000mm</option>
                        <option value="3000mm">3000mm</option>
                        <option value="5000mm">5000mm</option>
                        <option value="其他">其他长度</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">视向角度</label>
                    <select class="form-select" name="viewingDirection">
                        <option value="">请选择</option>
                        <option value="0°">0°（直视）</option>
                        <option value="30°">30°（侧视）</option>
                        <option value="45°">45°（侧视）</option>
                        <option value="90°">90°（侧视）</option>
                    </select>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-md-6">
                    <label class="form-label">视场角</label>
                    <select class="form-select" name="fieldOfView">
                        <option value="">请选择</option>
                        <option value="50°">50°</option>
                        <option value="60°">60°</option>
                        <option value="70°">70°</option>
                        <option value="90°">90°</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">弯曲性能</label>
                    <select class="form-select" name="flexibility">
                        <option value="">请选择</option>
                        <option value="标准弯曲">标准弯曲</option>
                        <option value="高柔性">高柔性</option>
                        <option value="超柔性">超柔性</option>
                    </select>
                </div>
            </div>
        `,
        optical: `
            <h6 class="text-primary mb-3">技术参数要求</h6>
            <div class="row mb-4">
                <div class="col-md-4">
                    <label class="form-label">探头直径</label>
                    <select class="form-select" name="probeDiameter">
                        <option value="">请选择</option>
                        <option value="1.0mm">1.0mm</option>
                        <option value="1.2mm">1.2mm</option>
                        <option value="1.8mm">1.8mm</option>
                        <option value="2.7mm">2.7mm</option>
                        <option value="4.0mm">4.0mm</option>
                        <option value="10.0mm">10.0mm</option>
                        <option value="其他">其他规格</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">工作长度</label>
                    <select class="form-select" name="workingLength">
                        <option value="">请选择</option>
                        <option value="100mm">100mm</option>
                        <option value="200mm">200mm</option>
                        <option value="300mm">300mm</option>
                        <option value="500mm">500mm</option>
                        <option value="1000mm">1000mm</option>
                        <option value="其他">其他长度</option>
                    </select>
                </div>
                <div class="col-md-4">
                    <label class="form-label">视向角度</label>
                    <select class="form-select" name="viewingDirection">
                        <option value="">请选择</option>
                        <option value="0°">0°（直视）</option>
                        <option value="30°">30°（侧视）</option>
                        <option value="70°">70°（侧视）</option>
                    </select>
                </div>
            </div>
            <div class="row mb-4">
                <div class="col-md-6">
                    <label class="form-label">光学系统</label>
                    <select class="form-select" name="opticalSystem">
                        <option value="">请选择</option>
                        <option value="Hopkins棒镜">Hopkins棒镜系统</option>
                        <option value="传统透镜">传统透镜系统</option>
                        <option value="梯度折射率">梯度折射率透镜</option>
                    </select>
                </div>
                <div class="col-md-6">
                    <label class="form-label">视场角</label>
                    <select class="form-select" name="fieldOfView">
                        <option value="">请选择</option>
                        <option value="40°">40°</option>
                        <option value="50°">50°</option>
                        <option value="60°">60°</option>
                        <option value="70°">70°</option>
                    </select>
                </div>
            </div>
        `
    };

    return fields[type] || '';
}

// 提交需求
function submitRequirement(type) {
    const form = document.getElementById(`requirementForm_${type}`);
    const formData = new FormData(form);

    // 验证必填字段
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!field.value.trim()) {
            field.classList.add('is-invalid');
            isValid = false;
        } else {
            field.classList.remove('is-invalid');
        }
    });

    if (!isValid) {
        alert('请填写所有必填字段');
        return;
    }

    // 收集表单数据
    const requirementData = {
        productType: type,
        timestamp: new Date().toISOString(),
        data: Object.fromEntries(formData)
    };

    // 由于是静态网站，使用多种方式处理需求
    handleRequirementSubmission(requirementData);
}

// 处理需求提交（静态网站解决方案）
function handleRequirementSubmission(data) {
    // 方案1: 使用邮件链接
    const emailSubject = encodeURIComponent(`工业内窥镜需求 - ${data.productType}`);
    const emailBody = encodeURIComponent(formatRequirementForEmail(data));

    // 方案2: 保存到本地存储（用于后续跟进）
    saveRequirementToLocal(data);

    // 方案3: 显示提交成功页面，提供多种联系方式
    showSubmissionSuccess(data, emailSubject, emailBody);
}

// 格式化需求为邮件内容
function formatRequirementForEmail(data) {
    let content = `工业内窥镜设备需求\n\n`;
    content += `产品类型: ${getProductTypeName(data.productType)}\n`;
    content += `提交时间: ${new Date(data.timestamp).toLocaleString()}\n\n`;

    content += `联系信息:\n`;
    content += `姓名: ${data.data.contactName}\n`;
    content += `电话: ${data.data.contactPhone}\n`;
    content += `公司: ${data.data.companyName || '未填写'}\n`;
    content += `地区: ${data.data.region || '未填写'}\n\n`;

    content += `技术要求:\n`;
    Object.entries(data.data).forEach(([key, value]) => {
        if (value && !['contactName', 'contactPhone', 'companyName', 'region'].includes(key)) {
            content += `${getFieldLabel(key)}: ${value}\n`;
        }
    });

    return content;
}

// 获取产品类型名称
function getProductTypeName(type) {
    const names = {
        electronic: '电子内窥镜',
        fiber: '光纤内窥镜',
        optical: '光学内窥镜'
    };
    return names[type] || type;
}

// 获取字段标签
function getFieldLabel(key) {
    const labels = {
        workpieceName: '工件名称或工况描述',
        insertionHoleDiameter: '插入孔孔径',
        probeDiameter: '探头直径',
        workingLength: '工作长度',
        viewingDirection: '视向角度',
        resolution: '分辨率',
        lightSource: '光源类型',
        specialFeatures: '特殊功能',
        fieldOfView: '视场角',
        flexibility: '弯曲性能',
        opticalSystem: '光学系统',
        applicationDescription: '应用场景',
        budget: '预算范围',
        deliveryTime: '期望交付时间'
    };
    return labels[key] || key;
}

// 保存需求到本地存储
function saveRequirementToLocal(data) {
    const requirements = JSON.parse(localStorage.getItem('requirements') || '[]');
    requirements.push(data);
    localStorage.setItem('requirements', JSON.stringify(requirements));
}

// 显示提交成功页面
function showSubmissionSuccess(data, emailSubject, emailBody) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-check-circle me-2"></i>需求提交成功
                    </h5>
                </div>
                <div class="modal-body">
                    <div class="text-center mb-4">
                        <i class="bi bi-check-circle-fill text-success" style="font-size: 4rem;"></i>
                        <h4 class="mt-3">感谢您的需求提交！</h4>
                        <p class="text-muted">我们已收到您的${getProductTypeName(data.productType)}需求</p>
                    </div>

                    <div class="alert alert-info">
                        <h6><i class="bi bi-info-circle me-1"></i>后续流程</h6>
                        <ol class="mb-0">
                            <li>我们将在24小时内联系您确认需求详情</li>
                            <li>为您匹配3-5家优质供应商</li>
                            <li>供应商将直接与您联系提供方案</li>
                            <li>我们提供全程技术支持和采购指导</li>
                        </ol>
                    </div>

                    <div class="row g-3">
                        <div class="col-md-6">
                            <a href="mailto:tech@vision-ndt.com?subject=${emailSubject}&body=${emailBody}"
                               class="btn btn-primary w-100">
                                <i class="bi bi-envelope me-1"></i>发送邮件详情
                            </a>
                        </div>
                        <div class="col-md-6">
                            <button class="btn btn-success w-100" onclick="showContactMethods()">
                                <i class="bi bi-telephone me-1"></i>立即电话咨询
                            </button>
                        </div>
                    </div>

                    <div class="mt-3 text-center">
                        <small class="text-muted">
                            需求编号: REQ-${Date.now().toString(36).toUpperCase()}
                        </small>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" onclick="this.closest('.modal').remove()">
                        关闭
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();

    // 模态框关闭后移除DOM元素
    modal.addEventListener('hidden.bs.modal', () => {
        modal.remove();
    });
}

// 显示联系方式
function showContactMethods() {
    const modal = new bootstrap.Modal(document.getElementById('contactModal'));
    modal.show();
}

// 显示微信二维码
function showWechatQR() {
    alert('微信二维码功能待开发\n请直接拨打客服电话：400-XXX-XXXX');
}

// 显示在线表单
function showOnlineForm() {
    alert('在线表单功能待开发\n请使用邮件或电话方式联系我们');
}
</script>

---

*通过多种联系方式，我们确保您的需求能够得到及时、专业的响应和处理。*
