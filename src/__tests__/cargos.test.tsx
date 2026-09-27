import { screen, waitFor, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { Cargo } from "../features/cargos/interfaces/types";
import { cargosService } from "../features/cargos/services/cargosService";
import { ApiError } from "../lib/apiError";
import { renderApp } from "../test/render";

vi.mock("../features/cargos/services/cargosService", () => ({
    cargosService: {
        listar: vi.fn(),
        listarActivos: vi.fn(),
        crear: vi.fn(),
        actualizar: vi.fn(),
        desactivar: vi.fn(),
    },
}));

const api = vi.mocked(cargosService);

const COCINERO: Cargo = {
    id: 1,
    name: "Cocinero",
    description: "Línea caliente",
    is_active: true,
};

const MESERO: Cargo = {
    id: 2,
    name: "Mesero",
    description: null,
    is_active: false,
};

/** Abre Configuración y selecciona la pestaña de cargos. */
async function abrirCargos() {
    const utils = renderApp({ ruta: "/configuracion" });
    await utils.user.click(screen.getByRole("tab", { name: "Cargos" }));
    return utils;
}

async function esperarListado() {
    return screen.findByRole("table", { name: "Catálogo de cargos" });
}

function fila(nombre: string) {
    const celda = screen.getByRole("cell", { name: nombre });
    return celda.closest("tr") as HTMLElement;
}

describe("Parametrización de cargos (HU41)", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        api.listar.mockResolvedValue([COCINERO, MESERO]);
    });

    describe("CA01 – Consultar cargos", () => {
        it("muestra los cargos registrados con su estado", async () => {
            await abrirCargos();

            await esperarListado();

            expect(
                screen.getByRole("heading", { level: 2, name: "Cargos" }),
            ).toBeInTheDocument();
            expect(within(fila("Cocinero")).getByText("Activo")).toBeInTheDocument();
            expect(within(fila("Mesero")).getByText("Inactivo")).toBeInTheDocument();
            expect(api.listar).toHaveBeenCalledWith("todos");
        });

        it("filtra los cargos por estado", async () => {
            const { user } = await abrirCargos();
            await esperarListado();

            api.listar.mockResolvedValue([MESERO]);
            await user.selectOptions(screen.getByLabelText("Estado"), "inactivos");

            await waitFor(() =>
                expect(screen.queryByRole("cell", { name: "Cocinero" })).not.toBeInTheDocument(),
            );
            expect(api.listar).toHaveBeenLastCalledWith("inactivos");
        });

        it("informa cuando no hay cargos", async () => {
            api.listar.mockResolvedValue([]);

            await abrirCargos();

            expect(await screen.findByText("No hay cargos para mostrar.")).toBeInTheDocument();
        });

        it("muestra el error de carga y permite reintentar", async () => {
            api.listar.mockRejectedValueOnce(
                new ApiError(0, "No fue posible conectar con el servidor. Intenta de nuevo."),
            );
            const { user } = await abrirCargos();

            const alerta = await screen.findByRole("alert");
            expect(alerta).toHaveTextContent("No fue posible conectar con el servidor");

            await user.click(within(alerta).getByRole("button", { name: "Reintentar" }));

            await esperarListado();
            expect(api.listar).toHaveBeenCalledTimes(2);
        });

        it("bloquea el acceso a usuarios no administradores", async () => {
            const { router } = renderApp({
                ruta: "/configuracion",
                sesion: {
                    user: { id: "u-2", nombre: "Laura Gómez", rol: "supervisor" },
                    lastModule: null,
                    startedAt: "2026-01-02T08:00:00.000Z",
                },
            });

            await waitFor(() => expect(router.state.location.pathname).toBe("/"));
            expect(screen.queryByRole("tab", { name: "Cargos" })).not.toBeInTheDocument();
            expect(api.listar).not.toHaveBeenCalled();
        });
    });

    describe("CA02 / CA05 / CA08 – Registrar cargo", () => {
        it("registra un cargo, confirma la operación y refresca el listado", async () => {
            api.crear.mockResolvedValue({ id: 3, name: "Cajero", description: null, is_active: true });
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Nuevo cargo" }));
            const dialogo = screen.getByRole("dialog", { name: "Nuevo cargo" });

            expect(within(dialogo).getByLabelText(/Nombre/)).toHaveFocus();

            await user.type(within(dialogo).getByLabelText(/Nombre/), "  Cajero ");
            await user.click(within(dialogo).getByRole("button", { name: "Registrar cargo" }));

            expect(api.crear).toHaveBeenCalledWith({ nombre: "Cajero", descripcion: "" });
            expect(
                await screen.findByText('El cargo "Cajero" se registró correctamente.'),
            ).toBeInTheDocument();
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            await waitFor(() => expect(api.listar).toHaveBeenCalledTimes(2));
        });

        it("exige el nombre del cargo", async () => {
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Nuevo cargo" }));
            await user.type(screen.getByLabelText(/Nombre/), "   ");
            await user.click(screen.getByRole("button", { name: "Registrar cargo" }));

            expect(screen.getByText("El nombre del cargo es obligatorio.")).toBeInTheDocument();
            expect(screen.getByLabelText(/Nombre/)).toHaveAttribute("aria-invalid", "true");
            expect(api.crear).not.toHaveBeenCalled();
        });

        it("informa junto al campo cuando el nombre ya existe", async () => {
            api.crear.mockRejectedValue(
                new ApiError(409, 'Ya existe un cargo con el nombre "Cocinero".'),
            );
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Nuevo cargo" }));
            await user.type(screen.getByLabelText(/Nombre/), "cocinero");
            await user.click(screen.getByRole("button", { name: "Registrar cargo" }));

            expect(
                await screen.findByText('Ya existe un cargo con el nombre "Cocinero".'),
            ).toBeInTheDocument();
            expect(screen.getByRole("dialog", { name: "Nuevo cargo" })).toBeInTheDocument();
        });

        it("muestra los errores inesperados sin cerrar el formulario", async () => {
            api.crear.mockRejectedValue(new ApiError(500, "Internal server error"));
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Nuevo cargo" }));
            await user.type(screen.getByLabelText(/Nombre/), "Cajero");
            await user.click(screen.getByRole("button", { name: "Registrar cargo" }));

            const dialogo = screen.getByRole("dialog", { name: "Nuevo cargo" });
            expect(await within(dialogo).findByRole("alert")).toHaveTextContent(
                "Internal server error",
            );
            expect(within(dialogo).getByRole("button", { name: "Registrar cargo" })).toBeEnabled();
        });

        it("cierra el formulario con Escape sin registrar", async () => {
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Nuevo cargo" }));
            await user.keyboard("{Escape}");

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(api.crear).not.toHaveBeenCalled();
        });
    });

    describe("CA03 – Actualizar cargo", () => {
        it("muestra la información actual y guarda los cambios", async () => {
            api.actualizar.mockResolvedValue({ ...COCINERO, name: "Jefe de cocina" });
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Actualizar Cocinero" }));
            const dialogo = screen.getByRole("dialog", { name: "Actualizar cargo" });
            const nombre = within(dialogo).getByLabelText(/Nombre/);

            expect(nombre).toHaveValue("Cocinero");
            expect(within(dialogo).getByLabelText(/Descripción/)).toHaveValue("Línea caliente");

            await user.clear(nombre);
            await user.type(nombre, "Jefe de cocina");
            await user.click(within(dialogo).getByRole("button", { name: "Guardar cambios" }));

            expect(api.actualizar).toHaveBeenCalledWith(1, {
                nombre: "Jefe de cocina",
                descripcion: "Línea caliente",
            });
            expect(
                await screen.findByText('El cargo "Jefe de cocina" se actualizó correctamente.'),
            ).toBeInTheDocument();
        });
    });

    describe("CA04 / CA08 – Desactivar cargo", () => {
        it("solicita confirmación antes de desactivar", async () => {
            api.desactivar.mockResolvedValue(undefined);
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Desactivar Cocinero" }));
            const dialogo = screen.getByRole("dialog", { name: "Desactivar cargo" });

            expect(dialogo).toHaveTextContent('¿Deseas desactivar el cargo "Cocinero"?');
            expect(api.desactivar).not.toHaveBeenCalled();

            await user.click(within(dialogo).getByRole("button", { name: "Desactivar" }));

            expect(api.desactivar).toHaveBeenCalledWith(1);
            expect(
                await screen.findByText('El cargo "Cocinero" se desactivó correctamente.'),
            ).toBeInTheDocument();
        });

        it("no desactiva cuando el administrador cancela", async () => {
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Desactivar Cocinero" }));
            await user.click(screen.getByRole("button", { name: "Cancelar" }));

            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
            expect(api.desactivar).not.toHaveBeenCalled();
        });

        it("informa cuando el cargo tiene dependencias", async () => {
            api.desactivar.mockRejectedValue(
                new ApiError(
                    409,
                    "No se puede desactivar el cargo porque tiene empleados o registros históricos asociados.",
                ),
            );
            const { user } = await abrirCargos();
            await esperarListado();

            await user.click(screen.getByRole("button", { name: "Desactivar Cocinero" }));
            await user.click(
                within(screen.getByRole("dialog")).getByRole("button", { name: "Desactivar" }),
            );

            expect(
                await screen.findByText(
                    "No se puede desactivar el cargo porque tiene empleados o registros históricos asociados.",
                ),
            ).toBeInTheDocument();
            expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        });

        it("no ofrece desactivar un cargo que ya está inactivo", async () => {
            await abrirCargos();
            await esperarListado();

            expect(
                screen.queryByRole("button", { name: "Desactivar Mesero" }),
            ).not.toBeInTheDocument();
            expect(
                screen.getByRole("button", { name: "Actualizar Mesero" }),
            ).toBeInTheDocument();
        });
    });

    it("se accede desde una pestaña del módulo de Configuración", async () => {
        await abrirCargos();

        await esperarListado();
        expect(screen.getByRole("tab", { name: "Cargos", selected: true })).toBeInTheDocument();
        expect(
            screen.getByRole("link", { name: "Configuración", current: "page" }),
        ).toBeInTheDocument();
    });
});
