import { useState } from "react";
import { Pencil } from "lucide-react";

import { formatDateCO } from "@/lib/formatters";
import { useToast } from "@/toast";

import { useWorkRates } from "../hooks/useWorkRates";
import type { WorkRate, WorkRateType } from "../interfaces/types";
import { CurrentWorkRatesCard } from "./CurrentWorkRatesCard";
import { WorkRatesFormDialog } from "./WorkRatesFormDialog";
import { WorkRatesHistoryTable } from "./WorkRatesHistoryTable";

type RatesByType = Partial<Record<WorkRateType, WorkRate>>;

/** HU39 — Horas y recargos: valores vigentes, modificación con vigencia e historial. */
export function WorkRatesSection() {
    const { showToast } = useToast();
    const { rates, loading, error, reload } = useWorkRates();
    const [editing, setEditing] = useState(false);

    const current: RatesByType = {};
    const latest: RatesByType = {};

    // Las versiones de cada tipo llegan de la más reciente a la más antigua.
    for (const rate of rates) {
        latest[rate.type] ??= rate;
        if (rate.status === "VIGENTE") current[rate.type] = rate;
    }

    // Fechas en las que empiezan a regir cambios ya registrados.
    const scheduledDates = [
        ...new Set(
            rates
                .filter((rate) => rate.status === "PROGRAMADA")
                .map((rate) => rate.validFrom),
        ),
    ].sort();

    function handleRegistered(registered: WorkRate[]) {
        setEditing(false);
        showToast(
            `Los recargos se guardaron. Los nuevos valores rigen desde el ${formatDateCO(registered[0]?.validFrom)}.`,
            "success",
        );
        reload();
    }

    return (
        <section aria-labelledby="recargos-titulo" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <header className="space-y-1">
                    <h3
                        id="recargos-titulo"
                        className="text-xl font-bold text-primary"
                    >
                        Horas y recargos
                    </h3>
                    <p className="max-w-3xl text-sm text-text-muted">
                        Recargo con el que se liquida cada tipo de hora
                        trabajada: ordinarias, extra, dominicales y festivas.
                    </p>
                </header>

                {!error && !(loading && rates.length === 0) && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark sm:text-base"
                    >
                        <Pencil size={18} aria-hidden="true" />
                        Modificar recargos
                    </button>
                )}
            </div>

            <WorkRatesContent
                rates={rates}
                current={current}
                scheduledDates={scheduledDates}
                loading={loading}
                error={error}
                onRetry={reload}
            />

            {editing && (
                <WorkRatesFormDialog
                    latest={latest}
                    onClose={() => setEditing(false)}
                    onRegistered={handleRegistered}
                />
            )}
        </section>
    );
}

type WorkRatesContentProps = {
    rates: WorkRate[];
    current: RatesByType;
    scheduledDates: string[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
};

function WorkRatesContent({
    rates,
    current,
    scheduledDates,
    loading,
    error,
    onRetry,
}: WorkRatesContentProps) {
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

    if (loading && rates.length === 0) {
        return (
            <p role="status" className="rounded-2xl bg-white p-6 text-text-muted">
                Cargando recargos…
            </p>
        );
    }

    return (
        <>
            <CurrentWorkRatesCard current={current} />

            {scheduledDates.map((date) => (
                <p
                    key={date}
                    role="note"
                    className="rounded-2xl border border-warning bg-warning-light p-4 text-sm text-warning-dark"
                >
                    Hay cambios programados: los recargos registrados para el{" "}
                    {formatDateCO(date)} empezarán a regir en esa fecha.
                </p>
            ))}

            <WorkRatesHistoryTable rates={rates} loading={loading} />
        </>
    );
}
