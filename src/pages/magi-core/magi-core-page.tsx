import { useEffect, useMemo, useState } from 'react'
import { Card, Button, Empty, Tabs, Tag } from 'antd'
import {
  PlayCircleOutlined,
  DeploymentUnitOutlined,
  ArrowRightOutlined,
} from '@ant-design/icons'
import { getMagiAgents } from '../../services/magi-core-service'
import type { MagiAgent } from '../../types/magi-core'
import styles from './magi-core-page.module.css'

const AGENT_CHAT_URL = 'https://agent-helper.netlify.app/'
const CATEGORY_TABS = ['全部', '执行层', '策略层', '数据层']

export default function MagiCorePage() {
  const [agents, setAgents] = useState<MagiAgent[]>([])
  const [loading, setLoading] = useState(false)
  const [category, setCategory] = useState<string>('全部')

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

  const filteredAgents = useMemo(() => {
    return agents.filter((agent) => {
      const matchCategory = category === '全部' || agent.tags.includes(category)
      return matchCategory
    })
  }, [agents, category])

  return (
    <div className={styles.page}>
      {/* AI Agent Entry */}
      <a
        className={styles.heroCard}
        href={AGENT_CHAT_URL}
        target="_blank"
        rel="noreferrer"
      >
        <div className={styles.heroContent}>
          <div className={styles.heroIconWrap}>
            <DeploymentUnitOutlined className={styles.heroIcon} />
          </div>
          <div className={styles.heroText}>
            <span className={styles.heroTitle}>即时零售运营 AI Agent</span>
            <Tag bordered={false} className={styles.heroBadge}>NEW</Tag>
          </div>
          <span className={styles.heroDesc}>对话式 AI 运营助手，覆盖洞察、方案、投放等场景</span>
          <div className={styles.heroBtnWrap}>
            <span className={styles.heroBtnLabel}>开始对话</span>
            <ArrowRightOutlined className={styles.heroBtnArrow} />
          </div>
        </div>
      </a>

      <Card className={styles.filterCard} bordered={false}>
        <Tabs
          className={styles.categoryTabs}
          activeKey={category}
          onChange={(val) => setCategory(val)}
          items={CATEGORY_TABS.map((tab) => ({ key: tab, label: tab }))}
        />
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
                bordered={false}
                cover={
                  agent.image ? (
                    <img src={agent.image} alt={agent.name} className={styles.agentCover} />
                  ) : undefined
                }
              >
                <div className={styles.cardBody}>
                  <div className={styles.agentTitle}>{agent.name}</div>
                  <p className={styles.agentDesc}>{agent.description}</p>
                  <div className={styles.agentMeta}>
                    <div className={styles.agentUsage}>
                      使用量：{agent.usageCount}
                    </div>
                    <Button
                      type="primary"
                      ghost
                      icon={<PlayCircleOutlined />}
                      href={agent.entryUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      立刻使用
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}