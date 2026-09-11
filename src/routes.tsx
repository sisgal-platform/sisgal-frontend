import type { RouteObject } from "react-router";
import { AppLayout } from "./components/AppLayout";
import { MODULES } from "./modules/catalog";
import { DashboardPage } from "./pages/DashboardPage";
import { ModulePage } from "./pages/ModulePage";
import { NotFound } from "./pages/NotFound";

/**
 * El dashboard tiene reglas especiales de seguridad y se renderiza en su propia
 * página, distinta del contenido genérico de los módulos.
 */
const moduleRoutes: RouteObject[] = MODULES.map((module) =>
    module.path === "/"
        ? { index: true, element: <DashboardPage /> }
        : {
              path: module.path.slice(1),
              element: <ModulePage module={module} />,
          },
);

export const routes: RouteObject[] = [
    {
        path: "/",
        Component: AppLayout,
        children: [...moduleRoutes, { path: "*", Component: NotFound }],
    },
];
