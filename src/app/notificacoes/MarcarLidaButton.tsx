"use client"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function MarcarLidaButton({ id }: { id: string }) {
  const router = useRouter()

  async function marcar() {
    const supabase = createClient()
    await supabase.from("notifications").update({ read: true }).eq("id", id)
    router.refresh()
  }

  return (
    <button
      onClick={marcar}
      className="text-xs text-blue-600 hover:underline shrink-0"
    >
      Marcar lida
    </button>
  )
}
