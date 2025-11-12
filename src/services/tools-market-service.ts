import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { ToolItem, ToolChangelog } from '../types/tools'

const URL = '/mock/tools-market/tools.json'

type RawRecord = Record<string, unknown>

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null

const normalizeChangelog = (entries: unknown[]): ToolChangelog[] =>
  entries
    .filter(isRecord)
    .map((entry) => ({
      version: String(entry.version ?? ''),
      releasedAt: String(entry.releasedAt ?? ''),
      highlights: Array.isArray(entry.highlights)
        ? entry.highlights
            .filter((highlight): highlight is string => typeof highlight === 'string')
            .map((highlight) => highlight)
        : [],
    }))

export async function getTools(): Promise<ToolItem[]> {
  try {
    const res = await fetchWithTimeout(URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载工具市场失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const rawObject = isRecord(raw) ? raw : {}
    const list = Array.isArray(rawObject.tools) ? rawObject.tools : Array.isArray(raw) ? raw : []

    return list
      .filter(isRecord)
      .map((tool) => {
        const supportedPlatforms = Array.isArray(tool.supportedPlatforms)
          ? tool.supportedPlatforms.filter((platform): platform is string => typeof platform === 'string')
          : []
        const audiences = Array.isArray(tool.audiences)
          ? tool.audiences.filter((audience): audience is string => typeof audience === 'string')
          : []
        const status = (tool.status as ToolItem['status']) ?? '可安装'

        const changelog = Array.isArray(tool.changelog) ? normalizeChangelog(tool.changelog) : []

        return {
          id: String(tool.id ?? ''),
          name: String(tool.name ?? ''),
          category: String(tool.category ?? ''),
          status,
          supportedPlatforms,
          audiences,
          description: String(tool.description ?? ''),
          usageGuide: String(tool.usageGuide ?? ''),
          latestVersion: String(tool.latestVersion ?? 'v1.0.0'),
          lastUpdatedAt: String(tool.lastUpdatedAt ?? ''),
          previewUrl: String(tool.previewUrl ?? ''),
          changelog,
        }
      })
  } catch (error) {
    console.error(error)
    return []
  }
}