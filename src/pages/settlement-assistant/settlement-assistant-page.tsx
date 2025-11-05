import { useEffect, useState } from 'react'
import { Card, List, Tag } from 'antd'
import { getSettlementOverview } from '../../services/settlement-service'
import type { SettlementOverview } from '../../types/settlement'

const SettlementAssistantPage = () => {
  const [data, setData] = useState<SettlementOverview | null>(null)

  useEffect(() => {
    getSettlementOverview().then(setData)
  }, [])

  return (
    <Card title="结算助手" extra={<div>自动化结算与规则校验</div>}>
      <div style={{ marginBottom: 12 }}>最近运行时间：{data?.lastRun ?? '—'}</div>
      <List
        header={<div>结算规则</div>}
        dataSource={data?.rules ?? []}
        renderItem={(r) => (
          <List.Item>
            <List.Item.Meta title={r.name} />
            <Tag color={r.status === '正常' ? 'green' : 'orange'}>{r.status}</Tag>
          </List.Item>
        )}
      />
    </Card>
  )
}

export default SettlementAssistantPage