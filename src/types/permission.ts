export type PermissionModule =
  | '首页'
  | '魔盒'
  | '知识库'
  | '数据仓库'
  | '工具市场'
  | '权限中心'
  | '系统设置'

export type PermissionAction = '查看' | '新建' | '编辑' | '审批' | '导出' | '使用' | '申请'

export type PermissionRole = {
  id: string
  name: string
  description: string
  memberCount: number
  createdAt: string
  updatedAt: string
}

export type PermissionMatrixCell = {
  module: PermissionModule
  actions: PermissionAction[]
}

export type PermissionMatrix = Record<PermissionRole['id'], PermissionMatrixCell[]>

export type PermissionMember = {
  id: string
  name: string
  email: string
  roleId: string
  status: '正常' | '停用' | '待开通'
  joinedAt: string
  lastActiveAt: string
}

