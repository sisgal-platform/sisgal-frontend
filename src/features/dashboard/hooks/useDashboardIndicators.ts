import { useEffect, useState } from "react"

import { dashboardIndicatorsService } from "../services/dashboardIndicatorsService"
import type { DashboardIndicators, DashboardIndicatorsQuery } from "../interfaces/types"

export function useDashboardIndicators(query: DashboardIndicatorsQuery) {
    const [indicators, setIndicators] = useState<DashboardIndicators | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)

            try {
                const data = await dashboardIndicatorsService.getIndicators(query)
                if (!cancelled) setIndicators(data)
            } catch (error: unknown) {
                console.error("Error al consultar los indicadores del dashboard:", error)
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible cargar los indicadores.",
                    )
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        void load()

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query.periodoDesde, query.periodoHasta])

    return { indicators, loading, error }
}
