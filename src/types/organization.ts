// 组织架构节点类型
export type OrgNodeType = 'company' | 'department' | 'group' | 'person'

// 组织架构节点
export interface OrgNode {
  id: string
  name: string
  type: OrgNodeType
  children?: OrgNode[]
  avatar?: string // 人员头像
  title?: string // 人员职位
}

// 可见性配置
export interface VisibilityConfig {
  type: 'all' | 'custom' // 全公司 或 自定义
  selectedIds: string[] // 选中的节点ID（部门/人员）
}

