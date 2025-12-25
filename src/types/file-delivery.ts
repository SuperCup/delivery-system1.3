import type { BusinessType } from './client'

/**
 * 文件交付任务
 */
export interface FileDeliveryTask {
  id: string
  name: string // 任务名称
  product?: BusinessType // 产品类型（可选）
  validity: string // 有效期（永久或时间范围）
  description: string // 描述
  visibleUsers: string[] // 可见用户ID列表
  clientId: string // 所属客户ID
  createdAt: string // 创建时间
  createdBy: string // 创建人
  updatedAt: string // 更新时间
  fileCount?: number // 文件数量（统计）
  folderCount?: number // 文件夹数量（统计）
}

/**
 * 文件或文件夹
 */
export interface DeliveryFile {
  id: string
  name: string // 文件/文件夹名称
  type: 'file' | 'folder' // 类型：文件或文件夹
  fileType?: string // 文件类型（如：xlsx, pdf等，仅文件有）
  size?: number // 文件大小（字节，仅文件有）
  taskId: string // 所属任务ID
  parentId?: string // 父文件夹ID（如果是在文件夹内）
  path?: string // 文件路径
  createdAt: string // 创建时间
  createdBy: string // 创建人
  downloadUrl?: string // 下载链接（仅文件有）
}

/**
 * 授权用户
 */
export interface AuthorizedUser {
  id: string
  accountName: string // 账号名
  name: string // 姓名
  taskId: string // 所属任务ID
}

