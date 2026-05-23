import { redirect } from "next/navigation"
import { getSession } from "@/lib/auth"
import { createAdminClient } from "@/lib/supabase/server"
import { updateUser } from "@/services/users"

export default async function EditarUsuarioPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getSession()
  if (!session) redirect("/login")
  if (!session.permissions.includes("users.update")) redirect("/dashboard")

  const admin = createAdminClient()
  const { data: user } = await admin.from("profiles").select("*, roles(*)").eq("id", id).single()
  if (!user) redirect("/usuarios")

  const { data: roles } = await admin.from("roles").select("*").order("name")

  async function handleUpdate(formData: FormData) {
    "use server"
    await updateUser(id, formData)
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Editar usuário</h1>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form action={handleUpdate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input type="text" name="name" defaultValue={user.name} required className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de acesso</label>
              <select name="role_id" defaultValue={user.role_id ?? ""} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sem perfil</option>
                {roles?.map(role => (<option key={role.id} value={role.id}>{role.name}</option>))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select name="status" defaultValue={user.status} className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="active">Ativo</option>
                <option value="inactive">Inativo</option>
              </select>
            </div>
            <div className="flex gap-3 pt-2">
              <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg text-sm transition-colors">Salvar</button>
              <a href="/usuarios" className="flex-1 text-center bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm transition-colors">Cancelar</a>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}
