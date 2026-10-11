import { useEffect, useMemo, useState, type FormEvent } from "react"
import { Plus, RotateCcw, Search } from "lucide-react"

import { SectionHeader } from "@/components/atoms/SectionHeader"
import { Button } from "@/components/ui/button"
import { Combobox } from "@/components/ui/combobox"
import { formatCurrencyCOP } from "@/lib/formatters"

import { PayrollPeriodDetailDialog } from "./components/PayrollPeriodDetailDialog"
import { PayrollPeriodTable } from "./components/PayrollPeriodTable"
import { useActiveEmployees } from "./hooks/useActiveEmployees"
import { usePayrollPeriods } from "./hooks/usePayrollPeriods"
import type { PayrollPeriod, PayrollPeriodFilterValues, PayrollPeriodQuery } from "./interfaces/types"

const PAGE_SIZE = 10

const emptyFilters: PayrollPeriodFilterValues = {
    employeeId: "",
    periodStart: "",
    periodEnd: "",
}

// Arma el query que se le manda al backend a partir de los filtros (strings) del formulario
function buildQuery(filters: PayrollPeriodFilterValues): PayrollPeriodQuery {
    const query: PayrollPeriodQuery = {}

    if (filters.employeeId) query.employeeId = Number(filters.employeeId)
    if (filters.periodStart) query.periodStart = filters.periodStart
    if (filters.periodEnd) query.periodEnd = filters.periodEnd

    return query
}

export function LiquidacionesFeature() {
    const [filters, setFilters] = useState(emptyFilters)
    const [appliedFilters, setAppliedFilters] = useState(emptyFilters)
    const [periodRangeError, setPeriodRangeError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [selectedPayrollPeriod, setSelectedPayrollPeriod] = useState<PayrollPeriod | null>(null)

    const { payrollPeriods, loading, error, reload } = usePayrollPeriods(
        buildQuery(appliedFilters),
    )
    const { employees, loading: employeesLoading } = useActiveEmployees()
    const employeeOptions = employees.map((employee) => ({
        value: String(employee.id),
        label: `${employee.firstName} ${employee.lastName}`,
    }))

    // Cualquier cambio en los filtros aplicados vuelve a la primera página
    useEffect(() => {
        setPage(1)
    }, [appliedFilters])

    const totalPages = Math.max(1, Math.ceil(payrollPeriods.length / PAGE_SIZE))
    const pageStart = (page - 1) * PAGE_SIZE
    const pageItems = payrollPeriods.slice(pageStart, pageStart + PAGE_SIZE)

    // Total de neto a pagar sobre el mismo listado filtrado que se muestra en la tabla
    const netPayTotal = useMemo(
        () => payrollPeriods.reduce((sum, item) => sum + item.netPay, 0),
        [payrollPeriods],
    )

    function applyFilters(event: FormEvent<HTMLFormElement>) {
        event.preventDefault()

        // El período inicial no puede ser posterior al final (CA10); se bloquea la consulta
        if (filters.periodStart && filters.periodEnd && filters.periodStart > filters.periodEnd) {
            setPeriodRangeError("El período inicial no puede ser posterior al período final.")
            return
        }

        setPeriodRangeError(null)
        setAppliedFilters(filters)
    }

    function clearFilters() {
        setFilters(emptyFilters)
        setAppliedFilters(emptyFilters)
        setPeriodRangeError(null)
    }

    return (
        <section className="space-y-6 p-4">
            <div className="flex items-start justify-between gap-4">
                <SectionHeader
                    title="Liquidación"
                    description="Gestión de comprobantes de pago."
                />

                {/* Generación de nómina pendiente para una historia futura; el botón queda visible pero sin funcionalidad */}
                <Button
                    type="button"
                    disabled
                    title="Disponible próximamente"
                    className="flex items-center gap-2 bg-primary hover:bg-primary-light"
                >
                    <Plus size={18} aria-hidden="true" />
                    Generar Nómina
                </Button>
            </div>

            <form
                onSubmit={applyFilters}
                className="space-y-4 rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm"
            >
                <div className="flex flex-wrap gap-4">
                    <label className="flex min-w-[220px] flex-1 flex-col gap-1 text-sm text-text-muted">
                        Empleado
                        <Combobox
                            options={employeeOptions}
                            loading={employeesLoading}
                            value={filters.employeeId}
                            onChange={(employeeId) => setFilters({ ...filters, employeeId })}
                        />
                    </label>

                    <label className="flex w-40 flex-col gap-1 text-sm text-text-muted">
                        Período desde
                        <input
                            type="date"
                            value={filters.periodStart}
                            onChange={(event) =>
                                setFilters({ ...filters, periodStart: event.target.value })
                            }
                            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                        />
                    </label>

                    <label className="flex w-40 flex-col gap-1 text-sm text-text-muted">
                        Período hasta
                        <input
                            type="date"
                            value={filters.periodEnd}
                            onChange={(event) =>
                                setFilters({ ...filters, periodEnd: event.target.value })
                            }
                            className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                        />
                    </label>
                </div>

                {periodRangeError && (
                    <p role="alert" className="text-sm text-error">
                        {periodRangeError}
                    </p>
                )}

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={clearFilters}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text transition hover:bg-secondary"
                    >
                        <RotateCcw size={16} aria-hidden="true" />
                        Limpiar filtros
                    </button>
                    <button
                        type="submit"
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
                    >
                        <Search size={16} aria-hidden="true" />
                        Aplicar filtros
                    </button>
                </div>
            </form>

            <PayrollPeriodTable
                payrollPeriods={pageItems}
                loading={loading}
                error={error}
                onRetry={reload}
                onViewDetail={setSelectedPayrollPeriod}
            />

            {payrollPeriods.length > 0 && (
                <div className="flex items-center justify-between rounded-2xl border border-gray-200 bg-surface px-5 py-3 text-sm text-text-muted">
                    <span>Total de liquidaciones: {payrollPeriods.length}</span>
                    <span className="font-semibold text-text">
                        Total neto: {formatCurrencyCOP(netPayTotal)}
                    </span>
                </div>
            )}

            {payrollPeriods.length > PAGE_SIZE && (
                <div className="flex items-center justify-between text-sm text-text-muted">
                    <span>
                        Página {page} de {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            type="button"
                            disabled={page <= 1}
                            onClick={() => setPage((current) => current - 1)}
                            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
                        >
                            Anterior
                        </button>
                        <button
                            type="button"
                            disabled={page >= totalPages}
                            onClick={() => setPage((current) => current + 1)}
                            className="rounded-lg border border-gray-300 px-3 py-1 disabled:opacity-40"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}

            {selectedPayrollPeriod && (
                <PayrollPeriodDetailDialog
                    payrollPeriod={selectedPayrollPeriod}
                    onOpenChange={(open) => {
                        if (!open) setSelectedPayrollPeriod(null)
                    }}
                />
            )}
        </section>
    )
}
