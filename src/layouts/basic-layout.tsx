import { Layout, Menu, theme, Dropdown } from 'antd'
import type { MenuProps } from 'antd'
import type { ReactNode } from 'react'
import { useMemo, useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './basic-layout.module.css'
import systemlogo from '../assets/systemlogo.png'
import type { ClientItem } from '../types/client'
import { DataDeliveryService } from '../services/data-delivery-service'
import {
  MenuOutlined,
  CalendarOutlined,
  QrcodeOutlined,
  CalculatorOutlined,
  BookOutlined,
  DatabaseOutlined,
  ToolOutlined,
  SafetyOutlined,
  SettingOutlined,
  HomeFilled,
} from '@ant-design/icons'

const { Header, Sider, Content } = Layout

type BasicLayoutProps = {
  children: ReactNode
}

export const BasicLayout = ({ children }: BasicLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  const {
    token: { colorBgContainer },
  } = theme.useToken()

  // 活动管理页隐藏左侧菜单
  const hideSider = useMemo(() => location.pathname.startsWith('/activity-management'), [location.pathname])

  // 用户下拉菜单（悬停触发）
  const userMenuItems: MenuProps['items'] = [
    { key: 'account', label: '账号管理' },
  ]

  // 客户下拉：在导航栏展示当前客户并可切换
  const [clients, setClients] = useState<ClientItem[]>([])
  const activeClientId = useMemo(() => new URLSearchParams(location.search).get('clientId') || '', [location.search])
  const activeClient = useMemo(() => clients.find((c) => c.id === activeClientId) || null, [clients, activeClientId])

  useEffect(() => {
    DataDeliveryService.getClients().then(setClients).catch(() => setClients([]))
  }, [])

  const clientMenuItems: MenuProps['items'] = clients.map((c) => ({ key: c.id, label: c.name }))

  const homeItems = useMemo(() => [{ key: '/home', label: '主页', icon: <HomeFilled /> }], [])
  const bizArea = useMemo(
    () => [
      { key: '/activity-management', label: '到店营销', icon: <MenuOutlined /> },
      { key: '/channels', label: '即时零售', icon: <CalendarOutlined /> },
      { key: '/magi-core', label: '物码营销', icon: <QrcodeOutlined /> },
    ],
    [],
  )
  const projectSupport = useMemo(
    () => [{ key: '/settlement-assistant', label: '结算助手', icon: <CalculatorOutlined /> }],
    [],
  )
  const basicServices = useMemo(
    () => [
      { key: '/magi-core', label: '魔盒MagiCore', icon: <QrcodeOutlined /> },
      { key: '/ai-knowledge', label: '知识库', icon: <BookOutlined /> },
      { key: '/data-center', label: '数据中心', icon: <DatabaseOutlined /> },
      { key: '/tools-market', label: '工具市场', icon: <ToolOutlined /> },
    ],
    [],
  )
  const systemAdmin = useMemo(
    () => [
      { key: '/access-control', label: '权限管理', icon: <SafetyOutlined /> },
      { key: '/account-config', label: '系统设置', icon: <SettingOutlined /> },
    ],
    [],
  )

  return (
    <Layout className={styles.layout}>
      {!hideSider && (
      <Sider className={styles.sider} theme="light" width={220} breakpoint="lg">
        <div className={styles['sider-logo']}>
          <img src={systemlogo} alt="系统Logo" className={styles.siderLogoImg} />
        </div>
        <Menu
          className={styles.homeMenu}
          selectedKeys={[location.pathname]}
          items={homeItems}
          onClick={(e) => navigate(e.key)}
        />
        <div className={styles.siderSectionTitle}>业务专区</div>
        <Menu
          className={styles.siderMenu}
          selectedKeys={[location.pathname]}
          items={bizArea}
          onClick={(e) => navigate(e.key)}
        />
        <div className={styles.siderSectionTitle}>项目支持</div>
        <Menu
          className={styles.siderMenu}
          selectedKeys={[location.pathname]}
          items={projectSupport}
          onClick={(e) => navigate(e.key)}
        />
        <div className={styles.siderSectionTitle}>基础服务</div>
        <Menu
          className={styles.siderMenu}
          selectedKeys={[location.pathname]}
          items={basicServices}
          onClick={(e) => navigate(e.key)}
        />
        <div className={styles.siderSectionTitle}>系统管理</div>
        <Menu
          className={styles.siderMenu}
          selectedKeys={[location.pathname]}
          items={systemAdmin}
          onClick={(e) => navigate(e.key)}
        />
      </Sider>
      )}
      <Layout>
        <Header className={styles.header} style={{ background: colorBgContainer }}>
          <div className={styles.headerBar}>
            {hideSider ? (
              <div className={styles.brand}>
                <img src={systemlogo} alt="系统Logo" className={styles.brandLogo} />
              </div>
            ) : (
              <div className={styles.headerLeftSpacer} />
            )}
            {hideSider && (
              <div className={styles.clientBox}>
                <Dropdown
                  trigger={["click"]}
                  placement="bottom"
                  menu={{
                    items: clientMenuItems,
                    onClick: (info) => navigate(`/activity-management?clientId=${info.key}`),
                  }}
                >
                  <div className={styles.clientName}>
                    {activeClient ? `当前客户：${activeClient.name}` : '未选择客户'}
                  </div>
                </Dropdown>
              </div>
            )}
            <div className={styles.headerRight}>
              <Dropdown
                trigger={["hover"]}
                placement="bottomRight"
                menu={{
                  items: userMenuItems,
                  onClick: (info) => {
                    if (info.key === 'account') navigate('/account-config')
                  },
                }}
              >
                <div className={styles.userBox}>
                  <div className={styles.userAvatar} />
                  <div className={styles.userName}>luffy</div>
                </div>
              </Dropdown>
            </div>
          </div>
        </Header>
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout