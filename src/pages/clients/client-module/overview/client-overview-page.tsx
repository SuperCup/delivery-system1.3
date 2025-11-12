import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  Card,
  Row,
  Col,
  Descriptions,
  Tag,
  Table,
  Tabs,
  Typography,
  Space,
  Button,
  message,
  Statistic,
  List,
  Empty,
} from 'antd'
import {
  DownloadOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import styles from './client-overview-page.module.css'
import type {
  ClientDetail,
  IndustryInsight,
  BusinessAnalysis,
  MarketingCase,
} from '../../../../types/client'
import { ClientService } from '../../../../services/client-service'

const { Title, Text, Paragraph } = Typography

export default function ClientOverviewPage() {
  const { clientId } = useParams<{ clientId: string }>()
  const [loading, setLoading] = useState(false)
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null)
  const [insights, setInsights] = useState<IndustryInsight[]>([])
  const [analyses, setAnalyses] = useState<BusinessAnalysis[]>([])
  const [cases, setCases] = useState<MarketingCase[]>([])

  useEffect(() => {
    if (!clientId) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [detailData, insightsData, analysesData, casesData] = await Promise.all([
          ClientService.getClientDetail(clientId),
          ClientService.getClientInsights(clientId),
          ClientService.getClientAnalyses(clientId),
          ClientService.getClientCases(clientId),
        ])
        setClientDetail(detailData)
        setInsights(insightsData)
        setAnalyses(analysesData)
        setCases(casesData)
      } catch (error: unknown) {
        const err = error as Error
        message.error(`加载客户数据失败：${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [clientId])

  if (!clientDetail && !loading) {
    return (
      <Card>
        <Empty description="客户信息不存在" />
      </Card>
    )
  }

  const insightColumns: ColumnsType<IndustryInsight> = [
    { title: '洞察标题', dataIndex: 'title', key: 'title' },
    { title: '类别', dataIndex: 'category', key: 'category', width: 100 },
    {
      title: '发布时间',
      dataIndex: 'publishedAt',
      key: 'publishedAt',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 80,
      render: () => <Button type="link" size="small">查看</Button>,
    },
  ]

  const analysisColumns: ColumnsType<BusinessAnalysis> = [
    { title: '分析主题', dataIndex: 'topic', key: 'topic' },
    {
      title: '业务线',
      dataIndex: 'businessLine',
      key: 'businessLine',
      width: 120,
      render: (line: string) => <Tag color="blue">{line}</Tag>,
    },
    {
      title: '分析时间',
      dataIndex: 'analyzedAt',
      key: 'analyzedAt',
      width: 120,
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: () => (
        <Space size="small">
          <Button type="link" size="small">查看</Button>
          <Button type="link" size="small" icon={<DownloadOutlined />}>
            下载
          </Button>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          总览
        </Title>
      </div>
      {/* 基本信息 */}
      <Card title="基本信息" loading={loading} className={styles.section}>
        <Descriptions column={3} bordered>
          <Descriptions.Item label="客户名称">{clientDetail?.name}</Descriptions.Item>
          <Descriptions.Item label="小程序版本">{clientDetail?.version}</Descriptions.Item>
          <Descriptions.Item label="运营模式">
            <Space>
              {clientDetail?.operationModes.map((mode) => (
                <Tag key={mode} color="cyan">
                  {mode}
                </Tag>
              ))}
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="运营人员" span={3}>
            <Space>
              {clientDetail?.operators.map((op) => (
                <Tag key={op}>{op}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 极简任务 */}
      <Card title="极简任务" loading={loading} className={styles.section}>
        {clientDetail?.tasks && clientDetail.tasks.length > 0 ? (
          <List
            dataSource={clientDetail.tasks}
            renderItem={(task) => (
              <List.Item
                actions={[
                  <Tag
                    key="status"
                    color={
                      task.status === '已完成'
                        ? 'success'
                        : task.status === '进行中'
                          ? 'processing'
                          : 'default'
                    }
                  >
                    {task.status}
                  </Tag>,
                ]}
              >
                <List.Item.Meta title={task.title} description={`截止：${task.dueDate}`} />
              </List.Item>
            )}
          />
        ) : (
          <Empty description="暂无任务" />
        )}
      </Card>

      {/* 经营推荐 */}
      <Card title="经营推荐" loading={loading} className={styles.section}>
        {clientDetail?.recommendations && clientDetail.recommendations.length > 0 ? (
          <Row gutter={[16, 16]}>
            {clientDetail.recommendations.map((rec) => (
              <Col key={rec.id} xs={24} sm={12} md={8}>
                <Card size="small" hoverable className={styles.recommendCard}>
                  <Title level={5}>{rec.title}</Title>
                  <Paragraph ellipsis={{ rows: 2 }}>{rec.description}</Paragraph>
                  <Button type="link" size="small">
                    了解详情
                  </Button>
                </Card>
              </Col>
            ))}
          </Row>
        ) : (
          <Empty description="暂无推荐" />
        )}
      </Card>

      {/* 能力推荐 */}
      <Card title="能力推荐" loading={loading} className={styles.section}>
        {clientDetail?.capabilities && clientDetail.capabilities.length > 0 ? (
          <Space wrap>
            {clientDetail.capabilities.map((cap) => (
              <Tag key={cap} color="geekblue">
                {cap}
              </Tag>
            ))}
          </Space>
        ) : (
          <Empty description="暂无推荐能力" />
        )}
      </Card>

      {/* 昨日关键数据 */}
      <Card title="昨日关键数据" loading={loading} className={styles.section}>
        {clientDetail?.yesterdayMetrics ? (
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="日活用户"
                value={clientDetail.yesterdayMetrics.dau}
                suffix={
                  clientDetail.yesterdayMetrics.dauTrend === 'up' ? (
                    <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                  )
                }
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="新增用户"
                value={clientDetail.yesterdayMetrics.newUsers}
                suffix={
                  clientDetail.yesterdayMetrics.newUsersTrend === 'up' ? (
                    <ArrowUpOutlined style={{ color: '#52c41a' }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
                  )
                }
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="人均时长(分钟)"
                value={clientDetail.yesterdayMetrics.avgDuration}
                precision={1}
              />
            </Col>
            <Col xs={24} sm={12} md={6}>
              <Statistic
                title="留存率"
                value={clientDetail.yesterdayMetrics.retention}
                suffix="%"
                precision={2}
              />
            </Col>
          </Row>
        ) : (
          <Empty description="暂无数据" />
        )}
      </Card>

      {/* 行业洞察与业务分析 */}
      <Card loading={loading} className={styles.section}>
        <Tabs
          defaultActiveKey="insights"
          items={[
            {
              key: 'insights',
              label: '行业洞察',
              children: (
                <Table
                  rowKey="id"
                  columns={insightColumns}
                  dataSource={insights}
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: '暂无洞察' }}
                />
              ),
            },
            {
              key: 'analyses',
              label: '业务分析',
              children: (
                <Table
                  rowKey="id"
                  columns={analysisColumns}
                  dataSource={analyses}
                  pagination={{ pageSize: 5 }}
                  locale={{ emptyText: '暂无分析' }}
                />
              ),
            },
            {
              key: 'cases',
              label: '营销案例',
              children: (
                <List
                  dataSource={cases}
                  renderItem={(caseItem) => (
                    <List.Item
                      actions={[
                        <Button key="view" type="link" size="small">
                          查看详情
                        </Button>,
                      ]}
                    >
                      <List.Item.Meta
                        title={caseItem.title}
                        description={
                          <Space>
                            <Tag color="blue">{caseItem.industry}</Tag>
                            <Text type="secondary">{caseItem.publishedAt}</Text>
                          </Space>
                        }
                      />
                    </List.Item>
                  )}
                  locale={{ emptyText: '暂无案例' }}
                />
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

