import { useEffect, useState } from 'react'
import { Card, Row, Col, Input, Tag, Button, message, Typography, Space } from 'antd'
import { SearchOutlined, DragOutlined, ArrowLeftOutlined } from '@ant-design/icons'
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
import styles from './clients-page.module.css'
import type { ClientSummary } from '../../types/home'
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

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientSummary[]>([])
  const [filteredClients, setFilteredClients] = useState<ClientSummary[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
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
      setFilteredClients((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
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
        const clientsData = await HomeService.getClientSummaries()
        setClients(clientsData)
        setFilteredClients(clientsData)
      } catch (e: any) {
        message.error(`加载客户数据失败：${e.message}`)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredClients(clients)
    } else {
      const filtered = clients.filter((client) =>
        client.name.toLowerCase().includes(searchText.toLowerCase().trim())
      )
      setFilteredClients(filtered)
    }
  }, [searchText, clients])

  return (
    <div className={styles.page}>
      {/* 返回首页按钮 */}
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/home')}
        style={{ marginBottom: 16 }}
      >
        返回首页
      </Button>
      <div className={styles.header}>
        <Title level={4} className={styles.title}>我服务的客户</Title>
        <Input
          placeholder="搜索客户名称"
          prefix={<SearchOutlined />}
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ maxWidth: 300 }}
        />
      </div>

      {loading ? (
        <Text type="secondary">加载中...</Text>
      ) : filteredClients.length === 0 ? (
        <Card>
          <Text type="secondary">暂无客户数据</Text>
        </Card>
      ) : (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredClients.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <Row gutter={[16, 16]}>
              {filteredClients.map((client) => (
                <Col key={client.id} xs={24} sm={12} md={8} lg={6}>
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
    </div>
  )
}

