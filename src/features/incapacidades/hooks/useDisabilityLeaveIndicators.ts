import { useEffect, useState } from "react"

import { disabilityLeavesService } from "../services/disabilityLeavesService"
import type { DisabilityLeaveIndicators } from "../interfaces/types"

// No existe un endpoint de indicadores en el backend (se eliminó para que los
// indicadores reflejaran siempre el mismo listado filtrado que se consulta);
// para el dashboard se calculan aquí sobre el listado completo, sin filtros.
export function useDisabilityLeaveIndicators() {
    const [indicators, setIndicators] = useState<DisabilityLeaveIndicators | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)

            try {
                const disabilityLeaves = await disabilityLeavesService.findAll()
                if (!cancelled) {
                    const active = disabilityLeaves.filter((item) => item.status === "Activo")
                    setIndicators({
                        activeCount: active.length,
                        totalActiveDays: active.reduce((sum, item) => sum + item.totalDays, 0),
                    })
                }
            } catch (error: unknown) {
                console.error("Error al consultar los indicadores de incapacidades:", error)
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible cargar los indicadores de incapacidades.",
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
    }, [])

    return { indicators, loading, error }
}
