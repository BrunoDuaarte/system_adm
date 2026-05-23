import { createClient } from "./supabase/server"
import { createAdminClient } from "./supabase/server"
import type { UserSession, PermissionKey } from "@/types"

export async function getSession(): Promise<UserSession | null> {
  const supabase = await createClient()

  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from("profiles")
    .select("*, roles(*)")
    .eq("id", user.id)
    .single()

  if (!profile) return null
  if (profile.status === "inactive") return null

  let permissions: PermissionKey[] = []
  if (profile.role_id) {
    const { data: rolePerms } = await admin
      .from("role_permissions")
      .select("permissions(key)")
      .eq("role_id", profile.role_id)

    permissions = (rolePerms ?? [])
      .map((rp: any) => rp.permissions?.key)
      .filter(Boolean) as PermissionKey[]
  }

  return {
    id: user.id,
    name: profile.name,
    email: profile.email,
    role: profile.roles ?? null,
    permissions,
    status: profile.status,
  }
}

export async function requirePermission(permission: PermissionKey): Promise<UserSession> {
  const session = await getSession()
  if (!session) throw new Error("UNAUTHORIZED")
  if (!session.permissions.includes(permission)) throw new Error("FORBIDDEN")
  return session
}

export function hasPermission(session: UserSession, permission: PermissionKey): boolean {
  return session.permissions.includes(permission)
}
