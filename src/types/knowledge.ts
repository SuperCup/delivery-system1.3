export type KnowledgeDimension =
  | 'public'
  | 'internal'
  | 'business-unit'
  | 'personal'
  | 'brand'
  | 'type'

export type KnowledgeType = '技术' | '业务' | '运营' | '市场' | '品牌资产' | '政策'

export type KnowledgeCategory = {
  id: string
  name: string
  description: string
  type: KnowledgeType | null
  scope: KnowledgeDimension
}

export type KnowledgeItem = {
  id: string
  title: string
  summary: string
  tags: string[]
  type: KnowledgeType
  dimension: KnowledgeDimension
  categoryId: string
  owner: string
  updatedAt: string
  views: number
  attachments: { name: string; url: string }[]
}

export type KnowledgeDataset = {
  dimension: KnowledgeDimension
  categories: KnowledgeCategory[]
  items: KnowledgeItem[]
}

