import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ConfiguracionFeature } from "../features/configuracion";
import { sucursalesService } from "../features/sucursales/services/sucursalesService";
import { ToastProvider } from "../toast/components/ToastProvider";

const listarSucursales = vi.spyOn(sucursalesService, "list");

beforeEach(() => {
    listarSucursales.mockReset().mockResolvedValue([]);
});

describe("Soporte en Configuración", () => {
    it("muestra los canales oficiales como información de solo lectura", async () => {
        const user = userEvent.setup();
        render(
            <ToastProvider>
                <ConfiguracionFeature />
            </ToastProvider>,
        );

        await user.click(screen.getByRole("tab", { name: "Soporte" }));

        expect(
            screen.getByRole("heading", {
                name: "Soporte",
            }),
        ).toBeInTheDocument();
        const email = screen.getByRole("link", {
            name: "soporte@nominarestaurant.com",
        });
        expect(email).toHaveAttribute(
            "href",
            "mailto:soporte@nominarestaurant.com",
        );

        const telefono = screen.getByRole("link", {
            name: "+57 (1) 234-5678",
        });
        expect(telefono).toHaveAttribute("href", "tel:+5712345678");
        expect(
            screen.getByText("Lunes a viernes, de 8:00 a. m. a 6:00 p. m."),
        ).toBeInTheDocument();
        expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
        expect(
            screen.queryByRole("button", { name: /guardar|editar/i }),
        ).not.toBeInTheDocument();
    });
});
