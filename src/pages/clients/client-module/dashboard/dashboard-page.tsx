import { useEffect, useMemo, useState } from 'react'
import { Button, Card, message, Tabs, Typography } from 'antd'
import { useLocation, useParams } from 'react-router-dom'
import styles from './dashboard-page.module.css'
import type { BusinessType, Contact } from '../../../../types/client'
import type { BusinessActivityGuide } from '../../../../types/activity-guidance'
import { ClientActivityService } from '../../../../services/client-activity-service'
import DaodianDashboardPage from './daodian-dashboard-page'
import InstantRetailConfigPage from './instant-retail-config-page'
import WumaDashboardPage from './wuma-dashboard-page'

const { Title } = Typography

const businessTypeOptions: BusinessType[] = ['到店营销', '即时零售', '物码营销']

export default function DashboardPage() {
  const location = useLocation()
  const { clientId: routeClientId } = useParams<{ clientId?: string }>()
  const clientId = useMemo(
    () => new URLSearchParams(location.search).get('clientId') || routeClientId || '',
    [location.search, routeClientId],
  )

  const [guides, setGuides] = useState<Partial<Record<BusinessType, BusinessActivityGuide>>>({})
  const [contacts, setContacts] = useState<Contact[]>([])
  const [activeType, setActiveType] = useState<BusinessType>('到店营销')

  useEffect(() => {
    if (!clientId) return
    const init = async () => {
      try {
        const [, guideList, contactList] = await Promise.all([
          ClientActivityService.getActivities(clientId),
          ClientActivityService.getBusinessGuides(),
          ClientActivityService.getClientContacts(clientId),
        ])
        const guideMap = guideList.reduce(
          (acc, item) => {
            acc[item.type] = item
            return acc
          },
          {} as Partial<Record<BusinessType, BusinessActivityGuide>>,
        )
        setGuides((prev) => ({ ...prev, ...guideMap }))
        setContacts(contactList)
      } catch (error: unknown) {
        const err = error as Error
        message.error(`加载数据失败：${err.message}`)
      }
    }
    init()
  }, [clientId])

  const renderTabContent = (type: BusinessType) => {
    const guide = guides[type]
    switch (type) {
      case '到店营销':
        return <DaodianDashboardPage clientId={clientId} guide={guide} contacts={contacts} />
      case '即时零售':
        return <InstantRetailConfigPage />
      case '物码营销':
        return <WumaDashboardPage clientId={clientId} guide={guide} contacts={contacts} />
      default:
        return null
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          客户看板
        </Title>
        <Button
          type="primary"
          disabled={!clientId}
          onClick={() => window.open('https://dsmcloud-datacenter.netlify.app/', '_blank')}
        >
          进入客户端
        </Button>
      </div>

      <Card className={styles.tableCard}>
        <Tabs
          activeKey={activeType}
          onChange={(key) => setActiveType(key as BusinessType)}
          items={businessTypeOptions.map((type) => ({
            key: type,
            label: type,
            children: renderTabContent(type),
          }))}
        />
      </Card>
    </div>
  )
}

