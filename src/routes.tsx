import type { RouteObject } from 'react-router'
import { AppLayout } from './components/AppLayout'
import { MODULES } from './modules/catalog'
import { ModulePage } from './pages/ModulePage'
import { NotFound } from './pages/NotFound'

/**
 * Las rutas se derivan del catálogo: un módulo nuevo en `MODULES` aparece a la
 * vez en el menú y en el enrutador, sin poder quedar desincronizados.
 */
const moduleRoutes: RouteObject[] = MODULES.map((module) =>
  module.path === '/'
    ? { index: true, element: <ModulePage module={module} /> }
    : { path: module.path.slice(1), element: <ModulePage module={module} /> },
)

export const routes: RouteObject[] = [
  {
    path: '/',
    Component: AppLayout,
    children: [...moduleRoutes, { path: '*', Component: NotFound }],
  },
]
