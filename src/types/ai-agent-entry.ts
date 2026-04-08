export type AiAgentId = 'inst-retail' | 'daodian-marketing'

export interface AiAgentEntry {
  id: AiAgentId
  name: string
  description: string
  url: string
  isOnline: boolean
}

