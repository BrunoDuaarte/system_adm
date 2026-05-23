"use server"
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { log } from "@/lib/audit"
import { getSession } from "@/lib/auth"

export async function loginAction(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Preencha e-mail e senha." }
  }

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) {
    return { error: "E-mail ou senha incorretos." }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("status")
    .eq("id", data.user.id)
    .single()

  if (profile?.status === "inactive") {
    await supabase.auth.signOut()
    return { error: "Seu acesso está desativado. Contate o administrador." }
  }

  await log({
    userId: data.user.id,
    action: "login",
    resource: "auth",
    metadata: { email },
  })

  redirect("/dashboard")
}

export async function logoutAction() {
  const supabase = await createClient()
  const session = await getSession()

  if (session) {
    await log({ userId: session.id, action: "logout", resource: "auth" })
  }

  await supabase.auth.signOut()
  redirect("/login")
}
