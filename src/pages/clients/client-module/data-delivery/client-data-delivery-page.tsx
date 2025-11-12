import { Card, Empty, Button } from 'antd'
import { DatabaseOutlined } from '@ant-design/icons'

export default function ClientDataDeliveryPage() {
  return (
    <Card>
      <Empty
        image={<DatabaseOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description={
          <div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>数据交付功能</p>
            <p style={{ color: '#8c8c8c' }}>管理该客户的数据交付任务、数据源配置和交付记录</p>
          </div>
        }
      >
        <Button type="primary">即将上线</Button>
      </Empty>
    </Card>
  )
}

