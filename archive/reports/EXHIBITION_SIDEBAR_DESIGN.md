# 参展信息和推荐产品设计说明

## 🎯 设计目标

根据您的要求，我们设计了参展信息区域并优化了推荐产品为图文卡片形式：

- **参展信息显示**：完整的联系方式和报名信息展示
- **图文卡片设计**：推荐产品采用现代化的图文卡片布局
- **交互体验优化**：丰富的悬停效果和操作按钮
- **响应式适配**：完美适配各种设备尺寸

## 📋 参展信息设计

### 布局结构
```
┌─────────────────────────────────────┐
│              参展信息                │
├─────────────────────────────────────┤
│ 📞 联系方式                         │
│ ┌─────────────────────────────────┐ │
│ │ 📞 +86-756-8676969    [拨打]   │ │
│ │ ✉️  info@airshow.com   [邮件]   │ │
│ │ 🌐 官方网站           [访问]   │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 📅 报名信息                         │
│ ┌─────────────────────────────────┐ │
│ │ 报名截止    2026年9月30日       │ │
│ │ 参展费用    根据展位面积确定     │ │
│ │ ┌─────────────────────────────┐ │ │
│ │ │    📤 立即报名参展          │ │ │
│ │ └─────────────────────────────┘ │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 设计特点
- **分区明确**：联系方式和报名信息分别展示
- **交互友好**：每个联系方式都有对应的操作按钮
- **视觉层次**：使用图标、颜色和间距建立清晰层次
- **操作便捷**：一键拨打、发邮件、访问网站

### CSS实现
```css
.contact-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    background: white;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
}

.contact-action {
    background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
    color: white;
    padding: 0.25rem 0.75rem;
    border-radius: 12px;
    font-size: 0.8rem;
    font-weight: 600;
}
```

## 🛍️ 推荐产品图文卡片

### 卡片结构
```
┌─────────────────────────────────────┐
│ ┌─────────────────────────────────┐ │
│ │                                 │ │
│ │        产品图片 (160px)          │ │
│ │                                 │ │
│ │         [👁️ 查看图标]            │ │
│ └─────────────────────────────────┘ │
│                                     │
│ 产品标题                            │
│ ┌─────────────────────────────────┐ │
│ │ 型号  WS-K08510                │ │
│ └─────────────────────────────────┘ │
│ 产品简介描述文字...                  │
│ ┌─────────────────────────────────┐ │
│ │      ➡️ 查看详情               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 设计特点
- **图片展示**：160px高度的产品图片，支持占位符
- **悬停效果**：图片缩放、遮罩层显示、卡片上浮
- **信息丰富**：标题、型号、简介、操作按钮
- **操作便捷**：多个入口访问产品详情页

### CSS实现
```css
.product-card {
    background: white;
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid #e5e7eb;
    transition: all 0.3s ease;
}

.product-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
    border-color: #6366f1;
}

.product-image {
    position: relative;
    height: 160px;
    overflow: hidden;
}

.product-overlay {
    position: absolute;
    background: rgba(0, 0, 0, 0.7);
    opacity: 0;
    transition: opacity 0.3s ease;
}

.product-card:hover .product-overlay {
    opacity: 1;
}
```

## 🎨 视觉设计细节

### 配色系统
```css
/* 参展信息 */
--contact-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
--registration-primary: linear-gradient(135deg, #10b981 0%, #059669 100%);

/* 推荐产品 */
--product-primary: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
--product-border: #e5e7eb;
--product-hover-border: #6366f1;
```

### 交互效果
```css
/* 联系方式悬停 */
.contact-item:hover {
    border-color: #6366f1;
    box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
}

/* 产品卡片悬停 */
.product-card:hover .product-image img {
    transform: scale(1.05);
}

/* 按钮悬停 */
.product-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 3px 12px rgba(99, 102, 241, 0.3);
}
```

### 图标系统
```css
/* 参展信息图标 */
.info-section-title i {
    color: #6366f1;
    font-size: 1rem;
}

/* 联系方式图标 */
.contact-item i {
    color: #6366f1;
    width: 16px;
    text-align: center;
}

/* 产品操作图标 */
.product-link i {
    font-size: 1.2rem;
}
```

## 📱 响应式设计

### 桌面端 (1024px+)
```css
.sidebar-content {
    padding: 2rem 1.75rem;
}

.product-image {
    height: 160px;
}

.contact-item {
    flex-direction: row;
    align-items: center;
}
```

### 平板端 (768px-1024px)
```css
.sidebar-content {
    padding: 1.5rem;
}

.product-image {
    height: 140px;
}

.contact-item {
    flex-direction: column;
    align-items: flex-start;
}
```

### 手机端 (576px以下)
```css
.product-image {
    height: 120px;
}

.product-info {
    padding: 0.75rem;
}

.contact-item {
    padding: 0.75rem;
}

.contact-action {
    font-size: 0.75rem;
    padding: 0.2rem 0.6rem;
}
```

## 🔧 功能特性

### 参展信息功能
- **一键拨打**：`tel:` 链接直接拨打电话
- **一键邮件**：`mailto:` 链接打开邮件客户端
- **网站访问**：新窗口打开官方网站
- **报名跳转**：直接跳转到报名页面

### 推荐产品功能
- **图片展示**：支持多种图片来源（featured_image、cover、images）
- **占位符**：无图片时显示默认图标
- **多入口访问**：图片遮罩层、标题、按钮都可点击
- **信息展示**：标题、型号、简介完整展示

## 📊 内容管理

### 参展信息配置
```yaml
contact_info:
  phone: "+86-756-8676969"
  email: "info@airshow.com.cn"
  website: "https://www.airshow.com.cn"

registration_info:
  deadline: "2026年9月30日"
  fee: "根据展位面积确定"
  url: "https://www.airshow.com.cn/register"
```

### 推荐产品配置
```yaml
related_products:
  - "WS-K08510"
  - "WS-K3915"
```

## 🎯 用户体验优化

### 可用性提升
- **操作明确**：每个按钮都有清晰的操作指示
- **反馈及时**：悬停状态提供即时视觉反馈
- **信息完整**：展示用户需要的所有关键信息

### 视觉引导
- **颜色引导**：蓝色表示信息查看，绿色表示行动操作
- **层次清晰**：标题、内容、操作按钮层次分明
- **空间合理**：适当的留白和间距提升阅读体验

### 交互体验
- **平滑动画**：所有交互都有平滑的过渡效果
- **状态反馈**：悬停、点击状态清晰可见
- **操作便捷**：减少用户操作步骤

## 📈 设计效果

### 参展信息
- **信息完整性**：联系方式和报名信息一目了然
- **操作便捷性**：一键完成电话、邮件、网站访问
- **视觉吸引力**：现代化的卡片设计和交互效果

### 推荐产品
- **视觉冲击力**：大图展示，吸引用户注意
- **信息丰富度**：图片、标题、型号、简介完整展示
- **转化效果**：多个入口提升产品页面访问率

## 🚀 实际应用

### 展会营销
- **参展推广**：完整的参展信息促进展商报名
- **产品推荐**：相关产品推荐增加商业价值
- **用户转化**：优化的交互设计提升转化率

### 内容管理
- **配置简单**：通过Front Matter轻松配置
- **自动适配**：样式自动适配不同内容
- **维护便利**：模块化设计，易于维护

---

**设计完成时间**：2025-07-13  
**主要特性**：参展信息展示、图文卡片、交互优化  
**用户体验**：操作便捷、视觉美观、信息完整  
**技术实现**：响应式设计、CSS动画、模块化样式
