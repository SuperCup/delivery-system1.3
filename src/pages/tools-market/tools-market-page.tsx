import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Tag,
  Button,
  Select,
  Input,
  Space,
  Typography,
  Empty,
  Modal,
  Pagination,
} from 'antd'
import { getTools } from '../../services/tools-market-service'
import type { ToolItem } from '../../types/tools'
import styles from './tools-market-page.module.css'

const { Search } = Input
const { Text } = Typography

const ToolsMarketPage = () => {
  const [tools, setTools] = useState<ToolItem[]>([])
  const [keyword, setKeyword] = useState('')
  const [category, setCategory] = useState<string>('全部类别')
  const [platforms, setPlatforms] = useState<string[]>([])
  const [usageGuide, setUsageGuide] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 6

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

  useEffect(() => {
    setPage(1)
  }, [keyword, category, platforms])

  const pagedTools = useMemo(() => {
    const start = (page - 1) * pageSize
    return filteredTools.slice(start, start + pageSize)
  }, [filteredTools, page])

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
            className={styles.searchInput}
            onSearch={setKeyword}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Select
            className={styles.categorySelect}
            value={category}
            onChange={setCategory}
            options={categoryOptions.map((option) => ({ label: option, value: option }))}
          />
          <Select
            mode="multiple"
            allowClear
            className={styles.platformSelect}
            placeholder="选择适用平台"
            value={platforms}
            onChange={setPlatforms}
            options={platformOptions.map((option) => ({ label: option, value: option }))}
          />
        </div>
      </Card>

      <Card bordered={false} className={styles.section}>
        {filteredTools.length === 0 ? (
          <Empty description="暂无符合条件的工具" />
        ) : (
          <>
            <div className={styles.toolsGrid}>
              {pagedTools.map((tool) => (
                <Card
                  key={tool.id}
                  className={styles.toolCard}
                  title={
                    <div className={styles.cardTitle}>
                      <span className={styles.cardName}>{tool.name}</span>
                      <Text type="secondary" className={styles.cardUpdated}>
                        最近更新：{tool.lastUpdatedAt}
                      </Text>
                    </div>
                  }
                  hoverable
                  bordered={false}
                >
                  <div className={styles.contentArea}>
                    <div className={styles.tagGroup}>
                      {tool.supportedPlatforms.map((platform) => (
                        <Tag key={platform} className={styles.capsuleTag} color="geekblue">
                          {platform}
                        </Tag>
                      ))}
                    </div>
                    <Text type="secondary" className={styles.descText}>
                      {tool.description}
                    </Text>
                  </div>
                  <div className={styles.cardFooter}>
                    <Space>
                      <Text type="secondary">版本：{tool.latestVersion}</Text>
                    </Space>
                    <Space>
                      <Button type="primary" onClick={() => setUsageGuide(tool.usageGuide)}>
                        查看使用方法
                      </Button>
                    </Space>
                  </div>
                </Card>
              ))}
            </div>
            <div className={styles.paginationWrapper}>
              <Pagination
                current={page}
                pageSize={pageSize}
                total={filteredTools.length}
                onChange={(p) => setPage(p)}
                showSizeChanger={false}
              />
            </div>
          </>
        )}
      </Card>

      <Modal
        open={!!usageGuide}
        title="使用方法"
        onCancel={() => setUsageGuide(null)}
        footer={null}
      >
        <Typography.Paragraph>{usageGuide}</Typography.Paragraph>
      </Modal>
    </div>
  )
}

export default ToolsMarketPage