import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { ActivityItem, ActivityBatchDetail } from '../types/activity'

async function readJson<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { timeout: 3000 })
  if (!res.ok) throw new Error(`读取失败: ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export const ActivityService = {
  async getActivitiesByClient(clientId: string): Promise<ActivityItem[]> {
    const all = await readJson<ActivityItem[]>('/mock/activity/activities.json')
    return all.filter((a) => a.clientId === clientId)
  },
  async getActivityById(id: string): Promise<ActivityItem | null> {
    const all = await readJson<ActivityItem[]>('/mock/activity/activities.json')
    return all.find((a) => a.id === id) ?? null
  },
  async createActivity(activity: ActivityItem): Promise<ActivityItem> {
    // 模拟创建：前端态直接返回成功
    await new Promise((r) => setTimeout(r, 300))
    return activity
  },
  async publishActivity(id: string): Promise<{ id: string; status: '进行中' }> {
    // 模拟发布：前端直接返回成功
    await new Promise((r) => setTimeout(r, 300))
    return { id, status: '进行中' }
  },
  async getBatches(activityId: string): Promise<ActivityBatchDetail[]> {
    try {
      return await readJson<ActivityBatchDetail[]>(`/mock/activity/batches/${activityId}.json`)
    } catch {
      return []
    }
  },
}