# VisNDT 内容管理系统使用指南

## 📋 系统概述

VisNDT 内容管理系统为维森视觉检测仪器网站提供了多种内容管理方式，满足不同用户的需求和技术水平。系统特别加强了多媒体管理功能，支持智能化的图片管理和内容创建。

**仓库信息：**
- GitHub仓库：https://github.com/Cery/VisNDT.git
- 主分支：master
- 自动部署：Netlify

**新增功能：**
- 🎯 内容创建向导 - 智能化内容创建流程
- 🖼️ 媒体库管理 - 专业的多媒体资源管理
- 📁 自动归档 - 智能文件组织和分类
- 🔧 增强编辑器 - 集成媒体库的可视化编辑

## 🚀 管理方式对比

### 1. GitHub 管理 (⭐ 推荐)

**优势：**
- ✅ 无需额外配置，开箱即用
- ✅ 完整的版本控制功能
- ✅ 支持多人协作编辑
- ✅ 自动触发网站重新构建
- ✅ 完全免费
- ✅ 支持完整的增删改查操作

**适用场景：**
- 有 GitHub 账号的用户
- 需要版本控制的团队
- 希望简单可靠的管理方式
- 需要完整内容管理功能

**管理入口：**
- **基础管理**：`/admin/github-cms.html` - 简单的文件编辑
- **高级管理**：`/admin/github-advanced.html` - 完整的内容管理功能
- **快速入门**：`/admin/quick-start.html` - 新手指南

**功能特色：**
- 📝 页面内容管理（首页、商务服务、应用领域等）
- 📰 资讯管理（添加、编辑、删除新闻）
- 📦 产品管理（产品信息的完整管理）
- 🎯 案例管理（应用案例的增删改查）
- 🖼️ 媒体管理（图片和文档上传）
- ⚙️ 系统配置（网站配置、样式主题）
- 📋 内容模板（预设的内容格式模板）

### 2. 本地编辑器

**优势：**
- ✅ 功能丰富的编辑界面
- ✅ 实时预览功能
- ✅ 语法高亮支持
- ✅ Markdown 工具栏

**适用场景：**
- 喜欢可视化编辑界面
- 需要实时预览效果
- 经常编辑 Markdown 内容

**使用方法：**
1. 访问 `/admin/local-editor.html`
2. 从左侧文件列表选择要编辑的文件
3. 在编辑器中修改内容
4. 使用预览功能查看效果

**注意：** 这是演示版本，实际保存需要后端支持。

### 3. Netlify CMS

**优势：**
- ✅ 专业的内容管理界面
- ✅ 媒体文件管理
- ✅ 用户权限控制
- ✅ 工作流程支持

**适用场景：**
- 需要专业 CMS 功能
- 多用户协作管理
- 复杂的内容结构

**使用方法：**
1. 访问 `/admin/` 并选择 Netlify CMS
2. 使用 Netlify Identity 登录
3. 在 CMS 界面中管理内容

**注意：** 需要配置 Netlify Identity 和 Git Gateway。

### 4. 简易管理

**优势：**
- ✅ 界面简洁易用
- ✅ 快速上手
- ✅ 基础编辑功能

**适用场景：**
- 初学者用户
- 简单的内容编辑需求
- 快速修改内容

## 📁 主要内容文件

### 页面内容文件
- `content/_index.md` - 首页内容
- `content/business/_index.md` - 商务服务页面
- `content/news/_index.md` - 资讯中心
- `content/products/_index.md` - 产品中心
- `content/applications/_index.md` - 应用领域
- `content/cases/_index.md` - 应用案例

### 配置文件
- `hugo.toml` - 网站主配置文件
- `netlify.toml` - 部署配置文件
- `static/admin/config.yml` - CMS 配置文件

## 📝 Markdown 语法参考

### 基础语法
```markdown
# 一级标题
## 二级标题
### 三级标题

**粗体文字**
*斜体文字*

[链接文字](https://example.com)
![图片描述](图片路径)

- 无序列表项
- 无序列表项

1. 有序列表项
2. 有序列表项
```

### 文件头部格式
```yaml
---
title: "页面标题"
description: "页面描述"
date: 2024-01-15
draft: false
---
```

## 🔧 常见操作

### 📰 添加新闻文章
**快速链接：** [添加新闻](https://github.com/Cery/VisNDT/new/master/content/news)

1. 点击上方链接或访问高级管理页面
2. 文件名格式：`YYYY-MM-DD-文章标题.md`
3. 使用新闻模板填写内容
4. 提交文件，等待网站更新

**模板示例：**
```markdown
---
title: "新闻标题"
date: 2024-01-15
categories: ["行业资讯"]
tags: ["视觉检测", "技术"]
thumbnail: "/images/news/news-image.jpg"
summary: "新闻摘要描述"
---

# 新闻标题
新闻的详细内容...
```

### 📦 添加新产品
**快速链接：** [添加产品](https://github.com/Cery/VisNDT/new/master/content/products)

1. 点击上方链接进入GitHub创建页面
2. 文件名格式：`产品型号.md` 或 `产品名称.md`
3. 使用产品模板填写信息
4. 上传产品图片到 `/static/images/products/`

### 🎯 添加应用案例
**快速链接：** [添加案例](https://github.com/Cery/VisNDT/new/master/content/cases)

1. 创建案例文件
2. 文件名格式：`案例名称.md`
3. 填写项目背景、解决方案、实施效果
4. 添加相关图片和数据

### 🏠 修改首页内容
**快速链接：** [编辑首页](https://github.com/Cery/VisNDT/edit/master/content/_index.md)

1. 点击链接直接编辑首页内容
2. 修改轮播图、推荐产品等配置
3. 更新公司介绍和联系信息

### 💼 更新商务服务信息
**快速链接：** [编辑商务服务](https://github.com/Cery/VisNDT/edit/master/content/business/_index.md)

1. 编辑服务项目和价格
2. 更新套餐内容和优势
3. 修改联系方式和成功案例数据

### 🖼️ 管理图片文件
**快速链接：** [上传图片](https://github.com/Cery/VisNDT/upload/master/static/images)

1. 点击链接进入图片上传页面
2. 选择要上传的图片文件
3. 在内容中使用 `/images/文件名.jpg` 引用

## 🚨 注意事项

### 文件编辑
- 保持文件头部的 YAML 格式正确
- 使用 UTF-8 编码保存文件
- 注意 Markdown 语法的正确性

### 图片管理
- 图片文件放在 `static/images/` 目录下
- 在 Markdown 中使用相对路径引用：`/images/图片名.jpg`
- 建议使用 WebP 格式以获得更好的性能

### 部署更新
- 通过 GitHub 编辑文件后，网站会自动重新构建
- 构建过程通常需要 2-5 分钟
- 可以在 Netlify 控制台查看构建状态

## 🆘 故障排除

### CMS 无法加载
1. 检查网络连接
2. 确认 Netlify Identity 配置正确
3. 尝试使用其他管理方式

### 文件保存失败
1. 检查文件格式是否正确
2. 确认有足够的权限
3. 尝试刷新页面重新操作

### 网站更新不及时
1. 检查 GitHub 提交是否成功
2. 查看 Netlify 构建日志
3. 清除浏览器缓存

## 📞 技术支持

如果您在使用过程中遇到问题，可以：

1. 查看本文档的故障排除部分
2. 检查 GitHub 仓库的 Issues
3. 联系技术支持团队

---

**推荐使用 GitHub 管理方式，简单可靠且功能完整！**
