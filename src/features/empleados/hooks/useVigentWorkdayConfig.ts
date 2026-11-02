import { useEffect, useState } from "react"

import { workdayConfigService } from "@/features/parametros-nomina/services/workdayConfigService"
import type { WorkdayConfig } from "@/features/parametros-nomina/interfaces/types"

/**
 * Carga las versiones de la jornada laboral y cuál es la vigente: la vigente es la
 * que se puede asignar a un empleado y las versiones sirven para mostrar la asignada.
 */
export function useVigentWorkdayConfig() {
    const [workdayConfig, setWorkdayConfig] = useState<WorkdayConfig | null>(null)
    const [versiones, setVersiones] = useState<WorkdayConfig[]>([])
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelado = false

        async function cargar() {
            setCargando(true)
            setError(null)

            try {
                const todas = await workdayConfigService.findAll()
                if (!cancelado) {
                    setVersiones(todas)
                    setWorkdayConfig(todas.find((v) => v.status === "VIGENTE") ?? null)
                }
            } catch (error: unknown) {
                console.error("Error al consultar la jornada laboral vigente:", error)
                if (!cancelado) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible cargar la jornada laboral.",
                    )
                }
            } finally {
                if (!cancelado) setCargando(false)
            }
        }

        void cargar()

        return () => {
            cancelado = true
        }
    }, [])

    return { workdayConfig, versiones, cargando, error }
}
