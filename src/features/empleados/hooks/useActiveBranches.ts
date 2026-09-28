import { useEffect, useState } from "react"

import { useToast } from "@/toast"
import { sucursalesService } from "@/features/sucursales/services/sucursalesService"
import type { Sucursal } from "@/features/sucursales/interfaces/types"

/** Carga las sucursales activas para el selector del formulario. */
export function useActiveBranches() {
  const { showToast } = useToast()
  const [branches, setBranches] = useState<Sucursal[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Evita actualizar el estado si el componente se desmontó antes de que
    // la petición terminara (por ejemplo, si se cierra el modal).
    let cancelado = false

    async function cargarSucursales() {
      setCargando(true)

      try {
        const sucursales = await sucursalesService.listActive()
        if (!cancelado) {
          setBranches(sucursales)
        }
      } catch {
        if (!cancelado) {
          showToast("No se pudieron cargar las sucursales disponibles.", "error")
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    void cargarSucursales()

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { branches, cargando }
}
