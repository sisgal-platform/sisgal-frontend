import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/apiError";

import { PayrollCalculationDialog } from "../components/PayrollCalculationDialog";
import type {
    PayrollCalculation,
    PayrollPreliquidation,
} from "../interfaces/types";
import { payrollPeriodsService } from "../services/payrollPeriodsService";

const calculatePayroll = vi.spyOn(payrollPeriodsService, "calculatePayroll");

const ANA: PayrollPreliquidation = {
    id: null as unknown as number,
    employeeId: 1,
    employeeName: "Ana Barros",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    settlementDate: "",
    totalEarnings: 1808782.5,
    totalDeductions: 412387.5,
    netPay: 1396395,
    status: "Preliquidación",
    employeeDocumentType: "CC",
    employeeDocument: "1020304050",
    employeePosition: "Mesera",
    earnings: [
        { conceptName: "Salario base", amount: 1500000 },
        { conceptName: "Horas extra diurnas", amount: 15625 },
        { conceptName: "Recargo nocturno", amount: 6562.5 },
        { conceptName: "Recargo dominical diurno", amount: 37500 },
        { conceptName: "Auxilio de transporte", amount: 249095 },
    ],
    deductions: [
        { conceptName: "Salud", amount: 62387.5 },
        { conceptName: "Pensión", amount: 62387.5 },
        {
            conceptName: "Cuota préstamo #4",
            amount: 250000,
            loan: {
                loanId: 4,
                installments: 1,
                scheduledAmount: 250000,
                outstandingBalance: 750000,
                pendingInstallments: 3,
            },
        },
    ],
    observations: [
        "El préstamo #9 no se descontó porque tiene información inconsistente. Revíselo en el módulo de préstamos.",
    ],
    workedHours: [
        {
            type: "ORDINARIA_DIURNA",
            label: "Horas ordinarias diurnas",
            hours: 160,
        },
        { type: "EXTRA_DIURNA", label: "Horas extra diurnas", hours: 2.5 },
    ],
};

const COMPLETED: PayrollCalculation = {
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    status: "COMPLETADO",
    totalEmployees: 1,
    totalEarnings: 1808782.5,
    totalDeductions: 412387.5,
    totalNetPay: 1396395,
    results: [ANA],
    errors: [],
};

const WITH_ERRORS: PayrollCalculation = {
    ...COMPLETED,
    status: "CON_ERRORES",
    totalEmployees: 2,
    errors: [
        {
            employeeId: 2,
            employeeName: "Carlos Mendoza",
            employeeDocumentType: "CC",
            employeeDocument: "2030405060",
            causes: [
                "La marcación del 08/09/2026 no tiene hora de salida.",
                "Ya tiene una liquidación registrada del 01/09/2026 al 30/09/2026.",
            ],
        },
    ],
};

function renderDialog() {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(<PayrollCalculationDialog onOpenChange={onOpenChange} />);
    return { user, onOpenChange, dialog: screen.getByRole("dialog") };
}

async function fillPeriod(
    user: ReturnType<typeof userEvent.setup>,
    dialog: HTMLElement,
    start: string,
    end: string,
) {
    await user.type(within(dialog).getByLabelText("Período desde"), start);
    await user.type(within(dialog).getByLabelText("Período hasta"), end);
}

function statusBadge() {
    return screen.getByRole("status", { name: /Estado del cálculo/ });
}

describe("PayrollCalculationDialog", () => {
    beforeEach(() => {
        calculatePayroll.mockReset();
    });

    it("inicia en estado pendiente y exige ambas fechas del período", async () => {
        const { user } = renderDialog();

        expect(statusBadge()).toHaveTextContent("Pendiente");
        await user.click(
            screen.getByRole("button", { name: "Calcular nómina" }),
        );

        expect(
            screen.getByText(
                "Selecciona las fechas de inicio y fin del período.",
            ),
        ).toBeInTheDocument();
        expect(calculatePayroll).not.toHaveBeenCalled();
    });

    it("no permite una fecha inicial posterior a la final", async () => {
        const { user, dialog } = renderDialog();

        await fillPeriod(user, dialog, "2026-09-30", "2026-09-01");
        await user.click(
            screen.getByRole("button", { name: "Calcular nómina" }),
        );

        expect(
            screen.getByText(
                "La fecha inicial no puede ser posterior a la fecha final.",
            ),
        ).toBeInTheDocument();
        expect(calculatePayroll).not.toHaveBeenCalled();
    });

    it("muestra el estado procesando y luego el resultado completado con totales en pesos", async () => {
        let resolveCalculation: (value: PayrollCalculation) => void = () => {};
        calculatePayroll.mockReturnValue(
            new Promise((resolve) => {
                resolveCalculation = resolve;
            }),
        );
        const { user, dialog } = renderDialog();

        await fillPeriod(user, dialog, "2026-09-01", "2026-09-30");
        await user.click(
            screen.getByRole("button", { name: "Calcular nómina" }),
        );

        expect(statusBadge()).toHaveTextContent("Procesando");
        expect(
            screen.getByRole("button", { name: "Calculando…" }),
        ).toBeDisabled();
        expect(calculatePayroll).toHaveBeenCalledWith({
            periodStart: "2026-09-01",
            periodEnd: "2026-09-30",
        });

        resolveCalculation(COMPLETED);

        expect(
            await screen.findByRole("heading", {
                name: "Resultado del cálculo",
            }),
        ).toBeInTheDocument();
        expect(statusBadge()).toHaveTextContent("Completado");
        expect(screen.getByText("1 de 1")).toBeInTheDocument();
        const table = screen.getByRole("table", {
            name: "Nómina calculada por empleado",
        });
        const row = within(table).getByRole("row", { name: /Ana Barros/ });
        expect(row).toHaveTextContent(/1\.808\.783/);
        expect(row).toHaveTextContent(/412\.388/);
        expect(row).toHaveTextContent(/1\.396\.395/);
    });

    it("identifica a cada empleado con errores y la causa, sin ocultar a los calculados", async () => {
        calculatePayroll.mockResolvedValue(WITH_ERRORS);
        const { user, dialog } = renderDialog();

        await fillPeriod(user, dialog, "2026-09-01", "2026-09-30");
        await user.click(
            screen.getByRole("button", { name: "Calcular nómina" }),
        );

        const errors = await screen.findByRole("region", {
            name: "Empleados con información por corregir (1)",
        });
        expect(statusBadge()).toHaveTextContent("Con errores");
        expect(
            within(errors).getByText("Carlos Mendoza · CC 2030405060"),
        ).toBeInTheDocument();
        expect(
            within(errors).getByText(
                "La marcación del 08/09/2026 no tiene hora de salida.",
            ),
        ).toBeInTheDocument();
        expect(
            within(errors).getByText(
                "Ya tiene una liquidación registrada del 01/09/2026 al 30/09/2026.",
            ),
        ).toBeInTheDocument();
        expect(screen.getByText("1 de 2")).toBeInTheDocument();
        expect(
            screen.getByRole("row", { name: /Ana Barros/ }),
        ).toBeInTheDocument();
    });

    it("muestra el detalle del empleado con horas, devengados, deducciones y neto separados", async () => {
        calculatePayroll.mockResolvedValue(COMPLETED);
        const { user, dialog } = renderDialog();

        await fillPeriod(user, dialog, "2026-09-01", "2026-09-30");
        await user.click(
            screen.getByRole("button", { name: "Calcular nómina" }),
        );
        await user.click(
            await screen.findByRole("button", {
                name: "Ver detalle del cálculo de Ana Barros",
            }),
        );

        expect(
            screen.getByRole("heading", { name: "Ana Barros" }),
        ).toBeInTheDocument();
        expect(screen.getByText("Horas ordinarias diurnas")).toBeInTheDocument();
        expect(screen.getByText("160 h")).toBeInTheDocument();
        expect(screen.getByText("2,5 h")).toBeInTheDocument();

        const concepts = screen.getByRole("table", {
            name: "Conceptos devengados y deducciones del cálculo",
        });
        for (const concept of [
            "Salario base",
            "Recargo nocturno",
            "Auxilio de transporte",
            "Salud",
            "Pensión",
            "Cuota préstamo #4",
        ]) {
            expect(within(concepts).getByText(concept)).toBeInTheDocument();
        }
        expect(
            within(concepts).getByRole("row", { name: /Total devengado/ }),
        ).toHaveTextContent(/1\.808\.783/);
        expect(
            within(concepts).getByRole("row", { name: /Total deducciones/ }),
        ).toHaveTextContent(/412\.388/);
        expect(
            within(concepts).getByRole("row", { name: /Neto a pagar/ }),
        ).toHaveTextContent(/1\.396\.395/);
        expect(
            within(concepts).getByText(
                /Préstamo #4 · Saldo restante: \$\s750\.000 · Cuotas pendientes: 3/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("region", { name: "Observaciones de préstamos" }),
        ).toHaveTextContent(
            "El préstamo #9 no se descontó porque tiene información inconsistente.",
        );

        await user.click(
            screen.getByRole("button", { name: "Volver al resultado" }),
        );
        expect(
            screen.getByRole("heading", { name: "Resultado del cálculo" }),
        ).toBeInTheDocument();
    });

    it("muestra el error del backend y marca el proceso con errores", async () => {
        calculatePayroll.mockRejectedValue(
            new ApiError(
                422,
                "No existe una jornada laboral vigente con horas diarias válidas al 30/09/2026.",
            ),
        );
        const { user, dialog } = renderDialog();

        await fillPeriod(user, dialog, "2026-09-01", "2026-09-30");
        await user.click(
            screen.getByRole("button", { name: "Calcular nómina" }),
        );

        expect(
            await screen.findByText(
                "No existe una jornada laboral vigente con horas diarias válidas al 30/09/2026.",
            ),
        ).toBeInTheDocument();
        expect(statusBadge()).toHaveTextContent("Con errores");
    });

    it("descarta el resultado anterior al cambiar el período", async () => {
        calculatePayroll.mockResolvedValue(COMPLETED);
        const { user, dialog } = renderDialog();

        await fillPeriod(user, dialog, "2026-09-01", "2026-09-30");
        await user.click(
            screen.getByRole("button", { name: "Calcular nómina" }),
        );
        await screen.findByRole("heading", { name: "Resultado del cálculo" });

        await user.clear(within(dialog).getByLabelText("Período hasta"));

        expect(
            screen.queryByRole("heading", { name: "Resultado del cálculo" }),
        ).not.toBeInTheDocument();
        expect(statusBadge()).toHaveTextContent("Pendiente");
    });

    it("informa cuando no hay empleados activos", async () => {
        calculatePayroll.mockResolvedValue({
            ...COMPLETED,
            totalEmployees: 0,
            totalEarnings: 0,
            totalDeductions: 0,
            totalNetPay: 0,
            results: [],
        });
        const { user, dialog } = renderDialog();

        await fillPeriod(user, dialog, "2026-09-01", "2026-09-30");
        await user.click(
            screen.getByRole("button", { name: "Calcular nómina" }),
        );

        expect(
            await screen.findByText("No hay empleados activos para liquidar."),
        ).toBeInTheDocument();
    });

    it("cierra el diálogo con el botón Cerrar del pie", async () => {
        const { user, onOpenChange } = renderDialog();
        // El primero es la X del encabezado del diálogo.
        const closeButtons = screen.getAllByRole("button", { name: "Cerrar" });

        await user.click(closeButtons[closeButtons.length - 1]);

        expect(onOpenChange).toHaveBeenCalledWith(false);
    });
});
