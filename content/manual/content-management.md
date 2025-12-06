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

### 4. 供应商ID（supplier_id）规范
- **定义**：用于定位该供应商的产品与图册路径的唯一短标识。
- **设置方式**：在供应商 `.md` 文件 Front Matter 中添加 `supplier_id` 字段；若未设置，默认使用文件名作为 ID（如 `vis.md → vis`）。
- **命名规则**：
  - 使用英文字母、数字与短横线（`a-z0-9-`），建议全小写；
  - 长度建议 ≤ 16；
  - 保持稳定，不随公司名变化而改动；
- **路径映射**：
  - 内容：`content/products/[supplier_id]/[型号].md`
  - 本地图册：`static/images/products/[supplier_id]/[系列名]/p-gallery-001.jpg`
  - 云端图册 (R2)：`https://vispic.visndt.com/[supplier_id]/[系列名]/p-gallery-001.jpg`
- **示例**：天津维森科技使用 `supplier_id: vis`（文件：`content/suppliers/vis.md`），其产品目录应为 `content/products/vis/`，图册目录为 `static/images/products/vis/[系列名]/`。

### 3. 手动指定
若需特殊指定图片，可在 `.md` 文件的 Front Matter 中使用 `gallery` 字段覆盖自动逻辑：
```yaml
gallery:
  - image: "/images/custom/my-product.jpg"
```

---

## 三、需求市场管理 (Requirement Market)

需求市场模块基于 Cloudflare D1 数据库与 Workers 服务运行，支持实时发布、报价与管理。

### 1. 管理后台
访问地址：`/admin/` (本地开发时为 `http://localhost:1313/admin/`)

### 2. 核心功能说明

#### 2.1 需求管理 (Requirements)
- **列表管理**：可查看所有需求状态，支持**删除**无效需求（删除操作不可恢复，会级联删除关联报价）。
- **编辑功能**：
  - **状态 (Status)**：`公开` (前台可见)、`隐私` (仅密码可见)、`关闭`。
  - **进度 (Progress)**：`待发布`、`发布中`、`接洽中`、`已完成`。
  - **查看密码 (View Password)**：设置后，前台访客需输入该密码才能查看此需求的联系方式。

#### 2.2 发布方管理 (Demanders)
- **企业会话密码 (Enterprise Session Password)**：
  - **用途**：用于发布方在“发布方入口” (`/entry-demand.html`) 登录。
  - **设置**：在发布方列表点击“编辑”，设置“企业会话密码”。
  - **登录后**：发布方可查看该企业名下的所有需求及报价情况。

#### 2.3 供应商管理 (Suppliers)
- **通行密码 (Access Password)**：
  - **用途**：供应商在查看任何需求时，可使用此通用密码解锁联系方式（无需单条需求的查看密码）。
  - **设置**：在供应商列表点击“编辑”进行设置。

### 3. 前台交互逻辑
 - **发布方入口（Demander）**：企业会话密码，仅用于企业方登录后台查看本企业所有需求与进度，不用于公开页面解锁。
 - **供应商查看（Supplier）**：
   - **未授权**：只能看到需求概览，联系方式脱敏。
   - **授权查看**：输入“供应商通行密码”后，解锁完整联系方式，并可在线报价。
 - **单条查看密码（View Password）**：为历史兼容字段，仅供管理员/发布方在后台场景使用；公开页面不再接受“查看密码”解锁。
 - **API 配置**：在需求列表页底部支持手动切换 API 地址（本地开发/线上环境），方便调试。

#### 3.1 可见性规则
- 公开列表仅展示“已审核 (approved=1) 且 status=公开”的需求。
- 联系方式在未授权时隐藏，授权后显示 `ContactName/ContactPhone/ContactCompany/ContactEmail/ContactDepartment`。
- 报价开关 `AllowOpenQuotes=true` 时，供应商可直接报价；否则需供应商通行密码授权。

#### 3.2 密码与角色策略
- **供应商通行密码**：公开页面唯一解锁方式；解锁后可查看联系人并提交报价。
- **企业会话密码**：仅发布方入口使用；登录后查看本企业的所有需求与进度。
- **查看密码 (View Password)**：仅后台使用；不在公开页面启用，避免与企业会话密码重叠。

#### 3.3 页面与字段映射
- 列表卡片字段：`RequirementID`、`Title`、`PrimaryCategory`/`SecondaryCategory`、`BudgetRange`、`Status`、`Progress`、`AllowOpenQuotes`、`PublicPreview`、`PublishedAt`。
- 详情弹窗：联系方式字段与报价表单字段（公司、联系人、电话、金额、币种、备注、交期、关键参数等）。
- 报价列表字段：`quote_id`、`supplier_name`、`supplier_phone`、`amount`、`currency`、`remarks`、`status`、`created_at`。

#### 3.4 状态与进度
- `Status`: 公开 / 隐私 / 关闭。
- `Progress`: 待发布 / 发布中 / 接洽中 / 已完成 / 已终止。
- 运营分区（管理后台）：未审核/待公开、已审核公开、已关闭/已完成、已过期（默认 120 天，支持后续配置）。

#### 3.5 错误与提示
- 拉取失败：在列表页显示错误提示与当前 API 地址，便于排查连接与权限。
- 授权失败：提示“供应商通行密码不正确”；后台 401 提示检查 Admin Key。

#### 3.6 验证清单
- 发布→后台搜索编号→批准发布→前台出现。
- 供应商通行密码可解锁联系人并提交报价；报价列表随授权刷新。
- 管理后台能按分区显示并执行编辑、批准、删除操作。

---

## 四、生产环境部署与验证

### 1. API 基础地址与切换
- 生产环境默认同源 API（`window.API_BASE=''`，调用 `fetch('/api/...')`）。
- 支持保存任意 `https://` 开头的远程 API 地址，或重置为同源：
  - 前台：`/requirements/` 页面底部“API设置”内可一键设为本地 `http://127.0.0.1:8787`、线上 `https://api.visndt.com`、或同源。
  - 后台：`/management.html → 设置 → API Base URL`，点击“保存”，或通过下拉菜单快速切换。

### 2. 发布→审核→展示 全流程
- 发布需求：`POST /api/requirements` 返回 `RequirementID` 与 `ViewPassword`。
- 审核公开：在后台“需求管理”搜索该编号，点击“批准发布”，系统会设置：
  - `approved=1`、`approved_at=ISO时间`
  - `status='公开'`、`progress='发布中'`
  - `allow_open_quotes=true`、`contact_public=true`
- 前台展示：`GET /api/requirements` 仅加载“已审核且公开”的需求。
- 详情与密码：在弹窗中用 `view_password` 或 `supplier_access_password` 解锁联系人与报价表单。

### 3. 管理后台分区显示（运营可视化）
- 未审核/待公开：新发布未审核或状态非“公开”。
- 已审核公开：通过审核且“公开”。
- 已关闭/已完成：`status='关闭'` 或 `progress` 为“已完成/已终止”。
- 已过期：公开状态且发布时间超过 120 天（可调整）。

### 4. Cloudflare Worker 配置项核对
- 绑定：`env.DB`（D1 数据库，生产与预览分别配置）；路由 `/api/*` 指向该 Worker。
- 变量：
  - `ADMIN_KEY`：管理员密钥，管理后台通过 `X-Admin-Key` 访问管理员接口。
  - `SYNC_BASE_URL`：定时同步数据来源（默认 `https://www.visndt.com/data`）。
  - `DEFAULT_SUPPLIER_PASSWORD`：供应商通行密码默认值（用于初始化）。
  - `DEFAULT_REQUIREMENT_PASSWORD`：查看密码默认值（用于初始化）。
- 定时任务：`scheduled` 任务从 `SYNC_BASE_URL` 拉取数据并 `INSERT OR IGNORE`。

### 5. 故障排查要点
- 后台报 401：检查后台“设置”里保存的 `Admin Key` 是否与生产环境变量一致。
- 前台列表空：确认已“批准发布”；或检查 API 地址是否同源/可达、CSP `connect-src` 是否允许该域。
- 数据未入库：发布接口返回非 `ok` 时查看错误描述；Worker 日志查看 SQL 执行情况。

### 6. Cloudflare Workers 路由与生产发布

- 路由与入口：
  - `wrangler.toml` 中设置 `main = "src/index.js"` 作为 Worker 主入口。
  - 生产路由示例：`routes = ["api.visndt.com/*", "visndt.com/api/*", "www.visndt.com/api/*"]`（确保发布后已在 Cloudflare 端生效）。
  - 绑定资源：`env.DB`（D1）、`env.VISPIC`（R2），在本地与生产均需正确绑定。
- 发布前准备：
  - 安装 Node.js 与 Wrangler：`npm i -g wrangler` 或使用 `npx wrangler`。
  - 登录（OAuth 浏览器授权）：`npx wrangler login`；若浏览器无法打开或授权失败，见下文“登录与网络故障处理”。
  - 设置密钥（Secrets）：运行 `npx wrangler secret put ADMIN_KEY`，输入管理员密钥（供后台以 `X-Admin-Key` 调用）。如需后台登录密码，设置 `ADMIN_PASSWORD`。
- 发布到生产：
  - 在项目根目录执行：`npx wrangler publish --config "cloudflare/wrangler.toml"`
  - 完成后 Cloudflare 将把 `/api/*` 路由绑定到该 Worker。
- 发布后验证：
  - `GET https://api.visndt.com/api/health`（健康检查）。
  - `GET https://api.visndt.com/api/admin/stats`，请求头需携带 `X-Admin-Key: <你的密钥>`。
  - `GET https://api.visndt.com/api/admin/assets?limit=1`，确认媒体库接口可用。
- 前端联动与自动纠偏：
  - 管理页“设置”支持切换 API Base（本地/线上/同源）。
  - 后台 JS 在生产环境具备自动纠偏逻辑：当同源 `visndt.com/api/...` 返回 HTML/404 时，会回退至 `https://api.visndt.com` 并持久化。

 ### Cloudflare 创建 API Token

### 7. 媒体库上传（R2）与读取

- 上传：`PUT /api/admin/assets?key=<路径>`（请求体为文件流；需 `X-Admin-Key`）。
- 列表：`GET /api/admin/assets?limit=20&cursor=<可选>`（返回 `items` 含 `key/size/uploaded/public_url`）。
- 删除：`DELETE /api/admin/assets?key=<路径>`（同时删除 R2 与数据库记录）。
- 公开读取：`GET /api/assets/<key>`（按 `Content-Type` 流式返回）。
- 链接规范：接口统一返回相对链接 `public_url: /api/assets/<encoded key>`，便于前端直接使用。

### 8. 一键部署脚本（推荐）

- 脚本位置：`scripts/deploy-workers.ps1`
- 用法：
  - 干运行预览：`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-workers.ps1 -DryRun`
  - 正式发布：`powershell -NoProfile -ExecutionPolicy Bypass -File scripts/deploy-workers.ps1 -AdminKey "<你的管理员密钥>"`
  - 可选参数：`-AdminPassword`（后台登录口令）、`-SkipVerify`（跳过验证）、`-ApiBase`（默认 `https://api.visndt.com/api`）。
- 脚本流程：检查 `npx` → 登录（或跳过）→ 设置 Secrets → 发布 → 调用 `health`/`admin/stats`/`admin/assets` 验证。

### 9. 登录与网络故障处理（OAuth 页面无法打开）

- 症状：访问 `https://welcome.developers.workers.dev/wrangler-oauth-consent-granted` 超时（`ERR_CONNECTION_TIMED_OUT`）。
- 判定：通常为本地网络/防火墙/代理导致的外网连接问题，与项目配置无关。
- 处理建议：
  - 检查系统代理与企业防火墙策略，临时关闭拦截或加入白名单。
  - 更换网络（热点/家庭宽带）或使用加速。
  - 使用 API Token 免浏览器授权的登录方式：
    - 在 Cloudflare Dashboard → My Profile → API Tokens 创建自定义 Token，授予 Workers/R2/D1 所需权限。
    - 将 Token 作为环境变量加入命令行会话：
      - Windows PowerShell：`$env:CLOUDFLARE_API_TOKEN = "<你的Token>"`
      -（可选）设置账号：`$env:CLOUDFLARE_ACCOUNT_ID = "<你的AccountID>"`
    - 之后直接运行：`npx wrangler publish --config "cloudflare/wrangler.toml"`
    - 验证：`npx wrangler whoami` 会显示基于 Token 的登录信息。
  - 若使用旧方法（`CLOUDFLARE_API_KEY` + `CLOUDFLARE_EMAIL`），请优先改为 `CLOUDFLARE_API_TOKEN`（旧方法已不推荐）。

### 10. 安全与合规

- 切勿在仓库明文保存密钥；使用 `wrangler secret put` 或 CI 注入环境变量。
- 前端代码不应记录或回显管理员密钥；所有管理接口由后台以 `X-Admin-Key` 校验。
- R2 公共读取仅限 `GET /api/assets/<key>` 路径，避免直接暴露存储桶域名与签名链接。
