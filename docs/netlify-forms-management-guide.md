# Netlify Forms 定制需求管理指南

## 📋 概述

定制需求管理系统已从localStorage迁移到Netlify Forms，提供更专业、可靠的表单处理服务。

## 🚀 优势

### ✅ **相比localStorage的优势**
- **数据安全可靠** - 云端存储，不会因浏览器清理而丢失
- **自动邮件通知** - 新提交时自动发送邮件给管理员
- **防垃圾邮件保护** - 内置Honeypot和reCAPTCHA支持
- **文件上传支持** - 支持附件上传（PDF、图纸等）
- **多设备访问** - 管理员可在任何设备上查看提交记录
- **数据导出** - 支持CSV格式导出
- **API集成** - 支持第三方系统集成

## 🔧 管理员操作指南

### **1. 查看提交的需求**

1. 登录 [Netlify控制台](https://app.netlify.com)
2. 选择您的网站项目
3. 在左侧菜单中点击 **"Forms"**
4. 查看 **"custom-requirements"** 表单
5. 点击表单名称查看所有提交记录

### **2. 设置邮件通知**

为了及时收到新提交的通知：

1. 在Forms页面中，点击 **"custom-requirements"** 表单
2. 点击 **"Settings"** 选项卡
3. 在 **"Form notifications"** 部分点击 **"Add notification"**
4. 选择 **"Email notification"**
5. 输入接收通知的邮箱地址
6. 保存设置

**建议设置多个邮箱地址以确保及时收到通知。**

### **3. 查看提交详情**

每个提交记录包含以下信息：
- **客户信息**：公司名称、联系人、电话、邮箱、部门
- **产品需求**：产品类型、屏幕尺寸、探头直径、像素、视向、光源、导向、待机时长
- **需求描述**：详细的定制需求说明
- **附件文件**：上传的PDF、图纸等文件
- **提交时间**：精确的提交时间戳
- **IP地址**：提交者的IP地址（用于安全追踪）

### **4. 数据导出**

在Netlify Forms中，您可以：
- **导出CSV格式**的数据用于Excel分析
- **按时间范围筛选**数据
- **删除垃圾邮件**提交
- **查看详细统计**信息

### **5. 安全特性**

Netlify Forms提供：
- **Honeypot反垃圾邮件保护** - 自动过滤机器人提交
- **reCAPTCHA集成支持** - 可选的人机验证
- **IP地址记录** - 记录每次提交的来源
- **提交时间戳** - 精确的时间记录

## 🎯 表单配置

### **当前表单设置**
- **表单名称**：`custom-requirements`
- **提交方式**：POST
- **成功页面**：`/customs/success/`
- **反垃圾邮件**：Honeypot保护已启用

### **表单字段**
```html
<!-- 产品需求参数 -->
productType         - 产品类型（必填）
screenSize          - 主机屏幕
batteryLife         - 待机时长
probeDiameter       - 探头直径
resolution          - 像素
viewingAngle        - 视向
lightSource         - 光源
guidance            - 导向
requirements        - 定制需求描述（必填）

<!-- 客户联系信息 -->
companyName         - 公司名称（必填）
department          - 部门
contact             - 联系人（必填）
phone               - 联系电话（必填）
email               - 电子邮箱（必填）

<!-- 附件上传 -->
attachments         - 上传附件（支持多文件）
```

## 📊 数据分析

### **可用统计信息**
- 提交总数和趋势
- 产品类型分布
- 客户公司分析
- 月度/季度统计
- 地理位置分布（基于IP）

### **导出格式**
- **CSV格式** - 适用于Excel分析
- **JSON格式** - 适用于程序处理
- **PDF报告** - 适用于管理汇报

## 🔗 相关链接

- [Netlify控制台](https://app.netlify.com)
- [Netlify Forms文档](https://docs.netlify.com/forms/setup/)
- [定制中心页面](/customs/)
- [后台管理界面](/admin/complete-content-manager.html)

## 📞 技术支持

如需技术支持或有疑问，请联系：
- **邮箱**：admin@visndt.com
- **电话**：400-000-0000

---

**注意**：免费计划每月支持100次表单提交。如需更多提交量，请考虑升级Netlify计划。
