/**
 * 客户账号服务
 */
import type { ClientAccount, LoginLog, CreateAccountFormData } from '../types/client-account'

const deletedAccountIdsStorageKey = (clientId: string) => `client-account:deleted:${clientId}`

export class ClientAccountService {
  private static readDeletedAccountIds(clientId: string): Set<string> {
    try {
      const raw = localStorage.getItem(deletedAccountIdsStorageKey(clientId))
      if (!raw) return new Set()
      const parsed = JSON.parse(raw) as unknown
      return new Set(Array.isArray(parsed) ? parsed : [])
    } catch {
      return new Set()
    }
  }

  private static filterDeletedAccounts(clientId: string, accounts: ClientAccount[]): ClientAccount[] {
    const deleted = this.readDeletedAccountIds(clientId)
    return accounts.filter((a) => !deleted.has(a.id))
  }

  /**
   * 获取客户账号列表
   */
  static async getClientAccounts(clientId: string): Promise<ClientAccount[]> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const response = await fetch(`/mock/clients/${clientId}/accounts.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch accounts')
      }
      const data = await response.json()
      return this.filterDeletedAccounts(clientId, data.accounts || [])
    } catch {
      // 如果文件不存在，返回默认数据
      console.warn('Mock data not found, using default data')
      return this.filterDeletedAccounts(clientId, this.getDefaultAccounts())
    }
  }

  /**
   * 获取默认账号数据（用于演示）
   */
  private static getDefaultAccounts(): ClientAccount[] {
    return [
      {
        id: 'ACC-001',
        accountName: '精明购_59',
        name: '黎XX',
        email: '277458535@qq.com',
        status: '使用中',
        mobileLogin: '未绑定',
        wechatLogin: '已绑定',
        creator: '黎燕苹',
        createdAt: '2024-01-15 10:30:00',
        functionPermissions: ['到店营销', '即时零售'],
        regionIds: ['REG-001'],
        subBrandIds: ['SUB-001', 'SUB-002'],
      },
      {
        id: 'ACC-002',
        accountName: '精明购_82',
        name: '冯杰',
        email: 'aaronfung@ismartgo.com',
        status: '使用中',
        mobileLogin: '未绑定',
        wechatLogin: '已绑定',
        creator: '黎燕苹',
        createdAt: '2024-02-20 14:20:00',
        functionPermissions: ['即时零售', '数据支持'],
        regionIds: ['REG-001'],
        subBrandIds: ['SUB-001'],
      },
      {
        id: 'ACC-003',
        accountName: '精明购_83',
        name: '古兆花',
        email: 'chiaragu@ismartgo.com',
        status: '使用中',
        mobileLogin: '未绑定',
        wechatLogin: '已绑定',
        creator: '黎燕苹',
        createdAt: '2024-03-10 09:15:00',
        functionPermissions: ['物码营销'],
        regionIds: ['REG-001'],
        subBrandIds: ['SUB-003'],
      },
      {
        id: 'ACC-004',
        accountName: '精明购_185',
        name: '王雄军',
        email: 'gavinwang@ismartgo.com',
        status: '使用中',
        mobileLogin: '未绑定',
        wechatLogin: '已绑定',
        creator: '王雄军',
        createdAt: '2024-04-05 16:45:00',
        functionPermissions: ['到店营销', '即时零售', '数据支持'],
        regionIds: ['REG-001'],
        subBrandIds: ['SUB-001', 'SUB-002', 'SUB-003'],
      },
    ]
  }

  /**
   * 创建新账号
   */
  static async createAccount(
    _clientId: string,
    formData: CreateAccountFormData,
  ): Promise<ClientAccount> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 800))

    const newAccount: ClientAccount = {
      id: `ACC-${Date.now()}`,
      accountName: formData.accountName,
      name: formData.name,
      email: formData.email,
      status: '待激活',
      mobileLogin: '未绑定',
      wechatLogin: '未绑定',
      creator: '当前用户', // 实际应该从登录信息获取
      createdAt: new Date().toLocaleString('zh-CN', { hour12: false }),
      activationLink: `https://client.example.com/activate?token=${Date.now()}`,
      functionPermissions: formData.functionPermissions || [],
      regionIds: formData.regionIds || [],
      subBrandIds: formData.subBrandIds || [],
    }

    return newAccount
  }

  /**
   * 更新账号信息
   */
  static async updateAccount(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accountId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _formData: Partial<CreateAccountFormData>,
  ): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 800))
  }

  /**
   * 禁用账号
   */
  static async disableAccount(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accountId: string,
  ): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  /**
   * 启用账号
   */
  static async enableAccount(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accountId: string,
  ): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
  }

  /**
   * 删除账号（前端模拟：写入本地已删除列表，刷新后仍不展示）
   */
  static async deleteAccount(clientId: string, accountId: string): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 500))
    const key = deletedAccountIdsStorageKey(clientId)
    const deleted = [...this.readDeletedAccountIds(clientId)]
    if (!deleted.includes(accountId)) {
      deleted.push(accountId)
      localStorage.setItem(key, JSON.stringify(deleted))
    }
  }

  /**
   * 获取登录日志
   */
  static async getLoginLogs(clientId: string, accountId: string): Promise<LoginLog[]> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))

    try {
      const response = await fetch(`/mock/clients/${clientId}/accounts/${accountId}/login-logs.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch login logs')
      }
      const data = await response.json()
      return data.logs || []
    } catch {
      // 如果文件不存在，返回默认数据
      console.warn('Mock data not found, using default data')
      return this.getDefaultLoginLogs(accountId)
    }
  }

  /**
   * 获取默认登录日志数据
   */
  private static getDefaultLoginLogs(accountId: string): LoginLog[] {
    return [
      {
        id: 'LOG-001',
        accountId,
        loginTime: '2024-11-15 10:30:00',
        loginMethod: '微信',
        ipAddress: '192.168.1.100',
        deviceInfo: 'iPhone 14 Pro / iOS 17.0',
        status: '成功',
      },
      {
        id: 'LOG-002',
        accountId,
        loginTime: '2024-11-14 15:20:00',
        loginMethod: '微信',
        ipAddress: '192.168.1.100',
        deviceInfo: 'iPhone 14 Pro / iOS 17.0',
        status: '成功',
      },
      {
        id: 'LOG-003',
        accountId,
        loginTime: '2024-11-13 09:15:00',
        loginMethod: '手机验证码',
        ipAddress: '192.168.1.101',
        deviceInfo: 'Chrome 120 / Windows 10',
        status: '成功',
      },
    ]
  }

  /**
   * 发送激活链接
   */
  static async sendActivationLink(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _clientId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _accountId: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _method: '链接' | '邮件',
  ): Promise<void> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 800))
  }

  /**
   * 获取客户品牌列表
   */
  static async getClientBrands(clientId: string): Promise<Array<{ id: string; name: string }>> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const response = await fetch(`/mock/clients/${clientId}/brands.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch brands')
      }
      const data = await response.json()
      return data.brands || []
    } catch {
      // 如果文件不存在，返回默认数据
      console.warn('Mock data not found, using default data')
      return [
        { id: 'BRAND-001', name: '康师傅' },
        { id: 'BRAND-002', name: '嘉士伯' },
        { id: 'BRAND-003', name: '统一' },
        { id: 'BRAND-004', name: '百威' },
        { id: 'BRAND-005', name: '雀巢' },
        { id: 'BRAND-006', name: '达能' },
        { id: 'BRAND-007', name: '伊利' },
        { id: 'BRAND-008', name: '联合利华' },
      ]
    }
  }

  /**
   * 获取客户可绑定的子品牌列表
   */
  static async getClientSubBrands(clientId: string): Promise<Array<{
    id: string
    brandName: string
    subBrandName: string
    displayName: string
  }>> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 300))

    try {
      const response = await fetch(`/mock/clients/${clientId}/client-sub-brands.json`)
      if (!response.ok) {
        throw new Error('Failed to fetch client sub-brands')
      }
      const data = await response.json()
      return data.subBrands || []
    } catch {
      // 如果文件不存在，根据客户ID返回默认数据
      console.warn('Mock data not found, using default data')
      return this.getDefaultClientSubBrands(clientId)
    }
  }

  /**
   * 获取默认客户子品牌数据（根据客户名称）
   * 根据客户与子品牌的对应关系返回
   */
  private static getDefaultClientSubBrands(clientId: string): Array<{
    id: string
    brandName: string
    subBrandName: string
    displayName: string
  }> {
    // 客户与子品牌对应关系映射
    // 根据客户ID或客户名称匹配对应的子品牌列表
    // 这里使用客户ID作为示例，实际应该根据客户名称匹配
    
    // 客户与子品牌对应关系：
    // 伊利：伊利奶粉、伊利低温、伊利液奶
    // 联合利华：家乐、立顿、和路雪、联合利华日化、联合利华家清
    // 达能：脉动
    // 康师傅：康师傅饮品分账官旗、康师傅蛋糕
    // 百事：上百、康百、杭百、乐事
    // 汉高：汉高
    
    // 示例：假设C-001是伊利客户
    if (clientId === 'C-001') {
      return [
        { id: 'SUB-001', brandName: '伊利', subBrandName: '伊利奶粉', displayName: '伊利-伊利奶粉' },
        { id: 'SUB-002', brandName: '伊利', subBrandName: '伊利低温', displayName: '伊利-伊利低温' },
        { id: 'SUB-003', brandName: '伊利', subBrandName: '伊利液奶', displayName: '伊利-伊利液奶' },
      ]
    }

    // 可以根据其他客户ID返回对应的子品牌列表
    // 例如：C-002 是联合利华客户
    // if (clientId === 'C-002') {
    //   return [
    //     { id: 'SUB-004', brandName: '联合利华', subBrandName: '家乐', displayName: '联合利华-家乐' },
    //     { id: 'SUB-005', brandName: '联合利华', subBrandName: '立顿', displayName: '联合利华-立顿' },
    //     { id: 'SUB-006', brandName: '联合利华', subBrandName: '和路雪', displayName: '联合利华-和路雪' },
    //     { id: 'SUB-007', brandName: '联合利华', subBrandName: '联合利华日化', displayName: '联合利华-联合利华日化' },
    //     { id: 'SUB-008', brandName: '联合利华', subBrandName: '联合利华家清', displayName: '联合利华-联合利华家清' },
    //   ]
    // }

    // 默认返回所有可能的子品牌（用于演示）
    return [
      { id: 'SUB-001', brandName: '伊利', subBrandName: '伊利奶粉', displayName: '伊利-伊利奶粉' },
      { id: 'SUB-002', brandName: '伊利', subBrandName: '伊利低温', displayName: '伊利-伊利低温' },
      { id: 'SUB-003', brandName: '伊利', subBrandName: '伊利液奶', displayName: '伊利-伊利液奶' },
      { id: 'SUB-004', brandName: '联合利华', subBrandName: '家乐', displayName: '联合利华-家乐' },
      { id: 'SUB-005', brandName: '联合利华', subBrandName: '立顿', displayName: '联合利华-立顿' },
      { id: 'SUB-006', brandName: '联合利华', subBrandName: '和路雪', displayName: '联合利华-和路雪' },
      { id: 'SUB-007', brandName: '联合利华', subBrandName: '联合利华日化', displayName: '联合利华-联合利华日化' },
      { id: 'SUB-008', brandName: '联合利华', subBrandName: '联合利华家清', displayName: '联合利华-联合利华家清' },
      { id: 'SUB-009', brandName: '达能', subBrandName: '脉动', displayName: '达能-脉动' },
      { id: 'SUB-010', brandName: '康师傅', subBrandName: '康师傅饮品分账官旗', displayName: '康师傅-康师傅饮品分账官旗' },
      { id: 'SUB-011', brandName: '康师傅', subBrandName: '康师傅蛋糕', displayName: '康师傅-康师傅蛋糕' },
      { id: 'SUB-012', brandName: '百事', subBrandName: '上百', displayName: '百事-上百' },
      { id: 'SUB-013', brandName: '百事', subBrandName: '康百', displayName: '百事-康百' },
      { id: 'SUB-014', brandName: '百事', subBrandName: '杭百', displayName: '百事-杭百' },
      { id: 'SUB-015', brandName: '百事', subBrandName: '乐事', displayName: '百事-乐事' },
      { id: 'SUB-016', brandName: '汉高', subBrandName: '汉高', displayName: '汉高-汉高' },
    ]
  }
}

