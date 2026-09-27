import { useEffect, useState } from "react"

import { useToast } from "@/toast/hooks/useToast"
import { sucursalesService } from "@/features/sucursales/services/sucursalesService"
import type { Sucursal } from "@/features/sucursales/interfaces/types"

/** Carga las sucursales activas (CA06) para el selector del formulario. */
export function useActiveBranches() {
  const { showToast } = useToast()
  const [branches, setBranches] = useState<Sucursal[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
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
