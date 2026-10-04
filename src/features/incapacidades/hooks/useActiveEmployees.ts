import { useEffect, useState } from "react"

import { useToast } from "@/toast"
import { employeesService } from "@/features/empleados/services/employeesService"
import type { Employee } from "@/features/empleados/interfaces/types"

/** Carga los empleados activos para el selector del formulario de incapacidades. */
export function useActiveEmployees() {
    const { showToast } = useToast()
    const [employees, setEmployees] = useState<Employee[]>([])
    const [cargando, setCargando] = useState(true)

    useEffect(() => {
        let cancelado = false

        async function cargarEmpleados() {
            setCargando(true)

            try {
                const datos = await employeesService.list({ status: "ACTIVO" })
                if (!cancelado) setEmployees(datos)
            } catch {
                if (!cancelado) {
                    showToast("No se pudieron cargar los empleados disponibles.", "error")
                }
            } finally {
                if (!cancelado) setCargando(false)
            }
        }

        void cargarEmpleados()

        return () => {
            cancelado = true
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return { employees, cargando }
}
