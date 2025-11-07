# 方案B最终审查与优化建议

更新时间：2025-11-07

## 概览
- Airtable 三表已落地：`Requirements`、`RequirementQuotes`、`CooperationLeads`，并提供 CSV 样例便于导入。
- 前端已对齐报价表单字段，并上线运营管理页（`static/management.html`）：查看需求与关联报价、更新报价状态、删除报价、导出报价 CSV。
- 后端函数齐备：`listRequirements.js`、`listQuotes.js`、`submitQuote.js`、`updateQuoteStatus.js`、`deleteQuote.js`。
- 安全增强：统一字段校验、速率限制（IP 窗口限流）、更稳健的错误返回与日志；Airtable 需求存在性校验。
- 本地环境统一：`netlify.toml` 配置 `[dev]` 自动启动 Hugo 并代理函数，新增脚本 `npm run dev:netlify`。

## 现状评估
- 数据一致性：前后端字段已对齐，`Price` 数字化、`RequirementID` 链接需求表，`Status` 初始为“接洽中”。
- 管理能力：运营页可视化需求与报价、支持状态流转与删除、支持导出 CSV，满足基础运营需求。
- 安全性：必填字段与格式校验已落地；限流基础版已启用（1 分钟 5 次）。

## 优化建议
1. 前端表单与交互
   - 增加前端校验：手机号、邮箱、交期格式；必填提示与滚动定位。
   - 防重复提交：提交按钮禁用与节流；显示提交中状态与统一错误提示。
   - 导出增强：支持按状态、价格区间过滤后导出；导出文件名包含需求编号与日期。

2. 后端与安全
   - 白名单字段：函数仅接受预期字段，拒绝多余字段；统一输入清洗。
   - 速率限制升级：按 IP+路径 维度独立限流；加入滑动窗口与封禁名单。
   - CORS/来源限制：仅允许本站来源；为敏感操作（删除、状态变更）增加简单签名或密钥校验。
   - 审计字段：在 `RequirementQuotes` 增加 `UpdatedBy`、`LastUpdatedTime`，保留操作痕迹。

3. 数据模型
   - 枚举统一：`Status` 统一为：`接洽中` / `待评估` / `不合适` / `已合作`。
   - 供应商维度：增加 `SupplierID` 链接供应商表，避免名称变更导致的关联丢失。
   - 版本记录：可选 `QuoteVersion` 与 `History` 以便跟踪变更。

4. 运维监控
   - 集中日志：Netlify 函数日志聚合与告警（错误率 / 超时 / 限流触发）。
   - 健康检查：为关键函数添加轻量心跳与探活页。

5. 构建与发布
   - 环境变量：在 Netlify UI 配置 `AIRTABLE_API_KEY`、`AIRTABLE_BASE_ID`；本地填充 `.env`。
   - 测试与质量：补充端到端用例（提交报价、状态流转、删除操作）；开启基础 ESLint。

## 下一步行动
1. 补充前端校验与重复提交防护（报价与管理页）。
2. 升级后端字段白名单与按路由限流策略。
3. 在 `RequirementQuotes` 增加审计字段并更新相关函数写入逻辑。
4. 增强导出能力（过滤、文件名规则）。
5. 完善部署文档与环境变量配置清单。

## 运行指南（本地）
- 复制 `.env.example` 为 `.env` 并填充 `AIRTABLE_API_KEY` 与 `AIRTABLE_BASE_ID`。
- 启动统一环境：`npm run dev:netlify`（自动运行 Hugo，端口 `8888`，函数路径 `/.netlify/functions/*`）。

---
如需我继续把上述优化逐项落地，请告知优先级，我会按重要性推进。