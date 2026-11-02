import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { CHART_COLORS } from "../constants/chartColors"

type WorkedHoursTrendChartProps = Readonly<{
    data: { month: string; hours: number }[]
}>

export function WorkedHoursTrendChart({ data }: WorkedHoursTrendChartProps) {
    if (data.length === 0) {
        return <p className="text-sm text-text-muted">No hay datos de horas trabajadas.</p>
    }

    return (
        <ResponsiveContainer width="100%" height={240}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke={CHART_COLORS.grid} vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: CHART_COLORS.textMuted }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: CHART_COLORS.textMuted }} axisLine={false} tickLine={false} />
                <Tooltip
                    formatter={(value) => [`${Number(value).toLocaleString("es-CO")} h`, "Horas"]}
                />
                <Line
                    type="monotone"
                    dataKey="hours"
                    name="Horas"
                    stroke={CHART_COLORS.primary}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                />
            </LineChart>
        </ResponsiveContainer>
    )
}
