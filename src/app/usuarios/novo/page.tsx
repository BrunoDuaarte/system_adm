'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createUser } from '@/services/users'

export default function NovoUsuarioPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setLoading(true)
    setError(null)
    const result = await createUser(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    } else {
      router.push('/usuarios')
    }
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-lg mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900">Novo usuário</h1>
          <p className="text-sm text-gray-500">Preencha os dados do novo usuário</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-6">
          <form action={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-mail</label>
              <input
                type="email"
                name="email"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Senha</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Mínimo 6 caracteres"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Perfil de acesso</label>
              <select
                name="role_id"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Sem perfil</option>
                <option value="00000000-0000-0000-0000-000000000001">Admin</option>
                <option value="00000000-0000-0000-0000-000000000002">Gerente</option>
                <option value="00000000-0000-0000-0000-000000000003">Operador</option>
                <option value="00000000-0000-0000-0000-000000000004">Visualizador</option>
              </select>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {error}
              </div>
            )}

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-lg text-sm transition-colors"
              >
                {loading ? 'Criando...' : 'Criar usuário'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/usuarios')}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 rounded-lg text-sm transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
}