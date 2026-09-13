import { Navigate, Outlet } from 'react-router'
import { useSession } from '../session/useSession'

export function RequireAdmin() {
  const { user } = useSession()

  if (!user || user.rol !== 'administrador') {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
