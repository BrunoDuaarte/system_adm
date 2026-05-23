import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { listUsers } from "@/services/users"
import DeleteUserButton from "./DeleteUserButton"

export default async function UsuariosPage() {
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.permissions.includes("users.view")) redirect("/dashboard")

  const users = await listUsers()
  const podeEditar = session.permissions.includes("users.update")
  const podeExcluir = session.permissions.includes("users.delete")
  const podeCriar = session.permissions.includes("users.create")

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-semibold text-gray-900">Usuarios</h1>
            <p className="text-sm text-gray-500">{users.length} cadastrados</p>
          </div>
          {podeCriar && (
            <a href="/usuarios/novo" className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              + Novo usuario
            </a>
          )}
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Nome</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">E-mail</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Perfil</th>
                <th className="text-left px-4 py-3 text-gray-600 font-medium">Status</th>
                {(podeEditar || podeExcluir) && <th className="px-4 py-3" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900">{user.name}</td>
                  <td className="px-4 py-3 text-gray-600">{user.email}</td>
                  <td className="px-4 py-3">
                    {(user as any).roles ? (
                      <span className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full">{(user as any).roles.name}</span>
                    ) : (
                      <span className="text-gray-400 text-xs">sem perfil</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={user.status === "active" ? "text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700" : "text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700"}>
                      {user.status === "active" ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  {(podeEditar || podeExcluir) && (
                    <td className="px-4 py-3 flex gap-2 justify-end">
                      {podeEditar && (
                        <a href={"/usuarios/" + user.id + "/editar"} className="text-xs text-blue-600 hover:underline">Editar</a>
                      )}
                      {podeExcluir && user.id !== session.id && (
                        <DeleteUserButton userId={user.id} />
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-400 text-sm">Nenhum usuario encontrado.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="mt-4">
          <a href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">Voltar ao dashboard</a>
        </div>
      </div>
    </main>
  )
}