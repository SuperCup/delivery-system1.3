import { Table } from 'antd'
import type { TableProps } from 'antd'

export function DataTable<T extends object>(props: TableProps<T>) {
  return <Table<T> bordered size="middle" {...props} />
}

export default DataTable