export type ActivityStatus = '草稿' | '进行中' | '已结束'

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
}

export interface ActivityBatchDetail {
  batchId: string
  platform: string
  title: string
  createdAt: string
}