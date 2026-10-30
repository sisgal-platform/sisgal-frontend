import "@testing-library/jest-dom/vitest";
import { AxiosHeaders, type AxiosAdapter } from "axios";
import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import apiClient from "../lib/axios";

const dashboardIndicators = {
    attendance: {
        averagePercentage: null,
        changeVsPreviousPeriod: null,
        weeklyDistribution: [],
    },
    workedHours: { total: null, changeVsPreviousPeriod: null, trend: [] },
    laborCosts: { total: null, changeVsPreviousPeriod: null, distribution: [] },
};

const testApiAdapter: AxiosAdapter = async (config) => {
    let data: unknown = [];

    if (config.url === "/dashboard/indicadores") {
        data = dashboardIndicators;
    } else if (config.url === "/prestamos/indicadores") {
        data = { cantidadPrestamosActivos: 0, montoTotalPrestamosActivos: 0 };
    } else if (config.url === "/asistencias/hoy") {
        data = {
            fecha: "2026-01-01",
            actualizadoEn: "2026-01-01T00:00:00.000Z",
            totalEmpleados: 0,
            presentes: 0,
            ausentes: 0,
            data: [],
        };
    }

    return {
        data,
        status: 200,
        statusText: "OK",
        headers: new AxiosHeaders(),
        config,
    };
};

// Las pruebas de interfaz nunca deben depender de un backend ni dejar XHR
// pendientes cuando CI no tiene VITE_API_URL configurada.
apiClient.defaults.adapter = testApiAdapter;

vi.mock("../services/auth/auth.service", () => ({
    supabase: {},
    signInWithPassword: vi.fn(),
    signOut: vi.fn().mockResolvedValue(undefined),
}));

afterEach(() => {
    cleanup();
    window.sessionStorage.clear();
});
