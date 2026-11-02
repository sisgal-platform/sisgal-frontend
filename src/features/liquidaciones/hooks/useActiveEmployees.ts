import { useEffect, useState } from "react"

import { useToast } from "@/toast"
import { employeesService } from "@/features/empleados/services/employeesService"
import type { Employee } from "@/features/empleados/interfaces/types"

/** Carga los empleados activos para el selector del filtro de liquidaciones. */
export function useActiveEmployees() {
    const { showToast } = useToast()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        let cancelled = false

        async function loadEmployees() {
            setLoading(true)

            try {
                const data = await employeesService.list({ status: "ACTIVO" })
                if (!cancelled) setEmployees(data)
            } catch {
                if (!cancelled) {
                    showToast("No se pudieron cargar los empleados disponibles.", "error")
                }
            } finally {
                if (!cancelled) setLoading(false)
            }
        }

        void loadEmployees()

        return () => {
            cancelled = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { employees, loading }
}
