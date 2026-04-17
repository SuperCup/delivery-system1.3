import { useEffect, useMemo, useState, useCallback } from 'react'
import {
  Card,
  Tag,
  Empty,
  Table,
  Typography,
  Space,
  Button,
  Skeleton,
  Input,
  Drawer,
  Select,
  DatePicker,
  message,
  Upload,
  Tooltip,
  Tabs,
  Badge,
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  SearchOutlined,
  DownloadOutlined,
  UploadOutlined,
  CloudDownloadOutlined,
  ApiOutlined,
  DatabaseOutlined,
  ClockCircleOutlined,
  FileExcelOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import dayjs from 'dayjs'
import { DataWarehouseService } from '../../services/data-warehouse-service'
import type {
  DataCategory,
  DataRecord,
  ImportRecord,
  DownloadRecord,
  DataWarehouseBusinessType,
  DownloadCondition,
} from '../../types/data-warehouse'
import CollectionTaskTab from './collection-task-tab'
import DataDashboardTab from './data-dashboard-tab'
import WarehouseDetailDrawer from './warehouse-detail-drawer'
import styles from './data-warehouse-page.module.css'

const { Text, Title } = Typography
const { RangePicker } = DatePicker

const BUSINESS_OPTIONS: { label: string; value: DataWarehouseBusinessType | '全部' }[] = [
  { label: '全部', value: '全部' },
  { label: '到店营销', value: '到店营销' },
  { label: '即时零售', value: '即时零售' },
  { label: '物码营销', value: '物码营销' },
]

const acquisitionColorMap: Record<string, string> = {
  '平台爬取': 'blue',
  '平台开放接口': 'cyan',
  '共享数仓': 'purple',
}

const freqColorMap: Record<string, string> = {
  '实时': 'red',
  '每日': 'blue',
}

const businessColorMap: Record<string, string> = {
  '到店营销': 'blue',
  '即时零售': 'green',
  '物码营销': 'purple',
}

interface SourceGroup {
  platformId: string
  platformName: string
  businessType: DataWarehouseBusinessType
  dataTypes: DataCategory[]
}

const DataWarehousePage = () => {
  const [pageTab, setPageTab] = useState<'warehouse' | 'data' | 'collection'>('warehouse')

  const [detailDrawerOpen, setDetailDrawerOpen] = useState(false)
  const [detailCategory, setDetailCategory] = useState<DataCategory | null>(null)

  const handleOpenDetail = useCallback((cat: DataCategory) => {
    setDetailCategory(cat)
    setDetailDrawerOpen(true)
  }, [])
  const [categories, setCategories] = useState<DataCategory[]>([])
  const [myClients, setMyClients] = useState<{ id: string; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [businessFilter, setBusinessFilter] = useState<DataWarehouseBusinessType | '全部'>('全部')

  const [activePlatformId, setActivePlatformId] = useState<string>('')

  const [queryDrawerOpen, setQueryDrawerOpen] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<DataCategory | null>(null)
  const [selectedClient, setSelectedClient] = useState<string | undefined>(undefined)
  const [queryLoading, setQueryLoading] = useState(false)
  const [queryData, setQueryData] = useState<DataRecord[]>([])
  const [downloadConditions, setDownloadConditions] = useState<Record<string, string>>({})
  const [dateRange, setDateRange] = useState<[string, string] | null>(null)

  const [importDrawerOpen, setImportDrawerOpen] = useState(false)
  const [importCategory, setImportCategory] = useState<DataCategory | null>(null)
  const [importClient, setImportClient] = useState<string | undefined>(undefined)
  const [importLoading, setImportLoading] = useState(false)
  const [importRecords, setImportRecords] = useState<ImportRecord[]>([])

  const [historyDrawerOpen, setHistoryDrawerOpen] = useState(false)
  const [downloadRecords, setDownloadRecords] = useState<DownloadRecord[]>([])
  const [allImportRecords, setAllImportRecords] = useState<ImportRecord[]>([])

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [cats, clients] = await Promise.all([
          DataWarehouseService.getCategories(),
          DataWarehouseService.getMyClients(),
        ])
        setCategories(cats)
        setMyClients(clients)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const filteredCategories = useMemo(
    () =>
      DataWarehouseService.filterCategories(categories, {
        businessType: businessFilter,
        keyword,
      }),
    [categories, businessFilter, keyword],
  )

  const groupedBySource = useMemo<SourceGroup[]>(() => {
    const map = new Map<string, DataCategory[]>()
    filteredCategories.forEach((cat) => {
      if (!map.has(cat.platformId)) map.set(cat.platformId, [])
      map.get(cat.platformId)!.push(cat)
    })
    const order: DataWarehouseBusinessType[] = ['到店营销', '即时零售', '物码营销']
    return Array.from(map.entries())
      .map(([platformId, list]) => ({
        platformId,
        platformName: list[0].platformName,
        businessType: list[0].businessType,
        dataTypes: list,
      }))
      .sort((a, b) => {
        const ai = order.indexOf(a.businessType)
        const bi = order.indexOf(b.businessType)
        if (ai !== bi) return ai - bi
        return a.platformName.localeCompare(b.platformName)
      })
  }, [filteredCategories])

  useEffect(() => {
    if (groupedBySource.length > 0 && !groupedBySource.find((g) => g.platformId === activePlatformId)) {
      setActivePlatformId(groupedBySource[0].platformId)
    }
  }, [groupedBySource, activePlatformId])

  const activeGroup = useMemo(
    () => groupedBySource.find((g) => g.platformId === activePlatformId),
    [groupedBySource, activePlatformId],
  )

  const handleOpenQuery = useCallback(
    (cat: DataCategory) => {
      setSelectedCategory(cat)
      setSelectedClient(myClients.length > 0 ? myClients[0].id : undefined)
      setQueryData([])
      setDownloadConditions({})
      setDateRange(null)
      setQueryDrawerOpen(true)
    },
    [myClients],
  )

  const handleQuery = useCallback(async () => {
    if (!selectedCategory || !selectedClient) {
      message.warning('请先选择客户')
      return
    }
    setQueryLoading(true)
    try {
      const data = await DataWarehouseService.queryData(selectedCategory.id, selectedClient, {
        ...downloadConditions,
        dateRange: dateRange ? `${dateRange[0]} ~ ${dateRange[1]}` : '',
      })
      setQueryData(data)
    } catch {
      message.error('查询失败，请稍后重试')
    } finally {
      setQueryLoading(false)
    }
  }, [selectedCategory, selectedClient, downloadConditions, dateRange])

  const handleDownload = useCallback(async () => {
    if (!selectedCategory || !selectedClient) return
    const period = dateRange ? `${dateRange[0]} ~ ${dateRange[1]}` : '最近30天'
    const result = await DataWarehouseService.downloadData(
      selectedCategory.id,
      selectedClient,
      period,
      downloadConditions,
    )
    if (result.success) {
      message.success(result.message)
    } else {
      message.error(result.message)
    }
  }, [selectedCategory, selectedClient, dateRange, downloadConditions])

  const openImportDrawer = useCallback(
    (cat: DataCategory) => {
      setImportCategory(cat)
      setImportClient(myClients.length > 0 ? myClients[0].id : undefined)
      setImportRecords([])
      setImportDrawerOpen(true)
      DataWarehouseService.getImportRecords(cat.id).then(setImportRecords)
    },
    [myClients],
  )

  void openImportDrawer

  const handleImportFile = useCallback(
    async (file: File) => {
      if (!importCategory || !importClient) {
        message.warning('请先选择客户')
        return false
      }
      setImportLoading(true)
      try {
        const result = await DataWarehouseService.importData(
          importCategory.id,
          importClient,
          file.name,
        )
        if (result.success) {
          message.success(result.message)
          const records = await DataWarehouseService.getImportRecords(importCategory.id)
          setImportRecords(records)
        } else {
          message.error(result.message)
        }
      } catch {
        message.error('导入失败，请稍后重试')
      } finally {
        setImportLoading(false)
      }
      return false
    },
    [importCategory, importClient],
  )

  const handleOpenHistory = useCallback(async () => {
    setHistoryDrawerOpen(true)
    const [downloads, imports] = await Promise.all([
      DataWarehouseService.getDownloadRecords(),
      DataWarehouseService.getImportRecords(),
    ])
    setDownloadRecords(downloads)
    setAllImportRecords(imports)
  }, [])

  const queryColumns = useMemo<TableColumnsType<DataRecord>>(() => {
    if (!selectedCategory) return []
    return selectedCategory.fields.map((field) => ({
      title: field.name,
      dataIndex: field.name,
      key: field.id,
      ellipsis: true,
      render: (val: unknown) => {
        if (val === undefined || val === null) return '-'
        if (typeof val === 'number') return val.toLocaleString()
        return String(val)
      },
    }))
  }, [selectedCategory])

  const importColumns: TableColumnsType<ImportRecord> = [
    { title: '文件名', dataIndex: 'fileName', key: 'fileName', ellipsis: true },
    { title: '客户', dataIndex: 'clientName', key: 'clientName', width: 80 },
    { title: '导入人', dataIndex: 'importedBy', key: 'importedBy', width: 80 },
    { title: '导入时间', dataIndex: 'importedAt', key: 'importedAt', width: 160 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 80,
      render: (status: ImportRecord['status']) => {
        const colorMap = { '成功': 'green', '失败': 'red', '处理中': 'blue' }
        return <Tag color={colorMap[status]}>{status}</Tag>
      },
    },
    {
      title: '记录数',
      dataIndex: 'recordCount',
      key: 'recordCount',
      width: 80,
      render: (v: number) => (v > 0 ? v.toLocaleString() : '-'),
    },
  ]

  const downloadColumns: TableColumnsType<DownloadRecord> = [
    { title: '来源', dataIndex: 'platformName', key: 'platformName', width: 100 },
    { title: '数据类别', dataIndex: 'categoryName', key: 'categoryName', width: 140 },
    { title: '客户', dataIndex: 'clientName', key: 'clientName', width: 80 },
    { title: '数据范围', dataIndex: 'period', key: 'period', width: 180 },
    { title: '下载时间', dataIndex: 'downloadedAt', key: 'downloadedAt', width: 160 },
    { title: '文件大小', dataIndex: 'fileSize', key: 'fileSize', width: 80 },
  ]

  return (
    <div className={styles.page}>
      {/* Header */}
      <Card className={styles.headerCard}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <h3>数据赋能</h3>
            <p>集中管理已采集数据，支持总体看板、仓库浏览、在线查询与采集任务管理。</p>
          </div>
        </div>
      </Card>

      {/* 数据看板 - 常驻页面顶部 */}
      <DataDashboardTab />

      {/* 功能区 Tab - 数据仓库 / 数据查询 / 采集任务管理 */}
      <Card className={styles.headerCard}>
        <div className={styles.tabBarRow}>
          <Tabs
            activeKey={pageTab}
            onChange={(k) => setPageTab(k as 'warehouse' | 'data' | 'collection')}
            style={{ marginBottom: -16, flex: 1 }}
            items={[
              { key: 'warehouse', label: '数据仓库' },
              { key: 'data', label: '数据查询' },
              { key: 'collection', label: '采集任务管理' },
            ]}
          />
          {pageTab === 'data' && (
            <Button icon={<HistoryOutlined />} onClick={handleOpenHistory} style={{ marginBottom: 16 }}>
              操作记录
            </Button>
          )}
        </div>
      </Card>

      {/* Collection Task Tab */}
      {pageTab === 'collection' && (
        <Card>
          <CollectionTaskTab />
        </Card>
      )}

      {/* Main layout: left sidebar + right content */}
      {(pageTab === 'warehouse' || pageTab === 'data') && <div className={styles.mainLayout}>

        {/* Left: source list */}
        <Card className={styles.sidebarCard} size="small">
          <div className={styles.sidebarHeader}>
            <Input
              placeholder="搜索..."
              prefix={<SearchOutlined />}
              allowClear
              size="small"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
            <Select
              size="small"
              style={{ width: '100%', marginTop: 8 }}
              options={BUSINESS_OPTIONS}
              value={businessFilter}
              onChange={setBusinessFilter}
            />
          </div>

          <div className={styles.sourceList}>
            {loading ? (
              <Skeleton active paragraph={{ rows: 6 }} />
            ) : groupedBySource.length === 0 ? (
              <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="无匹配" />
            ) : (
              <>
                {(['到店营销', '即时零售', '物码营销'] as DataWarehouseBusinessType[]).map((biz) => {
                  const groups = groupedBySource.filter((g) => g.businessType === biz)
                  if (groups.length === 0) return null
                  return (
                    <div key={biz} className={styles.sourceSection}>
                      <div className={styles.sourceSectionLabel}>
                        <Tag color={businessColorMap[biz]} style={{ marginRight: 0, fontSize: 11 }}>
                          {biz}
                        </Tag>
                      </div>
                      {groups.map((group) => (
                        <div
                          key={group.platformId}
                          className={`${styles.sourceItem} ${
                            activePlatformId === group.platformId ? styles.sourceItemActive : ''
                          }`}
                          onClick={() => setActivePlatformId(group.platformId)}
                        >
                          <span className={styles.sourceItemName}>{group.platformName}</span>
                          <Badge
                            count={group.dataTypes.length}
                            style={{ backgroundColor: '#e6e6e6', color: '#666', fontSize: 11 }}
                          />
                        </div>
                      ))}
                    </div>
                  )
                })}
              </>
            )}
          </div>
        </Card>

        {/* Right: data type cards for active source */}
        <div className={styles.contentArea}>
          {loading ? (
            <Card>
              <Skeleton active />
            </Card>
          ) : !activeGroup ? (
            <Card>
              <Empty description="请从左侧选择数据来源" />
            </Card>
          ) : (
            <>
              <div className={styles.contentHeader}>
                <Title level={5} style={{ margin: 0 }}>{activeGroup.platformName}</Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  {activeGroup.dataTypes.length} 个数据类别
                </Text>
              </div>
              <div className={styles.categoryGrid}>
                {activeGroup.dataTypes.map((cat) => (
                  <Card key={cat.id} className={styles.categoryCard} hoverable={false}>
                    <div className={styles.categoryTitleRow}>
                      <Text strong style={{ fontSize: 15 }}>{cat.name}</Text>
                    </div>
                    <div className={styles.categoryDesc}>{cat.description}</div>

                    <div className={styles.categoryMeta}>
                      <Tag
                        color={acquisitionColorMap[cat.acquisitionMethod]}
                        icon={
                          cat.acquisitionMethod === '平台开放接口' ? <ApiOutlined /> :
                          cat.acquisitionMethod === '共享数仓' ? <DatabaseOutlined /> :
                          <CloudDownloadOutlined />
                        }
                      >
                        {cat.acquisitionMethod}
                      </Tag>
                      <Tag color={freqColorMap[cat.updateFrequency]} icon={<ClockCircleOutlined />}>
                        {cat.updateFrequency}
                      </Tag>
                    </div>

                    <div className={styles.categoryFooter}>
                      <div className={styles.categoryFooterLeft}>
                        <Tooltip title={cat.updateFrequencyDetail}>
                          <InfoCircleOutlined style={{ marginRight: 4 }} />
                        </Tooltip>
                        {cat.recordCount.toLocaleString()} 条 · 更新于 {cat.lastUpdatedAt.split(' ')[0]}
                      </div>
                      {pageTab === 'warehouse' ? (
                        <Button
                          size="small"
                          icon={<EyeOutlined />}
                          onClick={() => handleOpenDetail(cat)}
                        >
                          查看详情
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          size="small"
                          icon={<SearchOutlined />}
                          onClick={() => handleOpenQuery(cat)}
                        >
                          查询 / 下载
                        </Button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </div>
      </div>}

      {/* Query Drawer */}
      <Drawer
        title={
          selectedCategory
            ? `${selectedCategory.platformName} · ${selectedCategory.name}`
            : '数据查询'
        }
        open={queryDrawerOpen}
        onClose={() => setQueryDrawerOpen(false)}
        width={960}
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleDownload} disabled={queryData.length === 0}>
              下载数据
            </Button>
          </Space>
        }
      >
        {selectedCategory && (
          <>
            <div className={styles.queryHeader}>
              <div className={styles.queryInfoRow}>
                <div className={styles.queryInfoItem}>
                  <span className={styles.queryInfoLabel}>获取方式</span>
                  <span className={styles.queryInfoValue}>
                    <Tag color={acquisitionColorMap[selectedCategory.acquisitionMethod]} style={{ marginRight: 0 }}>
                      {selectedCategory.acquisitionMethod}
                    </Tag>
                  </span>
                </div>
                <div className={styles.queryInfoItem}>
                  <span className={styles.queryInfoLabel}>更新频率</span>
                  <span className={styles.queryInfoValue}>
                    <Tag color={freqColorMap[selectedCategory.updateFrequency]} style={{ marginRight: 0 }}>
                      {selectedCategory.updateFrequency}
                    </Tag>
                  </span>
                </div>
                <div className={styles.queryInfoItem}>
                  <span className={styles.queryInfoLabel}>数据量</span>
                  <span className={styles.queryInfoValue}>
                    {selectedCategory.recordCount.toLocaleString()} 条
                  </span>
                </div>
                <div className={styles.queryInfoItem}>
                  <span className={styles.queryInfoLabel}>最后更新</span>
                  <span className={styles.queryInfoValue}>{selectedCategory.lastUpdatedAt}</span>
                </div>
              </div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {selectedCategory.updateFrequencyDetail}
              </Text>
              <div className={styles.fieldList}>
                {selectedCategory.fields.map((field) => (
                  <Tooltip key={field.id} title={field.description}>
                    <Tag>{field.name}</Tag>
                  </Tooltip>
                ))}
              </div>
            </div>

            <Title level={5} style={{ marginTop: 0 }}>下载条件</Title>
            <div className={styles.queryFilters}>
              {selectedCategory.downloadConditions.map((cond: DownloadCondition) => (
                <div key={cond.id} className={styles.queryFilterItem}>
                  <span className={styles.queryFilterLabel}>
                    {cond.label}
                    {cond.required && <Text type="danger"> *</Text>}
                  </span>
                  {cond.type === 'client' && (
                    <Select
                      style={{ width: 200 }}
                      placeholder={`选择${cond.label}`}
                      value={selectedClient}
                      onChange={(v) => {
                        setSelectedClient(v)
                        setDownloadConditions((prev) => ({ ...prev, [cond.id]: v ?? '' }))
                      }}
                      options={myClients.map((c) => ({ label: c.name, value: c.id }))}
                    />
                  )}
                  {cond.type === 'dateRange' && (
                    <RangePicker
                      style={{ width: 260 }}
                      value={
                        dateRange
                          ? [dayjs(dateRange[0], 'YYYY-MM-DD'), dayjs(dateRange[1], 'YYYY-MM-DD')]
                          : null
                      }
                      onChange={(_dates, dateStrings) => {
                        if (dateStrings[0] && dateStrings[1]) {
                          setDateRange([dateStrings[0], dateStrings[1]])
                          setDownloadConditions((prev) => ({
                            ...prev,
                            [cond.id]: `${dateStrings[0]} ~ ${dateStrings[1]}`,
                          }))
                        } else {
                          setDateRange(null)
                          setDownloadConditions((prev) => ({ ...prev, [cond.id]: '' }))
                        }
                      }}
                    />
                  )}
                  {cond.type !== 'client' && cond.type !== 'dateRange' && cond.options && (
                    <Select
                      style={{ width: cond.type === 'billType' ? 140 : 200 }}
                      placeholder={cond.label}
                      value={downloadConditions[cond.id]}
                      onChange={(v) => setDownloadConditions((prev) => ({ ...prev, [cond.id]: v ?? '' }))}
                      options={cond.options}
                    />
                  )}
                </div>
              ))}
              <Button type="primary" icon={<SearchOutlined />} onClick={handleQuery} loading={queryLoading}>
                查询数据
              </Button>
              <Button icon={<DownloadOutlined />} onClick={handleDownload}>
                下载
              </Button>
            </div>

            <Table<DataRecord>
              columns={queryColumns}
              dataSource={queryData}
              rowKey="id"
              size="small"
              loading={queryLoading}
              pagination={{ pageSize: 10, showTotal: (total) => `共 ${total} 条` }}
              scroll={{ x: 'max-content' }}
              locale={{ emptyText: <Empty description={'点击"查询数据"查看结果'} /> }}
            />
          </>
        )}
      </Drawer>

      {/* Import Drawer */}
      <Drawer
        title={importCategory ? `导入 · ${importCategory.name}` : '数据导入'}
        open={importDrawerOpen}
        onClose={() => setImportDrawerOpen(false)}
        width={720}
      >
        {importCategory && (
          <>
            <div className={styles.queryHeader}>
              <Title level={5} style={{ margin: 0 }}>数据说明</Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                {importCategory.description}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <InfoCircleOutlined style={{ marginRight: 4 }} />
                获取方式：{importCategory.acquisitionMethod}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                <ClockCircleOutlined style={{ marginRight: 4 }} />
                {importCategory.updateFrequencyDetail}
              </Text>
              <div className={styles.fieldList}>
                <Text type="secondary" style={{ fontSize: 12, marginRight: 4 }}>模板字段：</Text>
                {importCategory.fields.map((f) => (
                  <Tooltip key={f.id} title={f.description}>
                    <Tag>{f.name}</Tag>
                  </Tooltip>
                ))}
              </div>
            </div>

            <div className={styles.importSection}>
              <div className={styles.importHeader}>
                <Space>
                  <CloudDownloadOutlined />
                  <Text strong>上传数据文件</Text>
                </Space>
                <Button
                  type="link"
                  size="small"
                  icon={<FileExcelOutlined />}
                  onClick={() => message.info('模板下载功能将在后续版本中提供')}
                >
                  下载导入模板
                </Button>
              </div>

              <div className={styles.queryFilters} style={{ marginBottom: 12 }}>
                <div className={styles.queryFilterItem}>
                  <span className={styles.queryFilterLabel}>所属客户</span>
                  <Select
                    style={{ width: 200 }}
                    placeholder="选择客户"
                    value={importClient}
                    onChange={setImportClient}
                    options={myClients.map((c) => ({ label: c.name, value: c.id }))}
                  />
                </div>
              </div>

              <Upload.Dragger
                accept=".xlsx,.xls,.csv"
                showUploadList={false}
                beforeUpload={(file) => handleImportFile(file as File)}
                disabled={importLoading || !importClient}
              >
                <p style={{ fontSize: 32, color: '#999', marginBottom: 8 }}>
                  <UploadOutlined />
                </p>
                <p style={{ fontSize: 14 }}>点击或拖拽文件到此区域上传</p>
                <p style={{ fontSize: 12, color: '#999' }}>支持 .xlsx、.xls、.csv 格式</p>
              </Upload.Dragger>

              {importLoading && (
                <div style={{ marginTop: 12, textAlign: 'center' }}>
                  <Skeleton.Input active style={{ width: 200 }} />
                </div>
              )}
            </div>

            <div className={styles.recentSection}>
              <Title level={5}>导入记录</Title>
              <Table<ImportRecord>
                columns={importColumns}
                dataSource={importRecords}
                rowKey="id"
                size="small"
                pagination={false}
                locale={{ emptyText: <Empty description="暂无导入记录" /> }}
              />
            </div>
          </>
        )}
      </Drawer>

      {/* History Drawer */}
      <Drawer
        title="操作记录"
        open={historyDrawerOpen}
        onClose={() => setHistoryDrawerOpen(false)}
        width={800}
      >
        <Tabs
          items={[
            {
              key: 'downloads',
              label: (
                <span>
                  <DownloadOutlined /> 下载记录{' '}
                  <Badge count={downloadRecords.length} style={{ marginLeft: 4 }} />
                </span>
              ),
              children: (
                <Table<DownloadRecord>
                  columns={downloadColumns}
                  dataSource={downloadRecords}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: <Empty description="暂无下载记录" /> }}
                />
              ),
            },
            {
              key: 'imports',
              label: (
                <span>
                  <UploadOutlined /> 导入记录{' '}
                  <Badge count={allImportRecords.length} style={{ marginLeft: 4 }} />
                </span>
              ),
              children: (
                <Table<ImportRecord>
                  columns={importColumns}
                  dataSource={allImportRecords}
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 10 }}
                  locale={{ emptyText: <Empty description="暂无导入记录" /> }}
                />
              ),
            },
          ]}
        />
      </Drawer>
      {/* Warehouse Detail Drawer */}
      <WarehouseDetailDrawer
        open={detailDrawerOpen}
        category={detailCategory}
        onClose={() => setDetailDrawerOpen(false)}
      />
    </div>
  )
}

export default DataWarehousePage
