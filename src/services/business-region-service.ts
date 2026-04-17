/**
 * 业务区域服务
 */
import type { BusinessRegionMapping, Province } from '../types/business-region'

export class BusinessRegionService {
  /**
   * 获取省份和城市列表
   */
  static async getProvincesAndCities(): Promise<Province[]> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))

    // 返回部分省份和城市数据作为示例
    return [
      {
        code: 'HN',
        name: '河南',
        cities: [
          { code: 'ZZ', name: '郑州' },
          { code: 'LY', name: '洛阳' },
          { code: 'XX', name: '新乡' },
          { code: 'AY', name: '安阳' },
        ],
      },
      {
        code: 'HB',
        name: '河北',
        cities: [
          { code: 'SJZ', name: '石家庄' },
          { code: 'TS', name: '唐山' },
          { code: 'BD', name: '保定' },
          { code: 'HD', name: '邯郸' },
        ],
      },
      {
        code: 'SX',
        name: '陕西',
        cities: [
          { code: 'XA', name: '西安' },
          { code: 'BJ', name: '宝鸡' },
          { code: 'WN', name: '渭南' },
          { code: 'YA', name: '延安' },
        ],
      },
      {
        code: 'SNX',
        name: '山西',
        cities: [
          { code: 'TY', name: '太原' },
          { code: 'DT', name: '大同' },
          { code: 'YC', name: '运城' },
          { code: 'JZ', name: '晋中' },
        ],
      },
    ]
  }

  /**
   * 获取客户的业务区域映射列表
   */
  static async getBusinessRegionMappings(clientId: string): Promise<BusinessRegionMapping[]> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const response = await fetch(`/mock/clients/${clientId}/business-regions.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch business regions')
      }
      const data = await response.json()
      return data.mappings || []
    } catch {
      // 如果文件不存在，返回默认数据
      console.warn('Mock data not found, using default data')
      return this.getDefaultMappings()
    }
  }

  /**
   * 获取默认映射数据
   */
  private static getDefaultMappings(): BusinessRegionMapping[] {
    return [
      {
        id: 'REG-001',
        regionName: '华中大区',
        cityCodes: ['HN-ZZ', 'HN-LY', 'HB-SJZ', 'HB-TS', 'SX-XA', 'SNX-TY'],
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-15 10:30:00',
      },
    ]
  }

  /**
   * 创建业务区域映射
   */
  static async createBusinessRegionMapping(
    _clientId: string,
    regionName: string,
    cityCodes: string[],
  ): Promise<BusinessRegionMapping> {
    // 模拟API调用
    void _clientId
    await new Promise((resolve) => setTimeout(resolve, 500))

    return {
      id: `REG-${Date.now()}`,
      regionName,
      cityCodes,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    }
  }

  /**
   * 更新业务区域映射
   */
  static async updateBusinessRegionMapping(
    _clientId: string,
    _mappingId: string,
    _regionName: string,
    _cityCodes: string[],
  ): Promise<void> {
    // 模拟API调用
    void _clientId
    void _mappingId
    void _regionName
    void _cityCodes
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  /**
   * 删除业务区域映射
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static async deleteBusinessRegionMapping(_clientId: string, _mappingId: string): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */
}

