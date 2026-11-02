import { useState } from "react";
import { Pencil } from "lucide-react";

import { formatDateCO } from "@/lib/formatters";
import { useToast } from "@/toast";

import { useLegalDeductions } from "../hooks/useLegalDeductions";
import type { LegalDeduction, LegalDeductionType } from "../interfaces/types";
import { CurrentLegalDeductionsCard } from "./CurrentLegalDeductionsCard";
import { LegalDeductionsFormDialog } from "./LegalDeductionsFormDialog";
import { LegalDeductionsHistoryTable } from "./LegalDeductionsHistoryTable";

type DeductionsByType = Partial<Record<LegalDeductionType, LegalDeduction>>;

/** HU37 — Descuentos legales: valores vigentes, modificación con vigencia e historial. */
export function LegalDeductionsSection() {
    const { showToast } = useToast();
    const { deductions, loading, error, reload } = useLegalDeductions();
    const [editing, setEditing] = useState(false);

    const current: DeductionsByType = {};
    const latest: DeductionsByType = {};

    // Las versiones de cada descuento llegan de la más reciente a la más antigua.
    for (const deduction of deductions) {
        latest[deduction.type] ??= deduction;
        if (deduction.status === "VIGENTE") current[deduction.type] = deduction;
    }

    // Fechas en las que empiezan a regir cambios ya registrados.
    const scheduledDates = [
        ...new Set(
            deductions
                .filter((deduction) => deduction.status === "PROGRAMADA")
                .map((deduction) => deduction.validFrom),
        ),
    ].sort();

    function handleRegistered(registered: LegalDeduction[]) {
        setEditing(false);
        showToast(
            `Los descuentos legales se guardaron. Los nuevos valores rigen desde el ${formatDateCO(registered[0]?.validFrom)}.`,
            "success",
        );
        reload();
    }

    return (
        <section aria-labelledby="descuentos-titulo" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <header className="space-y-1">
                    <h3
                        id="descuentos-titulo"
                        className="text-xl font-bold text-primary"
                    >
                        Descuentos legales
                    </h3>
                    <p className="max-w-3xl text-sm text-text-muted">
                        Porcentaje de salud y de pensión a cargo del empleado
                        que se descuenta en cada liquidación de nómina.
                    </p>
                </header>

                {!error && !(loading && deductions.length === 0) && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark sm:text-base"
                    >
                        <Pencil size={18} aria-hidden="true" />
                        Modificar descuentos
                    </button>
                )}
            </div>

            <LegalDeductionsContent
                deductions={deductions}
                current={current}
                scheduledDates={scheduledDates}
                loading={loading}
                error={error}
                onRetry={reload}
            />

            {editing && (
                <LegalDeductionsFormDialog
                    latest={latest}
                    onClose={() => setEditing(false)}
                    onRegistered={handleRegistered}
                />
            )}
        </section>
    );
}

type LegalDeductionsContentProps = {
    deductions: LegalDeduction[];
    current: DeductionsByType;
    scheduledDates: string[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
};

function LegalDeductionsContent({
    deductions,
    current,
    scheduledDates,
    loading,
    error,
    onRetry,
}: LegalDeductionsContentProps) {
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
        );
    }

    if (loading && deductions.length === 0) {
        return (
            <p role="status" className="rounded-2xl bg-white p-6 text-text-muted">
                Cargando descuentos legales…
            </p>
        );
    }

    return (
        <>
            <CurrentLegalDeductionsCard current={current} />

            {scheduledDates.map((date) => (
                <p
                    key={date}
                    role="note"
                    className="rounded-2xl border border-warning bg-warning-light p-4 text-sm text-warning-dark"
                >
                    Hay cambios programados: los descuentos registrados para
                    el {formatDateCO(date)} empezarán a regir en esa fecha.
                </p>
            ))}

            <LegalDeductionsHistoryTable
                deductions={deductions}
                loading={loading}
            />
        </>
    );
}
