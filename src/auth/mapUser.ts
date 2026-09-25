import type { User } from '@supabase/supabase-js'
import type { SessionUser } from '../session/types'

/** Convierte el User de Supabase al shape de sesión interno (nombre y rol). */
export function mapSupabaseUser(user: User): SessionUser {
  const metadata = user.user_metadata ?? {}

  // El nombre puede venir con distintas claves en user_metadata.
  const nombre =
    ([metadata['full_name'], metadata['fullName'], metadata['name']].find(
      (value): value is string =>
        typeof value === 'string' && value.length > 0,
    ) as string | undefined) ?? ''

  const role = user.app_metadata?.role

  return {
    id: user.id,
    nombre,
    rol: role === 'ADMINISTRADOR' ? 'administrador' : 'empleado',
  }
}
