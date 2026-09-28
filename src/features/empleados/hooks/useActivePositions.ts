import { useEffect, useState } from "react"

import { useToast } from "@/toast"
import { cargosService } from "@/features/cargos/services/cargosService"
import type { Cargo } from "@/features/cargos/interfaces/types"

/** Carga los cargos activos  para el selector del formulario. */
export function useActivePositions() {
  const { showToast } = useToast()
  const [positions, setPositions] = useState<Cargo[]>([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    // Evita actualizar el estado si el componente se desmontó antes de que
    // la petición terminara (por ejemplo, si se cierra el modal).
    let cancelado = false

    async function cargarCargos() {
      setCargando(true)

      try {
        const cargos = await cargosService.listarActivos()
        if (!cancelado) {
          setPositions(cargos)
        }
      } catch {
        if (!cancelado) {
          showToast("No se pudieron cargar los cargos disponibles.", "error")
        }
      } finally {
        if (!cancelado) {
          setCargando(false)
        }
      }
    }

    void cargarCargos()

    return () => {
      cancelado = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return { positions, cargando }
}
