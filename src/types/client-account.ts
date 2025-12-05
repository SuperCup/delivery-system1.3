/**
 * 客户账号相关类型定义
 */

/**
 * 账号状态
 */
export type AccountStatus = '使用中' | '已禁用' | '待激活'

/**
 * 登录方式绑定状态
 */
export type LoginBindingStatus = '已绑定' | '未绑定'

/**
 * 功能权限类型
 */
export type FunctionPermission = '到店营销' | '即时零售' | '物码营销' | '数据支持'

/**
 * 客户账号信息
 */
export interface ClientAccount {
  /** 账号ID */
  id: string
  /** 账号名 */
  accountName: string
  /** 姓名 */
  name: string
  /** 邮箱 */
  email: string
  /** 账号状态 */
  status: AccountStatus
  /** 手机登录绑定状态 */
  mobileLogin: LoginBindingStatus
  /** 微信登录绑定状态 */
  wechatLogin: LoginBindingStatus
  /** 创建人 */
  creator: string
  /** 创建时间 */
  createdAt: string
  /** 激活链接 */
  activationLink?: string
  /** 功能权限 */
  functionPermissions: FunctionPermission[]
  /** 负责区域ID列表 */
  regionIds: string[]
  /** 负责子品牌ID列表 */
  subBrandIds: string[]
}

/**
 * 登录日志
 */
export interface LoginLog {
  /** 日志ID */
  id: string
  /** 账号ID */
  accountId: string
  /** 登录时间 */
  loginTime: string
  /** 登录方式 */
  loginMethod: '手机验证码' | '微信'
  /** IP地址 */
  ipAddress: string
  /** 设备信息 */
  deviceInfo: string
  /** 登录状态 */
  status: '成功' | '失败'
  /** 失败原因（如果失败） */
  failureReason?: string
}

/**
 * 创建账号表单数据
 */
export interface CreateAccountFormData {
  /** 账号名 */
  accountName: string
  /** 姓名 */
  name: string
  /** 邮箱 */
  email: string
  /** 发送激活链接方式 */
  sendMethod: '链接' | '邮件'
  /** 功能权限 */
  functionPermissions: FunctionPermission[]
  /** 负责区域ID列表 */
  regionIds: string[]
  /** 负责子品牌ID列表 */
  subBrandIds: string[]
}

/**
 * 业务区域信息
 */
export interface BusinessRegion {
  /** 区域ID */
  id: string
  /** 区域名称（客户自定义） */
  name: string
  /** 包含的城市列表（地级市） */
  cities: string[]
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 品牌信息
 */
export interface Brand {
  /** 品牌ID */
  id: string
  /** 品牌名称 */
  name: string
  /** 品牌描述 */
  description?: string
}

/**
 * 子品牌信息
 */
export interface SubBrand {
  /** 子品牌ID */
  id: string
  /** 平台 */
  platform: string
  /** 品牌ID */
  brandId: string
  /** 品牌名称 */
  brandName: string
  /** 子品牌名称 */
  subBrandName: string
  /** 创建时间 */
  createdAt: string
  /** 更新时间 */
  updatedAt: string
}

/**
 * 客户可绑定的子品牌（用于账号管理）
 */
export interface ClientSubBrand {
  /** 子品牌ID */
  id: string
  /** 品牌名称 */
  brandName: string
  /** 子品牌名称 */
  subBrandName: string
  /** 显示名称（品牌-子品牌） */
  displayName: string
}

/**
 * 服务信息
 */
export interface Service {
  /** 服务ID */
  id: string
  /** 服务名称 */
  name: string
  /** 服务描述 */
  description: string
  /** 关联的功能权限 */
  functionPermissions: FunctionPermission[]
  /** 是否已开通 */
  isEnabled: boolean
  /** 开通时间 */
  enabledAt?: string
}

