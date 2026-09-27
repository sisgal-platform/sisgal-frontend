import { beforeEach, describe, expect, it, vi } from "vitest";
import { request } from "../api/http";
import { cargosApi } from "../cargos/cargosApi";

vi.mock("../api/http", () => ({ request: vi.fn() }));

const requestMock = vi.mocked(request);

describe("API de cargos", () => {
    beforeEach(() => {
        requestMock.mockReset();
        requestMock.mockResolvedValue(undefined);
    });

    it.each([
        ["todos", "/cargos"],
        ["activos", "/cargos?activos=true"],
        ["inactivos", "/cargos?activos=false"],
    ] as const)("lista los cargos con filtro %s", async (filtro, url) => {
        await cargosApi.listar(filtro);

        expect(requestMock).toHaveBeenCalledWith(url);
    });

    it("consulta el catálogo de cargos activos para formularios", async () => {
        await cargosApi.listarActivos();

        expect(requestMock).toHaveBeenCalledWith("/cargos/activos");
    });

    it("crea, actualiza y desactiva con el método HTTP correspondiente", async () => {
        const input = { nombre: "Cajero", descripcion: "" };

        await cargosApi.crear(input);
        await cargosApi.actualizar(4, input);
        await cargosApi.desactivar(4);

        expect(requestMock.mock.calls).toEqual([
            ["/cargos", { method: "POST", body: input }],
            ["/cargos/4", { method: "PATCH", body: input }],
            ["/cargos/4", { method: "DELETE" }],
        ]);
    });
});
