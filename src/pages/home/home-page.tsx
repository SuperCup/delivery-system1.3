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
  Modal,
} from 'antd'
import { BrandsDisplay } from '../../components/brands-display/brands-display'
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined,
  DragOutlined,
  InfoCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
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
  const [notesModalVisible, setNotesModalVisible] = useState(false)
  
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
            title={
              <Space>
                <Title level={5} style={{ margin: 0 }}>我的看板</Title>
                <Button
                  type="text"
                  size="small"
                  icon={<FileTextOutlined />}
                  onClick={() => setNotesModalVisible(true)}
                  style={{ fontSize: 12, color: '#8c8c8c' }}
                >
                  开发备注
                </Button>
              </Space>
            }
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
                    render: (brands: string[] | '全部适用') => 
                      brands === '全部适用' ? (
                        <Tag color="blue">全部适用</Tag>
                      ) : (
                        <BrandsDisplay brands={brands} maxDisplay={3} />
                      ),
                  },
                  {
                    title: '所属客户',
                    dataIndex: 'clients',
                    key: 'clients',
                    width: 200,
                    render: (clients: string[] | '全部适用') => 
                      clients === '全部适用' ? (
                        <Tag color="blue">全部适用</Tag>
                      ) : (
                        <Space wrap size={[0, 4]}>
                          {clients.slice(0, 3).map((client) => (
                            <Tag key={client}>{client}</Tag>
                          ))}
                          {clients.length > 3 && (
                            <Tag>+{clients.length - 3}</Tag>
                          )}
                        </Space>
                      ),
                  },
                  {
                    title: '产品',
                    dataIndex: 'product',
                    key: 'product',
                    width: 120,
                    render: (product: string) => (
                      <Tag color={product === '到店营销' ? 'blue' : product === '即时零售' ? 'green' : product === '物码营销' ? 'gold' : 'default'}>
                        {product}
                      </Tag>
                    ),
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
                    render: (_, record: HomeReportCard) => (
                      <Button
                        type="link"
                        size="small"
                        onClick={() =>
                          window.open(
                            record.link || 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68&accessTicket=76ff1515-8996-4659-b057-460e87cdf378&dd_orientation=auto',
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

      {/* 开发备注弹窗 */}
      <Modal
        title="开发备注"
        open={notesModalVisible}
        onCancel={() => setNotesModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setNotesModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        <div style={{ padding: '16px 0' }}>
          <Space direction="vertical" size="middle" style={{ width: '100%' }}>
            <div>
              <Text strong>1、</Text>
              <Text>看板首页默认显示列表最顶部5个看板，有新添加到自己名下的看板，显示在最上面；</Text>
            </div>
            <div>
              <Text strong>2、</Text>
              <Text>首页看板不需要支持搜索、查看全部看板（看板列表），支持by名称、品牌、创建时间、创建人、产品，进行筛选搜索；</Text>
            </div>
            <div>
              <Text strong>3、</Text>
              <Text>点击预览，新的浏览器标签全屏加载看板；</Text>
            </div>
            <div>
              <Text strong>4、权限分配——</Text>
              <div style={{ marginLeft: 20, marginTop: 8 }}>
                <div>
                  <Text>a）除当前客户管理外其他所有角色，可见系统添加的所有看板记录（支持添加、编辑、删除等）；</Text>
                </div>
                <div style={{ marginTop: 8 }}>
                  <Text>b）客户管理角色，如果拥有该链接的权限，可以对链接可见联系人进行编辑；</Text>
                </div>
              </div>
            </div>
            <div>
              <Text strong>5、</Text>
              <Text>用户可在看板列表（非首页），对看板顺序进行自定义调整；</Text>
            </div>
            <div>
              <Text strong>6、</Text>
              <Text>后台保存对链接的编辑与调整；</Text>
            </div>
            <div>
              <Text strong>7、专属定制——挂链接，选的是当前用户（客户管理角色）可见的看板，并且，看板所属客户对应、所属产品对应；</Text>
            </div>
          </Space>
        </div>
      </Modal>
    </div>
  )
}
