import { useEffect, useMemo, useState } from 'react'
import {
  Card,
  Tag,
  Segmented,
  Empty,
  Collapse,
  Table,
  Typography,
  Space,
  Tooltip,
  Button,
  Skeleton,
} from 'antd'
import type { TableColumnsType } from 'antd'
import { getDataWarehouseDatasets } from '../../services/data-warehouse-service'
import type {
  DataWarehouseDataset,
  DataWarehouseField,
  DataWarehouseBusinessType,
} from '../../types/data-warehouse'
import styles from './data-warehouse-page.module.css'

const { Text } = Typography
const { Panel } = Collapse

const BUSINESS_OPTIONS: DataWarehouseBusinessType[] = ['到店营销', '即时零售', '物码营销']

const statusColorMap: Record<DataWarehouseDataset['releaseStatus'], string> = {
  已上线: 'green',
  试运行: 'blue',
  规划中: 'gold',
}

const DataWarehousePage = () => {
  const [datasets, setDatasets] = useState<DataWarehouseDataset[]>([])
  const [loading, setLoading] = useState(false)
  const [platform, setPlatform] = useState<string>('全部平台')
  const [business, setBusiness] = useState<DataWarehouseBusinessType | '全部业务'>('全部业务')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const list = await getDataWarehouseDatasets()
        setDatasets(list)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const platforms = useMemo(() => {
    const set = new Set<string>()
    datasets.forEach((item) => set.add(item.platform))
    return ['全部平台', ...Array.from(set)]
  }, [datasets])

  const filteredDatasets = useMemo(() => {
    return datasets.filter((item) => {
      const matchPlatform = platform === '全部平台' || item.platform === platform
      const matchBusiness = business === '全部业务' || item.business === business
      return matchPlatform && matchBusiness
    })
  }, [datasets, platform, business])

  const columns: TableColumnsType<DataWarehouseField> = [
    { title: '字段英文名', dataIndex: 'name', key: 'name', width: 180 },
    { title: '字段别名', dataIndex: 'alias', key: 'alias', width: 160 },
    { title: '数据类型', dataIndex: 'dataType', key: 'dataType', width: 100 },
    { title: '业务含义', dataIndex: 'description', key: 'description' },
    { title: '更新频率', dataIndex: 'updateFrequency', key: 'updateFrequency', width: 120 },
    { title: '来源系统', dataIndex: 'sourceSystem', key: 'sourceSystem', width: 160 },
  ]

  return (
    <div className={styles.page}>
      <Card>
        <div className={styles.datasetHeader}>
          <div>
            <h3 style={{ marginBottom: 4 }}>数据仓库</h3>
            <div style={{ color: 'var(--ant-color-text-secondary)' }}>
              汇总交付业务在各平台沉淀的数据模型，提供字段定义与应用案例。
            </div>
          </div>
          <Space>
            <Segmented
              options={platforms}
              value={platform}
              onChange={(value) => setPlatform(value as string)}
            />
            <Segmented
              options={['全部业务', ...BUSINESS_OPTIONS]}
              value={business}
              onChange={(value) => setBusiness(value as typeof business)}
            />
          </Space>
        </div>
      </Card>

      <div className={styles.layout}>
        <Card className={styles.filterPanel} size="small" title="筛选条件">
          <div className={styles.filterSection}>
            <Text type="secondary">业务类型</Text>
            <Space wrap>
              {(['全部业务', ...BUSINESS_OPTIONS] as const).map((biz) => (
                <Tag.CheckableTag
                  key={biz}
                  checked={business === biz}
                  onChange={() => setBusiness(biz)}
                >
                  {biz}
                </Tag.CheckableTag>
              ))}
            </Space>
          </div>
          <div className={styles.filterSection}>
            <Text type="secondary">平台列表</Text>
            <div className={styles.platformList}>
              {platforms.map((item) => (
                <div
                  key={item}
                  className={`${styles.platformItem} ${platform === item ? styles.platformActive : ''}`}
                  onClick={() => setPlatform(item)}
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className={styles.contentPanel}>
          <Card bordered={false}>
            {loading ? (
              <Skeleton active />
            ) : filteredDatasets.length === 0 ? (
              <Empty description="暂无数据集" />
            ) : (
              <Collapse accordion>
                {filteredDatasets.map((dataset) => (
                  <Panel
                    header={
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Space align="center" size="middle">
                          <Text strong>{dataset.name}</Text>
                          <Tag color={statusColorMap[dataset.releaseStatus]}>{dataset.releaseStatus}</Tag>
                          <Tag color="blue">{dataset.platform}</Tag>
                          <Tag color="cyan">{dataset.business}</Tag>
                        </Space>
                        <Text type="secondary">
                          共 {dataset.fields.length} 个字段 · 应用案例 {dataset.useCases.length} 个
                        </Text>
                      </Space>
                    }
                    key={dataset.id}
                  >
                    <Table<DataWarehouseField>
                      className={styles.fieldTable}
                      columns={columns}
                      dataSource={dataset.fields}
                      rowKey="id"
                      pagination={false}
                      size="small"
                    />
                    <div style={{ marginTop: 16 }}>
                      <h4 style={{ marginBottom: 12 }}>应用案例</h4>
                      <div className={styles.useCaseList}>
                        {dataset.useCases.map((useCase) => (
                          <div key={useCase.id} className={styles.useCaseCard}>
                            <Space direction="vertical">
                              <Space align="center">
                                <Text strong>{useCase.title}</Text>
                                <Tag color="purple">{useCase.businessUnit}</Tag>
                              </Space>
                              <Text>{useCase.description}</Text>
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary">负责人：{useCase.owner}</Text>
                                <Tooltip title="最后一次维护时间">
                                  <Text type="secondary">更新：{useCase.lastUpdatedAt}</Text>
                                </Tooltip>
                              </div>
                            </Space>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: 16 }}>
                      <Button type="link" size="small">
                        下载字段说明
                      </Button>
                    </div>
                  </Panel>
                ))}
              </Collapse>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default DataWarehousePage

