import { useEffect, useMemo, useState } from 'react'
import { Card, Input, Table, Tag } from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { getDataSources } from '../../services/data-center-service'
import type { DataSource } from '../../types/data-center'

const { Search } = Input

const DataCenterPage = () => {
  const [list, setList] = useState<DataSource[]>([])
  const [kw, setKw] = useState<string>('')

  useEffect(() => {
    getDataSources().then(setList)
  }, [])

  const data = useMemo(() => {
    const k = kw.trim()
    if (!k) return list
    return list.filter((i) =>
      [i.name, i.category, i.source].some((t) => t.toLowerCase().includes(k.toLowerCase())),
    )
  }, [list, kw])

  const columns: ColumnsType<DataSource> = [
    { title: '数据源名称', dataIndex: 'name', key: 'name' },
    {
      title: '业务类别',
      dataIndex: 'category',
      key: 'category',
      render: (v: DataSource['category']) => (
        <Tag color={v === '到店营销' ? 'blue' : v === '即时零售' ? 'green' : v === '物码营销' ? 'gold' : 'default'}>
          {v}
        </Tag>
      ),
    },
    { title: '标准字段数', dataIndex: 'standardFields', key: 'standardFields', width: 120 },
    { title: '更新频率', dataIndex: 'updateFrequency', key: 'updateFrequency', width: 160 },
    { title: '来源', dataIndex: 'source', key: 'source', width: 140 },
  ]

  return (
    <Card title="数据中心" extra={<div>公司标准数据源查询与管理</div>}>
      <div style={{ marginBottom: 12 }}>
        <Search placeholder="搜索名称/类别/来源" onSearch={setKw} allowClear style={{ width: 320 }} />
      </div>
      <Table rowKey="id" columns={columns} dataSource={data} pagination={{ pageSize: 10 }} />
    </Card>
  )
}

export default DataCenterPage