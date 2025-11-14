import { useEffect } from 'react'
import { Button, Card } from 'antd'
import DataTable from '../../components/data-table/data-table'
import type { ColumnsType } from 'antd/es/table'
import type { DeliveryTask } from '../../types/delivery'
import { useDispatch, useSelector } from 'react-redux'
import { fetchTasks } from '../../store/delivery-slice'
import type { RootState } from '../../store'

export default function DeliveryPage() {
  const dispatch = useDispatch()
  const { tasks, loading, error } = useSelector((s: RootState) => s.delivery)

  useEffect(() => {
    dispatch(fetchTasks() as unknown as ReturnType<typeof fetchTasks>)
  }, [dispatch])

  const columns: ColumnsType<DeliveryTask> = [
    { title: '任务ID', dataIndex: 'id' },
    { title: '任务名称', dataIndex: 'name' },
    { title: '部门', dataIndex: 'department' },
    { title: '对象类型', dataIndex: 'recipientType' },
    { title: '数据包', dataIndex: 'packageId' },
    { title: '通道', dataIndex: 'channel' },
    { title: '调度表达式', dataIndex: 'scheduleCron' },
    { title: '状态', dataIndex: 'status' },
    { title: '最近一次运行', dataIndex: 'lastRunAt' },
  ]

  return (
    <Card title="交付任务">
      {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
      <div style={{ marginBottom: 12 }}>
        <Button type="primary">新建任务（示例）</Button>
      </div>
      <DataTable<DeliveryTask>
        rowKey="id"
        loading={loading}
        dataSource={tasks}
        columns={columns}
        pagination={{ pageSize: 10 }}
      />
    </Card>
  )
}