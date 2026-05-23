"use client"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

export default function MarcarTodasButton({ userId }: { userId: string }) {
  const router = useRouter()

  async function marcarTodas() {
    const supabase = createClient()
    await supabase.from("notifications").update({ read: true }).eq("user_id", userId).eq("read", false)
    router.refresh()
  }

  return (
    <button
      onClick={marcarTodas}
      className="text-sm text-blue-600 hover:underline"
    >
      Marcar todas como lidas
    </button>
  )
}
