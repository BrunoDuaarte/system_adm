"use client"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

interface Setting {
  key: string
  value: string
  label: string
  type: string
}

export default function SalvarConfiguracoes({ settings }: { settings: Setting[] }) {
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null)

  async function salvar() {
    setLoading(true)
    setMsg(null)
    const supabase = createClient()

    for (const s of settings) {
      const el = document.getElementById("setting-" + s.key) as HTMLInputElement | HTMLSelectElement | null
      if (!el) continue
      await supabase
        .from("system_settings")
        .update({ value: el.value, updated_at: new Date().toISOString() })
        .eq("key", s.key)
    }

    setLoading(false)
    setMsg({ type: "success", text: "Configurações salvas com sucesso!" })
    setTimeout(() => setMsg(null), 3000)
  }

  return (
    <div>
      {msg && (
        <div className={"text-sm px-3 py-2 rounded-lg mb-3 " +
          (msg.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200")}>
          {msg.text}
        </div>
      )}
      <button
        onClick={salvar}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
      >
        {loading ? "Salvando..." : "Salvar configurações"}
      </button>
    </div>
  )
}
