import { useEffect, useState } from 'react'
import { Card, Tag } from 'antd'
import DataTable from '../../components/data-table/data-table'
import type { ColumnsType } from 'antd/es/table'
import type { ChannelConfig } from '../../types/channel'
import { ChannelService } from '../../services/channel-service'

export default function ChannelsPage() {
  const [channels, setChannels] = useState<ChannelConfig[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    setLoading(true)
    ChannelService.getChannels()
      .then(setChannels)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnsType<ChannelConfig> = [
    { title: '通道ID', dataIndex: 'id' },
    { title: '名称', dataIndex: 'name' },
    {
      title: '类型',
      dataIndex: 'type',
      render: (v: string) => <Tag color={v === 'sftp' ? 'blue' : 'green'}>{v.toUpperCase()}</Tag>,
    },
    { title: '详情', render: (_, r) => (r.type === 'sftp' ? `${r.host}:${r.port}${r.basePath}` : r.baseUrl) },
  ]

  return (
    <Card title="通道配置">
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <DataTable<ChannelConfig>
        rowKey="id"
        loading={loading}
        dataSource={channels}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  )
}