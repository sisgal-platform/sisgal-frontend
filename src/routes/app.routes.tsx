import type { RouteObject } from "react-router";

import { AppLayout } from "@/components/organisms/AppLayout";

import { RequireAuth } from "@/routes/guards/RequireAuth";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";

import { ConfiguracionPage } from "@/pages/configuracion/ConfiguracionPage";
import { PersonalPage } from "@/pages/personal/PersonalPage";
import { PrestamosPage } from "@/pages/prestamos/PrestamosPage";
// import { AsistenciaPage } from "@/pages/asistencia/AsistenciaPage";
// import { NominaPage } from "@/pages/nomina/NominaPage";
// etc.

export const routes: RouteObject[] = [
    {
        path: "/login",
        element: <LoginPage />,
    },
    {
        element: <RequireAuth />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        index: true,
                        element: <DashboardPage />,
                    },
                    {
                        path: "configuracion",
                        element: <ConfiguracionPage />,
                    },
                    {
                        path: "personal",
                        element: <PersonalPage />,
                    },
                    {
                        path: "prestamos",
                        element: <PrestamosPage />,
                    },
                    /*
                    {
                        path: "asistencia",
                        element: <AsistenciaPage />,
                    },
                    {
                        path: "nomina",
                        element: <NominaPage />,
                    },
                    */
                    {
                        path: "*",
                        element: <NotFoundPage />,
                    },
                ],
            },
        ],
    },
];
