import { useEffect, useState } from 'react'
import {
  Card,
  Row,
  Col,
 Tag,
  Button,
  message,
  Typography,
  Space,
  Alert,
  List,
  Divider,
  Tooltip,
  Empty,
} from 'antd'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DragOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import styles from './home-page.module.css'
import type {
  DashboardOverview,
  StatCard,
  ClientSummary,
  Message as HomeMessage,
  ReportCard as HomeReportCard,
  BusinessOverviewCard,
} from '../../types/home'
import { HomeService } from '../../services/home-service'

const { Title, Text } = Typography

// 可拖拽的客户卡片组件
function SortableClientCard({ client, onCardClick }: { client: ClientSummary; onCardClick: (id: string) => void }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: client.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style}>
      <Card 
        size="small"
        className={styles.clientCard}
        title={client.name}
        extra={
          <div
            {...attributes}
            {...listeners}
            style={{ cursor: 'grab', padding: '4px' }}
            onClick={(e) => e.stopPropagation()}
          >
            <DragOutlined />
          </div>
        }
        hoverable
        onClick={() => onCardClick(client.id)}
        style={{ cursor: 'pointer' }}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text type="secondary">联系人：</Text>
            <Text>{client.contactCount}位</Text>
          </div>
          <div className={styles.bizTags}>
            {client.business.map((b) => (
              <Tag 
                key={b.type} 
                color={b.type === '到店营销' ? 'blue' : b.type === '即时零售' ? 'cyan' : 'geekblue'}
              >
                {b.type}: {b.activityCount}
              </Tag>
            ))}
          </div>
        </Space>
      </Card>
    </div>
  )
}

export default function HomePage() {
  const [overview, setOverview] = useState<DashboardOverview | null>(null)
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [messages, setMessages] = useState<HomeMessage[]>([])
  const [reports, setReports] = useState<HomeReportCard[]>([])
  const [businessOverview, setBusinessOverview] = useState<BusinessOverviewCard[]>([])
  const navigate = useNavigate()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setClients((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [overviewData, clientsData, messagesData, reportsData, businessData] = await Promise.all([
          HomeService.getDashboardOverview(),
          HomeService.getClientSummaries(),
          HomeService.getHomeMessages(),
          HomeService.getHomeReports(),
          HomeService.getBusinessOverview(),
        ])
        setOverview(overviewData)
        setClients(clientsData)
        setMessages(messagesData.messages)
        setReports(reportsData.reports)
        setBusinessOverview(businessData.businesses)
      } catch (error) {
        const err = error as Error
        message.error(`加载首页数据失败：${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 过滤后可见的统计卡片（仍排除未读消息）
  const visibleStats = (overview?.stats ?? []).filter((stat) => stat.id !== 'messages')

  const renderStatCard = (stat: StatCard) => {
    const trendIcon = stat.trendType === 'up' 
      ? <ArrowUpOutlined style={{ color: '#52c41a' }} />
      : stat.trendType === 'down' 
      ? <ArrowDownOutlined style={{ color: '#ff4d4f' }} />
      : null

    return (
      <Card key={stat.id} loading={loading} bordered={false} className={styles.statCard}>
        <div className={styles.statInfo}>
          <Text type="secondary" className={styles.statTitle}>{stat.title}</Text>
          <div className={styles.statValue}>
            <span className={styles.statNumber}>{stat.value}</span>
            <span className={styles.statUnit}>{stat.unit}</span>
          </div>
          <div className={styles.statTrend}>
            {trendIcon}
            <Text className={styles.statTrendText}>{stat.trend}</Text>
          </div>
        </div>
      </Card>
    )
  }

  return (
    <div className={styles.page}>
      {/* 欢迎区域 */}
      <div className={styles.welcomeSection}>
        <Title level={4} className={styles.welcomeTitle}>欢迎回来，luffy</Title>
      </div>

      {/* 页面说明 */}
      <Alert
        description="统计范围为过去十二个月，在PMS有未结束项目且您是项目成员的客户，与该客户在交付中台创建的活动。"
        type="info"
        icon={<InfoCircleOutlined />}
        showIcon
        closable
        className={styles.infoAlert}
      />

      {/* 数据统计卡片（如果存在） */}
      {visibleStats.length > 0 && (
        <Row gutter={[16, 16]} className={styles.statsRow}>
          {visibleStats.map((stat) => (
            <Col key={stat.id} xs={24} sm={12} lg={6}>
              {renderStatCard(stat)}
            </Col>
          ))}
        </Row>
      )}

      {/* 我服务的客户 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24}>
          <Card 
            title={<Title level={5} style={{ margin: 0 }}>我服务的客户</Title>}
            extra={<Button type="link" size="small" onClick={() => navigate('/clients')}>查看全部</Button>}
            className={styles.section}
            bordered={false}
          >
            {loading ? (
              <Text type="secondary">加载中...</Text>
            ) : clients.length === 0 ? (
              <Text type="secondary">暂无客户数据</Text>
            ) : (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={clients.map((c) => c.id)}
                  strategy={rectSortingStrategy}
                >
                  <Row gutter={[16, 16]}>
                    {clients.map((client) => (
                      <Col key={client.id} xs={24} sm={12} md={8}>
                        <SortableClientCard 
                          client={client} 
                          onCardClick={(id) => window.open(`/clients/${id}`, '_blank')}
                        />
                      </Col>
                    ))}
                  </Row>
                </SortableContext>
              </DndContext>
            )}
          </Card>
        </Col>
      </Row>

      {/* 消息与公告 + 我的报表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>消息 / 公告</Title>}
            className={styles.section}
            bordered={false}
          >
            <List<HomeMessage>
              dataSource={messages.slice(0, 5)}
              locale={{ emptyText: '暂无消息公告' }}
              renderItem={(item) => (
                <List.Item
                  key={item.id}
                  className={item.isRead ? styles.messageRead : styles.messageUnread}
                >
                  <List.Item.Meta
                    title={
                      <div className={styles.messageTitle}>
                        <Space size={8}>
                          <Tag color={item.type === 'warning' ? 'gold' : item.type === 'error' ? 'red' : item.type === 'success' ? 'green' : 'blue'}>
                            {item.type.toUpperCase()}
                          </Tag>
                          <Text strong={!item.isRead}>{item.title}</Text>
                        </Space>
                        <span className={styles.messageTime}>{item.time}</span>
                      </div>
                    }
                    description={
                      <div className={styles.messageContent}>
                        <Text type="secondary">{item.content}</Text>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>我的报表</Title>}
            className={styles.section}
            bordered={false}
            extra={
              <Button type="link" size="small" onClick={() => navigate('/data-warehouse')}>
                报表中心
              </Button>
            }
          >
            <List<HomeReportCard>
              dataSource={reports}
              locale={{ emptyText: '暂无报表' }}
              renderItem={(report) => (
                <List.Item key={report.id}>
                  <List.Item.Meta
                    title={
                      <Space>
                        <Button type="link" onClick={() => navigate(report.link)}>
                          {report.name}
                        </Button>
                        <Tag>{report.category}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary">{report.description}</Text>
                        <div style={{ marginTop: 4 }}>
                          <Text type="secondary">
                            负责人：{report.owner} · 更新：{report.updatedAt}
                          </Text>
                        </div>
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      {/* 三大业务 */}
      <Card 
        title={<Title level={5} style={{ margin: 0 }}>三大业务运行概览</Title>}
        className={styles.section}
        bordered={false}
        extra={<Button type="link" size="small">业务指标配置</Button>}
      >
        {businessOverview.length === 0 ? (
          <Empty description="暂无业务概览数据" />
        ) : (
        <Row gutter={[16, 16]}>
            {businessOverview.map((biz) => (
              <Col key={biz.id} xs={24} md={12} lg={8}>
                <Card className={styles.businessCard} hoverable>
                  <div className={styles.businessHeader}>
                    <Space direction="vertical" size={4}>
                      <Title level={5} style={{ margin: 0 }}>
                        {biz.name}
                      </Title>
                      <Text type="secondary">{biz.summary}</Text>
                    </Space>
                    <Space direction="vertical" size={2} align="end">
                      <Tag color="blue">{biz.owner}</Tag>
                      <Text type="secondary">对接人：{biz.contact}</Text>
                    </Space>
                  </div>
                  <Divider dashed style={{ margin: '12px 0' }} />
                  <div className={styles.businessMetrics}>
                    {biz.metrics.map((metric) => (
                      <div key={metric.id} className={styles.businessMetric}>
                        <Text type="secondary">{metric.label}</Text>
                        <div className={styles.metricValue}>
                          <span className={styles.metricNumber}>{metric.value}</span>
                          <span className={styles.metricUnit}>{metric.unit}</span>
                        </div>
                        <Tooltip title="环比趋势">
                          <Tag color={metric.trend === 'up' ? 'green' : metric.trend === 'down' ? 'red' : 'default'}>
                            {metric.trendValue}
                          </Tag>
                        </Tooltip>
                      </div>
                    ))}
                  </div>
                  <Divider dashed style={{ margin: '12px 0' }} />
                  <div className={styles.businessHighlights}>
                    {biz.highlights.map((highlight) => (
                      <div key={highlight.id} className={styles.highlightItem}>
                        <Text strong>{highlight.title}</Text>
                        <Text type="secondary">{highlight.description}</Text>
                      </div>
                    ))}
                  </div>
                  <Button type="link" size="small" onClick={() => navigate(biz.quickLink)}>
                    查看业务详情
              </Button>
                </Card>
            </Col>
          ))}
        </Row>
        )}
      </Card>
    </div>
  )
}