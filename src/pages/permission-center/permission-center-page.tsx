import { useEffect, useMemo, useState } from 'react'
import { Card, Statistic, Table, Tag, Input, Select, Space, Typography, Skeleton, Empty } from 'antd'
import type { TableColumnsType } from 'antd'
import {
  getPermissionMatrix,
  getPermissionMembers,
  getPermissionRoles,
} from '../../services/permission-center-service'
import type {
  PermissionAction,
  PermissionMember,
  PermissionModule,
  PermissionRole,
} from '../../types/permission'
import styles from './permission-center-page.module.css'

const { Search } = Input
const { Text } = Typography

type MatrixRow = {
  module: PermissionModule
  [roleId: string]: PermissionAction[] | PermissionModule
}

export default function PermissionCenterPage() {
  const [roles, setRoles] = useState<PermissionRole[]>([])
  const [matrix, setMatrix] = useState<Record<string, { module: PermissionModule; actions: PermissionAction[] }[]>>({})
  const [members, setMembers] = useState<PermissionMember[]>([])
  const [loading, setLoading] = useState(true)
  const [memberSearch, setMemberSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('全部角色')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [roleList, matrixData, memberList] = await Promise.all([
          getPermissionRoles(),
          getPermissionMatrix(),
          getPermissionMembers(),
        ])
        setRoles(roleList)
        setMatrix(matrixData)
        setMembers(memberList)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const stats = useMemo(() => {
    const totalMembers = members.length
    const inactiveMembers = members.filter((member) => member.status !== '正常').length
    const latestUpdatedAt = roles.reduce<string>(
      (latest, role) => (role.updatedAt > latest ? role.updatedAt : latest),
      '',
    )
    return [
      { title: '角色数量', value: roles.length },
      { title: '成员总数', value: totalMembers },
      { title: '最近更新', value: latestUpdatedAt || '—' },
      { title: '异常成员', value: inactiveMembers },
    ]
  }, [members, roles])

  const matrixRows: MatrixRow[] = useMemo(() => {
    const moduleSet = new Set<PermissionModule>()
    Object.values(matrix).forEach((cells) => {
      cells.forEach((cell) => moduleSet.add(cell.module))
    })
    return Array.from(moduleSet).map((module) => {
      const row: MatrixRow = { module }
      roles.forEach((role) => {
        const cells = matrix[role.id] ?? []
        const cell = cells.find((item) => item.module === module)
        row[role.id] = cell?.actions ?? []
      })
      return row
    })
  }, [matrix, roles])

  const matrixColumns: TableColumnsType<MatrixRow> = useMemo(() => {
    const baseColumn: TableColumnsType<MatrixRow>[number] = {
      title: '系统功能模块',
      dataIndex: 'module',
      key: 'module',
      width: 180,
      render: (value: PermissionModule) => <Text strong>{value}</Text>,
    }
    const dynamicColumns = roles.map((role) => ({
      title: role.name,
      dataIndex: role.id,
      key: role.id,
      render: (actions: PermissionAction[]) =>
        actions && actions.length > 0 ? (
          actions.map((action) => (
            <Tag key={action} color="blue" className={styles.matrixTag}>
              {action}
            </Tag>
          ))
        ) : (
          <Tag color="default">无权限</Tag>
        ),
    }))
    return [baseColumn, ...dynamicColumns]
  }, [roles])

  const filteredMembers = useMemo(() => {
    const kw = memberSearch.trim().toLowerCase()
    return members.filter((member) => {
      const matchKw =
        kw.length === 0 ||
        member.name.toLowerCase().includes(kw) ||
        member.email.toLowerCase().includes(kw)
      const matchRole = roleFilter === '全部角色' || member.roleId === roleFilter
      return matchKw && matchRole
    })
  }, [members, memberSearch, roleFilter])

  const memberColumns: TableColumnsType<PermissionMember> = [
    { title: '姓名', dataIndex: 'name', key: 'name', width: 160 },
    { title: '邮箱', dataIndex: 'email', key: 'email', width: 220 },
    {
      title: '角色',
      dataIndex: 'roleId',
      key: 'roleId',
      render: (id: string) => roles.find((role) => role.id === id)?.name ?? '—',
      width: 160,
    },
    { title: '加入时间', dataIndex: 'joinedAt', key: 'joinedAt', width: 160 },
    { title: '最近活跃', dataIndex: 'lastActiveAt', key: 'lastActiveAt', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: PermissionMember['status']) => {
        const color = status === '正常' ? 'green' : status === '停用' ? 'red' : 'orange'
        return <Tag color={color}>{status}</Tag>
      },
      width: 120,
    },
  ]

  return (
    <div className={styles.page}>
      <Card>
        <h3 style={{ marginBottom: 4 }}>权限中心</h3>
        <Text type="secondary">
          统一管理系统角色与权限，确保数据安全与操作合规。
        </Text>
      </Card>

      {loading ? (
        <Skeleton active />
      ) : (
        <>
          <div className={styles.statCards}>
            {stats.map((stat) => (
              <Card key={stat.title}>
                <Statistic title={stat.title} value={stat.value} />
              </Card>
            ))}
          </div>

          <Card title="角色权限矩阵" className={styles.matrixTable}>
            {matrixRows.length === 0 ? (
              <Empty description="暂无权限配置" />
            ) : (
              <Table<MatrixRow>
                columns={matrixColumns}
                dataSource={matrixRows}
                pagination={false}
                rowKey="module"
                scroll={{ x: true }}
                size="small"
              />
            )}
          </Card>

          <Card>
            <div className={styles.memberHeader}>
              <h3 style={{ marginBottom: 0 }}>成员列表</h3>
              <Space className={styles.filters}>
                <Search
                  placeholder="搜索姓名或邮箱"
                  allowClear
                  onSearch={setMemberSearch}
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  style={{ width: 240 }}
                />
                <Select
                  value={roleFilter}
                  style={{ width: 200 }}
                  onChange={setRoleFilter}
                  options={[
                    { label: '全部角色', value: '全部角色' },
                    ...roles.map((role) => ({ label: role.name, value: role.id })),
                  ]}
                />
              </Space>
            </div>
            <Table<PermissionMember>
              style={{ marginTop: 16 }}
              columns={memberColumns}
              dataSource={filteredMembers}
              rowKey="id"
              pagination={{ pageSize: 10 }}
              size="small"
            />
          </Card>
        </>
      )}
    </div>
  )
}

