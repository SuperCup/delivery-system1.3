export type DataSourceType = 'system' | 'manual'

export interface ActivityCreatePayload {
  name: string
  status: '草稿' | '进行中' | '已结束'
  startTime: string
  endTime: string
  platforms: string[]
  dataScopes: DataScope[]
}

export interface DataScope {
  platform: string
  sourceType: DataSourceType
  datasetId?: string
  fileName?: string
  fileSize?: number
  systemSelection?: {
    projectIds: string[]
    batchIds: string[]
  }
}