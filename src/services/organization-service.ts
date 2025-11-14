import type { OrgNode } from '../types/organization'

export class OrganizationService {
  /**
   * 获取公司组织架构
   */
  static async getCompanyStructure(): Promise<OrgNode> {
    const response = await fetch('/mock/organization/company-structure.json')
    if (!response.ok) {
      throw new Error('获取组织架构数据失败')
    }
    return response.json()
  }

  /**
   * 获取节点的完整路径名称
   */
  static getNodePath(nodeId: string, orgTree: OrgNode): string[] {
    const path: string[] = []
    
    function findPath(node: OrgNode, targetId: string): boolean {
      if (node.id === targetId) {
        path.push(node.name)
        return true
      }
      
      if (node.children) {
        for (const child of node.children) {
          if (findPath(child, targetId)) {
            path.unshift(node.name)
            return true
          }
        }
      }
      
      return false
    }
    
    findPath(orgTree, nodeId)
    return path
  }

  /**
   * 根据ID列表获取节点名称
   */
  static getNodeNames(nodeIds: string[], orgTree: OrgNode): string[] {
    const names: string[] = []
    
    function findNode(node: OrgNode, targetId: string): OrgNode | null {
      if (node.id === targetId) {
        return node
      }
      
      if (node.children) {
        for (const child of node.children) {
          const found = findNode(child, targetId)
          if (found) return found
        }
      }
      
      return null
    }
    
    nodeIds.forEach(id => {
      const node = findNode(orgTree, id)
      if (node) {
        names.push(node.name)
      }
    })
    
    return names
  }
}

