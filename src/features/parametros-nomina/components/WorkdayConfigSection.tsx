import { useState } from "react";
import { Pencil } from "lucide-react";

import { formatDateCO } from "@/lib/formatters";
import { useToast } from "@/toast";

import { useWorkdayConfig } from "../hooks/useWorkdayConfig";
import type { WorkdayConfig } from "../interfaces/types";
import { CurrentWorkdayConfigCard } from "./CurrentWorkdayConfigCard";
import { WorkdayConfigFormDialog } from "./WorkdayConfigFormDialog";
import { WorkdayConfigHistoryTable } from "./WorkdayConfigHistoryTable";

/** HU45 — Jornada laboral: valores vigentes, modificación con vigencia e historial. */
export function WorkdayConfigSection() {
    const { showToast } = useToast();
    const { versions, loading, error, reload } = useWorkdayConfig();
    const [editing, setEditing] = useState(false);

    // Las versiones llegan de la más reciente a la más antigua.
    const latest = versions[0] ?? null;
    const current =
        versions.find((version) => version.status === "VIGENTE") ?? null;
    const scheduled = versions.filter(
        (version) => version.status === "PROGRAMADA",
    );

    function handleRegistered(version: WorkdayConfig) {
        setEditing(false);
        showToast(
            `La jornada laboral se guardó. Los nuevos valores rigen desde el ${formatDateCO(version.validFrom)}.`,
            "success",
        );
        reload();
    }

    return (
        <section aria-labelledby="jornada-laboral-titulo" className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <header className="space-y-1">
                    <h3
                        id="jornada-laboral-titulo"
                        className="text-xl font-bold text-primary"
                    >
                        Jornada laboral
                    </h3>
                    <p className="max-w-3xl text-sm text-text-muted">
                        Límites de la jornada ordinaria y franjas diurna y
                        nocturna con las que se clasifican las horas trabajadas.
                    </p>
                </header>

                {!error && !(loading && versions.length === 0) && (
                    <button
                        type="button"
                        onClick={() => setEditing(true)}
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark sm:text-base"
                    >
                        <Pencil size={18} aria-hidden="true" />
                        {latest ? "Modificar jornada" : "Registrar jornada"}
                    </button>
                )}
            </div>

            <WorkdayConfigContent
                versions={versions}
                current={current}
                scheduled={scheduled}
                loading={loading}
                error={error}
                onRetry={reload}
            />

            {editing && (
                <WorkdayConfigFormDialog
                    base={latest}
                    onClose={() => setEditing(false)}
                    onRegistered={handleRegistered}
                />
            )}
        </section>
    );
}

type WorkdayConfigContentProps = {
    versions: WorkdayConfig[];
    current: WorkdayConfig | null;
    scheduled: WorkdayConfig[];
    loading: boolean;
    error: string | null;
    onRetry: () => void;
};

function WorkdayConfigContent({
    versions,
    current,
    scheduled,
    loading,
    error,
    onRetry,
}: WorkdayConfigContentProps) {
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

    if (loading && versions.length === 0) {
        return (
            <p role="status" className="rounded-2xl bg-white p-6 text-text-muted">
                Cargando jornada laboral…
            </p>
        );
    }

    return (
        <>
            <CurrentWorkdayConfigCard current={current} />

            {scheduled.map((version) => (
                <p
                    key={version.id}
                    role="note"
                    className="rounded-2xl border border-warning bg-warning-light p-4 text-sm text-warning-dark"
                >
                    Hay un cambio programado: los valores de la versión del{" "}
                    {formatDateCO(version.validFrom)} empezarán a regir en esa
                    fecha.
                </p>
            ))}

            <WorkdayConfigHistoryTable versions={versions} loading={loading} />
        </>
    );
}
