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
import { DownloadOutlined } from '@ant-design/icons'
import styles from './client-detail-page.module.css'
import type {
  ClientDetail,
  IndustryInsight,
  BusinessAnalysis,
  MarketingCase,
} from '../../types/client'
import { ClientService } from '../../services/client-service'

const { Title, Text, Paragraph } = Typography

export default function ClientDetailPage() {
  const { id, clientId: paramClientId } = useParams<{ id?: string; clientId?: string }>()
  const resolvedClientId = id ?? paramClientId ?? ''
  const [loading, setLoading] = useState(false)
  const [clientDetail, setClientDetail] = useState<ClientDetail | null>(null)
  const [insights, setInsights] = useState<IndustryInsight[]>([])
  const [analyses, setAnalyses] = useState<BusinessAnalysis[]>([])
  const [cases, setCases] = useState<MarketingCase[]>([])

  useEffect(() => {
    if (!resolvedClientId) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [detailData, insightsData, analysesData, casesData] = await Promise.all([
          ClientService.getClientDetail(resolvedClientId),
          ClientService.getIndustryInsights(resolvedClientId),
          ClientService.getBusinessAnalyses(resolvedClientId),
          ClientService.getMarketingCases(resolvedClientId),
        ])
        setClientDetail(detailData)
        setInsights(insightsData)
        setAnalyses(analysesData)
        setCases(casesData)
      } catch (e: unknown) {
        const err = e as Error
        message.error(`加载客户详情失败：${err.message}`)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [resolvedClientId])

  const contactColumns = [
    {
      title: '姓名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '职位',
      dataIndex: 'position',
      key: 'position',
    },
    {
      title: '部门',
      dataIndex: 'department',
      key: 'department',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
      key: 'email',
    },
  ]

  const businessColorMap = {
    到店营销: 'blue',
    即时零售: 'cyan',
    物码营销: 'geekblue',
  }

  if (loading && !clientDetail) {
    return <div>加载中...</div>
  }

  if (!clientDetail) {
    return <Empty description="客户不存在" />
  }

  return (
    <div className={styles.page}>
      {/* 客户基本信息 */}
      <Card className={styles.section} loading={loading}>
        <Title level={4} style={{ marginBottom: 24 }}>
          {clientDetail.name}
        </Title>
        <Descriptions column={{ xs: 1, sm: 2, md: 3 }} bordered>
          <Descriptions.Item label="客户ID">{clientDetail.id}</Descriptions.Item>
          {clientDetail.industry && (
            <Descriptions.Item label="所属行业">{clientDetail.industry}</Descriptions.Item>
          )}
          {clientDetail.address && (
            <Descriptions.Item label="公司地址">{clientDetail.address}</Descriptions.Item>
          )}
          {clientDetail.website && (
            <Descriptions.Item label="官方网站">
              <a href={clientDetail.website} target="_blank" rel="noopener noreferrer">
                {clientDetail.website}
              </a>
            </Descriptions.Item>
          )}
          {clientDetail.createdAt && (
            <Descriptions.Item label="合作开始时间">{clientDetail.createdAt}</Descriptions.Item>
          )}
        </Descriptions>
        {clientDetail.description && (
          <Paragraph style={{ marginTop: 16 }}>{clientDetail.description}</Paragraph>
        )}
      </Card>

      {/* 三大业务概况 */}
      <Card title="业务概况" className={styles.section} loading={loading}>
        <Row gutter={[16, 16]}>
          {clientDetail.business.map((biz) => (
            <Col key={biz.type} xs={24} sm={8}>
              <Card>
                <Statistic
                  title={
                    <Tag color={businessColorMap[biz.type as keyof typeof businessColorMap]}>
                      {biz.type}
                    </Tag>
                  }
                  value={biz.activityCount}
                  suffix="个活动"
                />
                {biz.totalAmount && (
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    累计金额：¥{biz.totalAmount.toLocaleString()}
                  </Text>
                )}
                {biz.lastActivityDate && (
                  <div style={{ marginTop: 8 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      最近活动：{biz.lastActivityDate}
                    </Text>
                  </div>
                )}
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 联系人信息 */}
      <Card title="联系人信息" className={styles.section} loading={loading}>
        {clientDetail.contacts.length === 0 ? (
          <Empty description="暂无联系人信息" />
        ) : (
          <Table
            columns={contactColumns}
            dataSource={clientDetail.contacts}
            rowKey="id"
            pagination={false}
            size="small"
          />
        )}
      </Card>

      {/* 标签页：行业洞察、分析报告、营销案例 */}
      <Card className={styles.section} loading={loading}>
        <Tabs
          defaultActiveKey="insights"
          items={[
            {
              key: 'insights',
              label: '行业洞察',
              children: insights.length === 0 ? (
                <Empty description="暂无行业洞察" />
              ) : (
                <List
                  dataSource={insights}
                  renderItem={(item) => (
                    <List.Item>
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{item.title}</Text>
                            {item.source && <Tag>{item.source}</Tag>}
                          </Space>
                        }
                        description={
                          <div>
                            <Paragraph ellipsis={{ rows: 2 }}>{item.content}</Paragraph>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {item.publishDate}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'analyses',
              label: '分析报告',
              children: analyses.length === 0 ? (
                <Empty description="暂无分析报告" />
              ) : (
                <List
                  dataSource={analyses}
                  renderItem={(item) => (
                    <List.Item
                      actions={[
                        item.downloadUrl ? (
                          <Button
                            key="download"
                            type="link"
                            icon={<DownloadOutlined />}
                            onClick={() => window.open(item.downloadUrl)}
                          >
                            下载
                          </Button>
                        ) : null,
                      ]}
                    >
                      <List.Item.Meta
                        title={
                          <Space>
                            <Text strong>{item.title}</Text>
                            <Tag>{item.reportType}</Tag>
                          </Space>
                        }
                        description={
                          <div>
                            <Paragraph ellipsis={{ rows: 2 }}>{item.summary}</Paragraph>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              发布时间：{item.publishDate}
                            </Text>
                          </div>
                        }
                      />
                    </List.Item>
                  )}
                />
              ),
            },
            {
              key: 'cases',
              label: '营销案例',
              children: cases.length === 0 ? (
                <Empty description="暂无营销案例" />
              ) : (
                <Row gutter={[16, 16]}>
                  {cases.map((caseItem) => (
                    <Col key={caseItem.id} xs={24} sm={12} lg={8}>
                      <Card
                        title={caseItem.title}
                        size="small"
                        extra={
                          <Tag color={businessColorMap[caseItem.businessType as keyof typeof businessColorMap]}>
                            {caseItem.businessType}
                          </Tag>
                        }
                      >
                        <Paragraph ellipsis={{ rows: 3 }}>{caseItem.description}</Paragraph>
                        <div style={{ marginTop: 12 }}>
                          <Text type="secondary" style={{ fontSize: 12 }}>
                            活动时间：{caseItem.startDate}
                            {caseItem.endDate && ` - ${caseItem.endDate}`}
                          </Text>
                        </div>
                        {caseItem.metrics && (
                          <Row gutter={8} style={{ marginTop: 12 }}>
                            {caseItem.metrics.participants && (
                              <Col span={8}>
                                <Statistic
                                  title="参与人数"
                                  value={caseItem.metrics.participants}
                                  valueStyle={{ fontSize: 14 }}
                                />
                              </Col>
                            )}
                            {caseItem.metrics.revenue && (
                              <Col span={8}>
                                <Statistic
                                  title="营收"
                                  value={caseItem.metrics.revenue}
                                  prefix="¥"
                                  valueStyle={{ fontSize: 14 }}
                                />
                              </Col>
                            )}
                            {caseItem.metrics.roi && (
                              <Col span={8}>
                                <Statistic
                                  title="ROI"
                                  value={caseItem.metrics.roi}
                                  suffix="%"
                                  valueStyle={{ fontSize: 14 }}
                                />
                              </Col>
                            )}
                          </Row>
                        )}
                        {caseItem.tags && caseItem.tags.length > 0 && (
                          <div style={{ marginTop: 12 }}>
                            {caseItem.tags.map((tag) => (
                              <Tag key={tag}>{tag}</Tag>
                            ))}
                          </div>
                        )}
                      </Card>
                    </Col>
                  ))}
                </Row>
              ),
            },
          ]}
        />
      </Card>
    </div>
  )
}

