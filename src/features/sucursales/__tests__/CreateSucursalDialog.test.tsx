import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateSucursalDialog } from "../components/CreateSucursalDialog";
import { sucursalesService } from "../services/sucursalesService";

vi.mock("../services/sucursalesService", () => ({
    sucursalesService: {
        create: vi.fn(),
        update: vi.fn(),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

describe("CreateSucursalDialog", () => {
    it("muestra el mensaje que devuelve el backend cuando el nombre ya existe", async () => {
        const user = userEvent.setup();

        vi.mocked(sucursalesService.create).mockRejectedValueOnce({
            response: {
                data: {
                    message: "Ya existe una sucursal con ese nombre.",
                },
            },
        });

        render(<CreateSucursalDialog open={true} onOpenChange={vi.fn()} />);

        await user.type(screen.getByLabelText("Nombre"), "Sucursal Centro");
        await user.type(
            screen.getByLabelText("Dirección"),
            "Carrera 45 # 10-20",
        );
        await user.type(screen.getByLabelText("Ciudad"), "Bogotá");
        await user.click(
            screen.getByRole("button", { name: "Crear sucursal" }),
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "Ya existe una sucursal con ese nombre.",
        );
    });

    it("solo acepta números en el teléfono", async () => {
        const user = userEvent.setup();

        render(<CreateSucursalDialog open={true} onOpenChange={vi.fn()} />);

        await user.type(screen.getByLabelText("Nombre"), "Sucursal Norte");
        await user.type(screen.getByLabelText("Dirección"), "Av 80 # 40-10");
        await user.type(screen.getByLabelText("Ciudad"), "Cali");
        await user.type(screen.getByLabelText("Teléfono"), "ABC123");

        expect(screen.getByLabelText("Teléfono")).toHaveValue("123");
        expect(sucursalesService.create).not.toHaveBeenCalled();
    });
});
