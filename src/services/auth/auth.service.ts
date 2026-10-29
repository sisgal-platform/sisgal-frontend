import { createClient, type AuthError, type User } from '@supabase/supabase-js'

/** Cliente compartido de Supabase, fuente de verdad de la autenticación. */
export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export type SignInResult = {
  user: User | null
  error: AuthError | null
}

/** Inicia sesión con email + contraseña; devuelve el usuario o el error de Supabase. */
export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  return { user: data.user ?? null, error }
}

/** Cierra la sesión actual en Supabase. */
export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}
