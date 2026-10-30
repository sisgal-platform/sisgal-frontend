import { formatDateCO } from "@/lib/formatters";

import { WORK_RATE_GROUPS } from "../constants/workRateTypes";
import type { WorkRate, WorkRateType } from "../interfaces/types";
import { formatMultiplier, formatSurcharge } from "../utils/format";

type CurrentWorkRatesCardProps = {
    /** Versión que rige hoy para cada tipo de hora; falta la de los tipos sin valor vigente. */
    current: Partial<Record<WorkRateType, WorkRate>>;
};

/** Recargo que rige hoy para cada tipo de hora y desde cuándo aplica. */
export function CurrentWorkRatesCard({ current }: CurrentWorkRatesCardProps) {
    return (
        <section
            aria-labelledby="recargos-vigentes-titulo"
            className="space-y-4 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm sm:p-6"
        >
            <div className="space-y-1">
                <h4
                    id="recargos-vigentes-titulo"
                    className="text-lg font-semibold text-primary"
                >
                    Valores vigentes
                </h4>
                <p className="text-sm text-text-muted">
                    El recargo es el porcentaje adicional sobre el valor de la
                    hora ordinaria; el factor es el multiplicador que usan los
                    cálculos.
                </p>
            </div>

            {Object.keys(current).length === 0 && (
                <p
                    role="status"
                    className="rounded-xl border border-warning bg-warning-light p-3 text-sm text-warning-dark"
                >
                    No hay recargos vigentes. Regístralos para que los cálculos
                    de asistencia y nómina puedan liquidar las horas
                    trabajadas.
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {WORK_RATE_GROUPS.map((group) => (
                    <div
                        key={group.id}
                        className="overflow-x-auto rounded-xl border border-gray-200"
                    >
                        <table className="w-full text-left text-sm">
                            <caption className="bg-secondary px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                                {group.label}
                            </caption>
                            <thead className="sr-only">
                                <tr>
                                    <th scope="col">Tipo de hora</th>
                                    <th scope="col">Recargo</th>
                                    <th scope="col">Factor</th>
                                    <th scope="col">Vigente desde</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {group.types.map(({ type, label }) => {
                                    const rate = current[type];

                                    return (
                                        <tr key={type}>
                                            <th
                                                scope="row"
                                                className="px-3 py-2 font-medium text-text"
                                            >
                                                {label}
                                            </th>
                                            {rate ? (
                                                <>
                                                    <td className="whitespace-nowrap px-3 py-2 font-semibold text-text">
                                                        {formatSurcharge(
                                                            rate.multiplier,
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-2 text-text-muted">
                                                        {formatMultiplier(
                                                            rate.multiplier,
                                                        )}
                                                    </td>
                                                    <td className="whitespace-nowrap px-3 py-2 text-text-muted">
                                                        Desde el{" "}
                                                        {formatDateCO(
                                                            rate.validFrom,
                                                        )}
                                                    </td>
                                                </>
                                            ) : (
                                                <td
                                                    colSpan={3}
                                                    className="px-3 py-2 text-warning-dark"
                                                >
                                                    Sin valor vigente
                                                </td>
                                            )}
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                ))}
            </div>
        </section>
    );
}
