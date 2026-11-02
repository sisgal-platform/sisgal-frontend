import { beforeEach, describe, expect, it, vi } from "vitest"

import apiClient from "@/lib/axios"

import { dashboardIndicatorsService } from "../services/dashboardIndicatorsService"
import type { DashboardIndicators } from "../interfaces/types"

vi.mock("@/lib/axios", () => ({
    default: {
        get: vi.fn(),
    },
}))

const client = vi.mocked(apiClient)

const INDICATORS: DashboardIndicators = {
    attendance: {
        averagePercentage: 89,
        changeVsPreviousPeriod: 3.2,
        weeklyDistribution: [{ day: "Lun", percentage: 92 }],
    },
    workedHours: {
        total: 1750,
        changeVsPreviousPeriod: 2.9,
        trend: [{ month: "Oct", hours: 1750 }],
    },
    laborCosts: {
        total: 190000,
        changeVsPreviousPeriod: -1.5,
        distribution: [{ category: "Devengado", amount: 158000, percentage: 83 }],
    },
}

describe("dashboardIndicatorsService", () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it("consulta los indicadores sin filtros", async () => {
        client.get.mockResolvedValue({ data: INDICATORS })

        await expect(dashboardIndicatorsService.getIndicators()).resolves.toEqual(INDICATORS)
        expect(client.get).toHaveBeenCalledWith("/dashboard/indicadores", { params: {} })
    })

    it("consulta los indicadores con el período recibido", async () => {
        client.get.mockResolvedValue({ data: INDICATORS })

        await dashboardIndicatorsService.getIndicators({
            periodoDesde: "2026-10-01",
            periodoHasta: "2026-10-31",
        })

        expect(client.get).toHaveBeenCalledWith("/dashboard/indicadores", {
            params: { periodoDesde: "2026-10-01", periodoHasta: "2026-10-31" },
        })
    })

    it("propaga el error cuando la consulta falla", async () => {
        client.get.mockRejectedValue(new Error("fallo de red"))

        await expect(dashboardIndicatorsService.getIndicators()).rejects.toThrow()
    })
})
