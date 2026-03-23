import { Layout, Menu, theme, Avatar, Dropdown, Drawer, Badge, List, Typography, Button, message } from 'antd'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import styles from './basic-layout.module.css'
import { SystemLogo } from '../components/system-logo/system-logo'
import type { UserProfile } from '../types/auth'
import { AuthService } from '../services/auth-service'
import { HomeService } from '../services/home-service'
import type { HomeMessages, Message } from '../types/home'

const { Paragraph, Text } = Typography
import { UserOutlined, LogoutOutlined, BellOutlined, SettingOutlined } from '@ant-design/icons'

const { Header, Content } = Layout

export const BasicLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = theme.useToken()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [messagesDrawerVisible, setMessagesDrawerVisible] = useState(false)
  const [homeMessages, setHomeMessages] = useState<HomeMessages | null>(null)
  const [messagesLoading, setMessagesLoading] = useState(false)

  // 加载用户信息
  useEffect(() => {
    // 检查是否已登录
    if (!AuthService.isAuthenticated()) {
      navigate('/login', { replace: true })
      return
    }

    const loadUser = async () => {
      try {
        const userData = await AuthService.getCurrentUser()
        setUser(userData)
      } catch (error) {
        console.error('加载用户信息失败:', error)
        // 如果加载失败，可能是未登录，跳转到登录页
        navigate('/login', { replace: true })
      }
    }
    loadUser()
  }, [navigate])

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

  const renderMessage = (msg: Message) => {
    return (
      <List.Item
        className={msg.isRead ? styles.messageRead : styles.messageUnread}
      >
        <List.Item.Meta
          title={
            <div className={styles.messageTitle}>
              <Text strong={!msg.isRead}>{msg.title}</Text>
              <Text type="secondary" className={styles.messageTime}>{msg.time}</Text>
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

  // 计算当前选中的菜单项（处理子路由的情况）
  const menuRoutes = useMemo(
    () => [
      '/home',
      '/magi-core',
      '/knowledge-base',
      '/data-warehouse',
      '/tools-market',
      '/permission-center',
    ],
    [],
  )

  const selectedMenuKey = useMemo(() => {
    const { pathname } = location
    const matched = menuRoutes.find((route) => {
      if (route === '/home') {
        return pathname === '/home'
      }
      return pathname === route || pathname.startsWith(`${route}/`)
    })
    return matched ?? ''
  }, [location, menuRoutes])

  // 用户下拉菜单
  const userMenuItems = useMemo(() => [
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
  ], [])

  const handleUserMenuClick = ({ key }: { key: string }) => {
    if (key === 'logout') {
      // 退出登录逻辑
      AuthService.logout()
      message.success('已退出登录')
      navigate('/login', { replace: true })
    } else if (key === 'profile') {
      navigate('/account-config')
    } else if (key === 'settings') {
      navigate('/account-config')
    }
  }

  const menuItems = useMemo(
    () => [
      { key: '/home', label: '首页' },
      { key: '/magi-core', label: '魔盒 MagiCore' },
      { key: '/knowledge-base', label: '知识库' },
      { key: '/data-warehouse', label: '数据赋能' },
        { key: '/tools-market', label: '工具市场' },
      { key: '/permission-center', label: '权限中心' },
      ],
    [],
  )

  // 所有菜单路由列表
  // 判断当前路由是否在菜单中
  const isMenuRoute = useMemo(() => {
    const { pathname } = location
    // 检查是否匹配菜单路由或子路由
    return menuRoutes.some(route => {
      if (route === '/home') {
        return pathname === '/home'
      }
      // 对于其他路由，检查是否以该路由开头（支持子路由）
      return pathname.startsWith(route)
    })
  }, [location, menuRoutes])

  const handleMenuClick = (e: { key: string }) => {
    // MagiCore：外部入口（新标签打开），不进入系统内的 /magi-core 页面
    if (e.key === '/magi-core') {
      window.open('https://agent-helper.netlify.app/', '_blank', 'noopener,noreferrer')
      return
    }
    if (e.key.startsWith('/')) {
      navigate(e.key)
    }
  }

  return (
    <Layout className={styles.layout}>
      {/* 顶部导航栏 */}
      <Header className={styles.header}>
        <div className={styles.headerBar}>
          {/* Logo */}
          <div 
            className={styles.brand} 
            onClick={() => navigate('/home')}
          >
            <SystemLogo size="default" />
          </div>

          {/* 导航菜单 */}
          {isMenuRoute && selectedMenuKey && (
            <Menu
              mode="horizontal"
              selectedKeys={[selectedMenuKey]}
              items={menuItems}
              onClick={handleMenuClick}
              className={styles.topMenu}
            />
          )}

          {/* 右侧区域 */}
          <div className={styles.headerRight}>
            {/* 通知图标 */}
            <Badge count={homeMessages?.messages.filter(m => !m.isRead).length || 0} size="small">
              <BellOutlined 
                style={{ fontSize: '18px', color: token.colorTextSecondary, cursor: 'pointer' }} 
                onClick={handleBellClick}
              />
            </Badge>
            
            {/* 用户信息 */}
            <Dropdown menu={{ items: userMenuItems, onClick: handleUserMenuClick }} placement="bottomRight">
              <div className={styles.userBox}>
                <Avatar 
                  size="default" 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#d9d9d9' }}
                />
                <span className={styles.userName}>{user?.name || '加载中...'}</span>
              </div>
            </Dropdown>
          </div>
        </div>
      </Header>

      {/* 布局主体 */}
      <Layout>
        <Layout>
          <Content className={styles.content}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

      {/* 消息抽屉 */}
      <Drawer
        title={
          <div className={styles.drawerHeader}>
            <Text strong>最新消息</Text>
            <Badge count={homeMessages?.messages.filter(m => !m.isRead).length || 0} />
          </div>
        }
        placement="right"
        width={400}
        open={messagesDrawerVisible}
        onClose={() => setMessagesDrawerVisible(false)}
        extra={<Button type="link" size="small">查看全部</Button>}
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

export default BasicLayout