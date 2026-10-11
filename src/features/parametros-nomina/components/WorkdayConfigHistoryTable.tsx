import { formatDateCO } from "@/lib/formatters";

import type { WorkdayConfig } from "../interfaces/types";
import { formatHours, formatTimeRange } from "../utils/format";
import { ValidityStatusBadge } from "./ValidityStatusBadge";

type WorkdayConfigHistoryTableProps = {
    /** Versiones de la más reciente a la más antigua. */
    versions: WorkdayConfig[];
    loading: boolean;
};

/** Historial de versiones de la jornada laboral con su período de vigencia. */
export function WorkdayConfigHistoryTable({
    versions,
    loading,
}: WorkdayConfigHistoryTableProps) {
    return (
        <section aria-labelledby="jornada-historial-titulo" className="space-y-3">
            <h4
                id="jornada-historial-titulo"
                className="text-lg font-semibold text-primary"
            >
                Historial de versiones
            </h4>

            {versions.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-text-muted">
                    Aún no hay versiones registradas de la jornada laboral.
                </p>
            ) : (
                <div
                    className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
                    aria-busy={loading}
                >
                    <table className="w-full text-left text-sm sm:text-base">
                        <caption className="sr-only">
                            Historial de versiones de la jornada laboral
                        </caption>
                        <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                            <tr>
                                <th scope="col" className="px-4 py-3">
                                    Vigente desde
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Vigente hasta
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Semanal
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Diaria
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Jornada diurna
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Jornada nocturna
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {versions.map((version) => {
                                // Las versiones históricas se atenúan para distinguirlas de la vigente.
                                const historical =
                                    version.status === "HISTORICA";

                                return (
                                    <tr
                                        key={version.id}
                                        className={
                                            historical
                                                ? "bg-surface-muted text-text-muted"
                                                : "text-text"
                                        }
                                    >
                                        <td
                                            className={`whitespace-nowrap px-4 py-3 ${version.status === "VIGENTE" ? "font-semibold" : ""}`}
                                        >
                                            {formatDateCO(version.validFrom)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {version.validTo
                                                ? formatDateCO(version.validTo)
                                                : "Indefinida"}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatHours(version.maxWeekHours)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatHours(version.maxDayHours)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatTimeRange(
                                                version.dayStart,
                                                version.dayEnd,
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatTimeRange(
                                                version.nightStart,
                                                version.nightEnd,
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ValidityStatusBadge
                                                status={version.status}
                                            />
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </section>
    );
}
