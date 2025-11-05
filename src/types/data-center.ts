export type DataSource = {
  id: string
  name: string
  category: '到店营销' | '即时零售' | '物码营销' | '其他'
  standardFields: number
  updateFrequency: string
  source: string
}

export type SystemDatasetBatch = {
  id: string
  code: string
  name: string
  projectId: string
}

export type SystemDatasetProject = {
  id: string
  name: string
  batches: SystemDatasetBatch[]
}