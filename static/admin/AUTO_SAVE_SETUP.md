# MD文件自动保存功能设置指南

## 功能概述

现在产品添加功能支持MD文件自动保存到 `content/products/` 目录，无需手动下载和复制文件。

## 自动保存方法

系统提供多种自动保存方法，按优先级排序：

### 1. 后端API方式（推荐）✅
- **优点**：完全自动化，无需用户干预
- **要求**：需要启动Node.js后端服务
- **保存位置**：直接保存到 `content/products/` 目录

### 2. 文件系统API方式
- **优点**：浏览器原生支持
- **要求**：现代浏览器（Chrome 86+, Edge 86+）
- **限制**：需要用户授权目录访问

### 3. PowerShell方式
- **优点**：Windows系统直接支持
- **要求**：Windows环境 + 特殊浏览器权限
- **限制**：需要浏览器扩展或特殊配置

### 4. 下载方式（降级）
- **优点**：所有浏览器都支持
- **缺点**：需要手动保存文件
- **使用场景**：其他方法都不可用时

## 快速设置（推荐方法）

### 步骤1：安装Node.js依赖

```powershell
# 进入项目目录
cd C:\Users\Hper-01\Documents\augment-projects\vision

# 进入scripts目录
cd scripts

# 安装依赖
npm install
```

### 步骤2：启动后端服务

```powershell
# 方法1：使用启动脚本（推荐）
.\start-markdown-server.ps1

# 方法2：直接启动
node markdown-server.js
```

### 步骤3：验证服务状态

1. 打开内容管理系统：http://localhost:1313/admin/complete-content-manager.html
2. 点击"API状态"按钮检查服务状态
3. 看到"✅ 后端API可用"表示设置成功

## 详细设置步骤

### 1. 检查Node.js环境

```powershell
# 检查Node.js版本
node --version

# 如果未安装，请下载安装：https://nodejs.org/
```

### 2. 安装项目依赖

```powershell
# 进入scripts目录
cd scripts

# 查看package.json
Get-Content package.json

# 安装依赖
npm install
```

### 3. 启动Markdown服务器

#### 方法A：使用PowerShell脚本（推荐）

```powershell
# 启动服务器
.\start-markdown-server.ps1

# 检查状态
.\start-markdown-server.ps1 -Status

# 停止服务器
.\start-markdown-server.ps1 -Stop

# 重新安装依赖
.\start-markdown-server.ps1 -Install
```

#### 方法B：直接使用Node.js

```powershell
cd scripts
node markdown-server.js
```

### 4. 验证服务运行

打开浏览器访问：http://localhost:3001/api/health

应该看到：
```json
{
  "success": true,
  "message": "Markdown服务器运行正常",
  "timestamp": "2025-07-09T..."
}
```

## 使用方法

### 添加产品

1. 打开内容管理系统
2. 点击"添加产品"
3. 填写产品信息
4. 上传产品图片
5. 点击"保存"
6. 系统显示"产品添加成功！MD文件已自动保存到 content/products/xxx.md"

### 检查保存结果

```powershell
# 查看保存的文件
Get-ChildItem content\products\*.md | Sort-Object LastWriteTime -Descending | Select-Object -First 5

# 查看最新文件内容
Get-Content content\products\最新文件名.md -Head 20
```

## API接口说明

### 保存文件
- **URL**: `POST http://localhost:3001/api/save-markdown`
- **参数**:
  ```json
  {
    "fileName": "product-name.md",
    "content": "markdown内容",
    "contentType": "products"
  }
  ```

### 获取文件列表
- **URL**: `GET http://localhost:3001/api/saved-files/products`
- **返回**: 文件列表和信息

### 健康检查
- **URL**: `GET http://localhost:3001/api/health`
- **返回**: 服务器状态

## 故障排除

### 问题1：后端API不可用

**症状**：点击"API状态"显示"❌ 后端API不可用"

**解决方案**：
```powershell
# 检查Node.js是否安装
node --version

# 检查端口是否被占用
netstat -ano | findstr :3001

# 启动服务器
cd scripts
.\start-markdown-server.ps1
```

### 问题2：依赖安装失败

**症状**：npm install报错

**解决方案**：
```powershell
# 清理npm缓存
npm cache clean --force

# 删除node_modules重新安装
Remove-Item node_modules -Recurse -Force
npm install
```

### 问题3：文件保存权限问题

**症状**：API返回权限错误

**解决方案**：
```powershell
# 以管理员身份运行PowerShell
# 或者检查content目录权限
icacls content /grant Users:F /T
```

### 问题4：端口冲突

**症状**：服务器启动失败，端口被占用

**解决方案**：
```powershell
# 查找占用端口的进程
netstat -ano | findstr :3001

# 终止进程（替换PID）
taskkill /PID 进程ID /F

# 或者修改服务器端口
# 编辑 scripts/markdown-server.js 中的 PORT 变量
```

## 开发模式

如果需要开发或调试：

```powershell
# 安装开发依赖
npm install --save-dev nodemon

# 使用nodemon启动（自动重启）
npm run dev
```

## 生产部署

如果需要在生产环境使用：

```powershell
# 使用PM2管理进程
npm install -g pm2
pm2 start scripts/markdown-server.js --name "markdown-server"
pm2 startup
pm2 save
```

## 安全注意事项

1. **本地开发**：此服务器仅适用于本地开发环境
2. **端口访问**：确保3001端口仅本地访问
3. **文件权限**：服务器只能访问项目目录
4. **CORS设置**：已配置CORS仅允许本地访问

## 总结

通过设置后端API服务，现在可以实现：

✅ **自动保存**：MD文件直接保存到content/products/目录
✅ **即时生效**：Hugo自动检测文件变化并重新构建
✅ **无需手动操作**：完全自动化的工作流程
✅ **错误处理**：多种降级方案确保功能可用
✅ **状态监控**：实时检查API服务状态

设置完成后，添加产品时会看到"产品添加成功！MD文件已自动保存到 content/products/xxx.md"的提示，表示功能正常工作。
