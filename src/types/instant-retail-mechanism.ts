import type { InstantRetailActivityNature, InstantRetailPlatform } from './instant-retail'

export interface InstantRetailMechanismMapping {
  id: string
  /**
   * 平台侧机制明细的唯一键（用于导出/导入匹配）
   * 规则：platform + schemeName + activityName + startDate + endDate + mechanismName + activityNature
   */
  sourceKey: string
  platform: InstantRetailPlatform
  /** 活动性质（美团：平台活动/品牌活动；其他平台：品牌活动） */
  activityNature: InstantRetailActivityNature
  schemeName?: string
  activityName?: string
  startDate: string // YYYY-MM-DD
  endDate: string // YYYY-MM-DD
  mechanismName: string
  customMechanismName: string // 允许为空字符串，表示暂未维护
  createdAt: string
  updatedAt: string
}

export type InstantRetailMechanismMappingUpsertInput = Omit<
  InstantRetailMechanismMapping,
  'id' | 'sourceKey' | 'createdAt' | 'updatedAt' | 'activityNature'
> & { id?: string; sourceKey?: string; activityNature?: InstantRetailActivityNature }


