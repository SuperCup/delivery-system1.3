export interface DeliveryLog {
  id: string
  taskId: string
  timestamp: string
  status: 'success' | 'failed'
  message?: string
}