/**
 * 服务管理服务
 */
import type { Service } from '../types/client-account'

export class ServiceManagementService {
  /**
   * 获取服务列表
   */
  static async getServices(clientId: string): Promise<Service[]> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const response = await fetch(`/mock/clients/${clientId}/services.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch services')
      }
      const data = await response.json()
      return data.services || []
    } catch {
      // 如果文件不存在，返回默认数据
      console.warn('Mock data not found, using default data')
      return this.getDefaultServices()
    }
  }

  /**
   * 获取默认服务数据
   */
  private static getDefaultServices(): Service[] {
    return [
      {
        id: 'SVC-001',
        name: '到店营销服务',
        description: '提供到店营销相关的数据分析和活动管理功能',
        functionPermissions: ['到店营销'],
        isEnabled: true,
        enabledAt: '2024-01-15 10:30:00',
      },
      {
        id: 'SVC-002',
        name: '即时零售服务',
        description: '提供即时零售相关的活动方案和监测任务管理功能',
        functionPermissions: ['即时零售'],
        isEnabled: true,
        enabledAt: '2024-02-20 14:20:00',
      },
      {
        id: 'SVC-003',
        name: '物码营销服务',
        description: '提供物码营销相关的活动管理和数据分析功能',
        functionPermissions: ['物码营销'],
        isEnabled: false,
      },
      {
        id: 'SVC-004',
        name: '数据支持服务',
        description: '提供数据交付、文件交付和数据资产等数据支持功能',
        functionPermissions: ['数据支持'],
        isEnabled: true,
        enabledAt: '2024-03-10 09:15:00',
      },
    ]
  }

  /**
   * 开通服务
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static async enableService(_clientId: string, _serviceId: string): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * 关闭服务
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static async disableService(_clientId: string, _serviceId: string): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

