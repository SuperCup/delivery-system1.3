import { Card, Descriptions, List, Tag, message } from 'antd'
import { useEffect, useState } from 'react'
import { AuthService } from '../../services/auth-service'
import type { UserProfile } from '../../types/auth'

export default function AccountConfigPage() {
  const [user, setUser] = useState<UserProfile | null>(null)

  useEffect(() => {
    AuthService.getCurrentUser()
      .then(setUser)
      .catch((e) => message.error(e.message))
  }, [])

  return (
    <Card title="账号管理" bordered>
      <Descriptions column={2} bordered size="small" style={{ marginBottom: 12 }}>
        <Descriptions.Item label="用户ID">{user?.id ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="用户名">{user?.name ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="部门">{user?.department ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="邮箱">{user?.email ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="手机号">{user?.phone ?? '—'}</Descriptions.Item>
        <Descriptions.Item label="状态">{user?.status ?? '—'}</Descriptions.Item>
      </Descriptions>

      <List
        header={<div>角色与权限</div>}
        dataSource={user?.roles ?? []}
        renderItem={(role) => (
          <List.Item>
            <List.Item.Meta title={role.name} />
            <div>
              {(role.permissions ?? []).map((p) => (
                <Tag key={`${role.name}-${p}`} color="blue" style={{ marginBottom: 6 }}>
                  {p}
                </Tag>
              ))}
            </div>
          </List.Item>
        )}
      />
    </Card>
  )
}