import { useState, useEffect } from 'react'
import {
  Breadcrumb,
  Card,
  Table,
  Button,
  Space,
  Tag,
  Typography,
  Upload,
  message,
  Modal,
  Form,
  Select,
  Input,
  Alert,
  Descriptions,
  DatePicker,
  Divider,
  Switch,
} from 'antd'
import {
  UploadOutlined,
  DeleteOutlined,
  DownloadOutlined,
  HomeOutlined,
  EyeOutlined,
  FileTextOutlined,
  SearchOutlined,
} from '@ant-design/icons'
import { useLocation, useParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import styles from './data-source-page.module.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker

type SystemDataset = {
  id: string
  name: string
  platform: string
  projectCount: number
  batchCount: number
  lastUpdated: string
  fields?: string[] // 数据集字段
}

type ExternalDataset = {
  id: string
  fileName: string
  platform: string
  uploadedBy: string
  uploadedAt: string
  fileSize: string
  status: '有效' | '已过期'
  enabled: boolean // 启用状态
}

type DataMapping = {
  id: string
  name: string
  platform: string
  uploadedBy: string
  uploadedAt: string
  fileSize: string
  targetDataset: string
  enabled: boolean // 启用状态
}

const platformOptions = [
  { label: '微信', value: '微信' },
  { label: '微信小店', value: '微信小店' },
  { label: '支付宝', value: '支付宝' },
  { label: '抖音到店', value: '抖音到店' },
  { label: '美团到店', value: '美团到店' },
  { label: '天猫校园', value: '天猫校园' },
]

export default function DataSourcePage() {
  const location = useLocation()
  const { clientId } = useParams<{ clientId: string }>()
  const searchParams = new URLSearchParams(location.search)
  const businessType = searchParams.get('businessType') || ''
  const [clientName, setClientName] = useState('')

  const [systemData, setSystemData] = useState<SystemDataset[]>([])
  const [externalData, setExternalData] = useState<ExternalDataset[]>([])
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([])
  
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [mappingModalOpen, setMappingModalOpen] = useState(false)
  const [previewModalOpen, setPreviewModalOpen] = useState(false)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [previewDataset, setPreviewDataset] = useState<SystemDataset | null>(null)
  const [detailDataset, setDetailDataset] = useState<SystemDataset | null>(null)
  
  const [uploadForm] = Form.useForm()
  const [mappingForm] = Form.useForm()
  const [detailFilterForm] = Form.useForm()

  useEffect(() => {
    if (!clientId) return

    // 模拟加载客户名称
    const clientNames: Record<string, string> = {
      'C-001': '达能',
      'C-002': '伊利',
      'C-003': '康师傅',
    }
    setClientName(clientNames[clientId] || clientId)

    // 模拟加载系统数据集
    setSystemData([
      {
        id: 'DS-001',
        name: '微信支付账单',
        platform: '微信',
        projectCount: 3,
        batchCount: 12,
        lastUpdated: '2025-11-10 14:30:00',
        fields: ['订单号', '交易时间', '交易金额', '商户名称', '支付方式', '订单状态'],
      },
      {
        id: 'DS-002',
        name: '微信小店账单',
        platform: '微信小店',
        projectCount: 2,
        batchCount: 8,
        lastUpdated: '2025-11-09 16:20:00',
        fields: ['订单号', '商品名称', '交易时间', '交易金额', '买家昵称', '订单状态'],
      },
      {
        id: 'DS-003',
        name: '支付宝账单',
        platform: '支付宝',
        projectCount: 2,
        batchCount: 8,
        lastUpdated: '2025-11-09 16:20:00',
        fields: ['订单号', '交易时间', '交易金额', '商户名称', '支付方式', '订单状态'],
      },
      {
        id: 'DS-004',
        name: '抖音到店账单',
        platform: '抖音到店',
        projectCount: 4,
        batchCount: 15,
        lastUpdated: '2025-11-08 10:15:00',
        fields: ['订单号', '交易时间', '交易金额', '商户名称', '核销状态', '优惠金额'],
      },
      {
        id: 'DS-005',
        name: '美团到店账单',
        platform: '美团到店',
        projectCount: 3,
        batchCount: 10,
        lastUpdated: '2025-11-07 09:30:00',
        fields: ['订单号', '交易时间', '交易金额', '商户名称', '核销状态', '优惠金额'],
      },
      {
        id: 'DS-006',
        name: '天猫校园账单',
        platform: '天猫校园',
        projectCount: 2,
        batchCount: 6,
        lastUpdated: '2025-11-06 14:20:00',
        fields: ['订单号', '交易时间', '交易金额', '商品名称', '买家昵称', '订单状态'],
      },
      {
        id: 'DS-007',
        name: '微信小程序用户数据',
        platform: '微信',
        projectCount: 5,
        batchCount: 20,
        lastUpdated: '2025-11-11 10:00:00',
        fields: ['用户ID', '用户昵称', '注册时间', '最后活跃时间', '访问次数', '用户标签'],
      },
    ])

    // 模拟加载外部数据集
    setExternalData([
      {
        id: 'ED-001',
        fileName: '微信账单数据_20251110.xlsx',
        platform: '微信',
        uploadedBy: '运营A',
        uploadedAt: '2025-11-10 09:30:00',
        fileSize: '2.3 MB',
        status: '有效',
        enabled: true,
      },
      {
        id: 'ED-002',
        fileName: '支付宝账单数据_20251109.csv',
        platform: '支付宝',
        uploadedBy: '运营B',
        uploadedAt: '2025-11-09 14:00:00',
        fileSize: '1.8 MB',
        status: '有效',
        enabled: false,
      },
    ])

    // 模拟加载数据映射
    setDataMappings([
      {
        id: 'DM-001',
        name: '微信支付字段映射表.xlsx',
        platform: '微信',
        uploadedBy: '运营A',
        uploadedAt: '2025-11-08 10:00:00',
        fileSize: '0.5 MB',
        targetDataset: '微信支付账单',
        enabled: true,
      },
    ])
  }, [clientId])

  const systemColumns: ColumnsType<SystemDataset> = [
    {
      title: '数据集ID',
      dataIndex: 'id',
      key: 'id',
      width: 140,
    },
    {
      title: '数据集名称',
      dataIndex: 'name',
      key: 'name',
      width: 180,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: string) => <Tag color="blue">{platform}</Tag>,
    },
    {
      title: '项目数',
      dataIndex: 'projectCount',
      key: 'projectCount',
      width: 100,
    },
    {
      title: '批次数',
      dataIndex: 'batchCount',
      key: 'batchCount',
      width: 100,
    },
    {
      title: '最后更新时间',
      dataIndex: 'lastUpdated',
      key: 'lastUpdated',
      width: 180,
    },
    {
      title: '操作',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setPreviewDataset(record)
              setPreviewModalOpen(true)
            }}
          >
            预览
          </Button>
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => {
              setDetailDataset(record)
              setDetailModalOpen(true)
            }}
          >
            查看详情
          </Button>
        </Space>
      ),
    },
  ]

  const externalColumns: ColumnsType<ExternalDataset> = [
    {
      title: '文件名',
      dataIndex: 'fileName',
      key: 'fileName',
      width: 280,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: string) => <Tag color="cyan">{platform}</Tag>,
    },
    {
      title: '上传人',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 120,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 180,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => (
        <Tag color={status === '有效' ? 'success' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: ExternalDataset) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggleExternalDataset(record.id)}
          checkedChildren="启用"
          unCheckedChildren="关闭"
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: () => (
        <Space size="small">
          <Button type="link" size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const mappingColumns: ColumnsType<DataMapping> = [
    {
      title: '映射表名称',
      dataIndex: 'name',
      key: 'name',
      width: 250,
    },
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 120,
      render: (platform: string) => <Tag color="purple">{platform}</Tag>,
    },
    {
      title: '目标数据集',
      dataIndex: 'targetDataset',
      key: 'targetDataset',
      width: 180,
    },
    {
      title: '上传人',
      dataIndex: 'uploadedBy',
      key: 'uploadedBy',
      width: 120,
    },
    {
      title: '上传时间',
      dataIndex: 'uploadedAt',
      key: 'uploadedAt',
      width: 180,
    },
    {
      title: '文件大小',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 120,
    },
    {
      title: '启用状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean, record: DataMapping) => (
        <Switch
          checked={enabled}
          onChange={() => handleToggleDataMapping(record.id)}
          checkedChildren="启用"
          unCheckedChildren="关闭"
        />
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 180,
      render: () => (
        <Space size="small">
          <Button type="link" size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const handleUpload = () => {
    uploadForm.validateFields().then((values) => {
      message.success(`文件上传成功（模拟）：${values.fileName}`)
      setUploadModalOpen(false)
      uploadForm.resetFields()
    })
  }

  const handleMappingUpload = () => {
    mappingForm.validateFields().then((values) => {
      message.success(`数据映射表上传成功（模拟）：${values.fileName}`)
      setMappingModalOpen(false)
      mappingForm.resetFields()
    })
  }

  const handleDetailSearch = () => {
    detailFilterForm.validateFields().then(() => {
      message.success('筛选条件已应用（模拟）')
    })
  }

  // 切换外部数据集启用状态
  const handleToggleExternalDataset = (id: string) => {
    setExternalData((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newEnabled = !item.enabled
          message.success(`${newEnabled ? '已启用' : '已关闭'}外部数据集（模拟）`)
          return { ...item, enabled: newEnabled }
        }
        return item
      }),
    )
  }

  // 切换数据映射启用状态
  const handleToggleDataMapping = (id: string) => {
    setDataMappings((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newEnabled = !item.enabled
          message.success(`${newEnabled ? '已启用' : '已关闭'}数据映射表（模拟）`)
          return { ...item, enabled: newEnabled }
        }
        return item
      }),
    )
  }

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
            href: `/clients/${clientId}/activities`,
            title: '客户看板',
          },
          {
            title: '源数据管理',
          },
        ]}
      />
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          {clientName || '加载中...'} {businessType && `· ${businessType}`}
        </Title>
      </div>

      <Alert
        message="提醒"
        description="提醒内容待补充"
        type="info"
        showIcon
        className={styles.alert}
        closable
      />

      <Card className={styles.card} title="系统数据集">
        <Table<SystemDataset>
          rowKey="id"
          columns={systemColumns}
          dataSource={systemData}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1200 }}
        />
      </Card>

      <Card
        className={styles.card}
        title="外部数据集"
        extra={
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalOpen(true)}>
            上传文件
          </Button>
        }
      >
        <Alert
          message="上传说明"
          description="此处仅支持上传账单数据，请严格按照模板进行上传;数据by平台与系统数据集进行绑定，请上传前认真检查；如果需要修改，可删除目标数据也可直接上传新数据，同一笔账单新上传覆盖先前上传；"
          type="warning"
          showIcon
          className={styles.uploadAlert}
        />
        <Table<ExternalDataset>
          rowKey="id"
          columns={externalColumns}
          dataSource={externalData}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Card
        className={styles.card}
        title="数据映射"
        extra={
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setMappingModalOpen(true)}>
            上传映射表
          </Button>
        }
      >
        <Text type="secondary" className={styles.mappingDesc}>
          业务人员可根据客户需求上传数据映射表，用来替换系统数据集的指定字段
        </Text>
        <Table<DataMapping>
          rowKey="id"
          columns={mappingColumns}
          dataSource={dataMappings}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 上传外部数据集弹窗 */}
      <Modal
        title="上传外部数据集"
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false)
          uploadForm.resetFields()
        }}
        onOk={handleUpload}
        okText="确认上传"
        width={600}
      >
        <Form form={uploadForm} layout="vertical">
          <Form.Item
            name="platform"
            label="所属平台"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Select placeholder="请选择平台" options={platformOptions} />
          </Form.Item>
          <Form.Item
            name="fileName"
            label="文件"
            rules={[{ required: true, message: '请上传文件' }]}
            extra={
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  请先下载模板，填写数据后上传
                </Text>
                <Button type="link" size="small" href="/mock/templates/bill-template.csv" download>
                  下载模板
                </Button>
              </div>
            }
          >
            <Upload.Dragger beforeUpload={() => false} maxCount={1}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽上传文件</p>
              <p className="ant-upload-hint">支持 CSV/XLSX 格式</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* 上传数据映射表弹窗 */}
      <Modal
        title="上传数据映射表"
        open={mappingModalOpen}
        onCancel={() => {
          setMappingModalOpen(false)
          mappingForm.resetFields()
        }}
        onOk={handleMappingUpload}
        okText="确认上传"
        width={600}
      >
        <Form form={mappingForm} layout="vertical">
          <Form.Item
            name="platform"
            label="所属平台"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Select placeholder="请选择平台" options={platformOptions} />
          </Form.Item>
          <Form.Item
            name="targetDataset"
            label="目标数据集"
            rules={[{ required: true, message: '请选择目标数据集' }]}
          >
            <Select
              placeholder="请选择要映射的系统数据集"
              options={systemData.map((ds) => ({ label: ds.name, value: ds.name }))}
            />
          </Form.Item>
          <Form.Item
            name="fileName"
            label="映射表文件"
            rules={[{ required: true, message: '请上传文件' }]}
            extra={
              <div>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  请先下载模板，填写映射关系后上传
                </Text>
                <Button type="link" size="small" href="/mock/templates/mapping-template.csv" download>
                  下载模板
                </Button>
              </div>
            }
          >
            <Upload.Dragger beforeUpload={() => false} maxCount={1}>
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽上传文件</p>
              <p className="ant-upload-hint">支持 CSV/XLSX 格式</p>
            </Upload.Dragger>
          </Form.Item>
        </Form>
      </Modal>

      {/* 预览数据集字段弹窗 */}
      <Modal
        title={`预览 - ${previewDataset?.name}`}
        open={previewModalOpen}
        onCancel={() => {
          setPreviewModalOpen(false)
          setPreviewDataset(null)
        }}
        footer={[
          <Button key="close" onClick={() => setPreviewModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {previewDataset && (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="数据集ID">{previewDataset.id}</Descriptions.Item>
              <Descriptions.Item label="数据集名称">{previewDataset.name}</Descriptions.Item>
              <Descriptions.Item label="平台">{previewDataset.platform}</Descriptions.Item>
              <Descriptions.Item label="项目数">{previewDataset.projectCount}</Descriptions.Item>
              <Descriptions.Item label="批次数">{previewDataset.batchCount}</Descriptions.Item>
              <Descriptions.Item label="最后更新时间">{previewDataset.lastUpdated}</Descriptions.Item>
            </Descriptions>
            <Divider>字段信息</Divider>
            <div className={styles.fieldsList}>
              {previewDataset.fields?.map((field, index) => (
                <Tag key={index} color="blue" style={{ marginBottom: 8 }}>
                  {field}
                </Tag>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* 查看数据集详情弹窗 */}
      <Modal
        title={`数据明细 - ${detailDataset?.name}`}
        open={detailModalOpen}
        onCancel={() => {
          setDetailModalOpen(false)
          setDetailDataset(null)
          detailFilterForm.resetFields()
        }}
        footer={[
          <Button key="download" type="primary" icon={<DownloadOutlined />}>
            下载数据
          </Button>,
          <Button key="close" onClick={() => setDetailModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={1200}
      >
        {detailDataset && (
          <div>
            <Form form={detailFilterForm} layout="inline" className={styles.filterForm}>
              <Form.Item name="project" label="项目">
                <Select placeholder="请选择项目" style={{ width: 200 }} allowClear>
                  <Select.Option value="project1">项目1</Select.Option>
                  <Select.Option value="project2">项目2</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="timeRange" label="时间范围">
                <RangePicker style={{ width: 240 }} />
              </Form.Item>
              <Form.Item name="channel" label="渠道">
                <Select placeholder="请选择渠道" style={{ width: 150 }} allowClear>
                  <Select.Option value="channel1">渠道1</Select.Option>
                  <Select.Option value="channel2">渠道2</Select.Option>
                </Select>
              </Form.Item>
              <Form.Item name="search" label="搜索">
                <Input
                  placeholder="批次名称/编码"
                  prefix={<SearchOutlined />}
                  style={{ width: 200 }}
                  allowClear
                />
              </Form.Item>
              <Form.Item>
                <Button type="primary" icon={<SearchOutlined />} onClick={handleDetailSearch}>
                  查询
                </Button>
              </Form.Item>
            </Form>
            <Divider />
            <Table
              rowKey="id"
              columns={[
                { title: '批次名称', dataIndex: 'batchName', key: 'batchName', width: 200 },
                { title: '批次编码', dataIndex: 'batchCode', key: 'batchCode', width: 150 },
                { title: '项目名称', dataIndex: 'projectName', key: 'projectName', width: 150 },
                { title: '交易时间', dataIndex: 'tradeTime', key: 'tradeTime', width: 180 },
                { title: '交易金额', dataIndex: 'amount', key: 'amount', width: 120 },
                { title: '渠道', dataIndex: 'channel', key: 'channel', width: 120 },
              ]}
              dataSource={[
                {
                  id: '1',
                  batchName: '康师傅指定品满3.01减3元',
                  batchCode: '12345678',
                  projectName: '康师傅秋季促销活动',
                  tradeTime: '2025-11-10 14:30:00',
                  amount: '99.00',
                  channel: '线上',
                },
              ]}
              pagination={{ pageSize: 10 }}
              scroll={{ y: 400 }}
            />
          </div>
        )}
      </Modal>
    </div>
  )
}
