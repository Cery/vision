# 🐍 Python抓取服务启动指南

## 🔍 问题诊断

根据当前情况，Python抓取功能无法启动的原因是：
- ❌ Python未正确安装或未添加到PATH环境变量
- ❌ Python依赖包未安装
- ❌ Python服务未启动

## 🛠️ 解决方案

### **方案1：快速解决（推荐）**

#### **1. 安装Python**
1. 访问 https://www.python.org/downloads/
2. 下载Python 3.8或更高版本
3. **重要**：安装时必须勾选 "Add Python to PATH" 选项
4. 完成安装后重启命令提示符

#### **2. 验证Python安装**
```bash
# 在命令提示符中运行
python --version
# 应该显示类似：Python 3.x.x

pip --version
# 应该显示pip版本信息
```

#### **3. 安装依赖包**
```bash
# 进入Python爬虫目录
cd static\tools\python-crawler

# 安装依赖
pip install -r requirements.txt
```

#### **4. 启动服务**
```bash
# 方法1：使用启动脚本（推荐）
.\start_service.bat

# 方法2：直接运行Python服务
python image_crawler_service.py
```

### **方案2：使用虚拟环境（高级用户）**

#### **1. 创建虚拟环境**
```bash
cd static\tools\python-crawler
python -m venv venv
```

#### **2. 激活虚拟环境**
```bash
# Windows
venv\Scripts\activate

# 激活后命令提示符前会显示 (venv)
```

#### **3. 安装依赖并启动**
```bash
pip install -r requirements.txt
python image_crawler_service.py
```

## 📋 依赖包列表

Python抓取服务需要以下包：
```
Flask==2.3.3
Flask-CORS==4.0.0
requests==2.31.0
beautifulsoup4==4.12.2
Pillow==10.0.1
lxml==4.9.3
```

## 🔧 故障排除

### **问题1：Python命令无法识别**
```bash
# 错误信息：'python' is not recognized as an internal or external command
```
**解决方案**：
1. 重新安装Python，确保勾选"Add Python to PATH"
2. 手动添加Python到PATH环境变量
3. 重启命令提示符

### **问题2：pip安装失败**
```bash
# 错误信息：pip install 失败
```
**解决方案**：
1. 升级pip：`python -m pip install --upgrade pip`
2. 使用国内镜像：`pip install -r requirements.txt -i https://pypi.tuna.tsinghua.edu.cn/simple/`

### **问题3：端口被占用**
```bash
# 错误信息：Address already in use
```
**解决方案**：
1. 查找占用端口的进程：`netstat -ano | findstr :5000`
2. 结束进程：`taskkill /PID <进程ID> /F`
3. 重新启动服务

### **问题4：权限不足**
```bash
# 错误信息：Permission denied
```
**解决方案**：
1. 以管理员身份运行命令提示符
2. 检查防火墙设置
3. 检查杀毒软件是否阻止

## ✅ 验证服务启动成功

### **1. 检查服务状态**
服务启动成功后，应该看到类似输出：
```
========================================
           图片抓取服务启动器
========================================
版本: v1.0.0
项目: Vision NDT 图片处理工具
========================================

[1/5] 检查Python环境...
✅ Python 已安装: Python 3.x.x

[2/5] 检查依赖包...
✅ 所有依赖包已安装

[3/5] 启动服务...
 * Running on http://127.0.0.1:5000
 * Debug mode: off
```

### **2. 测试服务连接**
在浏览器中访问：http://localhost:5000/api/health
应该返回：`{"status": "ok", "message": "图片抓取服务运行正常"}`

### **3. 在图片处理工具中验证**
1. 刷新图片处理工具页面：http://localhost:1315/tools/image-processor.html
2. 查看"Python服务状态"应该显示"在线"（绿色）
3. "Python抓取"按钮应该可以正常使用

## 🚀 快速启动命令

如果Python已正确安装，使用以下命令快速启动：

```bash
# 1. 进入目录
cd C:\Users\Cery\Documents\augment-projects\vision\static\tools\python-crawler

# 2. 启动服务
.\start_service.bat

# 或者直接运行
python image_crawler_service.py
```

## 📞 需要帮助？

如果仍然遇到问题：
1. 检查Python版本是否为3.8+
2. 确认所有依赖包已安装
3. 检查防火墙和杀毒软件设置
4. 尝试以管理员身份运行

**服务启动成功后，Python抓取功能就可以正常使用了！** 🎉
