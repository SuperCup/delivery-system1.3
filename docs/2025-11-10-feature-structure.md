# 2025-11-10 功能结构调整说明

## 背景
- 新版交付中台聚焦六大主菜单：`首页`、`魔盒 MagiCore`、`知识库`、`数据仓库`、`工具市场`、`权限中心`。
- 全量使用模拟数据驱动页面展示，保持与真实 API 一致的调用方式。
- 本次调整覆盖导航结构、页面框架、服务层封装以及样例数据整理。

## 导航与路由
- 顶部导航更新为六大主菜单，统一在 `BasicLayout` 中维护。
- `src/router/index.tsx` 增加对应页面路由，默认重定向至 `home`。
- 去除旧业务专区、基础服务等下拉结构，所有一级菜单直接进入对应页面。

## 页面设计概览

### 首页 `src/pages/home/home-page.tsx`
- 板块：欢迎信息、我服务的客户、消息/公告、我的报表、三大业务概览。
- 使用服务层获取 `clients-summary.json`、`messages.json`、`reports.json`、`business-overview.json`。
- 三大业务展示 KPI/趋势、亮点摘要、快捷跳转链接。

### 魔盒 MagiCore `src/pages/magi-core/magi-core-page.tsx`
- 卡片式智能体列表，支持关键词、状态、标签筛选。
- 显示使用次数、状态、标签、最近使用时间、使用入口。
- 数据来源：`public/mock/magi-core/agents.json`。

### 知识库 `src/pages/knowledge-base/knowledge-base-page.tsx`
- 维度切换：公开 / 公司内部 / 业务组 / 个人 / 品牌 / 类型。
- 左侧分类筛选 + 类型筛选 + 搜索，右侧知识卡片列表。
- 数据文件按维度拆分保存在 `public/mock/knowledge-base/`。

### 数据仓库 `src/pages/data-warehouse/data-warehouse-page.tsx`
- 平台 & 业务筛选，折叠面板展示字段表与应用案例。
- 字段支持类型、频率、来源说明；案例记录业务场景、负责人、更新时间。
- 数据来源：`public/mock/data-warehouse/datasets.json`。

### 工具市场 `src/pages/tools-market/tools-market-page.tsx`
- 支持按类别、适用平台、关键词筛选。
- 卡片展示状态、平台、适用人群、版本号；提供预览抽屉展示介绍及迭代说明。
- 数据来源：`public/mock/tools-market/tools.json`。

### 权限中心 `src/pages/permission-center/permission-center-page.tsx`
- 统计卡片：角色数量、成员总数、最近更新、异常成员。
- 权限矩阵按模块 x 角色展示操作能力。
- 成员列表支持搜索与角色筛选。
- 数据来源：`public/mock/permission-center/{roles,matrix,members}.json`。

## 服务层与类型定义
- 新增服务：`magi-core-service.ts`、`knowledge-base-service.ts`、`data-warehouse-service.ts`、`permission-center-service.ts`。
- `HomeService` 增加报表、业务概览方法；`tools-market-service` 扩展字段映射。
- 新增类型定义：`magi-core.ts`、`knowledge.ts`、`data-warehouse.ts`、`permission.ts`；更新 `tools.ts`、`home.ts`。

## 样例数据整理
- 所有数据位于 `public/mock/` 下按模块分类，命名使用 kebab-case。
- 重点数据文件：
  - `home/reports.json`
  - `home/business-overview.json`
  - `magi-core/agents.json`
  - `knowledge-base/*.json`
  - `data-warehouse/datasets.json`
  - `tools-market/tools.json`
  - `permission-center/{roles,matrix,members}.json`

## 后续建议
- 结合 Mock 接口包装层模拟鉴权、错误处理场景。
- 与设计团队确认样式细节，补充响应式适配。
- 按需增加单元测试或故事书示例，确保组件复用性。

