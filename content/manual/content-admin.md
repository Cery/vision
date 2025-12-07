# 管理平台实施与运维手册（2025-12-06）

## 概述
- 目标：实现前台静态站与后台数据库在“新闻/应用案例/产品”三类数据的一致性；当索引不可用时以公共只读 API 兜底，保障页面可用。
- 策略：采用 A 为主、B 为备的组合方案。
  - 方案 A：Hugo 生成聚合索引 `https://www.visndt.com/data/index.json`，管理后台一键导入到数据库。
  - 方案 B：开放公共只读 API（`/api/news|cases|products`），供前台在索引异常时直接读取数据库。

## 实施方案 A（主）
- 索引规范
  - 路径：`/data/index.json`
  - 每项字段：`title`、`section`（`news|cases|products`）、`uri`、`params`
  - `params` 统一命名规范：
    - 新闻：`slug`、`summary`、`cover_image`、`category`、`tags[]`、`author`、`seo_title`、`seo_keywords`、`seo_description`、`date`
    - 案例：`slug`、`summary`、`cover_image`、`industry`、`seo_*`、`date`
    - 产品：`supplier_id`、`model`、`series`、`primary_category`、`secondary_category`、`summary`、`description`、`parameters{}`、`cover_image`、`gallery[]`、`documents[]`、`seo_*`、`status`、`is_featured`
- 生成建议
  - 在 Hugo 构建阶段遍历三类内容，输出 `public/data/index.json`。
  - 发布到 Netlify 后，校验 `https://www.visndt.com/data/index.json` 返回非空。
- 后台导入接口
  - `POST /api/admin/import-news`
  - `POST /api/admin/import-cases`
  - `POST /api/admin/import-products`
  - 诊断索引：`GET /api/admin/debug-index`（返回 `idxUrl`、`count`、`sample`）
- 管理页操作
  - 打开“新闻/应用案例/产品”页，空列表时点击“同步官网内容”按钮触发导入。

## 实施方案 B（备）
- 公共只读 API（已开放）
  - `GET /api/news`（可选 `category`、`limit`）
  - `GET /api/cases`（可选 `industry`、`limit`）
  - `GET /api/products`（可选 `category`、`limit`）
  - 返回结构：`{ items: [...] }`
- 前台接入建议
  - 当索引不可用或为空时，前台改为直接调用上述 API 渲染列表。
  - 正常时仍使用静态索引，以保持 SEO 与构建稳定性。

## 域名与路由
- 路由
  - `api.visndt.com/*` → Worker `vision-api`
  - `visndt.com/api/*` → Worker `vision-api`
  - `www.visndt.com/api/*` → Worker `vision-api`
- DNS 代理
  - `api`、`www`、`visndt.com` 均需橙云已代理。
  - 顶级域使用 A 记录（`75.2.60.5`、`99.83.190.102`）或橙云 CNAME Flatten 到 Netlify。
- 缓存与规则
  - `Cache Rules`：`/api/*` 设为 “Bypass cache”。
  - 若有边缘重写，排除 `/api/*`，避免返回站点 HTML。

## 管理员设置
- API 地址
  - 管理页“设置”中将 `API Base URL` 设为 `https://api.visndt.com`，点击保存。
- 管理密钥
  - `Admin Key`：`admin123456`，用于后台接口认证。
  - 未携带密钥访问后台接口将返回 `{"error":"Unauthorized"}`。

## 接口清单
- 健康检查：`GET /api/health`
- 后台统计：`GET /api/admin/stats`（需 `X-Admin-Key`）
- 新闻：
  - 管理：`GET/POST/PATCH/DELETE /api/admin/news`（需密钥）
  - 公共：`GET /api/news`、`GET /api/news/public`
- 案例：
  - 管理：`GET/POST/PATCH/DELETE /api/admin/cases`（需密钥）
  - 公共：`GET /api/cases`
- 产品：
  - 管理：`GET/POST/PATCH/DELETE /api/admin/products`（需密钥）
  - 公共：`GET /api/products`
- 媒体库：
  - 上传：`PUT /api/admin/assets?key=<路径>`（需 `X-Admin-Key`，请求体为文件流）
  - 列表：`GET /api/admin/assets`（需密钥）
  - 公开读取：`GET /api/assets/<key>`
- 站点索引诊断：`GET /api/admin/debug-index`（需密钥）

## 执行记录
- 已实施
  - 新增公共只读接口：`/api/news|cases|products`
  - 新增索引诊断：`/api/admin/debug-index`
  - 修正导入接口索引路径拼接为 `base/index.json`
  - 管理页网络兜底：生产优先 `https://api.visndt.com`，失败或返回 HTML 时自动回退 `workers.dev` 并重试
  - 列表查询防护：新闻/案例查询异常返回空数组，避免 5xx
- 部署
  - 使用 API Token 发布 Worker 到三域路由与 `workers.dev`。
- 验证
  - `GET https://api.visndt.com/api/health` 返回 200 JSON。
  - `GET https://api.visndt.com/api/admin/stats`（携带密钥）返回统计。
  - 三类导入返回 `{"ok":true,"upserted":0}`（当前索引为空）。
  - 媒体库 `PUT/GET` 验证正常。

## 运维与排错
- 连接失败
  - 检查 `API Base URL` 是否正确（生产为 `https://api.visndt.com`）。
  - 检查三域是否橙云代理与路由启用。
  - 浏览器看到 HTML 表示未命中 Worker，检查缓存与重写规则。
- `Unauthorized`
  - 在“设置”中确认 `Admin Key` 与后端一致。
- 同步为 0
  - 使用 `GET /api/admin/debug-index` 查看 `count` 与 `sample`。
  - 若为空，先在 Hugo 生成 `data/index.json` 再触发导入。

## 验收清单
- `https://api.visndt.com/api/health` 返回 JSON。
- 管理页“设置”保存 `API Base URL` 与 `Admin Key`。
- 新闻/案例/产品列表可通过“同步官网内容”导入并展示。
- 前台在索引异常时可使用公共只读 API 渲染列表。
- 媒体库文件可上传与公开读取。

## 友情链接管理
- 位置：`layouts/partials/homepage/partner_companies_display.html`
- 数据来源：页面 Front Matter 或站点参数 `hugo.toml` 中的 `partner_companies_*`
- 操作：
  - 新增/调整企业：在首页内容或数据文件中追加企业对象（`company_name/logo`）。
  - 图片：放置于 `static/images/partners/` 或使用外链，优先走 R2 CDN。

## 首页内容管理
- 入口：`content/_index.md` 与 `hugo.toml` 的 `params` 段。
- 模块：
  - 轮播图：`params.carousel_images[]`（图片、标题、描述、链接）。
  - 新品推荐：`new_product_recommendations.products[]`（填写产品 slug）。
  - 资讯中心标题：`params.news_center_*`。
- 资源路径：`static/images/banners/home/` 与 `static/images/products/...`。

## 产品内容管理
- 路径：`content/products/<supplier_id>/<slug>.md`
- 关键字段：`title/model/series/primary_category/secondary_category/summary/parameters/gallery/documents`
- 图片与文档：
  - 本地：`static/images/products/<supplier_id>/<series>/`
  - 云端：`https://vispic.visndt.com/<supplier_id>/<series>/`
- 列表展示：`layouts/products/list.html`（卡片标题、分类、供应商信息）。
- 索引 JSON：`layouts/*/list.productindex.json`、`layouts/_default/products-index.json`（供前端/后台消费）。
- 注意：已取消“发布日期”字段的前后端呈现与索引输出。

## 案例信息管理
- 路径：`content/cases/`（每个案例一个 `.md`）。
- 关联：在 Front Matter 中使用 `related_products` 关联产品。
- 模板：`layouts/cases/single.html`（详情页）、`layouts/partials/homepage/application_cases_display.html`（首页组件）。
- 筛选：列表页支持按产品分类与应用字段筛选。

## 资讯信息管理
- 路径：`content/news/`（分类：`tech-article/industry/exhibition`）。
- 模板：`layouts/news/list.html`（列表筛选）、`layouts/news/single.html`（详情页）。
- 标签：统一在 Front Matter 的 `tags` 字段，首页与列表做轻量展示。

## 需求市场与发布管理
- 页面：`static/market.html`（列表）、`layouts/markets/single.html`（密码验证查看）。
- 后端：Cloudflare D1 + Workers，接口位于 `cloudflare/src/index.js`。
- 管理后台：`/admin/` → 需求/报价/供应商模块，支持状态与进度管理。
- 发布页：`/static/publish.html`（表单提交自动生成需求编号与查看密码）。
- 权限：
  - 查看联系方式：需 `view_password` 或管理员权限。
  - 在线报价：受 `allow_open_quotes` 控制，或提供 `quote_password/供应商访问密码`。

## 变更与验证清单
- 关联产品卡片：优化标题/分类/供应商展示，移除标签露出。
- 产品列表卡片：移除发布日期显示；索引 JSON 不再输出 `published`。
- 管理后台：产品编辑表单不再展示“日期”字段，保留新闻/案例日期。
- 外链安全：为新窗口链接统一添加 `rel="noopener noreferrer"`，修复浏览器阻止问题。
