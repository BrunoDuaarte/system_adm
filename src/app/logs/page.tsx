import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { listLogs } from "@/services/logs"

export default async function LogsPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.permissions.includes("logs.view")) redirect("/dashboard")

  let logs: any[] = []
  let total = 0

  try {
    const result = await listLogs({ perPage: 50 })
    logs = result.data
    total = result.total
  } catch {
    // erro silencioso — mostra tabela vazia
  }

  const actionLabel: Record<string, string> = {
    login: "Login",
    logout: "Logout",
    create: "Criou",
    update: "Editou",
    delete: "Excluiu",
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Logs de auditoria</h1>
          <p className="text-sm text-gray-500">{total} registros encontrados</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Data</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Usuário</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Ação</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Recurso</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">IP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {logs.map((log: any) => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap text-xs">
                    {new Date(log.created_at).toLocaleString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {log.profiles?.name ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={"text-xs px-2 py-0.5 rounded-full " + (
                      log.action === "delete" ? "bg-red-100 text-red-700" :
                      log.action === "create" ? "bg-green-100 text-green-700" :
                      "bg-gray-100 text-gray-600"
                    )}>
                      {actionLabel[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">
                    {log.resource}
                    {log.resource_id && (
                      <span className="text-gray-400 ml-1">#{log.resource_id.slice(0, 8)}</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-400 text-xs font-mono">
                    {log.ip_address ?? "—"}
                  </td>
                </tr>
              ))}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">
                    Nenhum log encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
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
