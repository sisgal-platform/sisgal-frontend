import { useState } from "react";

import { formatDateCO } from "@/lib/formatters";

import {
    LEGAL_DEDUCTION_LABELS,
    LEGAL_DEDUCTION_TYPES,
} from "../constants/legalDeductionTypes";
import type { LegalDeduction, LegalDeductionType } from "../interfaces/types";
import { formatPercentage } from "../utils/format";
import { ValidityStatusBadge } from "./ValidityStatusBadge";

type LegalDeductionsHistoryTableProps = {
    /** Versiones por descuento y, dentro de cada uno, de la más reciente a la más antigua. */
    deductions: LegalDeduction[];
    loading: boolean;
};

/** Historial de versiones de los descuentos legales con su período de vigencia. */
export function LegalDeductionsHistoryTable({
    deductions,
    loading,
}: LegalDeductionsHistoryTableProps) {
    const [typeFilter, setTypeFilter] = useState<LegalDeductionType | "">("");

    const visibleDeductions = typeFilter
        ? deductions.filter((deduction) => deduction.type === typeFilter)
        : deductions;

    return (
        <section
            aria-labelledby="descuentos-historial-titulo"
            className="space-y-3"
        >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <h4
                    id="descuentos-historial-titulo"
                    className="text-lg font-semibold text-primary"
                >
                    Historial de versiones
                </h4>

                <div className="flex items-center gap-2">
                    <label
                        htmlFor="descuentos-filtro-tipo"
                        className="text-sm font-medium text-text"
                    >
                        Descuento
                    </label>
                    <select
                        id="descuentos-filtro-tipo"
                        value={typeFilter}
                        onChange={(event) =>
                            setTypeFilter(
                                event.target.value as LegalDeductionType | "",
                            )
                        }
                        className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                    >
                        <option value="">Todos</option>
                        {LEGAL_DEDUCTION_TYPES.map(({ type, label }) => (
                            <option key={type} value={type}>
                                {label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {visibleDeductions.length === 0 ? (
                <p className="rounded-2xl bg-white p-6 text-text-muted">
                    {deductions.length === 0
                        ? "Aún no hay versiones registradas de los descuentos legales."
                        : "No hay versiones registradas para este descuento."}
                </p>
            ) : (
                <div
                    className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
                    aria-busy={loading}
                >
                    <table className="w-full text-left text-sm sm:text-base">
                        <caption className="sr-only">
                            Historial de versiones de los descuentos legales
                        </caption>
                        <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                            <tr>
                                <th scope="col" className="px-4 py-3">
                                    Descuento
                                </th>
                                <th scope="col" className="px-4 py-3">
                                    Porcentaje
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
                            {visibleDeductions.map((deduction) => {
                                // Las versiones históricas se atenúan para distinguirlas de las vigentes.
                                const historical =
                                    deduction.status === "HISTORICA";

                                return (
                                    <tr
                                        key={deduction.id}
                                        className={
                                            historical
                                                ? "bg-surface-muted text-text-muted"
                                                : "text-text"
                                        }
                                    >
                                        <td
                                            className={`px-4 py-3 ${deduction.status === "VIGENTE" ? "font-semibold" : ""}`}
                                        >
                                            {LEGAL_DEDUCTION_LABELS[
                                                deduction.type
                                            ] ?? deduction.type}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatPercentage(
                                                deduction.percentage,
                                            )}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {formatDateCO(deduction.validFrom)}
                                        </td>
                                        <td className="whitespace-nowrap px-4 py-3">
                                            {deduction.validTo
                                                ? formatDateCO(
                                                      deduction.validTo,
                                                  )
                                                : "Indefinida"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <ValidityStatusBadge
                                                status={deduction.status}
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
