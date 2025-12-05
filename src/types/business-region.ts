/**
 * 业务区域相关类型定义
 */

/**
 * 省份信息
 */
export interface Province {
  /** 省份代码 */
  code: string
  /** 省份名称 */
  name: string
  /** 城市列表 */
  cities: City[]
}

/**
 * 城市信息（地级市）
 */
export interface City {
  /** 城市代码 */
  code: string
  /** 城市名称 */
  name: string
}

/**
 * 业务区域映射
 */
export interface BusinessRegionMapping {
  /** 映射ID */
  id: string
  /** 客户自定义区域名称 */
  regionName: string
  /** 包含的城市代码列表 */
  cityCodes: string[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

