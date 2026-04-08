import type { AiAgentEntry } from '../types/ai-agent-entry'

const mockAgentEntries: AiAgentEntry[] = [
  {
    id: 'inst-retail',
    name: '即时零售运营 AI Agent',
    description: '对话式 AI 运营助手，覆盖洞察、方案、投放等场景',
    url: 'https://agent-helper.netlify.app/',
    isOnline: true,
  },
  {
    id: 'daodian-marketing',
    name: '到店营销 AI Agent',
    description: '面向到店营销场景的对话式助手（上线后开放）',
    url: 'https://agent-helper.netlify.app/',
    isOnline: true,
  },
]

export const AiAgentEntryService = {
  async getAgentEntries(): Promise<AiAgentEntry[]> {
    await new Promise((r) => setTimeout(r, 200))
    return mockAgentEntries
  },
}

