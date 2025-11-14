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
  Empty,
  Table,
} from 'antd'
import { BrandsDisplay } from '../../components/brands-display/brands-display'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DragOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
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
  ReportCard as HomeReportCard,
  Todo,
} from '../../types/home'
import { HomeService } from '../../services/home-service'
import StandardBusinessOverviewPage from '../../components/standard-business-process/standard-business-overview-page'

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
  const [reports, setReports] = useState<HomeReportCard[]>([])
  const [todos, setTodos] = useState<Todo[]>([])
  
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
        const [overviewData, clientsData, reportsData, messagesData] = await Promise.all([
          HomeService.getDashboardOverview(),
          HomeService.getClientSummaries(),
          HomeService.getHomeReports(),
          HomeService.getHomeMessages(),
        ])
        setOverview(overviewData)
        setClients(clientsData)
        setReports(reportsData.reports)
        setTodos(messagesData.todos)
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
        description="统计范围为过去十二个月，在PMS有未结束项目且您是项目成员的客户。"
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

      {/* 我的看板 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>我的看板</Title>}
            className={styles.section}
            bordered={false}
            extra={
              <Button type="link" size="small" onClick={() => navigate('/report-center')}>
                全部看板
              </Button>
            }
          >
            {loading ? (
              <Text type="secondary">加载中...</Text>
            ) : reports.length === 0 ? (
              <Empty description="暂无看板" />
            ) : (
              <Table
                dataSource={reports.slice(0, 5)}
                rowKey="id"
                pagination={false}
                size="small"
                columns={[
                  {
                    title: '看板链接名称',
                    dataIndex: 'name',
                    key: 'name',
                    width: 200,
                    render: (text: string) => (
                      <Button type="link" style={{ padding: 0 }}>
                        {text}
                      </Button>
                    ),
                  },
                  {
                    title: '所属品牌',
                    dataIndex: 'brands',
                    key: 'brands',
                    width: 200,
                    render: (brands: string[]) => <BrandsDisplay brands={brands} maxDisplay={3} />,
                  },
                  {
                    title: '链接有效期',
                    dataIndex: 'validity',
                    key: 'validity',
                    width: 120,
                  },
                  {
                    title: '链接来源',
                    dataIndex: 'source',
                    key: 'source',
                    width: 100,
                  },
                  {
                    title: '链接依赖数据源',
                    dataIndex: 'dataSource',
                    key: 'dataSource',
                    width: 150,
                  },
                  {
                    title: '创建时间',
                    dataIndex: 'createdAt',
                    key: 'createdAt',
                    width: 180,
                  },
                  {
                    title: '创建人',
                    dataIndex: 'createdBy',
                    key: 'createdBy',
                    width: 120,
                  },
                  {
                    title: '操作',
                    key: 'actions',
                    width: 100,
                    fixed: 'right',
                    render: () => (
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          window.open(
                            'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68&accessTicket=76ff1515-8996-4659-b057-460e87cdf378&dd_orientation=auto',
                            '_blank',
                          )
                        }
                      >
                        预览
                      </Button>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 三大业务运行概览 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24}>
          <Card
            title={<Title level={5} style={{ margin: 0 }}>业务管理</Title>}
            className={styles.section}
            bordered={false}
            extra={<Button type="link" size="small">流程配置</Button>}
          >
            <StandardBusinessOverviewPage variant="embedded" />
          </Card>
        </Col>
      </Row>

      {/* 我的任务 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={24}>
          <Card
            title={
              <div>
                <Title level={5} style={{ margin: 0 }}>我的任务</Title>
                <Text type="secondary" style={{ fontSize: 12 }}>最近任务</Text>
              </div>
            }
            className={styles.section}
            bordered={false}
            extra={<Button type="link" size="small" onClick={() => navigate('/business-process/tasks')}>查看全部 →</Button>}
          >
            {loading ? (
              <Text type="secondary">加载中...</Text>
            ) : todos.length === 0 ? (
              <Empty description="暂无任务" />
            ) : (
              <List
                dataSource={todos.slice(0, 1)}
                renderItem={(todo) => (
                  <List.Item className={styles.taskItem}>
                    <Space direction="vertical" style={{ width: '100%' }} size={4}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Space>
                          <Text strong>{todo.title}</Text>
                          <Tag color={todo.status === 'pending' ? 'default' : todo.status === 'in-progress' ? 'processing' : 'success'}>
                            {todo.status === 'pending' ? '待处理' : todo.status === 'in-progress' ? '进行中' : '已完成'}
                          </Tag>
                        </Space>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {todo.category} · 到店营销
                        </Text>
                        <Space size={4}>
                          <ClockCircleOutlined style={{ fontSize: 12, color: '#8c8c8c' }} />
                          <Text type="secondary" style={{ fontSize: 12 }}>{todo.dueDate}</Text>
                        </Space>
                      </div>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Col>
      </Row>
    </div>
  )
}
