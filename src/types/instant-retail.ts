// 即时零售平台类型
export type InstantRetailPlatform = '美团闪购' | '淘宝闪购' | '京东到家' | '多点'

/** 活动性质：仅美团闪购区分平台/品牌活动，其余平台固定为品牌活动 */
export type InstantRetailActivityNature = '平台活动' | '品牌活动'

export function resolveInstantRetailActivityNature(
  platform: InstantRetailPlatform,
  explicit?: string,
): InstantRetailActivityNature {
  if (platform !== '美团闪购') return '品牌活动'
  if (explicit === '平台活动' || explicit === '品牌活动') return explicit
  return '品牌活动'
}

// 营销日历相关类型
export interface MarketingCalendarActivity {
  id: string
  platform: InstantRetailPlatform
  activityName: string
  activityType: '平台活动方案' | '已报名活动机制'
  startDate: string
  endDate: string
  status: '已报名' | '待报名' | '已结束'
  mechanismName?: string
  projectCode?: string
  description?: string
}

export interface MarketingCalendarMonth {
  month: string // YYYY-MM
  activities: MarketingCalendarActivity[]
}

// 方案管理相关类型
export type ActivitySchemeSource = '平台爬取' | '手动导入'

export interface ActivityScheme {
  id: string
  platform: InstantRetailPlatform
  activityName: string
  startDate: string
  endDate: string
  description?: string
  source: ActivitySchemeSource
  crawledAt?: string // 爬取时间（平台爬取方案）
  importedAt?: string // 导入时间（手动导入方案）
  importedBy?: string // 导入人（手动导入方案）
  status: '待发布' | '已发布' | '已过期'
  publishedAt?: string // 发布时间
  publishedBy?: string // 发布人
  mechanisms?: string[] // 支持的机制列表
}

export interface PlatformCrawledScheme {
  id: string
  platform: InstantRetailPlatform
  activityName: string
  startDate: string
  endDate: string
  description?: string
  crawledAt: string
  mechanisms: string[]
  url?: string // 方案来源URL
}

// 活动进度相关类型
export interface ActivityProgress {
  id: string
  platform: InstantRetailPlatform
  activityName: string
  month: string // YYYY-MM
  budget: number
  usedBudget: number
  progress: number // 0-100
  status: '未开始' | '进行中' | '已结束'
  startDate: string
  endDate: string
  activities: ActivityDetail[]
}

export interface ActivityDetail {
  id: string
  name: string
  mechanismName: string
  budget: number
  usedBudget: number
  orderCount: number
  status: '进行中' | '已结束'
  startDate: string
  endDate: string
}

// 活动分析相关类型
export interface ActivityAnalysis {
  id: string
  platform: InstantRetailPlatform
  month: string // YYYY-MM
  totalOrders: number
  totalAmount: number
  avgOrderAmount: number
  conversionRate: number
  metrics: ActivityAnalysisMetric[]
  orderData: OrderData[]
}

export interface ActivityAnalysisMetric {
  name: string
  value: number
  unit: string
  trend?: 'up' | 'down' | 'flat'
  trendValue?: string
}

export interface OrderData {
  orderId: string
  orderTime: string
  amount: number
  platform: InstantRetailPlatform
  activityName: string
  status: '已完成' | '已取消' | '退款中'
}

// 破价监测相关类型
export type PriceMonitoringSource = 'RPA自动采集' | '人工截图上传分析'
export type PriceMonitoringFrequency = '每日' | '每周' | '每两周' | '每月'

export interface PriceMonitoringTask {
  id: string
  name: string
  startDate: string
  endDate: string
  source: PriceMonitoringSource
  platforms: InstantRetailPlatform[]
  frequency: PriceMonitoringFrequency
  referencePrice: number
  notificationReceivers: string[] // 联系人ID列表
  status: '进行中' | '已暂停' | '已结束'
  createdAt: string
  createdBy: string
  lastCheckedAt?: string
  priceAlerts?: PriceAlert[]
}

export interface PriceAlert {
  id: string
  productName: string
  platform: InstantRetailPlatform
  referencePrice: number
  actualPrice: number
  alertTime: string
  status: '待处理' | '已处理' | '已忽略'
}

// 活动明细相关类型
export interface ActivityItem {
  id: string
  platform: InstantRetailPlatform
  activityName: string
  /** 活动性质（美团：平台活动/品牌活动；其他平台：品牌活动） */
  activityNature?: InstantRetailActivityNature
  schemeId?: string // 关联的方案ID
  schemeName?: string // 方案名称
  startDate: string
  endDate: string
  status: '进行中' | '已结束' | '已下架'
  budget?: number
  usedBudget?: number
  orderCount?: number
  totalAmount?: number
  mechanismName?: string
  projectCode?: string
  description?: string
  createdAt: string
  createdBy: string
  offlineAt?: string // 下架时间
  offlineBy?: string // 下架人
}

export interface ActivityDetailInfo extends ActivityItem {
  metrics: {
    totalOrders: number
    totalAmount: number
    avgOrderAmount: number
    conversionRate: number
  }
  orderData: OrderData[]
}

