import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { employeesService } from "@/features/empleados/services/employeesService";
import { cargosService } from "@/features/cargos/services/cargosService";
import { ToastProvider } from "@/toast/components/ToastProvider";

import { IncapacidadesFeature } from "../index";
import type { DisabilityLeave } from "../interfaces/types";
import { disabilityLeavesService } from "../services/disabilityLeavesService";

const findAll = vi.spyOn(disabilityLeavesService, "findAll");
const register = vi.spyOn(disabilityLeavesService, "register");
const update = vi.spyOn(disabilityLeavesService, "update");
const remove = vi.spyOn(disabilityLeavesService, "remove");

const ANA: DisabilityLeave = {
    id: 5,
    employeeId: 3,
    employeeName: "Ana Ruiz",
    documentType: "CC",
    document: "123",
    position: "Mesera",
    type: "Enfermedad general",
    otherTypeDescription: null,
    startDate: "2026-09-10",
    endDate: "2026-09-15",
    totalDays: 6,
    status: "Finalizado",
};

function renderFeature() {
    const user = userEvent.setup();
    render(
        <ToastProvider>
            <IncapacidadesFeature />
        </ToastProvider>,
    );
    return user;
}

async function openEdit() {
    const user = renderFeature();
    await user.click(
        await screen.findByRole("button", {
            name: "Editar la incapacidad de Ana Ruiz",
        }),
    );
    return {
        user,
        dialog: screen.getByRole("dialog", {
            name: "Editar incapacidad o licencia",
        }),
    };
}

async function askDelete() {
    const user = renderFeature();
    await user.click(
        await screen.findByRole("button", {
            name: "Eliminar la incapacidad de Ana Ruiz",
        }),
    );
    return {
        user,
        dialog: screen.getByRole("dialog", { name: "Eliminar incapacidad" }),
    };
}

beforeEach(() => {
    findAll.mockReset().mockResolvedValue([ANA]);
    register.mockReset();
    update.mockReset().mockResolvedValue(ANA);
    remove.mockReset().mockResolvedValue(undefined);
    vi.spyOn(employeesService, "list").mockResolvedValue([]);
    vi.spyOn(cargosService, "listarActivos").mockResolvedValue([]);
});

describe("IncapacidadesFeature", () => {
    it("precarga el registro y deja fijo al empleado al editar", async () => {
        const { dialog } = await openEdit();

        expect(within(dialog).getByLabelText(/Empleado/)).toHaveValue(
            "Ana Ruiz",
        );
        expect(within(dialog).getByLabelText(/Fecha de inicio/)).toHaveValue(
            "2026-09-10",
        );
        expect(
            within(dialog).getByLabelText(/Fecha de finalización/),
        ).toHaveValue("2026-09-15");
        expect(within(dialog).getByLabelText(/Cantidad de días/)).toHaveValue(
            "6",
        );
    });

    it("guarda los cambios sin enviar el empleado y recarga el listado", async () => {
        const { user, dialog } = await openEdit();

        fireEvent.change(
            within(dialog).getByLabelText(/Fecha de finalización/),
            { target: { value: "2026-09-20" } },
        );
        await user.click(
            within(dialog).getByRole("button", { name: "Guardar cambios" }),
        );

        await waitFor(() =>
            expect(update).toHaveBeenCalledWith(5, {
                type: "Enfermedad general",
                startDate: "2026-09-10",
                endDate: "2026-09-20",
            }),
        );
        expect(register).not.toHaveBeenCalled();
        await waitFor(() => expect(findAll).toHaveBeenCalledTimes(2));
        expect(
            screen.queryByRole("dialog", {
                name: "Editar incapacidad o licencia",
            }),
        ).not.toBeInTheDocument();
    });

    it("muestra el motivo si una liquidación impide editar y deja el formulario abierto", async () => {
        update.mockRejectedValue(
            new Error("La liquidación del 01/09/2026 al 30/09/2026 incluye estas fechas."),
        );
        const { user, dialog } = await openEdit();

        await user.click(
            within(dialog).getByRole("button", { name: "Guardar cambios" }),
        );

        expect(
            await screen.findByText(/incluye estas fechas/),
        ).toBeInTheDocument();
        expect(dialog).toBeInTheDocument();
    });

    it("elimina tras confirmar y recarga el listado", async () => {
        const { user, dialog } = await askDelete();

        await user.click(
            within(dialog).getByRole("button", { name: "Eliminar" }),
        );

        await waitFor(() => expect(remove).toHaveBeenCalledWith(5));
        await waitFor(() => expect(findAll).toHaveBeenCalledTimes(2));
    });

    it("no elimina si se cancela", async () => {
        const { user, dialog } = await askDelete();

        await user.click(
            within(dialog).getByRole("button", { name: "Cancelar" }),
        );

        expect(remove).not.toHaveBeenCalled();
    });

    it("muestra el motivo si no se puede eliminar", async () => {
        remove.mockRejectedValue(new Error("Elimina primero esa liquidación."));
        const { user, dialog } = await askDelete();

        await user.click(
            within(dialog).getByRole("button", { name: "Eliminar" }),
        );

        expect(
            await screen.findByText("Elimina primero esa liquidación."),
        ).toBeInTheDocument();
    });
});
