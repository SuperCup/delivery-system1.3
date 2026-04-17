import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Button,
  Table,
  Tag,
  Space,
  Select,
  Input,
  Drawer,
  Steps,
  Form,
  DatePicker,
  Collapse,
  Checkbox,
  Divider,
  Empty,
  Popconfirm,
  message,
  Typography,
  Badge,
  Tooltip,
  Upload,
  Spin,
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  PlusOutlined,
  SearchOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  PauseCircleOutlined,
  EyeOutlined,
  StopOutlined,
  PlayCircleOutlined,
  CameraOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { DataWarehouseService } from '../../services/data-warehouse-service'
import type {
  CollectionTask,
  CollectionTaskStatus,
  CollectionPlatformConfig,
  CollectionPlatformPage,
  CollectionConditionDef,
} from '../../types/data-warehouse'
import styles from './collection-task-tab.module.css'

const { Text, Title } = Typography
const { RangePicker } = DatePicker
const { Panel } = Collapse

const STATUS_CONFIG: Partial<Record<CollectionTaskStatus, { color: string; icon: React.ReactNode; label: string }>> = {
  执行中: { color: 'processing', icon: <SyncOutlined spin />, label: '执行中' },
  已完成: { color: 'success', icon: <CheckCircleOutlined />, label: '已完成' },
  已暂停: { color: 'default', icon: <PauseCircleOutlined />, label: '已暂停' },
}

const MY_CLIENTS = [
  { id: 'C-001', name: '达能' },
  { id: 'C-002', name: '伊利' },
  { id: 'C-004', name: '嘉士伯' },
  { id: 'C-006', name: '百威' },
]

// ---- Simulate OCR fill from screenshot ----
function simulateOcrFill(condDefs: CollectionConditionDef[]): Record<string, string> {
  const result: Record<string, string> = {}
  const now = dayjs()
  for (const cond of condDefs) {
    if (cond.type === 'dateRange') {
      const start = now.subtract(1, 'month').startOf('month').format('YYYY-MM-DD')
      const end = now.subtract(1, 'month').endOf('month').format('YYYY-MM-DD')
      result[cond.id] = `${start}~${end}`
    } else if (cond.type === 'select') {
      const opts = (cond.options ?? []).filter((o) => o.value !== '')
      if (opts.length > 0) result[cond.id] = opts[0].value
    } else if (cond.type === 'text') {
      result[cond.id] = `ACT-${Math.floor(Math.random() * 9000) + 1000}`
    }
  }
  return result
}

// ---- Condition Input ----
function ConditionInput({ cond, value, onChange, disabled }: {
  cond: CollectionConditionDef
  value: string
  onChange: (v: string) => void
  disabled?: boolean
}) {
  if (cond.type === 'dateRange') {
    const parsed = value ? value.split('~') : []
    return (
      <RangePicker
        size="small"
        disabled={disabled}
        value={parsed.length === 2 ? [dayjs(parsed[0].trim()), dayjs(parsed[1].trim())] : undefined}
        onChange={(_, strs) => onChange(strs[0] && strs[1] ? `${strs[0]}~${strs[1]}` : '')}
        style={{ width: '100%' }}
      />
    )
  }
  if (cond.type === 'select') {
    return (
      <Select
        size="small"
        disabled={disabled}
        style={{ width: '100%' }}
        value={value || undefined}
        placeholder={`请选择${cond.label}`}
        onChange={onChange}
        options={cond.options}
        allowClear={!cond.required}
      />
    )
  }
  return (
    <Input
      size="small"
      disabled={disabled}
      value={value}
      placeholder={`请输入${cond.label}`}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

// ---- Union conditions from selected modules in a page ----
function getPageUnionConditions(page: CollectionPlatformPage, selectedModuleIds: Set<string>): CollectionConditionDef[] {
  const seen = new Set<string>()
  const result: CollectionConditionDef[] = []
  for (const mod of page.modules) {
    if (!selectedModuleIds.has(mod.id)) continue
    for (const cond of mod.conditions) {
      if (!seen.has(cond.id)) { seen.add(cond.id); result.push(cond) }
    }
  }
  return result
}

// ---- Create Task Drawer ----
interface CreateTaskDrawerProps {
  open: boolean
  onClose: () => void
  onCreated: () => void
  platformConfigs: CollectionPlatformConfig[]
}

function CreateTaskDrawer({ open, onClose, onCreated, platformConfigs }: CreateTaskDrawerProps) {
  const [step, setStep] = useState(0)
  const [form] = Form.useForm()
  const [selectedPlatformId, setSelectedPlatformId] = useState<string>('')
  const [selectedModulesByPage, setSelectedModulesByPage] = useState<Map<string, Set<string>>>(new Map())
  // pageId → array of condition groups
  const [pageCondGroups, setPageCondGroups] = useState<Map<string, Record<string, string>[]>>(new Map())
  // loading key: `${pageId}-${groupIdx}`
  const [ocrLoading, setOcrLoading] = useState<Set<string>>(new Set())
  const [submitting, setSubmitting] = useState(false)

  const selectedConfig = useMemo(
    () => platformConfigs.find((c) => c.platformId === selectedPlatformId),
    [platformConfigs, selectedPlatformId],
  )

  const resetState = useCallback(() => {
    setStep(0)
    form.resetFields()
    setSelectedPlatformId('')
    setSelectedModulesByPage(new Map())
    setPageCondGroups(new Map())
    setOcrLoading(new Set())
  }, [form])

  const handleClose = () => { resetState(); onClose() }

  const handleNextStep = async () => {
    if (step === 0) {
      try { await form.validateFields(); setStep(1) } catch { /* validation failed */ }
      return
    }
    if (step === 1) {
      const hasAny = Array.from(selectedModulesByPage.values()).some((s) => s.size > 0)
      if (!hasAny) { message.warning('请至少选择一个采集模块'); return }
      setStep(2)
    }
  }

  const toggleModule = (pageId: string, moduleId: string) => {
    setSelectedModulesByPage((prev) => {
      const next = new Map(prev)
      const s = new Set(next.get(pageId) ?? [])
      if (s.has(moduleId)) s.delete(moduleId)
      else s.add(moduleId)
      next.set(pageId, s)
      return next
    })
  }

  const togglePageAll = (page: CollectionPlatformPage) => {
    setSelectedModulesByPage((prev) => {
      const next = new Map(prev)
      const cur = next.get(page.id) ?? new Set()
      next.set(page.id, cur.size === page.modules.length ? new Set() : new Set(page.modules.map((m) => m.id)))
      return next
    })
  }

  const getGroups = (pageId: string) => pageCondGroups.get(pageId) ?? [{}]

  const addCondGroup = (pageId: string) => {
    setPageCondGroups((prev) => {
      const next = new Map(prev)
      next.set(pageId, [...getGroups(pageId), {}])
      return next
    })
  }

  const removeCondGroup = (pageId: string, idx: number) => {
    setPageCondGroups((prev) => {
      const next = new Map(prev)
      const arr = [...getGroups(pageId)]
      arr.splice(idx, 1)
      next.set(pageId, arr.length > 0 ? arr : [{}])
      return next
    })
  }

  const updateCondGroup = (pageId: string, idx: number, condId: string, value: string) => {
    setPageCondGroups((prev) => {
      const next = new Map(prev)
      const arr = [...getGroups(pageId)]
      arr[idx] = { ...arr[idx], [condId]: value }
      next.set(pageId, arr)
      return next
    })
  }

  const handleOcrFill = async (pageId: string, idx: number, condDefs: CollectionConditionDef[]) => {
    const key = `${pageId}-${idx}`
    setOcrLoading((prev) => new Set(prev).add(key))
    await new Promise((r) => setTimeout(r, 1500))
    const filled = simulateOcrFill(condDefs)
    setPageCondGroups((prev) => {
      const next = new Map(prev)
      const arr = [...getGroups(pageId)]
      arr[idx] = { ...arr[idx], ...filled }
      next.set(pageId, arr)
      return next
    })
    setOcrLoading((prev) => { const s = new Set(prev); s.delete(key); return s })
    message.success('截图识别完成，条件已自动填充')
  }

  const buildModules = () => {
    if (!selectedConfig) return []
    const result: CollectionTask['modules'] = []
    selectedModulesByPage.forEach((moduleIds, pageId) => {
      if (moduleIds.size === 0) return
      const page = selectedConfig.pages.find((p) => p.id === pageId)
      if (!page) return
      const conditionGroups = getGroups(pageId)
      moduleIds.forEach((moduleId) => {
        const mod = page.modules.find((m) => m.id === moduleId)
        if (!mod) return
        result.push({ pageId, pageName: page.name, moduleId, moduleName: mod.name, conditionGroups })
      })
    })
    return result
  }

  const handleSubmit = async () => {
    const vals = form.getFieldsValue()
    const client = MY_CLIENTS.find((c) => c.id === vals.clientId)
    const config = platformConfigs.find((c) => c.platformId === vals.platformId)
    if (!client || !config) return
    setSubmitting(true)
    try {
      await DataWarehouseService.createCollectionTask({
        name: vals.name || `${config.platformName}-${client.name}-${vals.period[0].format('YYYYMM')}`,
        platformId: vals.platformId, platformName: config.platformName,
        clientId: vals.clientId, clientName: client.name,
        period: [vals.period[0].format('YYYY-MM-DD'), vals.period[1].format('YYYY-MM-DD')],
        modules: buildModules(),
        createdBy: '当前用户',
        remark: vals.remark,
      })
      message.success('任务已提交，等待数据组复核')
      handleClose()
      onCreated()
    } finally {
      setSubmitting(false)
    }
  }

  const selectedTotal = Array.from(selectedModulesByPage.values()).reduce((s, v) => s + v.size, 0)

  return (
    <Drawer
      title="新建采集任务"
      width={960}
      open={open}
      onClose={handleClose}
      destroyOnClose
      footer={
        <div className={styles.drawerFooter}>
          {step > 0 && <Button onClick={() => setStep((s) => s - 1)}>上一步</Button>}
          <div style={{ flex: 1 }} />
          {step < 2
            ? <Button type="primary" onClick={handleNextStep}>下一步</Button>
            : <Button type="primary" loading={submitting} onClick={handleSubmit}>提交审核</Button>
          }
        </div>
      }
    >
      <Steps size="small" current={step} className={styles.createSteps}
        items={[{ title: '基本信息' }, { title: '选择模块' }, { title: '确认提交' }]}
      />

      {/* Step 1: Basic Info */}
      {step === 0 && (
        <Form form={form} layout="vertical" className={styles.stepForm}>
          <Form.Item name="name" label="任务名称" extra="不填写则自动生成">
            <Input placeholder="例：达能美团闪购11月经营数据（可留空自动生成）" />
          </Form.Item>
          <Form.Item name="platformId" label="目标平台" rules={[{ required: true, message: '请选择平台' }]}>
            <Select
              placeholder="请选择平台"
              options={platformConfigs.map((c) => ({ label: c.platformName, value: c.platformId }))}
              onChange={(v) => {
                setSelectedPlatformId(v)
                setSelectedModulesByPage(new Map())
                setPageCondGroups(new Map())
              }}
            />
          </Form.Item>
          <Form.Item name="clientId" label="客户 / 品牌" rules={[{ required: true, message: '请选择客户' }]}>
            <Select placeholder="请选择客户" options={MY_CLIENTS.map((c) => ({ label: c.name, value: c.id }))} />
          </Form.Item>
          <Form.Item name="period" label="采集周期" rules={[{ required: true, message: '请选择采集周期' }]}>
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="remark" label="备注">
            <Input.TextArea rows={3} placeholder="可填写任务背景或特殊要求" />
          </Form.Item>
        </Form>
      )}

      {/* Step 2: Module Selection */}
      {step === 1 && (
        <div className={styles.moduleStep}>
          <div className={styles.moduleStepHint}>
            <Text type="secondary">
              已选 <Text strong>{selectedTotal}</Text> 个模块 · 同一页面的模块共用条件组，支持添加多组 · 可上传平台截图自动识别填充条件
            </Text>
          </div>
          {!selectedConfig ? (
            <Empty description="请先在上一步选择平台" />
          ) : (
            <Collapse defaultActiveKey={selectedConfig.pages.map((p) => p.id)} className={styles.pageCollapse}>
              {selectedConfig.pages.map((page) => {
                const pageSelected = selectedModulesByPage.get(page.id) ?? new Set()
                const allChecked = pageSelected.size === page.modules.length
                const indeterminate = pageSelected.size > 0 && !allChecked
                const unionConditions = getPageUnionConditions(page, pageSelected)
                const groups = getGroups(page.id)

                return (
                  <Panel
                    key={page.id}
                    header={
                      <Checkbox
                        checked={allChecked}
                        indeterminate={indeterminate}
                        onClick={(e) => e.stopPropagation()}
                        onChange={() => togglePageAll(page)}
                      >
                        <span className={styles.pageLabel}>{page.name}</span>
                        {pageSelected.size > 0 && (
                          <Badge count={pageSelected.size} size="small" style={{ marginLeft: 8 }} />
                        )}
                      </Checkbox>
                    }
                  >
                    {/* Module checkboxes */}
                    <div className={styles.moduleList}>
                      {page.modules.map((mod) => (
                        <Checkbox
                          key={mod.id}
                          checked={pageSelected.has(mod.id)}
                          onChange={() => toggleModule(page.id, mod.id)}
                          className={styles.moduleCheckbox}
                        >
                          {mod.name}
                        </Checkbox>
                      ))}
                    </div>

                    {/* Condition groups */}
                    {pageSelected.size > 0 && unionConditions.length > 0 && (
                      <div className={styles.condGroupsArea}>
                        <div className={styles.condGroupsLabel}>
                          采集条件组（同页面模块共用，共 {groups.length} 组）
                        </div>

                        {groups.map((group, idx) => {
                          const ocrKey = `${page.id}-${idx}`
                          const isOcrLoading = ocrLoading.has(ocrKey)

                          return (
                            <div key={idx} className={styles.condGroupCard}>
                              <div className={styles.condGroupHeader}>
                                <span className={styles.condGroupTitle}>条件组 {idx + 1}</span>
                                <Space size={4}>
                                  <Upload
                                    accept="image/*"
                                    showUploadList={false}
                                    beforeUpload={() => {
                                      handleOcrFill(page.id, idx, unionConditions)
                                      return false
                                    }}
                                  >
                                    <Button
                                      size="small"
                                      icon={isOcrLoading ? <Spin size="small" /> : <CameraOutlined />}
                                      disabled={isOcrLoading}
                                    >
                                      截图识别
                                    </Button>
                                  </Upload>
                                  {groups.length > 1 && (
                                    <Tooltip title="删除此条件组">
                                      <Button
                                        size="small"
                                        type="text"
                                        danger
                                        icon={<DeleteOutlined />}
                                        onClick={() => removeCondGroup(page.id, idx)}
                                      />
                                    </Tooltip>
                                  )}
                                </Space>
                              </div>

                              <div className={styles.conditionGrid}>
                                {unionConditions.map((cond) => (
                                  <div key={cond.id} className={styles.conditionItem}>
                                    <div className={styles.conditionLabel}>
                                      {cond.required && <span className={styles.condRequired}>*</span>}
                                      {cond.label}
                                    </div>
                                    <ConditionInput
                                      cond={cond}
                                      value={group[cond.id] ?? ''}
                                      disabled={isOcrLoading}
                                      onChange={(v) => updateCondGroup(page.id, idx, cond.id, v)}
                                    />
                                  </div>
                                ))}
                              </div>
                            </div>
                          )
                        })}

                        <Button
                          type="dashed"
                          size="small"
                          icon={<PlusOutlined />}
                          onClick={() => addCondGroup(page.id)}
                          className={styles.addGroupBtn}
                        >
                          添加条件组
                        </Button>
                      </div>
                    )}
                  </Panel>
                )
              })}
            </Collapse>
          )}
        </div>
      )}

      {/* Step 3: Confirm */}
      {step === 2 && (
        <div className={styles.confirmStep}>
          {(() => {
            const vals = form.getFieldsValue()
            const client = MY_CLIENTS.find((c) => c.id === vals.clientId)
            const config = platformConfigs.find((c) => c.platformId === vals.platformId)
            const modules = buildModules()
            const groupedModules = modules.reduce<Record<string, typeof modules>>((acc, m) => {
              if (!acc[m.pageName]) acc[m.pageName] = []
              acc[m.pageName].push(m)
              return acc
            }, {})
            const totalGroups = modules.reduce((s, m) => s + m.conditionGroups.length, 0)

            return (
              <>
                <div className={styles.confirmInfo}>
                  <div className={styles.confirmRow}><span className={styles.confirmLabel}>任务名称</span><span>{vals.name || `${config?.platformName}-${client?.name}-${vals.period?.[0]?.format('YYYYMM')}`}</span></div>
                  <div className={styles.confirmRow}><span className={styles.confirmLabel}>目标平台</span><span>{config?.platformName}</span></div>
                  <div className={styles.confirmRow}><span className={styles.confirmLabel}>客户 / 品牌</span><span>{client?.name}</span></div>
                  <div className={styles.confirmRow}><span className={styles.confirmLabel}>采集周期</span><span>{vals.period?.[0]?.format('YYYY-MM-DD')} ~ {vals.period?.[1]?.format('YYYY-MM-DD')}</span></div>
                  <div className={styles.confirmRow}><span className={styles.confirmLabel}>采集规模</span><span>{modules.length} 个模块 · 共 {totalGroups} 条条件组</span></div>
                  {vals.remark && <div className={styles.confirmRow}><span className={styles.confirmLabel}>备注</span><span>{vals.remark}</span></div>}
                </div>

                <Divider>采集模块详情</Divider>

                {Object.entries(groupedModules).map(([pageName, mods]) => {
                  // all modules in same page share same conditionGroups
                  const groups = mods[0]?.conditionGroups ?? []
                  return (
                    <div key={pageName} className={styles.confirmPageGroup}>
                      <div className={styles.confirmPageName}>{pageName}</div>
                      <div className={styles.confirmModuleRow}>
                        {mods.map((m) => <Tag key={m.moduleId} color="blue">{m.moduleName}</Tag>)}
                      </div>
                      <div className={styles.confirmGroupList}>
                        {groups.map((g, i) => {
                          const parts = Object.entries(g).filter(([, v]) => v).map(([, v]) => v)
                          return (
                            <div key={i} className={styles.confirmGroupItem}>
                              <Tag bordered={false} color="default" style={{ fontSize: 11 }}>组{i + 1}</Tag>
                              <Text type="secondary" style={{ fontSize: 12 }}>
                                {parts.length > 0 ? parts.join(' · ') : '（未配置条件）'}
                              </Text>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}

                <div className={styles.confirmHint}>
                  <Text type="secondary">提交后将由数据组成员复核，复核通过后开始执行采集任务。</Text>
                </div>
              </>
            )
          })()}
        </div>
      )}
    </Drawer>
  )
}

// ---- Task Detail Drawer ----
function TaskDetailDrawer({ task, onClose }: { task: CollectionTask | null; onClose: () => void }) {
  if (!task) return null
  const { color, icon, label } = STATUS_CONFIG[task.status] ?? {
    color: 'default',
    icon: <StopOutlined />,
    label: task.status,
  }

  // group modules by page
  const byPage = task.modules.reduce<Record<string, CollectionTask['modules']>>((acc, m) => {
    if (!acc[m.pageName]) acc[m.pageName] = []
    acc[m.pageName].push(m)
    return acc
  }, {})

  return (
    <Drawer title="任务详情" width={580} open={!!task} onClose={onClose}>
      <div className={styles.detailSection}>
        <div className={styles.detailRow}><span className={styles.detailLabel}>任务状态</span><Tag color={color} icon={icon}>{label}</Tag></div>
        <div className={styles.detailRow}><span className={styles.detailLabel}>任务名称</span><span>{task.name}</span></div>
        <div className={styles.detailRow}><span className={styles.detailLabel}>目标平台</span><span>{task.platformName}</span></div>
        <div className={styles.detailRow}><span className={styles.detailLabel}>客户 / 品牌</span><span>{task.clientName}</span></div>
        <div className={styles.detailRow}><span className={styles.detailLabel}>采集周期</span><span>{task.period[0]} ~ {task.period[1]}</span></div>
        <div className={styles.detailRow}><span className={styles.detailLabel}>提交人</span><span>{task.createdBy}（{task.createdAt}）</span></div>
        {task.reviewedBy && <div className={styles.detailRow}><span className={styles.detailLabel}>复核人</span><span>{task.reviewedBy}（{task.reviewedAt}）</span></div>}
        {task.remark && <div className={styles.detailRow}><span className={styles.detailLabel}>备注</span><span>{task.remark}</span></div>}
      </div>

      <Divider>采集模块 · 共 {task.modules.length} 个</Divider>

      {Object.entries(byPage).map(([pageName, mods]) => {
        const groups = mods[0]?.conditionGroups ?? []
        return (
          <div key={pageName} className={styles.confirmPageGroup}>
            <div className={styles.confirmPageName}>{pageName}</div>
            <div className={styles.confirmModuleRow}>
              {mods.map((m) => <Tag key={m.moduleId} color="blue">{m.moduleName}</Tag>)}
            </div>
            <div className={styles.confirmGroupList}>
              {groups.map((g, i) => {
                const parts = Object.entries(g).filter(([, v]) => v).map(([, v]) => v)
                return (
                  <div key={i} className={styles.confirmGroupItem}>
                    <Tag bordered={false} color="default" style={{ fontSize: 11 }}>组{i + 1}</Tag>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      {parts.length > 0 ? parts.join(' · ') : '（未配置条件）'}
                    </Text>
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </Drawer>
  )
}

// ---- Main Collection Task Tab ----
export default function CollectionTaskTab() {
  const [tasks, setTasks] = useState<CollectionTask[]>([])
  const [loading, setLoading] = useState(false)
  const [platformConfigs, setPlatformConfigs] = useState<CollectionPlatformConfig[]>([])
  const [createOpen, setCreateOpen] = useState(false)
  const [detailTask, setDetailTask] = useState<CollectionTask | null>(null)
  const [filterPlatform, setFilterPlatform] = useState<string>('')
  const [filterClient, setFilterClient] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<CollectionTaskStatus | ''>('')
  const [filterKeyword, setFilterKeyword] = useState('')

  const loadTasks = useCallback(async () => {
    setLoading(true)
    try { setTasks(await DataWarehouseService.getCollectionTasks()) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => {
    loadTasks()
    setPlatformConfigs(DataWarehouseService.getCollectionPlatformConfigs())
  }, [loadTasks])

  const handleStatusChange = async (id: string, status: CollectionTaskStatus) => {
    await DataWarehouseService.updateCollectionTaskStatus(id, status)
    await loadTasks()
    message.success('状态已更新')
  }

  const filtered = useMemo(() => tasks.filter((t) => {
    if (filterPlatform && t.platformId !== filterPlatform) return false
    if (filterClient && t.clientId !== filterClient) return false
    if (filterStatus && t.status !== filterStatus) return false
    if (filterKeyword) {
      const kw = filterKeyword.toLowerCase()
      return t.name.toLowerCase().includes(kw) || t.platformName.toLowerCase().includes(kw) || t.clientName.toLowerCase().includes(kw)
    }
    return true
  }), [tasks, filterPlatform, filterClient, filterStatus, filterKeyword])

  const columns: TableColumnsType<CollectionTask> = [
    {
      title: '任务名称', dataIndex: 'name', width: 220,
      render: (name, r) => <a onClick={() => setDetailTask(r)} className={styles.taskNameLink}>{name}</a>,
    },
    {
      title: '平台', dataIndex: 'platformName', width: 100,
      render: (v) => <Tag bordered={false} color="blue">{v}</Tag>,
    },
    { title: '客户 / 品牌', dataIndex: 'clientName', width: 90 },
    { title: '采集周期', width: 200, render: (_, r) => `${r.period[0]} ~ ${r.period[1]}` },
    {
      title: '模块数', width: 70,
      render: (_, r) => (
        <Tooltip title={r.modules.map((m) => m.moduleName).join('、')}>
          <Badge count={r.modules.length} color="#1677ff" />
        </Tooltip>
      ),
    },
    {
      title: '状态', dataIndex: 'status', width: 90,
      render: (s: CollectionTaskStatus) => {
        const { color, icon, label } = STATUS_CONFIG[s] ?? { color: 'default', icon: <StopOutlined />, label: s }
        return <Tag color={color} icon={icon}>{label}</Tag>
      },
    },
    { title: '提交人', dataIndex: 'createdBy', width: 80 },
    { title: '提交时间', dataIndex: 'createdAt', width: 140 },
    {
      title: '操作', width: 120,
      render: (_, r) => (
        <Space size={4}>
          <Tooltip title="查看详情">
            <Button type="text" size="small" icon={<EyeOutlined />} onClick={() => setDetailTask(r)} />
          </Tooltip>
          {r.status === '执行中' && (
            <Popconfirm title="确认暂停该任务？" onConfirm={() => handleStatusChange(r.id, '已暂停')}>
              <Tooltip title="暂停"><Button type="text" size="small" icon={<PauseCircleOutlined />} /></Tooltip>
            </Popconfirm>
          )}
          {r.status === '已暂停' && (
            <Popconfirm title="确认恢复执行？" onConfirm={() => handleStatusChange(r.id, '执行中')}>
              <Tooltip title="恢复"><Button type="text" size="small" icon={<PlayCircleOutlined />} /></Tooltip>
            </Popconfirm>
          )}
          {/* 已收敛为：执行中 / 已完成 / 已暂停（无需草稿/待复核/取消态操作） */}
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <Title level={5} style={{ margin: 0 }}>采集任务管理</Title>
          <Text type="secondary" style={{ fontSize: 13 }}>按需配置平台数据采集任务，由数据组复核后执行。</Text>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateOpen(true)}>新建任务</Button>
      </div>

      <div className={styles.filterBar}>
        <Input prefix={<SearchOutlined />} placeholder="搜索任务名称" value={filterKeyword}
          onChange={(e) => setFilterKeyword(e.target.value)} style={{ width: 200 }} allowClear />
        <Select placeholder="平台" style={{ width: 130 }} value={filterPlatform || undefined}
          onChange={setFilterPlatform} allowClear options={platformConfigs.map((c) => ({ label: c.platformName, value: c.platformId }))} />
        <Select placeholder="客户" style={{ width: 110 }} value={filterClient || undefined}
          onChange={setFilterClient} allowClear options={MY_CLIENTS.map((c) => ({ label: c.name, value: c.id }))} />
        <Select placeholder="状态" style={{ width: 110 }} value={filterStatus || undefined}
          onChange={(v) => setFilterStatus(v ?? '')} allowClear
          options={(['执行中', '已完成', '已暂停'] as CollectionTaskStatus[]).map((s) => ({ label: s, value: s }))} />
      </div>

      <Table rowKey="id" loading={loading} dataSource={filtered} columns={columns} size="small"
        pagination={{ pageSize: 10, showSizeChanger: false, showTotal: (t) => `共 ${t} 条` }}
        locale={{ emptyText: <Empty description="暂无采集任务" /> }} />

      <CreateTaskDrawer open={createOpen} onClose={() => setCreateOpen(false)} onCreated={loadTasks} platformConfigs={platformConfigs} />
      <TaskDetailDrawer task={detailTask} onClose={() => setDetailTask(null)} />
    </div>
  )
}
