import { AxiosError, AxiosHeaders } from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cargosService } from "../features/cargos/services/cargosService";
import { ApiError } from "../lib/apiError";
import apiClient from "../lib/axios";

vi.mock("../lib/axios", () => ({
    default: { get: vi.fn(), post: vi.fn(), patch: vi.fn(), delete: vi.fn() },
}));

const client = vi.mocked(apiClient);

/** Error de axios con la respuesta que devolvería el backend. */
function errorHttp(status: number, data?: unknown) {
    const config = { headers: new AxiosHeaders() };
    return new AxiosError("Request failed", "ERR_BAD_REQUEST", config, null, {
        status,
        statusText: "",
        headers: {},
        config,
        data,
    });
}

describe("Servicio de cargos", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        client.get.mockResolvedValue({ data: [] });
        client.post.mockResolvedValue({ data: { id: 1 } });
        client.patch.mockResolvedValue({ data: { id: 4 } });
        client.delete.mockResolvedValue({ data: undefined });
    });

    it.each([
        ["todos", undefined],
        ["activos", { activos: true }],
        ["inactivos", { activos: false }],
    ] as const)("lista los cargos con filtro %s", async (filtro, params) => {
        await cargosService.listar(filtro);

        expect(client.get).toHaveBeenCalledWith("/cargos", { params });
    });

    it("consulta el catálogo de cargos activos para formularios", async () => {
        await cargosService.listarActivos();

        expect(client.get).toHaveBeenCalledWith("/cargos/activos");
    });

    it("crea, actualiza y desactiva con el método HTTP correspondiente", async () => {
        const input = { nombre: "Cajero", descripcion: "" };

        await expect(cargosService.crear(input)).resolves.toEqual({ id: 1 });
        await expect(cargosService.actualizar(4, input)).resolves.toEqual({ id: 4 });
        await expect(cargosService.desactivar(4)).resolves.toBeUndefined();

        expect(client.post).toHaveBeenCalledWith("/cargos", input);
        expect(client.patch).toHaveBeenCalledWith("/cargos/4", input);
        expect(client.delete).toHaveBeenCalledWith("/cargos/4");
    });

    it("usa el mensaje del backend en los errores", async () => {
        client.post.mockRejectedValue(
            errorHttp(409, { message: 'Ya existe un cargo con el nombre "Cajero".' }),
        );

        await expect(
            cargosService.crear({ nombre: "Cajero", descripcion: "" }),
        ).rejects.toEqual(new ApiError(409, 'Ya existe un cargo con el nombre "Cajero".'));
    });

    it("une los mensajes de validación del ValidationPipe", async () => {
        client.post.mockRejectedValue(
            errorHttp(400, { message: ["nombre es obligatorio", "nombre es muy corto"] }),
        );

        const error = await cargosService
            .crear({ nombre: "", descripcion: "" })
            .catch((e: unknown) => e);

        expect(error).toBeInstanceOf(ApiError);
        expect(error).toMatchObject({
            status: 400,
            message: "nombre es obligatorio. nombre es muy corto",
        });
    });

    it("usa un mensaje genérico si el backend no envía uno", async () => {
        client.get.mockRejectedValue(errorHttp(500));

        await expect(cargosService.listar()).rejects.toMatchObject({
            status: 500,
            message: "Ocurrió un error inesperado. Intenta de nuevo.",
        });
    });

    it("informa cuando no hay conexión con el servidor", async () => {
        client.get.mockRejectedValue(new AxiosError("Network Error", "ERR_NETWORK"));

        await expect(cargosService.listar()).rejects.toMatchObject({
            status: 0,
            message: "No fue posible conectar con el servidor. Intenta de nuevo.",
        });
    });
});
