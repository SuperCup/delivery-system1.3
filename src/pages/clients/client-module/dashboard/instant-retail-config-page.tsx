import { useEffect, useState } from 'react'
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
import type {
  ActivityScheme,
  PlatformCrawledScheme,
  InstantRetailPlatform,
  PriceMonitoringTask,
  PriceMonitoringSource,
  PriceMonitoringFrequency,
  ActivityItem,
  ActivityDetailInfo,
} from '../../../../types/instant-retail'
import type { Contact } from '../../../../types/client'
import { InstantRetailService } from '../../../../services/instant-retail-service'
import { ClientActivityService } from '../../../../services/client-activity-service'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { MonthPicker } = DatePicker

const platforms: InstantRetailPlatform[] = ['美团闪购', '淘宝闪购', '京东到家']
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
          await loadActivityItems()
          break
        case 'monitoring':
          await loadMonitoringTasks()
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
              <Descriptions.Item label="活动名称">{viewingActivity.activityName}</Descriptions.Item>
              <Descriptions.Item label="方案名称">
                {viewingActivity.schemeName || <Text type="secondary">—</Text>}
              </Descriptions.Item>
              <Descriptions.Item label="机制名称">
                {viewingActivity.mechanismName || <Text type="secondary">—</Text>}
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

