import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Tabs,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  DatePicker,
  Form,
  Input,
  Select,
  Upload,
  Modal,
  message,
  InputNumber,
  Descriptions,
  Popconfirm,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  PlusOutlined,
  FileTextOutlined,
  AlertOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  UploadOutlined,
  CheckOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { useParams } from 'react-router-dom'
import dayjs from 'dayjs'
import styles from './instant-retail-config-page.module.css'
import {
  resolveInstantRetailActivityNature,
  type ActivityScheme,
  type PlatformCrawledScheme,
  type InstantRetailPlatform,
  type InstantRetailActivityNature,
  type PriceMonitoringTask,
  type PriceMonitoringSource,
  type PriceMonitoringFrequency,
  type ActivityItem,
  type ActivityDetailInfo,
} from '../../../../types/instant-retail'
import type { Contact } from '../../../../types/client'
import { InstantRetailService } from '../../../../services/instant-retail-service'
import { ClientActivityService } from '../../../../services/client-activity-service'
import type {
  InstantRetailMechanismMapping,
  InstantRetailMechanismMappingUpsertInput,
} from '../../../../types/instant-retail-mechanism'
import { InstantRetailMechanismService } from '../../../../services/instant-retail-mechanism-service'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { MonthPicker } = DatePicker

const platforms: InstantRetailPlatform[] = ['美团闪购', '淘宝闪购', '京东到家', '多点']
const sourceOptions: PriceMonitoringSource[] = ['RPA自动采集', '人工截图上传分析']
const frequencyOptions: PriceMonitoringFrequency[] = ['每日', '每周', '每两周', '每月']

export default function InstantRetailConfigPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('scheme')
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format('YYYY-MM'))
  const [selectedActivityPlatform, setSelectedActivityPlatform] = useState<InstantRetailPlatform | '全部'>('全部')
  const [selectedActivityMonth, setSelectedActivityMonth] = useState(dayjs().format('YYYY-MM'))
  const [contacts, setContacts] = useState<Contact[]>([])

  // 方案相关状态
  const [schemes, setSchemes] = useState<ActivityScheme[]>([])
  const [platformSchemes, setPlatformSchemes] = useState<PlatformCrawledScheme[]>([])
  const [schemeModalOpen, setSchemeModalOpen] = useState(false)
  const [schemeModalTab, setSchemeModalTab] = useState<'platform' | 'create'>('platform')
  const [selectedSchemePlatform, setSelectedSchemePlatform] = useState<InstantRetailPlatform | '全部'>('全部')
  const [selectedPlatform, setSelectedPlatform] = useState<InstantRetailPlatform>('美团闪购')
  const [schemeLoading, setSchemeLoading] = useState(false)
  const [schemeForm] = Form.useForm()

  // 活动明细相关状态
  const [activityItems, setActivityItems] = useState<ActivityItem[]>([])
  const [activityDetailModalOpen, setActivityDetailModalOpen] = useState(false)
  const [viewingActivity, setViewingActivity] = useState<ActivityDetailInfo | null>(null)

  // 监测任务相关状态
  const [monitoringTasks, setMonitoringTasks] = useState<PriceMonitoringTask[]>([])
  const [selectedMonitoringPlatforms, setSelectedMonitoringPlatforms] = useState<InstantRetailPlatform[]>([])
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [taskForm] = Form.useForm()
  const [viewingTask, setViewingTask] = useState<PriceMonitoringTask | null>(null)

  // 机制管理相关状态（用于维护“自定义机制名称”映射）
  const [mechanismMappings, setMechanismMappings] = useState<InstantRetailMechanismMapping[]>([])
  const [mechanismFilterForm] = Form.useForm()
  const mechanismFilterValues = Form.useWatch([], mechanismFilterForm)
  const [mechanismSourceItems, setMechanismSourceItems] = useState<ActivityItem[]>([])

  useEffect(() => {
    if (!clientId) return
    loadContacts()
    loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId, selectedMonth, activeTab, selectedActivityPlatform, selectedActivityMonth, selectedSchemePlatform, selectedMonitoringPlatforms])

  const loadContacts = async () => {
    if (!clientId) return
    try {
      const contactList = await ClientActivityService.getClientContacts(clientId)
      setContacts(contactList)
    } catch (error) {
      console.error('加载联系人失败:', error)
    }
  }

  const loadData = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      switch (activeTab) {
        case 'scheme':
          await loadSchemes()
          break
        case 'activity':
          await Promise.all([loadActivityItems(), loadMechanismMappings()])
          break
        case 'monitoring':
          await loadMonitoringTasks()
          break
        case 'mechanism':
          await Promise.all([loadMechanismMappings(), loadMechanismSourceItems()])
          break
      }
    } catch (error: unknown) {
      const err = error as Error
      message.error(`加载数据失败：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadSchemes = async () => {
    if (!clientId) return
    try {
      // 如果选择了"全部"，需要获取所有平台的方案
      if (selectedSchemePlatform === '全部') {
        const allSchemes: ActivityScheme[] = []
        for (const platform of platforms) {
          try {
            const platformSchemes = await InstantRetailService.getActivitySchemes(
              clientId,
              platform,
              selectedMonth,
            )
            allSchemes.push(...platformSchemes)
          } catch (error) {
            console.warn(`加载${platform}方案失败:`, error)
          }
        }
        setSchemes(allSchemes)
      } else {
        const schemeList = await InstantRetailService.getActivitySchemes(
          clientId,
          selectedSchemePlatform,
          selectedMonth,
        )
        setSchemes(schemeList)
      }
    } catch (error: unknown) {
      const err = error as Error
      message.error(`加载方案失败：${err.message}`)
    }
  }

  const loadPlatformSchemes = async () => {
    if (!clientId) return
    setSchemeLoading(true)
    try {
      const schemes = await InstantRetailService.getPlatformCrawledSchemes(
        selectedPlatform,
        selectedMonth,
      )
      setPlatformSchemes(schemes)
    } catch (error: unknown) {
      const err = error as Error
      message.error(`加载平台方案失败：${err.message}`)
    } finally {
      setSchemeLoading(false)
    }
  }

  const loadActivityItems = async () => {
    if (!clientId) return
    try {
      const items = await InstantRetailService.getActivityItems(
        clientId,
        selectedActivityPlatform === '全部' ? undefined : selectedActivityPlatform,
      )
      // 按月份过滤活动明细
      const filteredItems = items.filter((item) => {
        const activityMonth = item.startDate.substring(0, 7) // YYYY-MM
        return activityMonth === selectedActivityMonth
      })
      setActivityItems(filteredItems)
    } catch (error: unknown) {
      const err = error as Error
      message.error(`加载活动明细失败：${err.message}`)
    }
  }

  const loadMonitoringTasks = async () => {
    if (!clientId) return
    try {
      const tasks = await InstantRetailService.getPriceMonitoringTasks(clientId)
      // 按平台过滤监测任务
      let filteredTasks = tasks
      if (selectedMonitoringPlatforms.length > 0) {
        filteredTasks = tasks.filter((task) => {
          return task.platforms.some((platform) => selectedMonitoringPlatforms.includes(platform))
        })
      }
      setMonitoringTasks(filteredTasks)
    } catch (error: unknown) {
      const err = error as Error
      message.error(`加载监测任务失败：${err.message}`)
    }
  }

  const loadMechanismMappings = async () => {
    if (!clientId) return
    try {
      const list = await InstantRetailMechanismService.list(clientId)
      setMechanismMappings(list)
    } catch (error: unknown) {
      const err = error as Error
      message.error(`加载机制管理数据失败：${err.message}`)
    }
  }

  const loadMechanismSourceItems = async () => {
    if (!clientId) return
    try {
      // 机制管理默认加载“平台侧机制明细”（基于活动明细派生）
      const items = await InstantRetailService.getActivityItems(clientId)
      setMechanismSourceItems(items)
    } catch (error: unknown) {
      const err = error as Error
      message.error(`加载平台机制明细失败：${err.message}`)
    }
  }

  const platformMechanismRows = useMemo(() => {
    const map = new Map<string, InstantRetailMechanismMapping>()
    mechanismSourceItems.forEach((item) => {
      if (!item.mechanismName) return
      const activityNature = resolveInstantRetailActivityNature(item.platform, item.activityNature)
      const input: InstantRetailMechanismMappingUpsertInput = {
        platform: item.platform,
        schemeName: item.schemeName,
        activityName: item.activityName,
        startDate: item.startDate,
        endDate: item.endDate,
        mechanismName: item.mechanismName,
        activityNature,
        customMechanismName: '',
      }
      const sourceKey = InstantRetailMechanismService.buildSourceKey(input)
      if (map.has(sourceKey)) return
      map.set(sourceKey, {
        id: `MECHMAP-${sourceKey}`, // 展示用，占位（真正保存时会使用 service 内的稳定 id）
        sourceKey,
        platform: input.platform,
        activityNature,
        schemeName: input.schemeName?.trim() || undefined,
        activityName: input.activityName?.trim() || undefined,
        startDate: input.startDate,
        endDate: input.endDate,
        mechanismName: input.mechanismName,
        customMechanismName: '',
        createdAt: '',
        updatedAt: '',
      })
    })
    return Array.from(map.values())
  }, [mechanismSourceItems])

  const mergedMechanismRows = useMemo(() => {
    const savedMap = new Map<string, InstantRetailMechanismMapping>()
    mechanismMappings.forEach((m) => savedMap.set(m.sourceKey, m))
    return platformMechanismRows.map((row) => {
      const saved = savedMap.get(row.sourceKey)
      if (!saved) return row
      return {
        ...row,
        id: saved.id,
        activityNature: saved.activityNature ?? row.activityNature,
        customMechanismName: saved.customMechanismName,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      }
    })
  }, [platformMechanismRows, mechanismMappings])

  const handlePersistCustomMechanismName = async (
    record: InstantRetailMechanismMapping,
    raw: string,
  ) => {
    if (!clientId) return
    const nextCustom = raw.trim()
    if (nextCustom === (record.customMechanismName ?? '').trim()) return
    try {
      await InstantRetailMechanismService.upsert(clientId, {
        id: record.createdAt ? record.id : undefined,
        sourceKey: record.sourceKey,
        platform: record.platform,
        activityNature: record.activityNature,
        schemeName: record.schemeName,
        activityName: record.activityName,
        startDate: record.startDate,
        endDate: record.endDate,
        mechanismName: record.mechanismName,
        customMechanismName: nextCustom,
      })
      message.success('自定义机制名称已保存')
      await loadMechanismMappings()
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : '保存失败'
      message.error(`保存失败：${msg}`)
    }
  }

  const filteredMechanismMappings = useMemo(() => {
    const values = (mechanismFilterValues ?? {}) as Record<string, unknown>
    const platform = values.platform as InstantRetailPlatform | '全部' | undefined
    const schemeName = (values.schemeName as string | undefined)?.trim()
    const activityName = (values.activityName as string | undefined)?.trim()
    const mechanismName = (values.mechanismName as string | undefined)?.trim()
    const customMechanismName = (values.customMechanismName as string | undefined)?.trim()
    const activityNature = values.activityNature as InstantRetailActivityNature | '全部' | undefined
    const timeRange = values.timeRange as [dayjs.Dayjs, dayjs.Dayjs] | undefined

    const rangeStart = timeRange?.[0]?.format('YYYY-MM-DD')
    const rangeEnd = timeRange?.[1]?.format('YYYY-MM-DD')

    return mergedMechanismRows.filter((item) => {
      if (platform && platform !== '全部' && item.platform !== platform) return false
      if (activityNature && activityNature !== '全部' && item.activityNature !== activityNature) return false
      if (schemeName && !(item.schemeName ?? '').includes(schemeName)) return false
      if (activityName && !(item.activityName ?? '').includes(activityName)) return false
      if (mechanismName && !item.mechanismName.includes(mechanismName)) return false
      if (customMechanismName && !item.customMechanismName.includes(customMechanismName)) return false
      if (rangeStart && item.startDate < rangeStart) return false
      if (rangeEnd && item.endDate > rangeEnd) return false
      return true
    })
  }, [mergedMechanismRows, mechanismFilterValues])

  const getCustomMechanismNameForActivity = (activity: ActivityDetailInfo): string | undefined => {
    if (!activity.mechanismName) return undefined
    const activityNature = resolveInstantRetailActivityNature(activity.platform, activity.activityNature)
    const hit = mechanismMappings.find((m) => {
      if (m.platform !== activity.platform) return false
      if (m.activityNature !== activityNature) return false
      if (m.startDate !== activity.startDate || m.endDate !== activity.endDate) return false
      if (m.mechanismName !== activity.mechanismName) return false
      if (m.schemeName && (activity.schemeName || '') !== m.schemeName) return false
      if (m.activityName && activity.activityName !== m.activityName) return false
      return true
    })
    const custom = hit?.customMechanismName
    return custom ? custom : undefined
  }

  const handleExportMechanismCsv = async () => {
    const header = [
      '平台',
      '活动性质',
      '方案名称',
      '活动名称',
      '活动开始日期',
      '活动结束日期',
      '机制名称',
      '自定义机制名称',
      'sourceKey',
    ]
    const escape = (value: string) => {
      const v = value ?? ''
      if (/[",\n]/.test(v)) return `"${v.replaceAll('"', '""')}"`
      return v
    }
    const lines = filteredMechanismMappings.map((r) =>
      [
        r.platform,
        r.activityNature,
        r.schemeName ?? '',
        r.activityName ?? '',
        r.startDate,
        r.endDate,
        r.mechanismName,
        r.customMechanismName ?? '',
        r.sourceKey,
      ]
        .map(escape)
        .join(','),
    )
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `机制管理-即时零售-${clientId}-${dayjs().format('YYYYMMDDHHmmss')}.csv`
    document.body.appendChild(a)
    a.click()
    a.remove()
    URL.revokeObjectURL(url)
    message.success('已导出CSV')
  }

  const parseCsv = (text: string) => {
    const rows: string[][] = []
    let row: string[] = []
    let current = ''
    let inQuotes = false
    for (let i = 0; i < text.length; i += 1) {
      const char = text[i]
      const next = text[i + 1]
      if (inQuotes) {
        if (char === '"' && next === '"') {
          current += '"'
          i += 1
        } else if (char === '"') {
          inQuotes = false
        } else {
          current += char
        }
        continue
      }
      if (char === '"') {
        inQuotes = true
        continue
      }
      if (char === ',') {
        row.push(current)
        current = ''
        continue
      }
      if (char === '\n') {
        row.push(current)
        current = ''
        if (row.some((c) => c.trim() !== '')) rows.push(row)
        row = []
        continue
      }
      if (char === '\r') continue
      current += char
    }
    row.push(current)
    if (row.some((c) => c.trim() !== '')) rows.push(row)
    return rows
  }

  const handleImportMechanismCsvText = async (text: string) => {
    if (!clientId) return
    const rows = parseCsv(text)
    if (rows.length < 2) {
      message.warning('CSV内容为空或格式不正确')
      return
    }
    const header = rows[0].map((h) => h.trim())
    const idx = (name: string) => header.findIndex((h) => h === name)
    const idxPlatform = idx('平台')
    const idxActivityNature = idx('活动性质')
    const idxScheme = idx('方案名称')
    const idxActivity = idx('活动名称')
    const idxStart = idx('活动开始日期')
    const idxEnd = idx('活动结束日期')
    const idxMechanism = idx('机制名称')
    const idxCustom = idx('自定义机制名称')

    const required = [idxPlatform, idxStart, idxEnd, idxMechanism]
    if (required.some((i) => i < 0)) {
      message.error('CSV表头不匹配，请使用“导出CSV”生成的模板再导入')
      return
    }

    const inputs: InstantRetailMechanismMappingUpsertInput[] = []
    for (let i = 1; i < rows.length; i += 1) {
      const r = rows[i]
      const platform = (r[idxPlatform] ?? '').trim() as InstantRetailPlatform
      const startDate = (r[idxStart] ?? '').trim()
      const endDate = (r[idxEnd] ?? '').trim()
      const mechanismName = (r[idxMechanism] ?? '').trim()
      const schemeName = idxScheme >= 0 ? (r[idxScheme] ?? '').trim() : ''
      const activityName = idxActivity >= 0 ? (r[idxActivity] ?? '').trim() : ''
      const customMechanismName = idxCustom >= 0 ? (r[idxCustom] ?? '').trim() : ''
      const activityNatureRaw = idxActivityNature >= 0 ? (r[idxActivityNature] ?? '').trim() : ''

      if (!platform || !startDate || !endDate || !mechanismName) continue

      inputs.push({
        platform,
        schemeName: schemeName || undefined,
        activityName: activityName || undefined,
        startDate,
        endDate,
        mechanismName,
        activityNature:
          activityNatureRaw === '平台活动' || activityNatureRaw === '品牌活动'
            ? activityNatureRaw
            : undefined,
        customMechanismName,
      })
    }

    if (inputs.length === 0) {
      message.warning('未解析到可导入的数据行')
      return
    }

    const result = await InstantRetailMechanismService.upsertMany(clientId, inputs)
    message.success(`导入完成：${result.saved}/${result.total}`)
    await loadMechanismMappings()
  }

  const handleOpenSchemeModal = async () => {
    if (!clientId) return
    setSchemeModalOpen(true)
    setSchemeModalTab('platform')
    await loadPlatformSchemes()
  }

  const handlePublishScheme = async (schemeId: string) => {
    if (!clientId) return
    try {
      await InstantRetailService.publishActivityScheme(clientId, schemeId)
      message.success('方案发布成功')
      await loadSchemes()
    } catch (error: unknown) {
      const err = error as Error
      message.error(`发布失败：${err.message}`)
    }
  }

  const handleCreateScheme = async () => {
    if (!clientId) return
    try {
      const values = await schemeForm.validateFields()
      const schemeData = {
        platform: selectedPlatform,
        activityName: values.activityName,
        startDate: values.timeRange[0].format('YYYY-MM-DD'),
        endDate: values.timeRange[1].format('YYYY-MM-DD'),
        description: values.description,
        mechanisms: values.mechanisms || [],
      }
      await InstantRetailService.importActivityScheme(clientId, schemeData)
      message.success('方案创建成功')
      schemeForm.resetFields()
      await loadSchemes()
    } catch (error: unknown) {
      const err = error as { errorFields?: unknown }
      if (err?.errorFields) return
      const errorMessage = error instanceof Error ? error.message : '创建失败'
      message.error(`创建失败：${errorMessage}`)
    }
  }

  const handleSelectPlatformScheme = async (scheme: PlatformCrawledScheme) => {
    if (!clientId) return
    try {
      // 将平台爬取方案导入为待发布方案
      const schemeData = {
        platform: scheme.platform,
        activityName: scheme.activityName,
        startDate: scheme.startDate,
        endDate: scheme.endDate,
        description: scheme.description,
        mechanisms: scheme.mechanisms,
      }
      await InstantRetailService.importActivityScheme(clientId, schemeData)
      message.success('方案已选择，请发布后客户端可见')
      await loadSchemes()
    } catch (error: unknown) {
      const err = error as Error
      message.error(`选择方案失败：${err.message}`)
    }
  }

  const handleDeleteScheme = async (schemeId: string) => {
    if (!clientId) return
    try {
      await InstantRetailService.deleteActivityScheme(clientId, schemeId)
      message.success('删除成功')
      await loadSchemes()
    } catch (error: unknown) {
      const err = error as Error
      message.error(`删除失败：${err.message}`)
    }
  }

  const handleViewActivityDetail = async (activityId: string) => {
    if (!clientId) return
    try {
      const detail = await InstantRetailService.getActivityDetail(clientId, activityId)
      setViewingActivity(detail)
      setActivityDetailModalOpen(true)
    } catch (error: unknown) {
      const err = error as Error
      message.error(`获取活动详情失败：${err.message}`)
    }
  }

  const handleOfflineActivity = async (activityId: string) => {
    if (!clientId) return
    try {
      await InstantRetailService.offlineActivity(clientId, activityId)
      message.success('活动已下架')
      await loadActivityItems()
    } catch (error: unknown) {
      const err = error as Error
      message.error(`下架失败：${err.message}`)
    }
  }

  const handleCreateTask = () => {
    taskForm.resetFields()
    setViewingTask(null)
    setTaskModalOpen(true)
  }

  const handleEditTask = (task: PriceMonitoringTask) => {
    taskForm.setFieldsValue({
      ...task,
      timeRange: [dayjs(task.startDate), dayjs(task.endDate)],
    })
    setViewingTask(task)
    setTaskModalOpen(true)
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!clientId) return
    try {
      await InstantRetailService.deletePriceMonitoringTask(clientId, taskId)
      message.success('删除成功')
      loadMonitoringTasks()
    } catch (error: unknown) {
      const err = error as Error
      message.error(`删除失败：${err.message}`)
    }
  }

  const handleTaskSubmit = async () => {
    if (!clientId) return
    try {
      const values = await taskForm.validateFields()
      const taskData = {
        name: values.name,
        startDate: values.timeRange[0].format('YYYY-MM-DD'),
        endDate: values.timeRange[1].format('YYYY-MM-DD'),
        source: values.source,
        platforms: values.platforms,
        frequency: values.frequency,
        referencePrice: values.referencePrice,
        notificationReceivers: values.notificationReceivers,
      }

      if (viewingTask) {
        await InstantRetailService.updatePriceMonitoringTask(clientId, viewingTask.id, taskData)
        message.success('更新成功')
      } else {
        await InstantRetailService.createPriceMonitoringTask(clientId, taskData)
        message.success('创建成功')
      }
      setTaskModalOpen(false)
      loadMonitoringTasks()
    } catch (error: unknown) {
      const err = error as { errorFields?: unknown }
      if (err?.errorFields) return
      const errorMessage = error instanceof Error ? error.message : '操作失败'
      message.error(`操作失败：${errorMessage}`)
    }
  }

  useEffect(() => {
    if (schemeModalOpen && selectedPlatform) {
      loadPlatformSchemes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlatform, selectedMonth, schemeModalOpen])

  // 方案表格列
  const schemeColumns: ColumnsType<ActivityScheme> = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: InstantRetailPlatform) => <Tag color="blue">{platform}</Tag>,
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
      width: 200,
    },
    {
      title: '活动时间',
      key: 'period',
      width: 220,
      render: (_, record) => (
        <div>
          {record.startDate} ~ {record.endDate}
        </div>
      ),
    },
    {
      title: '来源',
      dataIndex: 'source',
      key: 'source',
      width: 120,
      render: (source: string) => (
        <Tag color={source === '平台爬取' ? 'cyan' : 'green'}>{source}</Tag>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          已发布: 'success',
          待发布: 'warning',
          已过期: 'default',
        }
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          {record.status === '待发布' && (
            <Button
              type="link"
              size="small"
              onClick={() => handlePublishScheme(record.id)}
            >
              发布
            </Button>
          )}
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个方案吗？',
                onOk: () => handleDeleteScheme(record.id),
              })
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  // 活动明细表格列
  const activityColumns: ColumnsType<ActivityItem> = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: InstantRetailPlatform) => <Tag color="blue">{platform}</Tag>,
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
      width: 200,
    },
    {
      title: '方案名称',
      dataIndex: 'schemeName',
      key: 'schemeName',
      width: 180,
      render: (name: string) => name || <Text type="secondary">—</Text>,
    },
    {
      title: '活动时间',
      key: 'period',
      width: 220,
      render: (_, record) => (
        <div>
          {record.startDate} ~ {record.endDate}
        </div>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          进行中: 'processing',
          已结束: 'success',
          已下架: 'default',
        }
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>
      },
    },
    {
      title: '订单数',
      dataIndex: 'orderCount',
      key: 'orderCount',
      width: 100,
      render: (count: number) => (count ? count.toLocaleString() : <Text type="secondary">—</Text>),
    },
    {
      title: '交易金额',
      dataIndex: 'totalAmount',
      key: 'totalAmount',
      width: 120,
      render: (amount: number) =>
        amount ? `¥${(amount / 10000).toFixed(1)}万` : <Text type="secondary">—</Text>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewActivityDetail(record.id)}
          >
            查看
          </Button>
          {record.status === '进行中' && (
            <Popconfirm
              title="确认下架"
              description="下架后，该活动数据将不计入客户端看板统计范围，确定要下架吗？"
              onConfirm={() => handleOfflineActivity(record.id)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small" danger icon={<StopOutlined />}>
                下架
              </Button>
            </Popconfirm>
          )}
        </Space>
      ),
    },
  ]

  // 监测任务表格列
  const monitoringColumns: ColumnsType<PriceMonitoringTask> = [
    {
      title: '任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '监测时间',
      key: 'period',
      width: 220,
      render: (_, record) => (
        <div>
          {record.startDate} ~ {record.endDate}
        </div>
      ),
    },
    {
      title: '数据来源',
      dataIndex: 'source',
      key: 'source',
      width: 150,
      render: (source: PriceMonitoringSource) => (
        <Tag color={source === 'RPA自动采集' ? 'blue' : 'cyan'}>{source}</Tag>
      ),
    },
    {
      title: '监测平台',
      dataIndex: 'platforms',
      key: 'platforms',
      width: 200,
      render: (platforms: InstantRetailPlatform[]) => (
        <Space size={[4, 4]} wrap>
          {platforms.map((p) => (
            <Tag key={p} color="blue">
              {p}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '监测频次',
      dataIndex: 'frequency',
      key: 'frequency',
      width: 100,
    },
    {
      title: '参考价格',
      dataIndex: 'referencePrice',
      key: 'referencePrice',
      width: 120,
      render: (price: number) => <Text>¥{price.toFixed(2)}</Text>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          进行中: 'processing',
          已暂停: 'warning',
          已结束: 'default',
        }
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>
      },
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditTask(record)}>
            编辑
          </Button>
          <Button
            type="link"
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => {
              Modal.confirm({
                title: '确认删除',
                content: '确定要删除这个破价监测任务吗？',
                onOk: () => handleDeleteTask(record.id),
              })
            }}
          >
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const mechanismColumns: ColumnsType<InstantRetailMechanismMapping> = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: InstantRetailPlatform) => <Tag color="blue">{platform}</Tag>,
    },
    {
      title: '活动性质',
      dataIndex: 'activityNature',
      key: 'activityNature',
      width: 110,
      render: (n: InstantRetailActivityNature) => (
        <Tag color={n === '平台活动' ? 'magenta' : 'default'}>{n}</Tag>
      ),
    },
    {
      title: '方案名称',
      dataIndex: 'schemeName',
      key: 'schemeName',
      width: 180,
      render: (name: string) => name || <Text type="secondary">—</Text>,
    },
    {
      title: '活动名称',
      dataIndex: 'activityName',
      key: 'activityName',
      width: 220,
      render: (name: string) => name || <Text type="secondary">—</Text>,
    },
    {
      title: '活动时间',
      key: 'period',
      width: 220,
      render: (_, record) => (
        <div>
          {record.startDate} ~ {record.endDate}
        </div>
      ),
    },
    {
      title: '机制名称',
      dataIndex: 'mechanismName',
      key: 'mechanismName',
      width: 180,
    },
    {
      title: '自定义机制名称',
      key: 'customMechanismName',
      width: 280,
      render: (_, record) => (
        <Input
          key={`${record.sourceKey}-${record.customMechanismName}`}
          defaultValue={record.customMechanismName}
          placeholder="编辑后失焦或回车保存"
          allowClear
          onBlur={(e) => {
            void handlePersistCustomMechanismName(record, e.target.value)
          }}
          onPressEnter={(e) => {
            ;(e.target as HTMLInputElement).blur()
          }}
        />
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <Card className={styles.card}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'scheme',
              label: (
                <Space>
                  <FileTextOutlined />
                  <span>方案</span>
                </Space>
              ),
              children: (
                <div>
                  <div className={styles.tabDescription} style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      支持运营人员从爬取回来的方案中选择方案发布（发布后，客户端可见），也可以新建方案，配置方案基础信息手动创建后发布
                    </Text>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Select
                        value={selectedSchemePlatform}
                        onChange={(value) => setSelectedSchemePlatform(value)}
                        style={{ width: 150 }}
                        options={[
                          { label: '全部平台', value: '全部' },
                          ...platforms.map((p) => ({ label: p, value: p })),
                        ]}
                      />
                      <MonthPicker
                        value={dayjs(selectedMonth)}
                        onChange={(date) => {
                          if (date) {
                            setSelectedMonth(date.format('YYYY-MM'))
                          }
                        }}
                        format="YYYY-MM"
                        placeholder="选择月份"
                      />
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenSchemeModal}>
                        管理方案
                      </Button>
                    </Space>
                  </div>
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={schemeColumns}
                    dataSource={schemes}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1000 }}
                  />
                </div>
              ),
            },
            {
              key: 'activity',
              label: (
                <Space>
                  <FileTextOutlined />
                  <span>活动明细</span>
                </Space>
              ),
              children: (
                <div>
                  <div className={styles.tabDescription} style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      按平台查看不同平台下当前客户真实在进行的活动，列表分页展示活动的基础信息，点击活动可查看活动详情，活动可以下架，下架后的活动，对应数据不计入客户端看板的数据统计范围
                    </Text>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Select
                        value={selectedActivityPlatform}
                        onChange={(value) => setSelectedActivityPlatform(value)}
                        style={{ width: 150 }}
                        options={[
                          { label: '全部平台', value: '全部' },
                          ...platforms.map((p) => ({ label: p, value: p })),
                        ]}
                      />
                      <MonthPicker
                        value={dayjs(selectedActivityMonth)}
                        onChange={(date) => {
                          if (date) {
                            setSelectedActivityMonth(date.format('YYYY-MM'))
                          }
                        }}
                        format="YYYY-MM"
                        placeholder="选择月份"
                      />
                    </Space>
                  </div>
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={activityColumns}
                    dataSource={activityItems}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1200 }}
                  />
                </div>
              ),
            },
            {
              key: 'monitoring',
              label: (
                <Space>
                  <AlertOutlined />
                  <span>监测任务</span>
                </Space>
              ),
              children: (
                <div>
                  <div className={styles.tabDescription} style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      支持运营人员依据客户要求，创建破价监测任务，任务需要设置名称、起止时间、监测数据来源（RPA自动采集与人工截图上传分析）、监测平台、监测频次、监测商品价格参考、破价通知接收人
                    </Text>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <Select
                        mode="multiple"
                        value={selectedMonitoringPlatforms}
                        onChange={(value) => setSelectedMonitoringPlatforms(value)}
                        style={{ width: 300 }}
                        placeholder="选择平台（可多选）"
                        allowClear
                        options={platforms.map((p) => ({ label: p, value: p }))}
                      />
                      <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
                        新建监测任务
                      </Button>
                    </Space>
                  </div>
                  <Table
                    rowKey="id"
                    loading={loading}
                    columns={monitoringColumns}
                    dataSource={monitoringTasks}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1400 }}
                  />
                </div>
              ),
            },
            {
              key: 'mechanism',
              label: (
                <Space>
                  <FileTextOutlined />
                  <span>机制管理</span>
                </Space>
              ),
              children: (
                <div>
                  <div className={styles.tabDescription} style={{ marginBottom: 16 }}>
                    <Text type="secondary">
                      平台机制明细由活动数据自动生成；仅「自定义机制名称」可在表格内编辑（失焦保存），也可导出/导入 CSV 批量维护
                    </Text>
                  </div>
                  <div style={{ marginBottom: 12 }}>
                    <Space size={12} wrap>
                      <Button onClick={() => Promise.all([loadMechanismSourceItems(), loadMechanismMappings()])}>
                        从平台刷新
                      </Button>
                      <Button onClick={handleExportMechanismCsv}>导出CSV</Button>
                      <Upload
                        accept=".csv"
                        showUploadList={false}
                        beforeUpload={async (file) => {
                          try {
                            const text = await file.text()
                            await handleImportMechanismCsvText(text)
                          } catch (error: unknown) {
                            const msg = error instanceof Error ? error.message : '导入失败'
                            message.error(`导入失败：${msg}`)
                          }
                          return false
                        }}
                      >
                        <Button>导入CSV</Button>
                      </Upload>
                    </Space>
                  </div>
                  <Form form={mechanismFilterForm} layout="inline" style={{ marginBottom: 16 }}>
                    <Form.Item name="platform" label="平台" initialValue="全部">
                      <Select
                        style={{ width: 160 }}
                        options={[
                          { label: '全部平台', value: '全部' },
                          ...platforms.map((p) => ({ label: p, value: p })),
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="activityNature" label="活动性质" initialValue="全部">
                      <Select
                        style={{ width: 140 }}
                        options={[
                          { label: '全部', value: '全部' },
                          { label: '平台活动', value: '平台活动' },
                          { label: '品牌活动', value: '品牌活动' },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item name="schemeName" label="方案名称">
                      <Input style={{ width: 160 }} placeholder="可空" allowClear />
                    </Form.Item>
                    <Form.Item name="activityName" label="活动名称">
                      <Input style={{ width: 180 }} placeholder="可空" allowClear />
                    </Form.Item>
                    <Form.Item name="timeRange" label="活动时间">
                      <RangePicker />
                    </Form.Item>
                    <Form.Item name="mechanismName" label="机制名称">
                      <Input style={{ width: 160 }} placeholder="请输入" allowClear />
                    </Form.Item>
                    <Form.Item name="customMechanismName" label="自定义机制名称">
                      <Input style={{ width: 180 }} placeholder="请输入" allowClear />
                    </Form.Item>
                    <Form.Item>
                      <Button onClick={() => mechanismFilterForm.resetFields()}>重置</Button>
                    </Form.Item>
                  </Form>
                  <Table
                    rowKey="sourceKey"
                    loading={loading}
                    columns={mechanismColumns}
                    dataSource={filteredMechanismMappings}
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1420 }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>

      {/* 方案管理弹窗 */}
      <Modal
        title="方案管理"
        open={schemeModalOpen}
        onCancel={() => {
          setSchemeModalOpen(false)
          schemeForm.resetFields()
        }}
        width={1000}
        footer={null}
      >
        <Tabs
          activeKey={schemeModalTab}
          onChange={(key) => setSchemeModalTab(key as 'platform' | 'create')}
          items={[
            {
              key: 'platform',
              label: '平台爬取方案',
              children: (
                <div>
                  <div style={{ marginBottom: 16 }}>
                    <Space>
                      <span>选择平台：</span>
                      <Select
                        value={selectedPlatform}
                        onChange={setSelectedPlatform}
                        style={{ width: 150 }}
                        options={platforms.map((p) => ({ label: p, value: p }))}
                      />
                      <Button onClick={loadPlatformSchemes} loading={schemeLoading}>
                        刷新
                      </Button>
                    </Space>
                  </div>
                  <Table
                    rowKey="id"
                    loading={schemeLoading}
                    columns={[
                      {
                        title: '活动名称',
                        dataIndex: 'activityName',
                        key: 'activityName',
                        width: 200,
                      },
                      {
                        title: '活动时间',
                        key: 'period',
                        width: 220,
                        render: (_, record) => (
                          <div>
                            {record.startDate} ~ {record.endDate}
                          </div>
                        ),
                      },
                      {
                        title: '支持机制',
                        dataIndex: 'mechanisms',
                        key: 'mechanisms',
                        width: 200,
                        render: (mechanisms: string[]) => (
                          <Space size={[4, 4]} wrap>
                            {mechanisms.map((m) => (
                              <Tag key={m} color="blue">
                                {m}
                              </Tag>
                            ))}
                          </Space>
                        ),
                      },
                      {
                        title: '爬取时间',
                        dataIndex: 'crawledAt',
                        key: 'crawledAt',
                        width: 180,
                      },
                      {
                        title: '操作',
                        key: 'actions',
                        width: 120,
                        render: (_, record) => (
                          <Button
                            type="link"
                            size="small"
                            icon={<CheckOutlined />}
                            onClick={() => handleSelectPlatformScheme(record)}
                          >
                            选择
                          </Button>
                        ),
                      },
                    ]}
                    dataSource={platformSchemes}
                    pagination={{ pageSize: 5 }}
                  />
                </div>
              ),
            },
            {
              key: 'create',
              label: '新建方案',
              children: (
                <div>
                  <Form
                    form={schemeForm}
                    layout="vertical"
                    onFinish={handleCreateScheme}
                  >
                    <Form.Item
                      name="platform"
                      label="平台"
                      initialValue={selectedPlatform}
                      rules={[{ required: true, message: '请选择平台' }]}
                    >
                      <Select
                        options={platforms.map((p) => ({ label: p, value: p }))}
                        onChange={setSelectedPlatform}
                      />
                    </Form.Item>
                    <Form.Item
                      name="activityName"
                      label="活动名称"
                      rules={[{ required: true, message: '请输入活动名称' }]}
                    >
                      <Input placeholder="请输入活动名称" />
                    </Form.Item>
                    <Form.Item
                      name="timeRange"
                      label="活动时间"
                      rules={[{ required: true, message: '请选择活动时间范围' }]}
                    >
                      <RangePicker style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="description" label="活动描述">
                      <Input.TextArea rows={3} placeholder="请输入活动描述" />
                    </Form.Item>
                    <Form.Item name="mechanisms" label="支持机制">
                      <Select
                        mode="tags"
                        placeholder="输入机制名称后按回车添加"
                        options={['满减', '折扣', '优惠券', '秒杀'].map((m) => ({
                          label: m,
                          value: m,
                        }))}
                      />
                    </Form.Item>
                    <Form.Item>
                      <Button type="primary" htmlType="submit" icon={<UploadOutlined />}>
                        创建方案
                      </Button>
                    </Form.Item>
                  </Form>
                </div>
              ),
            },
          ]}
        />
      </Modal>

      {/* 活动详情弹窗 */}
      <Modal
        title="活动详情"
        open={activityDetailModalOpen}
        onCancel={() => {
          setActivityDetailModalOpen(false)
          setViewingActivity(null)
        }}
        width={900}
        footer={null}
      >
        {viewingActivity && (
          <div>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="平台">{viewingActivity.platform}</Descriptions.Item>
              <Descriptions.Item label="活动性质">
                {resolveInstantRetailActivityNature(
                  viewingActivity.platform,
                  viewingActivity.activityNature,
                )}
              </Descriptions.Item>
              <Descriptions.Item label="活动名称">{viewingActivity.activityName}</Descriptions.Item>
              <Descriptions.Item label="方案名称">
                {viewingActivity.schemeName || <Text type="secondary">—</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="机制名称">
                {(() => {
                  const custom = getCustomMechanismNameForActivity(viewingActivity)
                  if (custom) {
                    return (
                      <Space direction="vertical" size={0}>
                        <Text strong>{custom}</Text>
                        <Text type="secondary">原：{viewingActivity.mechanismName}</Text>
                      </Space>
                    )
                  }
                  return viewingActivity.mechanismName || <Text type="secondary">—</Text>
                })()}
              </Descriptions.Item>
              <Descriptions.Item label="活动时间">
                {viewingActivity.startDate} ~ {viewingActivity.endDate}
              </Descriptions.Item>
              <Descriptions.Item label="状态">
                <Tag
                  color={
                    viewingActivity.status === '进行中'
                      ? 'processing'
                      : viewingActivity.status === '已结束'
                        ? 'success'
                        : 'default'
                  }
                >
                  {viewingActivity.status}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="预算">
                {viewingActivity.budget ? `¥${viewingActivity.budget.toLocaleString()}` : <Text type="secondary">—</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="已使用">
                {viewingActivity.usedBudget
                  ? `¥${viewingActivity.usedBudget.toLocaleString()}`
                  : <Text type="secondary">—</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="订单数">
                {viewingActivity.orderCount ? viewingActivity.orderCount.toLocaleString() : <Text type="secondary">—</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="交易金额">
                {viewingActivity.totalAmount
                  ? `¥${(viewingActivity.totalAmount / 10000).toFixed(1)}万`
                  : <Text type="secondary">—</Text>}
              </Descriptions.Item>
            </Descriptions>
            {viewingActivity.metrics && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>数据指标</Title>
                <Descriptions column={2} bordered>
                  <Descriptions.Item label="订单量">
                    {viewingActivity.metrics.totalOrders.toLocaleString()}
                  </Descriptions.Item>
                  <Descriptions.Item label="交易金额">
                    ¥{(viewingActivity.metrics.totalAmount / 10000).toFixed(1)}万
                  </Descriptions.Item>
                  <Descriptions.Item label="客单价">
                    ¥{viewingActivity.metrics.avgOrderAmount}
                  </Descriptions.Item>
                  <Descriptions.Item label="转化率">
                    {viewingActivity.metrics.conversionRate}%
                  </Descriptions.Item>
                </Descriptions>
              </div>
            )}
            {viewingActivity.orderData && viewingActivity.orderData.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <Title level={5}>订单明细</Title>
                <Table
                  rowKey="orderId"
                  columns={[
                    { title: '订单号', dataIndex: 'orderId', key: 'orderId', width: 180 },
                    { title: '订单时间', dataIndex: 'orderTime', key: 'orderTime', width: 180 },
                    {
                      title: '金额',
                      dataIndex: 'amount',
                      key: 'amount',
                      width: 120,
                      render: (amount: number) => `¥${amount.toFixed(2)}`,
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 100,
                      render: (status: string) => (
                        <Tag color={status === '已完成' ? 'success' : status === '已取消' ? 'error' : 'warning'}>
                          {status}
                        </Tag>
                      ),
                    },
                  ]}
                  dataSource={viewingActivity.orderData}
                  pagination={{ pageSize: 10 }}
                  size="small"
                />
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 破价监测任务创建/编辑弹窗 */}
      <Modal
        title={viewingTask ? '编辑破价监测任务' : '新建破价监测任务'}
        open={taskModalOpen}
        onOk={handleTaskSubmit}
        onCancel={() => {
          setTaskModalOpen(false)
          taskForm.resetFields()
          setViewingTask(null)
        }}
        width={700}
        okText="保存"
        cancelText="取消"
      >
        <Form
          form={taskForm}
          layout="vertical"
          initialValues={{
            platforms: [],
            notificationReceivers: [],
            frequency: '每日',
          }}
        >
          <Form.Item
            name="name"
            label="任务名称"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入任务名称" />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="监测时间"
            rules={[{ required: true, message: '请选择监测时间范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="source"
            label="监测数据来源"
            rules={[{ required: true, message: '请选择数据来源' }]}
          >
            <Select placeholder="请选择数据来源" options={sourceOptions.map((s) => ({ label: s, value: s }))} />
          </Form.Item>

          <Form.Item
            name="platforms"
            label="监测平台"
            rules={[{ required: true, message: '至少选择一个平台' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择监测平台"
              options={platforms.map((p) => ({ label: p, value: p }))}
            />
          </Form.Item>

          <Form.Item
            name="frequency"
            label="监测频次"
            rules={[{ required: true, message: '请选择监测频次' }]}
          >
            <Select
              placeholder="请选择监测频次"
              options={frequencyOptions.map((f) => ({ label: f, value: f }))}
            />
          </Form.Item>

          <Form.Item
            name="referencePrice"
            label="监测商品价格参考"
            rules={[{ required: true, message: '请输入参考价格' }]}
          >
            <InputNumber
              style={{ width: '100%' }}
              placeholder="请输入参考价格"
              prefix="¥"
              min={0}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            name="notificationReceivers"
            label="破价通知接收人"
            rules={[{ required: true, message: '至少选择一位接收人' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择破价通知接收人"
              options={contacts.map((contact) => ({
                label: `${contact.name}（${contact.position}）`,
                value: contact.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

