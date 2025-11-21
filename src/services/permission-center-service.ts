import { fetchWithTimeout } from '../utils/fetch-with-timeout'
import type {
  PermissionMember,
  PermissionMatrix,
  PermissionRole,
  PermissionMatrixCell,
  PermissionAction,
  PermissionModule,
} from '../types/permission'

const ROLES_URL = '/mock/permission-center/roles.json'
const MATRIX_URL = '/mock/permission-center/matrix.json'
const MEMBERS_URL = '/mock/permission-center/members.json'

type RawRecord = Record<string, unknown>

const isRecord = (value: unknown): value is RawRecord =>
  typeof value === 'object' && value !== null

const ALLOWED_ACTIONS = new Set<string>(['查看', '新建', '编辑', '审批', '导出', '使用', '申请'])

const normalizeActions = (actions: unknown[]): PermissionAction[] =>
  actions.filter((action): action is PermissionAction => typeof action === 'string' && ALLOWED_ACTIONS.has(action))

function normalizeMatrixCell(value: unknown): PermissionMatrixCell | null {
  if (!isRecord(value) || typeof value.module !== 'string' || !Array.isArray(value.actions)) {
    return null
  }
  const module = value.module as PermissionModule
  return {
    module,
    actions: normalizeActions(value.actions),
  }
}

export async function getPermissionRoles(): Promise<PermissionRole[]> {
  try {
    const res = await fetchWithTimeout(ROLES_URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载角色失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const rawObject = isRecord(raw) ? raw : {}
    const list = Array.isArray(rawObject.roles) ? rawObject.roles : Array.isArray(raw) ? raw : []
    return list
      .filter(isRecord)
      .map((role) => ({
        id: String(role.id ?? ''),
        name: String(role.name ?? ''),
        description: String(role.description ?? ''),
        memberCount: Number(role.memberCount ?? 0),
        createdAt: String(role.createdAt ?? ''),
        updatedAt: String(role.updatedAt ?? ''),
      }))
  } catch (error) {
    console.error(error)
    return []
  }
}

export async function getPermissionMatrix(): Promise<PermissionMatrix> {
  try {
    const res = await fetchWithTimeout(MATRIX_URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载权限矩阵失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    if (!isRecord(raw) || !isRecord(raw.matrix)) return {}

    const matrix: PermissionMatrix = {}
    Object.entries(raw.matrix).forEach(([roleId, value]) => {
      if (!Array.isArray(value)) return
      const normalized = value
        .map((cell) => normalizeMatrixCell(cell))
        .filter((cell): cell is PermissionMatrixCell => cell !== null)
      matrix[roleId] = normalized
    })
    return matrix
  } catch (error) {
    console.error(error)
    return {}
  }
}

export async function getPermissionMembers(): Promise<PermissionMember[]> {
  try {
    const res = await fetchWithTimeout(MEMBERS_URL, { timeout: 3000 })
    if (!res.ok) throw new Error(`加载成员列表失败: ${res.status}`)
    const raw = (await res.json()) as unknown
    const rawObject = isRecord(raw) ? raw : {}
    const list = Array.isArray(rawObject.members) ? rawObject.members : Array.isArray(raw) ? raw : []
    const allowedStatus: PermissionMember['status'][] = ['启用', '禁用']

    return list
      .filter(isRecord)
      .map((member) => {
        const status = allowedStatus.includes(member.status as PermissionMember['status'])
          ? (member.status as PermissionMember['status'])
          : '启用'
        const permissions = Array.isArray(member.permissions) ? member.permissions.map(String) : undefined
        return {
          id: String(member.id ?? ''),
          name: String(member.name ?? ''),
          email: String(member.email ?? ''),
          roleId: String(member.roleId ?? ''),
          permissions,
          status,
          joinedAt: String(member.joinedAt ?? ''),
          lastActiveAt: String(member.lastActiveAt ?? ''),
        }
      })
  } catch (error) {
    console.error(error)
    return []
  }
}

