import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { MagiAgent } from '../types/magi-core'

type RawRecord = Record<string, unknown>

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null

const ALLOWED_STATUS: MagiAgent['status'][] = ['运行中', '停用', '维护中']

export async function getMagiAgents(): Promise<MagiAgent[]> {
  try {
    const res = await fetchWithTimeout('/mock/magi-core/agents.json', { timeout: 3000 })
    if (!res.ok) throw new Error(`加载智能体失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const list = (() => {
      if (isRecord(raw) && Array.isArray(raw.agents)) return raw.agents
      if (Array.isArray(raw)) return raw
      return []
    })()

    return list
      .filter(isRecord)
      .map((agent) => {
        const tags = Array.isArray(agent.tags)
          ? agent.tags.filter((tag): tag is string => typeof tag === 'string')
          : []
        const status = ALLOWED_STATUS.includes(agent.status as MagiAgent['status'])
          ? (agent.status as MagiAgent['status'])
          : '运行中'

        return {
          id: String(agent.id ?? ''),
          name: String(agent.name ?? ''),
          description: String(agent.description ?? ''),
          image: String(agent.image ?? ''),
          usageCount: Number(agent.usageCount ?? 0),
          lastUsedAt: String(agent.lastUsedAt ?? ''),
          tags,
          entryUrl: String(agent.entryUrl ?? '#'),
          status,
        }
      })
  } catch (error) {
    console.error(error)
    return []
  }
}

