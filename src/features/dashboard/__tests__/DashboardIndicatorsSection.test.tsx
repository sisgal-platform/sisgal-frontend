import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { DashboardIndicatorsSection } from "../components/DashboardIndicatorsSection"
import type { DashboardIndicators } from "../interfaces/types"
import { dashboardIndicatorsService } from "../services/dashboardIndicatorsService"

const getIndicators = vi.spyOn(dashboardIndicatorsService, "getIndicators")

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

const SIN_DATOS: DashboardIndicators = {
    attendance: { averagePercentage: null, changeVsPreviousPeriod: null, weeklyDistribution: [] },
    workedHours: { total: null, changeVsPreviousPeriod: null, trend: [] },
    laborCosts: { total: null, changeVsPreviousPeriod: null, distribution: [] },
}

beforeEach(() => {
    getIndicators.mockReset().mockResolvedValue(INDICATORS)
})

describe("DashboardIndicatorsSection", () => {
    it("muestra los indicadores una vez cargados", async () => {
        render(<DashboardIndicatorsSection />)

        expect(await screen.findByText("89%")).toBeInTheDocument()
        expect(screen.getByText("1.750")).toBeInTheDocument()
        expect(screen.getByText(/190\.000/)).toBeInTheDocument()
    })

    it("muestra 'Sin datos' cuando el backend no pudo calcular un indicador", async () => {
        getIndicators.mockReset().mockResolvedValue(SIN_DATOS)
        render(<DashboardIndicatorsSection />)

        await waitFor(() => expect(screen.getAllByText("Sin datos")).toHaveLength(3))
    })

    it("vuelve a consultar con el período indicado al presionar Consultar", async () => {
        const user = userEvent.setup()
        render(<DashboardIndicatorsSection />)
        await screen.findByText("89%")

        const [desde, hasta] = [screen.getByLabelText("Desde"), screen.getByLabelText("Hasta")]
        await user.clear(desde)
        await user.type(desde, "2026-09-01")
        await user.clear(hasta)
        await user.type(hasta, "2026-09-30")
        await user.click(screen.getByRole("button", { name: "Consultar" }))

        await waitFor(() =>
            expect(getIndicators).toHaveBeenLastCalledWith({
                periodoDesde: "2026-09-01",
                periodoHasta: "2026-09-30",
            }),
        )
    })

    it("muestra un error cuando no puede cargar los indicadores", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {})
        getIndicators.mockReset().mockRejectedValue(new Error("fallo de red"))

        render(<DashboardIndicatorsSection />)

        expect(await screen.findByText("fallo de red")).toBeInTheDocument()
        consoleError.mockRestore()
    })
})
