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
                        element: (
                            <RequireRole allowedRoles={["administrador"]}>
                                <DashboardPage />
                            </RequireRole>
                        ),
                    },
                    {
                        path: "asistencia",
                        element: (
                            <RequireRole allowedRoles={["administrador"]}>
                                <AsistenciaPage />
                            </RequireRole>
                        ),
                    },
                    {
                        path: "nomina",
                        element: (
                            <RequireRole allowedRoles={["administrador"]}>
                                <NominaPage />
                            </RequireRole>
                        ),
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
                        element: (
                            <RequireRole allowedRoles={["administrador"]}>
                                <IncapacidadesPage />
                            </RequireRole>
                        ),
                    },
                    {
                        path: "personal",
                        element: (
                            <RequireRole allowedRoles={["administrador"]}>
                                <PersonalPage />
                            </RequireRole>
                        ),
                    },
                    {
                        path: "politica-tratamiento-datos-personales",
                        element: <PoliticaTratamientoDatosPage />,
                    },
                    {
                        path: "prestamos",
                        element: (
                            <RequireRole allowedRoles={["administrador"]}>
                                <PrestamosPage />
                            </RequireRole>
                        ),
                    },
                    {
                        path: "configuracion",
                        element: (
                            <RequireRole allowedRoles={["administrador"]}>
                                <ConfiguracionPage />
                            </RequireRole>
                        ),
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
