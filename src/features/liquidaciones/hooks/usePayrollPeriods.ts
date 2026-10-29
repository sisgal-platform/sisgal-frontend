import { useCallback, useEffect, useState } from "react"

import { payrollPeriodsService } from "../services/payrollPeriodsService"
import type { PayrollPeriod, PayrollPeriodQuery } from "../interfaces/types"

export function usePayrollPeriods(query: PayrollPeriodQuery) {
    const [version, setVersion] = useState(0)
    const [payrollPeriods, setPayrollPeriods] = useState<PayrollPeriod[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)

            try {
                const data = await payrollPeriodsService.findAll(query)
                if (!cancelled) setPayrollPeriods(data)
            } catch (error: unknown) {
                console.error("Error al consultar liquidaciones:", error)
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible cargar las liquidaciones.",
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
    }, [query.employeeId, query.periodStart, query.periodEnd, query, version])

    const reload = useCallback(() => setVersion((current) => current + 1), [])

    return { payrollPeriods, loading, error, reload }
}
