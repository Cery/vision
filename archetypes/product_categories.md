---
title: "{{ replace .Name "-" " " | title }}"
description: ""
meta_keywords: ""
meta_description: ""
feature_image: ""
icon: ""
weight: 100
show_in_home: true
show_in_menu: true
parent_category: ""
related_categories: []
products_count: 0
status: "active"
created_at: {{ .Date }}
updated_at: {{ .Date }}
seo:
  title: "{{ replace .Name "-" " " | title }} - 维森视觉检测仪器网"
  description: ""
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
    - name: "category_code"
      type: "string"
      required: false
    - name: "external_id"
      type: "string"
      required: false
---