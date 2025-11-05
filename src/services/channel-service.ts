import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { ChannelConfig } from '../types/channel'

async function readJson<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { timeout: 3000 })
  if (!res.ok) throw new Error(`读取失败: ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export const ChannelService = {
  async getChannels(): Promise<ChannelConfig[]> {
    return readJson<ChannelConfig[]>('/mock/channels/configs.json')
  },
}