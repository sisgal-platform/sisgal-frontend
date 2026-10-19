import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes, useLocation } from "react-router";

import { LiquidacionesFeature } from "../index";
import { LiquidacionDetallePage } from "@/pages/nomina/LiquidacionDetallePage";
import type {
    PayrollPeriod,
    PayrollPeriodDetail,
    PayrollPreliquidation,
} from "../interfaces/types";
import { payrollPeriodsService } from "../services/payrollPeriodsService";
import { employeesService } from "@/features/empleados/services/employeesService";
import type { Employee } from "@/features/empleados/interfaces/types";
import { ToastProvider } from "@/toast/components/ToastProvider";

const findAll = vi.spyOn(payrollPeriodsService, "findAll");
const findById = vi.spyOn(payrollPeriodsService, "findById");
const generatePreliquidation = vi.spyOn(
    payrollPeriodsService,
    "generatePreliquidation",
);
const confirmPreliquidation = vi.spyOn(
    payrollPeriodsService,
    "confirmPreliquidation",
);
const getPdf = vi.spyOn(payrollPeriodsService, "getPdf");
const listEmployees = vi.spyOn(employeesService, "list");

// jsdom no implementa la API de blob URLs; se stubea con valores predecibles
// para poder verificar que el iframe de vista previa recibe la URL generada.
const createObjectURL = vi.fn(() => "blob:preview-url");
const revokeObjectURL = vi.fn();
// Solo se reemplazan los métodos estáticos: react-router necesita el constructor URL real.
Object.assign(URL, { createObjectURL, revokeObjectURL });

const ANA: Employee = {
    id: 1,
    firstName: "Ana",
    lastName: "Barros",
    documentType: "CC",
    document: "1020304050",
    phone: "3001234567",
    salaryBase: 1800000,
    position: "Mesera",
    status: "ACTIVO",
    branchId: 1,
    positionId: 1,
    branchName: "Centro",
    positionName: "Mesera",
};

const EMPLOYEE_INACTIVE: Employee = {
    ...ANA,
    id: 2,
    firstName: "Carlos",
    lastName: "Mendoza",
    document: "2030405060",
    status: "INACTIVO",
};

const PAYROLL_PERIOD_ANA: PayrollPeriod = {
    id: 1,
    employeeId: 1,
    employeeName: "Ana Barros",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    settlementDate: "2026-09-30",
    totalEarnings: 1800000,
    totalDeductions: 150000,
    netPay: 1650000,
    status: "Confirmada",
};

const PAYROLL_PERIOD_CARLOS: PayrollPeriod = {
    id: 2,
    employeeId: 2,
    employeeName: "Carlos Mendoza",
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    settlementDate: "2026-09-30",
    totalEarnings: 2100000,
    totalDeductions: 230000,
    netPay: 1870000,
    status: "Confirmada",
};

const PAYROLL_PERIOD_DETAIL_ANA: PayrollPeriodDetail = {
    ...PAYROLL_PERIOD_ANA,
    employeeDocumentType: "CC",
    employeeDocument: "1020304050",
    employeePosition: "Mesera",
    earnings: [
        { conceptName: "Salario base", amount: 1530000 },
        { conceptName: "Horas extra", amount: 270000 },
    ],
    deductions: [{ conceptName: "Salud y pensión", amount: 150000 }],
    workedHours: [],
    observations: [],
};

const CUOTA_PRESTAMO_ANA = {
    conceptName: "Cuota préstamo #4",
    amount: 250000,
    loan: {
        loanId: 4,
        installments: 1,
        scheduledAmount: 250000,
        outstandingBalance: 750000,
        pendingInstallments: 3,
    },
};

const OBSERVACION_LIMITE =
    "La cuota del préstamo #9 no se descontó porque supera el límite de deducciones del período (50% del salario neto).";

const PRELIQUIDATION_ANA: PayrollPreliquidation = {
    ...PAYROLL_PERIOD_DETAIL_ANA,
    deductions: [
        ...PAYROLL_PERIOD_DETAIL_ANA.deductions,
        CUOTA_PRESTAMO_ANA,
    ],
    observations: [OBSERVACION_LIMITE],
};

function renderFeature() {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/nomina"]}>
            <ToastProvider>
                <CurrentRoute />
                <Routes>
                    <Route path="/nomina" element={<LiquidacionesFeature />} />
                    <Route
                        path="/nomina/liquidaciones/:payrollPeriodId"
                        element={<LiquidacionDetallePage />}
                    />
                </Routes>
            </ToastProvider>
        </MemoryRouter>,
    );
    return user;
}

function CurrentRoute() {
    const location = useLocation();
    return <output data-testid="current-route">{location.pathname}</output>;
}

async function esperarTabla() {
    await screen.findByRole("heading", { name: "Liquidaciones" });
    await screen.findByRole("cell", { name: "Ana Barros" });
}

beforeEach(() => {
    findAll
        .mockReset()
        .mockResolvedValue([PAYROLL_PERIOD_ANA, PAYROLL_PERIOD_CARLOS]);
    findById.mockReset().mockResolvedValue(PAYROLL_PERIOD_DETAIL_ANA);
    generatePreliquidation.mockReset().mockResolvedValue(PRELIQUIDATION_ANA);
    confirmPreliquidation
        .mockReset()
        .mockResolvedValue({ ...PAYROLL_PERIOD_DETAIL_ANA, id: 7 });
    getPdf.mockReset();
    listEmployees.mockReset().mockResolvedValue([ANA]);
    createObjectURL.mockClear();
    revokeObjectURL.mockClear();
});

describe("LiquidacionesFeature", () => {
    it("muestra la tabla con las liquidaciones registradas", async () => {
        renderFeature();
        await esperarTabla();

        const filaAna = screen
            .getByRole("cell", { name: "Ana Barros" })
            .closest("tr") as HTMLElement;
        expect(within(filaAna).getByText("Confirmada")).toBeInTheDocument();
        expect(screen.getByText("Carlos Mendoza")).toBeInTheDocument();
        expect(findAll).toHaveBeenCalledWith({});
    });

    it("aplica el filtro de empleado seleccionado en el combobox de búsqueda", async () => {
        const user = renderFeature();
        await esperarTabla();

        await user.click(screen.getByRole("combobox"));
        await user.click(
            await screen.findByRole("option", {
                name: "Ana Barros · 1020304050",
            }),
        );
        await user.click(
            screen.getByRole("button", { name: "Aplicar filtros" }),
        );

        await waitFor(() =>
            expect(findAll).toHaveBeenLastCalledWith({ employeeId: 1 }),
        );
    });

    it("valida que el período inicial no sea posterior al final", async () => {
        const user = renderFeature();
        await esperarTabla();

        const [desde, hasta] = screen.getAllByLabelText(/Período/);
        await user.type(desde, "2026-09-30");
        await user.type(hasta, "2026-09-01");
        await user.click(
            screen.getByRole("button", { name: "Aplicar filtros" }),
        );

        expect(
            await screen.findByText(
                "El período inicial no puede ser posterior al período final.",
            ),
        ).toBeInTheDocument();
        expect(findAll).toHaveBeenCalledTimes(1);
    });

    it("navega al detalle como página y separa devengados y deducciones", async () => {
        const user = renderFeature();
        await esperarTabla();

        await user.click(
            screen.getByRole("button", {
                name: "Ver detalle de la liquidación de Ana Barros",
            }),
        );

        expect(
            await screen.findByRole("heading", {
                name: "Detalle de la liquidación",
            }),
        ).toBeInTheDocument();
        expect(screen.getByText(/CC 1020304050/)).toBeInTheDocument();
        expect(screen.getByText("Mesera")).toBeInTheDocument();
        expect(screen.getByText("Salario base")).toBeInTheDocument();
        expect(screen.getByText("Horas extra")).toBeInTheDocument();
        expect(screen.getByText("Salud y pensión")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Descargar PDF" }),
        ).toBeDisabled();
        expect(findById).toHaveBeenCalledWith(1);
        expect(
            screen.queryByRole("region", { name: "Observaciones de préstamos" }),
        ).not.toBeInTheDocument();
    });

    it("identifica en el detalle el préstamo de cada cuota, su saldo restante y los descuentos parciales", async () => {
        findById.mockReset().mockResolvedValue({
            ...PAYROLL_PERIOD_DETAIL_ANA,
            deductions: [
                ...PAYROLL_PERIOD_DETAIL_ANA.deductions,
                {
                    conceptName: "Cuota préstamo #5",
                    amount: 100000,
                    loan: {
                        loanId: 5,
                        installments: 2,
                        scheduledAmount: 300000,
                        outstandingBalance: 500000,
                        pendingInstallments: 4,
                    },
                },
            ],
            observations: [
                "La cuota del préstamo #5 se descontó parcialmente por el límite de deducciones del período (50% del salario neto).",
            ],
        });
        const user = renderFeature();
        await esperarTabla();

        await user.click(
            screen.getByRole("button", {
                name: "Ver detalle de la liquidación de Ana Barros",
            }),
        );

        const cuota = (await screen.findByText("Cuota préstamo #5")).closest(
            "tr",
        );
        expect(cuota).toHaveTextContent(
            /Préstamo #5 · 2 cuotas · Saldo restante: \$\s500\.000 · Cuotas pendientes: 4/,
        );
        expect(cuota).toHaveTextContent(
            /Descuento parcial: correspondían \$\s300\.000/,
        );
        expect(cuota).toHaveTextContent(/-\$\s100\.000/);
        expect(
            screen.getByRole("region", { name: "Observaciones de préstamos" }),
        ).toHaveTextContent(
            "La cuota del préstamo #5 se descontó parcialmente",
        );
    });

    it("genera la liquidación al confirmar y navega a su detalle", async () => {
        const user = renderFeature();
        await esperarTabla();
        listEmployees.mockReset().mockResolvedValue([ANA, EMPLOYEE_INACTIVE]);

        await user.click(
            screen.getByRole("button", { name: "Generar liquidación" }),
        );
        const dialog = screen.getByRole("dialog", {
            name: "Preliquidación de nómina",
        });
        const employeeSelector = within(dialog).getByRole("combobox");
        await user.click(employeeSelector);
        await user.type(employeeSelector, "1020304050");
        await user.click(
            await within(dialog).findByRole("option", {
                name: "Ana Barros · 1020304050",
            }),
        );
        expect(
            within(dialog).queryByRole("option", {
                name: "Carlos Mendoza · 2030405060",
            }),
        ).not.toBeInTheDocument();
        await user.type(
            within(dialog).getByLabelText("Período desde"),
            "2026-09-01",
        );
        await user.type(
            within(dialog).getByLabelText("Período hasta"),
            "2026-09-30",
        );
        await user.click(
            screen.getByRole("button", { name: "Generar preliquidación" }),
        );

        expect(await screen.findByText("Salario base")).toBeInTheDocument();
        expect(screen.getByText("Salud y pensión")).toBeInTheDocument();
        // La preliquidación muestra la cuota, su préstamo y el saldo que quedaría.
        expect(screen.getByText("Cuota préstamo #4")).toBeInTheDocument();
        expect(
            screen.getByText(
                /Préstamo #4 · Saldo restante: \$\s750\.000 · Cuotas pendientes: 3/,
            ),
        ).toBeInTheDocument();
        expect(
            screen.getByRole("region", { name: "Observaciones de préstamos" }),
        ).toHaveTextContent(OBSERVACION_LIMITE);
        expect(screen.getByText(/CC 1020304050/)).toBeInTheDocument();
        expect(generatePreliquidation).toHaveBeenCalledWith(1, {
            periodStart: "2026-09-01",
            periodEnd: "2026-09-30",
        });

        await user.click(
            screen.getByRole("button", { name: "Confirmar liquidación" }),
        );

        await waitFor(() =>
            expect(confirmPreliquidation).toHaveBeenCalledWith({
                employeeId: 1,
                periodStart: "2026-09-01",
                periodEnd: "2026-09-30",
            }),
        );
        await expect(
            confirmPreliquidation.mock.results[0].value,
        ).resolves.toMatchObject({
            id: 7,
        });
        await waitFor(() =>
            expect(screen.getByTestId("current-route")).toHaveTextContent(
                "/nomina/liquidaciones/7",
            ),
        );
        await waitFor(() => expect(findById).toHaveBeenLastCalledWith(7));
        expect(
            await screen.findByRole("heading", {
                name: "Detalle de la liquidación",
            }),
        ).toBeInTheDocument();
        await waitFor(() => expect(findAll).toHaveBeenCalledTimes(2));
        expect(
            screen.queryByRole("heading", { name: "Preliquidación de nómina" }),
        ).not.toBeInTheDocument();
    });

    it("muestra el spinner Generando mientras guarda la liquidación", async () => {
        const user = renderFeature();
        await esperarTabla();

        await user.click(
            screen.getByRole("button", { name: "Generar liquidación" }),
        );
        const dialog = screen.getByRole("dialog", {
            name: "Preliquidación de nómina",
        });
        await user.click(within(dialog).getByRole("combobox"));
        await user.click(
            await within(dialog).findByRole("option", {
                name: "Ana Barros · 1020304050",
            }),
        );
        await user.type(
            within(dialog).getByLabelText("Período desde"),
            "2026-09-01",
        );
        await user.type(
            within(dialog).getByLabelText("Período hasta"),
            "2026-09-30",
        );
        await user.click(
            screen.getByRole("button", { name: "Generar preliquidación" }),
        );
        await screen.findByText("Salario base");

        let resolveConfirmation!: (value: PayrollPeriodDetail) => void;
        confirmPreliquidation.mockReturnValue(
            new Promise<PayrollPeriodDetail>((resolve) => {
                resolveConfirmation = resolve;
            }),
        );
        await user.click(
            screen.getByRole("button", { name: "Confirmar liquidación" }),
        );

        expect(
            await screen.findByRole("button", { name: "Generando…" }),
        ).toBeDisabled();
        expect(
            screen
                .getByRole("button", { name: "Generando…" })
                .querySelector("svg"),
        ).toHaveClass("animate-spin");

        resolveConfirmation({ ...PAYROLL_PERIOD_DETAIL_ANA, id: 7 });
        expect(
            await screen.findByRole("heading", {
                name: "Detalle de la liquidación",
            }),
        ).toBeInTheDocument();
    });

    it("genera y muestra la vista previa del PDF al presionar Generar PDF", async () => {
        const user = renderFeature();
        await esperarTabla();
        await user.click(
            screen.getByRole("button", {
                name: "Ver detalle de la liquidación de Ana Barros",
            }),
        );
        await screen.findByRole("dialog", {
            name: "Detalle de la liquidación",
        });

        const blob = new Blob(["%PDF-1.4"], { type: "application/pdf" });
        getPdf.mockResolvedValue(blob);

        await user.click(screen.getByRole("button", { name: "Generar PDF" }));

        const dialog = await screen.findByRole("dialog", {
            name: "Comprobante de pago",
        });
        expect(
            within(dialog).getByTitle("Vista previa del comprobante de pago"),
        ).toHaveAttribute("src", "blob:preview-url");
        expect(getPdf).toHaveBeenCalledWith(1);
    });

    it("descarga el mismo PDF que se previsualizó, sin volver a generarlo", async () => {
        const user = renderFeature();
        await esperarTabla();
        await user.click(
            screen.getByRole("button", {
                name: "Ver detalle de la liquidación de Ana Barros",
            }),
        );
        await screen.findByRole("dialog", {
            name: "Detalle de la liquidación",
        });
        getPdf.mockResolvedValue(
            new Blob(["%PDF-1.4"], { type: "application/pdf" }),
        );
        await user.click(screen.getByRole("button", { name: "Generar PDF" }));
        await screen.findByRole("dialog", { name: "Comprobante de pago" });

        const clickAnchor = vi
            .spyOn(HTMLAnchorElement.prototype, "click")
            .mockImplementation(() => {});
        await user.click(screen.getByRole("button", { name: "Descargar PDF" }));

        expect(clickAnchor).toHaveBeenCalledTimes(1);
        expect(getPdf).toHaveBeenCalledTimes(1);
        clickAnchor.mockRestore();
    });

    it("muestra un error cuando no se puede generar el PDF", async () => {
        const user = renderFeature();
        await esperarTabla();
        await user.click(
            screen.getByRole("button", {
                name: "Ver detalle de la liquidación de Ana Barros",
            }),
        );
        await screen.findByRole("dialog", {
            name: "Detalle de la liquidación",
        });
        getPdf.mockRejectedValue(
            new Error("No fue posible determinar la sucursal."),
        );

        await user.click(screen.getByRole("button", { name: "Generar PDF" }));

        expect(
            await screen.findByText("No fue posible determinar la sucursal."),
        ).toBeInTheDocument();
    });

    it("muestra un estado vacío cuando no hay liquidaciones para los filtros", async () => {
        findAll.mockReset().mockResolvedValue([]);
        renderFeature();

        expect(
            await screen.findByText(
                "No se encontraron liquidaciones correspondientes a los criterios indicados.",
            ),
        ).toBeInTheDocument();
    });

    it("muestra un error cuando no puede cargar las liquidaciones", async () => {
        const consoleError = vi
            .spyOn(console, "error")
            .mockImplementation(() => {});
        findAll.mockReset().mockRejectedValue(new Error("fallo de red"));

        renderFeature();

        expect(await screen.findByText("fallo de red")).toBeInTheDocument();
        consoleError.mockRestore();
    });
});
