# API 自测脚本（PowerShell）

本脚本用于一键验证三个生产入口（`https://api.visndt.com/api`、`https://visndt.com/api`、`https://www.visndt.com/api`）的主要接口是否工作正常，包含：
- 管理员验证：`GET /admin/verify`、`POST /admin/verify`
- 公共接口：`GET /requirements` 列表与 `GET /requirements/:id` 详情
- 报价列表：`GET /quotes?requirement_id=...`（需要管理员权限或视图密码/供应商密码）
- 管理接口：`GET /admin/requirements`、`GET /admin/demanders/stats`、`GET /admin/suppliers/export`、`GET /admin/demanders/export`

## 准备
- 你需要在 Cloudflare Worker 的 Secrets 中设置管理员密钥（例如：`ADMIN_KEY`）。该值用于请求头 `X-Admin-Key`。
- 已发布最新版 Worker 代码（支持 `GET /api/admin/verify`）。如遇 `GET` 404，可先用 `POST /api/admin/verify` 验证。

## 运行
1. 打开 PowerShell（在项目根目录 `vision/`）
2. 执行（替换为你的真实密钥）：
   - `powershell -ExecutionPolicy Bypass -File scripts\api-self-test.ps1 -AdminKey '你的管理员密钥'`
   - 可选附加 workers.dev 入口（将 `vision-api.v-easechoice.workers.dev` 替换为你的实际子域）：
     - `powershell -ExecutionPolicy Bypass -File scripts\api-self-test.ps1 -AdminKey '你的管理员密钥' -WorkersDevBase 'https://vision-api.v-easechoice.workers.dev/api'`

脚本会循环三个入口（以及你提供的 `workers.dev` 入口），依次输出每个检查点的结果与错误信息（如有），便于快速定位问题（如 401/403 权限、404 路由、CORS、数据库绑定等）。

## 常见问题
- `GET /admin/verify` 仍返回 404：请确认已发布支持 GET 的新版本 Worker；或使用 `POST /admin/verify`（带 `X-Admin-Key` 或 JSON body `password`）。
- `Unauthorized`：检查 `X-Admin-Key` 是否与 Cloudflare Secrets 中设置的一致；或是否使用了 `ADMIN_PASSWORD` 方案（对应 body `password`）。
- 导出 CSV 无内容：说明数据为空或过滤条件导致，脚本仅展示前几行用于快速确认返回格式。

## 注意
- 脚本默认不执行任何修改性操作（例如 `PATCH`/`DELETE`），仅做 GET/POST 读取与验证。若需进一步测试更新接口，可在脚本中解注相应示例，并确保使用非生产数据。