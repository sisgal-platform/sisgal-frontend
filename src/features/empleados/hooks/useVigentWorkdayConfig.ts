import { useEffect, useState } from "react"

import { workdayConfigService } from "@/features/parametros-nomina/services/workdayConfigService"
import type { WorkdayConfig } from "@/features/parametros-nomina/interfaces/types"

/** Carga la jornada laboral general vigente, para mostrarla en la ficha del empleado. */
export function useVigentWorkdayConfig() {
    const [workdayConfig, setWorkdayConfig] = useState<WorkdayConfig | null>(null)
    const [cargando, setCargando] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        let cancelado = false

        async function cargar() {
            setCargando(true)
            setError(null)

            try {
                const versiones = await workdayConfigService.findAll()
                if (!cancelado) {
                    setWorkdayConfig(versiones.find((v) => v.status === "VIGENTE") ?? null)
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

    return { workdayConfig, cargando, error }
}
