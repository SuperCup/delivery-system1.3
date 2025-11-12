import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import { ActivityService } from './activity-service'
import { ClientService } from './client-service'
import type { ActivityItem } from '../types/activity'
import type { BusinessActivityGuide, PlatformDataOption } from '../types/activity-guidance'
import type { Contact } from '../types/client'

const GUIDE_URL = '/mock/activity/business-guides.json'
const PLATFORM_OPTIONS_URL = '/mock/activity/platform-data-options.json'

async function readJson<T>(url: string): Promise<T> {
  const res = await fetchWithTimeout(url, { timeout: 3000 })
  if (!res.ok) {
    throw new Error(`加载失败：${res.status} ${res.statusText}`)
  }
  return (await res.json()) as T
}

export class ClientActivityService {
  static async getActivities(clientId: string): Promise<ActivityItem[]> {
    const all = await ActivityService.getActivitiesByClient(clientId)
    return all.map((item) => ({
      ...item,
      businessType: item.businessType ?? '到店营销',
      dataScopes: item.dataScopes ?? [],
      visibleContacts: item.visibleContacts ?? [],
    }))
  }

  static async getBusinessGuides(): Promise<BusinessActivityGuide[]> {
    try {
      return await readJson<BusinessActivityGuide[]>(GUIDE_URL)
    } catch (error) {
      console.error('加载业务指引失败', error)
      return []
    }
  }

  static async getPlatformOptions(): Promise<PlatformDataOption[]> {
    try {
      return await readJson<PlatformDataOption[]>(PLATFORM_OPTIONS_URL)
    } catch (error) {
      console.error('加载平台数据选项失败', error)
      return []
    }
  }

  static async getClientContacts(clientId: string): Promise<Contact[]> {
    try {
      const detail = await ClientService.getClientDetail(clientId)
      return detail.contacts ?? []
    } catch (error) {
      console.error('加载客户联系人失败', error)
      return []
    }
  }
}

