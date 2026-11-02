import { beforeEach, describe, expect, it, vi } from "vitest";

import apiClient from "@/lib/axios";

import { sucursalesService } from "../services/sucursalesService";
import type { Sucursal, SucursalCreatePayload } from "../interfaces/types";

vi.mock("@/lib/axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
    },
}));

const client = vi.mocked(apiClient);

const SUCURSAL: Sucursal = {
    id: 4,
    name: "Sucursal Centro",
    address: "Carrera 43A # 10-15",
    phone: "6041234567",
    city: "Medellín",
    is_active: true,
    companyId: 1,
};

const NUEVA_SUCURSAL: SucursalCreatePayload = {
    nombre: "Sucursal Norte",
    direccion: "Avenida 80 # 40-10",
    telefono: "6047654321",
    ciudad: "Medellín",
    companyId: 1,
};

describe("sucursalesService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("lista todas las sucursales sin filtros", async () => {
        client.get.mockResolvedValue({ data: [SUCURSAL] });

        await expect(sucursalesService.list()).resolves.toEqual([SUCURSAL]);
        expect(client.get).toHaveBeenCalledWith("/sucursales", {
            params: undefined,
        });
    });

    it("lista sucursales según el filtro de activas", async () => {
        client.get.mockResolvedValue({ data: [SUCURSAL] });

        await sucursalesService.list(true);
        await sucursalesService.list(false);

        expect(client.get).toHaveBeenNthCalledWith(1, "/sucursales", {
            params: { activas: true },
        });
        expect(client.get).toHaveBeenNthCalledWith(2, "/sucursales", {
            params: { activas: false },
        });
    });

    it("consulta únicamente las sucursales activas", async () => {
        client.get.mockResolvedValue({ data: [SUCURSAL] });

        await expect(sucursalesService.listActive()).resolves.toEqual([
            SUCURSAL,
        ]);
        expect(client.get).toHaveBeenCalledWith("/sucursales/activas");
    });

    it("consulta una sucursal por id", async () => {
        client.get.mockResolvedValue({ data: SUCURSAL });

        await expect(sucursalesService.getById("4")).resolves.toEqual(SUCURSAL);
        expect(client.get).toHaveBeenCalledWith("/sucursales/4");
    });

    it("crea una sucursal y devuelve la respuesta del backend", async () => {
        client.post.mockResolvedValue({ data: SUCURSAL });

        await expect(sucursalesService.create(NUEVA_SUCURSAL)).resolves.toEqual(
            SUCURSAL,
        );
        expect(client.post).toHaveBeenCalledWith("/sucursales", NUEVA_SUCURSAL);
    });

    it("actualiza una sucursal usando su id y el payload parcial", async () => {
        const payload = { ciudad: "Bogotá" };
        client.patch.mockResolvedValue({
            data: { ...SUCURSAL, city: "Bogotá" },
        });

        await expect(sucursalesService.update("4", payload)).resolves.toEqual({
            ...SUCURSAL,
            city: "Bogotá",
        });
        expect(client.patch).toHaveBeenCalledWith("/sucursales/4", payload);
    });

    it("elimina una sucursal por id", async () => {
        client.delete.mockResolvedValue({ data: undefined });

        await expect(sucursalesService.remove("4")).resolves.toBeUndefined();
        expect(client.delete).toHaveBeenCalledWith("/sucursales/4");
    });
});
