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
  Select,
  Popconfirm,
  Typography,
  Breadcrumb,
  Tag,
} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import {
  SearchOutlined,
  ReloadOutlined,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons'
import { useParams, useNavigate } from 'react-router-dom'
import type { SubBrand } from '../../../../types/client-account'
import { SubBrandService } from '../../../../services/sub-brand-service'
import { ClientAccountService } from '../../../../services/client-account-service'
import styles from './client-account-page.module.css'

const { Text } = Typography

const platforms = ['美团闪购', '淘宝闪购', '京东到家', '饿了么']

export default function SubBrandPage() {
  const { clientId } = useParams<{ clientId?: string }>()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [subBrands, setSubBrands] = useState<SubBrand[]>([])
  const [brands, setBrands] = useState<Array<{ id: string; name: string }>>([])
  const [searchText, setSearchText] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingSubBrand, setEditingSubBrand] = useState<SubBrand | null>(null)
  const [form] = Form.useForm<{ platform: string; brandId: string; subBrandName: string }>()

  useEffect(() => {
    if (clientId) {
      loadSubBrands()
      loadBrands()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clientId])

  const loadSubBrands = async () => {
    if (!clientId) return
    setLoading(true)
    try {
      const data = await SubBrandService.getSubBrands(clientId)
      setSubBrands(data)
    } catch (error) {
      const err = error as Error
      message.error(`加载子品牌列表失败：${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadBrands = async () => {
    if (!clientId) return
    try {
      const data = await ClientAccountService.getClientBrands(clientId)
      setBrands(data)
    } catch (error) {
      console.error('加载品牌列表失败:', error)
    }
  }

  const filteredSubBrands = subBrands.filter(
    (subBrand) =>
      subBrand.platform.toLowerCase().includes(searchText.toLowerCase()) ||
      subBrand.brandName.toLowerCase().includes(searchText.toLowerCase()) ||
      subBrand.subBrandName.toLowerCase().includes(searchText.toLowerCase()),
  )

  const handleCreate = () => {
    form.resetFields()
    setEditingSubBrand(null)
    setModalOpen(true)
  }

  const handleEdit = (subBrand: SubBrand) => {
    setEditingSubBrand(subBrand)
    form.setFieldsValue({
      platform: subBrand.platform,
      brandId: subBrand.brandId,
      subBrandName: subBrand.subBrandName,
    })
    setModalOpen(true)
  }

  const handleSubmit = async () => {
    if (!clientId) return
    try {
      const values = await form.validateFields()
      if (editingSubBrand) {
        await SubBrandService.updateSubBrand(
          clientId,
          editingSubBrand.id,
          values.platform,
          values.brandId,
          values.subBrandName,
        )
        message.success('子品牌更新成功')
      } else {
        await SubBrandService.createSubBrand(
          clientId,
          values.platform,
          values.brandId,
          values.subBrandName,
        )
        message.success('子品牌创建成功')
      }
      setModalOpen(false)
      form.resetFields()
      setEditingSubBrand(null)
      await loadSubBrands()
    } catch (error) {
      const err = error as { errorFields?: unknown }
      if (err?.errorFields) return
      const errorMessage = error instanceof Error ? error.message : '操作失败'
      message.error(`操作失败：${errorMessage}`)
    }
  }

  const handleDelete = async (subBrand: SubBrand) => {
    if (!clientId) return
    try {
      await SubBrandService.deleteSubBrand(clientId, subBrand.id)
      message.success('删除成功')
      await loadSubBrands()
    } catch (error) {
      const err = error as Error
      message.error(`删除失败：${err.message}`)
    }
  }

  const columns: ColumnsType<SubBrand> = [
    {
      title: '平台',
      dataIndex: 'platform',
      key: 'platform',
      width: 150,
      render: (platform: string) => <Tag color="blue">{platform}</Tag>,
    },
    {
      title: '品牌',
      dataIndex: 'brandName',
      key: 'brandName',
      width: 150,
    },
    {
      title: '子品牌名称',
      dataIndex: 'subBrandName',
      key: 'subBrandName',
      width: 200,
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
      render: (_: unknown, record: SubBrand) => (
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
            title="确定要删除该子品牌吗？"
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
            title: '子品牌管理',
          },
        ]}
      />
      <div className={styles.pageHeader}>
        <Text strong style={{ fontSize: 18 }}>
          子品牌管理
        </Text>
        <Space>
          <Input
            placeholder="搜索平台、品牌或子品牌名称"
            prefix={<SearchOutlined />}
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 300 }}
          />
          <Button icon={<ReloadOutlined />} onClick={loadSubBrands}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleCreate}>
            新建子品牌
          </Button>
        </Space>
      </div>

      <Card>
        <Table
          rowKey="id"
          loading={loading}
          columns={columns}
          dataSource={filteredSubBrands}
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
        title={editingSubBrand ? '编辑子品牌' : '新建子品牌'}
        open={modalOpen}
        onCancel={() => {
          setModalOpen(false)
          form.resetFields()
          setEditingSubBrand(null)
        }}
        onOk={handleSubmit}
        okText={editingSubBrand ? '保存' : '创建'}
        cancelText="取消"
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="platform"
            label="平台"
            rules={[{ required: true, message: '请选择平台' }]}
          >
            <Select placeholder="请选择平台">
              {platforms.map((p) => (
                <Select.Option key={p} value={p}>
                  {p}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="brandId"
            label="品牌"
            rules={[{ required: true, message: '请选择品牌' }]}
          >
            <Select placeholder="请选择品牌">
              {brands.map((b) => (
                <Select.Option key={b.id} value={b.id}>
                  {b.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>
          <Form.Item
            name="subBrandName"
            label="子品牌名称"
            rules={[{ required: true, message: '请输入子品牌名称' }]}
          >
            <Input placeholder="请输入子品牌名称（如：脉动）" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}

