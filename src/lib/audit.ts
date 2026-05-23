import { createAdminClient } from "./supabase/server"
import { headers } from "next/headers"

interface LogParams {
  userId: string
  action: string
  resource: string
  resourceId?: string
  metadata?: Record<string, unknown>
}

export async function log(params: LogParams): Promise<void> {
  const admin = createAdminClient()
  const headersList = await headers()
  const ip = headersList.get("x-forwarded-for")?.split(",")[0] ?? null

  const { error } = await admin.from("audit_logs").insert({
    user_id: params.userId,
    action: params.action,
    resource: params.resource,
    resource_id: params.resourceId ?? null,
    metadata: params.metadata ?? {},
    ip_address: ip,
  })

  if (error) {
    console.error("[audit] Falha ao gravar log:", error.message)
  }
}
