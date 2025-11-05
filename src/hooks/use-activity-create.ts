import { useEffect, useMemo, useState } from 'react'
import { message } from 'antd'
import type { ActivityItem, ActivityStatus } from '../types/activity'
import type { ActivityCreatePayload, DataScope, DataSourceType } from '../types/activity-create'
import { ActivityService } from '../services/activity-service'
import { getDataSources } from '../services/data-center-service'
import type { DataSource } from '../types/data-center'

export function useActivityCreate(activeClientId: string) {
  const [loading, setLoading] = useState(false)
  const [datasources, setDatasources] = useState<DataSource[]>([])
  const [platforms, setPlatforms] = useState<string[]>([])
  const [dataScopes, setDataScopes] = useState<DataScope[]>([])

  useEffect(() => {
    getDataSources()
      .then((ds) => setDatasources(ds))
      .catch(() => setDatasources([]))
  }, [])

  // 平台变更后，为每个平台初始化一个数据范围条目
  useEffect(() => {
    setDataScopes((prev) => {
      const map = new Map(prev.map((d) => [d.platform, d]))
      platforms.forEach((p) => {
        if (!map.has(p)) {
          map.set(p, { platform: p, sourceType: 'system' })
        }
      })
      // 移除已不在选择中的平台
      Array.from(map.keys()).forEach((k) => {
        if (!platforms.includes(k)) map.delete(k)
      })
      return Array.from(map.values())
    })
  }, [platforms])

  const systemDatasetsOptions = useMemo(
    () => datasources.map((d) => ({ value: d.id, label: `${d.name}（${d.category}）` })),
    [datasources],
  )

  const setScopeType = (platform: string, type: DataSourceType) => {
    // 微信、支付宝只能选择系统数据集
    const forcedType: DataSourceType = ['微信', '支付宝'].includes(platform) ? 'system' : type
    setDataScopes((prev) => prev.map((d) => (d.platform === platform ? { ...d, sourceType: forcedType } : d)))
  }
  const setScopeDataset = (platform: string, datasetId?: string) => {
    setDataScopes((prev) => prev.map((d) => (d.platform === platform ? { ...d, datasetId } : d)))
  }
  const setScopeFile = (platform: string, file?: { name: string; size: number }) => {
    setDataScopes((prev) => prev.map((d) => (d.platform === platform ? { ...d, fileName: file?.name, fileSize: file?.size } : d)))
  }
  const setScopeSystemSelection = (platform: string, sel?: { projectIds: string[]; batchIds: string[] }) => {
    setDataScopes((prev) => prev.map((d) => (d.platform === platform ? { ...d, systemSelection: sel } : d)))
  }

  const createId = () => {
    const now = new Date()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const seq = Math.floor(Math.random() * 900 + 100)
    return `A-${now.getFullYear()}${month}-${seq}`
  }

  const submit = async (payload: Omit<ActivityCreatePayload, 'status'> & { status?: ActivityStatus }, publish?: boolean) => {
    if (!activeClientId) {
      message.error('未选择客户，无法创建活动')
      return
    }
    setLoading(true)
    try {
      const now = new Date()
      const id = createId()
      const item: ActivityItem = {
        id,
        clientId: activeClientId,
        name: payload.name,
        status: publish ? '进行中' : (payload.status ?? '草稿'),
        startTime: payload.startTime,
        endTime: payload.endTime,
        platforms: payload.platforms,
        batchSummary: payload.platforms.map((p) => ({ platform: p, count: 0 })),
        createdBy: '系统演示',
        createdAt: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:00`,
      }
      await ActivityService.createActivity(item)
      if (publish) await ActivityService.publishActivity(id)
      message.success(publish ? '保存并发布成功（模拟）' : '保存成功（模拟）')
      return id
    } catch (e: any) {
      message.error(`创建失败：${e.message}`)
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    datasources,
    systemDatasetsOptions,
    platforms,
    setPlatforms,
    dataScopes,
    setScopeType,
    setScopeDataset,
    setScopeFile,
    setScopeSystemSelection,
    submit,
  }
}