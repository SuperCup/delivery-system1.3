import { Card, Empty, Button } from 'antd'
import { FileTextOutlined } from '@ant-design/icons'

export default function ClientFileDeliveryPage() {
  return (
    <Card>
      <Empty
        image={<FileTextOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description={
          <div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>文件交付功能</p>
            <p style={{ color: '#8c8c8c' }}>管理该客户的文件交付任务、文件上传下载和交付进度跟踪</p>
          </div>
        }
      >
        <Button type="primary">即将上线</Button>
      </Empty>
    </Card>
  )
}

