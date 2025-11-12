export type ToolChangelog = {
  version: string
  releasedAt: string
  highlights: string[]
}

export type ToolItem = {
  id: string
  name: string
  category: string
  status: '已内置' | '可安装'
  supportedPlatforms: string[]
  audiences: string[]
  description: string
  usageGuide: string
  latestVersion: string
  lastUpdatedAt: string
  previewUrl: string
  changelog: ToolChangelog[]
}