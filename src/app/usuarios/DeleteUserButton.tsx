"use client"
import { deleteUser } from "@/services/users"

export default function DeleteUserButton({ userId }: { userId: string }) {
  async function handleDelete() {
    if (!confirm("Excluir este usuário?")) return
    await deleteUser(userId)
  }

  return (
    <button
      onClick={handleDelete}
      className="text-xs text-red-500 hover:underline"
    >
      Excluir
    </button>
  )
}
