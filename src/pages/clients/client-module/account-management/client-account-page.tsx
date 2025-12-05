import { useEffect, useState, useMemo } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Tag,
  Input,
  message,
  Modal,
  Form,
  Select,
  Popconfirm,
  Typography,
  Descriptions,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  StopOutlined,
  CheckCircleOutlined,
  FileTextOutlined,
  LinkOutlined,
  EditOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import type {
  ClientAccount,
  LoginLog,
  CreateAccountFormData,
  FunctionPermission,
} from '../../../../types/client-account'
import { ClientAccountService } from '../../../../services/client-account-service'
import { BusinessRegionService } from '../../../../services/business-region-service'
import type { BusinessRegionMapping } from '../../../../types/business-region'
import { encryptEmail } from '../../../../utils/email-encrypt'
import styles from './client-account-page.module.css'

const { Text } = Typography

export default function ClientAccountPage() {
  const { clientId } = useParams<{ clientId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [accounts, setAccounts] = useState<ClientAccount[]>([])
  const [searchText, setSearchText] = useState('')
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<ClientAccount | null>(null)
  const [loginLogModalOpen, setLoginLogModalOpen] = useState(false)
  const [viewingAccount, setViewingAccount] = useState<ClientAccount | null>(null)
  const [loginLogs, setLoginLogs] = useState<LoginLog[]>([])
  const [subBrands, setSubBrands] = useState<Array<{
    id: string
    brandName: string
    subBrandName: string
    displayName: string
  }>>([])
  const [regions, setRegions] = useState<BusinessRegionMapping[]>([])
  const [form] = Form.useForm<CreateAccountFormData>()

  useEffect(() => {
    if (clientId) {
      loadAccounts()
      loadSubBrands()
      loadRegions()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const loadAccounts = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const data = await ClientAccountService.getClientAccounts(clientId)
      setAccounts(data)
    } catch (error) {
      const err = error as Error
      message.error(`加载账号列表失败：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadSubBrands = async () => {
    if (!clientId) return
    try {
      const data = await ClientAccountService.getClientSubBrands(clientId)
      setSubBrands(data)
    } catch (error) {
      console.error('加载子品牌列表失败:', error)
    }
  }

  const loadRegions = async () => {
    if (!clientId) return
    try {
      const data = await BusinessRegionService.getBusinessRegionMappings(clientId)
      setRegions(data)
    } catch (error) {
      console.error('加载业务区域失败:', error)
    }
  }


  const filteredAccounts = useMemo(() => {
    if (!searchText.trim()) return accounts
    const keyword = searchText.toLowerCase()
    return accounts.filter(
      (account) =>
        account.accountName.toLowerCase().includes(keyword) ||
        account.name.toLowerCase().includes(keyword) ||
        account.email.toLowerCase().includes(keyword) ||
        account.creator.toLowerCase().includes(keyword),
    )
  }, [accounts, searchText])

  const handleCreate = () => {
    form.resetFields()
    setEditingAccount(null)
    setCreateModalOpen(true)
  }

  const handleEdit = (account: ClientAccount) => {
    setEditingAccount(account)
    form.setFieldsValue({
      accountName: account.accountName,
      name: account.name,
      email: account.email,
      functionPermissions: account.functionPermissions,
      regionIds: account.regionIds,
      subBrandIds: account.subBrandIds,
    })
    setEditModalOpen(true)
  }

  const handleEditSubmit = async () => {
    if (!clientId || !editingAccount) return
    try {
      const values = await form.validateFields()
      await ClientAccountService.updateAccount(clientId, editingAccount.id, values)
      message.success('账号更新成功')
      setEditModalOpen(false)
      form.resetFields()
      setEditingAccount(null)
      await loadAccounts()
    } catch (error) {
      const err = error as { errorFields?: unknown }
      if (err?.errorFields) return
      const errorMessage = error instanceof Error ? error.message : '更新失败'
      message.error(`更新失败：${errorMessage}`)
    }
  }

  const handleCreateSubmit = async () => {
    if (!clientId) return
    try {
      const values = await form.validateFields()
      const newAccount = await ClientAccountService.createAccount(clientId, values)
      message.success('账号创建成功')
      setCreateModalOpen(false)
      form.resetFields()
      await loadAccounts()

      // 根据选择的发送方式，提示用户
      if (values.sendMethod === '链接') {
        Modal.info({
          title: '激活链接已生成',
          content: (
            <div>
              <p>请将以下链接发送给客户：</p>
              <Text code copyable>
                {newAccount.activationLink}
              </Text>
            </div>
          ),
          width: 600,
        })
      } else {
        message.success('激活邮件已发送')
      }
    } catch (error) {
      const err = error as { errorFields?: unknown }
      if (err?.errorFields) return
      const errorMessage = error instanceof Error ? error.message : '创建失败'
      message.error(`创建失败：${errorMessage}`)
    }
  }

  const handleDisable = async (account: ClientAccount) => {
    if (!clientId) return
    try {
      await ClientAccountService.disableAccount(clientId, account.id)
      message.success('账号已禁用')
      await loadAccounts()
    } catch (error) {
      const err = error as Error
      message.error(`禁用失败：${err.message}`)
    }
  }

  const handleEnable = async (account: ClientAccount) => {
    if (!clientId) return
    try {
      await ClientAccountService.enableAccount(clientId, account.id)
      message.success('账号已启用')
      await loadAccounts()
    } catch (error) {
      const err = error as Error
      message.error(`启用失败：${err.message}`)
    }
  }

  const handleViewLoginLogs = async (account: ClientAccount) => {
    if (!clientId) return
    setViewingAccount(account)
    setLoginLogModalOpen(true)
    try {
      const logs = await ClientAccountService.getLoginLogs(clientId, account.id)
      setLoginLogs(logs)
    } catch (error) {
      const err = error as Error
      message.error(`加载登录日志失败：${err.message}`)
    }
  }

  const columns: ColumnsType<ClientAccount> = [
    {
      title: '账号名',
      dataIndex: 'accountName',
      key: 'accountName',
      width: 150,
    },
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
      width: 120,
      render: (name: string) => (
        <Space>
          <Text>{name}</Text>
          <LinkOutlined style={{ color: '#1890ff', fontSize: 12 }} />
        </Space>
      ),
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
      width: 200,
      render: (email: string) => encryptEmail(email),
    },
    {
      title: '账号状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const color = status === '使用中' ? 'success' : status === '已禁用' ? 'error' : 'default'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '手机登录',
      dataIndex: 'mobileLogin',
      key: 'mobileLogin',
      width: 120,
      render: (status: string) => {
        const color = status === '已绑定' ? 'success' : 'default'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '微信登录',
      dataIndex: 'wechatLogin',
      key: 'wechatLogin',
      width: 120,
      render: (status: string) => {
        const color = status === '已绑定' ? 'success' : 'default'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '创建人',
      dataIndex: 'creator',
      key: 'creator',
      width: 120,
    },
    {
      title: '功能权限',
      dataIndex: 'functionPermissions',
      key: 'functionPermissions',
      width: 200,
      render: (permissions: FunctionPermission[]) => (
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
      title: '负责区域',
      dataIndex: 'regionIds',
      key: 'regionIds',
      width: 150,
      render: (regionIds: string[]) => {
        const regionNames = regionIds
          .map((id) => regions.find((r) => r.id === id)?.regionName)
          .filter(Boolean)
        return regionNames.length > 0 ? (
          <Space wrap>
            {regionNames.map((name, idx) => (
              <Tag key={idx}>{name}</Tag>
            ))}
          </Space>
        ) : (
          '-'
        )
      },
    },
    {
      title: '负责子品牌',
      dataIndex: 'subBrandIds',
      key: 'subBrandIds',
      width: 200,
      render: (subBrandIds: string[]) => {
        const subBrandNames = subBrandIds
          .map((id) => subBrands.find((sb) => sb.id === id)?.displayName)
          .filter(Boolean)
        return subBrandNames.length > 0 ? (
          <Space wrap>
            {subBrandNames.map((name, idx) => (
              <Tag key={idx} color="purple">
                {name}
              </Tag>
            ))}
          </Space>
        ) : (
          '-'
        )
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 220,
      fixed: 'right',
      render: (_: unknown, record: ClientAccount) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          {record.status === '使用中' ? (
            <Popconfirm
              title="确定要禁用该账号吗？"
              onConfirm={() => handleDisable(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" danger size="small" icon={<StopOutlined />}>
                禁用
              </Button>
            </Popconfirm>
          ) : (
            <Button
              type="link"
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleEnable(record)}
            >
              启用
            </Button>
          )}
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => handleViewLoginLogs(record)}
          >
            登录日志
          </Button>
        </Space>
      ),
    },
  ]

  const loginLogColumns: ColumnsType<LoginLog> = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      key: 'loginTime',
      width: 180,
    },
    {
      title: '登录方式',
      dataIndex: 'loginMethod',
      key: 'loginMethod',
      width: 120,
    },
    {
      title: 'IP地址',
      dataIndex: 'ipAddress',
      key: 'ipAddress',
      width: 150,
    },
    {
      title: '设备信息',
      dataIndex: 'deviceInfo',
      key: 'deviceInfo',
      width: 200,
    },
    {
      title: '登录状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        const color = status === '成功' ? 'success' : 'error'
        return <Tag color={color}>{status}</Tag>
      },
    },
    {
      title: '失败原因',
      dataIndex: 'failureReason',
      key: 'failureReason',
      render: (reason?: string) => reason || '-',
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Text strong style={{ fontSize: 18 }}>
          客户账号
        </Text>
        <Space>
          <Input
            placeholder="搜索账号名、姓名、邮箱或创建人"
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button
            onClick={() => navigate(`/clients/${clientId}/account/business-region`)}
          >
            业务区域管理
          </Button>
          <Button
            onClick={() => navigate(`/clients/${clientId}/account/service-management`)}
          >
            服务管理
          </Button>
          <Button
            onClick={() => navigate(`/clients/${clientId}/account/sub-brand`)}
          >
            子品牌管理
          </Button>
          <Button icon={<ReloadOutlined />} onClick={loadAccounts}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建账号
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredAccounts}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
          scroll={{ x: 1800 }}
        />
      </Card>

      {/* 新建账号弹窗 */}
      <Modal
        title="新建账号"
        open={createModalOpen}
        onCancel={() => {
          setCreateModalOpen(false)
          form.resetFields()
        }}
        onOk={handleCreateSubmit}
        okText="创建"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="accountName"
            label="账号名"
            rules={[{ required: true, message: '请输入账号名' }]}
          >
            <Input placeholder="请输入账号名" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="sendMethod"
            label="发送激活链接方式"
            rules={[{ required: true, message: '请选择发送方式' }]}
          >
            <Select placeholder="请选择发送方式">
              <Select.Option value="链接">链接</Select.Option>
              <Select.Option value="邮件">邮件</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item
            name="functionPermissions"
            label="功能权限"
            rules={[{ required: true, message: '请至少选择一个功能权限' }]}
            extra={
              <div>
                <div style={{ color: '#ff4d4f', marginBottom: 4 }}>
                  必须选择功能权限，否则客户将无法访问相关功能页面
                </div>
                <div style={{ color: '#8c8c8c' }}>部分功能需要先开通对应服务</div>
              </div>
            }
          >
            <Select
              mode="multiple"
              placeholder="请选择功能权限"
              options={[
                { label: '到店营销', value: '到店营销' },
                { label: '即时零售', value: '即时零售' },
                { label: '物码营销', value: '物码营销' },
                { label: '数据支持', value: '数据支持' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="regionIds"
            label="负责区域"
            extra={
              <div>
                <div style={{ color: '#8c8c8c', marginBottom: 4 }}>
                  数据权限（仅对即时零售生效）。到店营销因通用账单缺少城市字段，需要人工创建活动加以区分。
                </div>
                <div style={{ color: '#8c8c8c' }}>
                  如客户需要区分，需要先在“业务区域管理”中创建区域，完成客户业务区域与行政区域的映射关系绑定。
                </div>
              </div>
            }
          >
            <Select
              mode="multiple"
              placeholder="请选择负责区域"
              options={regions.map((r) => ({ label: r.regionName, value: r.id }))}
            />
          </Form.Item>
          <Form.Item
            name="subBrandIds"
            label="负责子品牌"
            extra={
              <div>
                <div style={{ color: '#8c8c8c', marginBottom: 4 }}>
                  数据权限（仅对即时零售生效）。系统默认添加子品牌为客户名称，如不一致时，请自行调整。
                </div>
                <div style={{ color: '#8c8c8c' }}>
                  如客户需要区分，需要在“子品牌管理”中维护到家平台对应的品牌账号以及关联子品牌名称。
                </div>
              </div>
            }
          >
            <Select
              mode="multiple"
              placeholder="请选择负责子品牌"
              options={subBrands.map((sb) => ({ label: sb.displayName, value: sb.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑账号弹窗 */}
      <Modal
        title="编辑账号"
        open={editModalOpen}
        onCancel={() => {
          setEditModalOpen(false)
          form.resetFields()
          setEditingAccount(null)
        }}
        onOk={handleEditSubmit}
        okText="保存"
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="accountName"
            label="账号名"
            rules={[{ required: true, message: '请输入账号名' }]}
          >
            <Input placeholder="请输入账号名" />
          </Form.Item>
          <Form.Item
            name="name"
            label="姓名"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="请输入姓名" />
          </Form.Item>
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="functionPermissions"
            label="功能权限"
            rules={[{ required: true, message: '请至少选择一个功能权限' }]}
            extra={
              <div>
                <div style={{ color: '#ff4d4f', marginBottom: 4 }}>
                  必须选择功能权限，否则客户将无法访问相关功能页面
                </div>
                <div style={{ color: '#8c8c8c' }}>部分功能需要先开通对应服务</div>
              </div>
            }
          >
            <Select
              mode="multiple"
              placeholder="请选择功能权限"
              options={[
                { label: '到店营销', value: '到店营销' },
                { label: '即时零售', value: '即时零售' },
                { label: '物码营销', value: '物码营销' },
                { label: '数据支持', value: '数据支持' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="regionIds"
            label="负责区域"
            extra={
              <div>
                <div style={{ color: '#8c8c8c', marginBottom: 4 }}>
                  数据权限（仅对即时零售生效）。到店营销因通用账单缺少城市字段，需要人工创建活动加以区分。
                </div>
                <div style={{ color: '#8c8c8c' }}>
                  如客户需要区分，需要先在“业务区域管理”中创建区域，完成客户业务区域与行政区域的映射关系绑定。
                </div>
              </div>
            }
          >
            <Select
              mode="multiple"
              placeholder="请选择负责区域"
              options={regions.map((r) => ({ label: r.regionName, value: r.id }))}
            />
          </Form.Item>
          <Form.Item
            name="subBrandIds"
            label="负责子品牌"
            extra={
              <div>
                <div style={{ color: '#8c8c8c', marginBottom: 4 }}>
                  数据权限（仅对即时零售生效）。系统默认添加子品牌为客户名称，如不一致时，请自行调整。
                </div>
                <div style={{ color: '#8c8c8c' }}>
                  如客户需要区分，需要在“子品牌管理”中维护到家平台对应的品牌账号以及关联子品牌名称。
                </div>
              </div>
            }
          >
            <Select
              mode="multiple"
              placeholder="请选择负责子品牌"
              options={subBrands.map((sb) => ({ label: sb.displayName, value: sb.id }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 登录日志弹窗 */}
      <Modal
        title="登录日志"
        open={loginLogModalOpen}
        onCancel={() => {
          setLoginLogModalOpen(false)
          setViewingAccount(null)
          setLoginLogs([])
        }}
        footer={[
          <Button key="close" onClick={() => setLoginLogModalOpen(false)}>
            关闭
          </Button>,
        ]}
        width={1000}
      >
        {viewingAccount && (
          <div style={{ marginBottom: 16 }}>
            <Descriptions column={2} size="small" bordered>
              <Descriptions.Item label="账号名">{viewingAccount.accountName}</Descriptions.Item>
              <Descriptions.Item label="姓名">{viewingAccount.name}</Descriptions.Item>
              <Descriptions.Item label="邮箱">{encryptEmail(viewingAccount.email)}</Descriptions.Item>
            </Descriptions>
          </div>
        )}
        <Table
          rowKey="id"
          columns={loginLogColumns}
          dataSource={loginLogs}
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Modal>
    </div>
  )
}
