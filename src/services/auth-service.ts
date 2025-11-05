import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type { UserProfile } from '../types/auth'

export const AuthService = {
  async getCurrentUser(): Promise<UserProfile> {
    const resp = await fetchWithTimeout('/mock/auth/user.json', { timeout: 3000 })
    if (!resp.ok) throw new Error(`加载用户信息失败：${resp.status}`)
    const raw = (await resp.json()) as UserProfile
    // 简单标准化处理，确保字段存在
    return {
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
  },
}