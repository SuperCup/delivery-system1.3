import { Button, Typography } from 'antd'
import { ArrowRightOutlined, UpOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styles from './intro-page.module.css'

const { Title } = Typography

interface SystemModule {
  systemName: string
  items: { name: string; link?: string }[]
  link?: string
}

interface ArchitectureLayer {
  title: string
  systems: SystemModule[]
  color: string
}

// 架构层级：从上到下显示，数据汇总方向从数据源到应用层
const architectureLayers: ArchitectureLayer[] = [
  {
    title: '应用层',
    systems: [
      {
        systemName: 'DSMCloud',
        link: 'https://dsmcloud.example.com',
        items: [
          { name: '标准看板', link: 'https://dsmcloud.example.com/standard' },
          { name: '定制看板', link: 'https://dsmcloud.example.com/custom' },
          { name: '数据资产', link: 'https://dsmcloud.example.com/assets' },
        ],
      },
    ],
    color: '#ff9800',
  },
  {
    title: '工具层',
    systems: [
      {
        systemName: '交付中台',
        link: '#',
        items: [
          { name: '数据关联', link: '#' },
          { name: '数据补充', link: '#' },
          { name: '数据分析', link: '#' },
          { name: '数据交付', link: '#' },
        ],
      },
      {
        systemName: '开发方',
        link: 'https://dev.example.com',
        items: [
          { name: '标准看板', link: 'https://dev.example.com/standard' },
          { name: '帆软/QBI', link: 'https://dev.example.com/qbi' },
        ],
      },
    ],
    color: '#8bc34a',
  },
  {
    title: '数据管理',
    systems: [
      {
        systemName: '数据中台',
        link: 'https://data-platform.example.com',
        items: [
          { name: '元数据管理', link: 'https://data-platform.example.com/metadata' },
          { name: '数据API接口', link: 'https://data-platform.example.com/api' },
        ],
      },
    ],
    color: '#5c6bc0',
  },
  {
    title: 'OLAP',
    systems: [
      {
        systemName: '数据仓库',
        link: '#',
        items: [
          { name: '大数据存储', link: '#' },
          { name: '数据清洗', link: '#' },
          { name: '数据计算', link: '#' },
        ],
      },
    ],
    color: '#5c6bc0',
  },
  {
    title: '数据源',
    systems: [
      {
        systemName: '',
        items: [
          { name: '小程序', link: 'https://miniprogram.example.com' },
          { name: 'H5活动', link: 'https://h5.example.com' },
          { name: '优惠券活动', link: 'https://coupon.example.com' },
          { name: '物码活动', link: 'https://qrcode.example.com' },
          { name: '智能导购', link: 'https://guide.example.com' },
          { name: '到家活动', link: 'https://home-delivery.example.com' },
          { name: '到家供给', link: 'https://supply.example.com' },
          { name: '彩页', link: 'https://flyer.example.com' },
          { name: 'PMS', link: 'https://pms.example.com' },
        ],
      },
    ],
    color: '#90caf9',
  },
]

export default function IntroPage() {
  const navigate = useNavigate()

  const handleItemClick = (link?: string) => {
    if (link && link !== '#') {
      window.open(link, '_blank')
    }
  }

  const handleEnterSystem = () => {
    navigate('/login')
  }

  return (
    <div className={styles.introContainer}>
      <div className={styles.contentWrapper}>
        {/* 标题区域 */}
        <div className={styles.headerSection}>
          <Title level={2} className={styles.mainTitle}>
            交付中台系统架构
          </Title>
        </div>

        {/* 架构图区域 */}
        <div className={styles.architectureSection}>
          {architectureLayers.map((layer, layerIndex) => (
            <div key={layer.title}>
              {/* 层级容器 */}
              <div className={styles.layerContainer}>
                {/* 左侧标签 */}
                <div className={styles.layerLabel}>
                  <div className={styles.layerTitle}>{layer.title}</div>
                </div>

                {/* 右侧系统区域 */}
                <div className={styles.systemsContainer}>
                  {layer.systems.map((system, sysIndex) => (
                    <div
                      key={system.systemName || sysIndex}
                      className={styles.systemGroup}
                      style={{ borderColor: layer.color }}
                    >
                      {/* 功能模块/能力 */}
                      <div className={styles.itemsContainer}>
                        {system.items.map((item) => (
                          <div
                            key={item.name}
                            className={`${styles.itemCard} ${
                              item.link && item.link !== '#' ? styles.clickable : ''
                            }`}
                            style={{ 
                              backgroundColor: system.systemName ? '#ffffff' : layer.color,
                              color: system.systemName ? layer.color : '#ffffff',
                              borderColor: layer.color,
                            }}
                            onClick={() => handleItemClick(item.link)}
                          >
                            {item.name}
                          </div>
                        ))}
                      </div>

                      {/* 系统名 */}
                      {system.systemName && (
                        <div
                          className={`${styles.systemName} ${
                            system.link && system.link !== '#' ? styles.clickable : ''
                          }`}
                          style={{ backgroundColor: layer.color }}
                          onClick={() => handleItemClick(system.link)}
                        >
                          {system.systemName}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 连接箭头 */}
              {layerIndex < architectureLayers.length - 1 && (
                <div className={styles.connector}>
                  <UpOutlined className={styles.connectorIcon} />
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 进入系统按钮 */}
        <div className={styles.actionSection}>
          <Button
            type="primary"
            size="large"
            icon={<ArrowRightOutlined />}
            onClick={handleEnterSystem}
            className={styles.enterButton}
          >
            进入系统
          </Button>
        </div>
      </div>
    </div>
  )
}
