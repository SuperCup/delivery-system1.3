import styles from './chart-card.module.css'

type ChartCardProps = {
  title: string
  value: number | string
}

export const ChartCard = ({ title, value }: ChartCardProps) => {
  return (
    <div className={styles.card}>
      <div className={styles.title}>{title}</div>
      <div className={styles.value}>{value}</div>
    </div>
  )
}

export default ChartCard