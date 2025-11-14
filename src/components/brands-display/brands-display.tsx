import { Tag, Modal } from 'antd'
import { useState } from 'react'
import styles from './brands-display.module.css'

interface BrandsDisplayProps {
  brands: string[]
  maxDisplay?: number
}

export const BrandsDisplay = ({ brands, maxDisplay = 3 }: BrandsDisplayProps) => {
  const [modalVisible, setModalVisible] = useState(false)

  if (!brands || brands.length === 0) {
    return <span style={{ color: '#999' }}>—</span>
  }

  const displayBrands = brands.slice(0, maxDisplay)
  const remainingCount = brands.length - maxDisplay

  return (
    <>
      <div className={styles.brandsContainer}>
        {displayBrands.map((brand, index) => (
          <Tag key={index} className={styles.brandTag}>
            {brand}
          </Tag>
        ))}
        {remainingCount > 0 && (
          <Tag
            className={styles.moreTag}
            onClick={(e) => {
              e.stopPropagation()
              setModalVisible(true)
            }}
          >
            +{remainingCount}
          </Tag>
        )}
      </div>

      <Modal
        title="全部品牌"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={400}
      >
        <div className={styles.modalBrands}>
          {brands.map((brand, index) => (
            <Tag key={index} className={styles.brandTagLarge}>
              {brand}
            </Tag>
          ))}
        </div>
      </Modal>
    </>
  )
}

