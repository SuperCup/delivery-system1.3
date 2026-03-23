export type DataWarehouseBusinessType = '到店营销' | '即时零售' | '物码营销' | '通用'

/** 获取方式 */
export type AcquisitionMethod = '平台爬取' | '平台开放接口' | '共享数仓'

/** 更新频率 */
export type UpdateFrequency = '每日' | '实时'

/** 下载条件类型 */
export type DownloadConditionType =
  | 'client'       // 客户
  | 'dateRange'    // 日期范围
  | 'activity'     // 活动
  | 'billType'     // 账单类型：日/月
  | 'pageModule'   // 目标页面与模块（RTB）
  | 'merchant'     // 商户

export interface DownloadCondition {
  id: string
  label: string
  type: DownloadConditionType
  required: boolean
  options?: { label: string; value: string }[]
}

export interface DataField {
  id: string
  name: string
  description: string
}

/** 单一数据类型（如：活动详情、营销账单） */
export interface DataType {
  id: string
  platformId: string
  name: string
  description: string
  fields: DataField[]
  downloadConditions: DownloadCondition[]
  recordCount: number
  lastUpdatedAt: string
}

/** 数据来源平台（如：支付宝、微信、美团闪购） */
export interface DataSourcePlatform {
  id: string
  name: string
  businessType: DataWarehouseBusinessType
  acquisitionMethod: AcquisitionMethod
  updateFrequency: UpdateFrequency
  updateFrequencyDetail: string
  dataTypes: DataType[]
}

/** 兼容旧 UI：展平后的“数据类别”卡片，带平台信息 */
export interface DataCategory {
  id: string
  platformId: string
  platformName: string
  name: string
  description: string
  businessType: DataWarehouseBusinessType
  acquisitionMethod: AcquisitionMethod
  updateFrequency: UpdateFrequency
  updateFrequencyDetail: string
  supportImport: boolean
  importTemplateUrl?: string
  icon: string
  tags: string[]
  fields: DataField[]
  downloadConditions: DownloadCondition[]
  sampleClients: string[]
  recordCount: number
  lastUpdatedAt: string
}

export interface DataRecord {
  id: string
  dataTypeId: string
  platformId: string
  clientId: string
  clientName: string
  businessType: DataWarehouseBusinessType
  period: string
  [key: string]: string | number
}

export interface ImportRecord {
  id: string
  categoryId: string
  categoryName: string
  clientId: string
  clientName: string
  fileName: string
  importedBy: string
  importedAt: string
  status: '成功' | '失败' | '处理中'
  recordCount: number
  remark?: string
}

export interface DownloadRecord {
  id: string
  categoryId: string
  categoryName: string
  platformName: string
  clientId: string
  clientName: string
  period: string
  conditions?: Record<string, string>
  downloadedBy: string
  downloadedAt: string
  fileSize: string
}

// ---- 采集任务管理 Types ----

export type CollectionTaskStatus = '草稿' | '待复核' | '执行中' | '已完成' | '已暂停' | '已取消'

export type CollectionConditionInputType = 'select' | 'dateRange' | 'text'

export interface CollectionConditionDef {
  id: string
  label: string
  type: CollectionConditionInputType
  required: boolean
  options?: { label: string; value: string }[]
}

export interface CollectionPlatformModule {
  id: string
  name: string
  conditions: CollectionConditionDef[]
}

export interface CollectionPlatformPage {
  id: string
  name: string
  modules: CollectionPlatformModule[]
}

export interface CollectionPlatformConfig {
  platformId: string
  platformName: string
  pages: CollectionPlatformPage[]
}

export interface CollectionTaskModuleEntry {
  pageId: string
  pageName: string
  moduleId: string
  moduleName: string
  conditionGroups: Record<string, string>[]
}

export interface CollectionTask {
  id: string
  name: string
  platformId: string
  platformName: string
  clientId: string
  clientName: string
  period: [string, string]
  modules: CollectionTaskModuleEntry[]
  status: CollectionTaskStatus
  createdBy: string
  createdAt: string
  reviewedBy?: string
  reviewedAt?: string
  remark?: string
}
