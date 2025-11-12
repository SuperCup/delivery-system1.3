import { useEffect, useMemo, useState } from 'react'
import { Card, Segmented, Input, Select, Tag, Button, Empty, Skeleton, Tooltip } from 'antd'
import {
  getKnowledgeDataset,
} from '../../services/knowledge-base-service'
import type {
  KnowledgeCategory,
  KnowledgeDataset,
  KnowledgeDimension,
  KnowledgeItem,
  KnowledgeType,
} from '../../types/knowledge'
import styles from './knowledge-base-page.module.css'

const { Search } = Input

type DimensionOption = {
  label: string
  value: KnowledgeDimension
  description: string
}

const DIMENSION_OPTIONS: DimensionOption[] = [
  { label: '公开', value: 'public', description: '对外发布的最佳实践与政策' },
  { label: '公司内部', value: 'internal', description: '仅内部员工可见的制度与流程' },
  { label: '业务组', value: 'business-unit', description: '业务条线沉淀的作战手册' },
  { label: '个人', value: 'personal', description: '个人收藏与自建知识库' },
  { label: '品牌', value: 'brand', description: '品牌专题素材与案例' },
  { label: '类型', value: 'type', description: '按知识类型归档的精选内容' },
]

const KNOWLEDGE_TYPES: (KnowledgeType | '全部类型')[] = [
  '全部类型',
  '技术',
  '业务',
  '运营',
  '市场',
  '品牌资产',
  '政策',
]

const DEFAULT_DATASET: KnowledgeDataset = {
  dimension: 'public',
  categories: [],
  items: [],
}

function countItemsByCategory(items: KnowledgeItem[]): Record<string, number> {
  return items.reduce<Record<string, number>>((acc, item) => {
    acc[item.categoryId] = (acc[item.categoryId] ?? 0) + 1
    return acc
  }, {})
}

export default function KnowledgeBasePage() {
  const [dimension, setDimension] = useState<KnowledgeDimension>('public')
  const [dataset, setDataset] = useState<KnowledgeDataset>(DEFAULT_DATASET)
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [typeFilter, setTypeFilter] = useState<(KnowledgeType | '全部类型')>('全部类型')
  const [categoryId, setCategoryId] = useState<string>('all')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getKnowledgeDataset(dimension)
        setDataset(data)
        setCategoryId('all')
        setTypeFilter('全部类型')
        setKeyword('')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [dimension])

  const categoryCountMap = useMemo(
    () => countItemsByCategory(dataset.items),
    [dataset.items],
  )

  const filteredCategories = useMemo<KnowledgeCategory[]>(() => {
    if (dimension !== 'type') return dataset.categories
    // 在类型维度下，按类型聚合展示
    return [...dataset.categories].sort((a, b) => (a.name > b.name ? 1 : -1))
  }, [dataset.categories, dimension])

  const filteredItems = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return dataset.items
      .filter((item) => {
        const matchCategory = categoryId === 'all' || item.categoryId === categoryId
        const matchType = typeFilter === '全部类型' || item.type === typeFilter
        const matchKeyword =
          kw.length === 0 ||
          item.title.toLowerCase().includes(kw) ||
          item.summary.toLowerCase().includes(kw) ||
          item.tags.some((tag) => tag.toLowerCase().includes(kw))
        return matchCategory && matchType && matchKeyword
      })
      .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1))
  }, [dataset.items, categoryId, typeFilter, keyword])

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.dimensionHeader}>
          <div>
            <h3 style={{ marginBottom: 4 }}>知识库</h3>
            <div style={{ color: 'var(--ant-color-text-secondary)' }}>
              同步维护交付体系的制度、实践与案例，支持跨团队共享与沉淀。
            </div>
          </div>
          <Segmented
            options={DIMENSION_OPTIONS.map((item) => item.label)}
            value={DIMENSION_OPTIONS.find((item) => item.value === dimension)?.label}
            onChange={(label) => {
              const option = DIMENSION_OPTIONS.find((item) => item.label === label)
              if (option) {
                setDimension(option.value)
              }
            }}
          />
        </div>
        <div style={{ marginTop: 12, color: 'var(--ant-color-text-secondary)' }}>
          {DIMENSION_OPTIONS.find((item) => item.value === dimension)?.description}
        </div>
      </Card>

      <div className={styles.layout}>
        <Card className={styles.categoryPanel} title="分类筛选" size="small" bordered>
          <Search
            placeholder="搜索分类"
            allowClear
            size="small"
            style={{ marginBottom: 12 }}
            onSearch={(kw) => setKeyword(kw)}
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Select
            size="small"
            value={typeFilter}
            style={{ marginBottom: 12 }}
            onChange={(value) => setTypeFilter(value as KnowledgeType | '全部类型')}
            options={KNOWLEDGE_TYPES.map((type) => ({ label: type, value: type }))}
          />
          <div className={styles.categoryList}>
            <div
              className={`${styles.categoryItem} ${categoryId === 'all' ? styles.categoryActive : ''}`}
              onClick={() => setCategoryId('all')}
            >
              <strong>全部</strong>
              <div style={{ color: 'var(--ant-color-text-secondary)' }}>
                {dataset.items.length} 条记录
              </div>
            </div>
            {filteredCategories.map((category) => (
              <div
                key={category.id}
                className={`${styles.categoryItem} ${categoryId === category.id ? styles.categoryActive : ''}`}
                onClick={() => setCategoryId(category.id)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <strong>{category.name}</strong>
                  <span>{categoryCountMap[category.id] ?? 0}</span>
                </div>
                <div style={{ color: 'var(--ant-color-text-secondary)', marginTop: 4 }}>
                  {category.description}
                </div>
                {category.type && (
                  <Tag color="blue" style={{ marginTop: 6 }}>
                    {category.type}
                  </Tag>
                )}
              </div>
            ))}
          </div>
        </Card>

        <div className={styles.contentPanel}>
          <Card
            bordered={false}
            title="知识条目"
            extra={
              <Button type="primary" size="small">
                新建知识条目
              </Button>
            }
          >
            {loading ? (
              <Skeleton active />
            ) : filteredItems.length === 0 ? (
              <Empty description="暂无符合条件的知识" />
            ) : (
              filteredItems.map((item) => (
                <Card key={item.id} className={styles.itemCard} size="small">
                  <div className={styles.itemHeader}>
                    <div>
                      <h4 style={{ marginBottom: 4 }}>{item.title}</h4>
                      <div style={{ color: 'var(--ant-color-text-secondary)' }}>{item.summary}</div>
                    </div>
                    <Tag color="geekblue">{item.type}</Tag>
                  </div>
                  <div className={styles.tagGroup}>
                    {item.tags.map((tag) => (
                      <Tag key={tag} bordered={false} onClick={() => setKeyword(tag)}>
                        {tag}
                      </Tag>
                    ))}
                  </div>
                  <div className={styles.itemFooter}>
                    <div className={styles.metricLine}>
                      <Tooltip title="最近更新时间">
                        <span>更新：{item.updatedAt}</span>
                      </Tooltip>
                      <span>维护人：{item.owner}</span>
                      <span>浏览：{item.views}</span>
                    </div>
                    <Button size="small" type="link">
                      查看详情
                    </Button>
                  </div>
                </Card>
              ))
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

