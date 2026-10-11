import { Eye } from "lucide-react"

import { formatCurrencyCOP, formatDateCO } from "@/lib/formatters"

import type { PayrollPeriod } from "../interfaces/types"

type PayrollPeriodTableProps = Readonly<{
    payrollPeriods: PayrollPeriod[]
    loading: boolean
    error: string | null
    onRetry: () => void
    onViewDetail: (payrollPeriod: PayrollPeriod) => void
}>

export function PayrollPeriodTable({
    payrollPeriods,
    loading,
    error,
    onRetry,
    onViewDetail,
}: PayrollPeriodTableProps) {
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

    if (loading && payrollPeriods.length === 0) {
        return (
            <output className="block rounded-2xl bg-white p-6 text-text-muted">
                Cargando liquidaciones…
            </output>
        )
    }

    if (payrollPeriods.length === 0) {
        return (
            <p className="rounded-2xl bg-white p-6 text-text-muted">
                No se encontraron liquidaciones correspondientes a los criterios indicados.
            </p>
        )
    }

    return (
        <div
            className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
            aria-busy={loading}
        >
            <table className="w-full min-w-[900px] text-left text-sm">
                <caption className="sr-only">Listado de liquidaciones registradas</caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                        <th scope="col" className="px-4 py-3">Empleado</th>
                        <th scope="col" className="px-4 py-3">Período</th>
                        <th scope="col" className="px-4 py-3">Fecha de liquidación</th>
                        <th scope="col" className="px-4 py-3 text-right">Total devengado</th>
                        <th scope="col" className="px-4 py-3 text-right">Total deducciones</th>
                        <th scope="col" className="px-4 py-3 text-right">Neto a pagar</th>
                        <th scope="col" className="px-4 py-3">Estado</th>
                        <th scope="col" className="px-4 py-3 text-right">Detalle</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {payrollPeriods.map((payrollPeriod) => (
                        <tr key={payrollPeriod.id}>
                            <td className="px-4 py-3 font-medium text-text">
                                {payrollPeriod.employeeName}
                            </td>
                            <td className="px-4 py-3 text-text-muted">
                                {formatDateCO(payrollPeriod.periodStart)} – {formatDateCO(payrollPeriod.periodEnd)}
                            </td>
                            <td className="px-4 py-3 text-text-muted">
                                {formatDateCO(payrollPeriod.settlementDate)}
                            </td>
                            <td className="px-4 py-3 text-right text-text-muted">
                                {formatCurrencyCOP(payrollPeriod.totalEarnings)}
                            </td>
                            <td className="px-4 py-3 text-right text-text-muted">
                                {formatCurrencyCOP(payrollPeriod.totalDeductions)}
                            </td>
                            <td className="px-4 py-3 text-right font-semibold text-text">
                                {formatCurrencyCOP(payrollPeriod.netPay)}
                            </td>
                            <td className="px-4 py-3">
                                {/* Toda liquidación consultable ya está confirmada: se identifica como definitiva (CA08) */}
                                <span className="inline-flex rounded-full bg-success-light px-2.5 py-0.5 text-xs font-semibold text-success-dark">
                                    {payrollPeriod.status}
                                </span>
                            </td>
                            <td className="px-4 py-3 text-right">
                                <button
                                    type="button"
                                    onClick={() => onViewDetail(payrollPeriod)}
                                    aria-label={`Ver detalle de la liquidación de ${payrollPeriod.employeeName}`}
                                    className="inline-flex h-9 w-9 items-center justify-center rounded-full text-primary hover:bg-secondary"
                                >
                                    <Eye size={18} aria-hidden="true" />
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}
