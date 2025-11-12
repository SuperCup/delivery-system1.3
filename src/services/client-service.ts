import type {
  ClientDetail,
  IndustryInsight,
  BusinessAnalysis,
  MarketingCase,
} from '../types/client'
import { fetchWithTimeout } from '../utils/fetch-with-timeout'

const MOCK_BASE_URL = '/mock/clients'

export class ClientService {
  /**
   * 获取客户详情
   */
  static async getClientDetail(clientId: string): Promise<ClientDetail> {
    const response = await fetchWithTimeout(`${MOCK_BASE_URL}/${clientId}.json`, {
      timeout: 3000,
    })
    if (!response.ok) {
      throw new Error(`获取客户详情失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取行业洞察
   */
  static async getIndustryInsights(clientId: string): Promise<IndustryInsight[]> {
    const response = await fetchWithTimeout(`${MOCK_BASE_URL}/${clientId}/insights.json`, {
      timeout: 3000,
    })
    if (!response.ok) {
      throw new Error(`获取行业洞察失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取业务分析报告
   */
  static async getBusinessAnalyses(clientId: string): Promise<BusinessAnalysis[]> {
    const response = await fetchWithTimeout(`${MOCK_BASE_URL}/${clientId}/analyses.json`, {
      timeout: 3000,
    })
    if (!response.ok) {
      throw new Error(`获取业务分析失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取营销案例
   */
  static async getMarketingCases(clientId: string): Promise<MarketingCase[]> {
    const response = await fetchWithTimeout(`${MOCK_BASE_URL}/${clientId}/cases.json`, {
      timeout: 3000,
    })
    if (!response.ok) {
      throw new Error(`获取营销案例失败: ${response.statusText}`)
    }
    return response.json()
  }
}

