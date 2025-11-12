# 面包屑导航添加文档

## 概述

为客户管理模块的二级页面添加面包屑导航，帮助用户清楚地了解当前所在的页面层级，提升用户体验。

## 添加日期

2025-11-12

## 实施范围

### 已添加面包屑的页面

| 页面 | 路由 | 面包屑层级 |
|------|------|-----------|
| 新建活动 | `/clients/:clientId/activities/create` | 首页 > 活动管理 > 新建活动 |
| 编辑活动 | `/clients/:clientId/activities/edit/:id` | 首页 > 活动管理 > 编辑活动 |
| 源数据管理 | `/clients/:clientId/activities/data-sources` | 首页 > 活动管理 > 源数据管理 |

### 一级页面（无需面包屑）

以下页面为一级页面，直接在客户模块侧边栏导航中，不需要额外的面包屑：

- 客户总览 (`/clients/:clientId/overview`)
- 活动管理列表 (`/clients/:clientId/activities`)
- 数据交付 (`/clients/:clientId/data-delivery`)
- 文件交付 (`/clients/:clientId/file-delivery`)
- 数据资产 (`/clients/:clientId/data-assets`)
- 结算助手 (`/clients/:clientId/settlement-assistant`)
- 客户管理 (`/clients/:clientId/settings`)

## 技术实现

### 1. 使用的组件

使用 Ant Design 的 `Breadcrumb` 组件：

```typescript
import { Breadcrumb } from 'antd'
import { HomeOutlined } from '@ant-design/icons'
```

### 2. 面包屑结构

每个面包屑包含三个层级：

1. **首页图标** - 链接到客户总览页
2. **活动管理** - 链接到活动列表页
3. **当前页面** - 不可点击，仅作为展示

### 3. 代码示例

**activity-form-page.tsx (新建/编辑活动):**

```typescript
<Breadcrumb
  className={styles.breadcrumb}
  items={[
    {
      href: `/clients/${clientId}/overview`,
      title: <HomeOutlined />,
    },
    {
      href: `/clients/${clientId}/activities`,
      title: '活动管理',
    },
    {
      title: isEdit ? '编辑活动' : '新建活动',
    },
  ]}
/>
```

**data-source-page.tsx (源数据管理):**

```typescript
<Breadcrumb
  className={styles.breadcrumb}
  items={[
    {
      href: `/clients/${clientId}/overview`,
      title: <HomeOutlined />,
    },
    {
      href: `/clients/${clientId}/activities`,
      title: '活动管理',
    },
    {
      title: '源数据管理',
    },
  ]}
/>
```

### 4. 样式配置

在对应的 `.module.css` 文件中添加：

```css
.breadcrumb {
  padding: 0 4px;
  margin-bottom: 4px;
}
```

## 文件修改清单

### 修改的文件

1. **src/pages/clients/client-module/activities/activity-form-page.tsx**
   - 添加 `Breadcrumb` 组件导入
   - 添加 `HomeOutlined` 图标导入
   - 在页面顶部添加面包屑导航

2. **src/pages/clients/client-module/activities/activity-form-page.module.css**
   - 添加 `.breadcrumb` 样式类

3. **src/pages/clients/client-module/activities/data-source-page.tsx**
   - 添加 `Breadcrumb` 组件导入
   - 添加 `HomeOutlined` 图标导入
   - 在页面顶部添加面包屑导航

4. **src/pages/clients/client-module/activities/data-source-page.module.css**
   - 添加 `.breadcrumb` 样式类

## 设计特点

### 1. 视觉一致性

- 所有面包屑使用统一的样式和布局
- 首页图标使用 `HomeOutlined`，保持简洁
- 面包屑位于页面顶部，标题上方

### 2. 交互设计

- 前面的层级可点击，方便用户快速返回上级页面
- 当前页面不可点击，使用普通文本展示
- 悬停时有视觉反馈（Ant Design 默认样式）

### 3. 信息层次

```
首页 (图标) > 活动管理 > 当前页面
    ↓            ↓           ↓
  可点击       可点击      不可点击
```

### 4. 响应式适配

- 面包屑在小屏幕上自动换行
- 使用相对单位和 Ant Design 的响应式设计

## 用户体验提升

### 改进前

- 用户不清楚当前所在页面的层级
- 只能通过浏览器后退按钮或侧边栏返回
- 缺乏清晰的导航上下文

### 改进后

- ✅ 清楚显示页面层级关系
- ✅ 可以快速跳转到上级页面
- ✅ 提供清晰的导航路径
- ✅ 符合用户的心智模型

## 扩展性考虑

### 1. 统一的面包屑组件（可选优化）

未来可以创建一个通用的面包屑组件：

```typescript
// src/components/page-breadcrumb/page-breadcrumb.tsx
type BreadcrumbItem = {
  href?: string
  title: React.ReactNode
}

type PageBreadcrumbProps = {
  items: BreadcrumbItem[]
  clientId?: string
}

export const PageBreadcrumb = ({ items, clientId }: PageBreadcrumbProps) => {
  // 统一的面包屑逻辑
}
```

### 2. 其他模块的面包屑

如果其他模块（如数据交付、文件交付等）也有二级页面，可以使用相同的模式添加面包屑：

```typescript
// 数据交付详情页示例
<Breadcrumb
  items={[
    {
      href: `/clients/${clientId}/overview`,
      title: <HomeOutlined />,
    },
    {
      href: `/clients/${clientId}/data-delivery`,
      title: '数据交付',
    },
    {
      title: '交付详情',
    },
  ]}
/>
```

### 3. 动态面包屑

对于需要显示动态内容的面包屑（如活动名称），可以这样实现：

```typescript
<Breadcrumb
  items={[
    { href: `/clients/${clientId}/overview`, title: <HomeOutlined /> },
    { href: `/clients/${clientId}/activities`, title: '活动管理' },
    { title: activityName || '加载中...' }, // 动态内容
  ]}
/>
```

## 最佳实践

### 1. 面包屑层级建议

- **2-4 级最佳**: 太深的层级会让用户困惑
- **当前页面不可点击**: 避免无意义的自我跳转
- **使用图标表示首页**: 节省空间，视觉清晰

### 2. 链接准确性

- 确保每个面包屑链接都指向正确的页面
- 使用动态 `clientId` 保证链接的准确性
- 测试所有面包屑链接的可用性

### 3. 样式一致性

- 所有页面使用统一的面包屑样式
- 保持与整体设计语言的一致性
- 遵循 Ant Design 的设计规范

### 4. 性能考虑

- 面包屑是轻量级组件，对性能影响极小
- 无需额外的数据加载
- 不影响页面渲染速度

## 验证清单

- [x] 新建活动页面显示正确的面包屑
- [x] 编辑活动页面显示正确的面包屑
- [x] 源数据管理页面显示正确的面包屑
- [x] 首页图标链接正确
- [x] 活动管理链接正确
- [x] 当前页面文本显示正确
- [x] 样式与整体设计一致
- [x] 无 TypeScript 类型错误
- [x] 无 linter 错误
- [x] 移动端显示正常

## 后续优化建议

### 1. 创建通用组件

将面包屑逻辑抽取为可复用组件：

```typescript
// src/components/client-breadcrumb/client-breadcrumb.tsx
export const ClientBreadcrumb = ({ 
  clientId, 
  items 
}: ClientBreadcrumbProps) => {
  // 通用逻辑
}
```

### 2. 增加面包屑菜单

对于有子页面的层级，可以添加下拉菜单：

```typescript
{
  title: '活动管理',
  menu: {
    items: [
      { key: 'list', label: '活动列表' },
      { key: 'create', label: '新建活动' },
      { key: 'data', label: '源数据管理' },
    ]
  }
}
```

### 3. 添加更多层级

如果未来有三级、四级页面，继续使用相同的模式：

```typescript
items={[
  { href: '/overview', title: <HomeOutlined /> },
  { href: '/activities', title: '活动管理' },
  { href: '/activities/123', title: '活动详情' },
  { title: '数据分析' }, // 第四级
]}
```

## 总结

通过添加面包屑导航，客户管理模块的二级页面现在具有：

✅ **清晰的层级结构**: 用户能立即了解当前位置  
✅ **便捷的导航**: 快速返回上级页面  
✅ **统一的体验**: 所有二级页面遵循相同的导航模式  
✅ **良好的可扩展性**: 易于为其他模块添加面包屑  

这一改进显著提升了用户体验，使导航更加直观和高效。

