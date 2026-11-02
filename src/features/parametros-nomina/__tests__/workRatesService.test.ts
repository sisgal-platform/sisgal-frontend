import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/apiError";
import apiClient from "@/lib/axios";

import type { RegisterWorkRatesPayload, WorkRate } from "../interfaces/types";
import { workRatesService } from "../services/workRatesService";

vi.mock("@/lib/axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const client = vi.mocked(apiClient);

const RATE: WorkRate = {
    id: 20,
    type: "EXTRA_DIURNA",
    multiplier: 1.3,
    validFrom: "2026-11-01",
    validTo: null,
    status: "PROGRAMADA",
};

const PAYLOAD: RegisterWorkRatesPayload = {
    validFrom: "2026-11-01",
    rates: [{ type: "EXTRA_DIURNA", multiplier: 1.3 }],
};

/** Error de axios con la respuesta que devolvería el backend. */
function httpError(status: number, data?: unknown) {
    const config = { headers: new AxiosHeaders() };
    return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
        status,
        statusText: "",
        headers: {},
        config,
        data,
    });
}

describe("workRatesService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("consulta todas las versiones de los recargos", async () => {
        client.get.mockResolvedValue({ data: [RATE] });

        await expect(workRatesService.findAll()).resolves.toEqual([RATE]);
        expect(client.get).toHaveBeenCalledWith("/parametros-nomina/recargos");
    });

    it("registra los recargos que cambian y devuelve las versiones creadas", async () => {
        client.post.mockResolvedValue({ data: [RATE] });

        await expect(workRatesService.register(PAYLOAD)).resolves.toEqual([
            RATE,
        ]);
        expect(client.post).toHaveBeenCalledWith(
            "/parametros-nomina/recargos",
            PAYLOAD,
        );
    });

    it("convierte el rechazo por vigencia superpuesta en un ApiError con el mensaje del backend", async () => {
        client.post.mockRejectedValue(
            httpError(409, {
                message:
                    "Ya existe una versión del recargo de la hora extra diurna con vigencia desde 2026-11-01.",
            }),
        );

        const error = await workRatesService
            .register(PAYLOAD)
            .catch((reason: unknown) => reason);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
            status: 409,
            message:
                "Ya existe una versión del recargo de la hora extra diurna con vigencia desde 2026-11-01.",
        });
    });

    it("convierte los fallos de consulta en ApiError", async () => {
        client.get.mockRejectedValue(httpError(500));

        await expect(workRatesService.findAll()).rejects.toBeInstanceOf(
            ApiError,
        );
    });
});
