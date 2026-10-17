import { useEffect, useState } from "react"

import { employeesService } from "@/features/empleados/services/employeesService"

/** Cantidad de empleados activos, para la tarjeta de resumen del dashboard. */
export function useActiveEmployeesCount() {
    const [count, setCount] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelled = false

        async function load() {
            setLoading(true)
            setError(null)

            try {
                const employees = await employeesService.list({ status: "ACTIVO" })
                if (!cancelled) setCount(employees.length)
            } catch (error: unknown) {
                console.error("Error al consultar los empleados activos:", error)
                if (!cancelled) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible cargar los empleados.",
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

    return { count, loading, error }
}
