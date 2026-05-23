import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"

export default async function RelatoriosPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.permissions.includes("relatorios.view" as any)) redirect("/dashboard")

  const admin = createAdminClient()

  // Total de usuários
  const { count: totalUsuarios } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })

  // Usuários ativos
  const { count: usuariosAtivos } = await admin
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("status", "active")

  // Total de logs
  const { count: totalLogs } = await admin
    .from("audit_logs")
    .select("*", { count: "exact", head: true })

  // Logs dos últimos 7 dias
  const seteDiasAtras = new Date()
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7)
  const { count: logsRecentes } = await admin
    .from("audit_logs")
    .select("*", { count: "exact", head: true })
    .gte("created_at", seteDiasAtras.toISOString())

  // Usuários por perfil
  const { data: porPerfil } = await admin
    .from("profiles")
    .select("roles(name)")

  const contagemPerfil: Record<string, number> = {}
  porPerfil?.forEach((p: any) => {
    const nome = p.roles?.name ?? "sem perfil"
    contagemPerfil[nome] = (contagemPerfil[nome] ?? 0) + 1
  })

  // Logs por ação
  const { data: todosLogs } = await admin
    .from("audit_logs")
    .select("action")

  const contagemAcao: Record<string, number> = {}
  todosLogs?.forEach((l: any) => {
    contagemAcao[l.action] = (contagemAcao[l.action] ?? 0) + 1
  })

  // Últimos 5 logs
  const { data: ultimosLogs } = await admin
    .from("audit_logs")
    .select("*, profiles(name)")
    .order("created_at", { ascending: false })
    .limit(5)

  const corAcao: Record<string, string> = {
    login:  "bg-green-100 text-green-700",
    logout: "bg-gray-100 text-gray-600",
    create: "bg-blue-100 text-blue-700",
    update: "bg-yellow-100 text-yellow-700",
    delete: "bg-red-100 text-red-700",
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Relatórios</h1>
          <p className="text-sm text-gray-500">Visão geral do sistema</p>
        </div>

        {/* Cards de resumo */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total de usuários</p>
            <p className="text-3xl font-bold text-gray-900">{totalUsuarios ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Usuários ativos</p>
            <p className="text-3xl font-bold text-green-600">{usuariosAtivos ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Total de logs</p>
            <p className="text-3xl font-bold text-gray-900">{totalLogs ?? 0}</p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <p className="text-sm text-gray-500 mb-1">Logs (7 dias)</p>
            <p className="text-3xl font-bold text-blue-600">{logsRecentes ?? 0}</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Usuários por perfil */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Usuários por perfil</h2>
            <div className="space-y-3">
              {Object.entries(contagemPerfil).map(([perfil, qtd]) => {
                const pct = Math.round((qtd / (totalUsuarios || 1)) * 100)
                return (
                  <div key={perfil}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-600 capitalize">{perfil}</span>
                      <span className="font-medium text-gray-900">{qtd}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-blue-500 h-2 rounded-full transition-all"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(contagemPerfil).length === 0 && (
                <p className="text-sm text-gray-400">Nenhum dado disponível.</p>
              )}
            </div>
          </div>

          {/* Ações registradas */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Ações registradas</h2>
            <div className="space-y-3">
              {Object.entries(contagemAcao).map(([acao, qtd]) => {
                const pct = Math.round((qtd / (totalLogs || 1)) * 100)
                return (
                  <div key={acao}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className={"text-xs px-2 py-0.5 rounded-full " + (corAcao[acao] ?? "bg-gray-100 text-gray-600")}>
                        {acao}
                      </span>
                      <span className="font-medium text-gray-900">{qtd}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-indigo-500 h-2 rounded-full transition-all"
                        style={{ width: pct + "%" }}
                      />
                    </div>
                  </div>
                )
              })}
              {Object.keys(contagemAcao).length === 0 && (
                <p className="text-sm text-gray-400">Nenhum dado disponível.</p>
              )}
            </div>
          </div>
        </div>

        {/* Últimas atividades */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Últimas atividades</h2>
          <div className="space-y-3">
            {ultimosLogs?.map((log: any) => (
              <div key={log.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <span className={"text-xs px-2 py-0.5 rounded-full " + (corAcao[log.action] ?? "bg-gray-100 text-gray-600")}>
                    {log.action}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{log.profiles?.name ?? "—"}</p>
                    <p className="text-xs text-gray-500">{log.resource}</p>
                  </div>
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(log.created_at).toLocaleString("pt-BR")}
                </span>
              </div>
            ))}
            {(!ultimosLogs || ultimosLogs.length === 0) && (
              <p className="text-sm text-gray-400">Nenhuma atividade registrada.</p>
            )}
          </div>
        </div>

        <div className="mt-4">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Voltar ao dashboard</a>
        </div>
      </div>
    </main>
  )
}
