import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/apiError";
import apiClient from "@/lib/axios";

import type {
    RegisterWorkdayConfigPayload,
    WorkdayConfig,
} from "../interfaces/types";
import { workdayConfigService } from "../services/workdayConfigService";

vi.mock("@/lib/axios", () => ({
    default: {
        get: vi.fn(),
        post: vi.fn(),
    },
}));

const client = vi.mocked(apiClient);

const VERSION: WorkdayConfig = {
    id: 2,
    maxWeekHours: 42,
    maxDayHours: 8,
    dayStart: "06:00",
    dayEnd: "19:00",
    nightStart: "19:00",
    nightEnd: "06:00",
    validFrom: "2026-11-01",
    validTo: null,
    status: "PROGRAMADA",
};

const PAYLOAD: RegisterWorkdayConfigPayload = {
    maxWeekHours: 42,
    maxDayHours: 8,
    dayStart: "06:00",
    dayEnd: "19:00",
    nightStart: "19:00",
    nightEnd: "06:00",
    validFrom: "2026-11-01",
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

describe("workdayConfigService", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("consulta todas las versiones de la jornada laboral", async () => {
        client.get.mockResolvedValue({ data: [VERSION] });

        await expect(workdayConfigService.findAll()).resolves.toEqual([
            VERSION,
        ]);
        expect(client.get).toHaveBeenCalledWith(
            "/parametros-nomina/jornada-laboral",
        );
    });

    it("registra una versión y devuelve la respuesta del backend", async () => {
        client.post.mockResolvedValue({ data: VERSION });

        await expect(workdayConfigService.register(PAYLOAD)).resolves.toEqual(
            VERSION,
        );
        expect(client.post).toHaveBeenCalledWith(
            "/parametros-nomina/jornada-laboral",
            PAYLOAD,
        );
    });

    it("convierte el rechazo por vigencia superpuesta en un ApiError con el mensaje del backend", async () => {
        client.post.mockRejectedValue(
            httpError(409, {
                message:
                    "Ya existe una versión de la jornada laboral con vigencia desde 2026-11-01.",
            }),
        );

        const error = await workdayConfigService
            .register(PAYLOAD)
            .catch((reason: unknown) => reason);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
            status: 409,
            message:
                "Ya existe una versión de la jornada laboral con vigencia desde 2026-11-01.",
        });
    });

    it("une los mensajes de validación cuando el backend devuelve varios", async () => {
        client.post.mockRejectedValue(
            httpError(400, {
                message: [
                    "La jornada máxima semanal debe ser de al menos 1 hora",
                    "La fecha de inicio de vigencia debe tener formato YYYY-MM-DD",
                ],
            }),
        );

        await expect(workdayConfigService.register(PAYLOAD)).rejects.toThrow(
            "La jornada máxima semanal debe ser de al menos 1 hora. La fecha de inicio de vigencia debe tener formato YYYY-MM-DD",
        );
    });

    it("convierte los fallos de consulta en ApiError", async () => {
        client.get.mockRejectedValue(httpError(500));

        await expect(workdayConfigService.findAll()).rejects.toBeInstanceOf(
            ApiError,
        );
    });
});
