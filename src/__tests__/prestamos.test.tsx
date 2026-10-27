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
import { PrestamosFeature } from "../features/prestamos";
import type {
    Prestamo,
    PrestamosIndicadores,
} from "../features/prestamos/interfaces/types";
import { prestamosService } from "../features/prestamos/services/prestamosService";
import { ToastProvider } from "../toast/components/ToastProvider";

const obtenerTodos = vi.spyOn(prestamosService, "obtenerTodos");
const obtenerIndicadores = vi.spyOn(prestamosService, "obtenerIndicadores");
const obtenerPorId = vi.spyOn(prestamosService, "obtenerPorId");
const crearPrestamo = vi.spyOn(prestamosService, "crear");
const listarEmpleados = vi.spyOn(employeesService, "list");

const INDICADORES: PrestamosIndicadores = {
    cantidadPrestamosActivos: 12,
    montoTotalPrestamosActivos: 2500000,
};

const EMPLEADO = {
    id: 6,
    firstName: "Ana",
    lastName: "Ruiz",
    documentType: "CC" as const,
    document: "1234567890",
    phone: "3001234567",
    salaryBase: 1800000,
    hireDate: "2025-08-01",
    position: "Mesera",
    status: "ACTIVO",
    branchId: 1,
    positionId: 2,
    branchName: "Centro",
    positionName: "Mesera",
};

const PRESTAMO: Prestamo = {
    id: 11,
    employee: {
        id: EMPLEADO.id,
        firstName: EMPLEADO.firstName,
        lastName: EMPLEADO.lastName,
        documentType: EMPLEADO.documentType,
        document: EMPLEADO.document,
    },
    totalAmount: 2500000,
    installmentAmount: 250000,
    totalInstallments: 10,
    pendingInstallments: 8,
    outstandingBalance: 2000000,
    grantedAt: "2026-03-10T00:00:00.000Z",
    periodicity: "QUINCENAL",
    status: "ACTIVO",
    createdAt: "2026-03-10T00:00:00.000Z",
    updatedAt: "2026-04-10T00:00:00.000Z",
};

function renderPrestamos() {
    const user = userEvent.setup();
    render(
        <ToastProvider>
            <PrestamosFeature />
        </ToastProvider>,
    );
    return user;
}

async function esperarCargaInicial() {
    await waitFor(() => {
        expect(obtenerTodos).toHaveBeenCalledWith({
            busqueda: "",
            estado: "",
            fechaDesde: "",
            fechaHasta: "",
        });
        expect(obtenerIndicadores).toHaveBeenCalled();
    });
}

beforeEach(() => {
    obtenerTodos.mockReset().mockResolvedValue([]);
    obtenerIndicadores.mockReset().mockResolvedValue(INDICADORES);
    obtenerPorId.mockReset().mockResolvedValue(PRESTAMO);
    crearPrestamo.mockReset().mockResolvedValue({} as Prestamo);
    listarEmpleados.mockReset().mockResolvedValue([EMPLEADO]);
});

describe("PrestamosFeature", () => {
    it("muestra los indicadores y el estado vacío del listado", async () => {
        renderPrestamos();

        expect(
            await screen.findByRole("heading", {
                name: "Préstamos",
            }),
        ).toBeInTheDocument();
        expect(
            await screen.findByText("12", { exact: true }),
        ).toBeInTheDocument();
        expect(await screen.findByText(/2\.500\.000/)).toBeInTheDocument();
        expect(
            await screen.findByText(
                "No hay préstamos que coincidan con los filtros.",
            ),
        ).toBeInTheDocument();
        await esperarCargaInicial();
    });

    it("aplica filtros y normaliza el rango de fechas antes de consultar", async () => {
        const user = renderPrestamos();
        await esperarCargaInicial();

        const employeeSelector = screen.getByRole("combobox", {
            name: "Empleado",
        });
        await user.click(employeeSelector);
        await user.type(employeeSelector, "1234567890");
        await user.click(
            await screen.findByRole("option", {
                name: "Ana Ruiz · 1234567890",
            }),
        );
        await user.selectOptions(
            screen.getByLabelText("Estado del préstamo"),
            "SALDADO",
        );
        fireEvent.change(screen.getByLabelText("Fecha de otorgamiento desde"), {
            target: { value: "2026-03-10" },
        });
        fireEvent.change(screen.getByLabelText("Fecha de otorgamiento hasta"), {
            target: { value: "2026-03-01" },
        });

        await user.click(
            screen.getByRole("button", { name: "Aplicar filtros" }),
        );

        await waitFor(() =>
            expect(obtenerTodos).toHaveBeenLastCalledWith({
                busqueda: "",
                empleadoId: 6,
                estado: "SALDADO",
                fechaDesde: "2026-03-01",
                fechaHasta: "2026-03-10",
            }),
        );

        await user.click(
            screen.getByRole("button", { name: "Limpiar filtros" }),
        );

        await waitFor(() =>
            expect(obtenerTodos).toHaveBeenLastCalledWith({
                busqueda: "",
                estado: "",
                fechaDesde: "",
                fechaHasta: "",
            }),
        );
        expect(screen.getByRole("combobox", { name: "Empleado" })).toHaveValue(
            "",
        );
    });

    it("muestra errores de indicadores y permite reintentar", async () => {
        obtenerIndicadores
            .mockRejectedValueOnce(new Error("Indicadores no disponibles"))
            .mockResolvedValueOnce(INDICADORES);
        const user = renderPrestamos();

        const alerta = await screen.findByRole("alert");
        expect(alerta).toHaveTextContent("Indicadores no disponibles");

        await user.click(
            within(alerta).getByRole("button", { name: "Reintentar" }),
        );

        await waitFor(() =>
            expect(obtenerIndicadores).toHaveBeenCalledTimes(2),
        );
        expect(
            await screen.findByText("12", { exact: true }),
        ).toBeInTheDocument();
    });

    it("muestra el error del listado y permite volver a cargarlo", async () => {
        obtenerTodos
            .mockRejectedValueOnce(new Error("Listado no disponible"))
            .mockResolvedValueOnce([]);
        const user = renderPrestamos();

        const alerta = await screen.findByRole("alert");
        expect(alerta).toHaveTextContent("Listado no disponible");
        await user.click(
            within(alerta).getByRole("button", { name: "Reintentar" }),
        );

        await waitFor(() => expect(obtenerTodos).toHaveBeenCalledTimes(2));
        expect(
            await screen.findByText(
                "No hay préstamos que coincidan con los filtros.",
            ),
        ).toBeInTheDocument();
    });

    it("abre el detalle consultando el préstamo por id y solo permite cerrarlo", async () => {
        obtenerTodos.mockResolvedValue([PRESTAMO]);
        const user = renderPrestamos();

        await user.click(
            await screen.findByRole("button", {
                name: "Ver detalle del préstamo 11",
            }),
        );

        const dialog = await screen.findByRole("dialog", {
            name: "Detalle del préstamo #11",
        });
        expect(obtenerPorId).toHaveBeenCalledWith(11);
        expect(within(dialog).getByText("Ana Ruiz")).toBeInTheDocument();
        expect(within(dialog).getByText("CC 1234567890")).toBeInTheDocument();
        expect(within(dialog).getAllByText("10/03/2026")).toHaveLength(2);
        expect(within(dialog).getByText("10/04/2026")).toBeInTheDocument();
        expect(within(dialog).getByText("Activo")).toBeInTheDocument();
        expect(
            within(dialog).getByText("Cuotas pendientes"),
        ).toBeInTheDocument();
        expect(
            within(dialog).getByText("Periodicidad del descuento").nextSibling,
        ).toHaveTextContent("Quincenal");
        expect(within(dialog).queryByRole("textbox")).not.toBeInTheDocument();
        expect(
            within(dialog).queryByRole("spinbutton"),
        ).not.toBeInTheDocument();

        await user.click(
            within(dialog).getAllByRole("button", { name: "Cerrar" })[0],
        );
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("muestra el error del detalle y permite reintentar la consulta", async () => {
        obtenerTodos.mockResolvedValue([PRESTAMO]);
        obtenerPorId
            .mockRejectedValueOnce(new Error("Detalle no disponible"))
            .mockResolvedValueOnce(PRESTAMO);
        const user = renderPrestamos();

        await user.click(
            await screen.findByRole("button", {
                name: "Ver detalle del préstamo 11",
            }),
        );
        const dialog = await screen.findByRole("dialog", {
            name: "Detalle del préstamo #11",
        });
        const alerta = await within(dialog).findByRole("alert");
        expect(alerta).toHaveTextContent("Detalle no disponible");

        await user.click(
            within(alerta).getByRole("button", { name: "Reintentar" }),
        );

        await waitFor(() => expect(obtenerPorId).toHaveBeenCalledTimes(2));
        expect(await within(dialog).findByText("Ana Ruiz")).toBeInTheDocument();
    });

    it("refresca el listado y los indicadores al crear un préstamo", async () => {
        const user = renderPrestamos();
        await esperarCargaInicial();

        await user.click(
            screen.getByRole("button", { name: "Crear préstamo" }),
        );
        const dialog = await screen.findByRole("dialog", {
            name: "Crear préstamo",
        });
        const selector = within(dialog).getByRole("combobox", {
            name: /Empleado/,
        });
        await user.click(selector);
        await user.click(
            await within(dialog).findByRole("option", {
                name: "Ana Ruiz · 1234567890",
            }),
        );
        await user.type(
            within(dialog).getByLabelText(/Valor del préstamo/),
            "2500000",
        );
        await user.type(within(dialog).getByLabelText(/Total de cuotas/), "10");
        fireEvent.change(within(dialog).getByLabelText(/Fecha de entrega/), {
            target: { value: "2026-03-10" },
        });
        await user.click(
            within(dialog).getByRole("button", { name: "Crear préstamo" }),
        );

        await waitFor(() =>
            expect(crearPrestamo).toHaveBeenCalledWith({
                employeeId: 6,
                totalAmount: 2500000,
                totalInstallments: 10,
                grantedAt: "2026-03-10",
                periodicity: "MENSUAL",
            }),
        );
        await waitFor(() => {
            expect(obtenerTodos).toHaveBeenCalledTimes(2);
            expect(obtenerIndicadores).toHaveBeenCalledTimes(2);
        });
        expect(listarEmpleados).toHaveBeenCalledWith({ status: "ACTIVO" });
    });
});
