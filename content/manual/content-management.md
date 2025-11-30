---
title: "内容管理手册"
date: 2025-02-09
draft: false
summary: "本文档详细说明了平台内容的更新、删除及图片资源的管理规范。"
---

# 内容管理手册

本文档旨在指导管理员如何维护 Vision 平台的内容，包括新闻、产品、案例的增删改，以及图片资源的上传与管理。

## 一、内容管理

所有内容均以 **Markdown (.md)** 文件形式存储在 `content/` 目录下。

### 1. 产品管理 (Products)
- **路径**：`content/products/[供应商ID]/`
- **文件名**：建议使用型号命名，如 `WS-F4525.md`。
- **新建步骤**：
  1. 在对应供应商目录下新建 `.md` 文件。
  2. 复制现有产品的 Front Matter (头部元数据) 进行修改。
  3. 关键字段：
     - `title`: 产品名称
     - `model`: 产品型号
     - `series`: 产品系列 (用于自动关联相册，如 `F-series`)
     - `primary_category`: 主分类
  4. 保存即可生效。
- **删除**：直接删除对应的 `.md` 文件。

### 2. 新闻资讯 (News)
- **路径**：`content/news/`
- **新建步骤**：
  1. 新建 `.md` 文件。
  2. 填写 `title`, `date`, `summary` 等字段。
  3. 正文部分撰写新闻内容。

### 3. 应用案例 (Cases)
- **路径**：`content/cases/`
- **管理方式**：同新闻资讯，注意关联对应的产品型号（如有）。

---

## 二、图片资源管理

平台采用 **本地 + 云端 (Cloudflare R2)** 混合策略，推荐使用标准化路径以实现自动关联。

### 1. 目录结构
本地图片存放于 `static/images/`，结构如下：
- `static/images/products/[供应商ID]/[系列名]/` : 产品图库
- `static/images/news/` : 新闻配图
- `static/images/cases/` : 案例配图
- `static/images/partner/` : 合作伙伴 Logo

### 2. 自动关联规则 (云相册/本地)
为减少手动录入，产品详情页会自动寻找以下路径的图片资源：

- **图片命名规范**：
  - 画廊主图：`p-gallery-001.jpg` (支持 001-004)
  - 详情图：`p-detail-001.jpg`
  - 规格书：`p-data-[型号]规格书.pdf`

- **上传路径**：
  - **方式 A (本地)**：存入 `static/images/products/[供应商ID]/[系列名]/`
  - **方式 B (云端 R2)**：上传至 `vispic` 存储桶的对应目录 `[供应商ID]/[系列名]/`

**示例**：
若产品文件位于 `content/products/vis/WS-F4525.md`，且系列为 `F-series`，系统将自动加载：
`https://vispic.visndt.com/vis/F-series/p-gallery-001.jpg`

### 3. 手动指定
若需特殊指定图片，可在 `.md` 文件的 Front Matter 中使用 `gallery` 字段覆盖自动逻辑：
```yaml
gallery:
  - image: "/images/custom/my-product.jpg"
```
