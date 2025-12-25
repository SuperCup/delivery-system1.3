import { useEffect, useMemo, useState } from 'react'
import {
  Button,
  Card,
  message,
  Table,
  Space,
  Drawer,
  Form,
  Input,
  Select,
  Tag,
  Radio,
  DatePicker,
  Upload,
  Popconfirm,
  Empty,
} from 'antd'
import { useLocation, useParams } from 'react-router-dom'
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  FolderOutlined,
  FileOutlined,
  UploadOutlined,
  FolderAddOutlined,
  UserAddOutlined,
  DownloadOutlined,
  EyeOutlined,
} from '@ant-design/icons'
import type { ColumnsType } from 'antd/es/table'
import type { UploadFile, RcFile } from 'antd/es/upload/interface'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import type { FileDeliveryTask, DeliveryFile, AuthorizedUser } from '../../../../types/file-delivery'
import type { BusinessType } from '../../../../types/client'
import { FileDeliveryService } from '../../../../services/file-delivery-service'
import { ClientActivityService } from '../../../../services/client-activity-service'
import type { Contact } from '../../../../types/client'

const { TextArea } = Input
const { RangePicker } = DatePicker

const businessTypeOptions: BusinessType[] = ['到店营销', '即时零售', '物码营销']

export default function ClientFileDeliveryPage() {
  const location = useLocation()
  const { clientId: routeClientId } = useParams<{ clientId?: string }>()
  const clientId = useMemo(
    () => new URLSearchParams(location.search).get('clientId') || routeClientId || '',
    [location.search, routeClientId],
  )

  const [tasks, setTasks] = useState<FileDeliveryTask[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(false)
  const [productFilter, setProductFilter] = useState<BusinessType | '全部'>('全部')
  const [searchKeyword, setSearchKeyword] = useState('')

  // 任务表单相关
  const [taskDrawerVisible, setTaskDrawerVisible] = useState(false)
  const [editingTask, setEditingTask] = useState<FileDeliveryTask | null>(null)
  const [validityType, setValidityType] = useState<'permanent' | 'range'>('permanent')
  const [taskForm] = Form.useForm()

  // 文件管理相关
  const [fileDrawerVisible, setFileDrawerVisible] = useState(false)
  const [currentTaskId, setCurrentTaskId] = useState<string | null>(null)
  const [files, setFiles] = useState<DeliveryFile[]>([])
  const [currentFolderId, setCurrentFolderId] = useState<string | undefined>(undefined)
  const [folderName, setFolderName] = useState('')
  const [showFolderInput, setShowFolderInput] = useState(false)
  const [fileList, setFileList] = useState<UploadFile[]>([])

  // 授权用户相关
  const [authDrawerVisible, setAuthDrawerVisible] = useState(false)
  const [authTaskId, setAuthTaskId] = useState<string | null>(null)
  const [authorizedUsers, setAuthorizedUsers] = useState<AuthorizedUser[]>([])
  const [authForm] = Form.useForm()

  useEffect(() => {
    if (!clientId) return
    const loadData = async () => {
      setLoading(true)
      try {
        const [tasksData, contactsData] = await Promise.all([
          FileDeliveryService.getTasks(clientId, productFilter === '全部' ? undefined : productFilter),
          ClientActivityService.getClientContacts(clientId),
        ])
        setTasks(tasksData)
        setContacts(contactsData)
      } catch (error) {
        const err = error as Error
        message.error(`加载数据失败：${err.message}`)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [clientId, productFilter])

  // 加载文件列表
  useEffect(() => {
    if (!currentTaskId || !fileDrawerVisible) return
    const loadFiles = async () => {
      try {
        const filesData = await FileDeliveryService.getFiles(currentTaskId, currentFolderId)
        setFiles(filesData)
      } catch {
        message.error('加载文件列表失败')
      }
    }
    loadFiles()
  }, [currentTaskId, fileDrawerVisible, currentFolderId])

  // 加载授权用户列表
  useEffect(() => {
    if (!authTaskId || !authDrawerVisible) return
    const loadUsers = async () => {
      try {
        const users = await FileDeliveryService.getAuthorizedUsers(authTaskId)
        setAuthorizedUsers(users)
      } catch {
        message.error('加载授权用户列表失败')
      }
    }
    loadUsers()
  }, [authTaskId, authDrawerVisible])

  // 筛选任务
  const filteredTasks = useMemo(() => {
    let filtered = tasks
    if (searchKeyword) {
      filtered = filtered.filter((task) => task.name.includes(searchKeyword))
    }
    return filtered
  }, [tasks, searchKeyword])

  // 创建任务
  const handleCreateTask = () => {
    setEditingTask(null)
    setValidityType('permanent')
    taskForm.resetFields()
    taskForm.setFieldsValue({
      validity: '永久',
    })
    setTaskDrawerVisible(true)
  }

  // 编辑任务
  const handleEditTask = (record: FileDeliveryTask) => {
    setEditingTask(record)
    if (record.validity === '永久') {
      setValidityType('permanent')
      taskForm.setFieldsValue({
        name: record.name,
        product: record.product,
        validity: '永久',
        description: record.description,
        visibleUsers: record.visibleUsers,
      })
    } else {
      setValidityType('range')
      const dateRange = record.validity.split(' - ')
      if (dateRange.length === 2) {
        taskForm.setFieldsValue({
          name: record.name,
          product: record.product,
          validityRange: [dayjs(dateRange[0]), dayjs(dateRange[1])],
          description: record.description,
          visibleUsers: record.visibleUsers,
        })
      }
    }
    setTaskDrawerVisible(true)
  }

  // 保存任务
  const handleSaveTask = async () => {
    try {
      const values = await taskForm.validateFields()
      let validity = '永久'
      if (validityType === 'range' && values.validityRange) {
        const [start, end] = values.validityRange as [Dayjs, Dayjs]
        validity = `${start.format('YYYY-MM-DD')} - ${end.format('YYYY-MM-DD')}`
      }

      const taskData = {
        name: values.name,
        product: values.product,
        validity,
        description: values.description,
        visibleUsers: values.visibleUsers || [],
        clientId,
      }

      if (editingTask) {
        await FileDeliveryService.updateTask(editingTask.id, taskData)
        message.success('任务已更新')
      } else {
        await FileDeliveryService.createTask(taskData)
        message.success('任务已创建')
      }

      // 重新加载任务列表
      const tasksData = await FileDeliveryService.getTasks(clientId, productFilter === '全部' ? undefined : productFilter)
      setTasks(tasksData)
      setTaskDrawerVisible(false)
    } catch (error) {
      console.error('保存失败:', error)
      message.error('保存失败，请检查表单内容')
    }
  }

  // 删除任务
  const handleDeleteTask = async (id: string) => {
    try {
      await FileDeliveryService.deleteTask(id)
      message.success('任务已删除')
      const tasksData = await FileDeliveryService.getTasks(clientId, productFilter === '全部' ? undefined : productFilter)
      setTasks(tasksData)
    } catch {
      message.error('删除失败')
    }
  }

  // 管理文件
  const handleManageFiles = (taskId: string) => {
    setCurrentTaskId(taskId)
    setCurrentFolderId(undefined)
    setFileDrawerVisible(true)
  }

  // 创建文件夹
  const handleCreateFolder = async () => {
    if (!folderName.trim() || !currentTaskId) return
    try {
      await FileDeliveryService.createFolder(currentTaskId, folderName.trim(), currentFolderId)
      message.success('文件夹已创建')
      setFolderName('')
      setShowFolderInput(false)
      const filesData = await FileDeliveryService.getFiles(currentTaskId, currentFolderId)
      setFiles(filesData)
    } catch {
      message.error('创建文件夹失败')
    }
  }

  // 上传文件
  const handleUploadFiles = async () => {
    if (!fileList.length || !currentTaskId) return
    try {
      const fileObjects = fileList
        .map((f) => f.originFileObj)
        .filter((f): f is RcFile => f !== undefined && f instanceof File) as File[]
      if (fileObjects.length === 0) {
        message.warning('请选择要上传的文件')
        return
      }
      await FileDeliveryService.uploadFiles(currentTaskId, fileObjects, currentFolderId)
      message.success(`成功上传${fileObjects.length}个文件`)
      setFileList([])
      const filesData = await FileDeliveryService.getFiles(currentTaskId, currentFolderId)
      setFiles(filesData)
    } catch {
      message.error('文件上传失败')
    }
  }

  // 删除文件/文件夹
  const handleDeleteFile = async (id: string) => {
    try {
      await FileDeliveryService.deleteFile(id)
      message.success('删除成功')
      if (currentTaskId) {
        const filesData = await FileDeliveryService.getFiles(currentTaskId, currentFolderId)
        setFiles(filesData)
      }
    } catch {
      message.error('删除失败')
    }
  }

  // 打开文件夹
  const handleOpenFolder = (folderId: string) => {
    setCurrentFolderId(folderId)
  }

  // 返回上级
  const handleGoBack = () => {
    setCurrentFolderId(undefined)
  }

  // 授权用户
  const handleAuthorizeUsers = (taskId: string) => {
    setAuthTaskId(taskId)
    setAuthDrawerVisible(true)
  }

  // 添加授权用户
  const handleAddAuthorizedUser = async () => {
    try {
      const values = await authForm.validateFields()
      if (!authTaskId) return
      await FileDeliveryService.addAuthorizedUser(authTaskId, values.accountName, values.name)
      message.success('授权用户已添加')
      authForm.resetFields()
      const users = await FileDeliveryService.getAuthorizedUsers(authTaskId)
      setAuthorizedUsers(users)
    } catch (error) {
      console.error('添加授权用户失败:', error)
      message.error('添加授权用户失败')
    }
  }

  // 删除授权用户
  const handleDeleteAuthorizedUser = async (id: string) => {
    try {
      await FileDeliveryService.deleteAuthorizedUser(id)
      message.success('授权用户已删除')
      if (authTaskId) {
        const users = await FileDeliveryService.getAuthorizedUsers(authTaskId)
        setAuthorizedUsers(users)
      }
    } catch {
      message.error('删除失败')
    }
  }

  // 任务列表列定义
  const taskColumns: ColumnsType<FileDeliveryTask> = [
    {
      title: '交付任务名称',
      dataIndex: 'name',
      key: 'name',
      width: 300,
      render: (text: string) => (
        <Space>
          <FileOutlined style={{ color: '#1890ff' }} />
          {text}
        </Space>
      ),
    },
    {
      title: '产品类型',
      dataIndex: 'product',
      key: 'product',
      width: 120,
      render: (product?: BusinessType) =>
        product ? (
          <Tag color={product === '到店营销' ? 'blue' : product === '即时零售' ? 'green' : 'gold'}>
            {product}
          </Tag>
        ) : (
          '-'
        ),
    },
    {
      title: '任务有效期',
      dataIndex: 'validity',
      key: 'validity',
      width: 200,
      render: (validity: string) => (
        validity === '永久' ? (
          <Tag color="blue">永久</Tag>
        ) : (
          <span>{validity}</span>
        )
      ),
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
      key: 'actions',
      width: 300,
      fixed: 'right',
      render: (_, record) => (
        <Space>
          <Button type="link" size="small" icon={<EditOutlined />} onClick={() => handleEditTask(record)}>
            编辑
          </Button>
          <Popconfirm
            title="确定要删除这个任务吗？"
            onConfirm={() => handleDeleteTask(record.id)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
          <Button
            type="link"
            size="small"
            icon={<FolderOutlined />}
            onClick={() => handleManageFiles(record.id)}
          >
            管理文件
          </Button>
          <Button
            type="link"
            size="small"
            icon={<UserAddOutlined />}
            onClick={() => handleAuthorizeUsers(record.id)}
          >
            授权用户
          </Button>
        </Space>
      ),
    },
  ]

  // 文件列表列定义
  const fileColumns: ColumnsType<DeliveryFile> = [
    {
      title: '文件名称',
      dataIndex: 'name',
      key: 'name',
      render: (text: string, record) => (
        <Space>
          {record.type === 'folder' ? (
            <FolderOutlined style={{ color: '#faad14' }} />
          ) : (
            <FileOutlined style={{ color: '#1890ff' }} />
          )}
          {text}
        </Space>
      ),
    },
    {
      title: '文件类型',
      dataIndex: 'type',
      key: 'type',
      width: 120,
      render: (type: string, record) => (type === 'folder' ? '文件夹' : record.fileType || '-'),
    },
    {
      title: '创建人',
      dataIndex: 'createdBy',
      key: 'createdBy',
      width: 120,
    },
    {
      title: '创建时间',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
    },
    {
      title: '操作',
      key: 'actions',
      width: 250,
      render: (_, record) => (
        <Space>
          {record.type === 'folder' ? (
            <>
              <Button type="link" size="small" onClick={() => handleOpenFolder(record.id)}>
                打开文件夹
              </Button>
              <Popconfirm
                title="确定要删除这个文件夹吗？"
                onConfirm={() => handleDeleteFile(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            </>
          ) : (
            <>
              <Button type="link" size="small" icon={<DownloadOutlined />} href={record.downloadUrl}>
                下载文件
              </Button>
              <Button type="link" size="small" icon={<EyeOutlined />}>
                预览文件
              </Button>
              <Popconfirm
                title="确定要删除这个文件吗？"
                onConfirm={() => handleDeleteFile(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ]

  return (
    <div style={{ padding: 24 }}>
      <Card>
        {/* 顶部筛选和操作栏 */}
        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space>
            <Select
              value={productFilter}
              onChange={(value) => setProductFilter(value)}
              style={{ width: 150 }}
              options={[
                { label: '全部', value: '全部' },
                ...businessTypeOptions.map((type) => ({ label: type, value: type })),
              ]}
            />
          </Space>
          <Space>
            <Input.Search
              placeholder="请输入交付任务名称"
              style={{ width: 300 }}
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              allowClear
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={handleCreateTask}>
              创建交付任务
            </Button>
          </Space>
        </div>

        {/* 任务列表 */}
        <Table
          dataSource={filteredTasks}
          rowKey="id"
          loading={loading}
          columns={taskColumns}
          pagination={{
            total: filteredTasks.length,
            pageSize: 10,
            showTotal: (total) => `共${total}条`,
          }}
        />
      </Card>

      {/* 创建/编辑任务抽屉 */}
      <Drawer
        title={editingTask ? '编辑任务' : '创建交付任务'}
        open={taskDrawerVisible}
        onClose={() => setTaskDrawerVisible(false)}
        width={600}
        extra={
          <Space>
            <Button onClick={() => setTaskDrawerVisible(false)}>取消</Button>
            <Button type="primary" onClick={handleSaveTask}>
              保存
            </Button>
          </Space>
        }
      >
        <Form form={taskForm} layout="vertical">
          <Form.Item
            label="任务名称"
            name="name"
            rules={[{ required: true, message: '请输入任务名称' }]}
          >
            <Input placeholder="请输入交付任务名称" />
          </Form.Item>

          <Form.Item label="产品类型" name="product">
            <Select
              placeholder="请选择产品类型（可选）"
              allowClear
              options={businessTypeOptions.map((type) => ({ label: type, value: type }))}
            />
          </Form.Item>

          <Form.Item label="有效期" required>
            <Radio.Group
              value={validityType}
              onChange={(e) => {
                setValidityType(e.target.value)
                if (e.target.value === 'permanent') {
                  taskForm.setFieldsValue({ validity: '永久', validityRange: null })
                } else {
                  taskForm.setFieldsValue({ validity: null })
                }
              }}
              style={{ marginBottom: 8 }}
            >
              <Radio value="permanent">永久</Radio>
              <Radio value="range">指定时间范围</Radio>
            </Radio.Group>
            {validityType === 'permanent' ? (
              <Form.Item name="validity" noStyle rules={[{ required: true, message: '请选择有效期' }]}>
                <Select
                  options={[
                    { label: '永久', value: '永久' },
                  ]}
                />
              </Form.Item>
            ) : (
              <Form.Item
                name="validityRange"
                noStyle
                rules={[{ required: true, message: '请选择时间范围' }]}
              >
                <RangePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
              </Form.Item>
            )}
          </Form.Item>

          <Form.Item
            label="描述"
            name="description"
            rules={[{ required: true, message: '请输入描述' }]}
          >
            <TextArea rows={4} placeholder="请输入任务描述" />
          </Form.Item>

          <Form.Item label="可见人" name="visibleUsers">
            <Select
              mode="multiple"
              placeholder="请选择可见人"
              options={contacts.map((contact) => ({
                label: `${contact.name}${contact.position ? ` - ${contact.position}` : ''}`,
                value: contact.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Drawer>

      {/* 管理文件抽屉 */}
      <Drawer
        title={currentFolderId ? `管理文件 - ${files.find((f) => f.id === currentFolderId)?.name || ''}` : '管理文件'}
        open={fileDrawerVisible}
        onClose={() => {
          setFileDrawerVisible(false)
          setCurrentFolderId(undefined)
          setFiles([])
        }}
        width={800}
      >
        <div style={{ marginBottom: 16 }}>
          <Space>
            {currentFolderId && (
              <Button onClick={handleGoBack}>返回上级</Button>
            )}
            <Button
              type="primary"
              icon={<FolderAddOutlined />}
              onClick={() => setShowFolderInput(true)}
            >
              新建文件夹
            </Button>
            <Upload
              multiple
              fileList={fileList}
              onChange={({ fileList: newFileList }) => setFileList(newFileList)}
              beforeUpload={() => false}
              showUploadList={true}
            >
              <Button type="primary" icon={<UploadOutlined />}>
                上传文件
              </Button>
            </Upload>
            {fileList.length > 0 && (
              <Button type="primary" onClick={handleUploadFiles}>
                确认上传 ({fileList.length})
              </Button>
            )}
          </Space>
        </div>

        {showFolderInput && (
          <div style={{ marginBottom: 16 }}>
            <Space>
              <Input
                placeholder="请输入文件夹名称"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                onPressEnter={handleCreateFolder}
                style={{ width: 200 }}
              />
              <Button type="primary" onClick={handleCreateFolder}>
                确定
              </Button>
              <Button onClick={() => {
                setShowFolderInput(false)
                setFolderName('')
              }}>
                取消
              </Button>
            </Space>
          </div>
        )}

        {files.length === 0 ? (
          <Empty description="暂无文件" />
        ) : (
          <Table
            dataSource={files}
            rowKey="id"
            columns={fileColumns}
            pagination={{
              total: files.length,
              pageSize: 10,
              showTotal: (total) => `共${total}条`,
            }}
          />
        )}
      </Drawer>

      {/* 授权用户抽屉 */}
      <Drawer
        title="授权用户列表"
        open={authDrawerVisible}
        onClose={() => {
          setAuthDrawerVisible(false)
          setAuthorizedUsers([])
          authForm.resetFields()
        }}
        width={600}
        extra={
          <Button type="primary" icon={<UserAddOutlined />} onClick={handleAddAuthorizedUser}>
            新增授权用户
          </Button>
        }
      >
        <Form form={authForm} layout="inline" style={{ marginBottom: 16 }}>
          <Form.Item
            name="accountName"
            rules={[{ required: true, message: '请输入账号名' }]}
          >
            <Input placeholder="账号名" />
          </Form.Item>
          <Form.Item
            name="name"
            rules={[{ required: true, message: '请输入姓名' }]}
          >
            <Input placeholder="姓名" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" onClick={handleAddAuthorizedUser}>
              添加
            </Button>
          </Form.Item>
        </Form>

        {authorizedUsers.length === 0 ? (
          <Empty description="暂无授权用户" />
        ) : (
          <Table
            dataSource={authorizedUsers}
            rowKey="id"
            columns={[
              {
                title: '账号名',
                dataIndex: 'accountName',
                key: 'accountName',
              },
              {
                title: '姓名',
                dataIndex: 'name',
                key: 'name',
              },
              {
                title: '操作',
                key: 'actions',
                render: (_, record) => (
                  <Popconfirm
                    title="确定要删除这个授权用户吗？"
                    onConfirm={() => handleDeleteAuthorizedUser(record.id)}
                    okText="确定"
                    cancelText="取消"
                  >
                    <Button type="link" size="small" danger>
                      删除
                    </Button>
                  </Popconfirm>
                ),
              },
            ]}
            pagination={false}
          />
        )}
      </Drawer>
    </div>
  )
}
