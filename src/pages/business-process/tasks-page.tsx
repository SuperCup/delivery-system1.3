import { useState, useEffect } from 'react'
import { Card, Row, Col, Tag, Button, Typography, Progress, Space, Select, Statistic, Modal, Form, Input, List, message } from 'antd'
import {
  ClockCircleOutlined,
  CheckCircleOutlined,
  PlayCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import styles from './tasks-page.module.css'

const { Title, Text } = Typography
const { TextArea } = Input

interface TaskStage {
  id: number
  name: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  startDate?: string
  endDate?: string
  notes?: string
}

interface Task {
  id: string
  name: string
  projectCode: string
  businessType: '到店营销' | '即时零售' | '物码营销'
  status: 'pending' | 'in-progress' | 'completed'
  createdAt: string
  createdBy: string
  stages: TaskStage[]
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [businessFilter, setBusinessFilter] = useState<string>('')
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)
  const [updateStageModal, setUpdateStageModal] = useState(false)
  const [currentStage, setCurrentStage] = useState<TaskStage | null>(null)
  const [form] = Form.useForm()

  // 模拟加载任务数据
  useEffect(() => {
    loadTasks()
  }, [])

  const loadTasks = () => {
    // 模拟数据
    const mockTasks: Task[] = [
      {
        id: 'task-001',
        name: '测试一下',
        projectCode: 'PRJ-2025-001',
        businessType: '到店营销',
        status: 'in-progress',
        createdAt: '2025-09-18',
        createdBy: 'luffy',
        stages: [
          { id: 1, name: '项目启动', description: 'POD团队组建、需求确认', status: 'completed', startDate: '2025-09-18', endDate: '2025-09-19' },
          { id: 2, name: '项目报价', description: '成本核算、合同签署', status: 'in-progress', startDate: '2025-09-20' },
          { id: 3, name: '发券方案', description: '优惠券策略设计', status: 'pending' },
          { id: 4, name: '活动提报', description: '系统配置、测试验证', status: 'pending' },
          { id: 5, name: '效果分析', description: '数据监控、效果评估', status: 'pending' },
          { id: 6, name: '风控预警', description: '风险监控、异常预警', status: 'pending' },
          { id: 7, name: '项目结算', description: '费用结算、项目总结', status: 'pending' },
          { id: 8, name: '经验沉淀', description: '最佳实践、知识管理', status: 'pending' },
        ],
      },
    ]
    setTasks(mockTasks)
    setFilteredTasks(mockTasks)
  }

  useEffect(() => {
    let filtered = tasks

    if (statusFilter) {
      filtered = filtered.filter((task) => task.status === statusFilter)
    }

    if (businessFilter) {
      filtered = filtered.filter((task) => task.businessType === businessFilter)
    }

    setFilteredTasks(filtered)
  }, [statusFilter, businessFilter, tasks])

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      pending: '待开始',
      'in-progress': '进行中',
      completed: '已完成',
    }
    return statusMap[status] || status
  }

  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      pending: 'default',
      'in-progress': 'processing',
      completed: 'success',
    }
    return colorMap[status] || 'default'
  }

  const calculateProgress = (stages: TaskStage[]) => {
    const completed = stages.filter((s) => s.status === 'completed').length
    return Math.round((completed / stages.length) * 100)
  }

  const handleShowDetail = (task: Task) => {
    setSelectedTask(task)
    setDetailModalOpen(true)
  }

  const handleUpdateStage = (stage: TaskStage) => {
    setCurrentStage(stage)
    form.setFieldsValue({
      status: stage.status,
      notes: stage.notes || '',
    })
    setUpdateStageModal(true)
  }

  const handleUpdateStageSubmit = () => {
    form.validateFields().then((values) => {
      if (!selectedTask || !currentStage) return

      // 更新阶段状态
      const updatedTasks = tasks.map((task) => {
        if (task.id === selectedTask.id) {
          const updatedStages = task.stages.map((stage) => {
            if (stage.id === currentStage.id) {
              return {
                ...stage,
                status: values.status as 'pending' | 'in-progress' | 'completed',
                notes: values.notes,
                endDate: values.status === 'completed' ? new Date().toISOString().split('T')[0] : stage.endDate,
              }
            }
            return stage
          })

          // 更新任务整体状态
          const allCompleted = updatedStages.every((s) => s.status === 'completed')
          const anyInProgress = updatedStages.some((s) => s.status === 'in-progress')

          const newTask: Task = {
            ...task,
            stages: updatedStages,
            status: (allCompleted ? 'completed' : anyInProgress ? 'in-progress' : 'pending') as 'pending' | 'in-progress' | 'completed',
          }
          return newTask
        }
        return task
      })

      setTasks(updatedTasks)
      
      // 更新选中任务
      const updated = updatedTasks.find((t) => t.id === selectedTask.id)
      if (updated) {
        setSelectedTask(updated)
      }

      message.success('阶段状态更新成功')
      setUpdateStageModal(false)
      form.resetFields()
    })
  }

  const statistics = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    inProgress: tasks.filter((t) => t.status === 'in-progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  }

  return (
    <div className={styles.page}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            我的任务
          </Title>
          <Text type="secondary">管理您和团队的业务流程任务</Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Select
            style={{ width: 120 }}
            placeholder="全部状态"
            allowClear
            value={statusFilter || undefined}
            onChange={(value) => setStatusFilter(value || '')}
            options={[
              { label: '待开始', value: 'pending' },
              { label: '进行中', value: 'in-progress' },
              { label: '已完成', value: 'completed' },
            ]}
          />
          <Select
            style={{ width: 120 }}
            placeholder="全部业务"
            allowClear
            value={businessFilter || undefined}
            onChange={(value) => setBusinessFilter(value || '')}
            options={[
              { label: '到店营销', value: '到店营销' },
              { label: '即时零售', value: '即时零售' },
              { label: '物码营销', value: '物码营销' },
            ]}
          />
        </div>
      </div>

      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="总任务数"
              value={statistics.total}
              prefix={<CheckCircleOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="待开始"
              value={statistics.pending}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="进行中"
              value={statistics.inProgress}
              prefix={<PlayCircleOutlined style={{ color: '#1677ff' }} />}
              valueStyle={{ color: '#1677ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className={styles.statCard}>
            <Statistic
              title="已完成"
              value={statistics.completed}
              prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 任务列表 */}
      <Card title="任务列表" className={styles.section}>
        {filteredTasks.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 0' }}>
            <Text type="secondary">暂无任务数据</Text>
          </div>
        ) : (
          <List
            dataSource={filteredTasks}
            renderItem={(task) => {
              const progress = calculateProgress(task.stages)
              const completedStages = task.stages.filter((s) => s.status === 'completed').length

              return (
                <List.Item className={styles.taskItem}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                      <Title level={5} style={{ margin: 0, marginRight: 12 }}>
                        {task.name}
                      </Title>
                      <Tag color={getStatusColor(task.status)}>{getStatusText(task.status)}</Tag>
                      <Tag>{task.businessType}</Tag>
                    </div>

                    <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                      <Text type="secondary">
                        <span style={{ marginRight: 4 }}>项目编号:</span>
                        {task.projectCode}
                      </Text>
                      <Text type="secondary">
                        <span style={{ marginRight: 4 }}>创建人:</span>
                        {task.createdBy}
                      </Text>
                      <Text type="secondary">
                        <span style={{ marginRight: 4 }}>创建时间:</span>
                        {task.createdAt}
                      </Text>
                    </div>

                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <Text type="secondary">
                          进度: {completedStages}/{task.stages.length} 阶段完成
                        </Text>
                        <Text type="secondary">{progress}%</Text>
                      </div>
                      <Progress percent={progress} strokeColor="#1677ff" showInfo={false} />
                    </div>
                  </div>

                  <Button
                    type="primary"
                    icon={<EyeOutlined />}
                    onClick={() => handleShowDetail(task)}
                    style={{ marginLeft: 24 }}
                  >
                    查看详情
                  </Button>
                </List.Item>
              )
            }}
          />
        )}
      </Card>

      {/* 任务详情模态框 */}
      <Modal
        title={selectedTask?.name}
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={null}
        width={900}
      >
        {selectedTask && (
          <div>
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
              <Col span={12}>
                <Text type="secondary">任务名称</Text>
                <div>{selectedTask.name}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">项目编号</Text>
                <div>{selectedTask.projectCode}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">业务类型</Text>
                <div>{selectedTask.businessType}</div>
              </Col>
              <Col span={12}>
                <Text type="secondary">任务状态</Text>
                <div>
                  <Tag color={getStatusColor(selectedTask.status)}>{getStatusText(selectedTask.status)}</Tag>
                </div>
              </Col>
            </Row>

            <Title level={5} style={{ marginTop: 24, marginBottom: 16 }}>
              流程阶段
            </Title>

            <List
              dataSource={selectedTask.stages}
              renderItem={(stage) => (
                <List.Item
                  className={styles.stageItem}
                  actions={[
                    <Button
                      key="update"
                      size="small"
                      onClick={() => handleUpdateStage(stage)}
                    >
                      更新
                    </Button>,
                  ]}
                >
                  <List.Item.Meta
                    avatar={
                      <div
                        style={{
                          width: 32,
                          height: 32,
                          borderRadius: '50%',
                          background: stage.status === 'completed' ? '#52c41a' : stage.status === 'in-progress' ? '#1677ff' : '#d9d9d9',
                          color: 'white',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 'bold',
                        }}
                      >
                        {stage.id}
                      </div>
                    }
                    title={
                      <Space>
                        <Text strong>{stage.name}</Text>
                        <Tag color={getStatusColor(stage.status)}>{getStatusText(stage.status)}</Tag>
                      </Space>
                    }
                    description={
                      <div>
                        <Text type="secondary">{stage.description}</Text>
                        {stage.notes && (
                          <div style={{ marginTop: 4 }}>
                            <Text type="secondary">备注: </Text>
                            <Text>{stage.notes}</Text>
                          </div>
                        )}
                        {(stage.startDate || stage.endDate) && (
                          <div style={{ marginTop: 4, fontSize: 12 }}>
                            {stage.startDate && <Text type="secondary">开始: {stage.startDate} </Text>}
                            {stage.endDate && <Text type="secondary">完成: {stage.endDate}</Text>}
                          </div>
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* 更新阶段模态框 */}
      <Modal
        title="更新阶段状态"
        open={updateStageModal}
        onOk={handleUpdateStageSubmit}
        onCancel={() => {
          setUpdateStageModal(false)
          form.resetFields()
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={form} layout="vertical">
          <Form.Item label="阶段名称">
            <Input value={currentStage?.name} disabled />
          </Form.Item>

          <Form.Item label="状态" name="status" rules={[{ required: true, message: '请选择状态' }]}>
            <Select>
              <Select.Option value="pending">待开始</Select.Option>
              <Select.Option value="in-progress">进行中</Select.Option>
              <Select.Option value="completed">已完成</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item label="备注" name="notes">
            <TextArea rows={3} placeholder="请输入备注信息" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

