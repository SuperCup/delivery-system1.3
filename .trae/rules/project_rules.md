## 交付中台系统开发规范


## 开发指导原则

### 核心理念
- 只做前端代码开发，所有内容呈现均使用模拟数据。
- 仔细且严格地遵循用户的要求。
- 首先要逐步思考——用伪代码详细描述你要构建内容的计划。
- 确认计划后，再编写代码！
- 始终编写正确的、符合最佳实践的、遵循DRY原则（不要重复自己）的、无错误的、功能完备且能正常运行的代码，同时代码应符合下面“代码实现指南”中列出的规则。
- 相比于追求性能，更要专注于编写简洁易读的代码。
- 完整实现所有要求的功能。
- 不要留下待办事项、占位符或缺失的部分。
- 确保代码是完整的！要彻底检查并最终确定。
- 包含所有必需的导入，并确保关键组件的命名恰当。
- 简洁明了，尽量减少其他不必要的文字表述。
- 如果你认为可能不存在正确答案，要如实说明。
- 如果你不知道答案，直接说明，而不要猜测。
- 专注于业务流程的标准化和可视化
- 提供清晰的管理界面
- 确保系统的可扩展性和维护性
- 遵循现代Web开发最佳实践

### 技术栈要求

框架：React 18（推荐 Ant Design Pro） 

构建工具：Webpack 5

语言：TypeScript（必须，保证类型安全）

状态管理：

React：Redux Toolkit / Zustand

路由管理：React Router v6 

数据请求：Axios + 拦截器（统一处理错误 & 鉴权）

可视化：ECharts / AntV G2Plot / AntV S2

样式方案：

CSS Modules / Tailwind CSS / Less

禁止内联样式（除非动态计算）。

### 代码规范

遵循 Airbnb JavaScript/TypeScript 风格规范

使用 ESLint + Prettier + Husky 强制规范：

eslint:recommended

plugin:@typescript-eslint/recommended

prettier 统一格式化

Git 提交规范：Commitlint + Conventional Commits

feat: 新功能

fix: 修复问题

refactor: 代码重构

style: 格式调整

docs: 文档更新

chore: 工具/依赖变更

组件/函数：单一职责，最大 300 行代码，超出必须拆分。

API 调用必须有 错误处理 & 超时机制。

### 结构规范

UI 与逻辑分离：UI 组件只负责展示，业务逻辑在 hooks/services。

页面与组件分离：页面负责布局和调用组件，组件负责复用。

状态与数据分离：全局状态存储在 store，页面本地状态存储在组件内。

API 与视图分离：所有接口封装在 /services，不可直接在组件中写 Axios 请求。

### 代码分离规范

组件拆分原则：

可复用 → 放入 components

特定业务页面专用 → 放入 pages/xxx/components

按功能模块分离（业务维度）：

activity（活动）

report（报表）

auth（权限/登录）

dashboard（看板）

按层级分离（技术维度）：

api → 请求封装

services → 业务逻辑

hooks → 自定义逻辑

components → 公共 UI 组件（如按钮、输入框等）

pages → 页面模板（每个页面一个目录，包含 HTML、JS、CSS）

#### 数据分离说明（Mock 数据管理）
- 样例数据统一存放在独立文件中，禁止在 `js` 或 `tsx` 文件内直接内联数据。
- 推荐存放路径：`src/mock-data/`（按业务模块分目录），或 `public/mock/`（纯静态 JSON）。
- 数据文件使用纯 JSON 格式，命名采用 kebab-case，例如：`price-monitoring-products.json`、`dashboard-metrics.json`。
- 类型约束放在 `src/types/`，通过 TypeScript 接口/类型定义样例数据结构，保证类型安全。
- 组件/页面/hooks 不直接访问样例数据文件，统一通过 `services/` 层读取与封装；`services` 层负责：
  - 在开发态使用 `fetch('/mock/...')` 读取 JSON（或静态导入），
  - 将原始数据转换为强类型模型并处理异常/超时，
  - 返回标准化的数据给视图层，保持与真实 API 的调用体验一致（建议超时 3000ms）。
- 示例目录结构：

```
src/
  mock-data/
    tasks/
      price-monitoring/
        products.json
        platforms.json
        frequency-options.json
```

- 示例读取约定：
  - `services/tasks/price-monitoring-service.ts` 中的 `getPriceMonitoringProducts()` 仅负责解析并返回数据；
  - 视图层（组件/页面）只调用 `services` 提供的方法，不直接引入或操作 JSON 文件。


### 文件结构规范
src/
├── api/                  # 接口定义层（axios 封装 + API 方法）
│   └── activity.ts
│   └── report.ts
│
├── assets/               # 静态资源（图片、字体、样式）
│   └── images/
│   └── styles/
│
├── components/           # 公共组件（跨业务复用）
│   └── ChartCard/
│   └── DataTable/
│
├── hooks/                # 自定义 React Hooks / Vue Composables
│   └── useAuth.ts
│   └── useChartResize.ts
│
├── layouts/              # 页面整体布局（导航栏、侧边栏、页脚）
│   └── BasicLayout.tsx
│
├── pages/                # 页面级组件
│   └── dashboard/
│       ├── index.tsx
│       ├── components/   # 页面私有组件
│   └── activity/
│   └── report/
│   └── auth/
│
├── services/             # 业务逻辑层（对 API 封装，供页面调用）
│   └── activityService.ts
│   └── reportService.ts
│
├── store/                # 状态管理
│   └── index.ts
│   └── activitySlice.ts
│   └── reportSlice.ts
│
├── utils/                # 工具函数（格式化、时间处理、下载等）
│   └── date.ts
│   └── download.ts
│
├── App.tsx               # 应用入口
├── main.tsx              # 入口文件
└── router/               # 路由管理
    └── index.tsx

### 文件命名规范

统一使用 kebab-case（短横线） 命名文件：

页面文件：dashboard-page.tsx

组件文件：chart-card.tsx

服务文件：activity-service.ts

目录：全小写 + 短横线，如 user-profile

组件：PascalCase（大驼峰），如 ChartCard.tsx

Hooks：必须以 use 开头，如 useAuth.ts

样式文件：与组件同名，如 chart-card.module.less

### 分离原则

视图层与逻辑层分离：组件只做展示，逻辑放到 hooks/services。

通用与业务分离：通用组件放在 /components，业务组件放在 /pages。

API 与业务逻辑分离：API 在 /api，二次封装在 /services。

样式与组件分离：采用 CSS Modules/Tailwind，禁止全局污染。

路由与组件分离：路由配置集中管理在 /router。


### 样例数据参考

创造样例数据时，尽量使用中文如状态名称，使用以下品牌和平台相关的信息：

#### 品牌
- 康师傅
- 嘉士伯
- 统一
- 百威
- 雀巢
- 达能
- 伊利
- 联合利华

#### 平台
- 到店营销业务：微信、支付宝、抖音到店、美团到店、天猫校园
- 即时零售业务：美团、京东到家、饿了么


