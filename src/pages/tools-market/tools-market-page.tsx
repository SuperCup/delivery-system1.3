import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  List,
  Tag,
  Button,
  Select,
  Input,
  Drawer,
  Space,
  Typography,
  Descriptions,
  Timeline,
  Badge,
  Empty,
} from 'antd'
import { getTools } from '../../services/tools-market-service'
import type { ToolItem } from '../../types/tools'
import styles from './tools-market-page.module.css'

const { Search } = Input
const { Text } = Typography

const statusColor = {
  已内置: 'green',
  可安装: 'blue',
} as const

const ToolsMarketPage = () => {
  const [tools, setTools] = useState<ToolItem[]>([])
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>('全部类别')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [activeTool, setActiveTool] = useState<ToolItem | null>(null)

  useEffect(() => {
    getTools().then(setTools)
  }, [])

  const categoryOptions = useMemo(() => {
    const set = new Set<string>()
    tools.forEach((tool) => set.add(tool.category))
    return ['全部类别', ...Array.from(set)]
  }, [tools])

  const platformOptions = useMemo(() => {
    const set = new Set<string>()
    tools.forEach((tool) => tool.supportedPlatforms.forEach((p) => set.add(p)))
    return Array.from(set)
  }, [tools])

  const filteredTools = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return tools.filter((tool) => {
      const matchKeyword =
        kw.length === 0 ||
        tool.name.toLowerCase().includes(kw) ||
        tool.description.toLowerCase().includes(kw)
      const matchCategory = category === '全部类别' || tool.category === category
      const matchPlatforms =
        platforms.length === 0 ||
        platforms.every(
          (p) => tool.supportedPlatforms.includes(p) || tool.supportedPlatforms.includes('全平台'),
        )
      return matchKeyword && matchCategory && matchPlatforms
    })
  }, [tools, keyword, category, platforms])

  return (
    <div className={styles.page}>
      <Card
        title="工具市场"
        extra={
          <Text type="secondary">聚合公司内部提升效率的插件、脚本与应用工具</Text>
        }
      >
        <div className={styles.filters}>
          <Search
            placeholder="搜索工具名称或介绍"
            allowClear
            style={{ width: 260 }}
            onSearch={setKeyword}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Select
            style={{ width: 200 }}
            value={category}
            onChange={setCategory}
            options={categoryOptions.map((option) => ({ label: option, value: option }))}
          />
          <Select
            mode="multiple"
            allowClear
            style={{ minWidth: 240 }}
            placeholder="选择适用平台"
            value={platforms}
            onChange={setPlatforms}
            options={platformOptions.map((option) => ({ label: option, value: option }))}
          />
        </div>
      </Card>

      <Card bordered={false}>
        {filteredTools.length === 0 ? (
          <Empty description="暂无符合条件的工具" />
        ) : (
          <List
            grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 3 }}
            dataSource={filteredTools}
            renderItem={(tool) => (
              <List.Item>
                <Card className={styles.toolCard} title={tool.name} hoverable>
                  <div className={styles.toolMeta}>
                    <Tag color={statusColor[tool.status]}>{tool.status}</Tag>
                    <Text type="secondary">最近更新：{tool.lastUpdatedAt}</Text>
                  </div>
                  <div className={styles.tagGroup}>
                    <Badge color="#1677ff" text={tool.category} />
                    {tool.supportedPlatforms.map((platform) => (
                      <Tag key={platform} color="geekblue">
                        {platform}
                      </Tag>
                    ))}
                  </div>
                  <Text type="secondary">{tool.description}</Text>
                  <div>
                    <Text type="secondary">适用人群：</Text>
                    <div className={styles.tagGroup}>
                      {tool.audiences.map((audience) => (
                        <Tag key={audience} bordered>
                          {audience}
                        </Tag>
                      ))}
                    </div>
                  </div>
                  <div className={styles.cardFooter}>
                    <Space>
                      <Text type="secondary">版本：{tool.latestVersion}</Text>
                    </Space>
                    <Space>
                      <Button type="link" size="small" onClick={() => setActiveTool(tool)}>
                        预览
                      </Button>
                      <Button type="primary" disabled={tool.status === '已内置'}>
                        {tool.status === '已内置' ? '已部署' : '申请安装'}
                      </Button>
                    </Space>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        )}
      </Card>

      <Drawer
        width={520}
        open={!!activeTool}
        title={activeTool?.name}
        onClose={() => setActiveTool(null)}
      >
        {activeTool && (
          <div className={styles.previewContent}>
            <Descriptions column={1} size="small" bordered>
              <Descriptions.Item label="分类">{activeTool.category}</Descriptions.Item>
              <Descriptions.Item label="适用平台">
                {activeTool.supportedPlatforms.join('、')}
              </Descriptions.Item>
              <Descriptions.Item label="适用人群">
                {activeTool.audiences.join('、')}
              </Descriptions.Item>
              <Descriptions.Item label="使用指引">{activeTool.usageGuide}</Descriptions.Item>
            </Descriptions>
            <Card title="工具介绍">
              <Text>{activeTool.description}</Text>
            </Card>
            <Card title="版本迭代说明">
              <Timeline
                items={activeTool.changelog.map((item) => ({
                  children: (
                    <Space direction="vertical">
                      <Text strong>
                        {item.version} · {item.releasedAt}
                      </Text>
                      <ul style={{ paddingLeft: 20, margin: 0 }}>
                        {item.highlights.map((highlight) => (
                          <li key={highlight}>{highlight}</li>
                        ))}
                      </ul>
                    </Space>
                  ),
                }))}
              />
            </Card>
            <Button type="primary" href={activeTool.previewUrl} target="_blank" rel="noreferrer">
              前往工具主页
            </Button>
          </div>
        )}
      </Drawer>
    </div>
  )
}

export default ToolsMarketPage