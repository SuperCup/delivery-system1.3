import styles from './system-logo.module.css'
import systemLogo from '../../assets/systemlogo.png'

interface SystemLogoProps {
  size?: 'small' | 'default' | 'large' // logo尺寸
  onClick?: () => void // 点击事件
}

export function SystemLogo({ size = 'default', onClick }: SystemLogoProps) {
  return (
    <div className={`${styles.logoSection} ${styles[size]}`} onClick={onClick} style={{ cursor: onClick ? 'pointer' : 'default' }}>
      <img src={systemLogo} alt="系统Logo" className={styles.logoImage} />
    </div>
  )
}

