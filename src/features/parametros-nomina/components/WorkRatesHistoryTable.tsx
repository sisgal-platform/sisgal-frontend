import { useState } from "react";

import { formatDateCO } from "@/lib/formatters";

import { WORK_RATE_LABELS, WORK_RATE_TYPES } from "../constants/workRateTypes";
import type { WorkRate, WorkRateType } from "../interfaces/types";
import { formatMultiplier, formatSurcharge } from "../utils/format";
import { ValidityStatusBadge } from "./ValidityStatusBadge";

type WorkRatesHistoryTableProps = {
    /** Versiones por tipo de hora y, dentro de cada tipo, de la más reciente a la más antigua. */
    rates: WorkRate[];
    loading: boolean;
};

/** Historial de versiones de los recargos con su período de vigencia. */
export function WorkRatesHistoryTable({
    rates,
    loading,
}: WorkRatesHistoryTableProps) {
    const [typeFilter, setTypeFilter] = useState<WorkRateType | "">("");

    const visibleRates = typeFilter
        ? rates.filter((rate) => rate.type === typeFilter)
        : rates;

    return (
        <section aria-labelledby="recargos-historial-titulo" className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h4
                    id="recargos-historial-titulo"
                    className="text-lg font-semibold text-primary"
                >
                    Historial de versiones
                </h4>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="recargos-filtro-tipo"
                        className="text-sm font-medium text-text"
                    >
                        Tipo de hora
                    </label>
                    <select
                        id="recargos-filtro-tipo"
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(
                                event.target.value as WorkRateType | "",
                            )
                        }
                        className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                    >
                        <option value="">Todos</option>
                        {WORK_RATE_TYPES.map(({ type, label }) => (
                            <option key={type} value={type}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {visibleRates.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-text-muted">
                    {rates.length === 0
                        ? "Aún no hay versiones registradas de los recargos."
                        : "No hay versiones registradas para este tipo de hora."}
                </p>
            ) : (
                <div
                    className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
                    aria-busy={loading}
                >
                    <table className="w-full text-left text-sm sm:text-base">
                        <caption className="sr-only">
                            Historial de versiones de los recargos laborales
                        </caption>
                        <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                            <tr>
                                <th scope="col" className="px-4 py-3">
                                    Tipo de hora
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Recargo
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Factor
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Vigente desde
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Vigente hasta
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Estado
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {visibleRates.map((rate) => {
                                // Las versiones históricas se atenúan para distinguirlas de las vigentes.
                                const historical = rate.status === "HISTORICA";

                                return (
                                    <tr
                                        key={rate.id}
                                        className={
                                            historical
                                                ? "bg-surface-muted text-text-muted"
                                                : "text-text"
                                        }
                                    >
                                        <td
                                            className={`px-4 py-3 ${rate.status === "VIGENTE" ? "font-semibold" : ""}`}
                                        >
                                            {WORK_RATE_LABELS[rate.type] ??
                                                rate.type}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatSurcharge(rate.multiplier)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatMultiplier(rate.multiplier)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatDateCO(rate.validFrom)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {rate.validTo
                                                ? formatDateCO(rate.validTo)
                                                : "Indefinida"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ValidityStatusBadge
                                                status={rate.status}
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
