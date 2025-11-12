export interface ClientItem {
  id: string
  name: string
}

export type BusinessType = '到店营销' | '即时零售' | '物码营销'

export interface BusinessOverview {
  type: BusinessType
  activityCount: number
  totalAmount?: number
  lastActivityDate?: string
}

export interface Contact {
  id: string
  name: string
  position: string
  phone?: string
  email?: string
  department?: string
}

export interface ClientDetail {
  id: string
  name: string
  industry?: string
  address?: string
  website?: string
  description?: string
  contacts: Contact[]
  business: BusinessOverview[]
  createdAt?: string
  updatedAt?: string
}

export interface IndustryInsight {
  id: string
  title: string
  content: string
  publishDate: string
  source?: string
}

export interface BusinessAnalysis {
  id: string
  title: string
  reportType: '行业分析' | '业务分析' | '市场洞察'
  summary: string
  publishDate: string
  downloadUrl?: string
}

export interface MarketingCase {
  id: string
  title: string
  businessType: BusinessType
  description: string
  startDate: string
  endDate?: string
  metrics?: {
    participants?: number
    revenue?: number
    roi?: number
  }
  tags?: string[]
}
