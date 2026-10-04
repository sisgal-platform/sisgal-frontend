import { screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { employeesService } from "@/features/empleados/services/employeesService";
import { renderApp } from "@/test/render";

import type { AsistenciaHoy } from "../interfaces/types";
import { asistenciaService } from "../services/asistenciaService";

const consultarHoy = vi.spyOn(asistenciaService, "consultarHoy");
const consultarHistorial = vi.spyOn(asistenciaService, "consultarHistorial");
const listarEmpleados = vi.spyOn(employeesService, "list");

const ASISTENCIA_HOY: AsistenciaHoy = {
    fecha: "2026-10-04",
    actualizadoEn: "2026-10-04T15:00:00.000Z",
    totalEmpleados: 0,
    presentes: 0,
    ausentes: 0,
    data: [],
};

beforeEach(() => {
    consultarHoy.mockReset().mockResolvedValue(ASISTENCIA_HOY);
    consultarHistorial.mockReset().mockResolvedValue({
        data: [],
        total: 0,
        pagina: 1,
        porPagina: 10,
        totalPaginas: 0,
    });
    listarEmpleados.mockReset().mockResolvedValue([]);
});

describe("Módulo de Asistencia", () => {
    it('abre en la pestaña "Asistencia hoy"', async () => {
        renderApp({ ruta: "/asistencia" });

        expect(
            await screen.findByRole("heading", { level: 1, name: "Asistencia" }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("tab", { name: "Asistencia hoy", selected: true }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", { level: 2, name: "Asistencia hoy" }),
        ).toBeInTheDocument();

        await waitFor(() => expect(consultarHoy).toHaveBeenCalled());
        // El historial no se consulta hasta abrir su pestaña.
        expect(consultarHistorial).not.toHaveBeenCalled();
    });

    it('muestra el historial al abrir la pestaña "Historial"', async () => {
        const { user } = renderApp({ ruta: "/asistencia" });

        await user.click(await screen.findByRole("tab", { name: "Historial" }));

        expect(
            screen.getByRole("tab", { name: "Historial", selected: true }),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("heading", {
                level: 2,
                name: "Historial de asistencia",
            }),
        ).toBeInTheDocument();
        expect(
            screen.queryByRole("heading", { level: 2, name: "Asistencia hoy" }),
        ).not.toBeInTheDocument();
        await waitFor(() => expect(consultarHistorial).toHaveBeenCalled());
    });

    it("bloquea el acceso a usuarios no administradores", async () => {
        const { router } = renderApp({
            ruta: "/asistencia",
            sesion: {
                user: { id: "u-2", nombre: "Laura Gómez", rol: "supervisor" },
                lastModule: null,
                startedAt: "2026-01-02T08:00:00.000Z",
            },
        });

        await waitFor(() => expect(router.state.location.pathname).toBe("/"));
        expect(consultarHoy).not.toHaveBeenCalled();
        expect(consultarHistorial).not.toHaveBeenCalled();
    });
});
