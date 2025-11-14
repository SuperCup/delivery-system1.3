import { useEffect, useMemo, useState } from 'react'
import { Card, Button, Empty, Tabs } from 'antd'
import { ThunderboltOutlined, PlayCircleOutlined } from '@ant-design/icons'
import { getMagiAgents } from '../../services/magi-core-service'
import type { MagiAgent } from '../../types/magi-core'
import styles from './magi-core-page.module.css'

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
      <Card className={styles.introCard}>
        <div className={styles.header}>
          <div>
            <h3 style={{ marginBottom: 4 }}>魔盒 MagiCore 智能体集合</h3>
            <div style={{ color: 'var(--ant-color-text-secondary)' }}>
              帮助业务快速复用内部大模型、规则引擎与工作流，沉淀最佳实践能力。
            </div>
          </div>
          <Button type="primary" size="large" icon={<ThunderboltOutlined />}>
            创建我的智能体
          </Button>
        </div>

        <div className={styles.filterTips}>
          精选覆盖执行层、策略层、数据层的智能体能力，帮助团队快速组合业务方案。
        </div>
      </Card>

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