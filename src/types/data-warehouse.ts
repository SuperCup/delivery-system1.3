export type DataWarehouseBusinessType = '到店营销' | '即时零售' | '物码营销'

export type DataWarehouseField = {
  id: string
  name: string
  alias: string
  dataType: string
  description: string
  updateFrequency: string
  sourceSystem: string
}

export type DataWarehouseUseCase = {
  id: string
  title: string
  businessUnit: string
  description: string
  owner: string
  lastUpdatedAt: string
}

export type DataWarehouseDataset = {
  id: string
  platform: string
  business: DataWarehouseBusinessType
  name: string
  releaseStatus: '试运行' | '已上线' | '规划中'
  fields: DataWarehouseField[]
  useCases: DataWarehouseUseCase[]
}

