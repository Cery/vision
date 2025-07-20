# 维森视觉检测仪器网站 - 开发环境构建指南

## 📋 项目概览

这是一个基于 Hugo 静态网站生成器构建的中文工业检测设备展示网站，集成了 Netlify CMS 内容管理系统。

## 🏗️ 技术架构

### 核心技术栈
- **静态网站生成器**: Hugo v0.147.1+
- **主题**: Ananke (官方主题，已定制)
- **内容管理**: Netlify CMS
- **后端服务**: Node.js + Express
- **部署平台**: Netlify
- **版本控制**: Git

### 项目结构
```
vision/
├── content/                 # 网站内容
│   ├── products/           # 产品信息
│   ├── news/              # 资讯中心
│   ├── applications/      # 应用领域
│   ├── cases/             # 应用案例
│   └── suppliers/         # 供应商信息
├── static/                # 静态资源
│   ├── images/            # 图片资源
│   ├── uploads/           # 上传文件
│   └── admin/             # CMS 管理界面
├── layouts/               # 页面模板
├── themes/ananke/         # Hugo 主题
├── scripts/               # 维护脚本
├── hugo.toml             # Hugo 配置
├── netlify.toml          # Netlify 部署配置
├── package.json          # Node.js 依赖
└── server.js             # Express 服务器
```

## 🛠️ 开发环境安装

### 系统要求
- **操作系统**: Windows 10/11, macOS, Linux
- **Node.js**: v16.0+ (推荐 v18+)
- **Hugo**: v0.147.1+
- **Git**: 最新版本

### 1. 安装基础软件

#### Node.js 安装
访问 [Node.js 官网](https://nodejs.org/) 下载并安装 LTS 版本。

验证安装：
```bash
node --version
npm --version
```

#### Hugo 安装

**Windows:**
```bash
# 方法1: 使用 Chocolatey
choco install hugo-extended

# 方法2: 使用 Scoop
scoop install hugo-extended

# 方法3: 手动下载 (如果包管理器不可用)
# 下载 hugo_extended_0.147.1_windows-amd64.zip
# 解压到项目目录或系统 PATH
```

**macOS:**
```bash
# 使用 Homebrew
brew install hugo
```

**Linux (Ubuntu/Debian):**
```bash
sudo apt update
sudo apt install hugo
```

验证安装：
```bash
hugo version
```

### 2. 克隆项目

```bash
git clone https://github.com/Cery/vision.git
cd vision
```

### 3. 安装项目依赖

```bash
npm install
```

### 4. 启动开发环境

#### 启动 Hugo 开发服务器
```bash
# 如果 Hugo 在系统 PATH 中
hugo server -D --bind 0.0.0.0

# 如果使用项目目录中的 hugo.exe (Windows)
./hugo.exe server -D --bind 0.0.0.0
```

#### 启动后端服务器 (可选)
```bash
# 启动文件上传服务器
node server.js

# 启动内容服务器
node content-server.js

# 启动产品服务器
node product-server.js
```

### 5. 访问网站

- **前端网站**: http://localhost:1313
- **CMS 管理界面**: http://localhost:1313/admin
- **文件服务器**: http://localhost:3002

## 🔧 开发工具配置

### VS Code 推荐扩展
```json
{
  "recommendations": [
    "budparr.language-hugo-vscode",
    "bungcip.better-toml",
    "yzhang.markdown-all-in-one",
    "ms-vscode.vscode-json",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Git 配置
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

## 📝 开发工作流

### 1. 内容编辑
- 使用 Netlify CMS: 访问 `/admin` 进行可视化编辑
- 直接编辑 Markdown: 在 `content/` 目录下编辑 `.md` 文件

### 2. 主题定制
- 模板文件: `layouts/` 目录
- 样式文件: `themes/ananke/assets/`
- 静态资源: `static/` 目录

### 3. 构建部署
```bash
# 本地构建
hugo --minify

# 清理构建缓存
hugo --cleanDestinationDir
```

## 🚀 部署配置

### Netlify 部署
项目已配置自动部署到 Netlify：
- **构建命令**: `hugo --minify`
- **发布目录**: `public`
- **Hugo 版本**: 0.147.1

### 环境变量
```bash
HUGO_VERSION=0.147.1
HUGO_ENV=production
HUGO_ENABLEGITINFO=true
LC_ALL=zh_CN.UTF-8
LANG=zh_CN.UTF-8
```

## 🔍 故障排除

### 常见问题

1. **Hugo 命令未找到**
   - 确保 Hugo 已正确安装并在 PATH 中
   - Windows 用户可使用 `./hugo.exe` 直接运行

2. **中文字符显示问题**
   - 确保文件编码为 UTF-8
   - 检查 `hugo.toml` 中的 `hasCJKLanguage = true`

3. **图片无法显示**
   - 检查图片路径是否正确
   - 确保图片在 `static/images/` 目录中

4. **CMS 无法访问**
   - 确保 Netlify Identity 已配置
   - 检查 `static/admin/config.yml` 配置

### 日志查看
```bash
# Hugo 详细日志
hugo server -D --verbose

# Node.js 服务器日志
npm run dev
```

## 📚 相关文档

- [Hugo 官方文档](https://gohugo.io/documentation/)
- [Netlify CMS 文档](https://www.netlifycms.org/docs/)
- [Ananke 主题文档](https://github.com/theNewDynamic/gohugo-theme-ananke)

## 🤝 贡献指南

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建 Pull Request

---

**维护者**: Cery  
**最后更新**: 2025-07-12
