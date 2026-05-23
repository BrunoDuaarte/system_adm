"use server"
import { createAdminClient } from "@/lib/supabase/server"
import { requirePermission } from "@/lib/auth"
import { log } from "@/lib/audit"
import { revalidatePath } from "next/cache"
import type { Profile } from "@/types"

export async function listUsers(): Promise<Profile[]> {
  await requirePermission("users.view")
  const admin = createAdminClient()

  const { data, error } = await admin
    .from("profiles")
    .select("*, roles(id, name)")
    .order("created_at", { ascending: false })

  if (error) throw new Error("Erro ao buscar usuários.")
  return data ?? []
}

export async function createUser(formData: FormData) {
  const session = await requirePermission("users.create")
  const admin = createAdminClient()

  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const roleId = formData.get("role_id") as string

  if (!name || !email || !password) {
    return { error: "Preencha todos os campos obrigatórios." }
  }

  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    user_metadata: { name },
    email_confirm: true,
  })

  if (authError) return { error: authError.message }

  if (roleId) {
    await admin
      .from("profiles")
      .update({ role_id: roleId, name })
      .eq("id", authData.user.id)
  }

  await log({
    userId: session.id,
    action: "create",
    resource: "users",
    resourceId: authData.user.id,
    metadata: { email, name },
  })

  revalidatePath("/usuarios")
  return { success: true, userId: authData.user.id }
}

export async function updateUser(userId: string, formData: FormData) {
  const session = await requirePermission("users.update")
  const admin = createAdminClient()

  const name = formData.get("name") as string
  const status = formData.get("status") as "active" | "inactive"
  const roleId = formData.get("role_id") as string

  const { error } = await admin
    .from("profiles")
    .update({ name, status, role_id: roleId || null })
    .eq("id", userId)

  if (error) return { error: "Erro ao atualizar usuário." }

  await log({
    userId: session.id,
    action: "update",
    resource: "users",
    resourceId: userId,
    metadata: { name, status },
  })

  revalidatePath("/usuarios")
  return { success: true }
}

export async function deleteUser(userId: string) {
  const session = await requirePermission("users.delete")
  const admin = createAdminClient()

  const { error } = await admin.auth.admin.deleteUser(userId)
  if (error) return { error: "Erro ao excluir usuário." }

  await log({
    userId: session.id,
    action: "delete",
    resource: "users",
    resourceId: userId,
  })

  revalidatePath("/usuarios")
  return { success: true }
}
