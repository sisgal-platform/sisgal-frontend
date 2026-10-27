import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { prestamosService } from "../features/prestamos/services/prestamosService";
import { renderApp } from "../test/render";

const obtenerIndicadores = vi.spyOn(prestamosService, "obtenerIndicadores");
const obtenerPrestamos = vi.spyOn(prestamosService, "obtenerTodos");

beforeEach(() => {
    obtenerIndicadores.mockReset().mockResolvedValue({
        cantidadPrestamosActivos: 12,
        montoTotalPrestamosActivos: 4000000,
    });
    obtenerPrestamos.mockReset().mockResolvedValue([]);
});

describe("Dashboard", () => {
    it("muestra el dashboard para un administrador", async () => {
        renderApp({ ruta: "/" });

        expect(
            screen.getByRole("heading", {
                name: "Dashboard",
            }),
        ).toBeInTheDocument();
        expect(
            await screen.findByText("12", { exact: true }),
        ).toBeInTheDocument();
    });

    it("muestra los préstamos activos del backend y navega a su módulo", async () => {
        const { user, router } = renderApp({ ruta: "/" });

        expect(
            await screen.findByText("12", { exact: true }),
        ).toBeInTheDocument();
        expect(obtenerIndicadores).toHaveBeenCalledTimes(1);

        await user.click(screen.getByRole("button", { name: "Ver préstamos" }));

        expect(router.state.location.pathname).toBe("/prestamos");
        expect(
            await screen.findByRole("heading", { name: "Préstamos" }),
        ).toBeInTheDocument();
    });

    it("bloquea el acceso al dashboard para usuarios no administradores", () => {
        renderApp({
            ruta: "/",
            sesion: {
                user: { id: "u-2", nombre: "Laura Gómez", rol: "supervisor" },
                lastModule: null,
                startedAt: "2026-01-02T08:00:00.000Z",
            },
        });

        expect(
            screen.getByText("No tienes permisos para acceder al dashboard."),
        ).toBeInTheDocument();
        expect(obtenerIndicadores).not.toHaveBeenCalled();
    });
});
