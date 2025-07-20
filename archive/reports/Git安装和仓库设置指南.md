# Git安装和仓库设置指南

## 🎯 目标
将Vision NDT项目推送到远程Git仓库（如GitHub、GitLab等）

## 📋 当前状态
- ✅ 项目文件完整
- ✅ Python图片抓取服务已完成
- ✅ 所有功能正常工作
- ❌ Git未安装
- ❌ 项目未初始化为Git仓库

## 🚀 步骤一：安装Git

### 方法1：从官网下载（推荐）
1. 访问 https://git-scm.com/download/windows
2. 下载最新版本的Git for Windows
3. 运行安装程序
4. 安装时选择以下选项：
   - ✅ 勾选"Add Git to PATH"
   - ✅ 选择"Use Git from the command line and also from 3rd-party software"
   - ✅ 选择"Checkout Windows-style, commit Unix-style line endings"

### 方法2：使用包管理器
如果您有Chocolatey或Winget：
```powershell
# 使用Chocolatey
choco install git

# 或使用Winget
winget install Git.Git
```

### 验证安装
安装完成后，重启命令提示符并运行：
```bash
git --version
```
应该显示Git版本信息。

## 🔧 步骤二：配置Git

### 设置用户信息
```bash
git config --global user.name "您的姓名"
git config --global user.email "您的邮箱@example.com"
```

### 设置默认分支名
```bash
git config --global init.defaultBranch main
```

## 📦 步骤三：初始化Git仓库

### 在项目目录中运行：
```bash
# 进入项目目录
cd "C:\Users\Cery\Documents\augment-projects\vision"

# 初始化Git仓库
git init

# 添加所有文件到暂存区
git add .

# 创建初始提交
git commit -m "Initial commit: Vision NDT project with Python image crawler service

- Complete Hugo static site
- Python image crawler service with Flask API
- Image processing tools with web interface
- Exhibition content management system
- Responsive design and mobile optimization
- SEO optimization and performance improvements"
```

## 🌐 步骤四：创建远程仓库

### GitHub方式
1. 访问 https://github.com
2. 点击"New repository"
3. 仓库名称：`vision-ndt`
4. 描述：`Vision NDT - Professional NDT Equipment and Services Website`
5. 选择"Public"或"Private"
6. 不要勾选"Initialize this repository with a README"
7. 点击"Create repository"

### GitLab方式
1. 访问 https://gitlab.com
2. 点击"New project"
3. 选择"Create blank project"
4. 项目名称：`vision-ndt`
5. 描述：`Vision NDT - Professional NDT Equipment and Services Website`
6. 选择可见性级别
7. 点击"Create project"

## 🔗 步骤五：连接远程仓库

### 添加远程仓库
```bash
# GitHub示例
git remote add origin https://github.com/您的用户名/vision-ndt.git

# GitLab示例
git remote add origin https://gitlab.com/您的用户名/vision-ndt.git
```

### 推送到远程仓库
```bash
# 推送主分支
git push -u origin main
```

## 📁 步骤六：创建.gitignore文件

创建 `.gitignore` 文件来排除不需要版本控制的文件：

```gitignore
# Hugo
/public/
/resources/_gen/
.hugo_build.lock

# Node.js
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Python
__pycache__/
*.py[cod]
*$py.class
*.so
.Python
venv/
env/
.env

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db

# Logs
*.log

# Temporary files
*.tmp
*.temp

# Build artifacts
dist/
build/
```

## 🔄 日常Git工作流程

### 提交更改
```bash
# 查看状态
git status

# 添加更改的文件
git add .

# 提交更改
git commit -m "描述您的更改"

# 推送到远程仓库
git push
```

### 拉取远程更改
```bash
git pull
```

## 📊 项目结构说明

当前项目包含以下主要组件：

```
vision/
├── static/tools/python-crawler/     # Python图片抓取服务
│   ├── image_crawler_service.py     # Flask API服务
│   ├── requirements.txt             # Python依赖
│   ├── start_service_final.bat      # 启动脚本
│   └── README.md                    # 服务说明
├── layouts/                         # Hugo模板
├── content/                         # 网站内容
├── static/                          # 静态资源
├── public/                          # 生成的网站（不提交）
└── hugo.toml                        # Hugo配置
```

## 🎯 推荐的提交信息格式

```bash
# 功能添加
git commit -m "feat: add Python image crawler service"

# 错误修复
git commit -m "fix: resolve URL format issue in image crawler"

# 文档更新
git commit -m "docs: update installation guide"

# 样式调整
git commit -m "style: improve exhibition template design"

# 重构
git commit -m "refactor: optimize image processing workflow"
```

## 🔒 安全注意事项

### 敏感信息保护
- 不要提交API密钥、密码等敏感信息
- 使用环境变量存储配置
- 检查.gitignore文件是否正确排除敏感文件

### 大文件处理
- 图片文件较大时考虑使用Git LFS
- 定期清理不需要的大文件

## 📞 下一步操作

1. **安装Git**：按照上述步骤安装Git
2. **配置Git**：设置用户信息
3. **初始化仓库**：在项目目录中初始化Git
4. **创建远程仓库**：在GitHub或GitLab创建仓库
5. **推送代码**：将本地代码推送到远程仓库

完成这些步骤后，您的Vision NDT项目就会安全地存储在远程仓库中，并且可以进行版本控制和协作开发。
