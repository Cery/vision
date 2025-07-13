# Python安装指南

## 🚀 快速安装

### 1. 下载Python
访问官网：**https://www.python.org/downloads/**
- 点击黄色的 "Download Python 3.x.x" 按钮
- 推荐下载 Python 3.9 或更高版本

### 2. 安装Python
1. 运行下载的安装程序
2. **⚠️ 重要：勾选 "Add Python to PATH"** 
3. 点击 "Install Now" 进行标准安装
4. 等待安装完成

### 3. 验证安装
1. 按 `Win + R` 打开运行对话框
2. 输入 `cmd` 并按回车
3. 在命令提示符中输入：`python --version`
4. 如果显示版本号，说明安装成功

## 🔧 常见问题

### Q: 提示"Python was not found"
**原因**：安装时没有勾选 "Add Python to PATH"

**解决方案**：
1. 重新运行Python安装程序
2. 选择 "Modify" 修改安装
3. 确保勾选 "Add Python to PATH"
4. 完成后重启命令提示符

### Q: 多个Python版本冲突
**解决方案**：
- 使用 `py -3.9` 指定版本
- 或卸载旧版本，重新安装

### Q: 权限不足
**解决方案**：
- 右键点击安装程序
- 选择"以管理员身份运行"

## 📋 安装验证清单

运行 `check_python.bat` 检测工具，确认：
- [ ] Python命令可用
- [ ] 版本为 3.7+
- [ ] pip工具可用
- [ ] 环境变量配置正确

## 🎯 下一步

Python安装完成后：
1. 双击运行 `start_service.bat`
2. 等待依赖包安装完成
3. 服务启动后即可使用图片抓取功能

## 📞 技术支持

如遇问题：
1. 运行 `check_python.bat` 检测环境
2. 查看错误信息和建议
3. 按照提示解决问题

**记住**：安装Python时一定要勾选 "Add Python to PATH" 选项！
