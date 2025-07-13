# Python图片抓取服务

## 🚀 快速开始

### 首次使用（需要安装Python）

#### 1. 检查Python环境
双击运行 `check_python_simple.bat` 检查Python是否已安装

#### 2. 安装Python（如果需要）
- 如果Python未安装，双击运行 `install_python.bat` 获取安装指导
- 或直接访问 https://www.python.org/downloads/ 下载安装
- **重要**：安装时必须勾选 "Add Python to PATH" 选项

#### 3. 启动服务
双击运行 `start_service.bat` 文件，首次运行会自动：
- 创建Python虚拟环境
- 安装所需依赖包
- 启动抓取服务

### 日常使用（Python已安装）

#### 快速启动
双击运行 `quick_start.bat` 即可快速启动服务

#### 使用功能
1. 在图片处理工具中选择"网页抓取" → "Python抓取"
2. 确认服务状态为"在线"
3. 输入目标网页URL
4. 设置过滤条件
5. 点击"开始Python抓取"

## 📋 功能特性

### ✅ 真实网页抓取
- **无跨域限制**：Python后端绕过浏览器限制
- **智能解析**：使用BeautifulSoup解析HTML
- **多属性支持**：支持src、data-src等多种图片属性
- **URL处理**：自动处理相对路径和绝对路径

### ✅ 高级过滤功能
- **格式过滤**：JPG、PNG、WebP等格式选择
- **尺寸过滤**：设置最小宽度/高度要求
- **大小限制**：自动跳过超大文件（>10MB）
- **数量控制**：限制最大抓取数量

### ✅ 智能下载
- **批量压缩**：多张图片打包为ZIP文件
- **自定义命名**：支持重命名每张图片
- **断点续传**：网络异常时自动重试
- **进度显示**：实时显示下载进度

## 🛠️ 安装要求

### Python环境
- **Python 3.7+** (推荐3.9+)
- **pip** 包管理器

### 依赖包
```
Flask==2.3.3          # Web框架
Flask-CORS==4.0.0     # 跨域支持
requests==2.31.0      # HTTP客户端
beautifulsoup4==4.12.2 # HTML解析
Pillow==10.0.1        # 图片处理
lxml==4.9.3           # XML解析器
```

## 📊 API接口

### 1. 健康检查
```
GET /api/health
Response: {"status": "ok", "service": "image-crawler"}
```

### 2. 抓取图片
```
POST /api/crawl
Body: {
  "url": "https://example.com",
  "filters": {
    "format": "all|jpg|png|webp",
    "min_size": 100,
    "large_only": false,
    "max_images": 50
  }
}
```

### 3. 批量下载
```
POST /api/download
Body: {
  "urls": ["url1", "url2", ...],
  "filenames": ["name1.jpg", "name2.png", ...]
}
Response: ZIP文件流
```

## 🔍 故障排除

### 启动脚本无输出或立即关闭
**原因**：Python未安装或未添加到PATH
**解决方案**：
1. 运行 `check_python_simple.bat` 检查Python环境
2. 如果显示"Python not found"，需要安装Python
3. 运行 `install_python.bat` 获取安装指导

### Python安装问题
**常见问题**：
- 安装时忘记勾选"Add Python to PATH"
- 安装了多个Python版本导致冲突
- 权限不足导致安装失败

**解决方案**：
1. 重新安装Python，确保勾选PATH选项
2. 卸载旧版本Python后重新安装
3. 使用管理员权限运行安装程序

### 服务无法启动
1. **检查Python版本**：运行 `python --version`
2. **检查端口占用**：确保5000端口未被占用
3. **查看错误日志**：启动脚本会显示详细错误信息
4. **检查依赖安装**：确保requirements.txt中的包都已安装

### 抓取失败
1. **检查URL有效性**：确保目标网站可访问
2. **网络连接**：确保网络连接正常
3. **反爬虫机制**：某些网站可能有反爬虫保护
4. **服务状态**：确认Python服务正在运行

### 下载失败
1. **图片URL有效性**：某些图片可能已失效
2. **文件权限**：确保有写入权限
3. **磁盘空间**：确保有足够存储空间
4. **网络稳定性**：大文件下载需要稳定网络

## 🔒 安全说明

### 网络安全
- 服务仅监听本地地址(127.0.0.1)
- 不对外网开放访问
- 使用标准HTTP协议

### 数据隐私
- 不存储用户数据
- 不记录访问日志
- 临时文件自动清理

## 📞 技术支持

如遇问题，请检查：
1. Python环境是否正确安装
2. 依赖包是否完整安装
3. 网络连接是否正常
4. 目标网站是否可访问

**注意**：请遵守目标网站的robots.txt和使用条款，合理使用抓取功能。
