import { useState } from "react";
import { ArrowLeft, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    formatCurrencyCOP,
    formatDateCO,
    formatNumberCO,
} from "@/lib/formatters";

import { payrollPeriodsService } from "../services/payrollPeriodsService";
import type {
    PayrollCalculation,
    PayrollCalculationError,
    PayrollPreliquidation,
    PayrollWorkedHours,
} from "../interfaces/types";
import { LoanObservations } from "./LoanDeductionDetails";
import { ConceptSectionRows } from "./PayrollPeriodDetail";

type ProcessStatus = "PENDIENTE" | "PROCESANDO" | "COMPLETADO" | "CON_ERRORES";

const STATUS_LABEL: Record<ProcessStatus, string> = {
    PENDIENTE: "Pendiente",
    PROCESANDO: "Procesando",
    COMPLETADO: "Completado",
    CON_ERRORES: "Con errores",
};

const STATUS_CLASS: Record<ProcessStatus, string> = {
    PENDIENTE: "bg-secondary-dark text-text-muted",
    PROCESANDO: "bg-warning-light text-warning-dark",
    COMPLETADO: "bg-success-light text-success-dark",
    CON_ERRORES: "bg-error-light text-error",
};

const getPeriodError = (periodStart: string, periodEnd: string) => {
    if (!periodStart || !periodEnd) {
        return "Selecciona las fechas de inicio y fin del período.";
    }
    if (periodStart > periodEnd) {
        return "La fecha inicial no puede ser posterior a la fecha final.";
    }
    return null;
};

type PayrollCalculationDialogProps = Readonly<{
    onOpenChange: (open: boolean) => void;
}>;

export function PayrollCalculationDialog({
    onOpenChange,
}: PayrollCalculationDialogProps) {
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
    const [validationError, setValidationError] = useState<string | null>(
        null,
    );
    const [requestError, setRequestError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);
    const [calculation, setCalculation] = useState<PayrollCalculation | null>(
        null,
    );
    const [selected, setSelected] = useState<PayrollPreliquidation | null>(
        null,
    );

    let status: ProcessStatus = "PENDIENTE";
    if (processing) status = "PROCESANDO";
    else if (calculation) status = calculation.status;
    else if (requestError) status = "CON_ERRORES";

    // Cambiar el período invalida el resultado anterior
    function updatePeriod(field: "start" | "end", value: string) {
        if (field === "start") setPeriodStart(value);
        else setPeriodEnd(value);
        setValidationError(null);
        setRequestError(null);
        setCalculation(null);
        setSelected(null);
    }

    async function calculate() {
        const periodError = getPeriodError(periodStart, periodEnd);
        setValidationError(periodError);
        if (periodError) return;

        setProcessing(true);
        setRequestError(null);
        setCalculation(null);
        try {
            setCalculation(
                await payrollPeriodsService.calculatePayroll({
                    periodStart,
                    periodEnd,
                }),
            );
        } catch (cause) {
            setRequestError(
                cause instanceof Error
                    ? cause.message
                    : "No fue posible calcular la nómina.",
            );
        } finally {
            setProcessing(false);
        }
    }

    let calculateButtonLabel = "Calcular nómina";
    if (calculation) calculateButtonLabel = "Recalcular";
    if (processing) calculateButtonLabel = "Calculando…";

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                <DialogHeader>
                    <div className="flex flex-wrap items-center gap-3">
                        <DialogTitle>Calcular nómina</DialogTitle>
                        <span
                            role="status"
                            aria-label={`Estado del cálculo: ${STATUS_LABEL[status]}`}
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_CLASS[status]}`}
                        >
                            {STATUS_LABEL[status]}
                        </span>
                    </div>
                    <DialogDescription>
                        Calcula la nómina de todos los empleados activos para
                        el período. El resultado no se guarda como liquidación
                        definitiva.
                    </DialogDescription>
                </DialogHeader>

                {selected ? (
                    <EmployeeCalculationDetail
                        detail={selected}
                        onBack={() => setSelected(null)}
                    />
                ) : (
                    <>
                        <section
                            aria-label="Período a liquidar"
                            className="min-w-0 space-y-4"
                        >
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <label className="flex flex-col gap-1 text-sm text-text-muted">
                                    <span>Período desde</span>
                                    <input
                                        type="date"
                                        value={periodStart}
                                        disabled={processing}
                                        onChange={(event) =>
                                            updatePeriod(
                                                "start",
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                                    />
                                </label>
                                <label className="flex flex-col gap-1 text-sm text-text-muted">
                                    <span>Período hasta</span>
                                    <input
                                        type="date"
                                        value={periodEnd}
                                        disabled={processing}
                                        onChange={(event) =>
                                            updatePeriod(
                                                "end",
                                                event.target.value,
                                            )
                                        }
                                        className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                                    />
                                </label>
                            </div>
                            {validationError && (
                                <p role="alert" className="text-sm text-error">
                                    {validationError}
                                </p>
                            )}
                            <Button
                                type="button"
                                onClick={calculate}
                                disabled={processing}
                                className="w-full sm:w-auto"
                            >
                                {calculateButtonLabel}
                            </Button>
                        </section>

                        {requestError && (
                            <p
                                role="alert"
                                className="rounded-lg bg-error-light px-4 py-3 text-sm text-error"
                            >
                                {requestError}
                            </p>
                        )}

                        {calculation && (
                            <CalculationSummary
                                calculation={calculation}
                                onViewDetail={setSelected}
                            />
                        )}
                    </>
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={processing}
                    >
                        Cerrar
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type CalculationSummaryProps = Readonly<{
    calculation: PayrollCalculation;
    onViewDetail: (detail: PayrollPreliquidation) => void;
}>;

function CalculationSummary({
    calculation,
    onViewDetail,
}: CalculationSummaryProps) {
    // min-w-0: dentro de la grilla del diálogo, la tabla haría crecer la
    // columna en vez de desplazarse dentro de su propio contenedor.
    return (
        <section
            aria-labelledby="calculo-resumen"
            className="min-w-0 space-y-4"
        >
            <div className="border-b border-gray-200 pb-3">
                <h2
                    id="calculo-resumen"
                    className="text-base font-semibold text-text"
                >
                    Resultado del cálculo
                </h2>
                <p className="text-sm text-text-muted">
                    {formatDateCO(calculation.periodStart)} –{" "}
                    {formatDateCO(calculation.periodEnd)}
                </p>
            </div>

            {calculation.totalEmployees === 0 ? (
                <p className="text-sm text-text-muted">
                    No hay empleados activos para liquidar.
                </p>
            ) : (
                <>
                    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <Total
                            label="Empleados calculados"
                            value={`${calculation.results.length} de ${calculation.totalEmployees}`}
                        />
                        <Total
                            label="Total devengado"
                            value={formatCurrencyCOP(calculation.totalEarnings)}
                        />
                        <Total
                            label="Total deducciones"
                            value={formatCurrencyCOP(
                                calculation.totalDeductions,
                            )}
                        />
                        <Total
                            label="Neto a pagar"
                            value={formatCurrencyCOP(calculation.totalNetPay)}
                        />
                    </dl>

                    {calculation.errors.length > 0 && (
                        <CalculationErrors errors={calculation.errors} />
                    )}

                    {calculation.results.length > 0 && (
                        <CalculationResultsTable
                            results={calculation.results}
                            onViewDetail={onViewDetail}
                        />
                    )}
                </>
            )}
        </section>
    );
}

function CalculationErrors({
    errors,
}: Readonly<{ errors: PayrollCalculationError[] }>) {
    return (
        <section
            aria-labelledby="calculo-errores"
            className="rounded-xl border border-error-light bg-surface p-4"
        >
            <h3 id="calculo-errores" className="text-sm font-semibold text-error">
                Empleados con información por corregir ({errors.length})
            </h3>
            <p className="text-xs text-text-muted">
                No se calcularon; corrige la información indicada y vuelve a
                calcular.
            </p>
            <ul className="mt-3 space-y-3">
                {errors.map((error) => (
                    <li key={error.employeeId} className="text-sm">
                        <p className="font-medium text-text">
                            {error.employeeName} · {error.employeeDocumentType}{" "}
                            {error.employeeDocument}
                        </p>
                        <ul className="list-disc space-y-0.5 pl-5 text-error">
                            {error.causes.map((cause) => (
                                <li key={cause}>{cause}</li>
                            ))}
                        </ul>
                    </li>
                ))}
            </ul>
        </section>
    );
}

type CalculationResultsTableProps = Readonly<{
    results: PayrollPreliquidation[];
    onViewDetail: (detail: PayrollPreliquidation) => void;
}>;

function CalculationResultsTable({
    results,
    onViewDetail,
}: CalculationResultsTableProps) {
    return (
        <div className="overflow-x-auto rounded-xl border border-gray-200">
            <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">
                    Nómina calculada por empleado
                </caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                        <th scope="col" className="px-4 py-2">
                            Empleado
                        </th>
                        <th scope="col" className="px-4 py-2 text-right">
                            Total devengado
                        </th>
                        <th scope="col" className="px-4 py-2 text-right">
                            Total deducciones
                        </th>
                        <th scope="col" className="px-4 py-2 text-right">
                            Neto a pagar
                        </th>
                        <th scope="col" className="px-4 py-2 text-right">
                            Detalle
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {results.map((result) => (
                        <tr key={result.employeeId}>
                            <td className="px-4 py-2">
                                <p className="font-medium text-text">
                                    {result.employeeName}
                                </p>
                                <p className="text-xs text-text-muted">
                                    {result.employeeDocumentType}{" "}
                                    {result.employeeDocument}
                                </p>
                            </td>
                            <td className="px-4 py-2 text-right text-text-muted">
                                {formatCurrencyCOP(result.totalEarnings)}
                            </td>
                            <td className="px-4 py-2 text-right text-text-muted">
                                {formatCurrencyCOP(result.totalDeductions)}
                            </td>
                            <td className="px-4 py-2 text-right font-semibold text-text">
                                {formatCurrencyCOP(result.netPay)}
                            </td>
                            <td className="px-4 py-2 text-right">
                                <button
                                    type="button"
                                    onClick={() => onViewDetail(result)}
                                    aria-label={`Ver detalle del cálculo de ${result.employeeName}`}
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
    );
}

type EmployeeCalculationDetailProps = Readonly<{
    detail: PayrollPreliquidation;
    onBack: () => void;
}>;

function EmployeeCalculationDetail({
    detail,
    onBack,
}: EmployeeCalculationDetailProps) {
    return (
        <section aria-labelledby="calculo-detalle" className="min-w-0 space-y-5">
            <button
                type="button"
                onClick={onBack}
                className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
            >
                <ArrowLeft size={16} aria-hidden="true" />
                Volver al resultado
            </button>

            <div>
                <h2
                    id="calculo-detalle"
                    className="text-base font-semibold text-text"
                >
                    {detail.employeeName}
                </h2>
                <p className="text-sm text-text-muted">
                    {detail.employeeDocumentType} {detail.employeeDocument}
                    {detail.employeePosition
                        ? ` · ${detail.employeePosition}`
                        : ""}{" "}
                    · {formatDateCO(detail.periodStart)} –{" "}
                    {formatDateCO(detail.periodEnd)}
                </p>
            </div>

            <WorkedHoursTable workedHours={detail.workedHours} />

            <div className="overflow-hidden rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                    <caption className="sr-only">
                        Conceptos devengados y deducciones del cálculo
                    </caption>
                    <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                        <tr>
                            <th scope="col" className="px-4 py-2">
                                Concepto
                            </th>
                            <th scope="col" className="px-4 py-2 text-right">
                                Monto
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        <ConceptSectionRows
                            title="Devengado"
                            headerClassName="bg-success-light text-success-dark"
                            amountClassName="text-success"
                            sign="+"
                            conceptos={detail.earnings}
                        />
                        <ConceptSectionRows
                            title="Deducciones"
                            headerClassName="bg-error-light text-error"
                            amountClassName="text-error"
                            sign="-"
                            conceptos={detail.deductions}
                        />
                        <TotalRow
                            label="Total devengado"
                            value={detail.totalEarnings}
                        />
                        <TotalRow
                            label="Total deducciones"
                            value={detail.totalDeductions}
                        />
                        <TotalRow label="Neto a pagar" value={detail.netPay} />
                    </tbody>
                </table>
            </div>

            <LoanObservations observations={detail.observations} />
        </section>
    );
}

function WorkedHoursTable({
    workedHours,
}: Readonly<{ workedHours: PayrollWorkedHours[] }>) {
    return (
        <section aria-labelledby="calculo-horas">
            <h3
                id="calculo-horas"
                className="mb-2 text-sm font-semibold text-primary"
            >
                Horas trabajadas
            </h3>
            {workedHours.length === 0 ? (
                <p className="text-sm text-text-muted">
                    Sin marcaciones en el período.
                </p>
            ) : (
                <dl className="grid grid-cols-1 gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
                    {workedHours.map((item) => (
                        <div
                            key={item.type}
                            className="flex justify-between gap-3"
                        >
                            <dt className="text-text-muted">{item.label}</dt>
                            <dd className="shrink-0 font-medium text-text">
                                {formatNumberCO(item.hours)} h
                            </dd>
                        </div>
                    ))}
                </dl>
            )}
        </section>
    );
}

function TotalRow({ label, value }: Readonly<{ label: string; value: number }>) {
    return (
        <tr className="font-semibold text-text">
            <td className="px-4 py-2">{label}</td>
            <td className="px-4 py-2 text-right">{formatCurrencyCOP(value)}</td>
        </tr>
    );
}

function Total({ label, value }: Readonly<{ label: string; value: string }>) {
    return (
        <div className="border-l-2 border-primary pl-3">
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="text-base font-semibold text-text">{value}</dd>
        </div>
    );
}
