import { useState } from "react"
import { Clock, DollarSign, Users } from "lucide-react"

import { formatCurrencyCOP } from "@/lib/formatters"

import { ChartCard } from "./ChartCard"
import { IndicatorCard } from "./IndicatorCard"
import { PeriodSelector } from "./PeriodSelector"
import type { DashboardIndicators } from "../interfaces/types"

// Datos de ejemplo mientras se conecta el endpoint real (próximo paso).
const MOCK_INDICATORS: DashboardIndicators = {
    attendance: {
        averagePercentage: 89,
        changeVsPreviousPeriod: 3.2,
        weeklyDistribution: [
            { day: "Lun", percentage: 92 },
            { day: "Mar", percentage: 88 },
            { day: "Mié", percentage: 95 },
            { day: "Jue", percentage: 90 },
            { day: "Vie", percentage: 87 },
            { day: "Sáb", percentage: 84 },
            { day: "Dom", percentage: 80 },
        ],
    },
    workedHours: {
        total: 1750,
        changeVsPreviousPeriod: 2.9,
        trend: [
            { month: "Jun", hours: 1710 },
            { month: "Jul", hours: 1690 },
            { month: "Ago", hours: 1720 },
            { month: "Sep", hours: 1700 },
            { month: "Oct", hours: 1750 },
        ],
    },
    laborCosts: {
        total: 190000,
        changeVsPreviousPeriod: -1.5,
        distribution: [
            { category: "Devengado", amount: 158000, percentage: 83 },
            { category: "Deduccion", amount: 32000, percentage: 17 },
        ],
    },
}

export function DashboardIndicatorsSection() {
    const [from, setFrom] = useState("")
    const [to, setTo] = useState("")
    const indicators = MOCK_INDICATORS

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
                onApply={() => {
                    // Se conecta al endpoint real en el siguiente paso.
                }}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <IndicatorCard
                    title="Asistencia Promedio"
                    value={
                        indicators.attendance.averagePercentage === null
                            ? "Sin datos"
                            : `${indicators.attendance.averagePercentage}%`
                    }
                    Icon={Users}
                    iconStyle="bg-success-light text-success"
                    change={indicators.attendance.changeVsPreviousPeriod}
                    changeUnit="pp"
                />
                <IndicatorCard
                    title="Horas Trabajadas"
                    value={
                        indicators.workedHours.total === null
                            ? "Sin datos"
                            : indicators.workedHours.total.toLocaleString("es-CO")
                    }
                    Icon={Clock}
                    iconStyle="bg-primary-light/20 text-primary"
                    change={indicators.workedHours.changeVsPreviousPeriod}
                />
                <IndicatorCard
                    title="Costos Laborales"
                    value={
                        indicators.laborCosts.total === null
                            ? "Sin datos"
                            : formatCurrencyCOP(indicators.laborCosts.total)
                    }
                    Icon={DollarSign}
                    iconStyle="bg-warning-light text-warning"
                    change={indicators.laborCosts.changeVsPreviousPeriod}
                />
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                <ChartCard title="Asistencia Semanal (%)">
                    <p className="text-sm text-text-muted">
                        Gráfico próximamente ({indicators.attendance.weeklyDistribution.length} días)
                    </p>
                </ChartCard>

                <ChartCard title="Distribución de Costos">
                    <p className="text-sm text-text-muted">
                        Gráfico próximamente ({indicators.laborCosts.distribution.length} categorías)
                    </p>
                </ChartCard>

                <ChartCard title="Tendencia de Horas Trabajadas">
                    <p className="text-sm text-text-muted">
                        Gráfico próximamente ({indicators.workedHours.trend.length} meses)
                    </p>
                </ChartCard>
            </div>
        </section>
    )
}
