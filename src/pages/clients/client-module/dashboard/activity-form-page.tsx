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
  const [autoSelectAll, setAutoSelectAll] = useState(false)
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>([])

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
    setAutoSelectAll(false)
    setSelectedBatchIds([])
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

    const currentScopes = form.getFieldValue('scopes') || {}
    const currentBatches = currentScopes[currentPlatform]?.batches || []

    const newBatches: BatchItem[] = []
    
    // 遍历所有选中的项目
    selectedProjectIds.forEach((projectId) => {
      const project = platformOption.projects.find((p) => p.id === projectId)
      if (!project) return

      if (autoSelectAll) {
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
      } else if (selectedBatchIds.length > 0) {
        // 选择特定批次（仅当前项目的批次）
        const projectBatches = (project.batches || [])
          .filter((batch) => selectedBatchIds.includes(batch.id))
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

    if (newBatches.length === 0 && !autoSelectAll) {
      message.warning('请选择批次或勾选"自动获取全量数据"')
      return
    }

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
    setAutoSelectAll(false)
    setSelectedBatchIds([])
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
                                  pagination={false}
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
          setAutoSelectAll(false)
          setSelectedBatchIds([])
        }}
        width={900}
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
            <div style={{ marginBottom: 16 }}>
              <Text strong style={{ display: 'block', marginBottom: 8 }}>
                选择项目（支持多选和搜索）
              </Text>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="请搜索并选择项目"
                options={
                  platformOptions
                    .find((opt) => opt.platform === currentPlatform)
                    ?.projects.map((proj) => ({
                      label: `${proj.name}${proj.code ? ` (${proj.code})` : ''}`,
                      value: proj.id,
                    })) || []
                }
                value={selectedProjectIds}
                onChange={(values) => {
                  setSelectedProjectIds(values)
                  setSelectedBatchIds([])
                  setAutoSelectAll(false)
                }}
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                allowClear
                maxTagCount="responsive"
              />
            </div>
            {selectedProjectIds.length > 0 && (
              <div>
                <div style={{ marginBottom: 12 }}>
                  <Checkbox
                    checked={autoSelectAll}
                    onChange={(e) => {
                      setAutoSelectAll(e.target.checked)
                      if (e.target.checked) {
                        setSelectedBatchIds([])
                      }
                    }}
                  >
                    <Text strong>自动获取所选项目下全量数据</Text>
                  </Checkbox>
                  <Text type="secondary" style={{ marginLeft: 8, fontSize: 12 }}>
                    （勾选后将自动添加所选项目下所有批次）
                  </Text>
                </div>
                {!autoSelectAll && (
                  <div>
                    <Text strong style={{ display: 'block', marginBottom: 8 }}>
                      选择批次（来自所选项目）
                    </Text>
                    <Table
                      rowKey="id"
                      rowSelection={{
                        selectedRowKeys: selectedBatchIds,
                        onChange: (keys) => setSelectedBatchIds(keys as string[]),
                      }}
                      columns={[
                        {
                          title: '项目名称',
                          dataIndex: 'projectName',
                          key: 'projectName',
                          width: 150,
                        },
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
                      dataSource={
                        platformOptions
                          .find((opt) => opt.platform === currentPlatform)
                          ?.projects.filter((p) => selectedProjectIds.includes(p.id))
                          .flatMap((project) =>
                            (project.batches || []).map((batch) => ({
                              ...batch,
                              projectName: project.name,
                            })),
                          ) || []
                      }
                      pagination={{ pageSize: 5, size: 'small' }}
                      size="small"
                      scroll={{ y: 300 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}

