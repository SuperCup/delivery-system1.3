import { useEffect, useMemo, useState } from 'react'
import { Card, Table, Tag, Input, Select, Space, Typography, Button, Form } from 'antd'
import type { TableColumnsType } from 'antd'
import { getPermissionMembers, getPermissionRoles } from '../../services/permission-center-service'
import type { PermissionMember, PermissionRole } from '../../types/permission'
import styles from './permission-center-page.module.css'

const { Text } = Typography

export default function PermissionCenterPage() {
  const [members, setMembers] = useState<PermissionMember[]>([])
  const [roles, setRoles] = useState<PermissionRole[]>([])
  const [loading, setLoading] = useState(true)
  const [nameSearch, setNameSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('全部')
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 10

  const [form] = Form.useForm()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [roleList, memberList] = await Promise.all([getPermissionRoles(), getPermissionMembers()])
        setRoles(roleList)
        setMembers(memberList)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  useEffect(() => {
    form.setFieldsValue({
      status: '全部',
    })
  }, [form])

  const filteredMembers = useMemo(() => {
    const kw = nameSearch.trim().toLowerCase()
    return members.filter((member) => {
      const matchName = kw.length === 0 || member.name.toLowerCase().includes(kw)
      const matchStatus = statusFilter === '全部' || member.status === statusFilter
      return matchName && matchStatus
    })
  }, [members, nameSearch, statusFilter])

  const pagedMembers = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredMembers.slice(start, start + pageSize)
  }, [filteredMembers, currentPage, pageSize])

  const handleSearch = () => {
    const values = form.getFieldsValue()
    setNameSearch(values.name || '')
    setStatusFilter(values.status || '全部')
    setCurrentPage(1)
  }

  const handleReset = () => {
    form.resetFields()
    setNameSearch('')
    setStatusFilter('全部')
    setCurrentPage(1)
  }

  const handleViewPermissions = (member: PermissionMember) => {
    // TODO: 实现查看权限功能
    console.log('查看权限', member)
  }

  const handleEdit = (member: PermissionMember) => {
    // TODO: 实现编辑功能
    console.log('编辑', member)
  }

  const handleDisable = (member: PermissionMember) => {
    // TODO: 实现禁用功能
    console.log('禁用', member)
  }

  const memberColumns: TableColumnsType<PermissionMember> = [
    {
      title: '成员姓名',
      dataIndex: 'name',
      key: 'name',
      width: 150,
    },
    {
      title: '角色',
      dataIndex: 'roleId',
      key: 'roleId',
      width: 150,
      render: (id: string) => roles.find((role) => role.id === id)?.name ?? '—',
    },
    {
      title: '权限',
      key: 'permissions',
      width: 100,
      render: (_: unknown, record: PermissionMember) => (
        <Button type="link" size="small" onClick={() => handleViewPermissions(record)}>
          查看
        </Button>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: PermissionMember['status']) => (
        <Tag color={status === '启用' ? 'green' : 'default'}>{status}</Tag>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 150,
      render: (_: unknown, record: PermissionMember) => (
        <Space>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handleDisable(record)}>
            禁用
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>成员管理</h3>
            <Text type="secondary">成员都是从公司内部员工管理系统同步过来，在权限中心配置系统角色后，可正常访问对应页面</Text>
          </div>
        </div>

        <div className={styles.filters}>
          <Form form={form} layout="inline" onFinish={handleSearch}>
            <Form.Item label="名称:" name="name">
              <Input placeholder="请输入成员姓名" style={{ width: 200 }} allowClear />
            </Form.Item>
            <Form.Item label="状态:" name="status">
              <Select
                placeholder="请选择状态"
                style={{ width: 150 }}
                options={[
                  { label: '全部', value: '全部' },
                  { label: '启用', value: '启用' },
                  { label: '禁用', value: '禁用' },
                ]}
              />
            </Form.Item>
            <Form.Item className={styles.actionButtons}>
              <Space>
                <Button type="primary" htmlType="submit">
                  查询
                </Button>
                <Button onClick={handleReset}>重置</Button>
              </Space>
            </Form.Item>
          </Form>
        </div>

        <Table<PermissionMember>
          columns={memberColumns}
          dataSource={pagedMembers}
          rowKey="id"
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: filteredMembers.length,
            showSizeChanger: false,
            showQuickJumper: true,
            showTotal: (total) => `共${total}条`,
            onChange: (page) => setCurrentPage(page),
          }}
          size="middle"
        />
      </Card>
    </div>
  )
}
