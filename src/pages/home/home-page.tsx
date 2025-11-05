import { useEffect, useState } from 'react'
import { Card, Typography, Tag, Space, Button, message } from 'antd'
import { useNavigate } from 'react-router-dom'
import styles from './home-page.module.css'
import type { ClientSummary } from '../../types/home'
import { HomeService } from '../../services/home-service'

const { Title } = Typography

export default function HomePage() {
  const [summaries, setSummaries] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    HomeService.getClientSummaries()
      .then(setSummaries)
      .catch((e) => message.error(`加载首页数据失败：${e.message}`))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className={styles.page}>
      <Title level={5} className={styles.sectionTitle}>我服务的客户</Title>
      <div className={styles.grid}>
        {summaries.map((s) => (
          <Card key={s.id} className={styles.card} loading={loading} title={s.name} extra={<Tag>客户ID: {s.id}</Tag>}>
            <Space style={{ marginBottom: 8 }}>
              <Tag color="blue">联系人：{s.contactCount}</Tag>
            </Space>
            <div className={styles.bizTags}>
              {s.business.map((b) => (
                <Tag key={b.type} color={b.type === '到店营销' ? 'cyan' : b.type === '即时零售' ? 'gold' : 'purple'}>
                  {b.type}:{b.activityCount}
                </Tag>
              ))}
            </div>
            <div style={{ marginTop: 12 }} className={styles.actions}>
              <Button type="primary" onClick={() => navigate(`/activity-management?clientId=${s.id}`)}>查看活动</Button>
              <Button onClick={() => navigate('/file-delivery')}>文件交付</Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}