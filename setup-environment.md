# 开发环境快速设置指南

## 🚀 一键启动开发环境

### Windows 用户

1. **安装 Hugo**（如果尚未安装）：
   ```cmd
   install-hugo.bat
   ```

2. **启动开发环境**：
   ```cmd
   start-dev.bat
   ```

### Linux/macOS 用户

1. **安装 Hugo**：
   ```bash
   # macOS
   brew install hugo
   
   # Ubuntu/Debian
   sudo apt install hugo
   ```

2. **启动开发环境**：
   ```bash
   chmod +x start-dev.sh
   ./start-dev.sh
   ```

## 📋 环境验证清单

### ✅ 必需软件
- [ ] Node.js v16+ 已安装
- [ ] Hugo v0.147.1+ 已安装
- [ ] Git 已安装
- [ ] 项目依赖已安装 (`npm install`)

### ✅ 服务器状态
- [ ] Hugo 开发服务器运行在 http://localhost:1313
- [ ] Node.js 后端服务器运行在 http://localhost:3002
- [ ] 网站首页可以正常访问
- [ ] CMS 管理界面可以访问 (/admin)

### ✅ 功能测试
- [ ] 产品页面正常显示
- [ ] 资讯页面正常显示
- [ ] 图片资源正常加载
- [ ] 搜索功能正常工作

## 🔧 手动安装步骤

如果自动脚本无法工作，请按以下步骤手动安装：

### 1. 安装 Node.js
访问 https://nodejs.org/ 下载并安装 LTS 版本

### 2. 安装 Hugo
```bash
# Windows (手动下载)
curl -L -o hugo.zip "https://github.com/gohugoio/hugo/releases/download/v0.147.1/hugo_extended_0.147.1_windows-amd64.zip"
unzip hugo.zip

# macOS
brew install hugo

# Linux
sudo apt install hugo
```

### 3. 安装项目依赖
```bash
npm install
```

### 4. 启动服务器
```bash
# 启动 Hugo 开发服务器
hugo server -D

# 启动 Node.js 后端服务器（新终端）
node server.js
```

## 🐛 常见问题解决

### Hugo 命令未找到
- Windows: 使用 `./hugo.exe` 代替 `hugo`
- 确保 Hugo 在系统 PATH 中或使用完整路径

### 端口被占用
```bash
# 查看端口占用
netstat -ano | findstr :1313
netstat -ano | findstr :3002

# 杀死占用进程
taskkill /PID <进程ID> /F
```

### 中文字符显示问题
- 确保文件编码为 UTF-8
- 检查终端编码设置

### 图片无法显示
- 检查图片路径是否正确
- 确保图片在 `static/images/` 目录中

## 📞 获取帮助

如果遇到问题，请：
1. 检查控制台错误信息
2. 查看 Hugo 和 Node.js 日志
3. 确认所有依赖已正确安装
4. 联系项目维护者

---

**提示**: 首次运行可能需要几分钟来下载和安装依赖，请耐心等待。
