import { useEffect, useState } from 'react'
import { Row, Col, Card } from 'antd'
import { DeliveryService } from '../../services/delivery-service'
import type { DashboardMetric } from '../../types/delivery'
import { ChartCard } from '../../components/chart-card/chart-card'

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    DeliveryService.getDashboardMetrics()
      .then(setMetrics)
      .catch((e) => setError(e.message))
  }, [])

  return (
    <div>
      {error && <Card style={{ marginBottom: 16 }} title="错误">{error}</Card>}
      <Row gutter={[16, 16]}>
        {metrics.map((m) => (
          <Col key={m.label} xs={24} sm={12} md={8} lg={6}>
            <ChartCard title={m.label} value={m.value} />
          </Col>
        ))}
      </Row>
    </div>
  )
}