import { render, screen, waitFor, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { LiquidacionesFeature } from "../index"
import type { PayrollPeriod, PayrollPeriodDetail } from "../interfaces/types"
import { payrollPeriodsService } from "../services/payrollPeriodsService"
import { employeesService } from "@/features/empleados/services/employeesService"
import type { Employee } from "@/features/empleados/interfaces/types"
import { ToastProvider } from "@/toast/components/ToastProvider"

const findAll = vi.spyOn(payrollPeriodsService, "findAll")
const findById = vi.spyOn(payrollPeriodsService, "findById")
const listEmployees = vi.spyOn(employeesService, "list")

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
}

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
}

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
}

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
}

function renderFeature() {
    const user = userEvent.setup()
    render(
        <ToastProvider>
            <LiquidacionesFeature />
        </ToastProvider>,
    )
    return user
}

async function esperarTabla() {
    await screen.findByRole("heading", { name: "Liquidación" })
    await screen.findByRole("cell", { name: "Ana Barros" })
}

beforeEach(() => {
    findAll.mockReset().mockResolvedValue([PAYROLL_PERIOD_ANA, PAYROLL_PERIOD_CARLOS])
    findById.mockReset().mockResolvedValue(PAYROLL_PERIOD_DETAIL_ANA)
    listEmployees.mockReset().mockResolvedValue([ANA])
})

describe("LiquidacionesFeature", () => {
    it("muestra la tabla con las liquidaciones registradas", async () => {
        renderFeature()
        await esperarTabla()

        const filaAna = screen.getByRole("cell", { name: "Ana Barros" }).closest("tr") as HTMLElement
        expect(within(filaAna).getByText("Confirmada")).toBeInTheDocument()
        expect(screen.getByText("Carlos Mendoza")).toBeInTheDocument()
        expect(findAll).toHaveBeenCalledWith({})
    })

    it("aplica el filtro de empleado seleccionado en el combobox de búsqueda", async () => {
        const user = renderFeature()
        await esperarTabla()

        await user.click(screen.getByRole("combobox"))
        await user.click(await screen.findByRole("option", { name: "Ana Barros" }))
        await user.click(screen.getByRole("button", { name: "Aplicar filtros" }))

        await waitFor(() => expect(findAll).toHaveBeenLastCalledWith({ employeeId: 1 }))
    })

    it("valida que el período inicial no sea posterior al final", async () => {
        const user = renderFeature()
        await esperarTabla()

        const [desde, hasta] = screen.getAllByLabelText(/Período/)
        await user.type(desde, "2026-09-30")
        await user.type(hasta, "2026-09-01")
        await user.click(screen.getByRole("button", { name: "Aplicar filtros" }))

        expect(
            await screen.findByText("El período inicial no puede ser posterior al período final."),
        ).toBeInTheDocument()
        expect(findAll).toHaveBeenCalledTimes(1)
    })

    it("muestra el detalle de una liquidación separando devengados y deducciones", async () => {
        const user = renderFeature()
        await esperarTabla()

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

    it("muestra un estado vacío cuando no hay liquidaciones para los filtros", async () => {
        findAll.mockReset().mockResolvedValue([])
        renderFeature()

        expect(
            await screen.findByText(
                "No se encontraron liquidaciones correspondientes a los criterios indicados.",
            ),
        ).toBeInTheDocument()
    })

    it("muestra un error cuando no puede cargar las liquidaciones", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
        findAll.mockReset().mockRejectedValue(new Error("fallo de red"))

        renderFeature()

        expect(await screen.findByText("fallo de red")).toBeInTheDocument()
        consoleError.mockRestore()
    })
})
