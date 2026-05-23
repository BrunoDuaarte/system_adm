import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import SalvarConfiguracoes from "./SalvarConfiguracoes"

export default async function ConfiguracoesPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.permissions.includes("configuracoes.view" as any)) redirect("/dashboard")

  const podeEditar = session.permissions.includes("configuracoes.update" as any)

  const admin = createAdminClient()
  const { data: settings } = await admin
    .from("system_settings")
    .select("*")
    .order("key")

  const settingsMap = Object.fromEntries((settings ?? []).map(s => [s.key, s]))

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Configurações do sistema</h1>
          <p className="text-sm text-gray-500">Ajuste as configurações gerais</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <div className="space-y-5">
            {settings?.map(s => (
              <div key={s.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{s.label}</label>
                {s.type === "boolean" ? (
                  <select
                    name={s.key}
                    defaultValue={s.value}
                    disabled={!podeEditar}
                    id={"setting-" + s.key}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  >
                    <option value="false">Desativado</option>
                    <option value="true">Ativado</option>
                  </select>
                ) : (
                  <input
                    type={s.type === "email" ? "email" : "text"}
                    name={s.key}
                    defaultValue={s.value}
                    disabled={!podeEditar}
                    id={"setting-" + s.key}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-50 disabled:text-gray-400"
                  />
                )}
              </div>
            ))}
          </div>

          {podeEditar && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <SalvarConfiguracoes settings={settings ?? []} />
            </div>
          )}

          {!podeEditar && (
            <p className="mt-4 text-xs text-gray-400">Você tem permissão apenas de leitura.</p>
          )}
        </div>

        <div className="mt-4">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Voltar ao dashboard</a>
        </div>
      </div>
    </main>
  )
}
