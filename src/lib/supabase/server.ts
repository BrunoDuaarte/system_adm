import { createServerClient } from "@supabase/ssr"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
<<<<<<< HEAD
        setAll(cookiesToSet) {
=======
        setAll(cookiesToSet: Array<{ name: string; value: string; options?: any }>) {
>>>>>>> 13f66195e627efed488ca212ed3daeb5e77a3ffc
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
<<<<<<< HEAD
            // Server Component — cookies só podem ser alterados em Actions/Route Handlers
=======
            // Server Component
>>>>>>> 13f66195e627efed488ca212ed3daeb5e77a3ffc
          }
        },
      },
    }
  )
}

export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  )
<<<<<<< HEAD
}
=======
}
>>>>>>> 13f66195e627efed488ca212ed3daeb5e77a3ffc
