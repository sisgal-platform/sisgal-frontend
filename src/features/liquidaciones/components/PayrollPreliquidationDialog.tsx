import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { formatCurrencyCOP, formatDateCO } from "@/lib/formatters";

import { Button } from "@/components/ui/button";
import { EmployeeCombobox } from "@/features/empleados/components/EmployeeCombobox";
import { employeesService } from "@/features/empleados/services/employeesService";
import type { Employee } from "@/features/empleados/interfaces/types";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { payrollPeriodsService } from "../services/payrollPeriodsService";
import type {
    PayrollLine,
    PayrollPreliquidation,
    PayrollPreliquidationRequest,
} from "../interfaces/types";
import { ConceptName, LoanObservations } from "./PayrollConceptDetails";

type PayrollPreliquidationDialogProps = Readonly<{
    onOpenChange: (open: boolean) => void;
    onConfirmed: (payrollPeriodId: number) => void;
}>;

export function PayrollPreliquidationDialog({
    onOpenChange,
    onConfirmed,
}: PayrollPreliquidationDialogProps) {
    const [periodStart, setPeriodStart] = useState("");
    const [periodEnd, setPeriodEnd] = useState("");
    const [employeeId, setEmployeeId] = useState("");
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loadingEmployees, setLoadingEmployees] = useState(true);
    const [employeesError, setEmployeesError] = useState<string | null>(null);
    const [employeeLoadVersion, setEmployeeLoadVersion] = useState(0);
    const [preview, setPreview] = useState<PayrollPreliquidation | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [confirming, setConfirming] = useState(false);

    useEffect(() => {
        let active = true;

        async function loadEmployees() {
            setLoadingEmployees(true);
            setEmployeesError(null);

            try {
                const result = await employeesService.list({
                    status: "ACTIVO",
                });
                if (active) {
                    setEmployees(
                        result.filter(
                            (employee) => employee.status === "ACTIVO",
                        ),
                    );
                }
            } catch {
                if (active) {
                    setEmployeesError(
                        "No fue posible cargar los empleados activos.",
                    );
                }
            } finally {
                if (active) setLoadingEmployees(false);
            }
        }

        void loadEmployees();
        return () => {
            active = false;
        };
    }, [employeeLoadVersion]);

    function updatePeriod(field: "start" | "end", value: string) {
        if (field === "start") setPeriodStart(value);
        else setPeriodEnd(value);
        setPreview(null);
        setError(null);
    }

    function updateEmployee(value: string) {
        setEmployeeId(value);
        setPreview(null);
        setError(null);
    }

    function buildRequest(): PayrollPreliquidationRequest | null {
        if (!employeeId) {
            setError("Selecciona un empleado activo.");
            return null;
        }
        const selectedEmployee = employees.find(
            (employee) => String(employee.id) === employeeId,
        );
        if (selectedEmployee?.status !== "ACTIVO") {
            setError("Selecciona un empleado activo disponible.");
            return null;
        }
        if (!periodStart || !periodEnd) {
            setError("Selecciona las fechas de inicio y fin del período.");
            return null;
        }
        if (periodStart > periodEnd) {
            setError(
                "La fecha inicial no puede ser posterior a la fecha final.",
            );
            return null;
        }
        return { periodStart, periodEnd };
    }

    async function generatePreview() {
        const request = buildRequest();
        if (!request) return;

        setLoading(true);
        setError(null);
        try {
            setPreview(
                await payrollPeriodsService.generatePreliquidation(
                    Number(employeeId),
                    request,
                ),
            );
        } catch (cause) {
            setPreview(null);
            setError(
                cause instanceof Error
                    ? cause.message
                    : "No fue posible generar la preliquidación.",
            );
        } finally {
            setLoading(false);
        }
    }

    async function confirmPreliquidation() {
        const request = buildRequest();
        if (!request || !preview) {
            return;
        }

        setConfirming(true);
        setError(null);
        try {
            const payrollPeriod =
                await payrollPeriodsService.confirmPreliquidation({
                    ...request,
                    employeeId: preview.employeeId,
                });
            onConfirmed(payrollPeriod.id);
        } catch (cause) {
            setError(
                cause instanceof Error
                    ? cause.message
                    : "No fue posible confirmar la liquidación.",
            );
        } finally {
            setConfirming(false);
        }
    }

    let generateButtonLabel = "Generar preliquidación";
    if (preview) generateButtonLabel = "Recalcular";
    if (loading) generateButtonLabel = "Calculando…";

    return (
        <Dialog open onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto">
                <DialogHeader>
                    <div className="flex flex-wrap items-center gap-3">
                        <DialogTitle>Preliquidación de nómina</DialogTitle>
                        <span className="inline-flex rounded-full bg-warning-light px-2.5 py-1 text-xs font-semibold text-warning-dark">
                            Preliquidación
                        </span>
                    </div>
                    <DialogDescription>
                        Revisa los cálculos antes de guardar la liquidación
                        definitiva.
                    </DialogDescription>
                </DialogHeader>

                <section
                    aria-label="Datos de preliquidación"
                    className="space-y-4"
                >
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <label className="flex flex-col gap-1 text-sm text-text-muted">
                            <span>Empleado</span>
                            <EmployeeCombobox
                                id="preliquidacion-empleado"
                                employees={employees}
                                value={employeeId}
                                onChange={updateEmployee}
                                loading={loadingEmployees}
                                disabled={
                                    loadingEmployees ||
                                    loading ||
                                    confirming ||
                                    employees.length === 0 ||
                                    Boolean(employeesError)
                                }
                                placeholder="Buscar nombre o documento"
                                allLabel="Selecciona un empleado"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-text-muted">
                            <span>Período desde</span>
                            <input
                                type="date"
                                value={periodStart}
                                onChange={(event) =>
                                    updatePeriod("start", event.target.value)
                                }
                                className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                            />
                        </label>
                        <label className="flex flex-col gap-1 text-sm text-text-muted">
                            <span>Período hasta</span>
                            <input
                                type="date"
                                value={periodEnd}
                                onChange={(event) =>
                                    updatePeriod("end", event.target.value)
                                }
                                className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                            />
                        </label>
                    </div>
                    {employeesError && (
                        <div
                            role="alert"
                            className="flex flex-wrap items-center justify-between gap-3 text-sm text-error"
                        >
                            <span>{employeesError}</span>
                            <button
                                type="button"
                                onClick={() =>
                                    setEmployeeLoadVersion(
                                        (version) => version + 1,
                                    )
                                }
                                className="font-semibold underline"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}
                    {!loadingEmployees &&
                        !employeesError &&
                        employees.length === 0 && (
                            <p className="text-sm text-text-muted">
                                No hay empleados activos disponibles para
                                preliquidar.
                            </p>
                        )}
                    <Button
                        type="button"
                        onClick={generatePreview}
                        disabled={
                            loading ||
                            confirming ||
                            loadingEmployees ||
                            employees.length === 0 ||
                            Boolean(employeesError)
                        }
                        className="flex items-center gap-2"
                    >
                        {generateButtonLabel}
                    </Button>
                </section>

                {error && (
                    <p
                        role="alert"
                        className="rounded-lg bg-error-light px-4 py-3 text-sm text-error"
                    >
                        {error}
                    </p>
                )}

                {preview && !loading && (
                    <PreliquidationReview preview={preview} />
                )}

                <DialogFooter>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                        disabled={loading || confirming}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        onClick={confirmPreliquidation}
                        disabled={loading || confirming || !preview}
                        className="flex items-center gap-2"
                    >
                        {confirming && (
                            <LoaderCircle
                                size={16}
                                aria-hidden="true"
                                className="animate-spin"
                            />
                        )}
                        {confirming ? "Generando…" : "Confirmar liquidación"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

type PreliquidationReviewProps = Readonly<{ preview: PayrollPreliquidation }>;

function PreliquidationReview({ preview }: PreliquidationReviewProps) {
    return (
        <section aria-labelledby="preliquidacion-resumen" className="space-y-4">
            <div className="flex flex-wrap items-end justify-between gap-2 border-b border-gray-200 pb-3">
                <div>
                    <h2
                        id="preliquidacion-resumen"
                        className="text-base font-semibold text-text"
                    >
                        Resumen de la nómina
                    </h2>
                    <p className="text-sm text-text-muted">
                        {formatDateCO(preview.periodStart)} –{" "}
                        {formatDateCO(preview.periodEnd)}
                    </p>
                </div>
                <p className="text-sm text-text-muted">
                    {preview.employeeName}
                </p>
            </div>

            <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                <Total label="Total devengado" value={preview.totalEarnings} />
                <Total
                    label="Total deducciones"
                    value={preview.totalDeductions}
                />
                <Total label="Neto a pagar" value={preview.netPay} />
            </dl>

            <section
                aria-labelledby="preliquidacion-empleado"
                className="space-y-4"
            >
                <div>
                    <h3
                        id="preliquidacion-empleado"
                        className="text-sm font-semibold text-primary"
                    >
                        Información del empleado
                    </h3>
                    <p className="text-sm text-text-muted">
                        {preview.employeeDocumentType}{" "}
                        {preview.employeeDocument}
                        {preview.employeePosition
                            ? ` · ${preview.employeePosition}`
                            : ""}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-5 border-y border-gray-200 py-4 sm:grid-cols-2">
                    <ConceptList title="Devengados" lines={preview.earnings} />
                    <ConceptList
                        title="Deducciones"
                        lines={preview.deductions}
                    />
                </div>

                <LoanObservations observations={preview.observations} />
            </section>
        </section>
    );
}

function ConceptList({
    title,
    lines,
}: Readonly<{ title: string; lines: PayrollLine[] }>) {
    return (
        <section className="mt-4">
            <h3 className="mb-2 text-sm font-semibold text-primary">{title}</h3>
            {lines.length > 0 ? (
                <dl className="space-y-1 text-sm">
                    {lines.map((line, index) => (
                        <div
                            key={`${line.conceptName}-${index}`}
                            className="flex justify-between gap-3"
                        >
                            <dt className="text-text-muted">
                                <ConceptName line={line} />
                            </dt>
                            <dd className="shrink-0 font-medium text-text">
                                {formatCurrencyCOP(line.amount)}
                            </dd>
                        </div>
                    ))}
                </dl>
            ) : (
                <p className="text-sm text-text-muted">
                    Sin conceptos registrados.
                </p>
            )}
        </section>
    );
}

function Total({ label, value }: Readonly<{ label: string; value: number }>) {
    return (
        <div className="border-l-2 border-primary pl-3">
            <dt className="text-xs text-text-muted">{label}</dt>
            <dd className="text-base font-semibold text-text">
                {formatCurrencyCOP(value)}
            </dd>
        </div>
    );
}
