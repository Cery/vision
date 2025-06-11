---
name: "{{ replace .Name "-" " " | title }}"
type: "制造商"
description: ""
logo: ""
website: ""
established_year: ""
registered_capital: ""
employee_count: ""
business_scope: ""
quality_certifications: []
contact:
  address: ""
  phone: ""
  email: ""
  contact_person: ""
social_media:
  wechat: ""
  weibo: ""
  linkedin: ""
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
    - name: "supplier_code"
      type: "string"
      required: false
    - name: "external_id"
      type: "string"
      required: false
---