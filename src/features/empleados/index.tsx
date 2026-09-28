import { useEffect, useState } from "react"

import { SectionHeader } from "@/components/atoms/SectionHeader"
import { useToast } from "@/toast"

import { EmployeeFormModal } from "./components/EmployeeFormModal"
import { EmployeeTable } from "./components/EmployeeTable"
import { useEmployees } from "./hooks/useEmployees"
import { useActiveBranches } from "./hooks/useActiveBranches"
import { useActivePositions } from "./hooks/useActivePositions"

const EMPLEADOS_POR_PAGINA = 10

export function EmpleadosFeature() {
  const { showToast } = useToast()
  const [searchInput, setSearchInput] = useState("")
  const [search, setSearch] = useState("")
  const [branchId, setBranchId] = useState<number | undefined>(undefined)
  const [positionId, setPositionId] = useState<number | undefined>(undefined)
  const [pagina, setPagina] = useState(1)

  // Espera a que el usuario deje de escribir antes de consultar al backend
  useEffect(() => {
    const timeoutId = window.setTimeout(() => setSearch(searchInput.trim()), 300)
    return () => window.clearTimeout(timeoutId)
  }, [searchInput])

  // Cualquier cambio en los filtros vuelve a la primera página
  useEffect(() => {
    setPagina(1)
  }, [search, branchId, positionId])

  const { employees, cargando, error, recargar } = useEmployees({
    search: search || undefined,
    branchId,
    positionId,
  })
  const { branches } = useActiveBranches()
  const { positions } = useActivePositions()

  const totalPaginas = Math.max(1, Math.ceil(employees.length / EMPLEADOS_POR_PAGINA))
  const inicio = (pagina - 1) * EMPLEADOS_POR_PAGINA
  const empleadosPagina = employees.slice(inicio, inicio + EMPLEADOS_POR_PAGINA)

  return (
    <section className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <SectionHeader
          eyebrow="Personal"
          title="Empleados"
          description="Gestión de empleados del restaurante."
        />

        <EmployeeFormModal onSuccess={recargar} />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Buscar
          <input
            type="text"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder="Nombre, apellido o documento"
            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Sucursal
          <select
            value={branchId ?? ""}
            onChange={(event) =>
              setBranchId(event.target.value ? Number(event.target.value) : undefined)
            }
            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
          >
            <option value="">Todas</option>
            {branches.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm text-text-muted">
          Cargo
          <select
            value={positionId ?? ""}
            onChange={(event) =>
              setPositionId(event.target.value ? Number(event.target.value) : undefined)
            }
            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
          >
            <option value="">Todos</option>
            {positions.map((position) => (
              <option key={position.id} value={position.id}>
                {position.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <EmployeeTable
        employees={empleadosPagina}
        cargando={cargando}
        error={error}
        onReintentar={recargar}
        // TODO: reemplazar por el modal de edición (tarea 424) y PATCH /empleados/:id (428)
        onEditar={() => showToast("La edición de empleados está en construcción.", "info")}
        // TODO: reemplazar por el diálogo de confirmación (tarea 425) y el endpoint de desactivar (429)
        onDesactivar={() =>
          showToast("La desactivación de empleados está en construcción.", "info")
        }
      />

      {employees.length > EMPLEADOS_POR_PAGINA && (
        <div className="flex items-center justify-between text-sm text-text-muted">
          <span>
            Página {pagina} de {totalPaginas}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagina <= 1}
              onClick={() => setPagina((actual) => actual - 1)}
              className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={pagina >= totalPaginas}
              onClick={() => setPagina((actual) => actual + 1)}
              className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
