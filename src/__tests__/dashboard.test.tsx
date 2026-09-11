import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { renderApp } from "../test/render";

describe("Dashboard", () => {
    it("muestra el dashboard para un administrador", () => {
        renderApp({ ruta: "/" });

        expect(
            screen.getByRole("heading", { level: 1, name: /dashboard/i }),
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
    });
});
