import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import MarcarLidaButton from "./MarcarLidaButton"
import MarcarTodasButton from "./MarcarTodasButton"

export default async function NotificacoesPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const admin = createAdminClient()
  const { data: notificacoes } = await admin
    .from("notifications")
    .select("*")
    .eq("user_id", session.id)
    .order("created_at", { ascending: false })

  const naoLidas = notificacoes?.filter(n => !n.read).length ?? 0

  const icone: Record<string, string> = {
    info:    "bg-blue-100 text-blue-600",
    success: "bg-green-100 text-green-600",
    warning: "bg-yellow-100 text-yellow-600",
    error:   "bg-red-100 text-red-600",
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Notificações</h1>
            <p className="text-sm text-gray-500">
              {naoLidas > 0 ? naoLidas + " não lida(s)" : "Todas lidas"}
            </p>
          </div>
          {naoLidas > 0 && <MarcarTodasButton userId={session.id} />}
        </div>

        <div className="space-y-3">
          {notificacoes?.map(n => (
            <div
              key={n.id}
              className={"bg-white rounded-2xl border p-4 flex gap-4 items-start transition-all " +
                (n.read ? "border-gray-100 opacity-60" : "border-gray-200")}
            >
              <div className={"w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 " + (icone[n.type] ?? "bg-gray-100 text-gray-600")}>
                {n.type === "info" ? "i" : n.type === "success" ? "✓" : n.type === "warning" ? "!" : "✕"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                <p className="text-sm text-gray-500 mt-0.5">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {new Date(n.created_at).toLocaleString("pt-BR")}
                </p>
              </div>
              {!n.read && <MarcarLidaButton id={n.id} />}
            </div>
          ))}
          {(!notificacoes || notificacoes.length === 0) && (
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <p className="text-gray-400 text-sm">Nenhuma notificação.</p>
            </div>
          )}
        </div>

        <div className="mt-4">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">← Voltar ao dashboard</a>
        </div>
      </div>
    </main>
  )
}
