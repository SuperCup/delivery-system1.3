import { Result } from 'antd'
import { ClockCircleOutlined } from '@ant-design/icons'

export const ComingSoonPage = () => {
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: 'calc(100vh - 150px)',
      background: '#fff',
      borderRadius: '8px',
      margin: '0 auto'
    }}>
      <Result
        icon={<ClockCircleOutlined style={{ color: '#1677ff' }} />}
        title="系统设计中，敬请期待"
        subTitle="该功能正在紧锣密鼓地开发中，即将与您见面"
      />
    </div>
  )
}

export default ComingSoonPage














