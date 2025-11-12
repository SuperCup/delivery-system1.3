import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type {
  ClientSummary,
  DashboardOverview,
  HomeMessages,
  HomeReports,
  HomeBusinessOverview,
  StatCard,
  QuickAction,
} from '../types/home'

async function readJson<T>(path: string): Promise<T> {
  const res = await fetchWithTimeout(path, { timeout: 3000 })
  if (!res.ok) throw new Error(`读取失败: ${res.status} ${res.statusText}`)
  return (await res.json()) as T
}

export const HomeService = {
  async getClientSummaries(): Promise<ClientSummary[]> {
    return readJson<ClientSummary[]>('/mock/home/clients-summary.json')
  },

  async getDashboardOverview(): Promise<DashboardOverview> {
    try {
      const res = await fetchWithTimeout('/mock/home/dashboard-overview.json', { timeout: 3000 })
      if (!res.ok) throw new Error(`加载首页概览失败: ${res.status} ${res.statusText}`)
      const raw = (await res.json()) as unknown
      const rawObject = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {}

      const toStat = (value: unknown): StatCard | null => {
        if (typeof value !== 'object' || value === null) return null
        const stat = value as Record<string, unknown>
        return {
          id: String(stat.id ?? ''),
          title: String(stat.title ?? ''),
          value: Number(stat.value ?? 0),
          unit: String(stat.unit ?? ''),
          trend: String(stat.trend ?? ''),
          trendType: ['up', 'down', 'normal'].includes(String(stat.trendType))
            ? (stat.trendType as StatCard['trendType'])
            : 'normal',
          icon: String(stat.icon ?? ''),
        }
      }

      const toQuickAction = (value: unknown): QuickAction | null => {
        if (typeof value !== 'object' || value === null) return null
        const action = value as Record<string, unknown>
        return {
          id: String(action.id ?? ''),
          title: String(action.title ?? ''),
          description: String(action.description ?? ''),
          icon: String(action.icon ?? ''),
          link: String(action.link ?? '#'),
          color: String(action.color ?? '#1677ff'),
        }
      }

      const stats = Array.isArray(rawObject.stats)
        ? (rawObject.stats as unknown[])
            .map(toStat)
            .filter((stat): stat is StatCard => stat !== null)
        : []

      const quickActions = Array.isArray(rawObject.quickActions)
        ? (rawObject.quickActions as unknown[])
            .map(toQuickAction)
            .filter((action): action is QuickAction => action !== null)
        : []

      const filteredStats = stats.filter(
        (stat) => !['clients', 'activities', 'tasks'].includes(stat.id),
      )

      return { stats: filteredStats, quickActions }
    } catch (error) {
      console.error(error)
      return { stats: [], quickActions: [] }
    }
  },

  async getHomeMessages(): Promise<HomeMessages> {
    return readJson<HomeMessages>('/mock/home/messages.json')
  },

  async getHomeReports(): Promise<HomeReports> {
    return readJson<HomeReports>('/mock/home/reports.json')
  },

  async getBusinessOverview(): Promise<HomeBusinessOverview> {
    return readJson<HomeBusinessOverview>('/mock/home/business-overview.json')
  },
}