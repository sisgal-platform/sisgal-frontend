import { useEffect, useRef, useState } from "react"
import { Download, FileSpreadsheet, FileText } from "lucide-react"

import { Button } from "@/components/ui/button"
import { formatCurrencyCOP, formatDateCO } from "@/lib/formatters"
import { useToast } from "@/toast"

import { payrollPeriodsService } from "../services/payrollPeriodsService"
import type { PayrollLine, PayrollPeriodDetail } from "../interfaces/types"
import { ConceptName, LoanObservations } from "./PayrollConceptDetails"

type PayrollPeriodDetailProps = {
    payrollPeriodId: number
}

type ResultadoDetalle = {
    payrollPeriodId: number
    intento: number
    detalle?: PayrollPeriodDetail
    error?: string
}

// Nombre del archivo descargado: sin tildes/ñ ni caracteres que puedan dar
// problemas en el sistema de archivos del usuario (espacios, "/", etc.).
function slugificarParaArchivo(valor: string): string {
    return valor
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-zA-Z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
}

// Nombre base compartido por el PDF y el CSV: identifica al empleado y la
// fecha de liquidación (no el id interno, que no le dice nada al usuario).
function nombreBaseArchivo(detalle: PayrollPeriodDetail): string {
    return `liquidacion-${slugificarParaArchivo(detalle.employeeName)}-${detalle.settlementDate}`
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

export function PayrollPeriodDetail({ payrollPeriodId }: PayrollPeriodDetailProps) {
    const { showToast } = useToast()
    const [intento, setIntento] = useState(0)
    const [resultado, setResultado] = useState<ResultadoDetalle | null>(null)
    const [pdf, setPdf] = useState<EstadoPdf>({ status: "inicial" })
    const [exportandoCsv, setExportandoCsv] = useState(false)
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

    // Si se navega de una liquidación a otra sin desmontar (misma ruta,
    // distinto :payrollPeriodId), el PDF de la anterior no debe seguir visible.
    useEffect(() => {
        if (pdfUrlRef.current) {
            URL.revokeObjectURL(pdfUrlRef.current)
            pdfUrlRef.current = null
        }
        // eslint-disable-next-line react-hooks/set-state-in-effect -- Reset PDF UI when the route switches to another payroll period.
        setPdf({ status: "inicial" })
    }, [payrollPeriodId])

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

    async function handleGenerarPdf() {
        setPdf({ status: "generando" })
        try {
            const blob = await payrollPeriodsService.getPdf(payrollPeriodId)
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
        if (pdf.status !== "vista_previa" || !detalle) return
        const enlace = document.createElement("a")
        enlace.href = pdf.url
        enlace.download = `${nombreBaseArchivo(detalle)}.pdf`
        enlace.click()
    }

    // A diferencia del PDF, el CSV no tiene paso de vista previa (se acordó que
    // la propia página de detalle ya cumple el "resumen antes de exportar" que
    // pide la CA): se descarga directo y se confirma con un toast.
    async function handleExportarCsv() {
        if (!detalle) return
        setExportandoCsv(true)
        try {
            const blob = await payrollPeriodsService.getCsv(payrollPeriodId)
            const url = URL.createObjectURL(blob)
            const enlace = document.createElement("a")
            enlace.href = url
            enlace.download = `${nombreBaseArchivo(detalle)}-contabilidad.csv`
            enlace.click()
            URL.revokeObjectURL(url)
            showToast("Archivo exportado correctamente.", "success")
        } catch (csvError: unknown) {
            showToast(
                csvError instanceof Error
                    ? csvError.message
                    : "No fue posible exportar la liquidación para contabilidad.",
                "error",
            )
        } finally {
            setExportandoCsv(false)
        }
    }

    if (pdf.status === "vista_previa") {
        return (
            <div className="space-y-4">
                <h2 className="text-sm font-semibold text-primary">Comprobante de pago</h2>
                <iframe
                    src={pdf.url}
                    title="Vista previa del comprobante de pago"
                    className="h-[65vh] w-full rounded-xl border border-gray-200"
                />
                <div className="flex flex-wrap justify-end gap-2">
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
                </div>
            </div>
        )
    }

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

            <LoanObservations observations={detalle.observations} />

            <p className="text-xs text-text-muted">
                Resumen: Total devengado ({formatCurrencyCOP(detalle.totalEarnings)}) −
                Total deducciones ({formatCurrencyCOP(detalle.totalDeductions)}) ={" "}
                {formatCurrencyCOP(detalle.netPay)}
            </p>

            {pdf.status === "error" && (
                <p role="alert" className="text-sm text-error">
                    {pdf.mensaje}
                </p>
            )}

            <div className="flex flex-wrap justify-end gap-2">
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleExportarCsv}
                    disabled={exportandoCsv}
                    className="flex items-center gap-2"
                >
                    <FileSpreadsheet size={16} aria-hidden="true" />
                    {exportandoCsv ? "Exportando…" : "Exportar para contabilidad"}
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerarPdf}
                    disabled={pdf.status === "generando"}
                    className="flex items-center gap-2"
                >
                    <FileText size={16} aria-hidden="true" />
                    {pdf.status === "generando" ? "Generando…" : "Generar PDF"}
                </Button>
            </div>
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

export function ConceptSectionRows({
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
                        <td className="px-4 py-2 text-text">
                            <ConceptName line={concepto} />
                        </td>
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