import { useEffect, useState } from 'react'
import { Card, List, Tag, Button } from 'antd'
import { getTools } from '../../services/tools-market-service'
import type { ToolItem } from '../../types/tools'

const ToolsMarketPage = () => {
  const [tools, setTools] = useState<ToolItem[]>([])

  useEffect(() => {
    getTools().then(setTools)
  }, [])

  return (
    <Card title="工具市场" extra={<div>公司内部插件与本地工具集合</div>}>
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 4 }}
        dataSource={tools}
        renderItem={(item) => (
          <List.Item>
            <Card title={item.name} bordered>
              <div style={{ marginBottom: 8 }}>分类：<Tag>{item.category}</Tag></div>
              <div style={{ marginBottom: 12 }}>状态：
                <Tag color={item.status === '已内置' ? 'green' : 'blue'}>{item.status}</Tag>
              </div>
              <Button type="primary" disabled={item.status === '已内置'}>
                安装
              </Button>
            </Card>
          </List.Item>
        )}
      />
    </Card>
  )
}

export default ToolsMarketPage