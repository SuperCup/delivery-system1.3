import { Layout, Menu, theme, Avatar, Dropdown, Drawer, Badge, List, Typography, Button, message, Tag } from 'antd'
import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Outlet } from 'react-router-dom'
import styles from './basic-layout.module.css'
import { SystemLogo } from '../components/system-logo/system-logo'
import type { UserProfile } from '../types/auth'
import { AuthService } from '../services/auth-service'
import { HomeService } from '../services/home-service'
import type { HomeMessages, Message } from '../types/home'
import { AiAgentEntryService } from '../services/ai-agent-entry-service'
import type { AiAgentId } from '../types/ai-agent-entry'

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
  const agentWindowsRef = useRef<Record<AiAgentId, Window | null>>({
    'inst-retail': null,
    'daodian-marketing': null,
  })
  const [agentEntries, setAgentEntries] = useState<ReturnType<typeof AiAgentEntryService.getAgentEntries> extends Promise<infer T> ? T : never>([])

  useEffect(() => {
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
        navigate('/login', { replace: true })
      }
    }
    loadUser()
  }, [navigate])

  useEffect(() => {
    const loadAgentEntries = async () => {
      try {
        const entries = await AiAgentEntryService.getAgentEntries()
        setAgentEntries(entries)
      } catch {
        setAgentEntries([])
      }
    }
    loadAgentEntries()
  }, [])

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
    if (matched === '/magi-core') return ''
    return matched ?? ''
  }, [location, menuRoutes])

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
      {
        key: '/magi-core',
        label: '魔盒 MagiCore',
        className: styles.magiCoreMenuItem,
        children: agentEntries.map((entry) => ({
          key: `agent:${entry.id}`,
          label: (
            <span className={styles.agentMenuRow}>
              <span className={styles.agentMenuText}>{entry.name}</span>
              {!entry.isOnline && (
                <Tag
                  bordered={false}
                  color="default"
                  style={{ fontSize: 11, padding: '0 5px', lineHeight: '18px', marginLeft: 4 }}
                >
                  即将上线
                </Tag>
              )}
            </span>
          ),
          disabled: !entry.isOnline,
        })),
      },
      { key: '/knowledge-base', label: '知识库' },
      { key: '/data-warehouse', label: '数据赋能' },
      { key: '/tools-market', label: '工具市场' },
      { key: '/permission-center', label: '权限中心' },
    ],
    [agentEntries],
  )

  const isMenuRoute = useMemo(() => {
    const { pathname } = location
    return menuRoutes.some(route => {
      if (route === '/home') {
        return pathname === '/home'
      }
      return pathname.startsWith(route)
    })
  }, [location, menuRoutes])

  const handleMenuClick = (e: { key: string }) => {
    if (e.key.startsWith('agent:')) {
      const agentId = e.key.replace('agent:', '') as AiAgentId
      const entry = agentEntries.find((x) => x.id === agentId && x.isOnline)
      if (!entry) return
      const existing = agentWindowsRef.current[agentId]
      if (existing && !existing.closed) {
        existing.focus()
        return
      }
      agentWindowsRef.current[agentId] = window.open(entry.url, `agent:${agentId}`)
      agentWindowsRef.current[agentId]?.focus()
      return
    }
    if (e.key.startsWith('/')) {
      navigate(e.key)
    }
  }

  return (
    <Layout className={styles.layout}>
      <Header className={styles.header}>
        <div className={styles.headerBar}>
          <div
            className={styles.brand}
            onClick={() => navigate('/home')}
          >
            <SystemLogo size="default" />
          </div>

          {isMenuRoute && selectedMenuKey && (
            <Menu
              mode="horizontal"
              selectedKeys={[selectedMenuKey]}
              items={menuItems}
              onClick={handleMenuClick}
              className={styles.topMenu}
            />
          )}

          <div className={styles.headerRight}>
            <Badge count={homeMessages?.messages.filter(m => !m.isRead).length || 0} size="small">
              <BellOutlined
                style={{ fontSize: '18px', color: token.colorTextSecondary, cursor: 'pointer' }}
                onClick={handleBellClick}
              />
            </Badge>

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

      <Layout>
        <Layout>
          <Content className={styles.content}>
            <Outlet />
          </Content>
        </Layout>
      </Layout>

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
