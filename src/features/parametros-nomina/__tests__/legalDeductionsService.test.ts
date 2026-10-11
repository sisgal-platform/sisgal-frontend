import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/apiError";
import apiClient from "@/lib/axios";

import type {
    LegalDeduction,
    RegisterLegalDeductionsPayload,
} from "../interfaces/types";
import { legalDeductionsService } from "../services/legalDeductionsService";

vi.mock("@/lib/axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const client = vi.mocked(apiClient);

const DEDUCTION: LegalDeduction = {
    id: 20,
    type: "HEALTH_RATE",
    percentage: 4.5,
    validFrom: "2026-11-01",
    validTo: null,
    status: "PROGRAMADA",
};

const PAYLOAD: RegisterLegalDeductionsPayload = {
    validFrom: "2026-11-01",
    deductions: [{ type: "HEALTH_RATE", percentage: 4.5 }],
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

describe("legalDeductionsService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("consulta todas las versiones de los descuentos legales", async () => {
        client.get.mockResolvedValue({ data: [DEDUCTION] });

        await expect(legalDeductionsService.findAll()).resolves.toEqual([
            DEDUCTION,
        ]);
        expect(client.get).toHaveBeenCalledWith(
            "/parametros-nomina/descuentos-legales",
        );
    });

    it("registra los descuentos que cambian y devuelve las versiones creadas", async () => {
        client.post.mockResolvedValue({ data: [DEDUCTION] });

        await expect(legalDeductionsService.register(PAYLOAD)).resolves.toEqual(
            [DEDUCTION],
        );
        expect(client.post).toHaveBeenCalledWith(
            "/parametros-nomina/descuentos-legales",
            PAYLOAD,
        );
    });

    it("convierte el rechazo por vigencia superpuesta en un ApiError con el mensaje del backend", async () => {
        client.post.mockRejectedValue(
            httpError(409, {
                message:
                    "Ya existe una versión del descuento de salud con vigencia desde 2026-11-01.",
            }),
        );

        const error = await legalDeductionsService
            .register(PAYLOAD)
            .catch((reason: unknown) => reason);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
            status: 409,
            message:
                "Ya existe una versión del descuento de salud con vigencia desde 2026-11-01.",
        });
    });

    it("convierte los fallos de consulta en ApiError", async () => {
        client.get.mockRejectedValue(httpError(500));

        await expect(legalDeductionsService.findAll()).rejects.toBeInstanceOf(
            ApiError,
        );
    });
});
