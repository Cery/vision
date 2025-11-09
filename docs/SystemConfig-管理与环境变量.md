# SystemConfig 管理与环境变量说明

本项目在 Netlify Functions 中引入了平台级 `SystemConfig` 表（Airtable）以统一管理关键配置：

- 供应商全局密码（明文与哈希）
- 发布成功通知（邮件 / 短信）开关
- 后台默认导出格式与“联系方式脱敏”筛选
- 是否需要密码才能提交报价（RequireQuotePasswordEnabled）

## 关键字段

- `SupplierGlobalPasswordPlain`：供应商全局密码（明文，仅用于后台显示与回退）
- `SupplierGlobalPasswordHash`：供应商全局密码（bcrypt 哈希，优先用于验证）
- `NotifyEmailEnabled`：发布成功后邮件通知开关（布尔）
- `NotifySmsEnabled`：发布成功后短信通知开关（布尔）
- `DefaultExportFormat`：后台报价默认导出格式（`csv` | `xls` | `xlsx`）
- `DefaultMaskedFilter`：后台“仅联系方式脱敏”筛选默认值（布尔）
- `RequireQuotePasswordEnabled`：是否强制供应商提交报价需密码（布尔）

建议将上述字段存放于 Airtable 的 `SystemConfig` 表中，每条记录包含 `Key` 与 `Value` 字段。

## 后台管理页联动

`static/management.html` 的“系统设置”模块已接入以下后端接口：

- `/.netlify/functions/adminGetSystemConfig`（GET）：读取当前系统配置
- `/.netlify/functions/adminUpdateSystemConfig`（POST）：更新系统配置

使用步骤：

1. 在 Netlify 环境变量中设置 `ADMIN_KEY`
2. 打开管理页并输入密钥，点击“加载管理”
3. 在“系统设置”中配置：供应商全局密码、导出格式、脱敏筛选、邮件/短信通知
4. 点击“保存设置”写回 Airtable 的 `SystemConfig` 表

## 环境变量回退（fallback）

当 `SystemConfig` 未设置对应值时，后端会读取以下环境变量作为回退：

- `SUPPLIER_GLOBAL_PASSWORD` / `SUPPLIER_GLOBAL_PASSWORD_HASH`
  - 验证供应商全局密码（哈希优先）
- `NOTIFY_ON_PUBLISH_EMAIL` / `NOTIFY_ON_PUBLISH_SMS`
  - 发布成功通知开关的默认回退（`true`/`false`）
- `AIRTABLE_SYSTEM_TABLE`
  - 覆盖系统配置表名（默认：`SystemConfig`）
- `REQUIRE_QUOTE_PASSWORD`
  - 是否要求供应商提交报价需密码（布尔）。当未配置表字段 `RequireQuotePasswordEnabled` 时使用此环境变量。

请参考根目录的 `.env.example` 了解这些变量的示例配置。

## 相关函数行为变更

- `verifyPassword.js`
  - 支持验证单需求的 `ViewPasswordHash` 与全局供应商密码（哈希或明文），并在审计日志中标注验证来源（requirement/global）。
- `submitQuote.js`
  - 动态读取 `RequireQuotePasswordEnabled`：优先从 `SystemConfig` 获取，回退到环境变量 `REQUIRE_QUOTE_PASSWORD`
  - 在需密码场景下，支持全局供应商密码（哈希或明文）作为有效凭证。
- `adminGetSystemConfig.js` / `adminUpdateSystemConfig.js`
  - 提供系统配置的读取与更新，并支持上述环境变量回退逻辑。

## 注意事项

- 如果同时设置了明文与哈希，系统将优先使用哈希进行验证。
- 管理员保存明文密码仅用于后台显示与应急回退，正式验证应以哈希为准。
- 在生产环境中，请妥善保护 `ADMIN_KEY` 与相关敏感变量，确保仅管理员可以访问管理页接口。