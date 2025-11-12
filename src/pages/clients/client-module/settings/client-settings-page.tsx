import { Card, Empty, Button } from 'antd'
import { SettingOutlined } from '@ant-design/icons'

export default function ClientSettingsPage() {
  return (
    <Card>
      <Empty
        image={<SettingOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
        description={
          <div>
            <p style={{ fontSize: 16, marginBottom: 8 }}>客户管理功能</p>
            <p style={{ color: '#8c8c8c' }}>管理客户的基本信息、联系人、业务配置和权限设置</p>
          </div>
        }
      >
        <Button type="primary">即将上线</Button>
      </Empty>
    </Card>
  )
}

