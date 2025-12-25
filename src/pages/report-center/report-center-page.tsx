import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Button,
  Input,
  DatePicker,
  Space,
  Table,
  Typography,
  message,
  Modal,
  Breadcrumb,
  Row,
  Col,
  List,
  Drawer,
  Form,
  Select,
  Tag,
  Checkbox,
} from 'antd'
import { HomeOutlined, HolderOutlined, EyeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ColumnsType } from 'antd/es/table'
import type { RangePickerProps } from 'antd/es/date-picker'
import dayjs, { type Dayjs } from 'dayjs'
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
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { HomeService } from '../../services/home-service'
import { OrganizationService } from '../../services/organization-service'
import type { ReportCard } from '../../types/home'
import type { OrgNode } from '../../types/organization'
import { BrandsDisplay } from '../../components/brands-display/brands-display'
import { OrganizationSelector } from '../../components/organization-selector/organization-selector'
import styles from './report-center-page.module.css'

const { Title, Text } = Typography
const { RangePicker } = DatePicker
const { TextArea } = Input

// 可拖拽的表格行组件
interface RowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  'data-row-key': string
}

function DraggableRow({ children, ...props }: RowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: props['data-row-key'],
  })

  const style: React.CSSProperties = {
    ...props.style,
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: 'move',
    ...(isDragging ? { position: 'relative', zIndex: 9999, opacity: 0.5 } : {}),
  }

  return (
    <tr {...props} ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {children}
    </tr>
  )
}

export default function ReportCenterPage() {
  const navigate = useNavigate()
  const [reports, setReports] = useState<ReportCard[]>([])
  const [loading, setLoading] = useState(false)
  const [filteredReports, setFilteredReports] = useState<ReportCard[]>([])
  const [orgTree, setOrgTree] = useState<OrgNode | null>(null)
  const [form] = Form.useForm()
  
  // 筛选条件
  const [nameFilter, setNameFilter] = useState('')
  const [brandFilter, setBrandFilter] = useState('')
  const [clientFilter, setClientFilter] = useState('')
  const [productFilter, setProductFilter] = useState<string>('')
  const [creatorFilter, setCreatorFilter] = useState('')
  const [dateRange, setDateRange] = useState<[Dayjs | null, Dayjs | null] | null>(null)
  
  // 分页
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  
  // 全局预览
  const [previewVisible, setPreviewVisible] = useState(false)
  const [selectedReport, setSelectedReport] = useState<string | undefined>(undefined)
  
  // 添加链接抽屉
  const [drawerVisible, setDrawerVisible] = useState(false)
  const [editingReport, setEditingReport] = useState<ReportCard | null>(null)
  
  // 权限查看
  const [permissionModalVisible, setPermissionModalVisible] = useState(false)
  const [viewingPermission, setViewingPermission] = useState<ReportCard | null>(null)
  
  // 拖拽排序
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor)
  )

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      try {
        const [reportsData, orgData] = await Promise.all([
          HomeService.getHomeReports(),
          OrganizationService.getCompanyStructure(),
        ])
        // 按 sortOrder 排序
        const sortedReports = reportsData.reports.sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        setReports(sortedReports)
        setFilteredReports(sortedReports)
        setOrgTree(orgData)
      } catch (error) {
        const err = error as Error
        message.error(`加载数据失败：${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 应用筛选
  const applyFilters = () => {
    let filtered = [...reports]

    // 名称筛选
    if (nameFilter.trim()) {
      filtered = filtered.filter((report) =>
        report.name.toLowerCase().includes(nameFilter.toLowerCase().trim())
      )
    }

    // 品牌筛选
    if (brandFilter.trim()) {
      filtered = filtered.filter((report) => {
        if (report.brands === '全部适用') return false
        return report.brands.some(brand => brand.toLowerCase().includes(brandFilter.toLowerCase().trim()))
      })
    }

    // 客户筛选
    if (clientFilter.trim()) {
      filtered = filtered.filter((report) => {
        if (report.clients === '全部适用') return false
        return report.clients.some(client => client.toLowerCase().includes(clientFilter.toLowerCase().trim()))
      })
    }

    // 产品筛选
    if (productFilter) {
      filtered = filtered.filter((report) => 
        report.product === productFilter || report.product === '全部适用'
      )
    }

    // 创建人筛选
    if (creatorFilter.trim()) {
      filtered = filtered.filter((report) =>
        report.createdBy.toLowerCase().includes(creatorFilter.toLowerCase().trim())
      )
    }

    // 创建时间筛选
    if (dateRange && dateRange[0] && dateRange[1]) {
      filtered = filtered.filter((report) => {
        const reportDate = dayjs(report.createdAt)
        const startDate = dateRange[0]!.startOf('day')
        const endDate = dateRange[1]!.endOf('day')
        return (
          (reportDate.isAfter(startDate) || reportDate.isSame(startDate)) &&
          (reportDate.isBefore(endDate) || reportDate.isSame(endDate))
        )
      })
    }

    setFilteredReports(filtered)
    setCurrentPage(1) // 重置到第一页
  }

  // 重置筛选
  const resetFilters = () => {
    setNameFilter('')
    setBrandFilter('')
    setClientFilter('')
    setProductFilter('')
    setCreatorFilter('')
    setDateRange(null)
    setFilteredReports(reports)
    setCurrentPage(1)
  }

  // 分页数据
  const paginatedReports = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    const end = start + pageSize
    return filteredReports.slice(start, end)
  }, [filteredReports, currentPage, pageSize])

  // 操作处理
  const handleEdit = (record: ReportCard) => {
    setEditingReport(record)
    form.setFieldsValue({
      name: record.name,
      brands: record.brands === '全部适用' ? [] : record.brands,
      brandsAll: record.brands === '全部适用',
      clients: record.clients === '全部适用' ? [] : record.clients,
      clientsAll: record.clients === '全部适用',
      product: record.product === '全部适用' ? undefined : record.product,
      link: record.link,
      validity: record.validity,
      source: record.source,
      dataSource: record.dataSource,
      visibilityConfig: {
        type: record.visibleTo.includes('company-root') ? 'all' : 'custom',
        selectedIds: record.visibleTo.includes('company-root') ? [] : record.visibleTo,
      },
    })
    setDrawerVisible(true)
  }

  const handlePreview = (record?: ReportCard) => {
    const link = record?.link || 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68&accessTicket=76ff1515-8996-4659-b057-460e87cdf378&dd_orientation=auto'
    window.open(link, '_blank')
  }

  const handleDelete = (record: ReportCard) => {
    Modal.confirm({
      title: '确认删除',
      content: `确定要删除看板"${record.name}"吗？`,
      onOk: () => {
        setReports(reports.filter((r) => r.id !== record.id))
        setFilteredReports(filteredReports.filter((r) => r.id !== record.id))
        message.success('删除成功')
      },
    })
  }

  const handleImport = () => {
    message.info('导入功能待实现')
  }

  const handleAdd = () => {
    setEditingReport(null)
    form.resetFields()
    form.setFieldsValue({
      validity: '永久',
      source: 'QBI',
      dataSource: '数仓',
      brandsAll: false,
      clientsAll: false,
      visibilityConfig: { type: 'all', selectedIds: [] },
    })
    setDrawerVisible(true)
  }
  
  const handleGlobalPreview = () => {
    setPreviewVisible(true)
    // 如果没有选中的看板，默认选中第一个
    if (!selectedReport && filteredReports.length > 0) {
      setSelectedReport(filteredReports[0].id)
    }
  }
  
  // 拖拽结束处理
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setFilteredReports((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        // 更新 sortOrder
        newItems.forEach((item, index) => {
          item.sortOrder = index + 1
        })
        return newItems
      })
      message.success('顺序已调整')
    }
  }
  
  // 查看权限
  const handleViewPermission = (record: ReportCard) => {
    setViewingPermission(record)
    setPermissionModalVisible(true)
  }
  
  // 保存链接
  const handleSaveReport = async () => {
    try {
      const values = await form.validateFields()
      const newReport: ReportCard = {
        id: editingReport?.id || `report-${Date.now()}`,
        name: values.name,
        brands: values.brandsAll ? '全部适用' : (values.brands || []),
        clients: values.clientsAll ? '全部适用' : (values.clients || []),
        product: values.product || '到店营销',
        validity: values.validity,
        source: values.source,
        dataSource: values.dataSource,
        createdAt: editingReport?.createdAt || dayjs().format('YYYY-MM-DD HH:mm:ss'),
        createdBy: editingReport?.createdBy || '当前用户',
        visibleTo: values.visibilityConfig.type === 'all' 
          ? ['company-root'] 
          : values.visibilityConfig.selectedIds,
        link: values.link,
        sortOrder: editingReport?.sortOrder || reports.length + 1,
      }
      
      if (editingReport) {
        // 编辑
        setReports(reports.map(r => r.id === editingReport.id ? newReport : r))
        setFilteredReports(filteredReports.map(r => r.id === editingReport.id ? newReport : r))
        message.success('看板链接已更新')
      } else {
        // 新建
        setReports([...reports, newReport])
        setFilteredReports([...filteredReports, newReport])
        message.success('看板链接已创建')
      }
      
      setDrawerVisible(false)
    } catch (error) {
      console.error('表单验证失败:', error)
    }
  }

  const columns: ColumnsType<ReportCard> = [
    {
      key: 'sort',
      width: 60,
      render: () => <HolderOutlined style={{ cursor: 'move', color: '#999' }} />,
    },
    {
      title: '看板链接名称',
      dataIndex: 'name',
      key: 'name',
      width: 220,
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
      width: 130,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 170,
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 100,
    },
    {
      title: '操作',
      key: 'actions',
      width: 240,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="link" 
            size="small" 
            icon={<EyeOutlined />}
            onClick={() => handleViewPermission(record)}
          >
            查看权限
          </Button>
          <Button type="link" size="small" onClick={() => handleEdit(record)}>
            编辑
          </Button>
          <Button type="link" size="small" onClick={() => handlePreview(record)}>
            预览
          </Button>
          <Button type="link" size="small" danger onClick={() => handleDelete(record)}>
            删除
          </Button>
        </Space>
      ),
    },
  ]

  const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    return current && current > dayjs().endOf('day')
  }

  return (
    <div className={styles.page}>
      {/* 面包屑导航 */}
      <Breadcrumb
        className={styles.breadcrumb}
        items={[
          {
            href: '/home',
            title: <HomeOutlined />,
            onClick: (e) => {
              e.preventDefault()
              navigate('/home')
            },
          },
          {
            title: '全部看板',
          },
        ]}
      />

      {/* 全局预览模式 */}
      {previewVisible ? (
        <Card className={styles.previewModeCard}>
          <div className={styles.previewModeHeader}>
            <Title level={4} style={{ margin: 0 }}>
              看板预览
            </Title>
            <Button onClick={() => setPreviewVisible(false)}>退出预览</Button>
          </div>
          <Row gutter={24} className={styles.previewModeContent}>
            {/* 左侧看板列表 */}
            <Col span={6} className={styles.previewListCol}>
              <Card 
                title="看板列表" 
                size="small"
                className={styles.reportListCard}
                bodyStyle={{ padding: 0 }}
              >
                <List
                  dataSource={filteredReports}
                  loading={loading}
                  className={styles.reportList}
                  renderItem={(report) => (
                    <List.Item
                      className={`${styles.reportListItem} ${
                        selectedReport === report.id ? styles.reportListItemActive : ''
                      }`}
                      onClick={() => setSelectedReport(report.id)}
                    >
                      <div className={styles.reportListItemContent}>
                        <Text strong>{report.name}</Text>
                        <div className={styles.reportBrand}>
                          {report.brands === '全部适用' ? (
                            <Tag color="blue" size="small">全部适用</Tag>
                          ) : (
                            <BrandsDisplay brands={report.brands} maxDisplay={2} />
                          )}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </Card>
            </Col>
            {/* 右侧预览区域 */}
            <Col span={18} className={styles.previewFrameCol}>
              <Card 
                size="small" 
                className={styles.previewFrameCard}
                bodyStyle={{ padding: 0, height: '100%' }}
              >
                {selectedReport ? (() => {
                  const report = filteredReports.find(r => r.id === selectedReport)
                  const link = report?.link || 'https://quickbi.ismartgo.cn/token3rd/dashboard/view/pc.htm?pageId=2b2a4ccf-582e-4072-a98e-f6411df63f68&accessTicket=76ff1515-8996-4659-b057-460e87cdf378&dd_orientation=auto'
                  return (
                    <iframe
                      src={link}
                      title="看板预览"
                      className={styles.previewFrame}
                    />
                  )
                })() : (
                  <div className={styles.noPreview}>
                    <Text type="secondary">请从左侧列表选择一个看板</Text>
                  </div>
                )}
              </Card>
            </Col>
          </Row>
        </Card>
      ) : (
        /* 普通列表模式 */
        <Card>
          {/* 页面标题和操作按钮区域 */}
          <div className={styles.headerSection}>
            <Title level={4} style={{ margin: 0 }}>
              看板链接
            </Title>
            <Space>
              <Button type="primary" onClick={handleGlobalPreview}>
                全局预览
              </Button>
              <Button onClick={handleImport}>导入</Button>
              <Button onClick={handleAdd}>添加链接</Button>
            </Space>
          </div>

          {/* 搜索筛选区域 */}
          <div className={styles.filterSection}>
            <Space size="middle" wrap className={styles.filterRow}>
              <div className={styles.filterItem}>
                <Text>名称：</Text>
                <Input
                  placeholder="请输入看板名称"
                  value={nameFilter}
                  onChange={(e) => setNameFilter(e.target.value)}
                  style={{ width: 180 }}
                  allowClear
                />
              </div>
              <div className={styles.filterItem}>
                <Text>品牌：</Text>
                <Input
                  placeholder="请输入品牌名称"
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  style={{ width: 180 }}
                  allowClear
                />
              </div>
              <div className={styles.filterItem}>
                <Text>客户：</Text>
                <Input
                  placeholder="请输入客户名称"
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  style={{ width: 180 }}
                  allowClear
                />
              </div>
              <div className={styles.filterItem}>
                <Text>产品：</Text>
                <Select
                  placeholder="请选择产品"
                  value={productFilter || undefined}
                  onChange={(value) => setProductFilter(value || '')}
                  allowClear
                  style={{ width: 180 }}
                  options={[
                    { label: '到店营销', value: '到店营销' },
                    { label: '即时零售', value: '即时零售' },
                    { label: '物码营销', value: '物码营销' },
                  ]}
                />
              </div>
              <div className={styles.filterItem}>
                <Text>创建人：</Text>
                <Input
                  placeholder="请输入创建人"
                  value={creatorFilter}
                  onChange={(e) => setCreatorFilter(e.target.value)}
                  style={{ width: 180 }}
                  allowClear
                />
              </div>
              <div className={styles.filterItem}>
                <Text>创建时间：</Text>
                <RangePicker
                  value={dateRange}
                  onChange={(dates) => setDateRange(dates as [Dayjs | null, Dayjs | null] | null)}
                  disabledDate={disabledDate}
                  format="YYYY-MM-DD"
                  style={{ width: 260 }}
                />
              </div>
              <div className={styles.filterActions}>
                <Button type="primary" onClick={applyFilters}>
                  查询
                </Button>
                <Button onClick={resetFilters}>重置</Button>
              </div>
            </Space>
          </div>

          {/* 数据表格 */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={paginatedReports.map(r => r.id)} strategy={verticalListSortingStrategy}>
              <Table
                dataSource={paginatedReports}
                columns={columns}
                rowKey="id"
                loading={loading}
                components={{
                  body: {
                    row: DraggableRow,
                  },
                }}
                pagination={{
                  current: currentPage,
                  pageSize: pageSize,
                  total: filteredReports.length,
                  showTotal: (total) => `共${total}条`,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  onChange: (page, size) => {
                    setCurrentPage(page)
                    setPageSize(size)
                  },
                }}
                scroll={{ x: 1500 }}
              />
            </SortableContext>
          </DndContext>
        </Card>
      )}
      
      {/* 添加/编辑链接抽屉 */}
      <Drawer
        title={editingReport ? '编辑看板链接' : '添加看板链接'}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSaveReport}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={form} layout="vertical">
          <Form.Item
            label="链接名称"
            name="name"
            rules={[{ required: true, message: '请输入链接名称' }]}
          >
            <Input placeholder="请输入看板链接名称" />
          </Form.Item>

          <Form.Item
            label={
              <span>
                所属客户
                <Text type="secondary" style={{ fontSize: 12, fontWeight: 'normal', marginLeft: 4 }}>
                  （PMS已建档客户）
                </Text>
              </span>
            }
            required
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Checkbox
                checked={form.getFieldValue('clientsAll')}
                onChange={(e) => {
                  form.setFieldsValue({ clientsAll: e.target.checked, clients: e.target.checked ? [] : form.getFieldValue('clients') })
                }}
              >
                全部适用
              </Checkbox>
              <Form.Item
                name="clients"
                noStyle
                rules={[
                  {
                    validator: (_, value) => {
                      const clientsAll = form.getFieldValue('clientsAll')
                      if (clientsAll) return Promise.resolve()
                      if (!value || value.length === 0) {
                        return Promise.reject(new Error('请选择至少一个客户或选择全部适用'))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择客户"
                  disabled={form.getFieldValue('clientsAll')}
                  options={[
                    { label: '达能', value: '达能' },
                    { label: '伊利', value: '伊利' },
                    { label: '康师傅', value: '康师傅' },
                    { label: '嘉士伯', value: '嘉士伯' },
                    { label: '统一', value: '统一' },
                    { label: '百威', value: '百威' },
                    { label: '雀巢', value: '雀巢' },
                  ]}
                />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item
            label="所属品牌"
            required
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Checkbox
                checked={form.getFieldValue('brandsAll')}
                onChange={(e) => {
                  form.setFieldsValue({ brandsAll: e.target.checked, brands: e.target.checked ? [] : form.getFieldValue('brands') })
                }}
              >
                全部适用
              </Checkbox>
              <Form.Item
                name="brands"
                noStyle
                rules={[
                  {
                    validator: (_, value) => {
                      const brandsAll = form.getFieldValue('brandsAll')
                      if (brandsAll) return Promise.resolve()
                      if (!value || value.length === 0) {
                        return Promise.reject(new Error('请选择至少一个品牌或选择全部适用'))
                      }
                      return Promise.resolve()
                    },
                  },
                ]}
              >
                <Select
                  mode="multiple"
                  placeholder="请选择品牌"
                  disabled={form.getFieldValue('brandsAll')}
                  options={[
                    { label: '康师傅', value: '康师傅' },
                    { label: '嘉士伯', value: '嘉士伯' },
                    { label: '统一', value: '统一' },
                    { label: '百威', value: '百威' },
                    { label: '雀巢', value: '雀巢' },
                    { label: '达能', value: '达能' },
                    { label: '伊利', value: '伊利' },
                    { label: '联合利华', value: '联合利华' },
                  ]}
                />
              </Form.Item>
            </Space>
          </Form.Item>

          <Form.Item
            label="产品"
            name="product"
            rules={[{ required: true, message: '请选择产品' }]}
          >
            <Select
              placeholder="请选择产品"
              options={[
                { label: '到店营销', value: '到店营销' },
                { label: '即时零售', value: '即时零售' },
                { label: '物码营销', value: '物码营销' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="链接地址"
            name="link"
            rules={[{ type: 'url', message: '请输入有效的URL' }]}
          >
            <TextArea placeholder="请输入QuickBI链接地址" rows={3} />
          </Form.Item>

          <Form.Item
            label="链接有效期"
            name="validity"
          >
            <Select
              options={[
                { label: '永久', value: '永久' },
                { label: '一年', value: '一年' },
                { label: '半年', value: '半年' },
              ]}
            />
          </Form.Item>

          <Form.Item
            label="链接来源"
            name="source"
          >
            <Input placeholder="如：QBI" />
          </Form.Item>

          <Form.Item
            label="依赖数据源"
            name="dataSource"
          >
            <Input placeholder="如：数仓" />
          </Form.Item>

          <Form.Item
            label="可见人设置"
            name="visibilityConfig"
            rules={[{ required: true, message: '请设置可见人' }]}
          >
            <OrganizationSelector />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 查看权限弹窗 */}
      <Modal
        title="查看权限"
        open={permissionModalVisible}
        onCancel={() => setPermissionModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setPermissionModalVisible(false)}>
            关闭
          </Button>,
        ]}
        width={500}
      >
        {viewingPermission && orgTree && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>看板名称：</Text>
              <Text>{viewingPermission.name}</Text>
            </div>
            <div style={{ marginBottom: 16 }}>
              <Text strong>可见范围：</Text>
              <div style={{ marginTop: 8 }}>
                {viewingPermission.visibleTo.includes('company-root') ? (
                  <Tag color="blue">全公司可见</Tag>
                ) : (
                  <Space wrap>
                    {OrganizationService.getNodeNames(viewingPermission.visibleTo, orgTree).map((name, index) => (
                      <Tag key={index}>{name}</Tag>
                    ))}
                  </Space>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}

