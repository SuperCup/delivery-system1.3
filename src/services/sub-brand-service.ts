/**
 * 子品牌服务
 */
import type { SubBrand } from '../types/client-account'

export class SubBrandService {
  /**
   * 获取子品牌列表
   */
  static async getSubBrands(clientId: string): Promise<SubBrand[]> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const response = await fetch(`/mock/clients/${clientId}/sub-brands.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch sub-brands')
      }
      const data = await response.json()
      return data.subBrands || []
    } catch {
      // 如果文件不存在，返回默认数据
      console.warn('Mock data not found, using default data')
      return this.getDefaultSubBrands()
    }
  }

  /**
   * 获取默认子品牌数据
   */
  private static getDefaultSubBrands(): SubBrand[] {
    return [
      {
        id: 'SUB-001',
        platform: '美团闪购',
        brandId: 'BRAND-001',
        brandName: '康师傅',
        subBrandName: '脉动',
        createdAt: '2024-01-15 10:30:00',
        updatedAt: '2024-01-15 10:30:00',
      },
      {
        id: 'SUB-002',
        platform: '美团闪购',
        brandId: 'BRAND-002',
        brandName: '嘉士伯',
        subBrandName: '嘉士伯纯生',
        createdAt: '2024-02-20 14:20:00',
        updatedAt: '2024-02-20 14:20:00',
      },
    ]
  }

  /**
   * 创建子品牌
   */
  static async createSubBrand(
    clientId: string,
    platform: string,
    brandId: string,
    subBrandName: string,
  ): Promise<SubBrand> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 获取品牌名称
    const brands = await this.getClientBrands(clientId)
    const brand = brands.find((b) => b.id === brandId)

    return {
      id: `SUB-${Date.now()}`,
      platform,
      brandId,
      brandName: brand?.name || '',
      subBrandName,
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      updatedAt: new Date().toLocaleString('zh-CN', { hour12: false }),
    }
  }

  /**
   * 更新子品牌
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static async updateSubBrand(
    _clientId: string,
    _subBrandId: string,
    _platform: string,
    _brandId: string,
    _subBrandName: string,
  ): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * 删除子品牌
   */
  /* eslint-disable @typescript-eslint/no-unused-vars */
  static async deleteSubBrand(_clientId: string, _subBrandId: string): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
  }
  /* eslint-enable @typescript-eslint/no-unused-vars */

  /**
   * 获取客户品牌列表（辅助方法）
   */
  private static async getClientBrands(
    clientId: string,
  ): Promise<Array<{ id: string; name: string }>> {
    try {
      const response = await fetch(`/mock/clients/${clientId}/brands.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch brands')
      }
      const data = await response.json()
      return data.brands || []
    } catch {
      return []
    }
  }
}

