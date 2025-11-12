import { useState, useEffect, useMemo } from 'react'
import { Card, Table, Button, Space, Tag, Typography, Upload, message, Modal, Form, Input } from 'antd'
import { UploadOutlined, DeleteOutlined, DownloadOutlined } from '@ant-design/icons'
import { useLocation, useParams } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import styles from './data-source-management-page.module.css'

const { Title, Text } = Typography

type SystemDataset = {
  id: string
  name: string
  platform: string
  projectCount: number
  batchCount: number
  lastUpdated: string
}

type ManualFile = {
  id: string
  fileName: string
  platform: string
  uploadedBy: string
  uploadedAt: string
  fileSize: string
  status: '有效' | '已过期'
}

export default function DataSourceManagementPage() {
  const location = useLocation()
  const { clientId: routeClientId } = useParams<{ clientId?: string }>()
  const searchParams = new URLSearchParams(location.search)
  const clientId = useMemo(
    () => searchParams.get('clientId') || routeClientId || '',
    [location.search, routeClientId],
  )
  const businessType = searchParams.get('businessType') || ''
  const [clientName, setClientName] = useState('')

  const [systemData, setSystemData] = useState<SystemDataset[]>([])
  const [manualFiles, setManualFiles] = useState<ManualFile[]>([])
  const [uploadModalOpen, setUploadModalOpen] = useState(false)
  const [form] = Form.useForm()

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
        name: '微信小程序数据集',
        platform: '微信',
        projectCount: 3,
        batchCount: 12,
        lastUpdated: '2025-11-10 14:30:00',
      },
      {
        id: 'DS-002',
        name: '支付宝生活号数据集',
        platform: '支付宝',
        projectCount: 2,
        batchCount: 8,
        lastUpdated: '2025-11-09 16:20:00',
      },
      {
        id: 'DS-003',
        name: '抖音到店数据集',
        platform: '抖音到店',
        projectCount: 4,
        batchCount: 15,
        lastUpdated: '2025-11-08 10:15:00',
      },
    ])

    // 模拟加载人工上传文件
    setManualFiles([
      {
        id: 'MF-001',
        fileName: '天猫双十一活动数据.xlsx',
        platform: '天猫',
        uploadedBy: '运营A',
        uploadedAt: '2025-11-05 09:30:00',
        fileSize: '2.3 MB',
        status: '有效',
      },
      {
        id: 'MF-002',
        fileName: '京东618补充数据.csv',
        platform: '京东',
        uploadedBy: '运营B',
        uploadedAt: '2025-10-20 14:00:00',
        fileSize: '1.8 MB',
        status: '已过期',
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
      width: 220,
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
      width: 120,
      render: () => (
        <Button type="link" size="small">
          查看详情
        </Button>
      ),
    },
  ]

  const manualColumns: ColumnsType<ManualFile> = [
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
    form.validateFields().then((values) => {
      message.success(`文件上传成功（模拟）：${values.fileName}`)
      setUploadModalOpen(false)
      form.resetFields()
    })
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          源数据管理 - {clientName || '加载中...'} {businessType && `· ${businessType}`}
        </Title>
        <Text type="secondary">管理活动所需的系统数据集与人工上传文件</Text>
      </div>

      <Card className={styles.card} title="系统数据集">
        <Table<SystemDataset>
          rowKey="id"
          columns={systemColumns}
          dataSource={systemData}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Card
        className={styles.card}
        title="人工上传文件"
        extra={
          <Button type="primary" icon={<UploadOutlined />} onClick={() => setUploadModalOpen(true)}>
            上传文件
          </Button>
        }
      >
        <Table<ManualFile>
          rowKey="id"
          columns={manualColumns}
          dataSource={manualFiles}
          pagination={{ pageSize: 8 }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title="上传数据文件"
        open={uploadModalOpen}
        onCancel={() => {
          setUploadModalOpen(false)
          form.resetFields()
        }}
        onOk={handleUpload}
        okText="确认上传"
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="platform"
            label="所属平台"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Input placeholder="如：天猫、京东、美团等" />
          </Form.Item>
          <Form.Item
            name="fileName"
            label="文件"
            rules={[{ required: true, message: '请上传文件' }]}
          >
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button icon={<UploadOutlined />}>选择文件</Button>
            </Upload>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

