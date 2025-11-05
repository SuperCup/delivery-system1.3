import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { DeliveryTask, DashboardMetric } from '../types/delivery'

async function readJson<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { timeout: 3000 })
  if (!res.ok) throw new Error(`读取失败: ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export const DeliveryService = {
  async getDashboardMetrics(): Promise<DashboardMetric[]> {
    return readJson<DashboardMetric[]>('/mock/dashboard/metrics.json')
  },
  async getTasks(): Promise<DeliveryTask[]> {
    return readJson<DeliveryTask[]>('/mock/delivery/tasks.json')
  },
}