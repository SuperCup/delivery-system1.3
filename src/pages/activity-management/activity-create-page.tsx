import { useMemo, useState } from 'react'
import { Card, Form, Input, DatePicker, Select, Radio, Upload, Button, Typography, message } from 'antd'
import { InboxOutlined } from '@ant-design/icons'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './activity-create-page.module.css'
import SystemDatasetSelector from './components/system-dataset-selector'
import { useActivityCreate } from '../../hooks/use-activity-create'

const { Title, Text } = Typography

export default function ActivityCreatePage() {
  const location = useLocation()
  const navigate = useNavigate()
  const activeClientId = useMemo(() => new URLSearchParams(location.search).get('clientId') || '', [location.search])

  const {
    loading,
    platforms,
    setPlatforms,
    dataScopes,
    setScopeType,
    setScopeFile,
    setScopeSystemSelection,
    submit,
  } = useActivityCreate(activeClientId)

  const [form] = Form.useForm()
  const [publishNext, setPublishNext] = useState(false)

  if (!activeClientId) {
    return (
      <Card>
        <Text type="secondary">请先在导航栏选择客户再创建活动</Text>
      </Card>
    )
  }

  const platformOptions = [
    '微信', '支付宝', '抖音到店', '美团到店', '微信小店', '天猫校园',
  ]

  const [selectorPlatform, setSelectorPlatform] = useState<string | null>(null)

  return (
    <div className={styles.page}>
      <Title level={4}>新建活动</Title>

      <Card className={styles.card} title="基础信息" size="small">
        <Form form={form} layout="vertical" onFinish={async (v) => {
          const [start, end] = v.timeRange
          const id = await submit(
            {
              name: v.name,
              startTime: start.format('YYYY-MM-DD HH:mm:ss'),
              endTime: end.format('YYYY-MM-DD HH:mm:ss'),
              platforms: v.platforms,
              dataScopes,
            },
            publishNext,
          )
          setPublishNext(false)
          if (id) navigate(`/activity-management?clientId=${activeClientId}`)
        }}>
          <Form.Item
            name="name"
            label="活动名称"
            rules={[{ required: true, message: '请输入活动名称' }]}
            extra={<span className={styles.hint}>命名规范：品牌+年份/月份+主题（示例：2025年11月康师傅双十一狂欢活动）</span>}
          >
            <Input placeholder="例如：2025年11月康师傅双十一狂欢活动" />
          </Form.Item>
          <Form.Item name="timeRange" label="开始/结束时间" rules={[{ required: true, message: '请选择时间范围' }]}> 
            <DatePicker.RangePicker showTime />
          </Form.Item>
          <Form.Item name="platforms" label="活动平台" rules={[{ required: true, message: '请选择平台' }]}> 
            <Select
              mode="multiple"
              options={platformOptions.map((p) => ({ value: p, label: p }))}
              onChange={(vals: string[]) => setPlatforms(vals)}
            />
          </Form.Item>
        </Form>
      </Card>

      <Card className={styles.card} title="圈选数据范围" size="small">
        {platforms.length === 0 ? (
          <Text type="secondary">请选择活动平台后，按平台配置数据源或上传文件</Text>
        ) : (
          <div className={styles.scopeList}>
            {dataScopes.map((scope) => (
              <div className={styles.scopeItem} key={scope.platform}>
                <div>
                  <div className={styles.sectionTitle}>{scope.platform}</div>
                  <Text type="secondary">为该平台选择数据来源</Text>
                </div>
                <div className={styles.scopeRight}>
                  <Radio.Group
                    value={scope.sourceType}
                    onChange={(e) => setScopeType(scope.platform, e.target.value)}
                  >
                    <Radio value="system">系统数据集</Radio>
                    <Radio value="manual" disabled={['微信','支付宝'].includes(scope.platform)}>人工上传</Radio>
                  </Radio.Group>
                  {scope.sourceType === 'system' ? (
                    <div>
                      <Button onClick={() => setSelectorPlatform(scope.platform)}>选择数据集</Button>
                      {scope.systemSelection && (
                        <Text type="secondary" style={{ marginLeft: 8 }}>
                          已选：项目 {scope.systemSelection.projectIds.length} 个，批次 {scope.systemSelection.batchIds.length} 个
                        </Text>
                      )}
                    </div>
                  ) : (
                    <div>
                      <Upload.Dragger
                        multiple={false}
                        beforeUpload={(file) => {
                          setScopeFile(scope.platform, { name: file.name, size: file.size })
                          message.success(`已选择 ${file.name}`)
                          return false
                        }}
                        showUploadList={false}
                      >
                        <p className="ant-upload-drag-icon">
                          <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">点击或拖拽上传文件（CSV/XLSX）</p>
                        <p className="ant-upload-hint">
                          模板下载：<a href="/mock/templates/activity-dataset-template.csv" download>CSV 模板</a>
                        </p>
                      </Upload.Dragger>
                      {scope.fileName && (
                        <Text type="secondary">已选择文件：{scope.fileName}</Text>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card className={styles.card} size="small">
        <div className={styles.actions}>
          <Button onClick={() => navigate(`/activity-management?clientId=${activeClientId}`)}>取消</Button>
          <Button type="primary" loading={loading} onClick={() => { setPublishNext(false); form.submit() }}>保存</Button>
          <Button type="primary" loading={loading} onClick={() => { setPublishNext(true); form.submit() }}>保存并发布</Button>
        </div>
      </Card>

      {selectorPlatform && (
        <SystemDatasetSelector
          platform={selectorPlatform}
          open={!!selectorPlatform}
          onCancel={() => setSelectorPlatform(null)}
          onConfirm={(sel) => {
            setScopeSystemSelection(selectorPlatform, sel)
            setSelectorPlatform(null)
          }}
        />
      )}
    </div>
  )
}

// 移除内联样式按钮组件，使用模块样式 .actions