import { useEffect } from 'react'
import { useSession } from '../session/useSession'
import { getSupabase } from '../supabase/client'
import { mapSupabaseUser } from './mapUser'

export function AuthSync() {
  const { login, logout } = useSession()

  useEffect(() => {
    const supabase = getSupabase()

    supabase.auth.getSession().then(({ data }) => {
      if (data.session?.user) login(mapSupabaseUser(data.session.user))
      else logout()
    })

    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) login(mapSupabaseUser(session.user))
      else logout()
    })

    return () => data.subscription.unsubscribe()
  }, [login, logout])

  return null
}
