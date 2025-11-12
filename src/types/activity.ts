import type { BusinessType } from './home'
import type { DataSourceType } from './activity-create'

export type ActivityStatus = '草稿' | '进行中' | '已结束'

export interface ActivityDataScope {
  platform: string
  sourceType: DataSourceType
  systemSelection?: string[]
  systemSelectionDetail?: {
    projectIds: string[]
    batchIds: string[]
  }
  uploadFile?: {
    name: string
    size: number
  }
}

export interface ActivityBatchSummary {
  platform: string
  count: number
}

export interface ActivityItem {
  id: string
  clientId: string
  name: string
  status: ActivityStatus
  startTime: string
  endTime: string
  platforms: string[]
  batchSummary: ActivityBatchSummary[]
  createdBy: string
  createdAt: string
  businessType?: BusinessType
  dataScopes?: ActivityDataScope[]
  visibleContacts?: string[]
  description?: string
  lastUpdatedAt?: string
}

export interface ActivityBatchDetail {
  batchId: string
  platform: string
  title: string
  createdAt: string
}