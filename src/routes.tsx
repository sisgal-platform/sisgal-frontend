import type { RouteObject } from 'react-router'
import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './components/AppLayout'
import { MODULES, type AppModule } from './modules/catalog'
import { CargosPage } from './pages/CargosPage'
import { ConfiguracionPage } from './pages/ConfiguracionPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ModulePage } from './pages/ModulePage'
import { NotFound } from './pages/NotFound'

function moduleElement(module: AppModule) {
    if (module.id === 'configuracion') return <ConfiguracionPage module={module} />
    return <ModulePage module={module} />
}

const moduleRoutes: RouteObject[] = MODULES.map((module) =>
    module.path === '/'
        ? { index: true, element: <DashboardPage /> }
        : {
              path: module.path.slice(1),
              element: moduleElement(module),
          },
)

export const routes: RouteObject[] = [
    { path: '/login', Component: LoginPage },
    {
        Component: RequireAuth,
        children: [
            {
                path: '/',
                Component: AppLayout,
                children: [
                    ...moduleRoutes,
                    { path: 'configuracion/cargos', Component: CargosPage },
                    { path: '*', Component: NotFound },
                ],
            },
        ],
    },
]
