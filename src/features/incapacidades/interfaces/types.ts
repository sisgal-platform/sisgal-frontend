/** Espejo del enum DisabilityType del backend. */
export type TipoIncapacidad =
    | "Enfermedad general"
    | "Accidente de trabajo"
    | "Licencia de maternidad"
    | "Licencia de paternidad"
    | "Otros"

export const TIPOS_INCAPACIDAD: TipoIncapacidad[] = [
    "Enfermedad general",
    "Accidente de trabajo",
    "Licencia de maternidad",
    "Licencia de paternidad",
    "Otros",
]

/** Espejo exacto de DisabilityLeaveResponseDto (backend). */
export type DisabilityLeave = {
    id: number
    employeeId: number
    employeeName: string
    type: TipoIncapacidad
    otherTypeDescription: string | null
    startDate: string
    endDate: string
    totalDays: number
}

/** Espejo exacto de RegisterDisabilityLeaveDto (backend). */
export type RegisterDisabilityLeavePayload = {
    employeeId: number
    type: TipoIncapacidad
    otherTypeDescription?: string
    startDate: string
    endDate: string
}

