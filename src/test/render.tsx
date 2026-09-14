import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { createMemoryRouter, RouterProvider } from 'react-router'
import { routes } from '../routes'
import { SessionProvider } from '../session/SessionProvider'
import type { SessionState } from '../session/types'
import { ToastProvider } from '../toast/ToastProvider'

const SESION_ADMIN: SessionState = {
  user: { id: 'admin-test', nombre: 'Ana Ruiz', rol: 'administrador' },
  lastModule: null,
  startedAt: '2026-01-01T08:00:00.000Z',
}

type Opciones = {
  /** Ruta inicial del router en memoria. */
  ruta?: string
  /** Permite arrancar sin sesión o con una sesión distinta. */
  sesion?: SessionState
}

/**
 * Monta la app completa (rutas reales + sesión) sobre un router en memoria,
 * para que las pruebas ejerciten la navegación tal como ocurre en el navegador.
 */
export function renderApp({ ruta = '/', sesion = SESION_ADMIN }: Opciones = {}) {
  const router = createMemoryRouter(routes, { initialEntries: [ruta] })

  const utils = render(
    <SessionProvider initialState={sesion}>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </SessionProvider>,
  )

  return { ...utils, router, user: userEvent.setup() }
}
