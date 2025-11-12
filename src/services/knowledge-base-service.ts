import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type {
  KnowledgeDataset,
  KnowledgeDimension,
  KnowledgeItem,
  KnowledgeCategory,
  KnowledgeType,
} from '../types/knowledge'
const DIMENSION_FILE_MAP: Record<KnowledgeDimension, string> = {
  public: 'public.json',
  internal: 'internal.json',
  'business-unit': 'business-unit.json',
  personal: 'personal.json',
  brand: 'brand.json',
  type: 'type.json',
}

const KNOWN_TYPES: KnowledgeType[] = ['技术', '业务', '运营', '市场', '品牌资产', '政策']

type RawRecord = Record<string, unknown>

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null

function normalizeCategories(rawCategories: unknown[], dimension: KnowledgeDimension): KnowledgeCategory[] {
  return rawCategories
    .filter(isRecord)
    .map((category) => ({
      id: String(category.id ?? ''),
      name: String(category.name ?? ''),
      description: String(category.description ?? ''),
      type: (category.type as KnowledgeType | null) ?? null,
      scope: dimension,
    }))
}

function normalizeItems(rawItems: unknown[], dimension: KnowledgeDimension): KnowledgeItem[] {
  return rawItems
    .filter(isRecord)
    .map((item) => {
      const tags = Array.isArray(item.tags)
        ? item.tags.filter((tag): tag is string => typeof tag === 'string')
        : []

      const attachments = Array.isArray(item.attachments)
        ? item.attachments
            .filter(isRecord)
            .map((attachment) => ({
              name: String(attachment.name ?? ''),
              url: String(attachment.url ?? ''),
            }))
        : []

      const type = KNOWN_TYPES.includes(item.type as KnowledgeType)
        ? (item.type as KnowledgeType)
        : '技术'

      return {
        id: String(item.id ?? ''),
        title: String(item.title ?? ''),
        summary: String(item.summary ?? ''),
        tags,
        type,
        dimension,
        categoryId: String(item.categoryId ?? ''),
        owner: String(item.owner ?? ''),
        updatedAt: String(item.updatedAt ?? ''),
        views: Number(item.views ?? 0),
        attachments,
      }
    })
}

export async function getKnowledgeDataset(dimension: KnowledgeDimension): Promise<KnowledgeDataset> {
  const filename = DIMENSION_FILE_MAP[dimension]
  const url = `/mock/knowledge-base/${filename}`
  try {
    const res = await fetchWithTimeout(url, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载知识库数据失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const rawObject = isRecord(raw) ? raw : {}
    const categories = Array.isArray(rawObject.categories) ? rawObject.categories : []
    const items = Array.isArray(rawObject.items) ? rawObject.items : []
    return {
      dimension,
      categories: normalizeCategories(categories, dimension),
      items: normalizeItems(items, dimension),
    }
  } catch (error) {
    console.error(error)
    return {
      dimension,
      categories: [],
      items: [],
    }
  }
}

