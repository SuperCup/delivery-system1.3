import type { BusinessType } from './home'

export interface BusinessActivityGuide {
  type: BusinessType
  summary: string
  platforms: string[]
  highlights: string[]
  checklist: string[]
  previewTips?: string[]
}

export interface PlatformHierarchy {
  id: string
  name: string
  code?: string
  batches?: Array<{
    id: string
    name: string
    code?: string
    mechanismName?: string
  }>
}

export interface PlatformDataOption {
  platform: string
  projects: PlatformHierarchy[]
}

