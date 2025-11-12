import { useEffect, useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Card,
  Empty,
  message,
  Segmented,
  Space,
  Table,
  Tag,
  Typography,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { useParams, useNavigate } from 'react-router-dom'
import styles from './client-activities-page.module.css'
import type { ActivityItem, ActivityStatus } from '../../../../types/activity'
import type { BusinessType } from '../../../../types/client'
import type { BusinessActivityGuide } from '../../../../types/activity-guidance'
import { ClientActivityService } from '../../../../services/client-activity-service'

const { Title, Text, Paragraph } = Typography

const businessTypeOptions: BusinessType[] = ['到店营销', '即时零售', '物码营销']

const statusColorMap: Record<ActivityStatus, string> = {
  草稿: '#7491ff',
  进行中: '#32c3a7',
  已结束: '#b1b5c6',
}

export default function ClientActivitiesPage() {
  const { clientId = '' } = useParams<{ clientId: string }>()
  const navigate = useNavigate()
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(false)
  const [guides, setGuides] = useState<Partial<Record<BusinessType, BusinessActivityGuide>>>({})
  const [activeType, setActiveType] = useState<BusinessType>('到店营销')

  useEffect(() => {
    if (!clientId) return
    const init = async () => {
      setLoading(true)
      try {
        const [actList, guideList] = await Promise.all([
          ClientActivityService.getActivities(clientId),
          ClientActivityService.getBusinessGuides(),
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
        if (actList.length > 0) {
          setActiveType(actList[0].businessType ?? '到店营销')
        }
      } catch (error: any) {
        message.error(`加载活动数据失败：${error.message}`)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [clientId])

  const filteredActivities = useMemo(
    () => activities.filter((item) => (item.businessType ?? activeType) === activeType),
    [activities, activeType],
  )

  const contactMap = useMemo(() => {
    const map = new Map<string, string>()
    // 从activities中提取联系人信息
    activities.forEach((item) => {
      if (item.visibleContacts) {
        item.visibleContacts.forEach((contactId) => {
          if (!map.has(contactId)) {
            map.set(contactId, contactId)
          }
        })
      }
    })
    return map
  }, [activities])

  const scopeSummary = (item: ActivityItem) => {
    if (!item.dataScopes || item.dataScopes.length === 0) return '—'
    return item.dataScopes
      .map((scope) => {
        if (scope.sourceType === 'manual' && scope.uploadFile) {
          return `${scope.platform}·人工上传（${scope.uploadFile.name}）`
        }
        if (scope.systemSelection && scope.systemSelection.length > 0) {
          return `${scope.platform}·系统圈选（${scope.systemSelection.length} 条）`
        }
        return `${scope.platform}·系统圈选`
      })
      .join(' / ')
  }

  const columns: ColumnsType<ActivityItem> = [
    {
      title: '活动名称',
      dataIndex: 'name',
      key: 'name',
      width: 240,
      render: (value, record) => (
        <Space direction="vertical" size={2}>
          <Text className={styles.activityName}>{value}</Text>
          <Text type="secondary" className={styles.activityMeta}>
            最近更新：{record.lastUpdatedAt ?? record.createdAt}
          </Text>
        </Space>
      ),
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
          <span>{record.startTime}</span>
          <span className={styles.periodDivider}>~</span>
          <span>{record.endTime}</span>
        </div>
      ),
    },
    {
      title: '活动平台',
      dataIndex: 'platforms',
      key: 'platforms',
      width: 220,
      render: (platforms: string[]) => (
        <Space size={[8, 8]} wrap>
          {platforms.map((platform) => (
            <Tag key={platform} className={styles.platformTag}>
              {platform}
            </Tag>
          ))}
        </Space>
      ),
    },
    {
      title: '数据范围',
      key: 'scope',
      width: 260,
      render: (_, record) => <Text>{scopeSummary(record)}</Text>,
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

  const activeGuide = guides[activeType]

  const handleCreate = () => {
    navigate(`/activity-management/create?clientId=${clientId}&businessType=${activeType}`)
  }

  const handleEdit = (record: ActivityItem) => {
    navigate(`/activity-management/edit/${record.id}?clientId=${clientId}`)
  }


  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Title level={3} className={styles.pageTitle}>
            活动管理
          </Title>
          <Paragraph type="secondary" className={styles.pageSubtitle}>
            管理三大业务类型活动，掌握数据圈选与客户可见范围
          </Paragraph>
        </div>
        <Button type="primary" onClick={handleCreate} disabled={!clientId}>
          新建活动
        </Button>
      </div>

      <Card className={styles.switchCard}>
        <div className={styles.segmentHeader}>
          <Text className={styles.segmentTitle}>业务类型</Text>
          <Segmented
            value={activeType}
            onChange={(val: string | number) => setActiveType(val as BusinessType)}
            options={businessTypeOptions.map((type) => ({
              label: (
                <div className={styles.segmentItem}>
                  <span className={styles.segmentLabel}>{type}</span>
                  <span className={styles.segmentDesc}>
                    {guides[type]?.summary ?? '加载中'}
                  </span>
                </div>
              ),
              value: type,
            }))}
            className={styles.segmented}
          />
        </div>
        {activeGuide && (
          <div className={styles.guideContainer}>
            <Alert
              type="info"
              showIcon
              message={
                <div className={styles.guideSummary}>
                  <Text strong>{activeGuide.summary}</Text>
                </div>
              }
              description={
                <div className={styles.guideDetail}>
                  <div className={styles.guideList}>
                    <Text strong>执行要点</Text>
                    <ul>
                      {activeGuide.highlights.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                  <div className={styles.guideList}>
                    <Text strong>上线检查</Text>
                    <ul>
                      {activeGuide.checklist.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              }
            />
            {activeGuide.previewTips && (
              <Alert
                className={styles.previewAlert}
                type="warning"
                showIcon
                message="预览与历史数据提示"
                description={
                  <ul className={styles.previewList}>
                    {activeGuide.previewTips.map((tip) => (
                      <li key={tip}>{tip}</li>
                    ))}
                  </ul>
                }
              />
            )}
          </div>
        )}
      </Card>

      <Card className={styles.tableCard} bodyStyle={{ paddingTop: 0 }}>
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
      </Card>
    </div>
  )
}

