/** Espejo exacto de AttendanceIndicatorDto (backend). */
export type AttendanceIndicator = {
    averagePercentage: number | null
    changeVsPreviousPeriod: number | null
    weeklyDistribution: { day: string; percentage: number }[]
}

/** Espejo exacto de WorkedHoursIndicatorDto (backend). */
export type WorkedHoursIndicator = {
    total: number | null
    changeVsPreviousPeriod: number | null
    trend: { month: string; hours: number }[]
}

export type LaborCostCategory = "Devengado" | "Deduccion"

/** Espejo exacto de LaborCostIndicatorDto (backend). */
export type LaborCostIndicator = {
    total: number | null
    changeVsPreviousPeriod: number | null
    distribution: { category: LaborCostCategory; amount: number; percentage: number }[]
}

/** Espejo exacto de DashboardIndicatorsResponseDto (backend). */
export type DashboardIndicators = {
    attendance: AttendanceIndicator
    workedHours: WorkedHoursIndicator
    laborCosts: LaborCostIndicator
}

/** Espejo exacto de DashboardIndicatorsQueryDto (backend). */
export type DashboardIndicatorsQuery = {
    periodoDesde?: string
    periodoHasta?: string
}
