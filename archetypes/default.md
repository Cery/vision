---
title: "{{ replace .File.ContentBaseName "-" " " | title }}"
summary: ""
product_category: ""
product_type: ""
model: ""
series: ""
supplier: ""
published: {{ .Date }}
updated: {{ .Date }}
status: "active"
weight: 100
show_in_home: false
featured: false
price_range: ""
stock_status: "in_stock"
gallery:
  - image: ""
    alt: "主图"
    is_main: true
  - image: ""
    alt: "细节图1"
  - image: ""
    alt: "细节图2"
parameters:
  - group: "基本参数"
    items:
      - name: "型号"
        value: ""
      - name: "尺寸"
        value: ""
      - name: "重量"
        value: ""
  - group: "技术参数"
    items:
      - name: "精度"
        value: ""
      - name: "分辨率"
        value: ""
      - name: "测量范围"
        value: ""
features:
  - title: ""
    description: ""
    icon: ""
applications:
  - title: ""
    description: ""
    image: ""
downloads:
  - name: "产品说明书"
    file: ""
    size: ""
    type: "pdf"
videos:
  - title: "产品介绍"
    url: ""
    cover: ""
tags: []
seo:
  title: "{{ replace .File.ContentBaseName "-" " " | title }} - 维森视觉检测仪器网"
  description: ""
  keywords: []
  canonical_url: ""
  noindex: false
  featured_image: ""
  featured_image_alt: ""
admin:
  list_view: true
  searchable: true
  filterable: true
  show_in_nav: true
  custom_fields:
    - name: "product_code"
      type: "string"
      required: false
    - name: "external_id"
      type: "string"
      required: false
---

## 产品描述

## 技术特点

## 应用场景

## 技术参数

## 产品优势
