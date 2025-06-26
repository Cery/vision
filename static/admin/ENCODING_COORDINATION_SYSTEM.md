# 🌐 VisNDT 项目文字编码协调机制

## 📋 概述

本文档建立了一个全面的文字编码协调机制，确保在整个项目生态系统中避免任何编码问题，涵盖：
- 本地内容管理后台
- 项目前台展示
- Hugo静态站点生成器
- Netlify托管发布
- GitHub版本控制
- 各类浏览器兼容性

## 🎯 编码标准

### 统一编码标准：UTF-8
**所有文件和系统组件必须使用 UTF-8 编码**

```
文件编码：UTF-8 (无BOM)
HTML Meta：<meta charset="utf-8">
HTTP Header：Content-Type: text/html; charset=utf-8
数据库：utf8mb4_unicode_ci
API响应：application/json; charset=utf-8
```

## 🏗️ 各环节编码配置

### 1. Hugo 配置 (hugo.toml)
```toml
# 语言和编码设置
languageCode = 'zh-cn'
defaultContentLanguage = 'zh-cn'
hasCJKLanguage = true

# 确保正确处理中文字符
[markup]
  [markup.goldmark]
    [markup.goldmark.renderer]
      unsafe = true
  [markup.highlight]
    style = 'github'
    lineNos = true
    codeFences = true
```

### 2. HTML 模板编码声明
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="utf-8">
    <meta http-equiv="content-language" content="zh-CN">
    <meta name="language" content="zh-CN">
    <!-- 其他meta标签 -->
</head>
```

### 3. JavaScript 文件编码处理
```javascript
// 文件头部注释声明编码
// -*- coding: utf-8 -*-

// 字符串处理函数
function safeEncodeText(text) {
    return encodeURIComponent(text);
}

function safeDecodeText(encodedText) {
    return decodeURIComponent(encodedText);
}

// JSON数据处理
function safeJSONStringify(obj) {
    return JSON.stringify(obj, null, 2);
}
```

### 4. CSS 文件编码声明
```css
@charset "UTF-8";

/* 确保中文字体正确显示 */
body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 
                 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
```

## 🔧 技术实现细节

### 1. 文件保存编码规范
```bash
# 确保所有文件以UTF-8无BOM格式保存
# VS Code设置
"files.encoding": "utf8"
"files.autoGuessEncoding": false

# Git配置
git config core.quotepath false
git config core.precomposeunicode true
```

### 2. 内容管理系统编码处理
```javascript
// 表单数据提交前编码处理
function prepareFormData(formData) {
    const processedData = {};
    for (const [key, value] of Object.entries(formData)) {
        if (typeof value === 'string') {
            // 确保字符串正确编码
            processedData[key] = value.normalize('NFC');
        } else {
            processedData[key] = value;
        }
    }
    return processedData;
}

// Markdown内容处理
function processMarkdownContent(content) {
    // 标准化Unicode字符
    return content.normalize('NFC');
}
```

### 3. 数据存储编码规范
```yaml
# Front Matter 编码示例
---
title: "工业内窥镜检测解决方案"
summary: "专业的工业检测设备，适用于各种复杂环境"
tags: ["工业检测", "内窥镜", "质量控制"]
---
```

## 🌍 浏览器兼容性处理

### 1. HTTP响应头设置
```javascript
// Netlify _headers 文件
/*
  Content-Type: text/html; charset=utf-8
  X-Content-Type-Options: nosniff
```

### 2. 字体加载优化
```css
/* 中文字体优化加载 */
@font-face {
    font-family: 'Chinese-Font';
    src: local('PingFang SC'), local('Microsoft YaHei');
    unicode-range: U+4E00-9FFF;
}
```

## 📱 移动端编码适配

### 1. 移动浏览器Meta标签
```html
<meta name="format-detection" content="telephone=no">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black">
```

### 2. 触摸事件编码处理
```javascript
// 移动端输入法兼容
document.addEventListener('compositionstart', function(e) {
    // 处理中文输入法开始
});

document.addEventListener('compositionend', function(e) {
    // 处理中文输入法结束
    const normalizedText = e.target.value.normalize('NFC');
    e.target.value = normalizedText;
});
```

## 🔍 SEO 编码优化

### 1. 搜索引擎友好的URL编码
```javascript
// URL slug生成
function generateSlug(title) {
    return title
        .toLowerCase()
        .replace(/[\u4e00-\u9fff]+/g, function(match) {
            // 中文字符转拼音或保持原样
            return encodeURIComponent(match);
        })
        .replace(/[^\w\-]+/g, '-')
        .replace(/\-\-+/g, '-')
        .replace(/^-+/, '')
        .replace(/-+$/, '');
}
```

### 2. 结构化数据编码
```html
<script type="application/ld+json">
{
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "维森视觉检测仪器",
    "description": "专业的工业内窥镜和视觉检测设备制造商"
}
</script>
```

## 🚀 部署环境编码配置

### 1. Netlify 构建配置
```toml
# netlify.toml
[build]
  command = "hugo --minify"
  publish = "public"

[build.environment]
  HUGO_VERSION = "0.147.1"
  HUGO_ENV = "production"
  LC_ALL = "zh_CN.UTF-8"
  LANG = "zh_CN.UTF-8"
```

### 2. GitHub Actions 编码设置
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify
on:
  push:
    branches: [ master ]

jobs:
  build:
    runs-on: ubuntu-latest
    env:
      LC_ALL: zh_CN.UTF-8
      LANG: zh_CN.UTF-8
    steps:
      - uses: actions/checkout@v3
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: '0.147.1'
          extended: true
```

## 📊 编码验证机制

### 1. 自动化编码检查
```javascript
// 编码验证函数
function validateEncoding(text) {
    try {
        // 检查是否为有效UTF-8
        const encoded = encodeURIComponent(text);
        const decoded = decodeURIComponent(encoded);
        return decoded === text;
    } catch (error) {
        console.error('编码验证失败:', error);
        return false;
    }
}

// 批量文件编码检查
function checkFileEncoding(files) {
    const results = [];
    files.forEach(file => {
        const isValid = validateEncoding(file.content);
        results.push({
            filename: file.name,
            isValid: isValid,
            encoding: isValid ? 'UTF-8' : 'Unknown'
        });
    });
    return results;
}
```

### 2. 内容提交前验证
```javascript
// 表单提交前编码验证
function validateFormEncoding(formData) {
    const errors = [];
    
    Object.entries(formData).forEach(([key, value]) => {
        if (typeof value === 'string') {
            if (!validateEncoding(value)) {
                errors.push(`字段 ${key} 包含无效字符编码`);
            }
        }
    });
    
    return {
        isValid: errors.length === 0,
        errors: errors
    };
}
```

## 🛠️ 故障排除指南

### 1. 常见编码问题及解决方案
```
问题：中文字符显示为乱码
解决：检查文件编码是否为UTF-8，确认HTML meta标签正确

问题：表单提交后中文丢失
解决：检查JavaScript字符串处理，确保使用正确的编码函数

问题：URL中文参数错误
解决：使用encodeURIComponent()和decodeURIComponent()处理

问题：数据库中文存储异常
解决：确认数据库字符集为utf8mb4
```

### 2. 调试工具和方法
```javascript
// 编码调试工具
const EncodingDebugger = {
    // 检查字符串编码
    checkString: function(str) {
        console.log('原始字符串:', str);
        console.log('字符长度:', str.length);
        console.log('字节长度:', new Blob([str]).size);
        console.log('Unicode编码:', str.split('').map(c => c.charCodeAt(0)));
    },
    
    // 检查文件编码
    checkFile: function(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const content = e.target.result;
            console.log('文件编码检查:', {
                filename: file.name,
                size: file.size,
                type: file.type,
                encoding: 'UTF-8' // 假设检测结果
            });
        };
        reader.readAsText(file, 'UTF-8');
    }
};
```

## 📋 编码检查清单

### 日常开发检查项
- [ ] 所有新建文件使用UTF-8编码保存
- [ ] HTML文件包含正确的charset声明
- [ ] JavaScript字符串处理使用标准化函数
- [ ] CSS文件包含@charset声明
- [ ] 表单数据提交前进行编码验证
- [ ] URL参数正确编码/解码
- [ ] 数据库操作使用正确字符集

### 发布前检查项
- [ ] 所有模板文件编码正确
- [ ] 静态资源文件编码一致
- [ ] 构建过程无编码警告
- [ ] 浏览器测试中文显示正常
- [ ] 移动端中文输入正常
- [ ] SEO标签中文内容正确

## 🔄 持续监控机制

### 1. 自动化监控脚本
```bash
#!/bin/bash
# encoding-check.sh - 编码检查脚本

echo "🔍 开始编码检查..."

# 检查文件编码
find . -name "*.html" -o -name "*.js" -o -name "*.css" -o -name "*.md" | while read file; do
    if ! file "$file" | grep -q "UTF-8"; then
        echo "❌ 编码异常: $file"
    fi
done

# 检查HTML meta标签
grep -r "charset" layouts/ static/ | grep -v "utf-8\|UTF-8" && echo "❌ 发现非UTF-8编码声明"

echo "✅ 编码检查完成"
```

### 2. Git提交钩子
```bash
#!/bin/sh
# .git/hooks/pre-commit

# 检查提交文件的编码
for file in $(git diff --cached --name-only); do
    if [[ $file =~ \.(html|js|css|md)$ ]]; then
        if ! file "$file" | grep -q "UTF-8"; then
            echo "错误: $file 不是UTF-8编码"
            exit 1
        fi
    fi
done
```

## 🌟 最佳实践建议

### 1. 开发环境配置
```json
// VS Code settings.json
{
    "files.encoding": "utf8",
    "files.autoGuessEncoding": false,
    "files.insertFinalNewline": true,
    "files.trimTrailingWhitespace": true,
    "editor.detectIndentation": false,
    "editor.insertSpaces": true,
    "editor.tabSize": 4
}
```

### 2. 团队协作规范
- 统一使用UTF-8编码
- 代码审查时检查编码问题
- 定期运行编码检查脚本
- 文档更新时验证中文显示
- 新功能开发包含编码测试

### 3. 性能优化建议
```javascript
// 字符串处理性能优化
const StringUtils = {
    // 缓存常用字符串处理结果
    cache: new Map(),

    // 高效的中文字符检测
    hasChinese: function(str) {
        return /[\u4e00-\u9fff]/.test(str);
    },

    // 批量字符串标准化
    batchNormalize: function(strings) {
        return strings.map(str => str.normalize('NFC'));
    }
};
```

## 📞 技术支持

### 编码问题报告模板
```
问题描述：
- 出现位置：
- 浏览器版本：
- 操作系统：
- 复现步骤：
- 预期结果：
- 实际结果：
- 错误截图：

技术信息：
- 文件编码：
- HTTP响应头：
- JavaScript控制台错误：
- 网络请求详情：
```

### 紧急修复流程
1. 立即回滚到上一个稳定版本
2. 定位编码问题根源
3. 在开发环境修复并测试
4. 部署修复版本
5. 验证所有功能正常
6. 更新编码检查机制

---

## 📝 更新日志

### v1.0.0 (2024-06-26)
- 建立完整的编码协调机制
- 覆盖所有技术栈组件
- 提供自动化检查工具
- 建立持续监控机制

---

**维护者**: VisNDT 技术团队
**最后更新**: 2024-06-26
**版本**: 1.0.0
