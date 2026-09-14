import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

    if (!url || !anonKey) {
      throw new Error(
        'Faltan VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY en el .env',
      )
    }

    client = createClient(url, anonKey)
  }
  return client
}
