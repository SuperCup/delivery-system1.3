import { useEffect, useMemo, useState } from 'react'
import { Card, Input, Segmented, Tag, Tooltip, Button, Badge, Empty } from 'antd'
import { ThunderboltOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { getMagiAgents } from '../../services/magi-core-service'
import type { MagiAgent } from '../../types/magi-core'
import styles from './magi-core-page.module.css'

const { Search } = Input

const STATUS_COLORS: Record<MagiAgent['status'], string> = {
  运行中: '#52c41a',
  停用: '#ff4d4f',
  维护中: '#faad14',
}

export default function MagiCorePage() {
  const [agents, setAgents] = useState<MagiAgent[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [status, setStatus] = useState<'全部' | MagiAgent['status']>('全部')
  const [selectedTag, setSelectedTag] = useState<string>('全部')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getMagiAgents()
        setAgents(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const availableTags = useMemo(() => {
    const tags = new Set<string>()
    agents.forEach((agent) => {
      agent.tags.forEach((tag) => tags.add(tag))
    })
    return ['全部', ...Array.from(tags)]
  }, [agents])

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchKeyword =
        !keyword ||
        agent.name.toLowerCase().includes(keyword.toLowerCase()) ||
        agent.description.toLowerCase().includes(keyword.toLowerCase())
      const matchStatus = status === '全部' || agent.status === status
      const matchTag = selectedTag === '全部' || agent.tags.includes(selectedTag)
      return matchKeyword && matchStatus && matchTag
    })
  }, [agents, keyword, status, selectedTag])

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.header}>
          <div>
            <h3 style={{ marginBottom: 4 }}>魔盒 MagiCore 智能体集合</h3>
            <div style={{ color: 'var(--ant-color-text-secondary)' }}>
              帮助业务快速复用内部大模型、规则引擎与工作流，沉淀最佳实践能力。
            </div>
          </div>
          <ThunderboltOutlined style={{ fontSize: 28, color: '#faad14' }} />
        </div>
        <div className={styles.searchBar}>
          <Search
            placeholder="搜索智能体名称或介绍"
            allowClear
            onSearch={setKeyword}
            onChange={(e) => setKeyword(e.target.value)}
            style={{ width: 320 }}
            value={keyword}
          />
          <Segmented
            options={['全部', '运行中', '维护中', '停用']}
            value={status}
            onChange={(val) => setStatus(val as typeof status)}
          />
          <Segmented
            options={availableTags}
            value={selectedTag}
            onChange={(val) => setSelectedTag(val as string)}
          />
        </div>
      </Card>

      <Card loading={loading} bordered={false}>
        {filteredAgents.length === 0 ? (
          <Empty description="暂无匹配的智能体" />
        ) : (
          <div className={styles.cardGrid}>
            {filteredAgents.map((agent) => (
              <Card
                key={agent.id}
                className={styles.agentCard}
                cover={
                  agent.image ? (
                    <img src={agent.image} alt={agent.name} className={styles.agentCover} />
                  ) : undefined
                }
                actions={[
                  <Button
                    key="use"
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    href={agent.entryUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    进入使用
                  </Button>,
                ]}
              >
                <div className={styles.agentStats}>
                  <Badge
                    count={agent.usageCount}
                    size="small"
                    showZero
                    title="近30天触发次数"
                  >
                    <h4 style={{ margin: 0 }}>{agent.name}</h4>
                  </Badge>
                  <Tooltip title={`上次使用时间：${agent.lastUsedAt}`}>
                    <div
                      className={styles.statusDot}
                      style={{ backgroundColor: STATUS_COLORS[agent.status] }}
                    />
                  </Tooltip>
                </div>
                <p style={{ minHeight: 60 }}>{agent.description}</p>
                <div className={styles.tagList}>
                  {agent.tags.map((tag) => (
                    <Tag
                      key={tag}
                      color="blue"
                      style={{ cursor: 'pointer' }}
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </Tag>
                  ))}
                </div>
                <div className={styles.cardFooter}>
                  <div style={{ color: 'var(--ant-color-text-secondary)' }}>
                    状态：{agent.status}
                  </div>
                  <Tooltip title="了解使用指引">
                    <Button size="small" type="link">
                      查看说明
                    </Button>
                  </Tooltip>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}