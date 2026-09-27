import { screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { MODULES } from "../config/modules.catalog";
import { renderApp } from "../test/render";

describe("Navegación entre módulos", () => {
    it("muestra un enlace por cada módulo del catálogo", () => {
        renderApp();

        const menu = screen.getByRole("navigation", {
            name: "Módulos del sistema",
        });
        for (const module of MODULES) {
            expect(
                within(menu).getByRole("link", { name: module.label }),
            ).toBeInTheDocument();
        }
    });

    it("carga el módulo elegido y actualiza la URL", async () => {
        const { user, router } = renderApp();

        await user.click(screen.getByRole("link", { name: "Nómina" }));

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Nómina",
        );
        expect(router.state.location.pathname).toBe("/nomina");
    });

    it("navega sin recargar la app: el shell no se vuelve a montar", async () => {
        const { user } = renderApp();

        const shellInicial = document.querySelector(".layout");
        const topbarInicial = document.querySelector(".topbar");

        await user.click(screen.getByRole("link", { name: "Reportes" }));
        await screen.findByRole("heading", { level: 1, name: "Reportes" });

        // Si la app se recargara, estos nodos serían instancias distintas.
        expect(document.querySelector(".layout")).toBe(shellInicial);
        expect(document.querySelector(".topbar")).toBe(topbarInicial);
    });

    it("permite recorrer varios módulos seguidos", async () => {
        const { user, router } = renderApp();

        for (const label of ["Asistencia", "Personal", "Configuración"]) {
            await user.click(screen.getByRole("link", { name: label }));
            expect(
                await screen.findByRole("heading", { level: 1 }),
            ).toHaveTextContent(label);
        }

        expect(router.state.location.pathname).toBe("/configuracion");
    });

    it("no hace scroll al enfocar el contenido tras navegar", async () => {
        const { user } = renderApp();
        const focusSpy = vi.spyOn(HTMLElement.prototype, "focus");

        await user.click(screen.getByRole("link", { name: "Reportes" }));
        await screen.findByRole("heading", { level: 1, name: "Reportes" });

        expect(focusSpy).toHaveBeenCalledWith({ preventScroll: true });

        focusSpy.mockRestore();
    });

    it("respeta el historial del navegador al volver atrás", async () => {
        const { user, router } = renderApp();

        await user.click(screen.getByRole("link", { name: "Novedades" }));
        expect(router.state.location.pathname).toBe("/novedades");

        await router.navigate(-1);
        expect(router.state.location.pathname).toBe("/");
    });

    it("entra directo a la URL de un módulo", async () => {
        renderApp({ ruta: "/asistencia" });

        expect(
            await screen.findByRole("heading", { level: 1 }),
        ).toHaveTextContent("Asistencia");
    });

    it("muestra una página de error en una ruta desconocida", () => {
        renderApp({ ruta: "/ruta-inexistente" });

        expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
            "Página no encontrada",
        );
        // El menú sigue disponible para salir del error.
        expect(
            screen.getByRole("navigation", { name: "Módulos del sistema" }),
        ).toBeInTheDocument();
    });
});
