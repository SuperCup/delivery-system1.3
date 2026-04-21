import type {
  InstantRetailMechanismMapping,
  InstantRetailMechanismMappingUpsertInput,
} from '../types/instant-retail-mechanism'
import { resolveInstantRetailActivityNature } from '../types/instant-retail'

const STORAGE_PREFIX = 'instant-retail:mechanism-mappings:v3:'

const buildStorageKey = (clientId: string) => `${STORAGE_PREFIX}${clientId}`

const safeParseJson = <T,>(raw: string | null, fallback: T): T => {
  if (!raw) return fallback
  try {
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

const nowIso = () => new Date().toISOString()

const buildSourceKey = (input: Pick<
  InstantRetailMechanismMappingUpsertInput,
  'platform' | 'schemeName' | 'activityName' | 'startDate' | 'endDate' | 'mechanismName' | 'activityNature'
>) => {
  const schemeName = input.schemeName?.trim() || ''
  const activityName = input.activityName?.trim() || ''
  const mechanismName = input.mechanismName?.trim() || ''
  const activityNature = resolveInstantRetailActivityNature(input.platform, input.activityNature)
  return [
    input.platform,
    schemeName,
    activityName,
    input.startDate,
    input.endDate,
    mechanismName,
    activityNature,
  ].join('|')
}

const hashString = (value: string) => {
  // djb2
  let hash = 5381
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 33) ^ value.charCodeAt(i)
  }
  return (hash >>> 0).toString(16)
}

export class InstantRetailMechanismService {
  static async list(clientId: string): Promise<InstantRetailMechanismMapping[]> {
    if (!clientId) return []
    const key = buildStorageKey(clientId)
    const list = safeParseJson<InstantRetailMechanismMapping[]>(localStorage.getItem(key), [])
    const normalized = (Array.isArray(list) ? list : []).map((item) => {
      const activityNature = resolveInstantRetailActivityNature(item.platform, item.activityNature)
      const withNature: InstantRetailMechanismMapping = { ...item, activityNature }
      const recomputed = buildSourceKey(withNature)
      if (!withNature.sourceKey || withNature.sourceKey !== recomputed) {
        return { ...withNature, sourceKey: recomputed }
      }
      return withNature
    })
    return normalized
  }

  static async upsert(
    clientId: string,
    input: InstantRetailMechanismMappingUpsertInput,
  ): Promise<InstantRetailMechanismMapping> {
    if (!clientId) throw new Error('clientId不能为空')
    if (!input.platform) throw new Error('platform不能为空')
    if (!input.startDate || !input.endDate) throw new Error('活动时间不能为空')
    if (!input.mechanismName) throw new Error('机制名称不能为空')

    const list = await this.list(clientId)
    const key = buildStorageKey(clientId)

    const activityNature = resolveInstantRetailActivityNature(input.platform, input.activityNature)
    const sourceKey =
      input.sourceKey?.trim() ||
      buildSourceKey({ ...input, activityNature })
    const existingIndex = input.id
      ? list.findIndex((i) => i.id === input.id)
      : list.findIndex((i) => i.sourceKey === sourceKey)
    const base: InstantRetailMechanismMapping = {
      id: input.id ?? `MECHMAP-${hashString(sourceKey)}`,
      sourceKey,
      platform: input.platform,
      activityNature,
      schemeName: input.schemeName?.trim() || undefined,
      activityName: input.activityName?.trim() || undefined,
      startDate: input.startDate,
      endDate: input.endDate,
      mechanismName: input.mechanismName.trim(),
      customMechanismName: (input.customMechanismName ?? '').trim(),
      createdAt: existingIndex >= 0 ? list[existingIndex].createdAt : nowIso(),
      updatedAt: nowIso(),
    }

    const next = [...list]
    if (existingIndex >= 0) {
      next[existingIndex] = base
    } else {
      next.unshift(base)
    }

    localStorage.setItem(key, JSON.stringify(next))
    return base
  }

  static async upsertMany(
    clientId: string,
    inputs: InstantRetailMechanismMappingUpsertInput[],
  ): Promise<{ total: number; saved: number }> {
    if (!clientId) throw new Error('clientId不能为空')
    if (!Array.isArray(inputs) || inputs.length === 0) return { total: 0, saved: 0 }

    let saved = 0
    for (const input of inputs) {
      // eslint-disable-next-line no-await-in-loop
      await this.upsert(clientId, input)
      saved += 1
    }
    return { total: inputs.length, saved }
  }

  static async remove(clientId: string, id: string): Promise<void> {
    if (!clientId) throw new Error('clientId不能为空')
    if (!id) return
    const key = buildStorageKey(clientId)
    const list = await this.list(clientId)
    const next = list.filter((i) => i.id !== id)
    localStorage.setItem(key, JSON.stringify(next))
  }

  static buildSourceKey = buildSourceKey
}

