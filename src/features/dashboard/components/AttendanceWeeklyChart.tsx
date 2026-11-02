import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { CHART_COLORS } from "../constants/chartColors"

type AttendanceWeeklyChartProps = Readonly<{
    data: { day: string; percentage: number }[]
}>

export function AttendanceWeeklyChart({ data }: AttendanceWeeklyChartProps) {
    if (data.length === 0) {
        return <p className="text-sm text-text-muted">No hay datos de asistencia para este período.</p>
    }

    return (
        <ResponsiveContainer width="100%" height={240}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="day" tick={{ fontSize: 12, fill: CHART_COLORS.textMuted }} axisLine={false} tickLine={false} />
                <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12, fill: CHART_COLORS.textMuted }}
                    axisLine={false}
                    tickLine={false}
                />
                <Tooltip formatter={(value) => [`${value}%`, "Asistencia"]} />
                <Bar dataKey="percentage" fill={CHART_COLORS.success} radius={[4, 4, 0, 0]} />
            </BarChart>
        </ResponsiveContainer>
    )
}
