import { useEffect, useMemo, useState } from 'react'
import { Card, Table, Tag, Button, Space, Typography, message, Tabs } from 'antd'
import styles from './activity-management-page.module.css'
// 活动管理页不再包含客户列表，下拉选择在导航栏实现
import type { ActivityItem, ActivityStatus } from '../../types/activity'
import type { BusinessType } from '../../types/home'
// import { DataDeliveryService } from '../../services/data-delivery-service'
import { useLocation, useNavigate } from 'react-router-dom'
import { ActivityService } from '../../services/activity-service'

const { Title } = Typography

const statusColor = (s: ActivityStatus) => {
  switch (s) {
    case '进行中':
      return 'green'
    case '已结束':
      return 'default'
    default:
      return 'blue'
  }
}

export default function ActivityManagementPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeClientId = useMemo(() => new URLSearchParams(location.search).get('clientId') || '', [location.search])

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(false)

  // 批次详情弹窗已移除：列表不再展示关联批次
  // 新建活动改为独立页面

  // 根据URL参数加载活动

  useEffect(() => {
    if (!activeClientId) return
    setLoading(true)
    ActivityService.getActivitiesByClient(activeClientId)
      .then(setActivities)
      .catch((e) => message.error(`加载活动失败：${e.message}`))
      .finally(() => setLoading(false))
  }, [activeClientId])

  // 客户列表与搜索已移除

  // 已移除批次详情逻辑

  // 业务类型判定：根据平台归类（示例映射）
  const isInstantRetail = (ps: string[]) => ps.some((p) => ['美团', '京东到家', '饿了么'].includes(p))
  const isInStoreMarketing = (ps: string[]) => ps.some((p) => ['微信', '支付宝', '抖音到店', '美团到店', '天猫校园', '抖音'].includes(p))
  const isCodeMarketing = (ps: string[]) => ps.some((p) => ['天猫', '京东', '淘宝'].includes(p))

  const activitiesByType = useMemo(() => {
    const groups: Record<BusinessType, ActivityItem[]> = {
      '到店营销': [],
      '即时零售': [],
      '物码营销': [],
    }
    activities.forEach((a) => {
      if (isInstantRetail(a.platforms)) groups['即时零售'].push(a)
      if (isInStoreMarketing(a.platforms)) groups['到店营销'].push(a)
      if (isCodeMarketing(a.platforms)) groups['物码营销'].push(a)
    })
    return groups
  }, [activities])

  const columns = [
    { title: '活动编号', dataIndex: 'id', key: 'id', width: 160, fixed: 'left' as const },
    { title: '名称', dataIndex: 'name', key: 'name', width: 280, fixed: 'left' as const },
    {
      title: '活动状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (s: ActivityStatus) => <Tag color={statusColor(s)}>{s}</Tag>,
    },
    { title: '活动开始时间', dataIndex: 'startTime', key: 'startTime', width: 200 },
    { title: '活动结束时间', dataIndex: 'endTime', key: 'endTime', width: 200 },
    {
      title: '活动平台',
      dataIndex: 'platforms',
      key: 'platforms',
      width: 220,
      render: (ps: string[]) => {
        const priority = ['微信', '支付宝']
        const sorted = [...ps].sort((a, b) => {
          const ai = priority.includes(a) ? 0 : 1
          const bi = priority.includes(b) ? 0 : 1
          if (ai !== bi) return ai - bi
          return ps.indexOf(a) - ps.indexOf(b)
        })
        return (
          <Space>
            {sorted.map((p) => (
              <Tag key={p}>{p}</Tag>
            ))}
          </Space>
        )
      },
    },
    // 移除“关联批次”列，按要求不在列表中展示批次
    { title: '创建人', dataIndex: 'createdBy', key: 'createdBy', width: 140 },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt', width: 180 },
    {
      title: '操作',
      key: 'action',
      fixed: 'right' as const,
      width: 120,
      render: (_: unknown, r: ActivityItem) => (
        <a href={`/activity-management/detail/${r.id}`} target="_blank" rel="noopener noreferrer">
          详情
        </a>
      ),
    },
  ]

  return (
    <div>
      <Title level={4}>活动管理</Title>
      <div className={styles.container}>
        <Card
          className={styles.content}
          title="活动列表（按业务类型）"
          size="small"
          extra={
            <Button
              type="primary"
              disabled={!activeClientId}
              onClick={() => navigate(`/activity-management/create?clientId=${activeClientId}`)}
            >
              新增活动
            </Button>
          }
        >
          {!activeClientId ? (
            <div className={styles.placeholder}>请在导航栏选择客户以查看活动列表</div>
          ) : (
            <Tabs
              defaultActiveKey="到店营销"
              items={[
                {
                  key: '到店营销',
                  label: `到店营销（${activitiesByType['到店营销'].length}）`,
                  children: (
                    <div className={styles.tableContainer}>
                      <Table<ActivityItem>
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={activitiesByType['到店营销']}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 'max-content' }}
                        className={styles.tableWrap}
                      />
                    </div>
                  ),
                },
                {
                  key: '即时零售',
                  label: `即时零售（${activitiesByType['即时零售'].length}）`,
                  children: (
                    <div className={styles.tableContainer}>
                      <Table<ActivityItem>
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={activitiesByType['即时零售']}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 'max-content' }}
                        className={styles.tableWrap}
                      />
                    </div>
                  ),
                },
                {
                  key: '物码营销',
                  label: `物码营销（${activitiesByType['物码营销'].length}）`,
                  children: (
                    <div className={styles.tableContainer}>
                      <Table<ActivityItem>
                        rowKey="id"
                        loading={loading}
                        columns={columns}
                        dataSource={activitiesByType['物码营销']}
                        pagination={{ pageSize: 8 }}
                        scroll={{ x: 'max-content' }}
                        className={styles.tableWrap}
                      />
                    </div>
                  ),
                },
              ]}
            />
          )}
        </Card>
      </div>

      {/* 新建活动改为独立页面 */}
    </div>
  )
}