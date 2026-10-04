import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/lib/axios";
import { ApiError } from "@/lib/apiError";

import type { HistorialAsistencia } from "../interfaces/types";
import { asistenciaService } from "../services/asistenciaService";

vi.mock("@/lib/axios", () => ({
    default: {
        get: vi.fn(),
    },
}));

const client = vi.mocked(apiClient);

const HISTORIAL: HistorialAsistencia = {
    data: [],
    total: 0,
    pagina: 1,
    porPagina: 10,
    totalPaginas: 0,
};

describe("asistenciaService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        client.get.mockResolvedValue({ data: HISTORIAL });
    });

    it("consulta el historial sin filtros enviando solo la paginación", async () => {
        await expect(
            asistenciaService.consultarHistorial({
                empleadoId: "",
                fechaDesde: "",
                fechaHasta: "",
                estado: "",
                pagina: 1,
                porPagina: 10,
            }),
        ).resolves.toEqual(HISTORIAL);

        expect(client.get).toHaveBeenCalledWith("/asistencias/historial", {
            params: { pagina: 1, porPagina: 10 },
        });
    });

    it("envía el empleado como número, el rango de fechas y el estado", async () => {
        await asistenciaService.consultarHistorial({
            empleadoId: "6",
            fechaDesde: "2026-09-01",
            fechaHasta: "2026-09-30",
            estado: "INCOMPLETO",
            pagina: 3,
            porPagina: 25,
        });

        expect(client.get).toHaveBeenCalledWith("/asistencias/historial", {
            params: {
                empleadoId: 6,
                fechaDesde: "2026-09-01",
                fechaHasta: "2026-09-30",
                estado: "INCOMPLETO",
                pagina: 3,
                porPagina: 25,
            },
        });
    });

    it("omite los filtros vacíos", async () => {
        await asistenciaService.consultarHistorial({
            empleadoId: "",
            fechaDesde: "2026-09-01",
            fechaHasta: "",
            estado: "",
            pagina: 1,
            porPagina: 50,
        });

        expect(client.get).toHaveBeenCalledWith("/asistencias/historial", {
            params: { fechaDesde: "2026-09-01", pagina: 1, porPagina: 50 },
        });
    });

    it("consulta la asistencia del día", async () => {
        const asistencia = {
            fecha: "2026-10-04",
            actualizadoEn: "2026-10-04T15:00:00.000Z",
            totalEmpleados: 0,
            presentes: 0,
            ausentes: 0,
            data: [],
        };
        client.get.mockResolvedValue({ data: asistencia });

        await expect(asistenciaService.consultarHoy()).resolves.toEqual(
            asistencia,
        );
        expect(client.get).toHaveBeenCalledWith("/asistencias/hoy");
    });

    it("normaliza los errores de la asistencia del día a ApiError", async () => {
        client.get.mockRejectedValue(new Error("fallo"));

        await expect(asistenciaService.consultarHoy()).rejects.toBeInstanceOf(
            ApiError,
        );
    });

    it("normaliza los errores de la consulta a ApiError", async () => {
        client.get.mockRejectedValue(new Error("fallo"));

        await expect(
            asistenciaService.consultarHistorial({
                empleadoId: "",
                fechaDesde: "",
                fechaHasta: "",
                estado: "",
                pagina: 1,
                porPagina: 10,
            }),
        ).rejects.toBeInstanceOf(ApiError);
    });
});
