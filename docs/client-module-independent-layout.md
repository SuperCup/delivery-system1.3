# 客户管理模块独立布局架构

## 概述

客户管理模块采用完全独立的布局系统，与主系统导航相互隔离，避免后续修改时相互干扰。

## 架构设计

### 1. 布局层级结构

```
App.tsx (无布局包裹)
  └─ AppRoutes (路由配置)
      ├─ BasicLayout (主系统布局)
      │   ├─ Header (顶部导航栏)
      │   └─ Content
      │       └─ 主系统页面 (首页、魔盒、知识库等)
      │
      └─ ClientMainLayout (客户模块独立主布局) ⭐
          ├─ Header (客户模块独立顶部导航栏)
          └─ Content
              └─ ClientModuleLayout (客户模块侧边栏布局)
                  ├─ Sider (左侧菜单)
                  └─ Content
                      └─ 客户子页面 (总览、活动管理等)
```

### 2. 核心组件说明

#### BasicLayout (src/layouts/basic-layout.tsx)
- **作用**: 主系统的基础布局
- **包含**: 主系统顶部导航栏、用户信息、通知等
- **适用路由**: 
  - `/home` - 首页
  - `/magi-core` - 魔盒
  - `/knowledge-base` - 知识库
  - `/data-warehouse` - 数据仓库
  - `/tools-market` - 工具市场
  - `/permission-center` - 权限中心
  - `/clients` - 客户列表页
  - `/activity-management/*` - 活动管理相关页面

#### ClientMainLayout (src/layouts/client-main-layout.tsx) ⭐
- **作用**: 客户管理模块的独立主布局
- **包含**: 
  - 独立的顶部导航栏
  - "客户管理" 模块标题
  - 返回首页按钮
  - 用户信息、通知功能
- **适用路由**: `/clients/:clientId/*` (所有客户子路由)
- **特点**: 完全独立于主系统导航，具有独立的样式和功能

#### ClientModuleLayout (src/layouts/client-module-layout.tsx)
- **作用**: 客户模块的侧边栏布局（二级布局）
- **包含**: 
  - 客户切换器
  - 左侧菜单（总览、活动管理、数据交付等）
- **嵌套于**: ClientMainLayout 内部
- **特点**: 专注于客户模块内部的导航

### 3. 路由配置 (src/router/index.tsx)

```tsx
<Routes>
  {/* 主系统路由 - 使用 BasicLayout */}
  <Route element={<BasicLayout />}>
    <Route path="/home" element={<HomePage />} />
    <Route path="/clients" element={<ClientsPage />} />
    {/* 其他主系统页面 */}
  </Route>
  
  {/* 客户管理模块 - 使用独立的 ClientMainLayout */}
  <Route path="/clients/:clientId" element={<ClientMainLayout />}>
    <Route element={<ClientModuleLayout />}>
      <Route path="overview" element={<ClientDetailPage />} />
      <Route path="activities" element={<ActivityManagementPage />} />
      {/* 其他客户子页面 */}
    </Route>
  </Route>
</Routes>
```

## 优势

### 1. 完全隔离
- 客户模块的导航栏和主系统导航栏完全独立
- 修改客户模块不会影响主系统
- 修改主系统不会影响客户模块

### 2. 独立样式
- `client-main-layout.module.css` - 客户模块主布局样式
- `client-module-layout.module.css` - 客户模块侧边栏样式
- 样式完全独立，不会相互干扰

### 3. 灵活扩展
- 可以独立为客户模块添加功能
- 可以独立调整客户模块的 UI/UX
- 未来可以轻松迁移为独立应用

### 4. 清晰的职责划分
- **ClientMainLayout**: 负责客户模块的整体框架（顶部导航、返回首页）
- **ClientModuleLayout**: 负责客户模块的内部导航（侧边栏、客户切换）
- **页面组件**: 只关注具体业务逻辑

## 样式文件

### client-main-layout.module.css
```css
.layout          - 客户模块主布局容器
.header          - 顶部导航栏
.headerBar       - 导航栏内容区域
.brand           - Logo 区域
.moduleTitle     - 模块标题（"客户管理"）
.backHomeBtn     - 返回首页按钮
.userBox         - 用户信息区域
```

### client-module-layout.module.css
```css
.fullLayout      - 侧边栏完整布局
.sider           - 左侧边栏
.clientSwitcher  - 客户切换器区域
.menuContainer   - 菜单容器
.menu            - 菜单样式
```

## 使用场景

### 场景 1: 修改客户模块顶部导航
**文件**: `src/layouts/client-main-layout.tsx`

修改此文件不会影响主系统的任何页面。

### 场景 2: 修改客户模块侧边菜单
**文件**: `src/layouts/client-module-layout.tsx`

修改此文件只影响客户模块的侧边栏，不会影响顶部导航。

### 场景 3: 修改主系统导航
**文件**: `src/layouts/basic-layout.tsx`

修改此文件不会影响客户管理模块的任何内容。

### 场景 4: 添加新的客户子页面
1. 在 `src/pages/clients/client-module/` 下创建新页面
2. 在 `ClientModuleLayout` 的 `menuItems` 中添加菜单项
3. 在路由配置中添加对应路由

## 注意事项

### 1. 路由层级
客户模块使用两层嵌套路由:
- 第一层: `ClientMainLayout` (独立顶部导航)
- 第二层: `ClientModuleLayout` (侧边栏导航)

### 2. 页面导航
- 在客户模块内部导航: 使用 `navigate('/clients/:clientId/xxx')`
- 返回主系统: 使用 `navigate('/home')` 或其他主系统路由

### 3. 状态管理
- 客户模块和主系统的状态完全独立
- 共享数据通过 services 层统一管理

### 4. 样式作用域
- 所有样式使用 CSS Modules
- 客户模块样式和主系统样式相互隔离

## 迁移指南

如果未来需要将客户模块独立为单独的应用:

1. **复制文件**:
   - `src/layouts/client-main-layout.tsx`
   - `src/layouts/client-module-layout.tsx`
   - `src/pages/clients/`
   - `src/components/client-switcher/`
   - 相关 services 和 types

2. **修改路由**:
   - 将 `/clients/:clientId/*` 路由作为根路由
   - 移除对 `BasicLayout` 的依赖

3. **独立打包**:
   - 创建独立的 Webpack/Vite 配置
   - 配置独立的入口文件

## 总结

通过这种独立布局架构，客户管理模块和主系统完全解耦，实现了:
- ✅ 独立的顶部导航栏
- ✅ 独立的样式系统
- ✅ 独立的路由配置
- ✅ 清晰的职责划分
- ✅ 便于后续维护和扩展

后续对客户模块的任何修改都不会影响主系统，反之亦然。

