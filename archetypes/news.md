---
title: "{{ replace .Name "-" " " | title }}"
date: {{ .Date }}
summary: ""  # 文章摘要
featured_image: ""  # 特色图片（可选）
categories: ["行业资讯"]  # 可选值：行业资讯、展会信息、技术文章、应用案例、公司新闻
subcategories: []  # 二级分类：工业制造、能源动力、仪器仪表、无损检测、航空航天、汽车制造、石油化工、精密制造
tags: []  # 添加相关标签

# 技术文章专用字段（仅技术文章需要）
# difficulty: "intermediate"  # 技术难度：beginner、intermediate、advanced
# readingTime: 8  # 阅读时间（分钟）
# author: "技术团队"  # 作者
# version: "v1.0"  # 版本号
# lastUpdated: "{{ .Date.Format "2006-01-02" }}"  # 最后更新日期

# 展会信息专用字段（仅展会信息需要）
# event_date: "2025年11月5日-9日"  # 展会日期
# location: "展会地点"  # 展会地点
# organizer: "主办方"  # 主办方

# 应用案例专用字段（仅应用案例需要）
# industry: "航空航天"  # 所属行业
# caseType: "success"  # 案例类型：success、innovation、optimization
# client: "客户名称"  # 客户名称
# projectDuration: "3个月"  # 项目周期
# challenge: "面临的挑战"  # 面临挑战
# solution: "解决方案"  # 解决方案
# results: "实施效果"  # 实施效果

views: 0  # 浏览量
related_tech: []  # 相关技术
---

<!-- 正文内容 -->