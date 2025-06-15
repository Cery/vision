---
title: "示例资讯标题"
date: 2024-03-20
categories: ["行业资讯"]
tags: ["示例", "测试", "新功能"]
summary: "这是一个示例资讯，展示了如何在资讯中添加分类、标签和其他元数据。"
featured_image: "/images/news/example.jpg"
author: "管理员"
views: 0
related_tech: ["技术A", "技术B"]
---

这是示例资讯的正文内容。在创建新的资讯时，需要在front matter中添加必要的元数据。

## 元数据说明

1. 分类（categories）：
   - 行业资讯
   - 展会资讯
   - 技术动态
   - 公司新闻

2. 标签（tags）：
   - 可以根据文章内容添加多个标签
   - 标签用于更细粒度的内容分类

3. 其他元数据：
   - summary: 文章摘要
   - featured_image: 特色图片
   - author: 作者
   - views: 浏览量
   - related_tech: 相关技术

## 如何添加分类

1. 在资讯的front matter中添加categories字段：
```yaml
categories: ["行业资讯"]  # 可以添加多个分类
```

2. 分类名称必须与content/categories/目录下的文件名对应：
- 行业资讯 -> industry-news.md
- 展会资讯 -> exhibition-news.md
- 技术动态 -> tech-news.md

3. 如果需要添加新的分类，只需要在content/categories/目录下创建对应的markdown文件即可。

## 示例内容

这里可以添加更多的正文内容，包括图片、表格等。

### 图片示例

![示例图片](/images/news/example.jpg)

### 表格示例

| 项目 | 说明 |
|------|------|
| 分类 | 行业资讯 |
| 标签 | 示例、测试、新功能 |
| 日期 | 2024-03-20 |
| 作者 | 管理员 |
| 浏览量 | 0 | 