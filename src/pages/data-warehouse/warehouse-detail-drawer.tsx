import { useEffect, useState } from 'react'
import {
  Drawer,
  Tag,
  Typography,
  Divider,
  Table,
  Empty,
  Skeleton,
} from 'antd'
import type { TableColumnsType } from 'antd'
import {
  ApiOutlined,
  DatabaseOutlined,
  CloudDownloadOutlined,
  ClockCircleOutlined,
  LinkOutlined,
  PictureOutlined,
} from '@ant-design/icons'
import type { DataCategory } from '../../types/data-warehouse'
import { DataWarehouseService } from '../../services/data-warehouse-service'
import styles from './warehouse-detail-drawer.module.css'

const { Text, Title, Paragraph } = Typography

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

interface Props {
  open: boolean
  category: DataCategory | null
  onClose: () => void
}

const WarehouseDetailDrawer = ({ open, category, onClose }: Props) => {
  const [sampleData, setSampleData] = useState<Record<string, string | number>[]>([])
  const [sampleLoading, setSampleLoading] = useState(false)

  useEffect(() => {
    if (open && category) {
      setSampleLoading(true)
      setSampleData([])
      DataWarehouseService.getCategorySampleData(category.id)
        .then(setSampleData)
        .finally(() => setSampleLoading(false))
    }
  }, [open, category])

  if (!category) return null

  const sourceLabel = category.sourcePagePath.includes('·')
    ? category.sourcePagePath.split('·')[0].trim()
    : category.sourcePagePath
  const sourceDetail = category.sourcePagePath.includes('·')
    ? category.sourcePagePath.split('·').slice(1).join('·').trim()
    : ''

  const fieldColumns: TableColumnsType<typeof category.fields[number]> = [
    {
      title: '数据项名称',
      dataIndex: 'name',
      key: 'name',
      width: 140,
      render: (v: string) => <Text strong>{v}</Text>,
    },
    {
      title: '内容说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '数据示例',
      dataIndex: 'example',
      key: 'example',
      width: 200,
      render: (v: string | undefined) =>
        v ? <Text type="secondary">{v}</Text> : <Text type="secondary">—</Text>,
    },
  ]

  const sampleColumns: TableColumnsType<Record<string, string | number>> =
    category.fields.map((f) => ({
      title: f.name,
      dataIndex: f.name,
      key: f.id,
      ellipsis: true,
      render: (val: unknown) => {
        if (val === undefined || val === null) return '-'
        if (typeof val === 'number') return val.toLocaleString()
        return String(val)
      },
    }))

  return (
    <Drawer
      title={
        <div className={styles.drawerTitle}>
          <Tag color={businessColorMap[category.businessType]}>{category.businessType}</Tag>
          <span className={styles.drawerTitlePlatform}>{category.platformName}</span>
          <Text type="secondary" style={{ margin: '0 4px' }}>·</Text>
          <span>{category.name}</span>
        </div>
      }
      open={open}
      onClose={onClose}
      width={860}
      destroyOnClose
    >
      {/* 数据来源信息 */}
      <Title level={5} className={styles.sectionTitle}>数据来源信息</Title>
      <div className={styles.infoGrid}>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>来源平台</span>
          <span className={styles.infoValue}>{category.platformName}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>业务线</span>
          <span className={styles.infoValue}>
            <Tag color={businessColorMap[category.businessType]} style={{ marginBottom: 0 }}>
              {category.businessType}
            </Tag>
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>获取方式</span>
          <span className={styles.infoValue}>
            <Tag
              color={acquisitionColorMap[category.acquisitionMethod]}
              icon={
                category.acquisitionMethod === '平台开放接口' ? <ApiOutlined /> :
                category.acquisitionMethod === '共享数仓' ? <DatabaseOutlined /> :
                <CloudDownloadOutlined />
              }
              style={{ marginBottom: 0 }}
            >
              {category.acquisitionMethod}
            </Tag>
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>采集频率</span>
          <span className={styles.infoValue}>
            <Tag
              color={freqColorMap[category.updateFrequency]}
              icon={<ClockCircleOutlined />}
              style={{ marginBottom: 0 }}
            >
              {category.updateFrequency}
            </Tag>
          </span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>最近更新时间</span>
          <span className={styles.infoValue}>{category.lastUpdatedAt}</span>
        </div>
        <div className={styles.infoItem}>
          <span className={styles.infoLabel}>当前数据量</span>
          <span className={styles.infoValue}>
            <Text strong style={{ color: '#2f54eb' }}>{category.recordCount.toLocaleString()}</Text>
            <Text type="secondary" style={{ marginLeft: 4 }}>条</Text>
          </span>
        </div>
      </div>
      <div className={styles.freqNote}>
        <ClockCircleOutlined style={{ marginRight: 6, color: '#8c8c8c' }} />
        <Text type="secondary" style={{ fontSize: 12 }}>{category.updateFrequencyDetail}</Text>
      </div>

      <Divider />

      {/* 采集来源地址 */}
      <Title level={5} className={styles.sectionTitle}>采集来源地址</Title>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 10 }}>
        数据系统定期登录以下地址，自动采集对应页面的数据并存入数据仓库。
      </Text>
      <div className={styles.sourcePathBox}>
        <LinkOutlined className={styles.sourcePathIcon} />
        <div>
          <div className={styles.sourcePathMain}>{sourceLabel}</div>
          {sourceDetail && (
            <Text type="secondary" style={{ fontSize: 12 }}>{sourceDetail}</Text>
          )}
        </div>
      </div>

      {/* 平台页面截图示意 */}
      <div className={styles.screenshotWrapper}>
        <div className={styles.browserChrome}>
          <div className={styles.chromeDots}>
            <span className={styles.chromeDot} style={{ background: '#ff5f57' }} />
            <span className={styles.chromeDot} style={{ background: '#febc2e' }} />
            <span className={styles.chromeDot} style={{ background: '#28c840' }} />
          </div>
          <div className={styles.chromeUrlBar}>{sourceLabel}</div>
        </div>
        <div className={styles.screenshotBody}>
          <PictureOutlined style={{ fontSize: 36, color: '#d9d9d9', marginBottom: 10 }} />
          <Text type="secondary" style={{ fontSize: 13, display: 'block' }}>平台页面截图（示意）</Text>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
            系统通过自动化程序定期访问 {category.platformName}，从此页面采集数据后自动入库
          </Text>
        </div>
      </div>

      <Divider />

      {/* 数据说明 */}
      <Title level={5} className={styles.sectionTitle}>数据说明</Title>
      <Paragraph style={{ fontSize: 13, lineHeight: 1.8, color: 'rgba(0,0,0,0.65)' }}>
        {category.description}
      </Paragraph>

      <Divider />

      {/* 数据源示例 */}
      <Title level={5} className={styles.sectionTitle}>数据源示例</Title>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
        以下为从 {category.platformName} 实际采集到的数据样本，已做客户信息脱敏处理。
      </Text>
      {sampleLoading ? (
        <Skeleton active paragraph={{ rows: 3 }} />
      ) : sampleData.length === 0 ? (
        <Empty description="暂无示例数据" image={Empty.PRESENTED_IMAGE_SIMPLE} />
      ) : (
        <Table
          columns={sampleColumns}
          dataSource={sampleData.map((r, i) => ({ ...r, _rowKey: i }))}
          rowKey="_rowKey"
          size="small"
          pagination={false}
          scroll={{ x: 'max-content' }}
        />
      )}

      <Divider />

      {/* 已入库字段说明 */}
      <Title level={5} className={styles.sectionTitle}>已入库字段说明</Title>
      <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
        以下为当前该数据集已采集并存储的全部数据项，共 {category.fields.length} 项。
        每项均附有业务含义说明与示例值，方便查阅。
      </Text>
      <Table
        columns={fieldColumns}
        dataSource={category.fields}
        rowKey="id"
        size="small"
        pagination={false}
        bordered
      />
    </Drawer>
  )
}

export default WarehouseDetailDrawer
