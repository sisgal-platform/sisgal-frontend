import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SucursalesFeature } from "../index";
import type { Sucursal } from "../interfaces/types";
import { sucursalesService } from "../services/sucursalesService";
import { ToastProvider } from "@/toast/components/ToastProvider";

const list = vi.spyOn(sucursalesService, "list");
const create = vi.spyOn(sucursalesService, "create");
const update = vi.spyOn(sucursalesService, "update");
const remove = vi.spyOn(sucursalesService, "remove");

const SUCURSAL_CENTRO: Sucursal = {
    id: 4,
    name: "Sucursal Centro",
    address: "Carrera 43A # 10-15",
    phone: "6041234567",
    city: "Medellín",
    is_active: true,
    companyId: 1,
};

const SUCURSAL_NORTE: Sucursal = {
    id: 5,
    name: "Sucursal Norte",
    address: "Avenida 80 # 40-10",
    phone: "",
    city: "Cali",
    is_active: false,
    companyId: 1,
};

function renderFeature() {
    const user = userEvent.setup();
    render(
        <ToastProvider>
            <SucursalesFeature />
        </ToastProvider>,
    );
    return user;
}

async function esperarTabla() {
    await screen.findByRole("heading", { name: "Sucursales" });
    await screen.findByRole("cell", { name: "Sucursal Centro" });
}

beforeEach(() => {
    list.mockReset().mockResolvedValue([SUCURSAL_CENTRO, SUCURSAL_NORTE]);
    create.mockReset().mockResolvedValue(SUCURSAL_CENTRO);
    update.mockReset().mockResolvedValue(SUCURSAL_CENTRO);
    remove.mockReset().mockResolvedValue(undefined);
});

describe("SucursalesFeature", () => {
    it("muestra la tabla con los datos, estados y acciones de sucursales", async () => {
        renderFeature();
        await esperarTabla();

        const filaCentro = screen
            .getByRole("cell", { name: "Sucursal Centro" })
            .closest("tr") as HTMLElement;
        const filaNorte = screen
            .getByRole("cell", { name: "Sucursal Norte" })
            .closest("tr") as HTMLElement;

        expect(within(filaCentro).getByText("Medellín")).toBeInTheDocument();
        expect(within(filaCentro).getByText("Activo")).toBeInTheDocument();
        expect(within(filaNorte).getByText("Inactivo")).toBeInTheDocument();
        expect(within(filaNorte).getAllByRole("cell")[3]).toBeEmptyDOMElement();
        expect(
            within(filaCentro).getByRole("button", {
                name: "Editar Sucursal Centro",
            }),
        ).toBeInTheDocument();
        expect(
            within(filaCentro).getByRole("button", {
                name: "Inactivar Sucursal Centro",
            }),
        ).toBeInTheDocument();
        expect(list).toHaveBeenCalledWith();
    });

    it("crea una sucursal, recarga el listado y confirma el resultado", async () => {
        const user = renderFeature();
        await esperarTabla();

        await user.click(
            screen.getByRole("button", { name: "Nueva sucursal" }),
        );
        const dialog = screen.getByRole("alertdialog", {
            name: "Nueva sucursal",
        });
        await user.type(
            within(dialog).getByLabelText("Nombre"),
            "  Sucursal Sur  ",
        );
        await user.type(
            within(dialog).getByLabelText("Dirección"),
            "Calle 10 # 20-30",
        );
        await user.type(
            within(dialog).getByLabelText("Teléfono"),
            "6011234567",
        );
        await user.type(within(dialog).getByLabelText("Ciudad"), "Bogotá");
        await user.click(
            within(dialog).getByRole("button", { name: "Crear sucursal" }),
        );

        await waitFor(() =>
            expect(create).toHaveBeenCalledWith({
                nombre: "Sucursal Sur",
                direccion: "Calle 10 # 20-30",
                telefono: "6011234567",
                ciudad: "Bogotá",
                companyId: 1,
            }),
        );
        await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
        expect(await screen.findByTestId("toast")).toHaveTextContent(
            "Sucursal creada correctamente.",
        );
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("edita una sucursal con sus valores iniciales y actualiza la tabla", async () => {
        const user = renderFeature();
        await esperarTabla();

        await user.click(
            screen.getByRole("button", { name: "Editar Sucursal Centro" }),
        );
        const dialog = screen.getByRole("alertdialog", {
            name: "Editar sucursal",
        });
        expect(within(dialog).getByLabelText("Nombre")).toHaveValue(
            "Sucursal Centro",
        );
        await user.clear(within(dialog).getByLabelText("Ciudad"));
        await user.type(within(dialog).getByLabelText("Ciudad"), "Bogotá");
        await user.click(
            within(dialog).getByRole("button", { name: "Guardar cambios" }),
        );

        await waitFor(() =>
            expect(update).toHaveBeenCalledWith("4", {
                nombre: "Sucursal Centro",
                direccion: "Carrera 43A # 10-15",
                telefono: "6041234567",
                ciudad: "Bogotá",
                companyId: 1,
            }),
        );
        await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
        expect(await screen.findByTestId("toast")).toHaveTextContent(
            "Sucursal actualizada correctamente.",
        );
    });

    it("inactiva una sucursal y confirma el resultado", async () => {
        const user = renderFeature();
        await esperarTabla();

        await user.click(
            screen.getByRole("button", { name: "Inactivar Sucursal Centro" }),
        );
        const dialog = screen.getByRole("alertdialog", {
            name: "¿Deseas inactivar esta sucursal?",
        });
        expect(dialog).toHaveTextContent("Sucursal Centro");
        await user.click(
            within(dialog).getByRole("button", { name: "Inactivar" }),
        );

        await waitFor(() => expect(remove).toHaveBeenCalledWith("4"));
        await waitFor(() => expect(list).toHaveBeenCalledTimes(2));
        expect(await screen.findByTestId("toast")).toHaveTextContent(
            "Sucursal inactivada correctamente.",
        );
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("explica por qué no se puede inactivar una sucursal con dependencias", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        remove.mockRejectedValueOnce({
            response: { status: 409 },
        });
        const user = renderFeature();
        await esperarTabla();

        await user.click(
            screen.getByRole("button", { name: "Inactivar Sucursal Centro" }),
        );
        const dialog = screen.getByRole("alertdialog", {
            name: "¿Deseas inactivar esta sucursal?",
        });
        await user.click(
            within(dialog).getByRole("button", { name: "Inactivar" }),
        );

        expect(await within(dialog).findByRole("alert")).toHaveTextContent(
            "No es posible inactivar esta sucursal porque tiene empleados o registros históricos de asistencia asociados.",
        );
        expect(screen.getByRole("alertdialog")).toBeInTheDocument();
        consoleError.mockRestore();
    });

    it("muestra un error genérico cuando falla la inactivación", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        remove.mockRejectedValueOnce({ response: { status: 500 } });
        const user = renderFeature();
        await esperarTabla();

        await user.click(
            screen.getByRole("button", { name: "Inactivar Sucursal Centro" }),
        );
        const dialog = screen.getByRole("alertdialog", {
            name: "¿Deseas inactivar esta sucursal?",
        });
        await user.click(
            within(dialog).getByRole("button", { name: "Inactivar" }),
        );

        expect(await within(dialog).findByRole("alert")).toHaveTextContent(
            "No fue posible inactivar la sucursal. Inténtalo nuevamente.",
        );
        consoleError.mockRestore();
    });

    it("muestra un error cuando no puede cargar sucursales", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        list.mockRejectedValueOnce(new Error("fallo de red"));

        renderFeature();

        expect(
            await screen.findByText("No fue posible cargar las sucursales."),
        ).toBeInTheDocument();
        expect(screen.queryByRole("table")).not.toBeInTheDocument();
        consoleError.mockRestore();
    });
});
