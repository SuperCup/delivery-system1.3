import { useEffect, useState } from 'react'
import { Card, Skeleton, Tag, Typography, Progress, Divider, Badge } from 'antd'
import {
  DatabaseOutlined,
  ApiOutlined,
  CloudDownloadOutlined,
  SyncOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  PauseCircleOutlined,
  EditOutlined,
  StopOutlined,
} from '@ant-design/icons'
import { DataWarehouseService } from '../../services/data-warehouse-service'
import type { DashboardStats } from '../../types/data-warehouse'
import styles from './data-dashboard-tab.module.css'

const { Text, Title } = Typography

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

const taskStatusConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  '执行中': { color: '#52c41a', icon: <SyncOutlined spin />, label: '执行中' },
  '待复核': { color: '#faad14', icon: <ClockCircleOutlined />, label: '待复核' },
  '已完成': { color: '#1890ff', icon: <CheckCircleOutlined />, label: '已完成' },
  '已暂停': { color: '#d9d9d9', icon: <PauseCircleOutlined />, label: '已暂停' },
  '草稿': { color: '#bfbfbf', icon: <EditOutlined />, label: '草稿' },
  '已取消': { color: '#ff4d4f', icon: <StopOutlined />, label: '已取消' },
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
        <Skeleton active paragraph={{ rows: 8 }} />
      </Card>
    )
  }

  const totalRecords = stats.totalRecords
  const bizMax = Math.max(...stats.businessDistribution.map((b) => b.records))
  const acqMax = Math.max(...stats.acquisitionDistribution.map((a) => a.records))

  return (
    <div className={styles.root}>
      {/* KPI 卡片 */}
      <div className={styles.kpiRow}>
        <Card className={styles.kpiCard}>
          <div className={styles.kpiInner}>
            <div className={styles.kpiIcon} style={{ background: 'rgba(47,84,235,0.08)', color: '#2f54eb' }}>
              <DatabaseOutlined style={{ fontSize: 22 }} />
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
              <AppstoreOutlined style={{ fontSize: 22 }} />
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
              <CloudDownloadOutlined style={{ fontSize: 22 }} />
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
              <SyncOutlined style={{ fontSize: 22 }} />
            </div>
            <div className={styles.kpiText}>
              <div className={styles.kpiValue}>{stats.activeCollectionTasks}</div>
              <div className={styles.kpiLabel}>启用中采集任务（个）</div>
            </div>
          </div>
        </Card>
      </div>

      {/* 中部：业务线 + 获取方式 */}
      <div className={styles.midRow}>
        {/* 各业务线数据体量 */}
        <Card className={styles.midCard} title={<Title level={5} style={{ margin: 0 }}>各业务线数据体量</Title>}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
            按业务板块统计已入库的数据总量
          </Text>
          {stats.businessDistribution.map((item) => (
            <div key={item.type} className={styles.distItem}>
              <div className={styles.distHeader}>
                <span>
                  <span
                    className={styles.distDot}
                    style={{ background: businessColorMap[item.type] }}
                  />
                  <Text strong>{item.type}</Text>
                </span>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.categories} 类 · {item.records.toLocaleString()} 条
                </Text>
              </div>
              <Progress
                percent={Math.round((item.records / bizMax) * 100)}
                strokeColor={businessColorMap[item.type]}
                showInfo={false}
                size="small"
                style={{ marginBottom: 4 }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                占总量 {((item.records / totalRecords) * 100).toFixed(1)}%
              </Text>
            </div>
          ))}
        </Card>

        {/* 获取方式分布 */}
        <Card className={styles.midCard} title={<Title level={5} style={{ margin: 0 }}>数据获取方式分布</Title>}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
            按采集技术方案统计数据来源情况
          </Text>
          {stats.acquisitionDistribution.map((item) => (
            <div key={item.method} className={styles.distItem}>
              <div className={styles.distHeader}>
                <span>
                  <Tag
                    color={acquisitionColorMap[item.method]}
                    icon={acquisitionIconMap[item.method]}
                    style={{ marginRight: 8 }}
                  >
                    {item.method}
                  </Tag>
                </span>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  {item.categories} 类 · {item.records.toLocaleString()} 条
                </Text>
              </div>
              <Progress
                percent={Math.round((item.records / acqMax) * 100)}
                strokeColor={acquisitionColorMap[item.method] === 'blue' ? '#2f54eb' : acquisitionColorMap[item.method] === 'cyan' ? '#13c2c2' : '#722ed1'}
                showInfo={false}
                size="small"
                style={{ marginBottom: 4 }}
              />
              <Text type="secondary" style={{ fontSize: 11 }}>
                占总量 {((item.records / totalRecords) * 100).toFixed(1)}%
              </Text>
            </div>
          ))}
        </Card>
      </div>

      {/* 底部：近期更新 + 采集任务状态 */}
      <div className={styles.bottomRow}>
        {/* 近期数据更新 */}
        <Card className={styles.bottomCard} title={<Title level={5} style={{ margin: 0 }}>近期入库更新</Title>}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 12 }}>
            按最近更新时间排序，展示最新入库的数据集
          </Text>
          {stats.recentUpdates.map((item, idx) => (
            <div key={item.categoryId}>
              {idx > 0 && <Divider style={{ margin: '8px 0' }} />}
              <div className={styles.updateItem}>
                <div className={styles.updateLeft}>
                  <span
                    className={styles.distDot}
                    style={{ background: businessColorMap[item.businessType] }}
                  />
                  <div>
                    <Text strong style={{ fontSize: 13 }}>{item.platformName}</Text>
                    <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                      {item.categoryName}
                    </Text>
                  </div>
                </div>
                <Text type="secondary" style={{ fontSize: 12 }}>{item.updatedAt}</Text>
              </div>
            </div>
          ))}
        </Card>

        {/* 采集任务运行情况 */}
        <Card className={styles.bottomCard} title={<Title level={5} style={{ margin: 0 }}>采集任务运行情况</Title>}>
          <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 16 }}>
            当前所有采集任务的状态汇总
          </Text>
          <div className={styles.taskGrid}>
            {stats.taskStatusSummary.map((item) => {
              const cfg = taskStatusConfig[item.status] ?? { color: '#999', icon: null, label: item.status }
              return (
                <div key={item.status} className={styles.taskStatusItem}>
                  <Badge
                    count={item.count}
                    style={{ backgroundColor: cfg.color }}
                    overflowCount={99}
                  />
                  <div className={styles.taskStatusIcon} style={{ color: cfg.color }}>
                    {cfg.icon}
                  </div>
                  <Text style={{ fontSize: 13 }}>{cfg.label}</Text>
                </div>
              )
            })}
          </div>

          <Divider style={{ margin: '16px 0' }} />
          <div className={styles.taskTip}>
            <SyncOutlined style={{ color: '#52c41a', marginRight: 6 }} />
            <Text type="secondary" style={{ fontSize: 12 }}>
              系统每日自动采集并更新，确保数据及时入库。如需新增采集范围，
              请前往「采集任务管理」发起任务。
            </Text>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default DataDashboardTab
