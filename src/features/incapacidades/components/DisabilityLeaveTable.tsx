import type { DisabilityLeave } from "../interfaces/types"
import { formatDateCO } from "@/lib/formatters"

const statusConfig = {
    Activo: {
        label: "Activo",
        badge: "bg-success-light text-success-dark",
    },
    Finalizado: {
        label: "Finalizado",
        badge: "bg-secondary-dark text-text-muted",
    },
}

type DisabilityLeaveTableProps = Readonly<{
    disabilityLeaves: DisabilityLeave[]
    loading: boolean
    error: string | null
    onRetry: () => void
}>

export function DisabilityLeaveTable({
    disabilityLeaves,
    loading,
    error,
    onRetry,
}: DisabilityLeaveTableProps) {
    if (error) {
        return (
            <div
                role="alert"
                className="flex flex-col items-start gap-3 rounded-2xl border border-error-light bg-white p-6"
            >
                <p className="text-base text-error">{error}</p>
                <button
                    type="button"
                    onClick={onRetry}
                    className="h-10 rounded-xl border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    if (loading && disabilityLeaves.length === 0) {
        return (
            <output className="block rounded-2xl bg-white p-6 text-text-muted">
                Cargando incapacidades…
            </output>
        )
    }

    if (disabilityLeaves.length === 0) {
        return (
            <p className="rounded-2xl bg-white p-6 text-text-muted">
                No hay incapacidades que coincidan con los filtros.
            </p>
        )
    }

    return (
        <div
            className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
            aria-busy={loading}
        >
            <table className="w-full min-w-[900px] text-left text-sm">
                <caption className="sr-only">
                    Listado de incapacidades y licencias registradas
                </caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                        <th scope="col" className="px-4 py-3">Documento</th>
                        <th scope="col" className="px-4 py-3">Nombre completo</th>
                        <th scope="col" className="px-4 py-3">Cargo</th>
                        <th scope="col" className="px-4 py-3">Estado</th>
                        <th scope="col" className="px-4 py-3">Fecha inicio</th>
                        <th scope="col" className="px-4 py-3">Fecha fin</th>
                        <th scope="col" className="px-4 py-3 text-right">Días</th>
                        <th scope="col" className="px-4 py-3">Tipo</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {disabilityLeaves.map((disabilityLeave) => {
                        const status = statusConfig[disabilityLeave.status]

                        return (
                            <tr key={disabilityLeave.id}>
                                <td className="px-4 py-3 text-text-muted">
                                    {disabilityLeave.documentType} {disabilityLeave.document}
                                </td>
                                <td className="px-4 py-3 font-medium text-text">
                                    {disabilityLeave.employeeName}
                                </td>
                                <td className="px-4 py-3 text-text-muted">
                                    {disabilityLeave.position ?? "—"}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.badge}`}
                                    >
                                        {status.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-text-muted">
                                    {formatDateCO(disabilityLeave.startDate)}
                                </td>
                                <td className="px-4 py-3 text-text-muted">
                                    {formatDateCO(disabilityLeave.endDate)}
                                </td>
                                <td className="px-4 py-3 text-right text-text-muted">
                                    {disabilityLeave.totalDays}
                                </td>
                                <td className="px-4 py-3 text-text-muted">
                                    {/* Si el tipo es "Otros", se muestra la descripción que escribió el administrador */}
                                    {disabilityLeave.type === "Otros" && disabilityLeave.otherTypeDescription
                                        ? disabilityLeave.otherTypeDescription
                                        : disabilityLeave.type}
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
