import type { BusinessType } from './client'

/**
 * 专属看板
 */
export interface CustomReport {
  id: string
  name: string // 看板名称
  validity: string // 有效期（永久或时间范围）
  description: string // 描述
  visibleContacts: string[] // 可见联系人ID列表
  reportLinkId: string // 关联的看板链接ID
  reportLinkName?: string // 关联的看板链接名称（用于显示）
  reportLinkUrl?: string // 关联的看板链接URL
  product: BusinessType // 产品类型
  clientId: string // 所属客户ID
  createdAt: string // 创建时间
  createdBy: string // 创建人
  updatedAt?: string // 更新时间
}

/**
 * 可选择的看板链接（用户有权限的）
 */
export interface AvailableReportLink {
  id: string
  name: string
  link?: string
  product: BusinessType | '全部适用'
  clients: string[] | '全部适用'
}

