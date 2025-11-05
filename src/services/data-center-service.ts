import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { DataSource, SystemDatasetProject } from '../types/data-center'

const DATA_URL = '/mock/data-center/datasources.json'

export async function getDataSources(): Promise<DataSource[]> {
  try {
    const res = await fetchWithTimeout(DATA_URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载数据中心失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const list = Array.isArray(raw) ? raw : []
    return list.map((r: any) => ({
      id: String(r.id),
      name: String(r.name),
      category: (r.category as DataSource['category']) ?? '其他',
      standardFields: Number(r.standardFields ?? 0),
      updateFrequency: String(r.updateFrequency ?? ''),
      source: String(r.source ?? ''),
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}

const SYSTEM_DATASETS_URL = '/mock/data-center/system-datasets.json'

export async function getSystemDatasetsByPlatform(platform: string): Promise<SystemDatasetProject[]> {
  try {
    const res = await fetchWithTimeout(SYSTEM_DATASETS_URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载系统数据集失败: ${res.status}`)
    const raw = (await res.json()) as any
    const byPlatform = raw?.platforms?.[platform]
    if (!Array.isArray(byPlatform)) return []
    return byPlatform.map((p: any) => ({
      id: String(p.id),
      name: String(p.name ?? p.id),
      batches: Array.isArray(p.batches)
        ? p.batches.map((b: any) => ({ id: String(b.id), code: String(b.code ?? b.id), name: String(b.name ?? b.code), projectId: String(p.id) }))
        : [],
    }))
  } catch (e) {
    console.error(e)
    return []
  }
}