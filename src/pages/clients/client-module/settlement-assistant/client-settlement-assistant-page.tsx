import { useEffect, useState } from 'react'
import { Card, List, Tag, Typography, Space } from 'antd'
import { useParams } from 'react-router-dom'
import styles from './client-settlement-assistant-page.module.css'
import type { SettlementOverview } from '../../../../types/settlement'
import type { ClientDetail } from '../../../../types/client'
import { getSettlementOverview } from '../../../../services/settlement-service'
import { ClientService } from '../../../../services/client-service'

const { Title, Paragraph, Text } = Typography

const statusColor: Record<'正常' | '待完善', string> = {
  正常: 'success',
  待完善: 'warning',
}

export default function ClientSettlementAssistantPage() {
  const { clientId = '' } = useParams<{ clientId: string }>()
  const [overview, setOverview] = useState<SettlementOverview | null>(null)
  const [client, setClient] = useState<ClientDetail | null>(null)

  useEffect(() => {
    getSettlementOverview().then(setOverview)
  }, [])

  useEffect(() => {
    if (!clientId) return
    ClientService.getClientDetail(clientId)
      .then(setClient)
      .catch(() => setClient(null))
  }, [clientId])

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <div>
          <Title level={3} className={styles.pageTitle}>
            结算助手
          </Title>
          <Paragraph className={styles.pageSubtitle}>
            {client ? `当前客户：${client.name}` : '自动化核算账期、校验优惠及结算规则'}
          </Paragraph>
        </div>
        <Text type="secondary">最近运行时间：{overview?.lastRun ?? '—'}</Text>
      </div>

      <Card className={styles.card} title="智能结算概览" bodyStyle={{ paddingBottom: 0 }}>
        <Space direction="vertical" size={20} className={styles.summary}>
          <Paragraph>
            <Text strong>结算助手</Text> 自动对活动账单进行校验，识别高风险用券、补贴超额与漏算门店，
            同时生成客户可下载的结算结果与差异说明。
          </Paragraph>
          <Paragraph type="secondary">
            规则状态若为&nbsp;
            <Tag color="warning" style={{ margin: 0 }}>
              待完善
            </Tag>
            ，建议尽快补充缺失字段或联系技术支持确认配置。
          </Paragraph>
        </Space>
        <List
          className={styles.ruleList}
          header={<div className={styles.listHeader}>结算规则校验</div>}
          dataSource={overview?.rules ?? []}
          renderItem={(rule) => (
            <List.Item>
              <List.Item.Meta title={rule.name} description="系统自动检查账期、补贴、差异项" />
              <Tag color={statusColor[rule.status]}>{rule.status}</Tag>
            </List.Item>
          )}
          locale={{ emptyText: '暂无结算规则' }}
        />
      </Card>
    </div>
  )
}

