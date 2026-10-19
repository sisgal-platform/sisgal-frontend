import {
    fireEvent,
    render,
    screen,
    waitFor,
    within,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { employeesService } from "../features/empleados/services/employeesService";
import { CreatePrestamoModal } from "../features/prestamos/components/CreatePrestamoModal";
import { prestamosService } from "../features/prestamos/services/prestamosService";
import { ToastProvider } from "../toast/components/ToastProvider";

vi.mock("../features/empleados/services/employeesService", () => ({
    employeesService: { list: vi.fn() },
}));

vi.mock("../features/prestamos/services/prestamosService", () => ({
    prestamosService: { crear: vi.fn() },
}));

const EMPLEADO_ACTIVO = {
    id: 7,
    firstName: "María",
    lastName: "Pérez",
    documentType: "CC" as const,
    document: "1234567890",
    phone: "3001234567",
    salaryBase: 1800000,
    position: "Mesera",
    status: "ACTIVO",
    branchId: 1,
    positionId: 2,
    branchName: "Centro",
    positionName: "Mesera",
};

const EMPLEADO_INACTIVO = {
    ...EMPLEADO_ACTIVO,
    id: 8,
    firstName: "Luis",
    status: "INACTIVO",
};

const empleadosApi = vi.mocked(employeesService);
const prestamosApi = vi.mocked(prestamosService);

function renderModal(onSuccess = vi.fn()) {
    const user = userEvent.setup();
    render(
        <ToastProvider>
            <CreatePrestamoModal onSuccess={onSuccess} />
        </ToastProvider>,
    );
    return { user, onSuccess };
}

async function abrirModal(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", { name: "Crear préstamo" }));
    return screen.findByRole("dialog", { name: "Crear préstamo" });
}

async function seleccionarEmpleado(
    user: ReturnType<typeof userEvent.setup>,
    dialog: HTMLElement,
) {
    const selector = within(dialog).getByRole("combobox", { name: /Empleado/ });
    await user.click(selector);
    await user.type(selector, "1234567890");
    await user.click(
        await within(dialog).findByRole("option", {
            name: "María Pérez · 1234567890",
        }),
    );
}

beforeEach(() => {
    vi.clearAllMocks();
    empleadosApi.list.mockResolvedValue([EMPLEADO_ACTIVO, EMPLEADO_INACTIVO]);
    prestamosApi.crear.mockResolvedValue(
        {} as Awaited<ReturnType<typeof prestamosService.crear>>,
    );
});

describe("modal de creación de préstamos", () => {
    it("carga y ofrece solo empleados activos", async () => {
        const { user } = renderModal();
        const dialog = await abrirModal(user);

        expect(empleadosApi.list).toHaveBeenCalledWith({ status: "ACTIVO" });
        const selector = within(dialog).getByRole("combobox", {
            name: /Empleado/,
        });
        await user.click(selector);
        await user.type(selector, "1234567890");
        expect(
            await within(dialog).findByRole("option", {
                name: "María Pérez · 1234567890",
            }),
        ).toBeInTheDocument();
        expect(
            within(dialog).queryByRole("option", { name: /Luis/ }),
        ).not.toBeInTheDocument();
    });

    it("envía el préstamo y refresca la vista al completarse", async () => {
        const { user, onSuccess } = renderModal();
        const dialog = await abrirModal(user);

        await seleccionarEmpleado(user, dialog);
        await user.type(
            within(dialog).getByLabelText(/Valor del préstamo/),
            "1200000",
        );
        await user.type(within(dialog).getByLabelText(/Total de cuotas/), "6");
        fireEvent.change(within(dialog).getByLabelText(/Fecha de entrega/), {
            target: { value: "2026-10-02" },
        });
        await user.click(
            within(dialog).getByRole("button", { name: "Crear préstamo" }),
        );

        await waitFor(() =>
            expect(prestamosApi.crear).toHaveBeenCalledWith({
                employeeId: 7,
                totalAmount: 1200000,
                totalInstallments: 6,
                grantedAt: "2026-10-02",
                periodicity: "MENSUAL",
            }),
        );
        expect(onSuccess).toHaveBeenCalledOnce();
        expect(await screen.findByTestId("toast")).toHaveTextContent(
            "Préstamo creado correctamente.",
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("envía la periodicidad quincenal cuando se elige y explica sus fechas de corte", async () => {
        const { user } = renderModal();
        const dialog = await abrirModal(user);

        const periodicidad = within(dialog).getByLabelText(
            /Periodicidad del descuento/,
        );
        expect(periodicidad).toHaveValue("MENSUAL");
        expect(
            within(dialog).getByText(
                "Se descuenta una cuota el último día de cada mes.",
            ),
        ).toBeInTheDocument();

        await seleccionarEmpleado(user, dialog);
        await user.type(
            within(dialog).getByLabelText(/Valor del préstamo/),
            "600000",
        );
        await user.type(within(dialog).getByLabelText(/Total de cuotas/), "4");
        fireEvent.change(within(dialog).getByLabelText(/Fecha de entrega/), {
            target: { value: "2026-10-02" },
        });
        await user.selectOptions(periodicidad, "QUINCENAL");
        expect(
            within(dialog).getByText(
                "Se descuenta una cuota el día 15 y otra el último día de cada mes.",
            ),
        ).toBeInTheDocument();
        await user.click(
            within(dialog).getByRole("button", { name: "Crear préstamo" }),
        );

        await waitFor(() =>
            expect(prestamosApi.crear).toHaveBeenCalledWith(
                expect.objectContaining({ periodicity: "QUINCENAL" }),
            ),
        );
    });

    it("valida los campos requeridos antes de llamar al servicio", async () => {
        const { user } = renderModal();
        const dialog = await abrirModal(user);

        await user.click(
            within(dialog).getByRole("button", { name: "Crear préstamo" }),
        );

        expect(
            await within(dialog).findByText("Selecciona un empleado."),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText(
                "El valor del préstamo debe ser mayor que cero.",
            ),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText("Ingresa un total de cuotas válido."),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText("Selecciona la fecha de entrega."),
        ).toBeInTheDocument();
        expect(prestamosApi.crear).not.toHaveBeenCalled();
    });

    it("mantiene el modal abierto y muestra el error del backend", async () => {
        prestamosApi.crear.mockRejectedValueOnce(
            new Error("No se pudo guardar el préstamo."),
        );
        const { user } = renderModal();
        const dialog = await abrirModal(user);

        await seleccionarEmpleado(user, dialog);
        await user.type(
            within(dialog).getByLabelText(/Valor del préstamo/),
            "1200000",
        );
        await user.type(within(dialog).getByLabelText(/Total de cuotas/), "6");
        fireEvent.change(within(dialog).getByLabelText(/Fecha de entrega/), {
            target: { value: "2026-10-02" },
        });
        await user.click(
            within(dialog).getByRole("button", { name: "Crear préstamo" }),
        );

        expect(await within(dialog).findByRole("alert")).toHaveTextContent(
            "No se pudo guardar el préstamo.",
        );
        expect(
            screen.getByRole("dialog", { name: "Crear préstamo" }),
        ).toBeInTheDocument();
    });
});
