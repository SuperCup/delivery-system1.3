import { useEffect, useState } from 'react'
import {
  Card,
  Table,
  Button,
  Space,
  Input,
  message,
  Modal,
  Form,
  Popconfirm,
  Typography,
  TreeSelect,
  Breadcrumb,
  Upload,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UploadOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import type { BusinessRegionMapping, Province } from '../../../../types/business-region'
import { BusinessRegionService } from '../../../../services/business-region-service'
import styles from './client-account-page.module.css'

const { Text } = Typography

export default function BusinessRegionPage() {
  const { clientId } = useParams<{ clientId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [regions, setRegions] = useState<BusinessRegionMapping[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [searchText, setSearchText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [batchModalOpen, setBatchModalOpen] = useState(false)
  const [editingRegion, setEditingRegion] = useState<BusinessRegionMapping | null>(null)
  const [form] = Form.useForm<{ regionName: string; cityCodes: string[] }>()
  const [batchForm] = Form.useForm<{ file: FileList }>()

  useEffect(() => {
    if (clientId) {
      loadRegions()
      loadProvinces()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const loadRegions = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const data = await BusinessRegionService.getBusinessRegionMappings(clientId)
      setRegions(data)
    } catch (error) {
      const err = error as Error
      message.error(`加载业务区域失败：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadProvinces = async () => {
    try {
      const data = await BusinessRegionService.getProvincesAndCities()
      setProvinces(data)
    } catch (error) {
      console.error('加载省份城市失败:', error)
    }
  }

  const filteredRegions = regions.filter((region) =>
    region.regionName.toLowerCase().includes(searchText.toLowerCase()),
  )

  // 构建树形选择器数据
  const treeData = provinces.map((province) => ({
    title: province.name,
    value: province.code,
    key: province.code,
    children: province.cities.map((city) => ({
      title: city.name,
      value: `${province.code}-${city.code}`,
      key: `${province.code}-${city.code}`,
    })),
  }))

  const handleCreate = () => {
    form.resetFields()
    setEditingRegion(null)
    setModalOpen(true)
  }

  const handleEdit = (region: BusinessRegionMapping) => {
    setEditingRegion(region)
    form.setFieldsValue({
      regionName: region.regionName,
      cityCodes: region.cityCodes,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!clientId) return
    try {
      const values = await form.validateFields()
      if (editingRegion) {
        await BusinessRegionService.updateBusinessRegionMapping(
          clientId,
          editingRegion.id,
          values.regionName,
          values.cityCodes,
        )
        message.success('业务区域更新成功')
      } else {
        await BusinessRegionService.createBusinessRegionMapping(
          clientId,
          values.regionName,
          values.cityCodes,
        )
        message.success('业务区域创建成功')
      }
      setModalOpen(false)
      form.resetFields()
      setEditingRegion(null)
      await loadRegions()
    } catch (error) {
      const err = error as { errorFields?: unknown }
      if (err?.errorFields) return
      const errorMessage = error instanceof Error ? error.message : '操作失败'
      message.error(`操作失败：${errorMessage}`)
    }
  }

  const handleDelete = async (region: BusinessRegionMapping) => {
    if (!clientId) return
    try {
      await BusinessRegionService.deleteBusinessRegionMapping(clientId, region.id)
      message.success('删除成功')
      await loadRegions()
    } catch (error) {
      const err = error as Error
      message.error(`删除失败：${err.message}`)
    }
  }

  const handleBatchCreate = () => {
    batchForm.resetFields()
    setBatchModalOpen(true)
  }

  const handleBatchSubmit = async () => {
    if (!clientId) return
    try {
      const values = await batchForm.validateFields()
      const file = values.file?.[0]
      if (!file) {
        message.error('请选择文件')
        return
      }

      // 读取文件内容
      const text = await file.text()
      const lines = text.split('\n').filter((line) => line.trim())

      const newRegions: Array<{ regionName: string; cityCodes: string[] }> = []
      const duplicateNames: string[] = []

      for (const line of lines) {
        const [regionName, ...cityCodeStrs] = line.split(',').map((s) => s.trim())
        if (!regionName) continue

        // 检查是否已存在同名区域
        if (regions.some((r) => r.regionName === regionName)) {
          duplicateNames.push(regionName)
          continue
        }

        // 解析城市代码
        const cityCodes = cityCodeStrs.filter(Boolean)
        if (cityCodes.length > 0) {
          newRegions.push({ regionName, cityCodes })
        }
      }

      if (duplicateNames.length > 0) {
        message.warning(`以下区域名称已存在，已跳过：${duplicateNames.join('、')}`)
      }

      if (newRegions.length === 0) {
        message.warning('没有可导入的区域')
        return
      }

      // 批量创建
      for (const region of newRegions) {
        await BusinessRegionService.createBusinessRegionMapping(
          clientId,
          region.regionName,
          region.cityCodes,
        )
      }

      message.success(`成功导入 ${newRegions.length} 个业务区域`)
      setBatchModalOpen(false)
      batchForm.resetFields()
      await loadRegions()
    } catch (error) {
      const err = error as { errorFields?: unknown }
      if (err?.errorFields) return
      const errorMessage = error instanceof Error ? error.message : '导入失败'
      message.error(`导入失败：${errorMessage}`)
    }
  }

  const getCityNames = (cityCodes: string[]): string[] => {
    const cityNames: string[] = []
    cityCodes.forEach((code) => {
      const [provinceCode, cityCode] = code.split('-')
      const province = provinces.find((p) => p.code === provinceCode)
      if (province) {
        const city = province.cities.find((c) => c.code === cityCode)
        if (city) {
          cityNames.push(`${province.name}-${city.name}`)
        }
      }
    })
    return cityNames
  }

  const columns: ColumnsType<BusinessRegionMapping> = [
    {
      title: '区域名称',
      dataIndex: 'regionName',
      key: 'regionName',
      width: 200,
    },
    {
      title: '包含城市',
      dataIndex: 'cityCodes',
      key: 'cityCodes',
      render: (cityCodes: string[]) => {
        const cityNames = getCityNames(cityCodes)
        return (
          <Space wrap>
            {cityNames.map((name, idx) => (
              <Text key={idx} type="secondary">
                {name}
              </Text>
            ))}
          </Space>
        )
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_: unknown, record: BusinessRegionMapping) => (
        <Space>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定要删除该业务区域吗？"
            onConfirm={() => handleDelete(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" danger size="small" icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <Breadcrumb
        style={{ marginBottom: 16 }}
        items={[
          {
            title: (
              <a onClick={() => navigate(`/clients/${clientId}/account`)}>客户账号</a>
            ),
          },
          {
            title: '业务区域管理',
          },
        ]}
      />
      <div className={styles.pageHeader}>
        <Text strong style={{ fontSize: 18 }}>
          业务区域管理
        </Text>
        <Space>
          <Input
            placeholder="搜索区域名称"
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<ReloadOutlined />} onClick={loadRegions}>
            刷新
          </Button>
          <Button icon={<UploadOutlined />} onClick={handleBatchCreate}>
            批量导入
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建区域
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredRegions}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total) => `共 ${total} 条`,
          }}
        />
      </Card>

      {/* 新建/编辑弹窗 */}
      <Modal
        title={editingRegion ? '编辑业务区域' : '新建业务区域'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
          setEditingRegion(null)
        }}
        onOk={handleSubmit}
        okText={editingRegion ? '保存' : '创建'}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="regionName"
            label="区域名称"
            rules={[{ required: true, message: '请输入区域名称' }]}
          >
            <Input placeholder="请输入区域名称（如：华中大区）" />
          </Form.Item>
          <Form.Item
            name="cityCodes"
            label="包含城市"
            rules={[{ required: true, message: '请至少选择一个城市' }]}
            extra="最小颗粒度为地级市，可多选"
          >
            <TreeSelect
              treeData={treeData}
              placeholder="请选择城市"
              multiple
              showSearch
              treeCheckable
              allowClear
              style={{ width: '100%' }}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 批量导入弹窗 */}
      <Modal
        title="批量导入业务区域"
        open={batchModalOpen}
        onCancel={() => {
          setBatchModalOpen(false)
          batchForm.resetFields()
        }}
        onOk={handleBatchSubmit}
        okText="导入"
        cancelText="取消"
        width={600}
      >
        <Form form={batchForm} layout="vertical">
          <Form.Item
            name="file"
            label="上传文件"
            rules={[{ required: true, message: '请选择文件' }]}
            extra="文件格式：CSV，每行格式为：区域名称,城市代码1,城市代码2,...（如：华中大区,HN-ZZ,HN-LY）"
          >
            <Upload.Dragger
              beforeUpload={() => false}
              accept=".csv,.txt"
              maxCount={1}
            >
              <p className="ant-upload-drag-icon">
                <UploadOutlined />
              </p>
              <p className="ant-upload-text">点击或拖拽文件到此区域上传</p>
              <p className="ant-upload-hint">支持 CSV、TXT 格式</p>
            </Upload.Dragger>
          </Form.Item>
          <div style={{ marginTop: 16, padding: 12, background: '#f5f5f5', borderRadius: 4 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              说明：
              <br />
              1. 同名业务区域不允许重复导入，已存在的区域将被跳过
              <br />
              2. 城市代码格式：省份代码-城市代码（如：HN-ZZ 表示河南-郑州）
              <br />
              3. 每行一个区域，多个城市用逗号分隔
            </Text>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

