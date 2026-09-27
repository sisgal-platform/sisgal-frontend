import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import {
    SESSION_STORAGE_KEY,
    readSession,
} from "../session/storage/session.storage";
import type { SessionState } from "../session/types/session.types";
import { renderApp } from "../test/render";

describe("Estado de sesión durante la navegación", () => {
    it("conserva el usuario al cambiar de módulo", async () => {
        const { user } = renderApp();

        expect(screen.getByText("Ana Ruiz")).toBeInTheDocument();

        await user.click(screen.getByRole("link", { name: "Reportes" }));
        await screen.findByRole("heading", { level: 1, name: "Reportes" });

        expect(screen.getByText("Ana Ruiz")).toBeInTheDocument();
    });

    it("registra el último módulo visitado y lo persiste", async () => {
        const { user } = renderApp();

        await user.click(screen.getByRole("link", { name: "Personal" }));
        await screen.findByRole("heading", { level: 1, name: "Personal" });

        expect(readSession().lastModule).toBe("personal");
    });

    it("rehidrata la sesión guardada al montar de nuevo", () => {
        const guardada: SessionState = {
            user: { id: "u-9", nombre: "Carlos Díaz", rol: "supervisor" },
            lastModule: "nomina",
            startedAt: "2026-02-02T09:00:00.000Z",
        };
        window.sessionStorage.setItem(
            SESSION_STORAGE_KEY,
            JSON.stringify(guardada),
        );

        // Sin `sesion` explícita el provider lee de sessionStorage, como en un reload.
        renderApp({ sesion: readSession() });

        expect(screen.getByText("Carlos Díaz")).toBeInTheDocument();
        expect(screen.getByText("supervisor")).toBeInTheDocument();
    });

    it("cierra la sesión y limpia el almacenamiento", async () => {
        const { user } = renderApp();

        await user.click(screen.getByRole("button", { name: "Cerrar sesión" }));

        expect(screen.queryByText("Ana Ruiz")).not.toBeInTheDocument();
        expect(window.sessionStorage.getItem(SESSION_STORAGE_KEY)).toBeNull();
    });

    it("tolera un valor corrupto en sessionStorage", () => {
        window.sessionStorage.setItem(SESSION_STORAGE_KEY, "{no-es-json");

        expect(readSession()).toEqual({
            user: null,
            lastModule: null,
            startedAt: null,
        });
    });
});
