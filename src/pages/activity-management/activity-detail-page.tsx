import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card, Typography, Tag, Space, List, message, Descriptions } from 'antd'
import type { ActivityItem, ActivityBatchDetail, ActivityStatus } from '../../types/activity'
import { ActivityService } from '../../services/activity-service'
import styles from './activity-detail-page.module.css'

const { Title, Text } = Typography

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

export default function ActivityDetailPage() {
  const { id } = useParams()
  const [activity, setActivity] = useState<ActivityItem | null>(null)
  const [batches, setBatches] = useState<ActivityBatchDetail[]>([])

  useEffect(() => {
    if (!id) return
    ActivityService.getActivityById(id)
      .then((a) => {
        if (!a) {
          message.error('未找到该活动')
          return
        }
        setActivity(a)
      })
      .catch((e) => message.error(`加载活动详情失败：${e.message}`))
  }, [id])

  useEffect(() => {
    if (!id) return
    ActivityService.getBatches(id)
      .then(setBatches)
      .catch((e) => message.error(`加载批次失败：${e.message}`))
  }, [id])

  if (!activity) {
    return (
      <Card>
        <Text type="secondary">正在加载活动详情...</Text>
      </Card>
    )
  }

  const priority = ['微信', '支付宝']
  const sortedPlatforms = [...activity.platforms].sort((a, b) => {
    const ai = priority.includes(a) ? 0 : 1
    const bi = priority.includes(b) ? 0 : 1
    if (ai !== bi) return ai - bi
    return activity.platforms.indexOf(a) - activity.platforms.indexOf(b)
  })

  return (
    <div>
      <Title level={4}>活动详情</Title>
      <Card>
        <Descriptions column={2} bordered size="small">
          <Descriptions.Item label="活动编号">{activity.id}</Descriptions.Item>
          <Descriptions.Item label="活动状态">
            <Tag color={statusColor(activity.status)}>{activity.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="活动名称">{activity.name}</Descriptions.Item>
          <Descriptions.Item label="创建人">{activity.createdBy}</Descriptions.Item>
          <Descriptions.Item label="开始时间">{activity.startTime}</Descriptions.Item>
          <Descriptions.Item label="结束时间">{activity.endTime}</Descriptions.Item>
          <Descriptions.Item label="创建时间">{activity.createdAt}</Descriptions.Item>
          <Descriptions.Item label="活动平台">
            <Space>
              {sortedPlatforms.map((p) => (
                <Tag key={p}>{p}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card title="批次明细" className={styles.section}>
        {batches.length === 0 ? (
          <Text type="secondary">暂无批次数据</Text>
        ) : (
          <List
            dataSource={batches}
            renderItem={(b) => (
              <List.Item>
                <Space direction="vertical">
                  <Text strong>
                    [{b.platform}] {b.title}
                  </Text>
                  <Text type="secondary">批次编号：{b.batchId}</Text>
                  <Text type="secondary">创建时间：{b.createdAt}</Text>
                </Space>
              </List.Item>
            )}
          />
        )}
      </Card>
    </div>
  )
}