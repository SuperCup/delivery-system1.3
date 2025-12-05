import { useEffect, useState } from 'react'
import {
  Breadcrumb,
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
  Upload,
  Popconfirm,
  Checkbox,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { InboxOutlined, PlusOutlined, HomeOutlined } from '@ant-design/icons'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import dayjs from 'dayjs'
import styles from './activity-form-page.module.css'
import type { BusinessType, Contact } from '../../../../types/client'
import type { PlatformDataOption } from '../../../../types/activity-guidance'
import { ClientActivityService } from '../../../../services/client-activity-service'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

type FormValues = {
  name: string
  businessType: BusinessType
  timeRange: [dayjs.Dayjs, dayjs.Dayjs]
  platforms: string[]
  visibleContacts: string[]
  scopes: Record<
    string,
    {
      sourceType: 'system' | 'manual'
      batches: Array<{
        projectId?: string
        projectName?: string
        batchId: string
        batchName: string
        batchCode?: string
        mechanismName?: string
        autoSelectAll?: boolean
      }>
      uploadFile?: {
        name: string
        size: number
      }
    }
  >
}

type BatchItem = {
  projectId?: string
  projectName?: string
  projectCode?: string
  batchId: string
  batchName: string
  batchCode?: string
  mechanismName?: string
  autoSelectAll?: boolean
  createdBy?: string
  platform: string
}

const businessTypeOptions: BusinessType[] = ['到店营销', '即时零售', '物码营销']

const platformChoices = ['微信', '支付宝', '微信小店', '抖音到店', '美团到店', '天猫校园']

const UploadProps = {
  multiple: false,
  showUploadList: false,
}

export default function ActivityFormPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clientId, id: activityId } = useParams<{ clientId: string; id?: string }>()
  const searchParams = new URLSearchParams(location.search)
  const businessType = (searchParams.get('businessType') as BusinessType) || '到店营销'
  const isEdit = !!activityId

  const [loading, setLoading] = useState(false)
  const [platformOptions, setPlatformOptions] = useState<PlatformDataOption[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [form] = Form.useForm<FormValues>()
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [currentPlatform, setCurrentPlatform] = useState<string>('')
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([])
  // 每个项目的配置：projectId -> { autoSelectAll: boolean, selectedBatchIds: string[] }
  const [projectConfigs, setProjectConfigs] = useState<Record<string, { autoSelectAll: boolean; selectedBatchIds: string[] }>>({})
  // 当前查看的项目ID（用于右侧显示）
  const [currentViewProjectId, setCurrentViewProjectId] = useState<string>('')
  // 项目搜索关键词
  const [projectSearchText, setProjectSearchText] = useState('')
  // 批次搜索关键词
  const [batchSearchText, setBatchSearchText] = useState('')

  useEffect(() => {
    if (!clientId) return
    const init = async () => {
      try {
        const [optionList, contactList] = await Promise.all([
          ClientActivityService.getPlatformOptions(),
          ClientActivityService.getClientContacts(clientId),
        ])
        setPlatformOptions(optionList)
        setContacts(contactList)
      } catch (error: unknown) {
        const err = error as Error
        message.error(`加载数据失败：${err.message}`)
      }
    }
    init()
  }, [clientId])

  const watchedPlatforms = Form.useWatch('platforms', form) ?? []

  // 当选择平台时，自动初始化 scopes 数据
  useEffect(() => {
    const currentScopes = form.getFieldValue('scopes') || {}
    const newScopes = { ...currentScopes }
    let hasChanges = false

    watchedPlatforms.forEach((platform: string) => {
      if (!newScopes[platform]) {
        newScopes[platform] = {
          sourceType: 'system',
          batches: [],
        }
        hasChanges = true
      }
    })

    // 移除不再选中的平台
    Object.keys(newScopes).forEach((platform) => {
      if (!watchedPlatforms.includes(platform)) {
        delete newScopes[platform]
        hasChanges = true
      }
    })

    if (hasChanges) {
      form.setFieldsValue({ scopes: newScopes })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedPlatforms.join(',')])

  const handleSubmit = async () => {
    setLoading(true)
    try {
      await form.validateFields()
      // 模拟保存操作
      await new Promise((resolve) => setTimeout(resolve, 500))

      message.success(isEdit ? '活动已更新（模拟）' : '活动已创建（模拟）')
      navigate(`/clients/${clientId}/dashboard`)
    } catch (error: unknown) {
      const err = error as { errorFields?: unknown }
      if (err?.errorFields) return
      const errorMessage = error instanceof Error ? error.message : '保存失败'
      message.error(`保存失败：${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleAddBatch = (platform: string) => {
    const platformOption = platformOptions.find((opt) => opt.platform === platform)
    if (!platformOption || platformOption.projects.length === 0) {
      message.warning('该平台暂无可用数据')
      return
    }
    setCurrentPlatform(platform)
    setSelectedProjectIds([])
    setProjectConfigs({})
    setCurrentViewProjectId('')
    setProjectSearchText('')
    setBatchSearchText('')
    setBatchModalOpen(true)
  }

  const handleDeleteBatch = (platform: string, batchId: string) => {
    const currentScopes = form.getFieldValue('scopes') || {}
    const currentBatches = currentScopes[platform]?.batches || []
    const updatedBatches = currentBatches.filter((b: BatchItem) => b.batchId !== batchId)

    form.setFieldsValue({
      scopes: {
        ...currentScopes,
        [platform]: {
          ...currentScopes[platform],
          batches: updatedBatches,
        },
      },
    })
  }

  const handleConfirmAddBatches = () => {
    if (selectedProjectIds.length === 0) {
      message.warning('请先选择项目')
      return
    }

    const platformOption = platformOptions.find((opt) => opt.platform === currentPlatform)
    if (!platformOption) return

    // 验证每个项目都有配置
    let hasValidConfig = false
    for (const projectId of selectedProjectIds) {
      const config = projectConfigs[projectId]
      if (config && (config.autoSelectAll || config.selectedBatchIds.length > 0)) {
        hasValidConfig = true
        break
      }
    }

    if (!hasValidConfig) {
      message.warning('请为每个项目选择"自动获取全量数据"或选择部分批次')
      return
    }

    const currentScopes = form.getFieldValue('scopes') || {}
    const currentBatches = currentScopes[currentPlatform]?.batches || []

    const newBatches: BatchItem[] = []
    
    // 遍历所有选中的项目，根据每个项目的配置添加批次
    selectedProjectIds.forEach((projectId) => {
      const project = platformOption.projects.find((p) => p.id === projectId)
      if (!project) return

      const config = projectConfigs[projectId]
      if (!config) return

      if (config.autoSelectAll) {
        // 自动获取该项目下全量数据
        const projectBatches = (project.batches || []).map((batch) => ({
          projectId: project.id,
          projectName: project.name,
          projectCode: project.code,
          batchId: batch.id,
          batchName: batch.name,
          batchCode: batch.code,
          mechanismName: batch.mechanismName,
          autoSelectAll: true,
          createdBy: '系统',
          platform: currentPlatform,
        }))
        newBatches.push(...projectBatches)
      } else if (config.selectedBatchIds.length > 0) {
        // 选择特定批次（仅当前项目的批次）
        const projectBatches = (project.batches || [])
          .filter((batch) => config.selectedBatchIds.includes(batch.id))
          .map((batch) => ({
            projectId: project.id,
            projectName: project.name,
            projectCode: project.code,
            batchId: batch.id,
            batchName: batch.name,
            batchCode: batch.code,
            mechanismName: batch.mechanismName,
            autoSelectAll: false,
            createdBy: '手动选择',
            platform: currentPlatform,
          }))
        newBatches.push(...projectBatches)
      }
    })

    // 去重
    const existingBatchIds = new Set(currentBatches.map((b: BatchItem) => b.batchId))
    const uniqueNewBatches = newBatches.filter((b) => !existingBatchIds.has(b.batchId))

    form.setFieldsValue({
      scopes: {
        ...currentScopes,
        [currentPlatform]: {
          ...currentScopes[currentPlatform],
          sourceType: currentScopes[currentPlatform]?.sourceType || 'system',
          batches: [...currentBatches, ...uniqueNewBatches],
        },
      },
    })

    message.success(`已添加 ${uniqueNewBatches.length} 个批次`)
    setBatchModalOpen(false)
    setSelectedProjectIds([])
    setProjectConfigs({})
    setCurrentViewProjectId('')
    setProjectSearchText('')
    setBatchSearchText('')
  }

  const getBatchColumns = (platform: string): ColumnsType<BatchItem> => [
    {
      title: '项目名称',
      dataIndex: 'projectName',
      key: 'projectName',
      width: 150,
      render: (text: string) => text || <Text type="secondary">—</Text>,
    },
    {
      title: '项目号',
      dataIndex: 'projectCode',
      key: 'projectCode',
      width: 130,
      render: (code: string) => (code ? <Text style={{ fontSize: 12 }}>{code}</Text> : <Text type="secondary">—</Text>),
    },
    {
      title: '批次名称',
      dataIndex: 'batchName',
      key: 'batchName',
      width: 250,
      ellipsis: true,
    },
    {
      title: '批次编码',
      dataIndex: 'batchCode',
      key: 'batchCode',
      width: 200,
      ellipsis: true,
      render: (code: string) => (code ? <Text style={{ fontSize: 12 }}>{code}</Text> : <Text type="secondary">—</Text>),
    },
    {
      title: '机制名',
      dataIndex: 'mechanismName',
      key: 'mechanismName',
      width: 150,
      render: (name: string) => (name ? <Text>{name}</Text> : <Text type="secondary">—</Text>),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
      render: (creator: string) => creator || <Text type="secondary">—</Text>,
    },
    {
      title: '操作',
      key: 'actions',
      width: 80,
      fixed: 'right',
      render: (_, record) => (
        <Popconfirm
          title="确定删除这个批次吗？"
          onConfirm={() => handleDeleteBatch(platform, record.batchId)}
          okText="确定"
          cancelText="取消"
        >
          <Button type="link" danger size="small">
            删除
          </Button>
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <Breadcrumb
        className={styles.breadcrumb}
        items={[
          {
            href: `/clients/${clientId}/overview`,
            title: <HomeOutlined />,
          },
          {
            href: `/clients/${clientId}/dashboard`,
            title: '客户看板',
          },
          {
            title: isEdit ? '编辑活动' : '新建活动',
          },
        ]}
      />
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          {isEdit ? '编辑活动' : '新建活动'}
        </Title>
        <Space>
          <Button onClick={() => navigate(`/clients/${clientId}/dashboard`)}>取消</Button>
          <Button type="primary" onClick={handleSubmit} loading={loading}>
            保存
          </Button>
        </Space>
      </div>

      <Form<FormValues>
        form={form}
        layout="vertical"
        initialValues={{
          businessType,
          platforms: [],
          visibleContacts: [],
          scopes: {},
        }}
      >
        <Card className={styles.card} title="基础信息">
          <Form.Item name="businessType" label="业务类型">
            <Select disabled options={businessTypeOptions.map((t) => ({ label: t, value: t }))} />
          </Form.Item>

          <Form.Item
            name="name"
            label="活动名称"
            rules={[
              { required: true, message: '请输入活动名称' },
              {
                pattern: /^[\u4e00-\u9fa5A-Za-z0-9（）()]+$/,
                message: '仅支持中文、英文、数字及括号',
              },
            ]}
            extra="建议命名规范：品牌 + 时间 + 主题，如「2025年11月康师傅双十一狂欢活动」"
          >
            <Input placeholder="请输入活动名称" />
          </Form.Item>

          <Form.Item
            name="timeRange"
            label="活动起止时间"
            rules={[{ required: true, message: '请选择活动时间范围' }]}
          >
            <RangePicker style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="platforms"
            label="活动平台"
            rules={[{ required: true, message: '请选择活动平台' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择活动投放平台"
              options={platformChoices.map((platform) => ({ label: platform, value: platform }))}
            />
          </Form.Item>

          <Form.Item
            name="visibleContacts"
            label="数据可见联系人"
            rules={[{ required: true, message: '至少选择一位联系人' }]}
          >
            <Select
              mode="multiple"
              placeholder="选择可在业务端查看活动的客户联系人"
              options={contacts.map((contact) => ({
                label: `${contact.name}（${contact.position}）`,
                value: contact.id,
              }))}
            />
          </Form.Item>
        </Card>

        {watchedPlatforms.length > 0 && (
          <div className={styles.scopePanel}>
            <div>
              <Title level={5} className={styles.scopePanelTitle}>
                按平台设置数据范围
              </Title>
              <div className={styles.scopePanelDesc}>
                <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                  1、选择"自动获取该项目下全量数据"后，点击"确认添加"，系统会自动同步该平台下与该项目关联的所有批次，后续有新增，系统会在次日0时自动同步；
                </Text>
                <Text type="secondary" style={{ fontSize: 12, display: 'block' }}>
                  2、如果某个批次不需要统计在内，可手动删除；
                </Text>
              </div>
            </div>
            <Space direction="vertical" size={20} className={styles.scopeList}>
              {watchedPlatforms.map((platform) => {
                return (
                  <Card
                    key={platform}
                    size="small"
                    className={styles.scopeCard}
                    title={
                      <div className={styles.scopeCardTitle}>
                        <Tag color="blue">{platform}</Tag>
                      </div>
                    }
                  >
                    <Form.Item noStyle shouldUpdate>
                      {({ getFieldValue, setFieldValue }) => {
                        const currentSource = getFieldValue(['scopes', platform, 'sourceType']) || 'system'
                        const currentFile = getFieldValue(['scopes', platform, 'uploadFile'])
                        const currentScopes = getFieldValue('scopes') || {}
                        const currentBatches = currentScopes[platform]?.batches || []
                        
                        return (
                          <>
                            <Tabs
                              activeKey={currentSource}
                              onChange={(key) => {
                                const scopes = getFieldValue('scopes') || {}
                                setFieldValue('scopes', {
                                  ...scopes,
                                  [platform]: {
                                    ...(scopes[platform] || {}),
                                    sourceType: key,
                                  },
                                })
                              }}
                              items={[
                                { key: 'system', label: '系统数据' },
                                { key: 'manual', label: '外部数据' },
                              ]}
                              style={{ marginBottom: 16 }}
                            />
                            
                            {currentSource === 'manual' ? (
                              <div className={styles.uploadSection}>
                                <div className={styles.uploadHint}>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    请先下载模板，填写数据后上传
                                  </Text>
                                  <Button
                                    type="link"
                                    size="small"
                                    href="/mock/templates/activity-dataset-template.csv"
                                    download
                                  >
                                    下载模板
                                  </Button>
                                </div>
                                <Form.Item
                                  name={['scopes', platform, 'uploadFile']}
                                  rules={[{ required: true, message: '请上传该平台的数据文件' }]}
                                >
                                  <Upload.Dragger
                                    {...UploadProps}
                                    fileList={
                                      currentFile
                                        ? [
                                            {
                                              uid: '-1',
                                              name: currentFile.name,
                                              status: 'done',
                                              size: currentFile.size,
                                            },
                                          ]
                                        : []
                                    }
                                    beforeUpload={(file) => {
                                      form.setFieldValue(['scopes', platform, 'uploadFile'], {
                                        name: file.name,
                                        size: file.size,
                                      })
                                      message.success(`已选择文件：${file.name}`)
                                      return false
                                    }}
                                    onRemove={() => {
                                      form.setFieldValue(['scopes', platform, 'uploadFile'], undefined)
                                    }}
                                  >
                                    <p className="ant-upload-drag-icon">
                                      <InboxOutlined />
                                    </p>
                                    <p className="ant-upload-text">点击或拖拽上传数据文件</p>
                                    <p className="ant-upload-hint">支持 CSV/XLSX 格式</p>
                                  </Upload.Dragger>
                                </Form.Item>
                              </div>
                            ) : (
                              <div className={styles.systemSelectionSection}>
                            <div className={styles.batchList}>
                              <div className={styles.batchListHeader}>
                                <Text strong>已选批次</Text>
                                <Space>
                                  <Text type="secondary" style={{ fontSize: 12 }}>
                                    共 {(currentBatches || []).length} 个
                                  </Text>
                                  <Button
                                    size="small"
                                    icon={<PlusOutlined />}
                                    onClick={() => handleAddBatch(platform)}
                                  >
                                    添加批次
                                  </Button>
                                </Space>
                              </div>
                              {(currentBatches || []).length === 0 ? (
                                <div className={styles.emptyBatchList}>
                                  <Text type="secondary">暂无批次，请选择项目添加批次</Text>
                                </div>
                              ) : (
                                <Table<BatchItem>
                                  rowKey="batchId"
                                  columns={getBatchColumns(platform)}
                                  dataSource={(currentBatches || []).map((b: BatchItem) => ({ ...b, platform }))}
                                  pagination={{
                                    pageSize: 10,
                                    showSizeChanger: true,
                                    showQuickJumper: true,
                                    showTotal: (total) => `共 ${total} 条`,
                                    size: 'small',
                                  }}
                                  size="small"
                                  className={styles.batchTable}
                                  scroll={{ x: 1000 }}
                                />
                              )}
                            </div>
                              </div>
                            )}
                          </>
                        )
                      }}
                    </Form.Item>
                  </Card>
                )
              })}
            </Space>
          </div>
        )}
      </Form>

      <Modal
        title="选择批次"
        open={batchModalOpen}
        onOk={handleConfirmAddBatches}
        onCancel={() => {
          setBatchModalOpen(false)
          setSelectedProjectIds([])
          setProjectConfigs({})
          setCurrentViewProjectId('')
          setProjectSearchText('')
          setBatchSearchText('')
        }}
        width={1200}
        okText="确认添加"
        cancelText="取消"
      >
        {currentPlatform && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>平台：</Text>
              <Tag color="blue" style={{ marginLeft: 8 }}>
                {currentPlatform}
              </Tag>
            </div>
            <div style={{ display: 'flex', gap: 16, height: 600 }}>
              {/* 左侧：项目列表 */}
              <div style={{ width: '40%', borderRight: '1px solid #f0f0f0', paddingRight: 16 }}>
                <div style={{ marginBottom: 12 }}>
                  <Text strong style={{ display: 'block', marginBottom: 8 }}>
                    选择项目
                  </Text>
                  <Input.Search
                    placeholder="搜索项目名称或编码"
                    allowClear
                    value={projectSearchText}
                    onChange={(e) => setProjectSearchText(e.target.value)}
                    onSearch={(value) => setProjectSearchText(value)}
                    style={{ marginBottom: 12 }}
                  />
                </div>
                <div style={{ height: 550, overflow: 'auto' }}>
                  {(() => {
                    const platformOption = platformOptions.find((opt) => opt.platform === currentPlatform)
                    const allProjects = platformOption?.projects || []
                    const filteredProjects = projectSearchText
                      ? allProjects.filter(
                          (proj) =>
                            proj.name?.toLowerCase().includes(projectSearchText.toLowerCase()) ||
                            proj.code?.toLowerCase().includes(projectSearchText.toLowerCase()),
                        )
                      : allProjects

                    return (
                      <Space direction="vertical" style={{ width: '100%' }} size={8}>
                        {filteredProjects.map((project) => {
                          const config = projectConfigs[project.id] || { autoSelectAll: false, selectedBatchIds: [] }
                          const isSelected = selectedProjectIds.includes(project.id)
                          const batchCount = project.batches?.length || 0

                          return (
                            <Card
                              key={project.id}
                              size="small"
                              hoverable
                              style={{
                                cursor: 'pointer',
                                backgroundColor: isSelected ? '#e6f7ff' : currentViewProjectId === project.id ? '#f0f0f0' : '#fff',
                                border: isSelected ? '2px solid #1890ff' : currentViewProjectId === project.id ? '2px solid #d9d9d9' : '1px solid #d9d9d9',
                              }}
                              onClick={() => {
                                if (!isSelected) {
                                  const newSelectedIds = [...selectedProjectIds, project.id]
                                  setSelectedProjectIds(newSelectedIds)
                                  if (!projectConfigs[project.id]) {
                                    setProjectConfigs({
                                      ...projectConfigs,
                                      [project.id]: { autoSelectAll: false, selectedBatchIds: [] },
                                    })
                                  }
                                }
                                setCurrentViewProjectId(project.id)
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                  <div style={{ display: 'flex', alignItems: 'center', marginBottom: 4 }}>
                                    <Checkbox
                                      checked={isSelected}
                                      onClick={(e) => e.stopPropagation()}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          const newSelectedIds = [...selectedProjectIds, project.id]
                                          setSelectedProjectIds(newSelectedIds)
                                          if (!projectConfigs[project.id]) {
                                            setProjectConfigs({
                                              ...projectConfigs,
                                              [project.id]: { autoSelectAll: false, selectedBatchIds: [] },
                                            })
                                          }
                                          setCurrentViewProjectId(project.id)
                                        } else {
                                          setSelectedProjectIds(selectedProjectIds.filter((id) => id !== project.id))
                                          if (currentViewProjectId === project.id) {
                                            const remainingIds = selectedProjectIds.filter((id) => id !== project.id)
                                            setCurrentViewProjectId(remainingIds.length > 0 ? remainingIds[0] : '')
                                          }
                                        }
                                      }}
                                    />
                                    <Text strong style={{ marginLeft: 8 }}>
                                      {project.name}
                                    </Text>
                                  </div>
                                  {project.code && (
                                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 24, display: 'block' }}>
                                      {project.code}
                                    </Text>
                                  )}
                                  <div style={{ marginTop: 8, marginLeft: 24 }}>
                                    <Text type="secondary" style={{ fontSize: 12 }}>
                                      共 {batchCount} 个批次
                                    </Text>
                                    {isSelected && config.autoSelectAll && (
                                      <Tag color="green" style={{ marginLeft: 8, fontSize: 12 }}>
                                        全量数据
                                      </Tag>
                                    )}
                                    {isSelected && !config.autoSelectAll && config.selectedBatchIds.length > 0 && (
                                      <Tag color="blue" style={{ marginLeft: 8, fontSize: 12 }}>
                                        已选 {config.selectedBatchIds.length} 个
                                      </Tag>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </Card>
                          )
                        })}
                        {filteredProjects.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Text type="secondary">未找到匹配的项目</Text>
                          </div>
                        )}
                      </Space>
                    )
                  })()}
                </div>
              </div>

              {/* 右侧：批次列表 */}
              <div style={{ width: '60%', paddingLeft: 16 }}>
                {currentViewProjectId ? (
                  (() => {
                    const project = platformOptions
                      .find((opt) => opt.platform === currentPlatform)
                      ?.projects.find((p) => p.id === currentViewProjectId)
                    if (!project) return null

                    const config = projectConfigs[currentViewProjectId] || { autoSelectAll: false, selectedBatchIds: [] }
                    const allBatches = project.batches || []
                    const filteredBatches = batchSearchText
                      ? allBatches.filter(
                          (batch) =>
                            batch.name?.toLowerCase().includes(batchSearchText.toLowerCase()) ||
                            batch.code?.toLowerCase().includes(batchSearchText.toLowerCase()) ||
                            batch.mechanismName?.toLowerCase().includes(batchSearchText.toLowerCase()),
                        )
                      : allBatches

                    return (
                      <div>
                        <div style={{ marginBottom: 12 }}>
                          <Text strong style={{ fontSize: 16 }}>
                            {project.name}
                          </Text>
                          {project.code && (
                            <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                              ({project.code})
                            </Text>
                          )}
                        </div>
                        <div style={{ marginBottom: 12 }}>
                          <Checkbox
                            checked={config.autoSelectAll}
                            onChange={(e) => {
                              setProjectConfigs({
                                ...projectConfigs,
                                [currentViewProjectId]: {
                                  autoSelectAll: e.target.checked,
                                  selectedBatchIds: e.target.checked ? [] : config.selectedBatchIds,
                                },
                              })
                            }}
                          >
                            <Text strong>自动获取该项目下全量数据</Text>
                          </Checkbox>
                          <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                            （勾选后将自动添加该项目下所有批次）
                          </Text>
                        </div>
                        {!config.autoSelectAll && allBatches.length > 0 && (
                          <div>
                            <div style={{ marginBottom: 8 }}>
                              <Input.Search
                                placeholder="搜索批次名称、编码或机制名"
                                allowClear
                                value={batchSearchText}
                                onChange={(e) => setBatchSearchText(e.target.value)}
                                onSearch={(value) => setBatchSearchText(value)}
                              />
                            </div>
                            {filteredBatches.length === 0 ? (
                              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                <Text type="secondary">未找到匹配的批次</Text>
                              </div>
                            ) : (
                              <Table
                                rowKey="id"
                                rowSelection={{
                                  selectedRowKeys: config.selectedBatchIds,
                                  onChange: (keys) => {
                                    setProjectConfigs({
                                      ...projectConfigs,
                                      [currentViewProjectId]: {
                                        autoSelectAll: false,
                                        selectedBatchIds: keys as string[],
                                      },
                                    })
                                  },
                                }}
                                columns={[
                                  {
                                    title: '批次名称',
                                    dataIndex: 'name',
                                    key: 'name',
                                    width: 200,
                                    ellipsis: true,
                                  },
                                  {
                                    title: '批次编码',
                                    dataIndex: 'code',
                                    key: 'code',
                                    width: 150,
                                    ellipsis: true,
                                    render: (code: string) => (code ? <Text style={{ fontSize: 12 }}>{code}</Text> : '—'),
                                  },
                                  {
                                    title: '机制名',
                                    dataIndex: 'mechanismName',
                                    key: 'mechanismName',
                                    width: 120,
                                    render: (name: string) => (name ? <Text>{name}</Text> : '—'),
                                  },
                                ]}
                                dataSource={filteredBatches}
                                pagination={{
                                  pageSize: 10,
                                  showSizeChanger: true,
                                  showQuickJumper: true,
                                  showTotal: (total) => `共 ${total} 条`,
                                  size: 'small',
                                }}
                                size="small"
                                scroll={{ y: 400 }}
                              />
                            )}
                          </div>
                        )}
                        {!config.autoSelectAll && allBatches.length === 0 && (
                          <div style={{ textAlign: 'center', padding: '40px 0' }}>
                            <Text type="secondary">该项目暂无可用批次</Text>
                          </div>
                        )}
                      </div>
                    )
                  })()
                ) : (
                  <div style={{ textAlign: 'center', padding: '100px 0', color: '#999' }}>
                    <Text type="secondary">请从左侧选择项目查看批次</Text>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

