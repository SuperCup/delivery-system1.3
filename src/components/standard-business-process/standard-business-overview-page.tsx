import { Card, Row, Col, Tag, Button, Typography } from 'antd'
import { ShopOutlined, ShoppingOutlined, QrcodeOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import styles from './standard-business-overview-page.module.css'

type Props = { 
  onCreateProcess?: (business: string) => void
  variant?: 'standalone' | 'embedded'
}

export default function StandardBusinessOverviewPage({ onCreateProcess, variant = 'standalone' }: Props) {
  const { Title, Text, Link } = Typography
  const navigate = useNavigate()

  const platformTags = ['微信支付', '支付宝', '抖音本地生活', '美团团购']
  const privateDomainTags = ['小程序', '公众号', '企业微信', 'H5活动']
  const strategyTags = ['品牌直播', '零售直播', '平台直播', '达人投放', '内容制作']

  return (
    <div className={variant === 'embedded' ? styles.embeddedWrapper : styles.wrapper}>
      {variant === 'standalone' && (
        <div className={styles.header}>
          <Title level={5} className={styles.titleReset}>三大业务运行概览</Title>
          <Button type="link" size="small">业务指标配置</Button>
        </div>
      )}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={12} lg={8}>
          <Card 
            className={styles.card} 
            hoverable 
            bordered={false}
            onClick={() => navigate('/business-process/daodian')}
            style={{ cursor: 'pointer' }}
          >
            <div className={styles.cardHeader}>
              <div className={styles.iconPrimary}><ShopOutlined /></div>
              <div className={styles.titleBlock}>
                <Title level={5} className={styles.titleReset}>到店营销</Title>
                <Link onClick={(e) => {
                  e.stopPropagation()
                  navigate('/business-process/daodian')
                }} className={styles.subLink}>点击查看详细流程 →</Link>
              </div>
            </div>
            <div className={styles.desc}>通过微信支付、支付宝、抖音本地生活、美团团购在商超便利渠道，传统小店渠道发放优惠券并完成支付核销的业务</div>
            <div className={styles.section}>
              <Text type="secondary" className={styles.sectionTitle}>涉及平台</Text>
              <div className={styles.tagsRow}>
                {platformTags.map(t => (
                  <Tag key={t} className={styles.tag} color="blue">{t}</Tag>
                ))}
              </div>
            </div>
            <div className={styles.section}>
              <Text type="secondary" className={styles.sectionTitle}>品牌私域开发</Text>
              <div className={styles.tagsRow}>
                {privateDomainTags.map(t => (
                  <Tag key={t} className={styles.tag} color="green">{t}</Tag>
                ))}
              </div>
            </div>
            <div className={styles.section}>
              <Text type="secondary" className={styles.sectionTitle}>投放渠道规划</Text>
              <div className={styles.tagsRow}>
                {strategyTags.map(t => (
                  <Tag key={t} className={styles.tag} color="purple">{t}</Tag>
                ))}
              </div>
            </div>
            <Button type="primary" size="middle" className={styles.fullBtn} onClick={() => onCreateProcess?.('到店营销')}>创建流程</Button>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className={`${styles.card} ${styles.disabledCard}`} bordered={false}>
            <div className={styles.cardHeader}>
              <div className={styles.iconMuted}><ShoppingOutlined /></div>
              <div className={styles.titleBlock}>
                <div className={styles.titleRow}>
                  <Title level={5} className={styles.titleReset}>即时零售</Title>
                  <Text type="secondary" className={styles.mutedNote}>暂未开放</Text>
                </div>
              </div>
            </div>
            
            <div className={styles.placeholderText}>XXX</div>
            
            <div className={styles.section}>
              <Text className={styles.mutedTitle}>核心能力</Text>
              <div className={styles.mutedBullets}>
                <span className={styles.mutedItem}>XXX</span>
                <span className={styles.mutedItem}>XXX</span>
                <span className={styles.mutedItem}>XXX</span>
                <span className={styles.mutedItem}>XXX</span>
              </div>
            </div>
            
            <div className={styles.section}>
              <Text className={styles.mutedTitle}>运营效果</Text>
              <div className={styles.mutedList}>
                <div className={styles.mutedListRow}>
                  <span>· XXX</span>
                  <span>· XXX</span>
                </div>
                <div className={styles.mutedListRow}>
                  <span>· XXX</span>
                  <span>· XXX</span>
                </div>
              </div>
            </div>
            
            <Button disabled className={styles.awaitBtn}>敬请期待</Button>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={8}>
          <Card className={`${styles.card} ${styles.disabledCard}`} bordered={false}>
            <div className={styles.cardHeader}>
              <div className={styles.iconMuted}><QrcodeOutlined /></div>
              <div className={styles.titleBlock}>
                <div className={styles.titleRow}>
                  <Title level={5} className={styles.titleReset}>物码营销</Title>
                  <Text type="secondary" className={styles.mutedNote}>暂未开放</Text>
                </div>
              </div>
            </div>
            
            <div className={styles.placeholderText}>XXX</div>
            
            <div className={styles.section}>
              <Text className={styles.mutedTitle}>核心能力</Text>
              <div className={styles.mutedBullets}>
                <span className={styles.mutedItem}>XXX</span>
                <span className={styles.mutedItem}>XXX</span>
                <span className={styles.mutedItem}>XXX</span>
                <span className={styles.mutedItem}>XXX</span>
              </div>
            </div>
            
            <div className={styles.section}>
              <Text className={styles.mutedTitle}>运营效果</Text>
              <div className={styles.mutedList}>
                <div className={styles.mutedListRow}>
                  <span>· XXX</span>
                  <span>· XXX</span>
                </div>
                <div className={styles.mutedListRow}>
                  <span>· XXX</span>
                  <span>· XXX</span>
                </div>
              </div>
            </div>
            
            <Button disabled className={styles.awaitBtn}>敬请期待</Button>
          </Card>
        </Col>
      </Row>
    </div>
  )
}
