import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { UserProfile } from '../types/auth'

const AUTH_TOKEN_KEY = 'auth_token'
const USER_INFO_KEY = 'user_info'

export const AuthService = {
  /**
   * 登录
   */
  async login(username: string, password: string): Promise<UserProfile> {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 验证账号密码
    if (username === 'admin' && password === '123456') {
      // 模拟用户信息
      const userInfo: UserProfile = {
        id: '1',
        name: '管理员',
        department: '技术部',
        email: 'admin@example.com',
        phone: '13800138000',
        status: '正常',
        roles: [
          {
            name: '管理员',
            permissions: ['*'],
          },
        ],
      }

      // 保存认证信息
      const token = `mock_token_${Date.now()}`
      localStorage.setItem(AUTH_TOKEN_KEY, token)
      localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))

      return userInfo
    } else {
      throw new Error('账号或密码错误')
    }
  },

  /**
   * 退出登录
   */
  logout(): void {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    localStorage.removeItem(USER_INFO_KEY)
  },

  /**
   * 检查是否已登录
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem(AUTH_TOKEN_KEY)
  },

  /**
   * 获取当前用户信息
   */
  async getCurrentUser(): Promise<UserProfile> {
    // 优先从 localStorage 获取
    const storedUserInfo = localStorage.getItem(USER_INFO_KEY)
    if (storedUserInfo) {
      try {
        return JSON.parse(storedUserInfo) as UserProfile
      } catch {
        // 如果解析失败，继续从API获取
      }
    }

    // 从API获取（用于首次加载或刷新）
    const resp = await fetchWithTimeout('/mock/auth/user.json', { timeout: 3000 })
    if (!resp.ok) throw new Error(`加载用户信息失败：${resp.status}`)
    const raw = (await resp.json()) as UserProfile
    // 简单标准化处理，确保字段存在
    const userInfo = {
      id: raw.id,
      name: raw.name,
      department: raw.department ?? '—',
      email: raw.email ?? '—',
      phone: raw.phone ?? '—',
      status: raw.status ?? '正常',
      roles: Array.isArray(raw.roles)
        ? raw.roles.map((r) => ({ name: r.name, permissions: r.permissions ?? [] }))
        : [],
    }

    // 保存到 localStorage
    localStorage.setItem(USER_INFO_KEY, JSON.stringify(userInfo))

    return userInfo
  },
}