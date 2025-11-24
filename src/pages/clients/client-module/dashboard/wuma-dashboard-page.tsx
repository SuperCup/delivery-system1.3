import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Empty,
  message,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useNavigate } from 'react-router-dom'
import styles from './dashboard-page.module.css'
import type { ActivityItem, ActivityStatus } from '../../../../types/activity'
import type { Contact } from '../../../../types/client'
import type { BusinessActivityGuide } from '../../../../types/activity-guidance'
import { ClientActivityService } from '../../../../services/client-activity-service'

const { Text } = Typography

const statusColorMap: Record<ActivityStatus, string> = {
  草稿: '#7491ff',
  进行中: '#32c3a7',
  已结束: '#b1b5c6',
}

interface Props {
  clientId: string
  guide?: BusinessActivityGuide
  contacts: Contact[]
}

export default function WumaDashboardPage({ clientId, guide, contacts }: Props) {
  const navigate = useNavigate()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!clientId) return
    loadActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const loadActivities = async () => {
    setLoading(true)
    try {
      const actList = await ClientActivityService.getActivities(clientId)
      const filtered = actList.filter((item) => item.businessType === '物码营销')
      setActivities(filtered)
    } catch (error: unknown) {
      const err = error as Error
      message.error(`加载数据失败：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

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
    navigate(`/clients/${clientId}/dashboard/create?businessType=物码营销`)
  }

  const handleEdit = (record: ActivityItem) => {
    navigate(`/clients/${clientId}/dashboard/edit/${record.id}`)
  }

  return (
    <div className={styles.tabContent}>
      {guide && (
        <Alert
          description={
            <div className={styles.guideDescription}>
              {guide.previewTips && guide.previewTips.length > 0 && (
                <div className={styles.tipsContent}>
                  {guide.previewTips.flatMap((tip, tipIndex) =>
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
              navigate(`/clients/${clientId}/dashboard/data-sources?businessType=物码营销`)
            }
            disabled={!clientId}
          >
            源数据管理
          </Button>
        </Space>
      </div>
      {activities.length === 0 ? (
        <div className={styles.emptyWrap}>
          <Empty description="当前业务类型还没有活动" />
        </div>
      ) : (
        <Table<ActivityItem>
          rowKey="id"
          loading={loading}
          dataSource={activities}
          columns={columns}
          pagination={{ pageSize: 6 }}
          scroll={{ x: 1080 }}
          className={styles.table}
        />
      )}
    </div>
  )
}

