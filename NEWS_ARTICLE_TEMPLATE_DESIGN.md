# 技术文章和行业资讯模板设计说明

## 🎯 设计目标

为技术文章和行业资讯创建专业、统一、美观的页面模板，突出不同类型文章的特色：
1. **技术文章**：突出代码展示、技术深度、实用性
2. **行业资讯**：突出数据分析、市场洞察、权威性
3. **统一体验**：保持一致的视觉风格和交互体验

## 🎨 设计理念

### 1. 差异化设计
- **技术文章**：绿色主题，体现技术专业性
- **行业资讯**：蓝色主题，体现商业权威性
- **通用文章**：灰色主题，保持中性风格

### 2. 内容优先
- 清晰的信息层次结构
- 优秀的阅读体验
- 丰富的图文展示

### 3. 响应式设计
- 适配所有设备尺寸
- 优化移动端阅读体验
- 保持视觉一致性

## 🔧 技术实现

### 1. 统一模板架构

#### 主模板文件
- **layouts/news/single.html**：统一的新闻详情页模板
- **layouts/news/tech-article.html**：技术文章专用模板（调用主模板）
- **layouts/news/industry-news.html**：行业资讯专用模板（调用主模板）

#### 模板调用机制
```html
<!-- 技术文章模板 -->
{{ define "main" }}
{{ $originalCategory := .Params.category }}
{{ .Scratch.Set "category" "technical" }}
{{ partial "news/single.html" . }}
{{ end }}

<!-- 行业资讯模板 -->
{{ define "main" }}
{{ $originalCategory := .Params.category }}
{{ .Scratch.Set "category" "industry" }}
{{ partial "news/single.html" . }}
{{ end }}
```

### 2. 动态样式系统

#### 根据文章类型自动应用样式
```html
{{ $articleType := .Params.category }}
{{ $isIndustry := eq $articleType "industry" }}
{{ $isTechnical := eq $articleType "technical" }}

<div class="article-header {{ if $isTechnical }}bg-gradient-technical{{ else if $isIndustry }}bg-gradient-industry{{ else }}bg-gradient-default{{ end }}">
```

#### CSS渐变背景
```css
.bg-gradient-technical {
    background: linear-gradient(135deg, #2e7d32 0%, #388e3c 50%, #4caf50 100%);
}

.bg-gradient-industry {
    background: linear-gradient(135deg, #1976d2 0%, #1e88e5 50%, #2196f3 100%);
}

.bg-gradient-default {
    background: linear-gradient(135deg, #424242 0%, #616161 50%, #757575 100%);
}
```

### 3. 页面结构设计

#### 文章头部区域
```html
<div class="article-header">
    <div class="container">
        <div class="row">
            <div class="col-lg-8 mx-auto text-center">
                <!-- 文章分类标识 -->
                <div class="article-category mb-3">
                    <span class="badge bg-light text-dark px-4 py-2 fs-6">
                        <i class="fas fa-code me-2"></i>技术文章
                    </span>
                </div>
                
                <!-- 文章标题 -->
                <h1 class="display-6 fw-bold mb-4 article-title">{{ .Title }}</h1>
                
                <!-- 文章摘要 -->
                <p class="lead mb-4 article-summary">{{ .Params.summary }}</p>
                
                <!-- 文章元信息 -->
                <div class="article-meta text-white-50">
                    <!-- 发布时间、作者、阅读时间、浏览次数 -->
                </div>
            </div>
        </div>
    </div>
</div>
```

#### 主内容区域
```html
<div class="container">
    <div class="row">
        <!-- 文章内容主体 (8列) -->
        <div class="col-lg-8">
            <!-- 特色图片 -->
            <div class="featured-image-container mb-5">
                <img src="..." class="img-fluid rounded shadow featured-image">
                <div class="image-caption">图片说明</div>
            </div>

            <!-- 文章正文 -->
            <div class="article-content bg-white rounded shadow-sm">
                <div class="content-body p-4 p-lg-5">
                    <!-- 技术文章特有的目录 -->
                    {{ if $isTechnical }}
                    <div class="tech-toc bg-light rounded p-3 mb-4">
                        <h5>文章目录</h5>
                        <div id="auto-toc"></div>
                    </div>
                    {{ end }}

                    <!-- 文章内容 -->
                    <div class="content">{{ .Content }}</div>

                    <!-- 技术要点 -->
                    {{ if $isTechnical }}
                    <div class="tech-highlights mt-5 p-4 bg-light rounded">
                        <h5>技术要点</h5>
                        <!-- 技术要点列表 -->
                    </div>
                    {{ end }}
                </div>
            </div>
        </div>

        <!-- 侧边栏 (4列) -->
        <div class="col-lg-4">
            <!-- 文章信息卡片 -->
            <!-- 相关文章推荐 -->
        </div>
    </div>
</div>
```

## 📋 内容结构设计

### 1. 技术文章结构

#### Front Matter字段
```yaml
---
title: "文章标题"
summary: "文章摘要"
category: "technical"
categories: ["技术文章"]
tags: ["技术标签"]

# 技术文章特有字段
difficulty: "intermediate"  # beginner/intermediate/advanced
target_audience: "目标读者"
reading_time: 12
tech_highlights:
  - "技术要点1"
  - "技术要点2"

author: "作者"
version: "版本号"
---
```

#### 内容组织结构
```markdown
## 技术背景
问题描述和技术需求

## 核心算法详解
### 1. 算法原理
### 2. 代码实现
### 3. 性能优化

## 实际应用案例
具体应用场景和效果

## 技术发展趋势
未来发展方向

## 总结与展望
技术总结和发展预测
```

### 2. 行业资讯结构

#### Front Matter字段
```yaml
---
title: "资讯标题"
summary: "资讯摘要"
category: "industry"
categories: ["行业资讯"]
tags: ["行业标签"]

# 行业资讯特有字段
market_size: "市场规模"
growth_rate: "增长率"
forecast_period: "预测期间"
key_regions: ["重点区域"]

author: "作者"
reading_time: 8
---
```

#### 内容组织结构
```markdown
## 市场概况
市场规模和发展现状

## 技术发展趋势
### 1. 技术创新
### 2. 应用拓展

## 区域市场分析
### 亚太地区
### 北美市场
### 欧洲市场

## 应用领域分析
各个应用领域的发展情况

## 竞争格局分析
主要厂商和竞争态势

## 发展机遇与挑战
### 发展机遇
### 面临挑战

## 未来发展预测
市场预测和发展方向

## 投资建议
对不同角色的建议

## 结论
总结和展望
```

## 🎨 视觉设计特色

### 1. 色彩系统

#### 技术文章（绿色系）
- **主色调**：#2e7d32, #388e3c, #4caf50
- **辅助色**：#e8f5e8, #c8e6c9
- **强调色**：#ff9800（警告）, #f44336（错误）

#### 行业资讯（蓝色系）
- **主色调**：#1976d2, #1e88e5, #2196f3
- **辅助色**：#e3f2fd, #bbdefb
- **强调色**：#ff5722（数据）, #9c27b0（趋势）

### 2. 排版设计

#### 标题层次
```css
.article-title {
    font-size: 2.5rem;
    font-weight: 700;
    line-height: 1.2;
    text-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.content-body h2 {
    color: #1976d2;
    font-weight: 600;
    font-size: 1.5rem;
    margin-top: 2.5rem;
    border-bottom: 2px solid #e3f2fd;
}
```

#### 代码样式（技术文章专用）
```css
.technical-content pre {
    background: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    padding: 1rem;
    border-left: 4px solid #2e7d32;
}

.technical-content code {
    background: #f1f3f4;
    padding: 0.2rem 0.4rem;
    border-radius: 4px;
    color: #d63384;
}
```

#### 数据展示（行业资讯专用）
```css
.industry-content .highlight-box {
    background: linear-gradient(135deg, #e3f2fd 0%, #f3e5f5 100%);
    border-radius: 8px;
    padding: 1.5rem;
    border-left: 4px solid #1976d2;
}

.industry-content table {
    border-collapse: collapse;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
```

### 3. 交互效果

#### 图片悬停效果
```css
.featured-image:hover {
    transform: scale(1.02);
    box-shadow: 0 12px 30px rgba(0,0,0,0.15) !important;
}
```

#### 侧边栏信息卡片
```css
.info-item:hover {
    background-color: #f8f9fa;
    border-radius: 6px;
    transform: translateX(5px);
}
```

## 📱 响应式特性

### 1. 断点设计
- **大屏幕（≥1200px）**：完整布局，侧边栏固定
- **中屏幕（992px-1199px）**：紧凑布局
- **小屏幕（768px-991px）**：上下布局，侧边栏移到底部
- **手机（<768px）**：单栏布局，优化触摸操作

### 2. 移动端优化
```css
@media (max-width: 768px) {
    .article-title {
        font-size: 1.8rem !important;
    }
    
    .content-body {
        font-size: 15px;
        padding: 1.5rem !important;
    }
    
    .article-meta span {
        display: block;
        margin: 0.5rem 0;
    }
}
```

## 🚀 特色功能

### 1. 技术文章专有功能
- **自动目录生成**：基于标题自动生成文章目录
- **代码高亮**：支持多种编程语言语法高亮
- **技术要点展示**：突出显示关键技术点
- **难度标识**：入门/中级/高级难度标识

### 2. 行业资讯专有功能
- **数据可视化**：表格和图表的美观展示
- **市场数据**：关键市场指标的突出显示
- **引用格式**：专业的引用和数据来源标注
- **趋势分析**：趋势图表和预测数据展示

### 3. 通用功能
- **图片放大**：点击图片可放大查看
- **社交分享**：支持多平台分享
- **打印优化**：针对打印的样式优化
- **SEO优化**：完善的元数据和结构化数据

## 📊 性能优化

### 1. 图片优化
- 使用picsum.photos占位服务
- 支持WebP格式
- 懒加载技术
- 响应式图片

### 2. CSS优化
- 关键CSS内联
- 非关键CSS异步加载
- CSS压缩和合并
- 使用CSS变量

### 3. JavaScript优化
- 按需加载
- 代码分割
- 缓存策略
- 性能监控

---

**设计时间**: 2025年7月27日  
**设计状态**: ✅ 已完成  
**主模板**: layouts/news/single.html  
**技术文章示例**: content/news/2025-07-27-内窥镜图像处理算法优化技术.md  
**行业资讯示例**: content/news/2025-07-27-2025年工业内窥镜市场发展趋势分析.md
