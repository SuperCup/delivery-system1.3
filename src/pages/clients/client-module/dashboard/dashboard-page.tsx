import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Empty,
  message,
  Space,
  Table,
  Tabs,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useLocation, useParams, useNavigate } from 'react-router-dom'
import styles from './dashboard-page.module.css'
import type { ActivityItem, ActivityStatus } from '../../../../types/activity'
import type { BusinessType, Contact } from '../../../../types/client'
import type { BusinessActivityGuide } from '../../../../types/activity-guidance'
import { ClientActivityService } from '../../../../services/client-activity-service'

const { Title, Text } = Typography

const businessTypeOptions: BusinessType[] = ['到店营销', '即时零售', '物码营销']

const statusColorMap: Record<ActivityStatus, string> = {
  草稿: '#7491ff',
  进行中: '#32c3a7',
  已结束: '#b1b5c6',
}

export default function DashboardPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const { clientId: routeClientId } = useParams<{ clientId?: string }>()
  const clientId = useMemo(
    () => new URLSearchParams(location.search).get('clientId') || routeClientId || '',
    [location.search, routeClientId],
  )

  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(false)
  const [guides, setGuides] = useState<Partial<Record<BusinessType, BusinessActivityGuide>>>({})
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeType, setActiveType] = useState<BusinessType>('到店营销')

  useEffect(() => {
    if (!clientId) return
    const init = async () => {
      setLoading(true)
      try {
        const [actList, guideList, contactList] = await Promise.all([
          ClientActivityService.getActivities(clientId),
          ClientActivityService.getBusinessGuides(),
          ClientActivityService.getClientContacts(clientId),
        ])
        setActivities(actList)
        const guideMap = guideList.reduce(
          (acc, item) => {
            acc[item.type] = item
            return acc
          },
          {} as Partial<Record<BusinessType, BusinessActivityGuide>>,
        )
        setGuides((prev) => ({ ...prev, ...guideMap }))
        setContacts(contactList)
        if (actList.length > 0) {
          setActiveType(actList[0].businessType ?? '到店营销')
        }
      } catch (error: unknown) {
        const err = error as Error
        message.error(`加载数据失败：${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [clientId])

  const filteredActivities = useMemo(
    () => activities.filter((item) => item.businessType === activeType),
    [activities, activeType],
  )

  const contactMap = useMemo(() => {
    const map = new Map<string, string>()
    contacts.forEach((contact) => {
      map.set(contact.id, contact.name)
    })
    return map
  }, [contacts])

  // 获取平台对应的批次数量
  const getPlatformBatchCount = (platform: string, record: ActivityItem): number => {
    const batchSummary = record.batchSummary?.find((item) => item.platform === platform)
    return batchSummary?.count || 0
  }

  // 格式化日期，只显示日期部分
  const formatDate = (dateTime: string): string => {
    if (!dateTime) return '—'
    // 如果包含时间，只取日期部分
    return dateTime.split(' ')[0]
  }

  const columns: ColumnsType<ActivityItem> = [
    {
      title: '活动编号',
      dataIndex: 'id',
      key: 'id',
      width: 160,
      fixed: 'left',
    },
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      width: 280,
      fixed: 'left',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ActivityStatus) => (
        <Tag color={statusColorMap[status] ?? '#7491ff'}>{status}</Tag>
      ),
    },
    {
      title: '活动时间',
      key: 'period',
      width: 220,
      render: (_, record) => (
        <div className={styles.period}>
          <span>{formatDate(record.startTime)}</span>
          <span className={styles.periodDivider}>~</span>
          <span>{formatDate(record.endTime)}</span>
        </div>
      ),
    },
    {
      title: '活动平台',
      dataIndex: 'platforms',
      key: 'platforms',
      width: 220,
      render: (platforms: string[], record: ActivityItem) => (
        <Space size={[8, 8]} wrap>
          {platforms.map((platform) => {
            const batchCount = getPlatformBatchCount(platform, record)
            return (
              <Tag key={platform} className={styles.platformTag}>
                {platform}
                {batchCount > 0 && <span className={styles.batchCount}>({batchCount})</span>}
              </Tag>
            )
          })}
        </Space>
      ),
    },
    {
      title: '可见联系人',
      key: 'contacts',
      width: 200,
      render: (_, record) =>
        record.visibleContacts && record.visibleContacts.length > 0 ? (
          <Space size={[8, 8]} wrap>
            {record.visibleContacts.map((contactId) => (
              <Tag key={contactId}>{contactMap.get(contactId) ?? contactId}</Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">—</Text>
        ),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 120,
      render: (_, record) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          编辑
        </Button>
      ),
    },
  ]

  const handleCreate = () => {
    navigate(`/clients/${clientId}/dashboard/create?businessType=${activeType}`)
  }

  const handleEdit = (record: ActivityItem) => {
    navigate(`/clients/${clientId}/dashboard/edit/${record.id}`)
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          客户看板
        </Title>
        <Button
          type="primary"
          disabled={!clientId}
          onClick={() => window.open('https://dsmcloud-datacenter.netlify.app/', '_blank')}
        >
          进入客户端
        </Button>
      </div>

      <Card className={styles.tableCard}>
        <Tabs
          activeKey={activeType}
          onChange={(key) => setActiveType(key as BusinessType)}
          items={businessTypeOptions.map((type) => ({
            key: type,
            label: type,
            children: (
              <div className={styles.tabContent}>
                {guides[type] && (
                  <Alert
                    description={
                      <div className={styles.guideDescription}>
                        {guides[type]?.previewTips && guides[type]!.previewTips!.length > 0 && (
                          <div className={styles.tipsContent}>
                            {guides[type]!.previewTips!.flatMap((tip, tipIndex) =>
                              tip.split('；').map((part, partIndex) => (
                                <Text key={`${tipIndex}-${partIndex}`} className={styles.tipItem}>
                                  {part}
                                </Text>
                              )),
                            )}
                          </div>
                        )}
                      </div>
                    }
                    className={styles.guideAlert}
                  />
                )}
                <div className={styles.actionBar}>
                  <Space size={12}>
                    <Button type="primary" onClick={handleCreate} disabled={!clientId}>
                      新建活动
                    </Button>
                    <Button
                      onClick={() =>
                        navigate(
                          `/clients/${clientId}/dashboard/data-sources?businessType=${type}`,
                        )
                      }
                      disabled={!clientId}
                    >
                      源数据管理
                    </Button>
                  </Space>
                </div>
                {filteredActivities.length === 0 ? (
                  <div className={styles.emptyWrap}>
                    <Empty description="当前业务类型还没有活动" />
                  </div>
                ) : (
                  <Table<ActivityItem>
                    rowKey="id"
                    loading={loading}
                    dataSource={filteredActivities}
                    columns={columns}
                    pagination={{ pageSize: 6 }}
                    scroll={{ x: 1080 }}
                    className={styles.table}
                  />
                )}
              </div>
            ),
          }))}
        />
      </Card>
    </div>
  )
}

