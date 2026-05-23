import { createAdminClient } from "@/lib/supabase/server"
import { requirePermission } from "@/lib/auth"
import type { AuditLog } from "@/types"

interface ListLogsParams {
  page?: number
  perPage?: number
  resource?: string
  userId?: string
}

export async function listLogs(params: ListLogsParams = {}): Promise<{
  data: AuditLog[]
  total: number
}> {
  await requirePermission("logs.view")
  const admin = createAdminClient()

  const { page = 1, perPage = 50, resource, userId } = params
  const from = (page - 1) * perPage
  const to = from + perPage - 1

  let query = admin
    .from("audit_logs")
    .select("*, profiles(name, email)", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to)

  if (resource) query = query.eq("resource", resource)
  if (userId) query = query.eq("user_id", userId)

  const { data, count } = await query

  return { data: data ?? [], total: count ?? 0 }
}
