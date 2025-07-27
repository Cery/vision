# 案例详情页模板设计说明

## 🎯 设计目标

创建一个专业、美观、响应式的案例详情页模板，重点突出：
1. 案例信息的清晰展示
2. 图文并茂的内容呈现
3. 专业的视觉效果
4. 优秀的用户体验

## 🎨 设计结构

### 1. 页面布局

#### 顶部标题区域
- **渐变背景**：蓝色渐变配合网格纹理
- **案例标题**：大字体显示，突出重点
- **案例摘要**：简要描述案例价值
- **分类标签**：彩色徽章显示分类信息
- **元数据**：发布时间和浏览次数

#### 主内容区域（8列）
- **案例图片画廊**：主图+副图的组合展示
- **案例内容主体**：详细的图文说明

#### 侧边栏区域（4列）
- **案例信息卡片**：关键信息的结构化展示
- **相关案例推荐**：智能推荐相关内容

### 2. 视觉设计特点

#### 色彩方案
- **主色调**：蓝色系（#1976d2, #1565c0, #0d47a1）
- **辅助色**：绿色、橙色、红色用于不同类型标签
- **中性色**：灰色系用于文字和背景

#### 图片展示
- **主封面图**：800x400尺寸，突出展示
- **副封面图**：400x300尺寸，补充说明
- **内容图片**：自适应尺寸，支持悬停效果
- **图片说明**：斜体小字，增加专业感

#### 交互效果
- **悬停动画**：图片缩放、阴影变化
- **渐变背景**：标题区域的视觉层次
- **卡片设计**：圆角、阴影、边框的现代风格

## 🔧 技术实现

### 1. HTML结构优化

#### 案例标题区域
```html
<div class="case-header bg-gradient-primary text-white py-5 mb-4 rounded">
    <div class="container">
        <div class="row align-items-center">
            <div class="col-lg-8">
                <h1 class="display-5 fw-bold mb-3">{{ .Title }}</h1>
                <p class="lead mb-3">{{ .Params.summary }}</p>
                <div class="case-badges">
                    <!-- 分类标签 -->
                </div>
            </div>
            <div class="col-lg-4 text-end">
                <!-- 元数据信息 -->
            </div>
        </div>
    </div>
</div>
```

#### 图片画廊
```html
<div class="case-gallery mb-5">
    <div class="row g-3">
        <!-- 主封面图 -->
        <div class="col-12">
            <div class="main-cover-image">
                <img src="..." class="img-fluid rounded shadow">
                <div class="image-caption">图片说明</div>
            </div>
        </div>
        <!-- 副封面图 -->
        <div class="col-md-6">
            <div class="sub-cover-image">
                <img src="..." class="img-fluid rounded shadow">
                <div class="image-caption">图片说明</div>
            </div>
        </div>
    </div>
</div>
```

#### 侧边栏信息卡片
```html
<div class="case-info-card bg-white rounded shadow-sm mb-4">
    <div class="card-header bg-primary text-white py-3">
        <h5 class="mb-0">案例信息</h5>
    </div>
    <div class="card-body p-4">
        <div class="info-item mb-3 pb-3 border-bottom">
            <div class="info-label text-muted mb-1">
                <i class="fas fa-building me-2"></i>客户
            </div>
            <div class="info-value fw-semibold">
                {{ .Params.client }}
            </div>
        </div>
        <!-- 更多信息项 -->
    </div>
</div>
```

### 2. CSS样式特点

#### 响应式设计
```css
/* 大屏幕 */
@media (max-width: 1200px) {
    .container-fluid {
        padding-left: 1rem;
        padding-right: 1rem;
    }
}

/* 平板 */
@media (max-width: 992px) {
    .sidebar {
        position: static;
        margin-top: 2rem;
    }
}

/* 手机 */
@media (max-width: 768px) {
    .case-header .display-5 {
        font-size: 1.8rem;
    }
    .content-body {
        font-size: 15px;
        padding: 1.5rem !important;
    }
}
```

#### 图片效果
```css
.main-cover-image img:hover,
.sub-cover-image img:hover {
    transform: scale(1.02);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
}

.content-body img {
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
}
```

### 3. 内容结构设计

#### Markdown内容组织
```markdown
## 项目背景
文字描述 + 配图

## 检测挑战
### 技术难点
### 环境要求

## 解决方案
### 设备配置
### 检测流程

## 检测结果
### 发现的问题
### 检测数据

## 解决效果
### 直接效果
### 长期价值

## 客户反馈
引用格式的客户评价

## 技术总结
### 关键成功因素
### 技术创新点

## 应用推广
推广应用的领域
```

## 📱 响应式特性

### 1. 布局适配
- **大屏幕（≥1200px）**：完整的两栏布局
- **中屏幕（992px-1199px）**：紧凑的两栏布局
- **小屏幕（768px-991px）**：上下布局，侧边栏移到底部
- **手机（<768px）**：单栏布局，优化触摸操作

### 2. 内容适配
- **图片**：自适应尺寸，保持比例
- **文字**：响应式字体大小
- **间距**：根据屏幕调整边距和内边距
- **交互**：触摸友好的按钮和链接

### 3. 性能优化
- **图片懒加载**：使用picsum.photos占位服务
- **CSS优化**：合理的选择器和属性
- **JavaScript最小化**：只保留必要的交互功能

## 🎯 内容指导

### 1. 图片使用建议
- **主封面图**：展示检测现场或设备
- **副封面图**：补充说明检测过程
- **内容图片**：详细的检测结果和数据
- **图片说明**：简洁明了的描述文字

### 2. 文字内容结构
- **标题层次**：清晰的H2、H3结构
- **段落组织**：逻辑清晰的内容分组
- **数据展示**：表格和列表的合理使用
- **引用格式**：客户反馈的专业展示

### 3. 信息架构
- **案例背景**：问题描述和需求分析
- **解决方案**：技术方案和实施过程
- **检测结果**：具体发现和数据分析
- **价值体现**：效果评估和客户反馈

## 🚀 使用指南

### 1. 创建新案例
1. 复制模板文件结构
2. 修改front matter信息
3. 按照内容结构编写正文
4. 添加相应的图片和说明

### 2. 图片处理
- 使用picsum.photos作为占位图片
- 根据内容需要调整图片尺寸
- 添加有意义的图片说明文字

### 3. 样式定制
- 保持现有的CSS类名结构
- 可以调整颜色和尺寸参数
- 确保响应式效果正常

---

**设计时间**: 2025年7月27日  
**设计状态**: ✅ 已完成  
**模板文件**: layouts/cases/single.html  
**示例文件**: content/cases/2025-07-27-汽车发动机缸体检测案例.md
