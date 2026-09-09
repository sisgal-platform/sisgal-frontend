import { useEffect } from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router'
import { routes } from './routes'
import { SessionProvider } from './session/SessionProvider'
import { useSession } from './session/useSession'
import type { SessionUser } from './session/types'
import './App.css'

const router = createBrowserRouter(routes)

/**
 * Sesión provisional. La autenticación real llega con el Feature #19
 * ("Métodos de autenticación"); la HU34 solo requiere que exista un estado de
 * sesión que se conserve al navegar entre módulos.
 */
const ADMIN_DEMO: SessionUser = {
  id: 'admin-demo',
  nombre: 'Administrador',
  rol: 'administrador',
}

function SesionInicial() {
  const { isAuthenticated, login } = useSession()

  useEffect(() => {
    if (!isAuthenticated) login(ADMIN_DEMO)
  }, [isAuthenticated, login])

  return <RouterProvider router={router} />
}

function App() {
  return (
    <SessionProvider>
      <SesionInicial />
    </SessionProvider>
  )
}

export default App
