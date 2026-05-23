import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { logoutAction } from "@/app/login/actions"
import { createAdminClient } from "@/lib/supabase/server"

export default async function DashboardPage() {
  const session = await getSession()
  if (!session) redirect("/login")

  const admin = createAdminClient()
  const { count: naoLidas } = await admin
    .from("notifications")
    .select("*", { count: "exact", head: true })
    .eq("user_id", session.id)
    .eq("read", false)

  const nav = [
    { href: "/usuarios",      label: "Usuários",      perm: "users.view" },
    { href: "/perfis",        label: "Perfis",         perm: "roles.view" },
    { href: "/permissoes",    label: "Permissões",     perm: "permissoes.view" },
    { href: "/relatorios",    label: "Relatórios",     perm: "relatorios.view" },
    { href: "/configuracoes", label: "Configurações",  perm: "configuracoes.view" },
    { href: "/logs",          label: "Logs",           perm: "logs.view" },
    { href: "/notificacoes",  label: "Notificações",   perm: null },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {session.name}
            {session.role && (
              <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">
                {session.role.name}
              </span>
            )}
          </span>
          <form action={logoutAction}>
            <button type="submit" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
              Sair
            </button>
          </form>
        </div>
      </header>

      <nav className="bg-white border-b border-gray-100 px-6 py-2 flex gap-6 text-sm overflow-x-auto">
        {nav.map(item => {
          const temPerm = item.perm === null || session.permissions.includes(item.perm as any)
          if (!temPerm) return null
          return (
            <a key={item.href} href={item.href} className="text-gray-600 hover:text-blue-600 whitespace-nowrap flex items-center gap-1">
              {item.label}
              {item.href === "/notificacoes" && (naoLidas ?? 0) > 0 && (
                <span className="bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  {naoLidas}
                </span>
              )}
            </a>
          )
        })}
      </nav>

      <div className="p-6 max-w-4xl mx-auto">
        <h2 className="text-xl font-medium text-gray-900 mb-2">
          Bem-vindo, {session.name.split(" ")[0]}!
        </h2>
        <p className="text-gray-500 text-sm mb-8">
          Você está autenticado como <strong>{session.role?.name ?? "sem perfil"}</strong>.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {nav.map(item => {
            const temPerm = item.perm === null || session.permissions.includes(item.perm as any)
            if (!temPerm) return null
            return (
              <a
                key={item.href}
                href={item.href}
                className="bg-white border border-gray-200 rounded-xl px-4 py-4 hover:border-blue-300 hover:shadow-sm transition-all group"
              >
                <p className="font-medium text-gray-800 group-hover:text-blue-600 text-sm">{item.label}</p>
                {item.href === "/notificacoes" && (naoLidas ?? 0) > 0 && (
                  <p className="text-xs text-red-500 mt-1">{naoLidas} não lida(s)</p>
                )}
              </a>
            )
          })}
        </div>
      </div>
    </main>
  )
}
