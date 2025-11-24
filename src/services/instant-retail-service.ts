import type {
  MarketingCalendarMonth,
  ActivityProgress,
  ActivityAnalysis,
  PriceMonitoringTask,
  ActivityScheme,
  PlatformCrawledScheme,
  InstantRetailPlatform,
  ActivityItem,
  ActivityDetailInfo,
} from '../types/instant-retail'
import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import dayjs from 'dayjs'

const MOCK_BASE_URL = '/mock/instant-retail'

export class InstantRetailService {
  /**
   * 获取营销日历数据（按月）
   */
  static async getMarketingCalendar(
    clientId: string,
    month: string,
  ): Promise<MarketingCalendarMonth> {
    const response = await fetchWithTimeout(
      `${MOCK_BASE_URL}/${clientId}/marketing-calendar/${month}.json`,
      { timeout: 3000 },
    )
    if (!response.ok) {
      throw new Error(`获取营销日历失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取活动进度数据（按月）
   */
  static async getActivityProgress(
    clientId: string,
    month: string,
  ): Promise<ActivityProgress[]> {
    const response = await fetchWithTimeout(
      `${MOCK_BASE_URL}/${clientId}/activity-progress/${month}.json`,
      { timeout: 3000 },
    )
    if (!response.ok) {
      throw new Error(`获取活动进度失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取活动分析数据（按月）
   */
  static async getActivityAnalysis(
    clientId: string,
    month: string,
  ): Promise<ActivityAnalysis[]> {
    const response = await fetchWithTimeout(
      `${MOCK_BASE_URL}/${clientId}/activity-analysis/${month}.json`,
      { timeout: 3000 },
    )
    if (!response.ok) {
      throw new Error(`获取活动分析失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取破价监测任务列表
   */
  static async getPriceMonitoringTasks(clientId: string): Promise<PriceMonitoringTask[]> {
    const response = await fetchWithTimeout(
      `${MOCK_BASE_URL}/${clientId}/price-monitoring-tasks.json`,
      { timeout: 3000 },
    )
    if (!response.ok) {
      throw new Error(`获取破价监测任务失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 创建破价监测任务
   */
  static async createPriceMonitoringTask(
    _clientId: string,
    task: Omit<PriceMonitoringTask, 'id' | 'createdAt' | 'createdBy' | 'status'>,
  ): Promise<PriceMonitoringTask> {
    // 模拟创建
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      ...task,
      id: `PMT-${Date.now()}`,
      createdAt: new Date().toISOString(),
      createdBy: '当前用户',
      status: '进行中',
    }
  }

  /**
   * 更新破价监测任务
   */
  static async updatePriceMonitoringTask(
    clientId: string,
    taskId: string,
    updates: Partial<PriceMonitoringTask>,
  ): Promise<PriceMonitoringTask> {
    // 模拟更新
    await new Promise((resolve) => setTimeout(resolve, 500))
    const tasks = await this.getPriceMonitoringTasks(clientId)
    const task = tasks.find((t) => t.id === taskId)
    if (!task) {
      throw new Error('任务不存在')
    }
    return { ...task, ...updates }
  }

  /**
   * 删除破价监测任务
   */
  static async deletePriceMonitoringTask(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _taskId: string,
  ): Promise<void> {
    // 模拟删除
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  /**
   * 获取平台爬取的方案列表
   */
  static async getPlatformCrawledSchemes(
    platform: InstantRetailPlatform,
    month: string,
  ): Promise<PlatformCrawledScheme[]> {
    const response = await fetchWithTimeout(
      `${MOCK_BASE_URL}/platform-schemes/${platform}/${month}.json`,
      { timeout: 3000 },
    )
    if (!response.ok) {
      throw new Error(`获取平台方案失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取方案列表（包含平台爬取和手动导入）
   */
  static async getActivitySchemes(
    clientId: string,
    platform: InstantRetailPlatform,
    month: string,
  ): Promise<ActivityScheme[]> {
    const response = await fetchWithTimeout(
      `${MOCK_BASE_URL}/${clientId}/activity-schemes/${platform}/${month}.json`,
      { timeout: 3000 },
    )
    if (!response.ok) {
      throw new Error(`获取方案列表失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 手动导入方案
   */
  static async importActivityScheme(
    _clientId: string,
    scheme: Omit<ActivityScheme, 'id' | 'importedAt' | 'importedBy' | 'status' | 'source'>,
  ): Promise<ActivityScheme> {
    // 模拟导入
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      ...scheme,
      id: `SCHEME-${Date.now()}`,
      source: '手动导入',
      importedAt: new Date().toISOString(),
      importedBy: '当前用户',
      status: '待发布',
    }
  }

  /**
   * 发布方案（将方案发布，客户端可见）
   */
  static async publishActivityScheme(
    clientId: string,
    schemeId: string,
  ): Promise<ActivityScheme> {
    // 模拟发布
    await new Promise((resolve) => setTimeout(resolve, 500))
    const schemes = await this.getActivitySchemes(clientId, '美团闪购', dayjs().format('YYYY-MM'))
    const scheme = schemes.find((s) => s.id === schemeId)
    if (!scheme) {
      throw new Error('方案不存在')
    }
    return {
      ...scheme,
      status: '已发布',
      publishedAt: new Date().toISOString(),
      publishedBy: '当前用户',
    }
  }

  /**
   * 删除方案
   */
  static async deleteActivityScheme(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _schemeId: string,
  ): Promise<void> {
    // 模拟删除
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  /**
   * 获取活动明细列表（按平台）
   */
  static async getActivityItems(
    clientId: string,
    platform?: InstantRetailPlatform,
  ): Promise<ActivityItem[]> {
    const response = await fetchWithTimeout(
      `${MOCK_BASE_URL}/${clientId}/activity-items${platform ? `?platform=${platform}` : ''}.json`,
      { timeout: 3000 },
    )
    if (!response.ok) {
      throw new Error(`获取活动明细失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 获取活动详情
   */
  static async getActivityDetail(
    clientId: string,
    activityId: string,
  ): Promise<ActivityDetailInfo> {
    const response = await fetchWithTimeout(
      `${MOCK_BASE_URL}/${clientId}/activity-items/${activityId}.json`,
      { timeout: 3000 },
    )
    if (!response.ok) {
      throw new Error(`获取活动详情失败: ${response.statusText}`)
    }
    return response.json()
  }

  /**
   * 下架活动
   */
  static async offlineActivity(
    clientId: string,
    activityId: string,
  ): Promise<ActivityItem> {
    // 模拟下架
    await new Promise((resolve) => setTimeout(resolve, 500))
    const activities = await this.getActivityItems(clientId)
    const activity = activities.find((a) => a.id === activityId)
    if (!activity) {
      throw new Error('活动不存在')
    }
    return {
      ...activity,
      status: '已下架',
      offlineAt: new Date().toISOString(),
      offlineBy: '当前用户',
    }
  }
}

