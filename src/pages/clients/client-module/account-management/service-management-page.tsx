import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  message,
  Popconfirm,
  Typography,
  Switch,
  Breadcrumb,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  SearchOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import type { Service } from '../../../../types/client-account'
import { ServiceManagementService } from '../../../../services/service-management-service'
import styles from './client-account-page.module.css'

const { Text } = Typography

export default function ServiceManagementPage() {
  const { clientId } = useParams<{ clientId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [searchText, setSearchText] = useState('')

  useEffect(() => {
    if (clientId) {
      loadServices()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const loadServices = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const data = await ServiceManagementService.getServices(clientId)
      setServices(data)
    } catch (error) {
      const err = error as Error
      message.error(`加载服务列表失败：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter((service) =>
    service.name.toLowerCase().includes(searchText.toLowerCase()) ||
    service.description.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleToggleService = async (service: Service) => {
    if (!clientId) return
    try {
      if (service.isEnabled) {
        await ServiceManagementService.disableService(clientId, service.id)
        message.success('服务已关闭')
      } else {
        await ServiceManagementService.enableService(clientId, service.id)
        message.success('服务已开通')
      }
      await loadServices()
    } catch (error) {
      const err = error as Error
      message.error(`操作失败：${err.message}`)
    }
  }

  const columns: ColumnsType<Service> = [
    {
      title: '服务名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: '服务描述',
      dataIndex: 'description',
      key: 'description',
      width: 300,
    },
    {
      title: '关联功能权限',
      dataIndex: 'functionPermissions',
      key: 'functionPermissions',
      width: 250,
      render: (permissions: Service['functionPermissions']) => (
        <Space wrap>
          {permissions.map((p) => (
            <Tag key={p} color="blue">
              {p}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '服务状态',
      dataIndex: 'isEnabled',
      key: 'isEnabled',
      width: 120,
      render: (isEnabled: boolean, record: Service) => (
        <Space>
          {isEnabled ? (
            <>
              <Tag color="success" icon={<CheckCircleOutlined />}>
                已开通
              </Tag>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {record.enabledAt}
              </Text>
            </>
          ) : (
            <Tag color="default" icon={<CloseCircleOutlined />}>
              未开通
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: Service) => (
        <Popconfirm
          title={record.isEnabled ? '确定要关闭该服务吗？' : '确定要开通该服务吗？'}
          description={
            record.isEnabled
              ? '关闭后，相关功能权限将无法分配给账号'
              : '开通后，相关功能权限可以分配给账号'
          }
          onConfirm={() => handleToggleService(record)}
          okText="确定"
          cancelText="取消"
        >
          <Switch checked={record.isEnabled} />
        </Popconfirm>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <a onClick={() => navigate(`/clients/${clientId}/account`)}>客户账号</a>
            ),
          },
          {
            title: '服务管理',
          },
        ]}
      />
      <div className={styles.pageHeader}>
        <Text strong style={{ fontSize: 18 }}>
          服务管理
        </Text>
        <Space>
          <Input
            placeholder="搜索服务名称或描述"
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<ReloadOutlined />} onClick={loadServices}>
            刷新
          </Button>
        </Space>
      </div>

      <Card>
        <div style={{ marginBottom: 16 }}>
          <Text type="secondary">
            部分功能需要先开通对应服务后，才可给账号配置相关权限。服务开通后，相关功能权限才能分配给账号。
          </Text>
        </div>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredServices}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>
    </div>
  )
}

