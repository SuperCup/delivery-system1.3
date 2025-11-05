import { useEffect, useState } from 'react'
import { Card } from 'antd'
import DataTable from '../../components/data-table/data-table'
import type { ColumnsType } from 'antd/es/table'
import type { DataPackage } from '../../types/package'
import { PackageService } from '../../services/package-service'

export default function PackagesPage() {
  const [packages, setPackages] = useState<DataPackage[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useEffect(() => {
    setLoading(true)
    PackageService.getPackages()
      .then(setPackages)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const columns: ColumnsType<DataPackage> = [
    { title: '数据包ID', dataIndex: 'id' },
    { title: '名称', dataIndex: 'name' },
    { title: '版本', dataIndex: 'version' },
    { title: '归属部门', dataIndex: 'ownerDepartment' },
    { title: '记录数', dataIndex: 'rowCount' },
  ]

  return (
    <Card title="数据包">
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <DataTable<DataPackage>
        rowKey="id"
        loading={loading}
        dataSource={packages}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  )
}