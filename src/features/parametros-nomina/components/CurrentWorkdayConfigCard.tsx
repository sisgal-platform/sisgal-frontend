import { formatDateCO } from "@/lib/formatters";

import type { WorkdayConfig } from "../interfaces/types";
import { formatHours, formatTimeRange } from "../utils/format";
import { ValidityStatusBadge } from "./ValidityStatusBadge";

type CurrentWorkdayConfigCardProps = {
    /** Versión que rige hoy; null cuando ninguna está vigente. */
    current: WorkdayConfig | null;
};

/** Valores de la jornada laboral que rigen hoy y desde cuándo aplican. */
export function CurrentWorkdayConfigCard({
    current,
}: CurrentWorkdayConfigCardProps) {
    if (!current) {
        return (
            <p
                role="status"
                className="rounded-2xl border border-warning bg-warning-light p-4 text-sm text-warning-dark"
            >
                No hay una jornada laboral vigente. Regístrala para que los
                cálculos de asistencia y nómina puedan clasificar las horas
                trabajadas.
            </p>
        );
    }

    const values = [
        {
            label: "Jornada máxima semanal",
            value: formatHours(current.maxWeekHours),
        },
        {
            label: "Jornada máxima diaria",
            value: formatHours(current.maxDayHours),
        },
        {
            label: "Jornada diurna",
            value: formatTimeRange(current.dayStart, current.dayEnd),
        },
        {
            label: "Jornada nocturna",
            value: formatTimeRange(current.nightStart, current.nightEnd),
        },
    ];

    return (
        <section
            aria-labelledby="jornada-vigente-titulo"
            className="rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm sm:p-6"
        >
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                <h4
                    id="jornada-vigente-titulo"
                    className="text-lg font-semibold text-primary"
                >
                    Valores vigentes
                </h4>
                <ValidityStatusBadge status={current.status} />
            </div>

            <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {values.map(({ label, value }) => (
                    <div key={label} className="space-y-1">
                        <dt className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                            {label}
                        </dt>
                        <dd className="text-lg font-semibold text-text">
                            {value}
                        </dd>
                    </div>
                ))}
            </dl>

            <p className="mt-4 text-sm text-text-muted">
                Vigente desde el {formatDateCO(current.validFrom)}
                {current.validTo
                    ? ` hasta el ${formatDateCO(current.validTo)}.`
                    : "."}
            </p>
        </section>
    );
}
