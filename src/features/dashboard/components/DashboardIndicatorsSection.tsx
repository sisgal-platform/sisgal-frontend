import { useState } from "react"
import { Clock, DollarSign, Users } from "lucide-react"

import { formatCurrencyCOP } from "@/lib/formatters"

import { AttendanceWeeklyChart } from "./AttendanceWeeklyChart"
import { ChartCard } from "./ChartCard"
import { IndicatorCard } from "./IndicatorCard"
import { LaborCostDistributionChart } from "./LaborCostDistributionChart"
import { PeriodSelector } from "./PeriodSelector"
import { WorkedHoursTrendChart } from "./WorkedHoursTrendChart"
import { useDashboardIndicators } from "../hooks/useDashboardIndicators"
import type { DashboardIndicatorsQuery } from "../interfaces/types"

// Mismo criterio por defecto que usa el backend cuando no se envían fechas:
// del primer día del mes actual hasta hoy ("mes a la fecha").
function firstDayOfCurrentMonth(): string {
    const today = new Date()
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01`
}

function todayAsString(): string {
    return new Date().toISOString().slice(0, 10)
}

const defaultPeriod: DashboardIndicatorsQuery = {
    periodoDesde: firstDayOfCurrentMonth(),
    periodoHasta: todayAsString(),
}

export function DashboardIndicatorsSection() {
    // "from"/"to" son los valores que el usuario está editando en el formulario;
    // "appliedPeriod" es lo que realmente se le manda al hook y dispara la
    // consulta. Se separan para que escribir una fecha no dispare la consulta
    // en cada tecla, solo al presionar "Consultar".
    const [from, setFrom] = useState(defaultPeriod.periodoDesde ?? "")
    const [to, setTo] = useState(defaultPeriod.periodoHasta ?? "")
    const [appliedPeriod, setAppliedPeriod] = useState<DashboardIndicatorsQuery>(defaultPeriod)

    const { indicators, loading, error } = useDashboardIndicators(appliedPeriod)

    function applyPeriod() {
        // Un campo vacío se envía como undefined para que el backend aplique
        // su propio valor por defecto, en vez de mandarle un string vacío.
        setAppliedPeriod({ periodoDesde: from || undefined, periodoHasta: to || undefined })
    }

    return (
        <section className="mt-10 space-y-6">
            <div>
                <h2 className="text-2xl font-bold tracking-tight text-primary sm:text-3xl">
                    Indicadores clave
                </h2>
                <p className="mt-1 text-sm text-text-muted">
                    Comportamiento de la asistencia, horas trabajadas y costos laborales del negocio.
                </p>
            </div>

            <PeriodSelector
                from={from}
                to={to}
                onFromChange={setFrom}
                onToChange={setTo}
                onApply={applyPeriod}
            />

            {error && (
                <div
                    role="alert"
                    className="rounded-2xl border border-error-light bg-white p-6 text-sm text-error"
                >
                    {error}
                </div>
            )}

            {!error && (
                <>
                    {/* "change" en null oculta la línea de tendencia (ver IndicatorCard): se usa
                    tanto mientras carga como cuando el backend no pudo calcular una variación
                    (p. ej. sin datos en el período anterior), para no mostrar una flecha engañosa. */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <IndicatorCard
                            title="Asistencia Promedio"
                            value={
                                loading
                                    ? "..."
                                    : indicators?.attendance.averagePercentage == null
                                      ? "Sin datos"
                                      : `${indicators.attendance.averagePercentage}%`
                            }
                            Icon={Users}
                            iconStyle="bg-success-light text-success"
                            change={loading ? null : (indicators?.attendance.changeVsPreviousPeriod ?? null)}
                            changeUnit="pp"
                        />
                        <IndicatorCard
                            title="Horas Trabajadas"
                            value={
                                loading
                                    ? "..."
                                    : indicators?.workedHours.total == null
                                      ? "Sin datos"
                                      : indicators.workedHours.total.toLocaleString("es-CO")
                            }
                            Icon={Clock}
                            iconStyle="bg-primary-light/20 text-primary"
                            change={loading ? null : (indicators?.workedHours.changeVsPreviousPeriod ?? null)}
                        />
                        <IndicatorCard
                            title="Costos Laborales"
                            value={
                                loading
                                    ? "..."
                                    : indicators?.laborCosts.total == null
                                      ? "Sin datos"
                                      : formatCurrencyCOP(indicators.laborCosts.total)
                            }
                            Icon={DollarSign}
                            iconStyle="bg-warning-light text-warning"
                            change={loading ? null : (indicators?.laborCosts.changeVsPreviousPeriod ?? null)}
                        />
                    </div>

                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                        <ChartCard title="Asistencia Semanal (%)">
                            {loading ? (
                                <p className="text-sm text-text-muted">Cargando…</p>
                            ) : (
                                <AttendanceWeeklyChart data={indicators?.attendance.weeklyDistribution ?? []} />
                            )}
                        </ChartCard>

                        <ChartCard title="Distribución de Costos">
                            {loading ? (
                                <p className="text-sm text-text-muted">Cargando…</p>
                            ) : (
                                <LaborCostDistributionChart data={indicators?.laborCosts.distribution ?? []} />
                            )}
                        </ChartCard>

                        <ChartCard title="Tendencia de Horas Trabajadas">
                            {loading ? (
                                <p className="text-sm text-text-muted">Cargando…</p>
                            ) : (
                                <WorkedHoursTrendChart data={indicators?.workedHours.trend ?? []} />
                            )}
                        </ChartCard>
                    </div>
                </>
            )}
        </section>
    )
}
