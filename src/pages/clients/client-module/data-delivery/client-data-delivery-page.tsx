import { useEffect, useMemo, useState } from 'react'
import { Button, Card, message, Tabs, Typography, Table, Space, Modal, Drawer, Form, Input, Select, Tag, Radio, DatePicker } from 'antd'
import { useLocation, useParams } from 'react-router-dom'
import { PlusOutlined, EyeOutlined, EditOutlined, LinkOutlined, DeleteOutlined } from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import styles from './client-data-delivery-page.module.css'
import type { BusinessType, Contact } from '../../../../types/client'
import type { CustomReport, AvailableReportLink } from '../../../../types/custom-report'
import { CustomReportService } from '../../../../services/custom-report-service'
import { ClientActivityService } from '../../../../services/client-activity-service'
import { HomeService } from '../../../../services/home-service'
import type { ReportCard } from '../../../../types/home'

const { Title, Text } = Typography
const { TextArea } = Input
const { RangePicker } = DatePicker

const businessTypeOptions: BusinessType[] = ['到店营销', '即时零售', '物码营销']

export default function ClientDataDeliveryPage() {
  const location = useLocation()
  const { clientId: routeClientId } = useParams<{ clientId?: string }>()
  const clientId = useMemo(
    () => new URLSearchParams(location.search).get('clientId') || routeClientId || '',
    [location.search, routeClientId],
  )

  const [reports, setReports] = useState<CustomReport[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [availableLinks, setAvailableLinks] = useState<AvailableReportLink[]>([])
  const [loading, setLoading] = useState(false)
  const [activeType, setActiveType] = useState<BusinessType>('到店营销')
  
  // 表单相关
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingReport, setEditingReport] = useState<CustomReport | null>(null)
  const [detailModalVisible, setDetailModalVisible] = useState(false)
  const [viewingReport, setViewingReport] = useState<CustomReport | null>(null)
  const [createMode, setCreateMode] = useState<'custom' | 'from-center'>('custom') // 创建方式
  const [validityType, setValidityType] = useState<'permanent' | 'range'>('permanent') // 有效期类型
  const [form] = Form.useForm()

  useEffect(() => {
    if (!clientId) return
    const loadData = async () => {
      setLoading(true)
      try {
        const [reportsData, contactsData] = await Promise.all([
          CustomReportService.getCustomReports(clientId, activeType),
          ClientActivityService.getClientContacts(clientId),
        ])
        setReports(reportsData)
        setContacts(contactsData)
      } catch (error) {
        const err = error as Error
        message.error(`加载数据失败：${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [clientId, activeType])

  // 加载可用看板链接
  useEffect(() => {
    if (!clientId || !drawerVisible) return
    const loadLinks = async () => {
      try {
        const links = await CustomReportService.getAvailableReportLinks(clientId, activeType)
        setAvailableLinks(links)
      } catch (error) {
        console.error('加载可用看板链接失败:', error)
      }
    }
    loadLinks()
  }, [clientId, activeType, drawerVisible])

  // 从看板中心选择看板时，自动填充信息
  const handleSelectReportFromCenter = async (reportLinkId: string) => {
    try {
      const reportsData = await HomeService.getHomeReports()
      const selectedReport = reportsData.reports.find((r: ReportCard) => r.id === reportLinkId)
      if (selectedReport) {
        // 判断有效期类型
        if (selectedReport.validity === '永久') {
          setValidityType('permanent')
          form.setFieldsValue({
            name: selectedReport.name,
            reportLinkId: selectedReport.id,
            reportLinkUrl: selectedReport.link,
            validity: '永久',
            validityRange: null,
            description: `来自看板中心：${selectedReport.name}`,
          })
        } else {
          // 尝试解析为时间范围，如果解析失败则使用原值
          const dateRange = selectedReport.validity.split(' - ')
          if (dateRange.length === 2) {
            setValidityType('range')
            form.setFieldsValue({
              name: selectedReport.name,
              reportLinkId: selectedReport.id,
              reportLinkUrl: selectedReport.link,
              validity: null,
              validityRange: [dayjs(dateRange[0]), dayjs(dateRange[1])],
              description: `来自看板中心：${selectedReport.name}`,
            })
          } else {
            setValidityType('permanent')
            form.setFieldsValue({
              name: selectedReport.name,
              reportLinkId: selectedReport.id,
              reportLinkUrl: selectedReport.link,
              validity: selectedReport.validity,
              validityRange: null,
              description: `来自看板中心：${selectedReport.name}`,
            })
          }
        }
      }
    } catch (error) {
      console.error('加载看板信息失败:', error)
    }
  }

  const handleAdd = () => {
    setEditingReport(null)
    setCreateMode('custom')
    setValidityType('permanent')
    form.resetFields()
    form.setFieldsValue({
      product: activeType,
      validity: '永久',
    })
    setDrawerVisible(true)
  }

  const handleEdit = (record: CustomReport) => {
    setEditingReport(record)
    setCreateMode('custom') // 编辑时默认使用自定义模式
    // 判断有效期类型
    if (record.validity === '永久') {
      setValidityType('permanent')
    } else {
      setValidityType('range')
      // 尝试解析时间范围
      const dateRange = record.validity.split(' - ')
      if (dateRange.length === 2) {
        form.setFieldsValue({
          validityRange: [dayjs(dateRange[0]), dayjs(dateRange[1])],
        })
      }
    }
    form.setFieldsValue({
      name: record.name,
      validity: record.validity,
      description: record.description,
      visibleContacts: record.visibleContacts,
      reportLinkId: record.reportLinkId,
      reportLinkUrl: record.reportLinkUrl,
      product: record.product,
    })
    setDrawerVisible(true)
  }

  const handleViewDetail = (record: CustomReport) => {
    setViewingReport(record)
    setDetailModalVisible(true)
  }

  const handleViewLink = (record: CustomReport) => {
    if (record.reportLinkUrl) {
      window.open(record.reportLinkUrl, '_blank')
    } else {
      message.warning('链接地址不存在')
    }
  }

  const handleSave = async () => {
    try {
      const values = await form.validateFields()
      
      // 处理有效期
      let validity = '永久'
      if (validityType === 'range' && values.validityRange) {
        const [start, end] = values.validityRange as [Dayjs, Dayjs]
        validity = `${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')}`
      } else if (values.validity) {
        validity = values.validity
      }

      // 处理看板链接信息
      let reportLinkName = values.reportLinkName
      let reportLinkUrl = values.reportLinkUrl
      if (createMode === 'from-center' && values.reportLinkId) {
        const selectedLink = availableLinks.find(l => l.id === values.reportLinkId)
        if (selectedLink) {
          reportLinkName = selectedLink.name
          reportLinkUrl = selectedLink.link
        }
      } else if (values.reportLinkId) {
        const selectedLink = availableLinks.find(l => l.id === values.reportLinkId)
        if (selectedLink) {
          reportLinkName = selectedLink.name
          reportLinkUrl = selectedLink.link
        }
      }

      const reportData: Omit<CustomReport, 'id' | 'createdAt' | 'createdBy'> = {
        name: values.name,
        validity: validity,
        description: values.description,
        visibleContacts: values.visibleContacts || [],
        reportLinkId: values.reportLinkId || '',
        reportLinkName: reportLinkName,
        reportLinkUrl: reportLinkUrl,
        product: activeType, // 使用当前选中的产品类型
        clientId: clientId,
      }

      if (editingReport) {
        await CustomReportService.updateCustomReport(editingReport.id, reportData)
        message.success('看板已更新')
      } else {
        await CustomReportService.createCustomReport(reportData)
        message.success('看板已创建')
      }

      // 重新加载数据
      const reportsData = await CustomReportService.getCustomReports(clientId, activeType)
      setReports(reportsData)
      setDrawerVisible(false)
    } catch (error) {
      console.error('保存失败:', error)
    }
  }

  const handleDelete = (record: CustomReport) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除看板"${record.name}"吗？`,
      onOk: async () => {
        await CustomReportService.deleteCustomReport(record.id)
        message.success('删除成功')
        const reportsData = await CustomReportService.getCustomReports(clientId, activeType)
        setReports(reportsData)
      },
    })
  }

  const columns: ColumnsType<CustomReport> = [
    {
      title: '看板名称',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => <Text strong>{text}</Text>,
    },
    {
      title: '有效期',
      dataIndex: 'validity',
      key: 'validity',
      width: 200,
    },
    {
      title: '描述',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
    },
    {
      title: '可见联系人',
      dataIndex: 'visibleContacts',
      key: 'visibleContacts',
      width: 200,
      render: (contactIds: string[]) => (
        <Space wrap size={[0, 4]}>
          {contactIds.map((id) => {
            const contact = contacts.find((c) => c.id === id)
            return contact ? (
              <Tag key={id}>{contact.name}</Tag>
            ) : null
          })}
          {contactIds.length === 0 && <Text type="secondary">—</Text>}
        </Space>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button type="link" size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(record)}>
            详情
          </Button>
          <Button type="link" size="small" icon={<LinkOutlined />} onClick={() => handleViewLink(record)}>
            进入详情
          </Button>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" danger icon={<DeleteOutlined />} onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const renderTabContent = () => {
    return (
      <div className={styles.tabContent}>
        <div className={styles.actionBar}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            新增看板
          </Button>
        </div>
        <Table
          columns={columns}
          dataSource={reports}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `共${total}条`,
          }}
        />
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.pageHeader}>
        <Title level={3} className={styles.pageTitle}>
          专属定制
        </Title>
      </div>

      <Card className={styles.tableCard}>
        <Tabs
          activeKey={activeType}
          onChange={(key) => setActiveType(key as BusinessType)}
          items={businessTypeOptions.map((type) => ({
            key: type,
            label: type,
            children: renderTabContent(),
          }))}
        />
      </Card>

      {/* 新增/编辑抽屉 */}
      <Drawer
        title={editingReport ? '编辑看板' : '新增看板'}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSave}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          {!editingReport && (
            <Form.Item
              label="创建方式"
              name="createMode"
              initialValue="custom"
            >
              <Radio.Group
                value={createMode}
                onChange={(e) => {
                  setCreateMode(e.target.value)
                  form.resetFields(['name', 'reportLinkId', 'validity', 'description', 'reportLinkUrl'])
                  setValidityType('permanent')
                }}
              >
                <Radio value="custom">自定义创建</Radio>
                <Radio value="from-center">从看板中心选择创建</Radio>
              </Radio.Group>
            </Form.Item>
          )}

          {createMode === 'from-center' && !editingReport && (
            <Form.Item
              label="选择看板"
              name="reportLinkId"
              rules={[{ required: true, message: '请选择看板' }]}
            >
              <Select
                placeholder="请选择看板"
                loading={availableLinks.length === 0}
                onChange={handleSelectReportFromCenter}
                options={availableLinks.map((link) => ({
                  label: link.name,
                  value: link.id,
                }))}
              />
            </Form.Item>
          )}

          <Form.Item
            label="看板名称"
            name="name"
            rules={[{ required: true, message: '请输入看板名称' }]}
          >
            <Input placeholder="请输入看板名称" disabled={createMode === 'from-center' && !editingReport} />
          </Form.Item>

          {createMode === 'custom' && (
            <Form.Item
              label="链接"
              name="reportLinkUrl"
              rules={[{ required: true, message: '请输入链接' }, { type: 'url', message: '请输入有效的URL' }]}
            >
              <Input placeholder="请输入看板链接地址" />
            </Form.Item>
          )}

          <Form.Item
            label="有效期"
            required
          >
            <Radio.Group
              value={validityType}
              onChange={(e) => {
                setValidityType(e.target.value)
                if (e.target.value === 'permanent') {
                  form.setFieldsValue({ validity: '永久', validityRange: null })
                } else {
                  form.setFieldsValue({ validity: null })
                }
              }}
              style={{ marginBottom: 8 }}
            >
              <Radio value="permanent">永久</Radio>
              <Radio value="range">指定时间范围</Radio>
            </Radio.Group>
            {validityType === 'permanent' ? (
              <Form.Item
                name="validity"
                noStyle
                rules={[{ required: true, message: '请选择有效期' }]}
              >
                <Select
                  options={[
                    { label: '永久', value: '永久' },
                  ]}
                />
              </Form.Item>
            ) : (
              <Form.Item
                name="validityRange"
                noStyle
                rules={[{ required: true, message: '请选择时间范围' }]}
              >
                <RangePicker
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD"
                />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={4} placeholder="请输入描述" />
          </Form.Item>

          <Form.Item
            label="可见联系人"
            name="visibleContacts"
          >
            <Select
              mode="multiple"
              placeholder="请选择可见联系人"
              options={contacts.map((contact) => ({
                label: `${contact.name}${contact.position ? ` - ${contact.position}` : ''}`,
                value: contact.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 详情弹窗 */}
      <Modal
        title="看板详情"
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setDetailModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingReport && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>看板名称：</Text>
              <Text>{viewingReport.name}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>产品：</Text>
              <Tag color={viewingReport.product === '到店营销' ? 'blue' : viewingReport.product === '即时零售' ? 'green' : 'gold'}>
                {viewingReport.product}
              </Tag>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>有效期：</Text>
              <Text>{viewingReport.validity}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>描述：</Text>
              <div style={{ marginTop: 8 }}>
                <Text>{viewingReport.description}</Text>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>关联看板：</Text>
              <Text>{viewingReport.reportLinkName || '—'}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>可见联系人：</Text>
              <div style={{ marginTop: 8 }}>
                <Space wrap>
                  {viewingReport.visibleContacts.map((id) => {
                    const contact = contacts.find((c) => c.id === id)
                    return contact ? <Tag key={id}>{contact.name}</Tag> : null
                  })}
                  {viewingReport.visibleContacts.length === 0 && <Text type="secondary">—</Text>}
                </Space>
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>创建时间：</Text>
              <Text>{viewingReport.createdAt}</Text>
            </div>
            <div>
              <Text strong>创建人：</Text>
              <Text>{viewingReport.createdBy}</Text>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
