import { Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts"

import { formatCurrencyCOP } from "@/lib/formatters"

import { CHART_COLORS } from "../constants/chartColors"
import type { LaborCostCategory } from "../interfaces/types"

const CATEGORY_LABELS: Record<LaborCostCategory, string> = {
    Devengado: "Devengado",
    Deduccion: "Deducciones",
}

const CATEGORY_COLORS: Record<LaborCostCategory, string> = {
    Devengado: CHART_COLORS.primary,
    Deduccion: CHART_COLORS.warning,
}

type LaborCostDistributionChartProps = Readonly<{
    data: { category: LaborCostCategory; amount: number; percentage: number }[]
}>

export function LaborCostDistributionChart({ data }: LaborCostDistributionChartProps) {
    if (data.length === 0) {
        return <p className="text-sm text-text-muted">No hay datos de costos para este período.</p>
    }

    const chartData = data.map((item) => ({
        name: CATEGORY_LABELS[item.category],
        value: item.amount,
        percentage: item.percentage,
        color: CATEGORY_COLORS[item.category],
    }))

    return (
        <ResponsiveContainer width="100%" height={240}>
            <PieChart>
                <Pie
                    data={chartData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                >
                    {chartData.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip formatter={(value) => formatCurrencyCOP(Number(value))} />
                <Legend
                    formatter={(_value, entry) => {
                        const payload = entry.payload as unknown as { percentage: number; name: string }
                        return `${payload.name} ${payload.percentage}%`
                    }}
                />
            </PieChart>
        </ResponsiveContainer>
    )
}
