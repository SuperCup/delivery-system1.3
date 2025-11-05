export type BusinessType = '到店营销' | '即时零售' | '物码营销'

export type ClientSummary = {
  id: string
  name: string
  contactCount: number
  business: { type: BusinessType; activityCount: number }[]
}