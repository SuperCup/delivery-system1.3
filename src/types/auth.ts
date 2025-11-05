export type Role = {
  name: string
  permissions: string[]
}

export type UserProfile = {
  id: string
  name: string
  department?: string
  email?: string
  phone?: string
  status?: string
  roles: Role[]
}