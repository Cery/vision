# Airtable 配置步骤（需求市场）

本指南帮助你在 Airtable 中创建并配置「需求市场」所需的两张表，并在本地/Netlify 上完成函数环境变量配置与联动验证。

## 一、创建 Base 与两张表

1) 在 Airtable 新建一个 Base（例如：`RequirementsMarket`），进入后创建两张表：
- `Requirements`（需求表）
- `RequirementQuotes`（报价表）

2) 为两张表创建如下字段（建议与 CSV 一致，见 docs 目录中的 CSV 文件）：

Requirements 表字段：
- `RequirementID`：单行文本（唯一编号，例如 `REQ-20241107-1234`）
- `Title`：单行文本（需求标题）
- `PublicPreview`：长文本（公开预览说明）
- `PrimaryCategory`：单选（例如：电子内窥镜、光纤内窥镜、光学内窥镜…）
- `SecondaryCategory`：单行文本（次级分类/场景）
- `Status`：单选（公开 / 隐私 / 关闭）
- `ContactName`：单行文本
- `ContactPhone`：电话
- `ContactCompany`：单行文本
- `ViewPasswordHash`：单行文本（bcrypt 哈希，仅存哈希，不存明文）
- `Parameters`：长文本（参数摘要）
- `PublishedAt`：日期（Y-M-D）
- `BudgetRange`：单行文本（预算范围）
- `Progress`：单选（发布中 / 对接中 / 已完成）
- `ContactPublic`：复选框或单选（是否无需密码直接公开联系方式）

RequirementQuotes 表字段：
- `RequirementID`：单行文本（与需求编号一致，便于筛选）
- `RequirementRef`：链接字段，链接到 `Requirements` 表记录（建立关联）
- `SupplierCompanyName`：单行文本（公司名）
- `SupplierContact`：单行文本（联系人）
- `SupplierEmail`：电子邮件
- `SupplierPhone`：电话
- `ProductModel`：单行文本（型号）
- `KeyParams`：长文本（关键参数）
- `DeliveryTime`：单行文本（交期）
- `Price`：数字（报价金额）
- `QuoteDetail`：长文本（报价说明）
- `Status`：单选（接洽中 / 已采用 / 已拒绝）
- `CreatedAt`：创建时间（字段类型选 “Created time”）

3) 导入示例数据：
- 可从 `docs/airtable_requirements.csv` 与 `docs/airtable_quotes.csv` 导入示例行。
- 导入后，在 `RequirementQuotes` 中将 `RequirementRef` 设置为链接到 `Requirements`（按提示映射关联）。

## 二、生成查看密码哈希（ViewPasswordHash）

出于安全考虑，`Requirements` 表中仅保存密码哈希。你可以通过 Node.js 生成：

```bash
node -e "const bcrypt=require('bcryptjs');(async()=>{const h=await bcrypt.hash('你的查看密码',10);console.log(h)})()"
```

将输出的哈希写入 `ViewPasswordHash` 字段。前端验证将调用函数 `/.netlify/functions/verifyPassword` 使用 bcrypt 比对。

## 三、在本地配置环境变量（Netlify Dev）

1) 复制 `.env.example` 为 `.env`，填写：

```
AIRTABLE_API_KEY=你的APIKey
AIRTABLE_BASE_ID=你的BaseID
AIRTABLE_REQUIREMENTS_TABLE=Requirements
AIRTABLE_QUOTES_TABLE=RequirementQuotes
```

2) 启动本地开发：

```bash
npm run dev:netlify
```

预览地址为 `http://localhost:8888/`，框架服务在 `http://localhost:1314/`。

## 四、在 Netlify 云端配置

在 Netlify Dashboard 的 Site settings → Build & deploy → Environment 中设置同名变量：
- `AIRTABLE_API_KEY`
- `AIRTABLE_BASE_ID`
- （可选）`AIRTABLE_REQUIREMENTS_TABLE`、`AIRTABLE_QUOTES_TABLE`

部署完成后，`/.netlify/functions/*` 将在云端可用。

## 五、联调与功能验证

- 在 `需求市场` 页面：
  - 随机输入密码应显示“查看密码不正确”（函数返回 `valid:false`）；
  - 输入正确密码，联系方式解锁，报价表单自动可用；
  - 提交报价后，在管理后台 `/management.html` 能看到对应报价，更新状态与删除操作均成功。

- 若出现 “验证服务不可用”：
  - 说明函数返回了 500 或网络错误，请检查环境变量是否填写正确、Airtable Base/表名是否一致，或查看本地控制台函数报错日志。