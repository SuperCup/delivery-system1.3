import { useEffect, useMemo, useState } from 'react'
import { Modal, Input, Radio, Button, Tree, Typography, message } from 'antd'
import { getSystemDatasetsByPlatform } from '../../../services/data-center-service'
import type { SystemDatasetProject } from '../../../types/data-center'
import styles from './system-dataset-selector.module.css'

type Mode = 'project' | 'batch'

export type SystemDatasetSelectorProps = {
  platform: string
  open: boolean
  onCancel: () => void
  onConfirm: (sel: { projectIds: string[]; batchIds: string[] }) => void
}

export default function SystemDatasetSelector({ platform, open, onCancel, onConfirm }: SystemDatasetSelectorProps) {
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState<SystemDatasetProject[]>([])
  const [mode, setMode] = useState<Mode>('project')
  const [search, setSearch] = useState('')
  const [checkedKeys, setCheckedKeys] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    getSystemDatasetsByPlatform(platform)
      .then((list) => setProjects(list))
      .catch((e) => message.error(`加载系统数据集失败：${e.message}`))
      .finally(() => setLoading(false))
  }, [open, platform])

  const treeData = useMemo(() => {
    const match = (txt: string) => (search ? txt.toLowerCase().includes(search.toLowerCase()) : true)
    return projects.map((p) => ({
      key: `P:${p.id}`,
      title: `${p.id}`,
      selectable: false,
      disableCheckbox: mode === 'batch',
      children: p.batches
        .filter((b) => match(b.id) || match(b.code) || match(b.name) || match(p.id))
        .map((b) => ({ key: `B:${b.id}`, title: `${b.code}`, disableCheckbox: mode === 'project' })),
    }))
  }, [projects, search, mode])

  const summary = useMemo(() => {
    const projIds = checkedKeys.filter((k) => k.startsWith('P:')).map((k) => k.slice(2))
    const batchIds = checkedKeys.filter((k) => k.startsWith('B:')).map((k) => k.slice(2))
    return { projIds, batchIds }
  }, [checkedKeys])

  return (
    <Modal open={open} title={`选择系统数据集（${platform}）`} onCancel={onCancel} onOk={() => onConfirm({ projectIds: summary.projIds, batchIds: summary.batchIds })} confirmLoading={loading} width={720}>
      <div className={styles.modalBody}>
        <div className={styles.left}>
          <Typography.Text type="secondary">层级结构：项目 → 批次</Typography.Text>
        </div>
        <div className={styles.right}>
          <div className={styles.toolbar}>
            <Radio.Group value={mode} onChange={(e) => setMode(e.target.value)}>
              <Radio.Button value="project">按项目选择</Radio.Button>
              <Radio.Button value="batch">按批次筛选</Radio.Button>
            </Radio.Group>
            <Input.Search allowClear placeholder={mode === 'project' ? '按项目ID搜索，例如 SG-2025008' : '按批次编码搜索'} value={search} onChange={(e) => setSearch(e.target.value)} style={{ width: 280 }} />
            <Button onClick={() => setCheckedKeys([])}>清空</Button>
          </div>
          <Tree
            checkable
            treeData={treeData}
            checkedKeys={checkedKeys}
            onCheck={(keys: any) => setCheckedKeys(keys as string[])}
            height={360}
          />
          <div className={styles.summary}>
            已选：项目 {summary.projIds.length} 个，批次 {summary.batchIds.length} 个
          </div>
        </div>
      </div>
    </Modal>
  )
}