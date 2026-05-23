import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import PermissoesEditor from "./PermissoesEditor"

export default async function PermissoesPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.permissions.includes("permissoes.view" as any)) redirect("/dashboard")

  const podeEditar = session.permissions.includes("permissoes.update" as any)
  const admin = createAdminClient()

  const { data: roles } = await admin.from("roles").select("*").order("name")
  const { data: permissions } = await admin.from("permissions").select("*").order("key")
  const { data: rolePerms } = await admin.from("role_permissions").select("role_id, permission_id")

  // Monta mapa: roleId -> Set de permission_ids
  const mapa: Record<string, Set<string>> = {}
  roles?.forEach(r => { mapa[r.id] = new Set() })
  rolePerms?.forEach(rp => { mapa[rp.role_id]?.add(rp.permission_id) })

  // Serializa para passar ao client
  const mapaSerial: Record<string, string[]> = {}
  Object.entries(mapa).forEach(([rid, set]) => { mapaSerial[rid] = Array.from(set) })

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Gerenciar permissões</h1>
          <p className="text-sm text-gray-500">Defina quais permissões cada perfil possui</p>
        </div>

        <PermissoesEditor
          roles={roles ?? []}
          permissions={permissions ?? []}
          mapaInicial={mapaSerial}
          podeEditar={podeEditar}
        />

        <div className="mt-4">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Voltar ao dashboard</a>
        </div>
      </div>
    </main>
  )
}
