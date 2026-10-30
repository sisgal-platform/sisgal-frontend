type ChartCardProps = Readonly<{
    title: string
    children: React.ReactNode
}>

/** Contenedor común para las tarjetas de gráficos del dashboard. */
export function ChartCard({ title, children }: ChartCardProps) {
    return (
        <article className="rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm">
            <h3 className="mb-4 text-base font-semibold text-text">{title}</h3>
            {children}
        </article>
    )
}
