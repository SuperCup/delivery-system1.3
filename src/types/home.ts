export type BusinessType = '到店营销' | '即时零售' | '物码营销'

export type ClientSummary = {
  id: string
  name: string
  contactCount: number
  business: { type: BusinessType; activityCount: number }[]
}

export type TrendType = 'up' | 'down' | 'normal'

export type StatCard = {
  id: string
  title: string
  value: number
  unit: string
  trend: string
  trendType: TrendType
  icon: string
}

export type QuickAction = {
  id: string
  title: string
  description: string
  icon: string
  link: string
  color: string
}

export type DashboardOverview = {
  stats: StatCard[]
  quickActions: QuickAction[]
}

export type MessageType = 'info' | 'success' | 'warning' | 'error'
export type MessagePriority = 'low' | 'normal' | 'high'

export type Message = {
  id: string
  type: MessageType
  title: string
  content: string
  time: string
  isRead: boolean
  priority: MessagePriority
}

export type TodoStatus = 'pending' | 'in-progress' | 'completed'
export type TodoPriority = 'low' | 'medium' | 'high'

export type Todo = {
  id: string
  title: string
  status: TodoStatus
  priority: TodoPriority
  dueDate: string
  category: string
}

export type HomeMessages = {
  messages: Message[]
  todos: Todo[]
}

export type ReportCard = {
  id: string
  name: string
  brands: string[] | '全部适用' // 所属品牌（可多个，或全部适用）
  clients: string[] | '全部适用' // 所属客户（可多个，或全部适用）
  product: BusinessType | '全部适用' // 产品（到店营销/即时零售/物码营销，或全部适用）
  validity: '永久' | string // 链接有效期，可以是"永久"或具体日期
  source: string // 链接来源，如"QBI"
  dataSource: string // 链接依赖数据源，如"数仓"
  createdAt: string // 创建时间
  createdBy: string // 创建人
  visibleTo: string[] // 可见人ID列表
  link?: string // 链接地址（可选，用于跳转）
  sortOrder?: number // 排序顺序
}

export type BusinessMetric = {
  id: string
  label: string
  value: number
  unit: string
  trend: 'up' | 'down' | 'flat'
  trendValue: string
}

export type BusinessHighlight = {
  id: string
  title: string
  description: string
}

export type BusinessOverviewCard = {
  id: BusinessType
  name: string
  summary: string
  owner: string
  contact: string
  metrics: BusinessMetric[]
  highlights: BusinessHighlight[]
  quickLink: string
}

export type HomeReports = {
  reports: ReportCard[]
}

export type HomeBusinessOverview = {
  businesses: BusinessOverviewCard[]
}