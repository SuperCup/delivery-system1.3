import type { FileDeliveryTask, DeliveryFile, AuthorizedUser } from '../types/file-delivery'
import type { BusinessType } from '../types/client'

// 模块级别的模拟数据存储（用于模拟持久化）
const mockTasks: FileDeliveryTask[] = [
  {
    id: 'task-001',
    name: '饿了么仓店渠道GMV',
    product: '即时零售',
    validity: '永久',
    description: '饿了么仓店渠道GMV数据交付',
    visibleUsers: ['user-001', 'user-002'],
    clientId: 'C-004',
    createdAt: '2025-07-08 15:48:41',
    createdBy: '黎燕苹',
    updatedAt: '2025-07-14 11:48:37',
    fileCount: 2,
    folderCount: 1,
  },
  {
    id: 'task-002',
    name: '饿京淘月度核销合表',
    validity: '永久',
    description: '饿京淘月度核销合表数据交付',
    visibleUsers: ['user-001'],
    clientId: 'C-004',
    createdAt: '2025-06-04 17:54:25',
    createdBy: '郑文龙',
    updatedAt: '2025-06-26 17:16:08',
    fileCount: 1,
    folderCount: 0,
  },
  {
    id: 'task-003',
    name: '饿京淘月度全量GMV数据',
    validity: '永久',
    description: '饿京淘月度全量GMV数据交付',
    visibleUsers: ['user-001', 'user-003'],
    clientId: 'C-004',
    createdAt: '2025-06-04 17:54:02',
    createdBy: '郑文龙',
    updatedAt: '2025-06-04 17:54:02',
    fileCount: 0,
    folderCount: 0,
  },
  {
    id: 'task-004',
    name: '【8】年度复盘',
    validity: '永久',
    description: '年度复盘数据交付',
    visibleUsers: ['user-001'],
    clientId: 'C-004',
    createdAt: '2025-06-04 17:35:59',
    createdBy: '张敏',
    updatedAt: '2025-06-26 17:15:02',
    fileCount: 0,
    folderCount: 0,
  },
  {
    id: 'task-005',
    name: '【7】季度复盘',
    validity: '永久',
    description: '季度复盘数据交付',
    visibleUsers: ['user-001'],
    clientId: 'C-004',
    createdAt: '2025-06-04 17:35:49',
    createdBy: '张敏',
    updatedAt: '2025-06-04 17:35:49',
    fileCount: 0,
    folderCount: 0,
  },
  {
    id: 'task-006',
    name: '24年历史全量核销合表',
    validity: '永久',
    description: '24年历史全量核销合表数据交付',
    visibleUsers: ['user-001', 'user-002'],
    clientId: 'C-004',
    createdAt: '2025-06-13 11:14:10',
    createdBy: '李博',
    updatedAt: '2025-06-13 11:14:10',
    fileCount: 0,
    folderCount: 0,
  },
  {
    id: 'task-007',
    name: '【6】月报',
    validity: '永久',
    description: '月报数据交付',
    visibleUsers: ['user-001'],
    clientId: 'C-004',
    createdAt: '2025-06-04 17:35:28',
    createdBy: '陈乐',
    updatedAt: '2025-06-04 17:35:28',
    fileCount: 0,
    folderCount: 0,
  },
  {
    id: 'task-008',
    name: '【5】周报',
    validity: '永久',
    description: '周报数据交付',
    visibleUsers: ['user-001'],
    clientId: 'C-004',
    createdAt: '2025-06-04 17:26:02',
    createdBy: '陈乐',
    updatedAt: '2025-06-04 17:26:02',
    fileCount: 0,
    folderCount: 0,
  },
  {
    id: 'task-009',
    name: '【4】促销活动截图',
    validity: '永久',
    description: '促销活动截图交付',
    visibleUsers: ['user-001'],
    clientId: 'C-004',
    createdAt: '2025-06-04 17:25:50',
    createdBy: '吴倩',
    updatedAt: '2025-06-04 17:25:50',
    fileCount: 0,
    folderCount: 0,
  },
  {
    id: 'task-010',
    name: '【3】资源位截图',
    validity: '永久',
    description: '资源位截图交付',
    visibleUsers: ['user-001'],
    clientId: 'C-004',
    createdAt: '2025-06-04 17:25:40',
    createdBy: '吴倩',
    updatedAt: '2025-06-04 17:25:40',
    fileCount: 0,
    folderCount: 0,
  },
]

let mockFiles: DeliveryFile[] = [
  {
    id: 'file-001',
    name: '25年仓店供给',
    type: 'folder',
    taskId: 'task-001',
    createdAt: '2025-09-12 10:20:43',
    createdBy: '黎燕苹',
  },
  {
    id: 'file-002',
    name: 'Y24仓店门店维度',
    type: 'file',
    fileType: 'xlsx',
    size: 1024000,
    taskId: 'task-001',
    createdAt: '2025-07-08 15:49:24',
    createdBy: '郑笑芩',
    downloadUrl: 'https://example.com/files/Y24仓店门店维度.xlsx',
  },
]

let mockUsers: AuthorizedUser[] = [
  {
    id: 'auth-001',
    accountName: 'zhangsan',
    name: '张三',
    taskId: 'task-001',
  },
  {
    id: 'auth-002',
    accountName: 'lisi',
    name: '李四',
    taskId: 'task-001',
  },
]

/**
 * 文件交付服务
 */
export const FileDeliveryService = {
  /**
   * 获取客户的交付任务列表
   */
  async getTasks(clientId: string, product?: BusinessType): Promise<FileDeliveryTask[]> {
    let filtered = mockTasks.filter((t) => t.clientId === clientId)
    if (product) {
      filtered = filtered.filter((t) => t.product === product)
    }
    return filtered
  },

  /**
   * 创建交付任务
   */
  async createTask(task: Omit<FileDeliveryTask, 'id' | 'createdAt' | 'createdBy' | 'updatedAt' | 'fileCount' | 'folderCount'>): Promise<FileDeliveryTask> {
    const newTask: FileDeliveryTask = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
      createdBy: '当前用户',
      updatedAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
      fileCount: 0,
      folderCount: 0,
    }
    mockTasks.push(newTask)
    return newTask
  },

  /**
   * 更新交付任务
   */
  async updateTask(id: string, task: Partial<FileDeliveryTask>): Promise<FileDeliveryTask> {
    const index = mockTasks.findIndex((t) => t.id === id)
    if (index === -1) {
      throw new Error('任务不存在')
    }
    const existing = mockTasks[index]
    const updated: FileDeliveryTask = {
      ...existing,
      ...task,
      id,
      updatedAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
    }
    mockTasks[index] = updated
    return updated
  },

  /**
   * 删除交付任务
   */
  async deleteTask(id: string): Promise<void> {
    const index = mockTasks.findIndex((t) => t.id === id)
    if (index !== -1) {
      mockTasks.splice(index, 1)
      // 同时删除该任务下的所有文件和授权用户
      mockFiles = mockFiles.filter((f) => f.taskId !== id)
      mockUsers = mockUsers.filter((u) => u.taskId !== id)
    }
  },

  /**
   * 获取任务下的文件列表
   */
  async getFiles(taskId: string, parentId?: string): Promise<DeliveryFile[]> {
    let filtered = mockFiles.filter((f) => f.taskId === taskId)
    if (parentId) {
      filtered = filtered.filter((f) => f.parentId === parentId)
    } else {
      filtered = filtered.filter((f) => !f.parentId)
    }
    return filtered
  },

  /**
   * 上传文件
   */
  async uploadFiles(taskId: string, files: File[], parentId?: string): Promise<DeliveryFile[]> {
    const uploaded: DeliveryFile[] = files.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      name: file.name,
      type: 'file',
      fileType: file.name.split('.').pop()?.toLowerCase(),
      size: file.size,
      taskId,
      parentId,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
      createdBy: '当前用户',
      downloadUrl: `https://example.com/files/${file.name}`,
    }))
    mockFiles.push(...uploaded)
    // 更新任务的文件数量
    const taskIndex = mockTasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      mockTasks[taskIndex].fileCount = (mockTasks[taskIndex].fileCount || 0) + uploaded.length
    }
    return uploaded
  },

  /**
   * 创建文件夹
   */
  async createFolder(taskId: string, name: string, parentId?: string): Promise<DeliveryFile> {
    const folder: DeliveryFile = {
      id: `folder-${Date.now()}`,
      name,
      type: 'folder',
      taskId,
      parentId,
      createdAt: new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }).replace(/\//g, '-'),
      createdBy: '当前用户',
    }
    mockFiles.push(folder)
    // 更新任务的文件夹数量
    const taskIndex = mockTasks.findIndex((t) => t.id === taskId)
    if (taskIndex !== -1) {
      mockTasks[taskIndex].folderCount = (mockTasks[taskIndex].folderCount || 0) + 1
    }
    return folder
  },

  /**
   * 更新文件/文件夹
   */
  async updateFile(id: string, file: Partial<DeliveryFile>): Promise<DeliveryFile> {
    const index = mockFiles.findIndex((f) => f.id === id)
    if (index === -1) {
      throw new Error('文件/文件夹不存在')
    }
    const existing = mockFiles[index]
    const updated: DeliveryFile = {
      ...existing,
      ...file,
      id,
    }
    mockFiles[index] = updated
    return updated
  },

  /**
   * 删除文件/文件夹
   */
  async deleteFile(id: string): Promise<void> {
    const index = mockFiles.findIndex((f) => f.id === id)
    if (index !== -1) {
      const file = mockFiles[index]
      mockFiles.splice(index, 1)
      // 如果是文件夹，删除其下的所有文件
      if (file.type === 'folder') {
        mockFiles = mockFiles.filter((f) => f.parentId !== id)
      }
      // 更新任务的统计
      const taskIndex = mockTasks.findIndex((t) => t.id === file.taskId)
      if (taskIndex !== -1) {
        if (file.type === 'folder') {
          mockTasks[taskIndex].folderCount = Math.max(0, (mockTasks[taskIndex].folderCount || 0) - 1)
        } else {
          mockTasks[taskIndex].fileCount = Math.max(0, (mockTasks[taskIndex].fileCount || 0) - 1)
        }
      }
    }
  },

  /**
   * 获取任务的授权用户列表
   */
  async getAuthorizedUsers(taskId: string): Promise<AuthorizedUser[]> {
    return mockUsers.filter((u) => u.taskId === taskId)
  },

  /**
   * 添加授权用户
   */
  async addAuthorizedUser(taskId: string, accountName: string, name: string): Promise<AuthorizedUser> {
    const user: AuthorizedUser = {
      id: `auth-${Date.now()}`,
      accountName,
      name,
      taskId,
    }
    mockUsers.push(user)
    return user
  },

  /**
   * 删除授权用户
   */
  async deleteAuthorizedUser(id: string): Promise<void> {
    const index = mockUsers.findIndex((u) => u.id === id)
    if (index !== -1) {
      mockUsers.splice(index, 1)
    }
  },
}

