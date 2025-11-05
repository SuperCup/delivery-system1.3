export type SettlementRule = {
  id: string
  name: string
  status: '正常' | '待完善'
}

export type SettlementOverview = {
  lastRun: string
  rules: SettlementRule[]
}