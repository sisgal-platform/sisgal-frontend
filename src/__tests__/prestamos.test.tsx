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
    position: "Mesera",
    status: "ACTIVO",
    branchId: 1,
    positionId: 2,
    branchName: "Centro",
    positionName: "Mesera",
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
    crearPrestamo.mockReset().mockResolvedValue({} as Prestamo);
    listarEmpleados.mockReset().mockResolvedValue([EMPLEADO]);
});

describe("PrestamosFeature", () => {
    it("muestra los indicadores y el estado vacío del listado", async () => {
        renderPrestamos();

        expect(
            await screen.findByRole("heading", {
                level: 1,
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

        await user.type(
            screen.getByLabelText("Nombre o número de documento"),
            "Ana",
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
                busqueda: "Ana",
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
        expect(
            screen.getByLabelText("Nombre o número de documento"),
        ).toHaveValue("");
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

    it("refresca el listado y los indicadores al crear un préstamo", async () => {
        const user = renderPrestamos();
        await esperarCargaInicial();

        await user.click(
            screen.getByRole("button", { name: "Crear préstamo" }),
        );
        const dialog = await screen.findByRole("dialog", {
            name: "Crear préstamo",
        });
        await user.selectOptions(
            within(dialog).getByLabelText(/Empleado/),
            "6",
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
            }),
        );
        await waitFor(() => {
            expect(obtenerTodos).toHaveBeenCalledTimes(2);
            expect(obtenerIndicadores).toHaveBeenCalledTimes(2);
        });
        expect(listarEmpleados).toHaveBeenCalledWith({ status: "ACTIVO" });
    });
});
