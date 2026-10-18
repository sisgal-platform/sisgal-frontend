import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router";

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

const findAll = vi.spyOn(payrollPeriodsService, "findAll")
const findById = vi.spyOn(payrollPeriodsService, "findById")
const getPdf = vi.spyOn(payrollPeriodsService, "getPdf")
const listEmployees = vi.spyOn(employeesService, "list")

// jsdom no implementa la API de blob URLs; se stubea con valores predecibles
// para poder verificar que el iframe de vista previa recibe la URL generada.
const createObjectURL = vi.fn(() => "blob:preview-url")
const revokeObjectURL = vi.fn()
vi.stubGlobal("URL", { ...URL, createObjectURL, revokeObjectURL })

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
};

const PRELIQUIDATION_ANA: PayrollPreliquidation = {
    periodStart: "2026-09-01",
    periodEnd: "2026-09-30",
    employees: [
        {
            employeeId: 1,
            employeeName: "Ana Barros",
            employeeDocumentType: "CC",
            employeeDocument: "1020304050",
            employeePosition: "Mesera",
            hours: [
                { type: "Ordinarias", hours: 160 },
                { type: "Extra diurna", hours: 6 },
            ],
            surcharges: [{ conceptName: "Recargo nocturno", amount: 25000 }],
            earnings: [{ conceptName: "Salario base", amount: 1530000 }],
            deductions: [{ conceptName: "Salud", amount: 72000 }],
            totalEarnings: 1555000,
            totalDeductions: 72000,
            netPay: 1483000,
            inconsistencies: [],
        },
    ],
};

function renderFeature() {
    const user = userEvent.setup();
    render(
        <MemoryRouter initialEntries={["/nomina"]}>
            <ToastProvider>
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

async function esperarTabla() {
    await screen.findByRole("heading", { name: "Liquidación" });
    await screen.findByRole("cell", { name: "Ana Barros" });
}

beforeEach(() => {
    findAll.mockReset().mockResolvedValue([PAYROLL_PERIOD_ANA, PAYROLL_PERIOD_CARLOS])
    findById.mockReset().mockResolvedValue(PAYROLL_PERIOD_DETAIL_ANA)
    getPdf.mockReset()
    listEmployees.mockReset().mockResolvedValue([ANA])
    createObjectURL.mockClear()
    revokeObjectURL.mockClear()
})

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
        expect(screen.getByText("CC 1020304050")).toBeInTheDocument();
        expect(screen.getByText("Mesera")).toBeInTheDocument();
        expect(screen.getByText("Salario base")).toBeInTheDocument();
        expect(screen.getByText("Horas extra")).toBeInTheDocument();
        expect(screen.getByText("Salud y pensión")).toBeInTheDocument();
        expect(
            screen.getByRole("button", { name: "Descargar PDF" }),
        ).toBeDisabled();
        expect(findById).toHaveBeenCalledWith(1);
    });

    it("muestra la preliquidación y guarda solo después de confirmarla", async () => {
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

        expect(await screen.findByText("Recargo nocturno")).toBeInTheDocument();
        expect(screen.getByText("Ordinarias")).toBeInTheDocument();
        expect(screen.getByText("Extra diurna")).toBeInTheDocument();
        expect(screen.getByText("Salud")).toBeInTheDocument();
        expect(generatePreliquidation).toHaveBeenCalledWith({
            employeeId: 1,
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
        await waitFor(() => expect(findAll).toHaveBeenCalledTimes(2));
        expect(
            screen.queryByRole("heading", { name: "Preliquidación de nómina" }),
        ).not.toBeInTheDocument();
    });

    it("bloquea la confirmación si la preliquidación tiene inconsistencias", async () => {
        const user = renderFeature();
        await esperarTabla();
        generatePreliquidation.mockResolvedValueOnce({
            ...PRELIQUIDATION_ANA,
            employees: [
                {
                    ...PRELIQUIDATION_ANA.employees[0],
                    inconsistencies: ["El salario base no está configurado."],
                },
            ],
        });

        await user.click(
            screen.getByRole("button", { name: "Ver detalle de la liquidación de Ana Barros" }),
        )

        const dialog = await screen.findByRole("dialog", { name: "Detalle de la liquidación" })
        expect(within(dialog).getByText("CC 1020304050")).toBeInTheDocument()
        expect(within(dialog).getByText("Mesera")).toBeInTheDocument()
        expect(within(dialog).getByText("Salario base")).toBeInTheDocument()
        expect(within(dialog).getByText("Horas extra")).toBeInTheDocument()
        expect(within(dialog).getByText("Salud y pensión")).toBeInTheDocument()
        expect(findById).toHaveBeenCalledWith(1)
    })

    it("genera y muestra la vista previa del PDF al presionar Generar PDF", async () => {
        const user = renderFeature()
        await esperarTabla()
        await user.click(
            screen.getByRole("button", { name: "Ver detalle de la liquidación de Ana Barros" }),
        )
        await screen.findByRole("dialog", { name: "Detalle de la liquidación" })

        const blob = new Blob(["%PDF-1.4"], { type: "application/pdf" })
        getPdf.mockResolvedValue(blob)

        await user.click(screen.getByRole("button", { name: "Generar PDF" }))

        const dialog = await screen.findByRole("dialog", { name: "Comprobante de pago" })
        expect(within(dialog).getByTitle("Vista previa del comprobante de pago")).toHaveAttribute(
            "src",
            "blob:preview-url",
        )
        expect(getPdf).toHaveBeenCalledWith(1)
    })

    it("descarga el mismo PDF que se previsualizó, sin volver a generarlo", async () => {
        const user = renderFeature()
        await esperarTabla()
        await user.click(
            screen.getByRole("button", { name: "Ver detalle de la liquidación de Ana Barros" }),
        )
        await screen.findByRole("dialog", { name: "Detalle de la liquidación" })
        getPdf.mockResolvedValue(new Blob(["%PDF-1.4"], { type: "application/pdf" }))
        await user.click(screen.getByRole("button", { name: "Generar PDF" }))
        await screen.findByRole("dialog", { name: "Comprobante de pago" })

        const clickAnchor = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {})
        await user.click(screen.getByRole("button", { name: "Descargar PDF" }))

        expect(clickAnchor).toHaveBeenCalledTimes(1)
        expect(getPdf).toHaveBeenCalledTimes(1)
        clickAnchor.mockRestore()
    })

    it("muestra un error cuando no se puede generar el PDF", async () => {
        const user = renderFeature()
        await esperarTabla()
        await user.click(
            screen.getByRole("button", { name: "Ver detalle de la liquidación de Ana Barros" }),
        )
        await screen.findByRole("dialog", { name: "Detalle de la liquidación" })
        getPdf.mockRejectedValue(new Error("No fue posible determinar la sucursal."))

        await user.click(screen.getByRole("button", { name: "Generar PDF" }))

        expect(await screen.findByText("No fue posible determinar la sucursal.")).toBeInTheDocument()
    })

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
