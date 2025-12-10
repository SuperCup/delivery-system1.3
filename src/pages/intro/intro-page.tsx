import { Typography } from 'antd'
import { ArrowRightOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styles from './intro-page.module.css'

const { Title } = Typography

interface LayerModule {
  name: string
  link?: string
}

interface RoleGroup {
  role: string
  modules: LayerModule[]
}

interface ArchitectureLayer {
  systemName: string
  roleGroups: RoleGroup[]
  layerName: string
  systemLink?: string
}

// 架构层级：从上到下
const architectureLayers: ArchitectureLayer[] = [
  {
    systemName: 'DSM Cloud',
    systemLink: 'https://dsmcloud-datacenter.netlify.app/',
    roleGroups: [
      {
        role: '客户',
        modules: [
          { name: '标准看板', link: 'https://dsmcloud-datacenter.netlify.app/' },
          { name: '定制看板', link: 'https://dsmcloud-datacenter.netlify.app/' },
          { name: '数据资产', link: 'https://dsmcloud-datacenter.netlify.app/' },
        ],
      },
    ],
    layerName: '应用层',
  },
  {
    systemName: '交付中台',
    systemLink: '/login',
    roleGroups: [
      {
        role: '运营/项目/业务人员',
        modules: [
          { name: '数据关联', link: '#' },
          { name: '数据补充', link: '#' },
          { name: '数据分析', link: '#' },
          { name: '数据交付', link: '#' },
        ],
      },
      {
        role: '数据/开发人员',
        modules: [
          { name: '标准看板', link: '#' },
          { name: '帆软/QBI', link: '#' },
        ],
      },
    ],
    layerName: '工具层',
  },
  {
    systemName: '数据中台',
    systemLink: 'https://op.ismartgo.cn/dcsv/h5/md/productset_readonly.html?rdp-mnu=home',
    roleGroups: [
      {
        role: '开发人员',
        modules: [
          { name: '元数据管理', link: 'https://op.ismartgo.cn/dcsv/h5/md/productset_readonly.html?rdp-mnu=home' },
          { name: '数据API接口', link: 'https://op.ismartgo.cn/dcsv/h5/md/productset_readonly.html?rdp-mnu=home' },
        ],
      },
    ],
    layerName: '数据管理',
  },
  {
    systemName: '数据仓库',
    roleGroups: [
      {
        role: '开发人员',
        modules: [
          { name: '大数据存储', link: '#' },
          { name: '数据清洗', link: '#' },
          { name: '数据计算', link: '#' },
        ],
      },
    ],
    layerName: 'OLAP',
  },
  {
    systemName: '业务系统',
    roleGroups: [
      {
        role: '',
        modules: [
          { name: '小程序', link: 'https://wx3.ismartgo.com/brandwxa/h5/selectapp.html?from=https%3A%2F%2Fwx3.ismartgo.com%2Fbrandwxa%2Fweb%2Frdp%2Fp%2Fapp%2Fmall%2Fmall_goods.html%3Frdp-mnu%3D130000097586' },
          { name: 'H5活动', link: 'https://dsmcloud.ismartgo.com/dsmcloud/home/index#60' },
          { name: '优惠券活动', link: 'https://op.ismartgo.cn/cpmanage/h5/overview.html?rdp-mnu=home' },
          { name: '物码活动', link: 'https://dsmcloud.ismartgo.com/dsmcloud/home/index#66' },
          { name: '智能导购', link: 'https://dsmcloud.ismartgo.com/dsmcloud/home/index#180' },
          { name: '到家活动', link: 'https://op.ismartgo.cn/edjweb/h5/home.html' },
          { name: '到家供给', link: 'https://sv.ismartgo.cn/djwin/h5/login.html#/djwin/web/rdp/p/task/census' },
          { name: '彩页', link: '#' },
          { name: 'PMS', link: 'https://op.ismartgo.cn/pms2/web/rdp/p/msg/overview.html?rdp-mnu=home' },
          { name: '其他', link: '#' },
        ],
      },
    ],
    layerName: '数据源',
  },
]

export default function IntroPage() {
  const navigate = useNavigate()

  const handleModuleClick = (link?: string) => {
    if (link && link !== '#' && !link.startsWith('/')) {
      window.open(link, '_blank')
    }
  }

  const handleSystemNameClick = (link?: string) => {
    if (link) {
      if (link.startsWith('/')) {
        navigate(link)
      } else {
        window.open(link, '_blank')
      }
    }
  }

  return (
    <div className={styles.introContainer}>
      <div className={styles.contentWrapper}>
        {/* 标题区域 */}
        <div className={styles.headerSection}>
          <Title level={2} className={styles.mainTitle}>
            交付中台数据架构
          </Title>
        </div>

        {/* 架构图区域 */}
        <div className={styles.architectureSection}>
          {architectureLayers.map((layer, layerIndex) => (
            <div key={layer.systemName}>
              {/* 层级行 */}
              <div className={`${styles.layerRow} ${styles[`layer-${layerIndex}`]}`}>
                {/* 左侧：系统名称 */}
                <div
                  className={`${styles.systemNameCard} ${
                    layer.systemLink ? styles.clickable : ''
                  }`}
                  onClick={() => handleSystemNameClick(layer.systemLink)}
                >
                  {layer.systemName}
                  {layer.systemLink && (
                    <ArrowRightOutlined className={styles.enterIcon} />
                  )}
                </div>

                {/* 中间：功能模块区域 */}
                <div className={styles.modulesArea}>
                  {layer.systemName === '交付中台' ? (
                    // 交付中台：两个角色同行
                    <div className={styles.toolLayerRow}>
                      {layer.roleGroups.map((roleGroup, idx) => (
                        <div key={idx} className={styles.roleGroupContainer}>
                          {/* 角色标签 */}
                          {roleGroup.role && (
                            <div className={styles.roleTag}>
                              {roleGroup.role}
                            </div>
                          )}
                          {/* 功能模块 */}
                          <div className={styles.modulesGrid}>
                            {roleGroup.modules.map((module) => (
                              <div
                                key={module.name}
                                className={`${styles.moduleCard} ${
                                  module.link && module.link !== '#' ? styles.clickable : ''
                                }`}
                                onClick={() => handleModuleClick(module.link)}
                              >
                                {module.name}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : layer.systemName === '业务系统' ? (
                    // 业务系统：分两行，每行5个
                    <div className={styles.businessSystemGrid}>
                      {layer.roleGroups[0].modules.map((module) => (
                        <div
                          key={module.name}
                          className={`${styles.moduleCard} ${
                            module.link && module.link !== '#' ? styles.clickable : ''
                          }`}
                          onClick={() => handleModuleClick(module.link)}
                        >
                          {module.name}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // 其他层级：原有布局
                    layer.roleGroups.map((roleGroup, idx) => (
                      <div key={idx} className={styles.roleGroupContainer}>
                        {/* 角色标签 */}
                        {roleGroup.role && (
                          <div className={styles.roleTag}>
                            {roleGroup.role}
                          </div>
                        )}
                        {/* 功能模块 */}
                        <div className={styles.modulesGrid}>
                          {roleGroup.modules.map((module) => (
                            <div
                              key={module.name}
                              className={`${styles.moduleCard} ${
                                module.link && module.link !== '#' ? styles.clickable : ''
                              }`}
                              onClick={() => handleModuleClick(module.link)}
                            >
                              {module.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* 右侧：层级名称 */}
                <div className={styles.layerNameCard}>
                  {layer.layerName}
                </div>
              </div>

              {/* 向上箭头 */}
              {layerIndex < architectureLayers.length - 1 && (
                <div className={styles.arrowUp}>
                  <svg width="60" height="30" viewBox="0 0 60 30">
                    <path d="M 30 0 L 30 25" stroke="#999" strokeWidth="2" fill="none"/>
                    <path d="M 20 10 L 30 0 L 40 10" stroke="#999" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
