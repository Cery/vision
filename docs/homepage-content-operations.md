# 首页内容操作指引（新品 / 应用领域 / 案例 / 资讯）

本文档说明如何在 Hugo 站点中添加、删除、替换首页相关内容，并保证首页自动填充与链接正确。

## 基本约定
- 内容目录：`content/`
- 图片目录：`static/images/`
- 全局标题样式：`static/css/section-titles.css`（首页版块统一使用）
- 首页模板：`layouts/index.html`
- 首页版块局部模板：`layouts/partials/homepage/`

## 新品推荐（Products）
- 位置：`content/products/`
- 格式：每个产品一个 Markdown 文件（示例：`content/products/product-xxx.md`）
- 必要 Front Matter 字段：
  - `title`: 产品名称
  - `date`: 发布时间（用于排序，首页新品推荐按时间倒序）
  - `model`: 型号（可选）
  - `primary_category`: 一级分类（字符串或数组，首页仅展示首个元素）
  - `secondary_category`: 二级分类（字符串或数组，首页仅展示首个元素）
  - `gallery`: 图片数组。若要在首页显示主图，请设置某一项 `is_main: true`
    ```yaml
    gallery:
      - image: "/images/products/your-product-main.jpg"
        alt: "主图"
        is_main: true
      - image: "/images/products/your-product-2.jpg"
        alt: "细节图"
    ```
- 首页展示逻辑：系统自动获取最新 6 个产品（按 `date` 倒序）。若缺少主图，使用默认图 `static/images/products/default-product.jpg`。
- 链接：卡片跳转至对应产品详情页（自动生成）。

操作步骤：
1. 在 `content/products/` 新增或编辑产品 `.md` 文件，完善 Front Matter。
2. 将主图放到 `static/images/products/`，并在 `gallery` 中标记 `is_main: true`。
3. 保存后，首页“新品推荐”会自动刷新显示最新 6 条。
4. 如需控制排序，调整 `date` 字段或使用 `weight`（如有相应模板支持）。

## 应用领域（Applications）
- 位置：`content/applications/`
- 每个应用领域一个 Markdown 文件（示例：`content/applications/automotive.md`）
- 常用 Front Matter 字段：
  - `title`: 应用领域名称
  - `icon` 或 `image`: 图标或背景图（没有则使用默认图 `static/images/applications/default.jpg`）
  - `summary`: 简短说明（可选）

操作步骤：
1. 在 `content/applications/` 下新增 `.md` 文件，填写 `title`、`icon`/`image` 等字段。
2. 上传相关图片到 `static/images/applications/` 并在 Front Matter 引用。
3. 首页“应用领域”卡片将自动加载最新内容，点击跳转到该领域详情页。

## 应用案例（Cases）
- 位置：`content/cases/`
- 每个案例一个 Markdown 文件（示例：`content/cases/case-xxx.md`）
- 推荐 Front Matter 字段：
  - `title`: 案例标题
  - `date`: 发布时间（用于首页排序）
  - `tags`: 相关标签数组（在首页卡片中用于展示）
  - `cover` 或 `image`: 封面图（如模板支持）

操作步骤：
1. 在 `content/cases/` 下新增或编辑 `.md` 文件，完善 `title`、`date`、`tags`、`cover` 等。
2. 将图片放到 `static/images/cases/`，并在 Front Matter 中引用。
3. 首页“应用案例”模块将自动显示最新案例及精简列表，点击进入详情。

## 资讯中心（News）
- 位置：`content/news/`
- 每篇资讯一个 Markdown 文件（示例：`content/news/2025-trends.md`）
- 推荐 Front Matter 字段：
  - `title`: 资讯标题
  - `date`: 发布时间（用于首页与列表排序）
  - `categories`: 分类数组（如：`["行业资讯"]`、`["展会信息"]`、`["技术文章"]`）
  - `summary`: 摘要（可选）

操作步骤：
1. 在 `content/news/` 下新增 `.md` 文件，填写 `title`、`date`、`categories`、`summary`。
2. 首页“新闻中心”自动从最新资讯中抓取。占位内容已修正为指向 `/news/` 列表页。
3. 如需在站点导航或筛选中使用分类，请确保与 `data/news_categories.yml` 定义保持一致。

## 删除或替换内容
- 删除：直接删除对应 `content/...` 文件；首页自动减少展示。
- 替换：编辑对应 `.md` 文件或替换图片资源；保存后自动生效。
- 大批量更新：建议分批次保存并预览，确认首页布局与排序是否符合预期。

## 首页布局与链接检查
- 首页结构：`layouts/index.html` 引用多个 `partials/homepage/...` 模板。
- 标题样式：已统一到 `static/css/section-titles.css`，各版块不再重复定义。
- 链接检查：
  - 新品卡片 → 对应产品详情页
  - 应用领域卡片 → 对应领域详情页
  - 案例卡片 → 对应案例详情页
  - 新闻占位与列表 → `/news/` 列表页或具体新闻详情页

## 预览与发布
- 本地预览：启动 Hugo 本地服务后访问首页进行检查（示例：`http://localhost:1319/`）。
- 外部脚本异常：如有第三方统计脚本报错（Baidu、LeanCloud），一般不影响首页功能与样式。
- 发布：构建站点后部署到对应站点托管平台即可。

如需补充操作或遇到异常，请在 `docs/` 目录新增补充说明文档并记录变更。