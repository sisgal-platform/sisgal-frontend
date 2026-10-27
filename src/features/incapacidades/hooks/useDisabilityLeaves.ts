import { useCallback, useEffect, useState } from "react"

import { disabilityLeavesService } from "../services/disabilityLeavesService"
import type { DisabilityLeave, DisabilityLeaveQuery } from "../interfaces/types"

export function useDisabilityLeaves(query: DisabilityLeaveQuery) {
    const [version, setVersion] = useState(0)
    const [disabilityLeaves, setDisabilityLeaves] = useState<DisabilityLeave[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)

            try {
                const data = await disabilityLeavesService.findAll(query)
                if (!cancelled) setDisabilityLeaves(data)
            } catch (error: unknown) {
                // Traza técnica del error, además del mensaje amigable que ve el usuario
                console.error("Error al consultar incapacidades:", error)
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible cargar las incapacidades.",
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
    }, [
        query.employeeId,
        query.employeeName,
        query.document,
        query.positionId,
        query.status,
        query.startDate,
        query.endDate,
        query,
        version,
    ])

    const reload = useCallback(() => setVersion((current) => current + 1), [])

    return { disabilityLeaves, loading, error, reload }
}
