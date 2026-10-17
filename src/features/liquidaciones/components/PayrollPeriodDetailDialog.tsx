import { useEffect, useRef, useState } from "react"
import { Download, FileText } from "lucide-react"

import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { formatCurrencyCOP, formatDateCO } from "@/lib/formatters"

import { payrollPeriodsService } from "../services/payrollPeriodsService"
import type { PayrollLine, PayrollPeriod, PayrollPeriodDetail } from "../interfaces/types"

type PayrollPeriodDetailDialogProps = {
    payrollPeriod: PayrollPeriod
    onOpenChange: (open: boolean) => void
}

type ResultadoDetalle = {
    payrollPeriodId: number
    intento: number
    detalle?: PayrollPeriodDetail
    error?: string
}

// El PDF pasa por: inicial -> generando -> vista_previa (o error, desde donde
// "Generar PDF" reintenta). La vista previa y la descarga comparten el mismo
// blob generado en una sola llamada, para garantizar que lo que se ve es
// exactamente lo que se descarga.
type EstadoPdf =
    | { status: "inicial" }
    | { status: "generando" }
    | { status: "vista_previa"; url: string }
    | { status: "error"; mensaje: string }

export function PayrollPeriodDetailDialog({
    payrollPeriod,
    onOpenChange,
}: PayrollPeriodDetailDialogProps) {
    const [intento, setIntento] = useState(0)
    const [resultado, setResultado] = useState<ResultadoDetalle | null>(null)
    const [pdf, setPdf] = useState<EstadoPdf>({ status: "inicial" })
    const pdfUrlRef = useRef<string | null>(null)

    // El object URL del PDF vive en memoria del navegador; hay que liberarlo
    // explícitamente al desmontar para no dejarlo retenido indefinidamente.
    useEffect(() => {
        return () => {
            if (pdfUrlRef.current) {
                URL.revokeObjectURL(pdfUrlRef.current)
            }
        }
    }, [])

    useEffect(() => {
        let activo = true

        payrollPeriodsService.findById(payrollPeriod.id).then(
            (detalle) => {
                if (activo) {
                    setResultado({ payrollPeriodId: payrollPeriod.id, intento, detalle })
                }
            },
            (error: unknown) => {
                if (activo) {
                    setResultado({
                        payrollPeriodId: payrollPeriod.id,
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
    }, [payrollPeriod.id, intento])

    const resultadoActual =
        resultado?.payrollPeriodId === payrollPeriod.id && resultado.intento === intento
            ? resultado
            : null
    const detalle = resultadoActual?.detalle ?? null
    const error = resultadoActual?.error ?? null
    const cargando = resultadoActual === null

    async function handleGenerarPdf() {
        setPdf({ status: "generando" })
        try {
            const blob = await payrollPeriodsService.getPdf(payrollPeriod.id)
            const url = URL.createObjectURL(blob)
            pdfUrlRef.current = url
            setPdf({ status: "vista_previa", url })
        } catch (pdfError: unknown) {
            setPdf({
                status: "error",
                mensaje:
                    pdfError instanceof Error
                        ? pdfError.message
                        : "No fue posible generar el comprobante de pago.",
            })
        }
    }

    function handleVolverAlDetalle() {
        if (pdfUrlRef.current) {
            URL.revokeObjectURL(pdfUrlRef.current)
            pdfUrlRef.current = null
        }
        setPdf({ status: "inicial" })
    }

    function handleDescargarPdf() {
        if (pdf.status !== "vista_previa") return
        const enlace = document.createElement("a")
        enlace.href = pdf.url
        enlace.download = `liquidacion-${payrollPeriod.id}.pdf`
        enlace.click()
    }

    return (
        <Dialog open={true} onOpenChange={onOpenChange}>
            {/* "resize" habilita el tirador nativo del navegador en la esquina
            inferior derecha; overflow-auto es requisito del navegador para que
            el resize funcione, y los min-w/min-h evitan que se encoja hasta
            quedar inusable. La vista previa del PDF arranca más ancha porque
            necesita más espacio que el detalle de texto. */}
            <DialogContent
                className={`resize overflow-auto min-w-[380px] min-h-[300px] ${
                    pdf.status === "vista_previa" ? "max-w-4xl" : "max-w-2xl"
                }`}
            >
                <DialogHeader>
                    <DialogTitle>
                        {pdf.status === "vista_previa" ? "Comprobante de pago" : "Detalle de la liquidación"}
                    </DialogTitle>
                </DialogHeader>

                {pdf.status === "vista_previa" && (
                    <iframe
                        src={pdf.url}
                        title="Vista previa del comprobante de pago"
                        className="h-[65vh] w-full rounded-lg border border-gray-200"
                    />
                )}

                {pdf.status !== "vista_previa" && cargando && (
                    <p role="status" className="py-6 text-sm text-text-muted">
                        Cargando detalle de la liquidación…
                    </p>
                )}

                {pdf.status !== "vista_previa" && error && (
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
                )}

                {pdf.status !== "vista_previa" && detalle && !cargando && (
                    <div className="space-y-5">
                        <section aria-labelledby="liquidacion-detalle-general">
                            <h3
                                id="liquidacion-detalle-general"
                                className="mb-3 text-sm font-semibold text-primary"
                            >
                                Información general
                            </h3>
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
                )}

                {pdf.status === "error" && (
                    <p role="alert" className="text-sm text-error">
                        {pdf.mensaje}
                    </p>
                )}

                <DialogFooter>
                    {pdf.status === "vista_previa" ? (
                        <>
                            <Button type="button" variant="outline" onClick={handleVolverAlDetalle}>
                                Volver al detalle
                            </Button>
                            <Button
                                type="button"
                                onClick={handleDescargarPdf}
                                className="flex items-center gap-2"
                            >
                                <Download size={16} aria-hidden="true" />
                                Descargar PDF
                            </Button>
                        </>
                    ) : (
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleGenerarPdf}
                            disabled={!detalle || pdf.status === "generando"}
                            className="flex items-center gap-2"
                        >
                            <FileText size={16} aria-hidden="true" />
                            {pdf.status === "generando" ? "Generando…" : "Generar PDF"}
                        </Button>
                    )}
                    <button
                        type="button"
                        onClick={() => onOpenChange(false)}
                        className="h-10 rounded-lg bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                        Cerrar
                    </button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

type ConceptSectionRowsProps = {
    title: string
    headerClassName: string
    amountClassName: string
    sign: "+" | "-"
    conceptos: PayrollLine[]
}

// Fragmento de filas de <tbody>: una fila de encabezado coloreada (devengado/deducciones)
// seguida de sus conceptos, para que la tabla de detalle los diferencie con claridad
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
