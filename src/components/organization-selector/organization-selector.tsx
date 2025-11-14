import { useEffect, useState } from 'react'
import { Tree, Radio, Space, message } from 'antd'
import type { DataNode } from 'antd/es/tree'
import { OrganizationService } from '../../services/organization-service'
import type { OrgNode, VisibilityConfig } from '../../types/organization'
import styles from './organization-selector.module.css'

interface OrganizationSelectorProps {
  value?: VisibilityConfig
  onChange?: (value: VisibilityConfig) => void
}

export const OrganizationSelector = ({ value, onChange }: OrganizationSelectorProps) => {
  const [treeData, setTreeData] = useState<DataNode[]>([])
  const [visibilityType, setVisibilityType] = useState<'all' | 'custom'>(value?.type || 'all')
  const [checkedKeys, setCheckedKeys] = useState<React.Key[]>(value?.selectedIds || [])

  const loadOrgStructure = async () => {
    try {
      const data = await OrganizationService.getCompanyStructure()
      setTreeData([convertToTreeData(data)])
    } catch (error) {
      const err = error as Error
      message.error(`加载组织架构失败：${err.message}`)
    }
  }

  useEffect(() => {
    loadOrgStructure()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const convertToTreeData = (node: OrgNode): DataNode => {
    return {
      key: node.id,
      title: node.name,
      children: node.children?.map(convertToTreeData),
      icon: getNodeIcon(node.type),
    }
  }

  const getNodeIcon = (type: string) => {
    switch (type) {
      case 'company':
        return '🏢'
      case 'department':
        return '📁'
      case 'group':
        return '👥'
      case 'person':
        return '👤'
      default:
        return null
    }
  }

  const handleVisibilityTypeChange = (type: 'all' | 'custom') => {
    setVisibilityType(type)
    const newValue: VisibilityConfig = {
      type,
      selectedIds: type === 'all' ? [] : checkedKeys as string[],
    }
    onChange?.(newValue)
  }

  const handleCheck = (checked: React.Key[] | { checked: React.Key[]; halfChecked: React.Key[] }) => {
    const keys = Array.isArray(checked) ? checked : checked.checked
    setCheckedKeys(keys)
    if (visibilityType === 'custom') {
      onChange?.({
        type: 'custom',
        selectedIds: keys as string[],
      })
    }
  }

  return (
    <div className={styles.container}>
      <Radio.Group
        value={visibilityType}
        onChange={(e) => handleVisibilityTypeChange(e.target.value)}
        style={{ marginBottom: 16 }}
      >
        <Space direction="vertical">
          <Radio value="all">全公司可见</Radio>
          <Radio value="custom">指定可见范围</Radio>
        </Space>
      </Radio.Group>

      {visibilityType === 'custom' && treeData.length > 0 && (
        <div className={styles.treeContainer}>
          <Tree
            checkable
            defaultExpandAll
            checkedKeys={checkedKeys}
            onCheck={handleCheck}
            treeData={treeData}
            showIcon
          />
        </div>
      )}
    </div>
  )
}

