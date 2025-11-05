export interface ChannelConfigBase {
  id: string
  name: string
  type: 'sftp' | 'api'
}

export interface SftpChannelConfig extends ChannelConfigBase {
  type: 'sftp'
  host: string
  port: number
  username: string
  basePath: string
}

export interface ApiChannelConfig extends ChannelConfigBase {
  type: 'api'
  baseUrl: string
  authToken?: string
}

export type ChannelConfig = SftpChannelConfig | ApiChannelConfig