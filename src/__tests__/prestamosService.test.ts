import { render, screen } from "@testing-library/react";
import { createElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "../lib/axios";
import { PrestamosTable } from "../features/prestamos/components/PrestamosTable";
import {
    normalizarRangoFechas,
    prestamosService,
} from "../features/prestamos/services/prestamosService";

vi.mock("../lib/axios", () => ({
    default: { get: vi.fn() },
}));

const client = vi.mocked(apiClient);

describe("Servicio de préstamos", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("consulta los indicadores de préstamos activos", async () => {
        const indicadores = {
            cantidadPrestamosActivos: 12,
            montoTotalPrestamosActivos: 15000000,
        };
        client.get.mockResolvedValue({ data: indicadores });

        await expect(prestamosService.obtenerIndicadores()).resolves.toEqual(
            indicadores,
        );
        expect(client.get).toHaveBeenCalledWith("/prestamos/indicadores");
    });

    it("consulta los préstamos usando los filtros de la pantalla", async () => {
        const prestamos = [{ id: 1 }];
        client.get.mockResolvedValue({ data: prestamos });

        await expect(
            prestamosService.obtenerTodos({
                busqueda: "María Pérez",
                estado: "ACTIVO",
                fechaDesde: "2026-01-10",
                fechaHasta: "2026-01-15",
            }),
        ).resolves.toEqual(prestamos);

        expect(client.get).toHaveBeenCalledWith("/prestamos", {
            params: {
                nombreEmpleado: "María Pérez",
                estado: "ACTIVO",
                fechaDesde: "2026-01-10",
                fechaHasta: "2026-01-15",
            },
        });
    });

    it("envía la búsqueda numérica como documento exacto", async () => {
        client.get.mockResolvedValue({ data: [] });

        await prestamosService.obtenerTodos({
            busqueda: "123456789",
            estado: "",
            fechaDesde: "",
            fechaHasta: "",
        });

        expect(client.get).toHaveBeenCalledWith("/prestamos", {
            params: { documento: "123456789" },
        });
    });

    it("normaliza un rango de fechas cuando la fecha final es anterior a la inicial", () => {
        expect(
            normalizarRangoFechas({
                fechaDesde: "2026-02-10",
                fechaHasta: "2026-02-01",
            }),
        ).toEqual({
            fechaDesde: "2026-02-01",
            fechaHasta: "2026-02-10",
        });
    });

    it("renderiza el tipo de documento del empleado en la tabla", () => {
        render(
            createElement(PrestamosTable, {
                prestamos: [
                    {
                        id: 1,
                        employee: {
                            id: 7,
                            firstName: "Ana",
                            lastName: "Ruiz",
                            documentType: "CC",
                            document: "1234567890",
                        },
                        totalAmount: 3000000,
                        installmentAmount: 250000,
                        totalInstallments: 12,
                        pendingInstallments: 10,
                        outstandingBalance: 1250000,
                        grantedAt: "2026-01-10T00:00:00.000Z",
                        status: "ACTIVO",
                        createdAt: "2026-01-10T00:00:00.000Z",
                        updatedAt: "2026-02-10T00:00:00.000Z",
                    },
                ],
                cargando: false,
                error: null,
                onReintentar: () => undefined,
            }),
        );

        expect(screen.getByText("CC")).toBeInTheDocument();
        expect(screen.getByText("1234567890")).toBeInTheDocument();
    });
});
