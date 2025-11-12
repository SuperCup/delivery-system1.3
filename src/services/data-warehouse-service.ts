import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type {
  DataWarehouseDataset,
  DataWarehouseField,
  DataWarehouseUseCase,
  DataWarehouseBusinessType,
} from '../types/data-warehouse'

const KNOWN_BUSINESS: DataWarehouseBusinessType[] = ['到店营销', '即时零售', '物码营销']

type RawRecord = Record<string, unknown>

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null

function normalizeFields(rawFields: unknown[]): DataWarehouseField[] {
  return rawFields
    .filter(isRecord)
    .map((field) => ({
      id: String(field.id ?? ''),
      name: String(field.name ?? ''),
      alias: String(field.alias ?? ''),
      dataType: String(field.dataType ?? 'string'),
      description: String(field.description ?? ''),
      updateFrequency: String(field.updateFrequency ?? ''),
      sourceSystem: String(field.sourceSystem ?? ''),
    }))
}

function normalizeUseCases(rawUseCases: unknown[]): DataWarehouseUseCase[] {
  return rawUseCases
    .filter(isRecord)
    .map((useCase) => ({
      id: String(useCase.id ?? ''),
      title: String(useCase.title ?? ''),
      businessUnit: String(useCase.businessUnit ?? ''),
      description: String(useCase.description ?? ''),
      owner: String(useCase.owner ?? ''),
      lastUpdatedAt: String(useCase.lastUpdatedAt ?? ''),
    }))
}

export async function getDataWarehouseDatasets(): Promise<DataWarehouseDataset[]> {
  try {
    const res = await fetchWithTimeout('/mock/data-warehouse/datasets.json', { timeout: 3000 })
    if (!res.ok) throw new Error(`加载数据仓库数据失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const rawObject = isRecord(raw) ? raw : {}
    const list = Array.isArray(rawObject.datasets)
      ? rawObject.datasets
      : Array.isArray(raw)
      ? raw
      : []

    return list
      .filter(isRecord)
      .map((dataset) => {
        const business = KNOWN_BUSINESS.includes(dataset.business as DataWarehouseBusinessType)
          ? (dataset.business as DataWarehouseBusinessType)
          : '到店营销'

        const status = ['试运行', '已上线', '规划中'].includes(
          dataset.releaseStatus as DataWarehouseDataset['releaseStatus'],
        )
          ? (dataset.releaseStatus as DataWarehouseDataset['releaseStatus'])
          : '试运行'

        return {
          id: String(dataset.id ?? ''),
          platform: String(dataset.platform ?? ''),
          business,
          name: String(dataset.name ?? ''),
          releaseStatus: status,
          fields: Array.isArray(dataset.fields) ? normalizeFields(dataset.fields) : [],
          useCases: Array.isArray(dataset.useCases) ? normalizeUseCases(dataset.useCases) : [],
        }
      })
  } catch (error) {
    console.error(error)
    return []
  }
}

