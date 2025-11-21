# 结算管理追踪系统布局规范

## 1. 全局规范

### 1.1 基础设置
- 页面最小宽度：1920px
- 背景颜色：#F9FAFB
- 主要字体：系统默认字体
- 主色调：#005EFF（蓝色）、#FF673C（橙色，用于品牌标识）

### 1.2 布局结构
- 顶部导航栏：固定高度64px或80px
- 左侧菜单：固定宽度（主菜单170px-254px）
- 客户侧边栏（如有）：固定宽度304px
- 主内容区：自适应宽度

## 2. 组件规范

### 2.1 导航栏
```html
<header class="nav-header fixed top-0 left-0 right-0 z-50">
    <div class="flex items-center justify-between px-6 h-full">
        <div class="flex items-center">
            <h1 class="nav-logo">业务中台</h1>
        </div>
        <!-- 用户信息 -->
    </div>
</header>
```

### 2.2 左侧菜单
```html
<nav class="nav-menu fixed">
    <div class="flex flex-col">
        <a href="#" class="menu-item active">
            <i class="fas fa-calculator"></i>
            <span>结算助手</span>
        </a>
        <!-- 其他菜单项 -->
    </div>
</nav>
```

### 2.3 内容卡片
```html
<div class="bg-white rounded-lg shadow-lg p-6">
    <!-- 卡片内容 -->
</div>
```

## 3. 颜色规范

### 3.1 主要颜色
- 主色：#005EFF
- 品牌色：#FF673C
- 背景色：#F9FAFB
- 卡片背景：#FFFFFF

### 3.2 状态颜色
- 成功：#10B981
- 警告：#F59E0B
- 错误：#EF4444
- 信息：#3B82F6

### 3.3 文本颜色
- 主要文本：#374151
- 次要文本：#6B7280
- 淡色文本：#9CA3AF

## 4. 排版规范

### 4.1 标题
- 页面标题：text-lg font-bold
- 卡片标题：text-lg font-semibold
- 分组标题：text-sm font-medium text-gray-500

### 4.2 正文
- 主要文本：text-base
- 次要文本：text-sm
- 小型文本：text-xs

## 5. 表单元素

### 5.1 按钮
```html
<!-- 主要按钮 -->
<button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
    按钮文本
</button>

<!-- 次要按钮 -->
<button class="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
    按钮文本
</button>
```

### 5.2 输入框
```html
<div class="relative">
    <input type="text" 
           placeholder="请输入内容" 
           class="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
    <i class="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
</div>
```

## 6. 响应式设计

- 项目主要针对桌面端设计，最小宽度为1920px
- 对于特定组件，可使用以下断点进行响应式调整：
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px

## 7. 图标使用

- 使用Font Awesome 5图标库
- 图标与文本搭配使用时，添加适当的间距（如mr-2、mr-3）

## 8. 阴影效果

- 卡片阴影：shadow-lg
- 下拉菜单阴影：shadow-md
- 按钮悬浮阴影：hover:shadow

## 9. 动画与过渡

- 按钮悬浮：transition-colors duration-200
- 卡片悬浮：transition-all duration-300
- 菜单项切换：transition-all duration-200

## 10. 代码规范

### 10.1 HTML规范
- 使用语义化标签（header, nav, main, section, footer等）
- 保持代码缩进一致（推荐4个空格）
- 添加适当的注释，标记主要区块

### 10.2 CSS规范
- 优先使用Tailwind CSS类
- 自定义样式按组件或功能分组
- 添加适当的注释，说明样式用途

### 10.3 JavaScript规范
- 函数按功能模块组织
- 使用驼峰命名法
- 添加适当的注释，说明函数用途和参数

## 11. 最佳实践

### 11.1 页面结构
- 页面顶部：导航栏
- 页面左侧：主菜单和子菜单
- 页面主体：内容区域

### 11.2 交互设计
- 提供明确的视觉反馈（如按钮悬浮效果）
- 保持交互一致性（如相同功能使用相同样式的按钮）
- 提供适当的加载状态和错误提示

### 11.3 性能优化
- 减少不必要的DOM操作
- 优化图片和资源加载
- 使用适当的缓存策略