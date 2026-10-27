import type { RouteObject } from "react-router";

import { AppLayout } from "@/components/organisms/AppLayout";

import { RequireAuth } from "@/routes/guards/RequireAuth";
import { RequireRole } from "@/routes/guards/RequireRole";

import { DashboardPage } from "@/pages/dashboard/DashboardPage";
import { LoginPage } from "@/pages/login/LoginPage";
import { NotFoundPage } from "@/pages/not-found/NotFoundPage";

import { AsistenciaPage } from "@/pages/asistencia/AsistenciaPage";
import { ConfiguracionPage } from "@/pages/configuracion/ConfiguracionPage";
import { NominaPage } from "@/pages/nomina/NominaPage";
import { LiquidacionDetallePage } from "@/pages/nomina/LiquidacionDetallePage";
import { IncapacidadesPage } from "@/pages/incapacidades/IncapacidadesPage";
import { PersonalPage } from "@/pages/personal/PersonalPage";
import { PrestamosPage } from "@/pages/prestamos/PrestamosPage";
import { ReportesPage } from "@/pages/reportes/ReportesPage";
import { PoliticaTratamientoDatosPage } from "@/pages/politica/PoliticaTratamientoDatosPage";

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
                        path: "asistencia",
                        element: <AsistenciaPage />,
                    },
                    {
                        path: "nomina",
                        element: <NominaPage />,
                    },
                    {
                        path: "nomina/liquidaciones/:payrollPeriodId",
                        element: (
                            <RequireRole allowedRoles={["administrador"]}>
                                <LiquidacionDetallePage />
                            </RequireRole>
                        ),
                    },
                    {
                        path: "incapacidades",
                        element: <IncapacidadesPage />,
                    },
                    {
                        path: "personal",
                        element: <PersonalPage />,
                    },
                    {
                        path: "politica-tratamiento-datos-personales",
                        element: <PoliticaTratamientoDatosPage />,
                    },
                    {
                        path: "prestamos",
                        element: <PrestamosPage />,
                    },
                    {
                        path: "reportes",
                        element: <ReportesPage />,
                    },
                    {
                        path: "configuracion",
                        element: <ConfiguracionPage />,
                    },
                    {
                        path: "*",
                        element: <NotFoundPage />,
                    },
                ],
            },
        ],
    },
];
