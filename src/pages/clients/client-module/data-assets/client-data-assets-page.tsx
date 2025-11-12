import { Card, Empty, Button } from 'antd'
import { FolderOutlined } from '@ant-design/icons'

export default function ClientDataAssetsPage() {
  return (
    <Card>
      <Empty
        image={<FolderOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description={
          <div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>数据资产功能</p>
            <p style={{ color: '#8c8c8c' }}>展示和管理该客户的数据资产目录、数据质量报告和数据血缘关系</p>
          </div>
        }
      >
        <Button type="primary">即将上线</Button>
      </Empty>
    </Card>
  )
}

