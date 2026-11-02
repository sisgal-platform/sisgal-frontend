import { TrendingDown, TrendingUp, type LucideIcon } from "lucide-react"

type IndicatorCardProps = Readonly<{
    title: string
    value: string
    Icon: LucideIcon
    iconStyle: string
    /** Variación vs. período anterior. Si es null, no se muestra la línea de tendencia. */
    change: number | null
    /** Unidad de la variación: puntos porcentuales (asistencia) o porcentaje (horas, costos). */
    changeUnit?: "pp" | "%"
}>

export function IndicatorCard({
    title,
    value,
    Icon,
    iconStyle,
    change,
    changeUnit = "%",
}: IndicatorCardProps) {
    // Sin cambio (0) se trata como "positivo" a propósito: evita mostrar una
    // flecha roja de caída cuando el indicador en realidad se mantuvo igual.
    const isPositive = change !== null && change >= 0
    const TrendIcon = isPositive ? TrendingUp : TrendingDown

    return (
        <article className="flex min-h-32 items-center gap-5 rounded-2xl border border-gray-200 bg-surface px-5 py-6 shadow-sm sm:px-6">
            <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl sm:h-16 sm:w-16 ${iconStyle}`}
            >
                <Icon size={26} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <h2 className="text-base font-medium text-primary-light sm:text-lg">
                    {title}
                </h2>
                <p className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
                    {value}
                </p>

                {change !== null && (
                    <p
                        className={`mt-1 flex items-center gap-1 text-sm font-semibold ${
                            isPositive ? "text-success" : "text-error"
                        }`}
                    >
                        <TrendIcon size={16} aria-hidden="true" />
                        {isPositive ? "+" : ""}
                        {change}
                        {changeUnit === "pp" ? " pts" : "%"} vs período anterior
                    </p>
                )}
            </div>
        </article>
    )
}
