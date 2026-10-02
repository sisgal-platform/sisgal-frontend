import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "../lib/axios";
import { prestamosService } from "../features/prestamos/services/prestamosService";

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
});
