import { Layout, Avatar, Dropdown, Badge, Drawer, List, Typography, Button, message } from 'antd'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate, Outlet } from 'react-router-dom'
import { UserOutlined, LogoutOutlined, BellOutlined, SettingOutlined, HomeOutlined } from '@ant-design/icons'
import type { UserProfile } from '../types/auth'
import { AuthService } from '../services/auth-service'
import { HomeService } from '../services/home-service'
import type { HomeMessages, Message } from '../types/home'
import systemLogo from '../assets/systemlogo.png'
import styles from './client-main-layout.module.css'

const { Header, Content } = Layout
const { Paragraph, Text } = Typography

/**
 * 客户管理模块独立主布局
 * 包含独立的顶部导航栏和内容区域
 * 完全独立于主系统导航，避免相互干扰
 */
export const ClientMainLayout = () => {
  const navigate = useNavigate()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [messagesDrawerVisible, setMessagesDrawerVisible] = useState(false)
  const [homeMessages, setHomeMessages] = useState<HomeMessages | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)

  // 加载用户信息
  useEffect(() => {
    const loadUser = async () => {
      try {
        const userData = await AuthService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('加载用户信息失败:', error)
      }
    }
    loadUser()
  }, [])

  // 加载消息数据
  const loadMessages = async () => {
    setMessagesLoading(true)
    try {
      const messagesData = await HomeService.getHomeMessages()
      setHomeMessages(messagesData)
    } catch (error) {
      const err = error as Error
      message.error(`加载消息失败：${err.message}`)
    } finally {
      setMessagesLoading(false)
    }
  }

  // 打开消息抽屉时加载数据
  const handleBellClick = () => {
    setMessagesDrawerVisible(true)
    if (!homeMessages) {
      loadMessages()
    }
  }

  // 渲染消息列表项
  const renderMessage = (msg: Message) => {
    return (
      <List.Item className={msg.isRead ? styles.messageRead : styles.messageUnread}>
        <List.Item.Meta
          title={
            <div className={styles.messageTitle}>
              <Text strong={!msg.isRead}>{msg.title}</Text>
              <Text type="secondary" className={styles.messageTime}>
                {msg.time}
              </Text>
            </div>
          }
          description={
            <Paragraph ellipsis={{ rows: 2 }} className={styles.messageContent}>
              {msg.content}
            </Paragraph>
          }
        />
      </List.Item>
    )
  }

  // 用户下拉菜单
  const userMenuItems = useMemo(
    () => [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: '个人中心',
      },
      {
        key: 'settings',
        icon: <SettingOutlined />,
        label: '设置',
      },
      {
        type: 'divider' as const,
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: '退出登录',
      },
    ],
    [],
  )

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      console.log('退出登录')
      // 退出登录逻辑
    } else if (key === 'profile' || key === 'settings') {
      navigate('/account-config')
    }
  }

  // 返回首页
  const handleBackToHome = () => {
    navigate('/home')
  }

  return (
    <Layout className={styles.layout}>
      {/* 客户模块独立顶部导航栏 */}
      <Header className={styles.header}>
        <div className={styles.headerBar}>
          {/* Logo 区域 */}
          <div className={styles.brand} onClick={() => navigate('/home')}>
            <img src={systemLogo} alt="系统Logo" className={styles.brandLogo} />
          </div>

          {/* 模块标题 */}
          <div className={styles.moduleTitle}>
            <span>客户管理</span>
          </div>

          {/* 右侧区域 */}
          <div className={styles.headerRight}>
            {/* 返回首页按钮 */}
            <Button
              type="text"
              icon={<HomeOutlined />}
              onClick={handleBackToHome}
              className={styles.backHomeBtn}
            >
              返回首页
            </Button>

            {/* 通知图标 */}
            <Badge count={homeMessages?.messages.filter((m) => !m.isRead).length || 0} size="small">
              <BellOutlined className={styles.bellIcon} onClick={handleBellClick} />
            </Badge>

            {/* 用户信息 */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <div className={styles.userBox}>
                <Avatar size="default" icon={<UserOutlined />} style={{ backgroundColor: '#d9d9d9' }} />
                <span className={styles.userName}>{user?.name || '加载中...'}</span>
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>

      {/* 内容区域 - 包含侧边栏和主内容 */}
      <Content className={styles.mainContent}>
        <Outlet />
      </Content>

      {/* 消息抽屉 */}
      <Drawer
        title={
          <div className={styles.drawerHeader}>
            <Text strong>最新消息</Text>
            <Badge count={homeMessages?.messages.filter((m) => !m.isRead).length || 0} />
          </div>
        }
        placement="right"
        width={400}
        open={messagesDrawerVisible}
        onClose={() => setMessagesDrawerVisible(false)}
        extra={
          <Button type="link" size="small">
            查看全部
          </Button>
        }
      >
        <List
          loading={messagesLoading}
          dataSource={homeMessages?.messages || []}
          renderItem={renderMessage}
          locale={{ emptyText: '暂无消息' }}
        />
      </Drawer>
    </Layout>
  )
}

export default ClientMainLayout

