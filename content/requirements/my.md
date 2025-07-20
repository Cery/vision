---
title: "需求查询"
description: "查询您提交的工业内窥镜设备需求处理状态和进展情况"
date: 2025-01-15T10:00:00+08:00
draft: false
layout: "single"
type: "requirements"
seo_title: "需求状态查询 - Vision NDT"
seo_description: "查询您在Vision NDT平台提交的工业内窥镜设备需求的处理状态、供应商响应情况和项目进展。"
seo_keywords: ["需求查询", "状态跟踪", "项目进展", "供应商响应"]
---

<div class="requirement-query-page">
    <!-- 页面头部 -->
    <div class="hero-section bg-gradient-success text-white py-5 mb-5">
        <div class="container">
            <div class="row align-items-center">
                <div class="col-lg-8">
                    <h1 class="display-5 fw-bold mb-3">需求查询</h1>
                    <p class="lead mb-4">查询您提交的设备需求处理状态和进展情况</p>
                    <div class="d-flex gap-3">
                        <span class="badge bg-light text-dark px-3 py-2">
                            <i class="bi bi-search me-1"></i>快速查询
                        </span>
                        <span class="badge bg-light text-dark px-3 py-2">
                            <i class="bi bi-clock me-1"></i>实时状态
                        </span>
                        <span class="badge bg-light text-dark px-3 py-2">
                            <i class="bi bi-telephone me-1"></i>人工服务
                        </span>
                    </div>
                </div>
                <div class="col-lg-4 text-center">
                    <i class="bi bi-clipboard-check display-1 opacity-75"></i>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <!-- 查询方式 -->
        <div class="row mb-5">
            <div class="col-lg-8 mx-auto">
                <div class="card border-0 shadow">
                    <div class="card-header bg-primary text-white">
                        <h5 class="mb-0">
                            <i class="bi bi-search me-2"></i>需求状态查询
                        </h5>
                    </div>
                    <div class="card-body p-4">
                        <div class="alert alert-info">
                            <h6><i class="bi bi-info-circle me-1"></i>查询说明</h6>
                            <p class="mb-0">
                                由于本平台为静态展示网站，需求状态查询需要通过以下方式进行。
                                我们的客服团队将为您提供详细的需求处理状态和进展信息。
                            </p>
                        </div>

                        <!-- 查询表单 -->
                        <form id="queryForm" class="mb-4">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">需求编号</label>
                                    <input type="text" class="form-control" id="requirementId" 
                                           placeholder="例如：REQ-20250115001" 
                                           pattern="REQ-[0-9A-Z]+" 
                                           title="请输入正确的需求编号格式">
                                    <small class="text-muted">需求编号在提交成功后会显示</small>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">联系电话</label>
                                    <input type="tel" class="form-control" id="contactPhone" 
                                           placeholder="提交需求时填写的电话号码" required>
                                    <small class="text-muted">用于身份验证</small>
                                </div>
                            </div>
                            <div class="text-center">
                                <button type="button" class="btn btn-primary btn-lg" onclick="queryRequirement()">
                                    <i class="bi bi-search me-1"></i>查询需求状态
                                </button>
                            </div>
                        </form>

                        <!-- 其他查询方式 -->
                        <div class="row g-3">
                            <div class="col-md-4">
                                <div class="text-center p-3 border rounded">
                                    <i class="bi bi-telephone-fill text-primary mb-2" style="font-size: 2rem;"></i>
                                    <h6>电话查询</h6>
                                    <p class="small text-muted mb-2">直接致电客服查询</p>
                                    <a href="tel:400-XXX-XXXX" class="btn btn-outline-primary btn-sm">
                                        400-XXX-XXXX
                                    </a>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-center p-3 border rounded">
                                    <i class="bi bi-wechat text-success mb-2" style="font-size: 2rem;"></i>
                                    <h6>微信查询</h6>
                                    <p class="small text-muted mb-2">添加客服微信查询</p>
                                    <button class="btn btn-outline-success btn-sm" onclick="showWechatContact()">
                                        添加客服
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-4">
                                <div class="text-center p-3 border rounded">
                                    <i class="bi bi-envelope-fill text-info mb-2" style="font-size: 2rem;"></i>
                                    <h6>邮件查询</h6>
                                    <p class="small text-muted mb-2">发送邮件查询状态</p>
                                    <a href="mailto:service@vision-ndt.com" class="btn btn-outline-info btn-sm">
                                        发送邮件
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 需求处理流程 -->
        <div class="row mb-5">
            <div class="col-12">
                <h3 class="text-center mb-4">需求处理流程</h3>
                <div class="process-timeline">
                    <div class="row">
                        <div class="col-md-3">
                            <div class="process-step text-center">
                                <div class="step-icon bg-primary text-white rounded-circle mx-auto mb-3">
                                    <i class="bi bi-file-earmark-plus"></i>
                                </div>
                                <h6>1. 需求提交</h6>
                                <p class="small text-muted">客户提交设备需求信息</p>
                                <small class="text-primary">即时完成</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="process-step text-center">
                                <div class="step-icon bg-warning text-white rounded-circle mx-auto mb-3">
                                    <i class="bi bi-search"></i>
                                </div>
                                <h6>2. 需求审核</h6>
                                <p class="small text-muted">平台审核需求信息完整性</p>
                                <small class="text-warning">2-4小时</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="process-step text-center">
                                <div class="step-icon bg-info text-white rounded-circle mx-auto mb-3">
                                    <i class="bi bi-people"></i>
                                </div>
                                <h6>3. 供应商匹配</h6>
                                <p class="small text-muted">匹配合适的供应商</p>
                                <small class="text-info">1-2个工作日</small>
                            </div>
                        </div>
                        <div class="col-md-3">
                            <div class="process-step text-center">
                                <div class="step-icon bg-success text-white rounded-circle mx-auto mb-3">
                                    <i class="bi bi-handshake"></i>
                                </div>
                                <h6>4. 方案对接</h6>
                                <p class="small text-muted">供应商联系客户</p>
                                <small class="text-success">3-5个工作日</small>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 常见问题 -->
        <div class="row mb-5">
            <div class="col-lg-10 mx-auto">
                <h3 class="text-center mb-4">常见问题</h3>
                <div class="accordion" id="faqAccordion">
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#faq1">
                                如何查询我的需求处理状态？
                            </button>
                        </h2>
                        <div id="faq1" class="accordion-collapse collapse show" data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                您可以通过以下方式查询需求状态：
                                <ul class="mt-2">
                                    <li>使用需求编号和联系电话在线查询</li>
                                    <li>拨打客服热线：400-XXX-XXXX</li>
                                    <li>添加客服微信进行查询</li>
                                    <li>发送邮件至：service@vision-ndt.com</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq2">
                                需求处理需要多长时间？
                            </button>
                        </h2>
                        <div id="faq2" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                一般情况下：
                                <ul class="mt-2">
                                    <li>需求审核：2-4小时</li>
                                    <li>供应商匹配：1-2个工作日</li>
                                    <li>首次联系：3-5个工作日</li>
                                    <li>方案提供：1-2周（根据需求复杂度）</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq3">
                                如果长时间没有供应商联系怎么办？
                            </button>
                        </h2>
                        <div id="faq3" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                如果超过一周没有供应商联系您，请：
                                <ul class="mt-2">
                                    <li>联系客服查询匹配情况</li>
                                    <li>确认需求信息是否需要补充</li>
                                    <li>考虑调整需求参数或预算范围</li>
                                    <li>申请人工推荐服务</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                    
                    <div class="accordion-item">
                        <h2 class="accordion-header">
                            <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#faq4">
                                可以修改已提交的需求吗？
                            </button>
                        </h2>
                        <div id="faq4" class="accordion-collapse collapse" data-bs-parent="#faqAccordion">
                            <div class="accordion-body">
                                可以修改需求信息：
                                <ul class="mt-2">
                                    <li>联系客服说明需要修改的内容</li>
                                    <li>提供需求编号和联系方式验证身份</li>
                                    <li>重新确认修改后的需求信息</li>
                                    <li>修改后将重新进行供应商匹配</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- 联系客服 -->
        <div class="contact-section">
            <div class="card border-0 shadow-sm bg-light">
                <div class="card-body p-4">
                    <div class="row align-items-center">
                        <div class="col-md-8">
                            <h5 class="mb-2">
                                <i class="bi bi-headset me-2 text-primary"></i>
                                需要帮助？联系我们的客服团队
                            </h5>
                            <p class="text-muted mb-0">
                                我们的专业客服团队随时为您提供需求查询和跟进服务
                            </p>
                        </div>
                        <div class="col-md-4 text-center">
                            <button class="btn btn-primary" onclick="showAllContactMethods()">
                                <i class="bi bi-telephone me-1"></i>联系客服
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
.bg-gradient-success {
    background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
}

.process-timeline {
    position: relative;
}

.process-timeline::before {
    content: '';
    position: absolute;
    top: 60px;
    left: 12.5%;
    right: 12.5%;
    height: 2px;
    background: linear-gradient(to right, #007bff, #ffc107, #17a2b8, #28a745);
    z-index: 1;
}

.step-icon {
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
    position: relative;
    z-index: 2;
}

.process-step {
    position: relative;
}

@media (max-width: 768px) {
    .process-timeline::before {
        display: none;
    }
    
    .process-step {
        margin-bottom: 2rem;
    }
}
</style>

<script>
// 需求查询页面的JavaScript功能
document.addEventListener('DOMContentLoaded', function() {
    initRequirementQuery();
});

function initRequirementQuery() {
    // 检查URL参数中是否有需求编号
    const urlParams = new URLSearchParams(window.location.search);
    const reqId = urlParams.get('id');
    if (reqId) {
        document.getElementById('requirementId').value = reqId;
    }
}

function queryRequirement() {
    const reqId = document.getElementById('requirementId').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    
    if (!reqId || !phone) {
        alert('请填写需求编号和联系电话');
        return;
    }
    
    // 验证需求编号格式
    if (!reqId.match(/^REQ-[0-9A-Z]+$/)) {
        alert('请输入正确的需求编号格式（例如：REQ-20250115001）');
        return;
    }
    
    // 由于是静态网站，显示查询指引
    showQueryResult(reqId, phone);
}

function showQueryResult(reqId, phone) {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog modal-lg">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-search me-2"></i>需求查询结果
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="alert alert-info">
                        <h6><i class="bi bi-info-circle me-1"></i>查询信息</h6>
                        <p class="mb-1"><strong>需求编号：</strong>${reqId}</p>
                        <p class="mb-0"><strong>联系电话：</strong>${phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2')}</p>
                    </div>
                    
                    <div class="alert alert-warning">
                        <h6><i class="bi bi-exclamation-triangle me-1"></i>查询说明</h6>
                        <p class="mb-2">
                            由于本平台为静态展示网站，无法直接显示需求状态。
                            请通过以下方式获取详细的需求处理状态：
                        </p>
                        <div class="row g-3">
                            <div class="col-md-6">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-telephone text-primary me-2"></i>
                                    <div>
                                        <strong>电话查询</strong><br>
                                        <small class="text-muted">400-XXX-XXXX</small>
                                    </div>
                                </div>
                            </div>
                            <div class="col-md-6">
                                <div class="d-flex align-items-center">
                                    <i class="bi bi-wechat text-success me-2"></i>
                                    <div>
                                        <strong>微信查询</strong><br>
                                        <small class="text-muted">扫码添加客服</small>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="mb-3">
                        <h6>查询时请提供以下信息：</h6>
                        <ul class="mb-0">
                            <li>需求编号：${reqId}</li>
                            <li>联系电话：${phone}</li>
                            <li>提交时间（如果记得的话）</li>
                        </ul>
                    </div>
                    
                    <div class="text-center">
                        <button class="btn btn-primary me-2" onclick="callCustomerService()">
                            <i class="bi bi-telephone me-1"></i>立即致电
                        </button>
                        <button class="btn btn-success" onclick="showWechatContact()">
                            <i class="bi bi-wechat me-1"></i>微信联系
                        </button>
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

function callCustomerService() {
    window.open('tel:400-XXX-XXXX');
}

function showWechatContact() {
    alert('微信客服\n\n请扫描二维码添加客服微信：\n[这里应该显示二维码]\n\n或搜索微信号：vision-ndt-service');
}

function showAllContactMethods() {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header bg-primary text-white">
                    <h5 class="modal-title">
                        <i class="bi bi-headset me-2"></i>联系客服
                    </h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>
                <div class="modal-body">
                    <div class="row g-3">
                        <div class="col-12">
                            <div class="d-flex align-items-center p-3 border rounded">
                                <i class="bi bi-telephone-fill text-primary me-3" style="font-size: 1.5rem;"></i>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">客服热线</h6>
                                    <p class="mb-1">400-XXX-XXXX</p>
                                    <small class="text-muted">服务时间：9:00-18:00</small>
                                </div>
                                <a href="tel:400-XXX-XXXX" class="btn btn-outline-primary btn-sm">拨打</a>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="d-flex align-items-center p-3 border rounded">
                                <i class="bi bi-wechat text-success me-3" style="font-size: 1.5rem;"></i>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">微信客服</h6>
                                    <p class="mb-1">vision-ndt-service</p>
                                    <small class="text-muted">扫码或搜索添加</small>
                                </div>
                                <button class="btn btn-outline-success btn-sm" onclick="showWechatContact()">添加</button>
                            </div>
                        </div>
                        <div class="col-12">
                            <div class="d-flex align-items-center p-3 border rounded">
                                <i class="bi bi-envelope-fill text-info me-3" style="font-size: 1.5rem;"></i>
                                <div class="flex-grow-1">
                                    <h6 class="mb-1">客服邮箱</h6>
                                    <p class="mb-1">service@vision-ndt.com</p>
                                    <small class="text-muted">24小时内回复</small>
                                </div>
                                <a href="mailto:service@vision-ndt.com" class="btn btn-outline-info btn-sm">发送</a>
                            </div>
                        </div>
                    </div>
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
</script>

---

*我们致力于为每一个需求提供专业、及时的服务。如有任何疑问，请随时联系我们的客服团队。*
