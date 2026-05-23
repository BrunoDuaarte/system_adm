import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

export default async function PerfisPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.permissions.includes("roles.view")) redirect("/dashboard")

  const admin = createAdminClient()
  const { data: roles } = await admin
    .from("roles")
    .select("*, role_permissions(permissions(key, description))")
    .order("name")

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Perfis de acesso</h1>
          <p className="text-sm text-gray-500">{roles?.length ?? 0} perfis cadastrados</p>
        </div>

        <div className="grid gap-4">
          {roles?.map(role => (
            <div key={role.id} className="bg-white rounded-2xl border border-gray-200 p-5">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-blue-100 text-blue-700 font-medium text-sm px-3 py-1 rounded-full">
                  {role.name}
                </span>
                {role.description && (
                  <span className="text-sm text-gray-500">{role.description}</span>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {(role.role_permissions as any[])?.map((rp: any) => (
                  <span
                    key={rp.permissions?.key}
                    className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded font-mono"
                  >
                    {rp.permissions?.key}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Voltar ao dashboard
          </a>
        </div>
      </div>
    </main>
  )
}