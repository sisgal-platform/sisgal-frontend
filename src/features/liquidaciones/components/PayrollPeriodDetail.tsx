import { useEffect, useState } from "react"

import { formatCurrencyCOP, formatDateCO } from "@/lib/formatters"

import { payrollPeriodsService } from "../services/payrollPeriodsService"
import type { PayrollLine, PayrollPeriodDetail } from "../interfaces/types"

type PayrollPeriodDetailProps = {
    payrollPeriodId: number
}

type ResultadoDetalle = {
    payrollPeriodId: number
    intento: number
    detalle?: PayrollPeriodDetail
    error?: string
}

export function PayrollPeriodDetail({ payrollPeriodId }: PayrollPeriodDetailProps) {
    const [intento, setIntento] = useState(0)
    const [resultado, setResultado] = useState<ResultadoDetalle | null>(null)

    useEffect(() => {
        let activo = true

        payrollPeriodsService.findById(payrollPeriodId).then(
            (detalle) => {
                if (activo) {
                    setResultado({ payrollPeriodId, intento, detalle })
                }
            },
            (error: unknown) => {
                if (activo) {
                    setResultado({
                        payrollPeriodId,
                        intento,
                        error:
                            error instanceof Error
                                ? error.message
                                : "No fue posible cargar el detalle de la liquidación.",
                    })
                }
            },
        )

        return () => {
            activo = false
        }
    }, [payrollPeriodId, intento])

    const resultadoActual =
        resultado?.payrollPeriodId === payrollPeriodId && resultado.intento === intento
            ? resultado
            : null
    const detalle = resultadoActual?.detalle ?? null
    const error = resultadoActual?.error ?? null
    const cargando = resultadoActual === null

    if (cargando) {
        return (
            <p role="status" className="py-6 text-sm text-text-muted">
                Cargando detalle de la liquidación…
            </p>
        )
    }

    if (error) {
        return (
            <div
                role="alert"
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-error-light px-4 py-3 text-sm text-error"
            >
                <span>{error}</span>
                <button
                    type="button"
                    onClick={() => setIntento((actual) => actual + 1)}
                    className="font-semibold underline underline-offset-2"
                >
                    Reintentar
                </button>
            </div>
        )
    }

    if (!detalle) return null

    return (
        <div className="space-y-5">
            <section aria-labelledby="liquidacion-detalle-general">
                <h2
                    id="liquidacion-detalle-general"
                    className="mb-3 text-sm font-semibold text-primary"
                >
                    Información general
                </h2>
                <dl className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2">
                    <Dato label="Empleado">{detalle.employeeName}</Dato>
                    <Dato label="Documento">
                        {detalle.employeeDocumentType} {detalle.employeeDocument}
                    </Dato>
                    <Dato label="Cargo">{detalle.employeePosition ?? "—"}</Dato>
                    <Dato label="Período">
                        {formatDateCO(detalle.periodStart)} – {formatDateCO(detalle.periodEnd)}
                    </Dato>
                    <Dato label="Fecha de liquidación">
                        {formatDateCO(detalle.settlementDate)}
                    </Dato>
                    <Dato label="Estado">
                        <span className="inline-flex rounded-full bg-success-light px-2.5 py-0.5 text-xs font-semibold text-success-dark">
                            {detalle.status}
                        </span>
                    </Dato>
                </dl>
            </section>

            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                        Conceptos devengados y deducciones de la liquidación
                    </caption>
                    <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th scope="col" className="px-4 py-2">Concepto</th>
                            <th scope="col" className="px-4 py-2 text-right">Monto</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <ConceptSectionRows
                            title="Devengado"
                            headerClassName="bg-success-light text-success-dark"
                            amountClassName="text-success"
                            sign="+"
                            conceptos={detalle.earnings}
                        />
                        <ConceptSectionRows
                            title="Deducciones"
                            headerClassName="bg-error-light text-error"
                            amountClassName="text-error"
                            sign="-"
                            conceptos={detalle.deductions}
                        />
                        <tr className="font-semibold text-text">
                            <td className="px-4 py-3">Total neto a pagar</td>
                            <td className="px-4 py-3 text-right">
                                {formatCurrencyCOP(detalle.netPay)}
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <p className="text-xs text-text-muted">
                Resumen: Total devengado ({formatCurrencyCOP(detalle.totalEarnings)}) −
                Total deducciones ({formatCurrencyCOP(detalle.totalDeductions)}) ={" "}
                {formatCurrencyCOP(detalle.netPay)}
            </p>
        </div>
    )
}

type ConceptSectionRowsProps = {
    title: string
    headerClassName: string
    amountClassName: string
    sign: "+" | "-"
    conceptos: PayrollLine[]
}

function ConceptSectionRows({
    title,
    headerClassName,
    amountClassName,
    sign,
    conceptos,
}: ConceptSectionRowsProps) {
    return (
        <>
            <tr className={headerClassName}>
                <td colSpan={2} className="px-4 py-2 text-sm font-semibold">
                    {title}
                </td>
            </tr>
            {conceptos.length === 0 ? (
                <tr>
                    <td colSpan={2} className="px-4 py-2 text-sm text-text-muted">
                        Sin conceptos registrados.
                    </td>
                </tr>
            ) : (
                conceptos.map((concepto, index) => (
                    <tr key={`${concepto.conceptName}-${index}`}>
                        <td className="px-4 py-2 text-text">{concepto.conceptName}</td>
                        <td className={`px-4 py-2 text-right font-medium ${amountClassName}`}>
                            {sign}
                            {formatCurrencyCOP(concepto.amount)}
                        </td>
                    </tr>
                ))
            )}
        </>
    )
}

function Dato({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="min-w-0">
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="break-words text-sm font-medium text-text">{children}</dd>
        </div>
    )
}