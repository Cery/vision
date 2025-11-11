# Cloudflare D1 + Workers 部署与迁移步骤（visndt.com）

以下步骤指导你在 Cloudflare 账号中完成数据库与 Workers 部署，结合仓库中新增的 `cloudflare/` 项目，实现端到端替换 Airtable/Netlify Functions。

## 一次性初始化

1. 安装 Wrangler（你已完成）：
   - `npm i -g wrangler`

2. 创建 D1 数据库：
   - `wrangler d1 create vision-demand-market`
   - 记住返回的数据库名称（与 `cloudflare/wrangler.toml` 中的 `database_name` 保持一致）。

3. 初始化表结构：
   - `wrangler d1 execute vision-demand-market --file cloudflare/schema.sql`

4. 设置平台最高权限密钥（Admin Key）：
   - `wrangler secret put ADMIN_KEY`
   - 输入一个强密码（用于管理端接口鉴权）。

5. 生成导入 SQL（可选，将现有 JSON 导入 D1）：
   - `node cloudflare/scripts/gen-import-sql.js > cloudflare/import.sql`
   - `wrangler d1 execute vision-demand-market --file cloudflare/import.sql`

## Workers 部署

1. 本地开发（可选）：
   - 进入 `cloudflare/` 目录，运行 `wrangler dev`（或 `wrangler dev --local`）。

2. 发布到 *.workers.dev：
   - `wrangler publish`
   - 完成后会得到 `https://<your-subdomain>.workers.dev`，API 基础路径为 `.../api/*`。

3. 绑定自有域名（推荐）：
   - Cloudflare 仪表盘 → Workers & Pages → 选择该 Worker → 设置 → 添加路由。
   - 例如将 `api.visndt.com/*` 绑定到该 Worker。
   - 需要你在 Cloudflare DNS 中添加 `api` 的 CNAME/AAAA（仪表盘会给出指引）。

4. 配置跨域（CORS）：
   - 当前 Worker 默认回包 `Access-Control-Allow-Origin: *`，若要限制为 `https://visndt.com`，可在 `cloudflare/src/index.js` 中改为白名单匹配。

## 前端指向新接口

1. 在 `static/management.html` 与需求列表页面的脚本里，设置：
   - `window.API_BASE = 'https://api.visndt.com/api'`（或你的 workers.dev 地址）。
   - 为了兼容旧代码，Worker 已提供 `/.netlify/functions/*` 路径别名；你可以逐步替换为 `/api/*`。

2. 验证：
   - 发布需求：`POST /api/requirements`（返回 `RequirementID` 与 `ViewPassword`）。
   - 列表：`GET /api/requirements`。
   - 报价提交：`POST /api/quotes`。
   - 管理端：带 `X-Admin-Key` 调用 `/api/admin/*` 路由。

## 运维与安全建议

- 将 `ADMIN_KEY` 保存在 Cloudflare Secrets，不在前端暴露。
- 供应商访问密码与需求查看密码暂存明文字段，后续可切换为哈希比对（代码已预留字段）。
- 如需速率限制与日志审计，可进一步引入 KV/Analytics 或把重要变更定期归档到 GitHub。

如需我继续直接把页面中的 `fetch('/.netlify/functions/...')` 逐步替换为 `API_BASE`，或者将管理页批量适配新路由，请告诉我你偏好的 API 基础域名与是否保留旧别名。