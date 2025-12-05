import { Layout, Menu } from 'antd'
import { useMemo, useEffect, useState } from 'react'
import { useNavigate, useLocation, useParams, Outlet } from 'react-router-dom'
import {
  DashboardOutlined,
  ThunderboltOutlined,
  DatabaseOutlined,
  FileTextOutlined,
  FolderOutlined,
  SettingOutlined,
  CalculatorOutlined,
} from '@ant-design/icons'
import { ClientSwitcher } from '../components/client-switcher/client-switcher'
import { HomeService } from '../services/home-service'
import type { ClientSummary } from '../types/home'
import styles from './client-module-layout.module.css'

const { Sider, Content } = Layout

export const ClientModuleLayout = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { clientId } = useParams<{ clientId: string }>()
  const [clients, setClients] = useState<ClientSummary[]>([])

  useEffect(() => {
    const loadClients = async () => {
      try {
        const clientsData = await HomeService.getClientSummaries()
        setClients(clientsData)
      } catch (error) {
        console.error('加载客户列表失败:', error)
      }
    }
    loadClients()
  }, [])

  const menuItems = useMemo(
    () => [
      {
        key: `/clients/${clientId}/overview`,
        icon: <DashboardOutlined />,
        label: '总览',
      },
      {
        key: `/clients/${clientId}/dashboard`,
        icon: <ThunderboltOutlined />,
        label: '客户看板',
      },
      {
        key: `/clients/${clientId}/data-delivery`,
        icon: <DatabaseOutlined />,
        label: '数据交付',
      },
      {
        key: `/clients/${clientId}/file-delivery`,
        icon: <FileTextOutlined />,
        label: '文件交付',
      },
      {
        key: `/clients/${clientId}/data-assets`,
        icon: <FolderOutlined />,
        label: '数据资产',
      },
      {
        key: `/clients/${clientId}/settlement-assistant`,
        icon: <CalculatorOutlined />,
        label: '结算助手',
      },
      {
        key: `/clients/${clientId}/account`,
        icon: <SettingOutlined />,
        label: '客户账号',
      },
    ],
    [clientId],
  )

  const selectedKey = useMemo(() => {
    const { pathname } = location
    // 精确匹配当前路径
    const matchedItem = menuItems.find((item) => pathname === item.key)
    return matchedItem ? matchedItem.key : menuItems[0]?.key
  }, [location, menuItems])

  const handleMenuClick = ({ key }: { key: string }) => {
    if (key.endsWith('/settlement-assistant')) {
      window.open('https://supercup.github.io/delivery-mid-platform/settlement-task/pms-internal-settlement.html', '_blank')
      return
    }
    navigate(key)
  }

  return (
    <Layout className={styles.fullLayout}>
      <Sider className={styles.sider} width={256}>
        <div className={styles.clientSwitcher}>
          {clientId && <ClientSwitcher currentClientId={clientId} clients={clients} />}
        </div>
        <div className={styles.menuContainer}>
          <Menu
            theme="light"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems}
            onClick={handleMenuClick}
            className={styles.menu}
          />
        </div>
      </Sider>
      <Layout>
        <Content className={styles.content}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  )
}

export default ClientModuleLayout

