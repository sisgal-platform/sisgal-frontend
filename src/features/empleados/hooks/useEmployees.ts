import { useCallback, useEffect, useState } from "react"

import { employeesService } from "../services/employeesService"
import type { Employee, EmployeeListFilters } from "../interfaces/types"

/** Carga los empleados según los filtros recibidos; se recarga si cambian. */
export function useEmployees(filters: EmployeeListFilters) {
  const [version, setVersion] = useState(0)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const cargar = useCallback(async () => {
    try {
      setCargando(true)
      setError(null)

      const data = await employeesService.list(filters)
      setEmployees(data)
    } catch {
      setError("No fue posible cargar los empleados.")
    } finally {
      setCargando(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.search, filters.branchId, filters.positionId, filters.status])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Start async data loading when filters or the reload version change.
    void cargar()
  }, [cargar, version])

  const recargar = useCallback(() => setVersion((actual) => actual + 1), [])

  return { employees, cargando, error, recargar }
}
