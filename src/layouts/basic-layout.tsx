import { Layout, Menu, theme } from 'antd'
import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import styles from './basic-layout.module.css'
// import type { ClientItem } from '../types/client'
// import { DataDeliveryService } from '../services/data-delivery-service'
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

const { Sider, Content } = Layout

type BasicLayoutProps = {
  children: ReactNode
}

export const BasicLayout = ({ children }: BasicLayoutProps) => {
  const navigate = useNavigate()
  const location = useLocation()
  // 主题token不再用于Header背景
  theme.useToken()

  // 活动管理页隐藏左侧菜单
  const hideSider = useMemo(() => location.pathname.startsWith('/activity-management'), [location.pathname])

  // 顶部导航栏已移除

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
        <Content className={styles.content}>{children}</Content>
      </Layout>
    </Layout>
  )
}

export default BasicLayout