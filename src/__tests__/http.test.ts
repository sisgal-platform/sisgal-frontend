import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { ApiError, request } from "../api/http";
import { writeAccessToken } from "../auth/accessTokenStorage";

function respuesta(status: number, body?: unknown) {
    return new Response(body === undefined ? null : JSON.stringify(body), {
        status,
        headers: { "Content-Type": "application/json" },
    });
}

describe("Cliente HTTP del backend", () => {
    const fetchMock = vi.fn<typeof fetch>();

    beforeEach(() => {
        vi.stubGlobal("fetch", fetchMock);
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        fetchMock.mockReset();
    });

    it("envía el token de la sesión como Bearer y el cuerpo en JSON", async () => {
        writeAccessToken("token-de-prueba");
        fetchMock.mockResolvedValue(respuesta(201, { id: 1 }));

        const resultado = await request("/cargos", {
            method: "POST",
            body: { nombre: "Cajero" },
        });

        expect(resultado).toEqual({ id: 1 });
        const [url, init] = fetchMock.mock.calls[0];
        expect(url).toMatch(/\/cargos$/);
        expect(init?.method).toBe("POST");
        expect(init?.body).toBe(JSON.stringify({ nombre: "Cajero" }));
        expect(init?.headers).toMatchObject({
            Authorization: "Bearer token-de-prueba",
            "Content-Type": "application/json",
        });
    });

    it("no envía Authorization cuando no hay sesión", async () => {
        fetchMock.mockResolvedValue(respuesta(200, []));

        await request("/cargos");

        expect(fetchMock.mock.calls[0][1]?.headers).not.toHaveProperty("Authorization");
    });

    it("resuelve undefined en respuestas 204", async () => {
        fetchMock.mockResolvedValue(respuesta(204));

        await expect(request("/cargos/1", { method: "DELETE" })).resolves.toBeUndefined();
    });

    it("usa el mensaje del ErrorResponseDto del backend", async () => {
        fetchMock.mockResolvedValue(
            respuesta(409, {
                statusCode: 409,
                message: 'Ya existe un cargo con el nombre "Cocinero".',
                error: "Conflict",
            }),
        );

        await expect(request("/cargos")).rejects.toEqual(
            new ApiError(409, 'Ya existe un cargo con el nombre "Cocinero".'),
        );
    });

    it("une los mensajes de validación del ValidationPipe", async () => {
        fetchMock.mockResolvedValue(
            respuesta(400, {
                statusCode: 400,
                message: ["El nombre del cargo es obligatorio", "Otro error"],
                error: "Bad Request",
            }),
        );

        await expect(request("/cargos")).rejects.toThrow(
            "El nombre del cargo es obligatorio. Otro error",
        );
    });

    it("usa un mensaje genérico cuando el error no tiene cuerpo", async () => {
        fetchMock.mockResolvedValue(new Response("", { status: 500 }));

        await expect(request("/cargos")).rejects.toThrow(
            "Ocurrió un error inesperado. Intenta de nuevo.",
        );
    });

    it("informa cuando no hay conexión con el servidor", async () => {
        fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));

        const error = await request("/cargos").catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
            status: 0,
            message: "No fue posible conectar con el servidor. Intenta de nuevo.",
        });
    });
});
