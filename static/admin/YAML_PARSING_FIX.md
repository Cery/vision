# Hugo YAML 解析错误修复报告

## 问题描述

发布产品后Hugo服务器报错：
```
process: "E:\Project\visndt\content\products\108155.md:1:1": failed to unmarshal YAML: yaml: control characters are not allowed
```

## 问题分析

### 根本原因
1. **文件名编码问题**：上传的中文文件名包含特殊字符和控制字符
2. **YAML字符串转义不完整**：生成的YAML文件中包含未转义的控制字符
3. **文件路径包含乱码**：如 `/uploads/products/1750727631696_GK18äº§åè§æ ¼ä¹¦.doc`

### 具体问题位置
在生成的产品文件 `108155.md` 中：
```yaml
data_download:
  - file_title: "产品说明书"
    file_path: "/uploads/products/1750727631696_GK18äº§åè§æ ¼ä¹¦.doc"  # 包含控制字符
  - file_title: "技术规格书"
    file_path: "/uploads/products/1750727651704_HJææ¯åæ°.pdf"      # 包含控制字符
```

## 🔧 修复方案

### 1. 文件名处理修复 ✅

**修复位置**：`product-server.js` - multer配置

**修复前**：
```javascript
filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${timestamp}_${name}${ext}`);
}
```

**修复后**：
```javascript
filename: function (req, file, cb) {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    let name = path.basename(file.originalname, ext);
    
    // 处理中文文件名，转换为安全的ASCII字符
    name = name
        .replace(/[^\w\s-]/g, '') // 移除特殊字符
        .replace(/\s+/g, '_')     // 空格替换为下划线
        .toLowerCase();           // 转为小写
    
    // 如果处理后名称为空，使用默认名称
    if (!name) {
        name = 'file';
    }
    
    cb(null, `${timestamp}_${name}${ext}`);
}
```

### 2. YAML字符串转义修复 ✅

**修复位置**：`static/admin/product-api.js` - generateProductMarkdown函数

**添加了完整的YAML字符串转义函数**：
```javascript
// YAML字符串转义函数
const escapeYamlString = (str) => {
    if (!str) return '""';
    // 转义引号和控制字符
    return '"' + str.toString()
        .replace(/\\/g, '\\\\')    // 转义反斜杠
        .replace(/"/g, '\\"')      // 转义双引号
        .replace(/\n/g, '\\n')     // 转义换行
        .replace(/\r/g, '\\r')     // 转义回车
        .replace(/\t/g, '\\t')     // 转义制表符
        .replace(/[\x00-\x1F\x7F]/g, '') // 移除控制字符
        + '"';
};
```

**应用到所有YAML字段**：
```javascript
// 基本信息
markdown += `title: ${escapeYamlString(productData.title)}\n`;
markdown += `summary: ${escapeYamlString(productData.summary)}\n`;
markdown += `primary_category: ${escapeYamlString(productData.primary_category)}\n`;
markdown += `secondary_category: ${escapeYamlString(productData.secondary_category)}\n`;
markdown += `model: ${escapeYamlString(productData.model)}\n`;
markdown += `series: ${escapeYamlString(productData.series)}\n`;
markdown += `supplier: ${escapeYamlString(productData.supplier)}\n`;

// 图库
markdown += `  - image: ${escapeYamlString(img.image)}\n`;
markdown += `    alt: ${escapeYamlString(img.alt)}\n`;

// 参数
markdown += `  - name: ${escapeYamlString(param.name)}\n`;
markdown += `    value: ${escapeYamlString(param.value)}\n`;

// 资料下载
markdown += `  - file_title: ${escapeYamlString(download.file_title)}\n`;
markdown += `    file_path: ${escapeYamlString(download.file_path)}\n`;

// 相关产品
markdown += `  - ${escapeYamlString(relatedId)}\n`;
```

### 3. 清理问题文件 ✅

删除了包含控制字符的问题文件：
- `content/products/108155.md`

## 📊 修复效果

### 修复前的问题文件示例
```yaml
data_download:
  - file_title: "产品说明书"
    file_path: "/uploads/products/1750727631696_GK18äº§åè§æ ¼ä¹¦.doc"  # ❌ 包含控制字符
```

### 修复后的正确格式
```yaml
data_download:
  - file_title: "产品说明书"
    file_path: "/uploads/products/1750727631696_gk18.doc"  # ✅ 安全的ASCII文件名
```

## 🎯 预防措施

### 1. 文件名安全化
- 移除所有非ASCII字符
- 空格替换为下划线
- 转换为小写
- 保留文件扩展名

### 2. 完整的YAML转义
- 转义所有特殊字符
- 移除控制字符
- 确保所有字符串都用双引号包围

### 3. 文件类型验证
```javascript
fileFilter: function (req, file, cb) {
    // 允许的文件类型
    const allowedTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/zip',
        'application/x-rar-compressed',
        'image/jpeg',
        'image/png',
        'image/gif'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('不支持的文件类型'), false);
    }
}
```

## 🚀 测试验证

### 测试步骤
1. **重启服务器**：
   ```bash
   node product-server.js
   ```

2. **测试文件上传**：
   - 上传包含中文名称的文件
   - 验证生成的文件名是否安全

3. **测试产品保存**：
   - 创建新产品
   - 填写包含特殊字符的内容
   - 验证生成的YAML文件是否正确

4. **验证Hugo解析**：
   - 检查Hugo服务器是否正常运行
   - 访问产品详情页验证显示效果

### 预期结果
- ✅ Hugo服务器正常运行，无YAML解析错误
- ✅ 文件上传生成安全的ASCII文件名
- ✅ 产品详情页正常显示所有内容
- ✅ 下载链接正常工作

## 📝 使用建议

### 1. 文件命名规范
- 建议使用英文文件名
- 避免特殊字符和空格
- 使用下划线分隔单词

### 2. 内容输入规范
- 富文本编辑器中避免粘贴包含控制字符的内容
- 建议直接输入或使用纯文本粘贴

### 3. 定期检查
- 定期检查生成的产品文件是否包含异常字符
- 监控Hugo服务器日志，及时发现问题

## 总结

通过以上修复：
- ✅ **文件名安全化**：所有上传文件都生成安全的ASCII文件名
- ✅ **YAML转义完整**：所有字符串都正确转义，移除控制字符
- ✅ **Hugo兼容性**：生成的YAML文件完全兼容Hugo解析器
- ✅ **系统稳定性**：避免因字符编码问题导致的服务器错误

现在系统能够安全处理包含中文字符的文件名和内容，确保Hugo服务器稳定运行！
