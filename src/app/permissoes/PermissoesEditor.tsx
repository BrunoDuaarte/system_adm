"use client"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Role { id: string; name: string; description: string | null }
interface Permission { id: string; key: string; description: string | null }

export default function PermissoesEditor({
  roles, permissions, mapaInicial, podeEditar
}: {
  roles: Role[]
  permissions: Permission[]
  mapaInicial: Record<string, string[]>
  podeEditar: boolean
}) {
  const [roleAtivo, setRoleAtivo] = useState(roles[0]?.id ?? "")
  const [mapa, setMapa] = useState<Record<string, Set<string>>>(
    Object.fromEntries(Object.entries(mapaInicial).map(([k, v]) => [k, new Set(v)]))
  )
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)

  const permsDoRole = mapa[roleAtivo] ?? new Set()

  function toggle(permId: string) {
    if (!podeEditar) return
    setMapa(prev => {
      const novo = new Map(Object.entries(prev).map(([k, v]) => [k, new Set(v)]))
      const set = novo.get(roleAtivo) ?? new Set()
      set.has(permId) ? set.delete(permId) : set.add(permId)
      novo.set(roleAtivo, set)
      return Object.fromEntries(novo)
    })
  }

  async function salvar() {
    setLoading(true)
    setMsg(null)
    const supabase = createClient()

    // Remove todas as permissões atuais do role
    await supabase.from("role_permissions").delete().eq("role_id", roleAtivo)

    // Insere as novas
    const novas = Array.from(permsDoRole).map(pid => ({
      role_id: roleAtivo,
      permission_id: pid
    }))

    if (novas.length > 0) {
      await supabase.from("role_permissions").insert(novas)
    }

    setLoading(false)
    setMsg("Permissões salvas!")
    setTimeout(() => setMsg(null), 3000)
  }

  // Agrupa permissões por recurso
  const grupos: Record<string, Permission[]> = {}
  permissions.forEach(p => {
    const recurso = p.key.split(".")[0]
    if (!grupos[recurso]) grupos[recurso] = []
    grupos[recurso].push(p)
  })

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Tabs de roles */}
      <div className="flex border-b border-gray-200 overflow-x-auto">
        {roles.map(role => (
          <button
            key={role.id}
            onClick={() => setRoleAtivo(role.id)}
            className={"px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors " +
              (roleAtivo === role.id
                ? "border-b-2 border-blue-600 text-blue-600"
                : "text-gray-500 hover:text-gray-700")}
          >
            {role.name}
          </button>
        ))}
      </div>

      {/* Grid de permissões */}
      <div className="p-6">
        <div className="space-y-6">
          {Object.entries(grupos).map(([recurso, perms]) => (
            <div key={recurso}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                {recurso}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {perms.map(perm => {
                  const ativo = permsDoRole.has(perm.id)
                  return (
                    <button
                      key={perm.id}
                      onClick={() => toggle(perm.id)}
                      disabled={!podeEditar}
                      className={"flex items-center gap-3 px-4 py-3 rounded-xl border text-left transition-all " +
                        (ativo
                          ? "border-blue-200 bg-blue-50"
                          : "border-gray-100 bg-gray-50 hover:border-gray-200") +
                        (!podeEditar ? " cursor-default" : " cursor-pointer")}
                    >
                      <div className={"w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 " +
                        (ativo ? "border-blue-500 bg-blue-500" : "border-gray-300")}>
                        {ativo && <span className="text-white text-xs">✓</span>}
                      </div>
                      <div>
                        <p className="text-xs font-mono font-medium text-gray-700">{perm.key}</p>
                        {perm.description && (
                          <p className="text-xs text-gray-400 mt-0.5">{perm.description}</p>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {podeEditar && (
          <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-4">
            <button
              onClick={salvar}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
            >
              {loading ? "Salvando..." : "Salvar permissões"}
            </button>
            {msg && <span className="text-sm text-green-600">{msg}</span>}
          </div>
        )}
        {!podeEditar && (
          <p className="mt-4 text-xs text-gray-400">Você tem permissão apenas de leitura.</p>
        )}
      </div>
    </div>
  )
}
