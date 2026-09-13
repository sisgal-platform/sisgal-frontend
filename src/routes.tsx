import type { RouteObject } from 'react-router'
import { RequireAdmin } from './auth/RequireAdmin'
import { RequireAuth } from './auth/RequireAuth'
import { AppLayout } from './components/AppLayout'
import { MODULES } from './modules/catalog'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { ModulePage } from './pages/ModulePage'
import { NotFound } from './pages/NotFound'
import { SignupPage } from './pages/SignupPage'

const moduleRoutes: RouteObject[] = MODULES.map((module) =>
    module.path === '/'
        ? { index: true, element: <DashboardPage /> }
        : {
              path: module.path.slice(1),
              element: <ModulePage module={module} />,
          },
)

export const routes: RouteObject[] = [
    { path: '/login', Component: LoginPage },
    {
        Component: RequireAuth,
        children: [
            {
                path: '/signup',
                Component: RequireAdmin,
                children: [{ index: true, Component: SignupPage }],
            },
            {
                path: '/',
                Component: AppLayout,
                children: [...moduleRoutes, { path: '*', Component: NotFound }],
            },
        ],
    },
]