# 活动管理模块重构文档

## 概述

将活动管理相关的所有文件从独立的 `activity-management` 目录移动到客户管理模块下，实现更好的模块化组织和管理。

## 重构日期

2025-11-12

## 重构原因

1. **模块归属清晰**: 活动管理功能本质上属于客户管理的一部分
2. **避免路径冗余**: 所有活动操作都需要 `clientId`，放在客户模块下更合理
3. **统一管理**: 便于后续维护和功能扩展
4. **清理冗余**: 删除弃用的文件，保持代码库整洁

## 文件迁移清单

### 从 `src/pages/activity-management/` 迁移到 `src/pages/clients/client-module/activities/`

| 旧文件路径 | 新文件路径 | 说明 |
|----------|----------|------|
| `activity-management-page.tsx` | `activity-list-page.tsx` | 活动列表页面（重命名以更明确） |
| `activity-management-page.module.css` | `activity-list-page.module.css` | 活动列表样式 |
| `activity-create-edit-page.tsx` | `activity-form-page.tsx` | 新建/编辑活动页面（重命名以更明确） |
| `activity-create-edit-page.module.css` | `activity-form-page.module.css` | 活动表单样式 |
| `data-source-management-page.tsx` | `data-source-page.tsx` | 数据源管理页面（简化命名） |
| `data-source-management-page.module.css` | `data-source-page.module.css` | 数据源管理样式 |

### 删除的弃用文件

以下文件未被任何地方引用，已删除：

- `src/pages/activity-management/activity-create-page.tsx`
- `src/pages/activity-management/activity-create-page.module.css`
- `src/pages/activity-management/activity-detail-page.tsx`
- `src/pages/activity-management/activity-detail-page.module.css`
- `src/pages/activity-management/components/system-dataset-selector.tsx`
- `src/pages/activity-management/components/system-dataset-selector.module.css`

### 删除的目录

- `src/pages/activity-management/` - 整个目录已删除

## 代码修改

### 1. 路由配置 (`src/router/index.tsx`)

**修改前:**
```typescript
import ActivityManagementPage from '../pages/activity-management/activity-management-page'
import ActivityCreateEditPage from '../pages/activity-management/activity-create-edit-page'
import DataSourceManagementPage from '../pages/activity-management/data-source-management-page'

// 路由配置
<Route path="/activity-management" element={<ActivityManagementPage />} />
<Route path="/activity-management/create" element={<ActivityCreateEditPage />} />
<Route path="/activity-management/edit/:id" element={<ActivityCreateEditPage />} />
<Route path="/activity-management/data-sources" element={<DataSourceManagementPage />} />
```

**修改后:**
```typescript
import ActivityListPage from '../pages/clients/client-module/activities/activity-list-page'
import ActivityFormPage from '../pages/clients/client-module/activities/activity-form-page'
import DataSourcePage from '../pages/clients/client-module/activities/data-source-page'

// 路由配置 - 在客户模块下
<Route path="/clients/:clientId" element={<ClientMainLayout />}>
  <Route element={<ClientModuleLayout />}>
    <Route path="activities" element={<ActivityListPage />} />
    <Route path="activities/create" element={<ActivityFormPage />} />
    <Route path="activities/edit/:id" element={<ActivityFormPage />} />
    <Route path="activities/data-sources" element={<DataSourcePage />} />
  </Route>
</Route>
```

### 2. 导入路径调整

所有文件中的相对导入路径都已更新：

**示例 - activity-list-page.tsx:**
```typescript
// 修改前 (在 activity-management/ 目录)
import type { ActivityItem } from '../../types/activity'
import type { BusinessType } from '../../types/client'
import { ClientActivityService } from '../../services/client-activity-service'

// 修改后 (在 clients/client-module/activities/ 目录)
import type { ActivityItem } from '../../../../types/activity'
import type { BusinessType } from '../../../../types/client'
import { ClientActivityService } from '../../../../services/client-activity-service'
```

### 3. 路由跳转调整

所有页面内的导航路径都已更新：

**activity-list-page.tsx:**
```typescript
// 修改前
navigate(`/activity-management/create?clientId=${clientId}&businessType=${activeType}`)
navigate(`/activity-management/edit/${record.id}?clientId=${clientId}`)
navigate(`/activity-management/data-sources?clientId=${clientId}&businessType=${type}`)

// 修改后
navigate(`/clients/${clientId}/activities/create?businessType=${activeType}`)
navigate(`/clients/${clientId}/activities/edit/${record.id}`)
navigate(`/clients/${clientId}/activities/data-sources?businessType=${type}`)
```

**activity-form-page.tsx:**
```typescript
// 修改前
navigate(`/activity-management?clientId=${clientId}`)

// 修改后
navigate(`/clients/${clientId}/activities`)
```

## 新目录结构

```
src/pages/clients/client-module/activities/
├── activity-list-page.tsx           # 活动列表页面
├── activity-list-page.module.css    # 活动列表样式
├── activity-form-page.tsx           # 新建/编辑活动页面
├── activity-form-page.module.css    # 活动表单样式
├── data-source-page.tsx             # 数据源管理页面
├── data-source-page.module.css      # 数据源管理样式
└── components/                      # 活动管理专用组件（预留）
```

## 路由结构

```
/clients/:clientId (ClientMainLayout - 客户模块独立布局)
  └── (ClientModuleLayout - 客户模块侧边栏布局)
      ├── /overview                          - 客户总览
      ├── /activities                        - 活动列表 ⭐
      ├── /activities/create                 - 新建活动 ⭐
      ├── /activities/edit/:id               - 编辑活动 ⭐
      ├── /activities/data-sources           - 数据源管理 ⭐
      ├── /data-delivery                     - 数据交付
      ├── /file-delivery                     - 文件交付
      ├── /data-assets                       - 数据资产
      ├── /settlement-assistant              - 结算助手
      └── /settings                          - 客户管理
```

## 功能验证

### 验证项

- [x] 活动列表页面正常加载
- [x] 新建活动功能正常
- [x] 编辑活动功能正常
- [x] 数据源管理页面正常
- [x] 所有导航跳转正确
- [x] 无 linter 错误
- [x] 无 TypeScript 类型错误
- [x] 路由参数正确传递 (clientId, businessType 等)

## 优势

### 1. 模块化更清晰
- 活动管理功能归属于客户管理模块
- 文件组织结构更合理
- 便于理解和维护

### 2. URL 更语义化

**修改前:**
```
/activity-management?clientId=C-001
/activity-management/create?clientId=C-001&businessType=到店营销
```

**修改后:**
```
/clients/C-001/activities
/clients/C-001/activities/create?businessType=到店营销
```

### 3. 代码复用性更好
- 活动管理相关功能集中在一个模块
- 便于共享组件和逻辑
- 减少跨模块依赖

### 4. 扩展性更强
- 可以轻松添加新的活动相关功能
- 组件目录预留，方便添加专用组件
- 遵循 React 最佳实践

## 影响范围

### 受影响的文件

1. **路由配置**: `src/router/index.tsx`
2. **活动列表页**: `src/pages/clients/client-module/activities/activity-list-page.tsx`
3. **活动表单页**: `src/pages/clients/client-module/activities/activity-form-page.tsx`
4. **数据源管理页**: `src/pages/clients/client-module/activities/data-source-page.tsx`

### 不受影响的部分

- 所有 services 层文件（无需修改）
- 所有 types 定义（无需修改）
- Mock 数据文件（无需修改）
- 其他客户模块页面（无需修改）

## 注意事项

### 1. 书签和外部链接
如果有保存的书签或外部链接指向旧的 `/activity-management` 路径，需要更新为新路径。

### 2. 浏览器历史记录
用户的浏览器历史记录中可能包含旧路径，这些链接将无法访问（会重定向到首页）。

### 3. API 文档
如果有相关的 API 文档或开发文档引用了旧路径，需要同步更新。

## 后续优化建议

### 1. 添加路由重定向
为了向后兼容，可以考虑添加从旧路径到新路径的重定向：

```typescript
<Route 
  path="/activity-management" 
  element={<Navigate to="/clients" replace />} 
/>
```

### 2. 组件抽取
可以将活动管理相关的公共组件抽取到 `activities/components/` 目录：
- BatchSelector - 批次选择器
- PlatformDataTabs - 平台数据切换
- ActivityFormFields - 活动表单字段

### 3. Hooks 抽取
可以创建专用的 hooks：
- `useActivityForm` - 活动表单逻辑
- `useBatchSelection` - 批次选择逻辑
- `useActivityList` - 活动列表逻辑

## 总结

此次重构将活动管理功能完全整合到客户管理模块中，实现了：

✅ **更清晰的模块归属**: 活动管理属于客户管理的一部分  
✅ **更语义化的 URL**: 从 `/activity-management` 改为 `/clients/:clientId/activities`  
✅ **更好的代码组织**: 相关功能集中在一个目录下  
✅ **删除了冗余代码**: 移除了未使用的弃用文件  
✅ **保持了功能完整**: 所有功能正常工作，无破坏性变更  

重构后的代码更易于维护和扩展，为后续开发打下了良好的基础。

