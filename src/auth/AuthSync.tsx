import { useEffect } from 'react'
import { useSession } from '../session/useSession'
import { supabase } from './auth'
import { mapSupabaseUser } from './mapUser'

/**
 * Puente entre Supabase y la sesión de React: rehidrata la sesión al arrancar
 * y la mantiene sincronizada ante login, logout y refresco de token.
 */
export function AuthSync() {
  const { login, logout } = useSession()

  useEffect(() => {
    // Al arrancar restaura la sesión si hay un usuario activo en Supabase.
    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) login(mapSupabaseUser(data.session.user))
      else logout()
    })

    // En vivo: refleja cambios de estado (SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED).
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) login(mapSupabaseUser(session.user))
      else logout()
    })

    return () => data.subscription.unsubscribe()
  }, [login, logout])

  return null
}
