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
  description: string
  owner: string
  updatedAt: string
  link: string
  category: string
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