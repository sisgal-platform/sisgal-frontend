import apiClient from "@/lib/axios"
import { toApiError } from "@/lib/apiError"

/** Espejo exacto de WorkdayConfigResponseDto (backend, módulo parametros-nomina). */
export type WorkdayConfigVigente = {
    id: number
    maxWeekHours: number
    maxDayHours: number
    dayStart: string
    dayEnd: string
    nightStart: string
    nightEnd: string
    validFrom: string
    validTo: string | null
    status: "VIGENTE" | "PROGRAMADA" | "HISTORICA"
}

export const workdayConfigService = {
    // Jornada laboral general de la empresa, vigente hoy; es la misma para todos los empleados
    async obtenerVigente(): Promise<WorkdayConfigVigente> {
        try {
            const { data } = await apiClient.get<WorkdayConfigVigente>(
                "/parametros-nomina/jornada-laboral/vigente",
            )
            return data
        } catch (error) {
            throw toApiError(error)
        }
    },
}
