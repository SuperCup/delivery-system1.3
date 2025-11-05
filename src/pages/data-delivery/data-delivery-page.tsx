import { useEffect, useMemo, useState } from 'react'
import { Card, Input, List, Select } from 'antd'
import styles from './data-delivery-page.module.css'
import { DataDeliveryService } from '../../services/data-delivery-service'
import type { ClientItem } from '../../types/client'

export default function DataDeliveryPage() {
  const [year, setYear] = useState<number>(2025)
  const [search, setSearch] = useState<string>('')
  const [clients, setClients] = useState<ClientItem[]>([])
  const [error, setError] = useState<string | undefined>()
  const [selected, setSelected] = useState<ClientItem | undefined>()

  useEffect(() => {
    DataDeliveryService.getClients()
      .then(setClients)
      .catch((e) => setError(e.message))
  }, [])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return clients.filter((c) => (q ? c.name.toLowerCase().includes(q) : true))
  }, [clients, search])

  return (
    <div className={styles.container}>
      <Card className={styles.sideCard} title="服务客户" bordered>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <Select
            value={year}
            style={{ width: 100 }}
            options={[2024, 2025, 2026].map((y) => ({ label: y.toString(), value: y }))}
            onChange={(v) => setYear(v)}
          />
          <Input.Search
            placeholder="请输入客户名称"
            allowClear
            onSearch={setSearch}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {error && <div style={{ color: 'red' }}>{error}</div>}
        <List
          itemLayout="horizontal"
          dataSource={filtered}
          renderItem={(item) => (
            <List.Item onClick={() => setSelected(item)} style={{ cursor: 'pointer' }}>
              <List.Item.Meta title={item.name} description={`客户ID：${item.id}`} />
            </List.Item>
          )}
        />
      </Card>
      {!selected ? (
        <div className={styles.placeholder}>请选择服务客户进行操作</div>
      ) : (
        <Card title={`客户：${selected.name}（${year}）`}>
          这里展示对该客户的数据交付配置（示例）：
          <ul>
            <li>交付通道：SFTP 或 API</li>
            <li>交付频率：每日/每周/自定义 CRON</li>
            <li>数据包：按业务包选择（订单、报表等）</li>
          </ul>
        </Card>
      )}
    </div>
  )
}