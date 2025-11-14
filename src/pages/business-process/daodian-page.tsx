import { useState } from 'react'
import { Card, Row, Col, Tag, Button, Typography, Modal, Timeline, Tabs } from 'antd'
import { ShopOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styles from './daodian-page.module.css'

const { Title, Text, Paragraph } = Typography

interface Stage {
  id: number
  name: string
  description: string
  duration: string
  deliverables: number
  color: string
  steps: Array<{ title: string; description: string }>
  documents: Array<{ name: string; size: string; type: string }>
}

export default function DaodianPage() {
  const navigate = useNavigate()
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'card'>('timeline')

  const platformTags = ['微信支付', '支付宝', '抖音本地生活', '美团团购']
  const privateDomainTags = ['小程序', '公众号', '企业微信', 'H5活动']
  const strategyTags = ['品牌直播', '零售直播', '平台直播', '达人投放', '内容制作']

  const stages: Stage[] = [
    {
      id: 1,
      name: '项目启动',
      description: 'POD团队组建、需求确认',
      duration: '1-2天',
      deliverables: 5,
      color: '#1677ff',
      steps: [
        { title: '需求分析与确认', description: '与客户确认具体需求和目标' },
        { title: '资源分配与规划', description: '确定项目所需资源和时间安排' },
        { title: '执行与监控', description: '实施计划并监控进度' },
      ],
      documents: [
        { name: '需求说明书.pdf', size: '2.3MB', type: 'pdf' },
        { name: '项目计划表.xlsx', size: '1.5MB', type: 'excel' },
      ],
    },
    {
      id: 2,
      name: '项目报价',
      description: '成本核算、合同签署',
      duration: '2-3天',
      deliverables: 3,
      color: '#52c41a',
      steps: [
        { title: '成本核算', description: '计算项目总成本' },
        { title: '报价审批', description: '内部审批流程' },
        { title: '合同签署', description: '与客户签署正式合同' },
      ],
      documents: [
        { name: '报价单.xlsx', size: '1.2MB', type: 'excel' },
        { name: '合同模板.pdf', size: '3.1MB', type: 'pdf' },
      ],
    },
    {
      id: 3,
      name: '发券方案',
      description: '优惠券策略设计',
      duration: '3-5天',
      deliverables: 3,
      color: '#722ed1',
      steps: [
        { title: '优惠券类型设计', description: '确定券种类和面额' },
        { title: '发放规则制定', description: '设定发放条件和限制' },
        { title: '效果预估', description: '预估活动效果' },
      ],
      documents: [
        { name: '发券方案.pptx', size: '4.5MB', type: 'ppt' },
      ],
    },
    {
      id: 4,
      name: '活动提报',
      description: '系统配置、测试验证',
      duration: '2-3天',
      deliverables: 3,
      color: '#fa8c16',
      steps: [
        { title: '系统配置', description: '在平台系统中配置活动' },
        { title: '测试验证', description: '全流程测试验证' },
        { title: '提报审批', description: '平台审批流程' },
      ],
      documents: [
        { name: '配置清单.xlsx', size: '1.8MB', type: 'excel' },
      ],
    },
  ]

  const handleCreateTask = () => {
    Modal.confirm({
      title: '创建到店营销任务',
      content: '是否要创建一个新的到店营销任务？',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        navigate('/business-process/tasks')
      },
    })
  }

  const handleStageClick = (stage: Stage) => {
    setSelectedStage(stage)
  }

  const renderTimelineView = () => (
    <Timeline
      mode="alternate"
      items={stages.map((stage) => ({
        color: stage.color,
        dot: (
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: stage.color,
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
            }}
          >
            {stage.id}
          </div>
        ),
        children: (
          <Card
            hoverable
            className={styles.stageCard}
            onClick={() => handleStageClick(stage)}
            style={{ borderLeft: `4px solid ${stage.color}` }}
          >
            <Title level={5} style={{ margin: 0, marginBottom: 8 }}>
              {stage.name}
            </Title>
            <Text type="secondary">{stage.description}</Text>
            <div style={{ marginTop: 12 }}>
              <Tag color={stage.color}>{stage.duration}</Tag>
              <Tag>{stage.deliverables}项交付物</Tag>
            </div>
          </Card>
        ),
      }))}
    />
  )

  const renderCardView = () => (
    <Row gutter={[16, 16]}>
      {stages.map((stage) => (
        <Col key={stage.id} xs={24} sm={12} lg={6}>
          <Card
            hoverable
            className={styles.stageCard}
            onClick={() => handleStageClick(stage)}
            style={{ borderTop: `4px solid ${stage.color}`, height: '100%' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 12 }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: stage.color,
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 'bold',
                  fontSize: 18,
                  marginRight: 12,
                }}
              >
                {stage.id}
              </div>
              <Title level={5} style={{ margin: 0 }}>
                {stage.name}
              </Title>
            </div>
            <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ marginBottom: 12 }}>
              {stage.description}
            </Paragraph>
            <div>
              <Tag color={stage.color}>{stage.duration}</Tag>
              <Tag>{stage.deliverables}项交付物</Tag>
            </div>
          </Card>
        </Col>
      ))}
    </Row>
  )

  return (
    <div className={styles.page}>
      {/* 页面头部 */}
      <div className={styles.pageHeader}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className={styles.iconWrapper}>
            <ShopOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          </div>
          <div>
            <Title level={2} style={{ margin: 0 }}>
              到店营销
            </Title>
            <Text type="secondary">线下门店营销解决方案标准流程</Text>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button onClick={handleCreateTask}>
            创建任务
          </Button>
        </div>
      </div>

      {/* 业务能力介绍 */}
      <Card title="业务能力介绍" className={styles.section}>
        <Paragraph>
          通过微信支付、支付宝、抖音本地生活、美团团购在商超便利渠道、传统小店渠道发放优惠券并完成支付核销的业务
        </Paragraph>

        <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
          <Col xs={24} md={8}>
            <Card className={styles.capabilityCard} style={{ background: 'linear-gradient(135deg, #e6f4ff 0%, #bae0ff 100%)' }}>
              <Title level={5}>涉及平台</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                覆盖主流支付和生活服务平台
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {platformTags.map((tag) => (
                  <Tag key={tag} color="blue">
                    {tag}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className={styles.capabilityCard} style={{ background: 'linear-gradient(135deg, #f6ffed 0%, #d9f7be 100%)' }}>
              <Title level={5}>品牌私域开发</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                构建完整的品牌私域流量体系
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {privateDomainTags.map((tag) => (
                  <Tag key={tag} color="green">
                    {tag}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>

          <Col xs={24} md={8}>
            <Card className={styles.capabilityCard} style={{ background: 'linear-gradient(135deg, #f9f0ff 0%, #efdbff 100%)' }}>
              <Title level={5}>投放渠道规划</Title>
              <Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
                多元化内容营销和投放策略
              </Text>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {strategyTags.map((tag) => (
                  <Tag key={tag} color="purple">
                    {tag}
                  </Tag>
                ))}
              </div>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 标准流程阶段 */}
      <Card
        title="标准流程阶段"
        className={styles.section}
        extra={
          <Tabs
            activeKey={viewMode}
            onChange={(key) => setViewMode(key as 'timeline' | 'card')}
            items={[
              { key: 'timeline', label: '时间轴视图' },
              { key: 'card', label: '卡片视图' },
            ]}
            size="small"
          />
        }
      >
        <div style={{ marginTop: 24 }}>
          {viewMode === 'timeline' ? renderTimelineView() : renderCardView()}
        </div>

        {/* 项目总览统计 */}
        <div className={styles.overview}>
          <Title level={4} style={{ textAlign: 'center', marginBottom: 24 }}>
            项目总览
          </Title>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon} style={{ background: '#1677ff' }}>
                  <ClockCircleOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
                <Title level={5}>项目周期</Title>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1677ff' }}>15-25天</Text>
                <Text type="secondary">平均18天完成</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon} style={{ background: '#52c41a' }}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
                <Title level={5}>交付物</Title>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#52c41a' }}>23个</Text>
                <Text type="secondary">标准化交付</Text>
              </div>
            </Col>
            <Col xs={24} md={8}>
              <div className={styles.overviewItem}>
                <div className={styles.overviewIcon} style={{ background: '#722ed1' }}>
                  <CheckCircleOutlined style={{ fontSize: 24, color: 'white' }} />
                </div>
                <Title level={5}>质量达标率</Title>
                <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#722ed1' }}>98%</Text>
                <Text type="secondary">高质量保证</Text>
              </div>
            </Col>
          </Row>
        </div>
      </Card>

      {/* 阶段详情模态框 */}
      <Modal
        title={selectedStage ? `阶段${selectedStage.id}：${selectedStage.name}` : ''}
        open={!!selectedStage}
        onCancel={() => setSelectedStage(null)}
        footer={[
          <Button key="close" type="primary" onClick={() => setSelectedStage(null)}>
            关闭
          </Button>,
        ]}
        width={800}
      >
        {selectedStage && (
          <div>
            <Paragraph>{selectedStage.description}</Paragraph>

            <Title level={5} style={{ marginTop: 24 }}>
              关键步骤
            </Title>
            <div style={{ marginTop: 16 }}>
              {selectedStage.steps.map((step, index) => (
                <div key={index} style={{ display: 'flex', marginBottom: 16 }}>
                  <div
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background: selectedStage.color,
                      color: 'white',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 'bold',
                      marginRight: 12,
                      flexShrink: 0,
                    }}
                  >
                    {index + 1}
                  </div>
                  <div>
                    <Text strong>{step.title}</Text>
                    <br />
                    <Text type="secondary">{step.description}</Text>
                  </div>
                </div>
              ))}
            </div>

            <Title level={5} style={{ marginTop: 24 }}>
              相关文档
            </Title>
            <Row gutter={[12, 12]} style={{ marginTop: 16 }}>
              {selectedStage.documents.map((doc, index) => (
                <Col key={index} xs={24} sm={12}>
                  <Card size="small" hoverable>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <div style={{ fontSize: 24, marginRight: 12, color: doc.type === 'pdf' ? '#ff4d4f' : '#52c41a' }}>
                        📄
                      </div>
                      <div>
                        <Text strong>{doc.name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {doc.size}
                        </Text>
                      </div>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        )}
      </Modal>
    </div>
  )
}

