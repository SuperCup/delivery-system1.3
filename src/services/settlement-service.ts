import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { SettlementOverview } from '../types/settlement'

const URL = '/mock/settlement/overview.json'

export async function getSettlementOverview(): Promise<SettlementOverview | null> {
  try {
    const res = await fetchWithTimeout(URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载结算助手失败: ${res.status}`)
    const raw = (await res.json()) as any
    return {
      lastRun: String(raw.lastRun ?? ''),
      rules: Array.isArray(raw.rules)
        ? raw.rules.map((r: any) => ({ id: String(r.id), name: String(r.name), status: r.status }))
        : [],
    }
  } catch (e) {
    console.error(e)
    return null
  }
}