export type MagiAgent = {
  id: string
  name: string
  description: string
  image: string
  usageCount: number
  lastUsedAt: string
  tags: string[]
  entryUrl: string
  status: '运行中' | '停用' | '维护中'
}

export type MagiAgentCategory = {
  id: string
  name: string
  description: string
  agents: MagiAgent[]
}

