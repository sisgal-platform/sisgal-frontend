import type { AuthError, User } from '@supabase/supabase-js'
import { getSupabase } from '../supabase/client'

export type SignInResult = {
  user: User | null
  error: AuthError | null
}

export async function signInWithPassword(
  email: string,
  password: string,
): Promise<SignInResult> {
  const { data, error } = await getSupabase().auth.signInWithPassword({
    email,
    password,
  })
  return { user: data.user ?? null, error }
}

export async function signOut(): Promise<void> {
  const { error } = await getSupabase().auth.signOut()
  if (error) throw error
}
