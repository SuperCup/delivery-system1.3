import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { ClientItem } from '../types/client'

async function readJson<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { timeout: 3000 })
  if (!res.ok) throw new Error(`读取失败: ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export const DataDeliveryService = {
  async getClients(): Promise<ClientItem[]> {
    return readJson<ClientItem[]>('/mock/data-delivery/clients.json')
  },
}