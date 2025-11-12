import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { DataSource, SystemDatasetProject } from '../types/data-center'

const DATA_URL = '/mock/data-center/datasources.json'

export async function getDataSources(): Promise<DataSource[]> {
  try {
    const res = await fetchWithTimeout(DATA_URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载数据中心失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const list = Array.isArray(raw) ? raw : []
    return list
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((record) => ({
        id: String(record.id ?? ''),
        name: String(record.name ?? ''),
        category: (record.category as DataSource['category']) ?? '其他',
        standardFields: Number(record.standardFields ?? 0),
        updateFrequency: String(record.updateFrequency ?? ''),
        source: String(record.source ?? ''),
      }))
  } catch (error) {
    console.error(error)
    return []
  }
}

const SYSTEM_DATASETS_URL = '/mock/data-center/system-datasets.json'

export async function getSystemDatasetsByPlatform(platform: string): Promise<SystemDatasetProject[]> {
  try {
    const res = await fetchWithTimeout(SYSTEM_DATASETS_URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载系统数据集失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    if (typeof raw !== 'object' || raw === null) return []
    const platforms = (raw as Record<string, unknown>).platforms
    if (typeof platforms !== 'object' || platforms === null) return []
    const byPlatform = (platforms as Record<string, unknown>)[platform]
    if (!Array.isArray(byPlatform)) return []

    return byPlatform
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((project) => ({
        id: String(project.id ?? ''),
        name: String(project.name ?? project.id ?? ''),
        batches: Array.isArray(project.batches)
          ? project.batches
              .filter(
                (batch): batch is Record<string, unknown> => typeof batch === 'object' && batch !== null,
              )
              .map((batch) => ({
                id: String(batch.id ?? ''),
                code: String(batch.code ?? batch.id ?? ''),
                name: String(batch.name ?? batch.code ?? ''),
                projectId: String(project.id ?? ''),
              }))
          : [],
      }))
  } catch (error) {
    console.error(error)
    return []
  }
}