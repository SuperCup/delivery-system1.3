import { useEffect, useState } from 'react'
import { Card, Skeleton, Tag, Typography, Progress, Divider, Badge } from 'antd'
import {
  DatabaseOutlined,
  ApiOutlined,
  CloudDownloadOutlined,
  SyncOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  PauseCircleOutlined,
} from '@ant-design/icons'
import { DataWarehouseService } from '../../services/data-warehouse-service'
import type { DashboardStats } from '../../types/data-warehouse'
import styles from './data-dashboard-tab.module.css'

const { Text } = Typography

const businessColorMap: Record<string, string> = {
  '到店营销': '#2f54eb',
  '即时零售': '#52c41a',
  '物码营销': '#722ed1',
}

const acquisitionIconMap: Record<string, React.ReactNode> = {
  '平台爬取': <CloudDownloadOutlined />,
  '平台开放接口': <ApiOutlined />,
  '共享数仓': <DatabaseOutlined />,
}

const acquisitionColorMap: Record<string, string> = {
  '平台爬取': 'blue',
  '平台开放接口': 'cyan',
  '共享数仓': 'purple',
}

const acquisitionStrokeMap: Record<string, string> = {
  '平台爬取': '#2f54eb',
  '平台开放接口': '#13c2c2',
  '共享数仓': '#722ed1',
}

const taskStatusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  '执行中': { color: '#52c41a', icon: <SyncOutlined spin />, label: '执行中' },
  '已完成': { color: '#1890ff', icon: <CheckCircleOutlined />, label: '已完成' },
  '已暂停': { color: '#d9d9d9', icon: <PauseCircleOutlined />, label: '已暂停' },
}

const DataDashboardTab = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    DataWarehouseService.getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading || !stats) {
    return (
      <Card>
        <Skeleton active paragraph={{ rows: 4 }} />
      </Card>
    )
  }

  const totalRecords = stats.totalRecords
  const bizMax = Math.max(...stats.businessDistribution.map((b) => b.records))
  const acqMax = Math.max(...stats.acquisitionDistribution.map((a) => a.records))

  return (
    <div className={styles.root}>
      {/* KPI 卡片行 */}
      <div className={styles.kpiRow}>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiInner}>
            <div className={styles.kpiIcon} style={{ background: 'rgba(47,84,235,0.08)', color: '#2f54eb' }}>
              <DatabaseOutlined style={{ fontSize: 18 }} />
            </div>
            <div className={styles.kpiText}>
              <div className={styles.kpiValue}>{totalRecords.toLocaleString()}</div>
              <div className={styles.kpiLabel}>总存储记录数（条）</div>
            </div>
          </div>
        </Card>

        <Card className={styles.kpiCard}>
          <div className={styles.kpiInner}>
            <div className={styles.kpiIcon} style={{ background: 'rgba(82,196,26,0.08)', color: '#52c41a' }}>
              <AppstoreOutlined style={{ fontSize: 18 }} />
            </div>
            <div className={styles.kpiText}>
              <div className={styles.kpiValue}>{stats.totalCategories}</div>
              <div className={styles.kpiLabel}>数据类别总数（个）</div>
            </div>
          </div>
        </Card>

        <Card className={styles.kpiCard}>
          <div className={styles.kpiInner}>
            <div className={styles.kpiIcon} style={{ background: 'rgba(114,46,209,0.08)', color: '#722ed1' }}>
              <CloudDownloadOutlined style={{ fontSize: 18 }} />
            </div>
            <div className={styles.kpiText}>
              <div className={styles.kpiValue}>{stats.totalPlatforms}</div>
              <div className={styles.kpiLabel}>覆盖数据来源（个平台）</div>
            </div>
          </div>
        </Card>

        <Card className={styles.kpiCard}>
          <div className={styles.kpiInner}>
            <div className={styles.kpiIcon} style={{ background: 'rgba(250,173,20,0.08)', color: '#faad14' }}>
              <SyncOutlined style={{ fontSize: 18 }} />
            </div>
            <div className={styles.kpiText}>
              <div className={styles.kpiValue}>{stats.activeCollectionTasks}</div>
              <div className={styles.kpiLabel}>启用中采集任务（个）</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 详情行：4 列 */}
      <div className={styles.detailRow}>
        {/* 各业务线数据体量 */}
        <Card className={styles.detailCard} title="各业务线数据体量">
          {stats.businessDistribution.map((item) => (
            <div key={item.type} className={styles.distItem}>
              <div className={styles.distHeader}>
                <span>
                  <span className={styles.distDot} style={{ background: businessColorMap[item.type] }} />
                  <Text style={{ fontSize: 12 }}>{item.type}</Text>
                </span>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {item.records.toLocaleString()} 条
                </Text>
              </div>
              <Progress
                percent={Math.round((item.records / bizMax) * 100)}
                strokeColor={businessColorMap[item.type]}
                showInfo={false}
                size="small"
              />
            </div>
          ))}
        </Card>

        {/* 获取方式分布 */}
        <Card className={styles.detailCard} title="数据获取方式分布">
          {stats.acquisitionDistribution.map((item) => (
            <div key={item.method} className={styles.distItem}>
              <div className={styles.distHeader}>
                <Tag
                  color={acquisitionColorMap[item.method]}
                  icon={acquisitionIconMap[item.method]}
                  style={{ marginBottom: 0, fontSize: 11 }}
                >
                  {item.method}
                </Tag>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  {item.records.toLocaleString()} 条
                </Text>
              </div>
              <Progress
                percent={Math.round((item.records / acqMax) * 100)}
                strokeColor={acquisitionStrokeMap[item.method]}
                showInfo={false}
                size="small"
              />
            </div>
          ))}
        </Card>

        {/* 近期入库更新 */}
        <Card className={styles.detailCard} title="近期入库更新">
          {stats.recentUpdates.slice(0, 5).map((item, idx) => (
            <div key={item.categoryId}>
              {idx > 0 && <Divider style={{ margin: '4px 0' }} />}
              <div className={styles.updateItem}>
                <div className={styles.updateLeft}>
                  <span className={styles.distDot} style={{ background: businessColorMap[item.businessType] }} />
                  <Text style={{ fontSize: 12 }} ellipsis>
                    {item.platformName}
                    <Text type="secondary" style={{ marginLeft: 4 }}>· {item.categoryName}</Text>
                  </Text>
                </div>
                <Text type="secondary" style={{ fontSize: 11, flexShrink: 0 }}>
                  {item.updatedAt.split(' ')[0]}
                </Text>
              </div>
            </div>
          ))}
        </Card>

        {/* 采集任务运行情况 */}
        <Card className={styles.detailCard} title="采集任务状态">
          <div className={styles.taskGrid}>
            {stats.taskStatusSummary.map((item) => {
              const cfg = taskStatusConfig[item.status] ?? { color: '#999', icon: null, label: item.status }
              return (
                <div key={item.status} className={styles.taskStatusItem}>
                  <Badge count={item.count} style={{ backgroundColor: cfg.color }} overflowCount={99} />
                  <div className={styles.taskStatusIcon} style={{ color: cfg.color }}>{cfg.icon}</div>
                  <Text style={{ fontSize: 11 }}>{cfg.label}</Text>
                </div>
              )
            })}
          </div>
          <div className={styles.taskTip}>
            <SyncOutlined style={{ color: '#52c41a', marginRight: 6, flexShrink: 0 }} />
            <Text type="secondary" style={{ fontSize: 11 }}>
              系统每日自动采集，如需扩展请前往「采集任务管理」。
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DataDashboardTab
