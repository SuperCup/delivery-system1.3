import { useState } from 'react'
import { Button, Modal, List, Avatar, Input, Card, Tag } from 'antd'
import { UserOutlined, SwapOutlined, SearchOutlined } from '@ant-design/icons'
import { useNavigate } from 'react-router-dom'
import type { ClientSummary } from '../../types/home'
import styles from './client-switcher.module.css'

type ClientSwitcherProps = {
  currentClientId: string
  clients: ClientSummary[]
  onClientChange?: (clientId: string) => void
}

export const ClientSwitcher = ({ currentClientId, clients, onClientChange }: ClientSwitcherProps) => {
  const navigate = useNavigate()
  const [modalVisible, setModalVisible] = useState(false)
  const [searchText, setSearchText] = useState('')

  const currentClient = clients.find((c) => c.id === currentClientId)

  const handleClientSelect = (clientId: string) => {
    setModalVisible(false)
    setSearchText('')
    if (onClientChange) {
      onClientChange(clientId)
    } else {
      // 默认跳转到新客户的总览页
      navigate(`/clients/${clientId}/overview`)
    }
  }

  const filteredClients = clients.filter((client) =>
    client.name.toLowerCase().includes(searchText.toLowerCase())
  )

  return (
    <div className={styles.switcher}>
      {currentClient && (
        <div className={styles.currentClient}>
          <div className={styles.clientHeader}>
            <div className={styles.clientMeta}>
              <Avatar size={40} icon={<UserOutlined />} className={styles.avatar} />
              <div className={styles.clientInfo}>
                <div className={styles.clientNameRow}>
                  <div className={styles.clientName}>{currentClient.name}</div>
                  <Button
                    type="text"
                    icon={<SwapOutlined />}
                    aria-label="切换客户"
                    onClick={() => setModalVisible(true)}
                    className={styles.switchIconButton}
                  />
                </div>
                <div className={styles.clientId}>ID: {currentClient.id}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      <Modal
        title="选择客户"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false)
          setSearchText('')
        }}
        footer={null}
        width={500}
      >
        <div className={styles.modalContent}>
          <Input
            placeholder="搜索客户名称"
            prefix={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            className={styles.searchInput}
          />
          <List
            className={styles.clientList}
            grid={{ gutter: 16, column: 2 }}
            dataSource={filteredClients}
            locale={{ emptyText: '未找到匹配的客户' }}
            renderItem={(client) => (
              <List.Item key={client.id}>
                <Card
                  hoverable
                  onClick={() => handleClientSelect(client.id)}
                  className={`${styles.clientCard} ${
                    client.id === currentClientId ? styles.activeCard : ''
                  }`}
                >
                  <div className={styles.cardHeader}>
                    <span className={styles.cardTitle}>{client.name}</span>
                    {client.id === currentClientId && <Tag color="processing">当前客户</Tag>}
                  </div>
                  <div className={styles.cardMeta}>
                    <span className={styles.cardMetaItem}>ID: {client.id}</span>
                    <span className={styles.cardMetaItem}>{client.business.length} 项业务</span>
                  </div>
                </Card>
              </List.Item>
            )}
          />
        </div>
      </Modal>
    </div>
  )
}

export default ClientSwitcher

