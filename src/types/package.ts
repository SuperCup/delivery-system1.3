export interface DataPackage {
  id: string
  name: string
  ownerDepartment: string
  version: string
  schema: Array<{ field: string; type: string; nullable?: boolean }>
  rowCount?: number
}