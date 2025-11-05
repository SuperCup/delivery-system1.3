export type DeliveryRecipientType = 'internal' | 'external'
export type DeliveryChannelType = 'sftp' | 'api'

export interface DeliveryTask {
  id: string
  name: string
  department: string
  recipientType: DeliveryRecipientType
  packageId: string
  channel: DeliveryChannelType
  scheduleCron: string
  status: 'draft' | 'active' | 'paused'
  lastRunAt?: string
}

export interface DashboardMetric {
  label: string
  value: number
}