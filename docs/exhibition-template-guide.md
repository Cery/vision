# 展会资讯模板使用指南

## 📋 模板概述

展会资讯模板 (`layouts/news/exhibition.html`) 是专门为展会信息设计的专业模板，提供了丰富的展会信息展示功能。

## 🎯 模板特色

### 1. 专业的展会信息展示
- **展会核心信息卡片**: 时间、地点、主办方、行业等关键信息
- **展会规模数据**: 展览面积、展商数量、观众数量的可视化展示
- **展品范围**: 分类展示展会涵盖的产品和技术领域
- **历届视图**: 图片画廊展示往届展会盛况

### 2. 响应式设计
- 适配桌面、平板、手机等各种设备
- 优雅的卡片式布局
- 渐变色彩设计，提升视觉效果

### 3. 完整的功能模块
- 展会介绍
- 展品范围
- 历届视图
- 参展信息
- 相关产品推荐
- 社交分享功能

## 📝 Markdown文件配置

### 必需字段

```yaml
---
title: "展会名称"
summary: "展会简介"
date: 2025-07-11T10:00:00+08:00
categories: ["展会信息"]
layout: "exhibition"  # 指定使用展会模板

# 展会基本信息
event_date: "2026年11月10日~11月15日"
location: "展会地点"
organizer: "主办单位"
---
```

### 可选字段

#### 展会详细信息
```yaml
opening_hours: "09:00 - 18:00"
detailed_location: "详细地址"
exhibition_industry: "展览行业"
exhibition_type: "展会类型"
cycle: "举办周期"
```

#### 展会规模
```yaml
exhibition_area: "350000平方米"
exhibitor_count: "1022家"
visitor_count: "122000人"
```

#### 展品范围
```yaml
exhibition_scope:
  - category: "分类名称"
    items:
      - "展品1"
      - "展品2"
      - "展品3"
  - category: "另一个分类"
    items:
      - "展品A"
      - "展品B"
```

#### 历届视图
```yaml
historical_images:
  - image: "/images/news/image1.jpg"
    caption: "图片说明1"
  - image: "/images/news/image2.jpg"
    caption: "图片说明2"
```

#### 联系信息
```yaml
contact_info:
  phone: "+86-xxx-xxxxxxx"
  email: "contact@example.com"
  website: "https://www.example.com"

registration_info:
  deadline: "报名截止日期"
  fee: "参展费用"
  url: "报名链接"
```

## 🎨 模板渲染说明

### 1. 模板选择机制

Hugo会根据以下优先级选择模板：

1. **指定layout**: 在Markdown文件中设置 `layout: "exhibition"`
2. **文件名匹配**: 如果文件名包含"exhibition"
3. **分类匹配**: 如果categories包含"展会信息"
4. **默认模板**: 使用 `layouts/news/single.html`

### 2. 模板文件位置

```
layouts/
├── news/
│   ├── exhibition.html     # 展会专用模板
│   ├── single.html         # 通用新闻模板
│   └── list.html          # 新闻列表模板
```

### 3. 样式和脚本

模板内置了专用的CSS样式和JavaScript功能：

- **CSS样式**: 渐变背景、卡片效果、悬停动画
- **分享功能**: 微信、微博分享和链接复制
- **响应式布局**: Bootstrap 5框架

## 🔧 使用步骤

### 步骤1: 创建Markdown文件

在 `content/news/` 目录下创建新的Markdown文件：

```bash
content/news/2026-珠海航展.md
```

### 步骤2: 配置Front Matter

复制模板示例中的Front Matter，根据实际展会信息修改：

```yaml
---
title: "展会名称"
layout: "exhibition"  # 重要：指定使用展会模板
# ... 其他配置
---
```

### 步骤3: 编写展会介绍

在Markdown正文中编写展会的详细介绍。

### 步骤4: 准备图片资源

将展会相关图片放置在 `static/images/news/` 目录下。

### 步骤5: 构建和预览

```bash
hugo server -D
```

访问 `http://localhost:1313/news/文件名/` 查看效果。

## 📊 模板功能模块

### 1. 展会头部信息区
- 渐变色背景
- 展会基本信息卡片
- 展会规模数据可视化

### 2. 主要内容区
- 展会介绍（Markdown正文）
- 展品范围（分类展示）
- 历届视图（图片画廊）
- 相关产品推荐

### 3. 侧边栏
- 展会快速信息
- 相关展会推荐

### 4. 交互功能
- 社交分享
- 图片悬停效果
- 响应式布局

## ⚠️ 注意事项

### 1. 图片优化
- 建议图片尺寸：1200x600px（封面）、800x400px（内容图）
- 支持JPG、PNG、WebP格式
- 注意图片文件大小，建议单张不超过500KB

### 2. 内容结构
- 展品范围建议不超过6个分类
- 历届视图建议9-12张图片
- 相关产品建议3-6个

### 3. SEO优化
- 设置完整的SEO字段
- 使用描述性的图片alt文本
- 合理使用标题层级

### 4. 兼容性
- 模板基于Bootstrap 5
- 支持现代浏览器
- 移动端友好

## 🎯 最佳实践

1. **信息完整性**: 尽量填写所有相关字段
2. **图片质量**: 使用高质量、相关性强的图片
3. **内容原创**: 编写原创的展会介绍内容
4. **定期更新**: 及时更新展会信息和图片
5. **用户体验**: 注意内容的可读性和导航的便利性

## 🔗 相关文档

- [Hugo模板文档](https://gohugo.io/templates/)
- [Bootstrap 5文档](https://getbootstrap.com/docs/5.0/)
- [Markdown语法指南](https://www.markdownguide.org/)

---

通过使用这个专业的展会资讯模板，您可以创建出美观、专业、功能完整的展会信息页面，为用户提供优质的浏览体验。
