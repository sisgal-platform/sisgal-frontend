import { beforeEach, describe, expect, it, vi } from "vitest"

import apiClient from "@/lib/axios"

import { payrollPeriodsService } from "../services/payrollPeriodsService"
import type { PayrollPeriod, PayrollPeriodDetail } from "../interfaces/types"

vi.mock("@/lib/axios", () => ({
    default: {
        get: vi.fn(),
    },
}))

const client = vi.mocked(apiClient)

const PAYROLL_PERIOD: PayrollPeriod = {
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

const PAYROLL_PERIOD_DETAIL: PayrollPeriodDetail = {
    ...PAYROLL_PERIOD,
    employeeDocumentType: "CC",
    employeeDocument: "1020304050",
    employeePosition: "Mesera",
    earnings: [{ conceptName: "Salario base", amount: 1800000 }],
    deductions: [{ conceptName: "Salud y pensión", amount: 150000 }],
}

describe("payrollPeriodsService", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("lista todas las liquidaciones sin filtros", async () => {
        client.get.mockResolvedValue({ data: [PAYROLL_PERIOD] })

        await expect(payrollPeriodsService.findAll()).resolves.toEqual([PAYROLL_PERIOD])
        expect(client.get).toHaveBeenCalledWith("/liquidaciones", { params: {} })
    })

    it("lista las liquidaciones con los filtros recibidos", async () => {
        client.get.mockResolvedValue({ data: [PAYROLL_PERIOD] })

        await payrollPeriodsService.findAll({
            employeeId: 1,
            periodStart: "2026-09-01",
            periodEnd: "2026-09-30",
        })

        expect(client.get).toHaveBeenCalledWith("/liquidaciones", {
            params: { employeeId: 1, periodStart: "2026-09-01", periodEnd: "2026-09-30" },
        })
    })

    it("consulta el detalle de una liquidación por id", async () => {
        client.get.mockResolvedValue({ data: PAYROLL_PERIOD_DETAIL })

        await expect(payrollPeriodsService.findById(1)).resolves.toEqual(
            PAYROLL_PERIOD_DETAIL,
        )
        expect(client.get).toHaveBeenCalledWith("/liquidaciones/1")
    })
})
