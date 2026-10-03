import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { CreateSucursalDialog } from "../components/CreateSucursalDialog";
import { sucursalesService } from "../services/sucursalesService";
import type { Sucursal } from "../interfaces/types";

vi.mock("../services/sucursalesService", () => ({
    sucursalesService: {
        create: vi.fn(),
        update: vi.fn(),
    },
}));

beforeEach(() => {
    vi.clearAllMocks();
});

const SUCURSAL: Sucursal = {
    id: 4,
    name: "Sucursal Centro",
    address: "Carrera 43A # 10-15",
    phone: "6041234567",
    city: "Medellín",
    is_active: true,
    companyId: 1,
};

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

    it("valida los campos requeridos antes de llamar al servicio", () => {
        render(<CreateSucursalDialog open={true} onOpenChange={vi.fn()} />);

        fireEvent.submit(
            screen.getByRole("alertdialog").querySelector("form")!,
        );

        expect(screen.getByRole("alert")).toHaveTextContent(
            "El nombre es obligatorio.",
        );
        expect(sucursalesService.create).not.toHaveBeenCalled();
    });

    it("crea la sucursal con los datos limpiados y notifica al feature", async () => {
        const user = userEvent.setup();
        const onOpenChange = vi.fn();
        const onCreated = vi.fn();
        vi.mocked(sucursalesService.create).mockResolvedValueOnce(SUCURSAL);

        render(
            <CreateSucursalDialog
                open={true}
                onOpenChange={onOpenChange}
                onCreated={onCreated}
            />,
        );

        await user.type(screen.getByLabelText("Nombre"), " Sucursal Sur ");
        await user.type(
            screen.getByLabelText("Dirección"),
            " Calle 10 # 20-30 ",
        );
        await user.type(screen.getByLabelText("Ciudad"), " Bogotá ");
        await user.click(
            screen.getByRole("button", { name: "Crear sucursal" }),
        );

        expect(sucursalesService.create).toHaveBeenCalledWith({
            nombre: "Sucursal Sur",
            direccion: "Calle 10 # 20-30",
            telefono: "",
            ciudad: "Bogotá",
            companyId: 1,
        });
        expect(onCreated).toHaveBeenCalledOnce();
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("carga los datos al editar y envía los cambios", async () => {
        const user = userEvent.setup();
        const onUpdated = vi.fn();
        const onOpenChange = vi.fn();
        vi.mocked(sucursalesService.update).mockResolvedValueOnce(SUCURSAL);

        render(
            <CreateSucursalDialog
                open={true}
                mode="edit"
                sucursal={SUCURSAL}
                onOpenChange={onOpenChange}
                onUpdated={onUpdated}
            />,
        );

        const dialog = screen.getByRole("alertdialog", {
            name: "Editar sucursal",
        });
        expect(within(dialog).getByLabelText("Nombre")).toHaveValue(
            "Sucursal Centro",
        );
        await user.clear(within(dialog).getByLabelText("Ciudad"));
        await user.type(within(dialog).getByLabelText("Ciudad"), "Cali");
        await user.click(
            within(dialog).getByRole("button", { name: "Guardar cambios" }),
        );

        expect(sucursalesService.update).toHaveBeenCalledWith("4", {
            nombre: "Sucursal Centro",
            direccion: "Carrera 43A # 10-15",
            telefono: "6041234567",
            ciudad: "Cali",
            companyId: 1,
        });
        expect(onUpdated).toHaveBeenCalledOnce();
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("muestra un mensaje genérico cuando falla la creación", async () => {
        const user = userEvent.setup();
        vi.mocked(sucursalesService.create).mockRejectedValueOnce(
            new Error("fallo de red"),
        );

        render(<CreateSucursalDialog open={true} onOpenChange={vi.fn()} />);
        await user.type(screen.getByLabelText("Nombre"), "Sucursal Sur");
        await user.type(screen.getByLabelText("Dirección"), "Calle 10 # 20-30");
        await user.type(screen.getByLabelText("Ciudad"), "Bogotá");
        await user.click(
            screen.getByRole("button", { name: "Crear sucursal" }),
        );

        expect(await screen.findByRole("alert")).toHaveTextContent(
            "No fue posible crear la sucursal. Inténtalo nuevamente.",
        );
    });
});
