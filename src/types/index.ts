// ============================================================
// TIPOS DO SISTEMA
// ============================================================

export type UserStatus = 'active' | 'inactive'

export interface Role {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Permission {
  id: string
  key: string
  description: string | null
}

export interface Profile {
  id: string
  name: string
  email: string
  role_id: string | null
  status: UserStatus
  created_at: string
  updated_at: string
  roles?: Role
}

export interface AuditLog {
  id: string
  user_id: string | null
  action: string
  resource: string
  resource_id: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
  profiles?: Pick<Profile, 'name' | 'email'>
}

// Chaves de permissão disponíveis no sistema
export type PermissionKey =
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'roles.view'
  | 'roles.create'
  | 'roles.update'
  | 'roles.delete'
  | 'logs.view'
  | 'logs.export'
  | 'dashboard.view'

// Sessão do usuário com permissões carregadas
export interface UserSession {
  id: string
  name: string
  email: string
  role: Role | null
  permissions: PermissionKey[]
  status: UserStatus
}
