# Cloudflare D1 + Workers 配置与部署（完整步骤）

以下步骤可直接完成数据库、Worker、路由、跨域与密钥配置，适用于本仓库的 `cloudflare/` 项目。

## 一次性初始化

1. 安装 Wrangler（你已完成）：
   - `npm i -g wrangler`

2. 创建 D1 数据库：
   - `wrangler d1 create vision-demand-market`
   - 返回的 `database_id` 粘贴到 `cloudflare/wrangler.toml` 的 `[[d1_databases]]` 段落。

3. 初始化表结构：
   - `wrangler d1 execute vision-demand-market --file cloudflare/schema.sql`

4. 设置平台最高权限密钥（Admin Key，管理端鉴权）：
   - `wrangler secret put ADMIN_KEY`
   - 输入一个强密码（用于管理端接口鉴权）。

5. （可选）设置环境变量（在线同步与默认密码）：
   - `wrangler secret put DEFAULT_SUPPLIER_PASSWORD`（如需覆盖 `wrangler.toml` 中的 vars）
   - `wrangler secret put DEFAULT_REQUIREMENT_PASSWORD`
   - 或直接在 `wrangler.toml` 的 `[vars]` 段落中保留默认值：
     - `SYNC_BASE_URL = "https://www.visndt.com/data"`
     - `DEFAULT_SUPPLIER_PASSWORD = "888888"`
     - `DEFAULT_REQUIREMENT_PASSWORD = "777777"`

5. 生成导入 SQL（可选，将现有 JSON 导入 D1）：
   - `node cloudflare/scripts/gen-import-sql.js > cloudflare/import.sql`
   - `wrangler d1 execute vision-demand-market --file cloudflare/import.sql`

## Workers 部署

1. 本地开发（可选）：
   - 进入 `cloudflare/` 目录，运行 `wrangler dev`（或 `wrangler dev --local`）。

2. 发布到 *.workers.dev（快速验证）：
   - `wrangler publish`
   - 完成后会得到 `https://<your-subdomain>.workers.dev`，API 基础路径为 `.../api/*`。

3. 绑定自有域名（推荐）：
   - 仪表盘 → Workers & Pages → 选择该 Worker → Settings → 添加路由。
   - 例如将 `api.visndt.com/*` 或 `visndt.com/api/*` 绑定到该 Worker（两者可同时配置）。
   - 在 Cloudflare DNS 中添加 `api` 的记录（仪表盘会给出自动提示）。

4. 配置跨域（CORS）：
   - 代码已内置白名单：`https://visndt.com`、`https://www.visndt.com`、`https://api.visndt.com`，以及本地 `http://localhost:1313/8888/8000/1314`。
   - 若你的站点域名不同，请在 `cloudflare/src/index.js` 的 `allowedOrigins` 集合中追加域名。

5. （可选）定时同步（Cron）：
   - `wrangler.toml` 已配置 `crons = ["*/30 * * * *"]`，每 30 分钟从 `SYNC_BASE_URL` 拉取 JSON 增量写入 D1。
   - 如不需要，移除该配置。

## 前端指向新接口

1. 在 `static/management.html` 与相关脚本中，确保接口指向 Worker：
   - 示例：`window.API_BASE = 'https://api.visndt.com'`（或你的 `workers.dev` 地址）。
   - 注意：前端会以 `window.apiFetch('/api/…')` 追加路径，`API_BASE` 不应包含 `/api`，否则会导致重复拼接为 `/api/api/...`。
   - 旧路径兼容：如仍使用 `/.netlify/functions/*`，可逐步替换为 `/api/*`，前端已适配新路由。

2. 验证（示例）：
   - 管理验证：`POST /api/admin/verify`（请求头 `X-Admin-Key: <你的密钥>`，或在 JSON Body 里提供 `{"password":"<你的密码>"}`）。亦支持 `GET /api/admin/verify`（必须携带 `X-Admin-Key`）。
   - 发布需求：`POST /api/markets`（返回 `RequirementID` 与 `ViewPassword`）。
   - 列表：`GET /api/markets`。
   - 报价提交：`POST /api/quotes`。
   - 管理端：带 `X-Admin-Key` 调用 `/api/admin/*` 路由。

3. 生产前自检（必做）：
   - `GET https://api.<你的域名>/api/admin/demanders`（请求头 `X-Admin-Key: <你的密钥>`）应返回 JSON。
   - 在管理页点击“导出CSV/重新统计/新增/删除”，确认接口不报 CORS 错误。

## 运维与安全建议

- 将 `ADMIN_KEY` 保存在 Cloudflare Secrets，不在前端暴露。
- 供应商访问密码与需求查看密码暂存明文字段，后续可切换为哈希比对（代码已预留字段）。
- 如需速率限制与日志审计，可进一步引入 KV/Analytics 或把重要变更定期归档到 GitHub。

如需我继续将页面中的旧 `fetch('/.netlify/functions/...')` 全量替换为 `API_BASE`，或批量适配新路由，请告知你的 API 基础域名与是否保留旧别名。
