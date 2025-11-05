import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { ToolItem } from '../types/tools'

const URL = '/mock/tools-market/tools.json'

export async function getTools(): Promise<ToolItem[]> {
  try {
    const res = await fetchWithTimeout(URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载工具市场失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const list = Array.isArray(raw) ? raw : []
    return list.map((t: any) => ({
      id: String(t.id),
      name: String(t.name),
      category: String(t.category ?? ''),
      status: (t.status as ToolItem['status']) ?? '可安装',
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}