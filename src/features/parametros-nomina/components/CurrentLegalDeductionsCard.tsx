import { formatDateCO } from "@/lib/formatters";

import { LEGAL_DEDUCTION_TYPES } from "../constants/legalDeductionTypes";
import type { LegalDeduction, LegalDeductionType } from "../interfaces/types";
import { formatPercentage } from "../utils/format";

type CurrentLegalDeductionsCardProps = {
    /** Versión que rige hoy para cada descuento; falta la de los descuentos sin valor vigente. */
    current: Partial<Record<LegalDeductionType, LegalDeduction>>;
};

/** Porcentaje que rige hoy para cada descuento legal y desde cuándo aplica. */
export function CurrentLegalDeductionsCard({
    current,
}: CurrentLegalDeductionsCardProps) {
    return (
        <section
            aria-labelledby="descuentos-vigentes-titulo"
            className="space-y-4 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm sm:p-6"
        >
            <div className="space-y-1">
                <h4
                    id="descuentos-vigentes-titulo"
                    className="text-lg font-semibold text-primary"
                >
                    Valores vigentes
                </h4>
                <p className="text-sm text-text-muted">
                    El porcentaje se aplica sobre la base de cotización del
                    empleado en cada liquidación.
                </p>
            </div>

            {Object.keys(current).length === 0 && (
                <p
                    role="status"
                    className="rounded-xl border border-warning bg-warning-light p-3 text-sm text-warning-dark"
                >
                    No hay descuentos legales vigentes. Regístralos para que
                    la nómina pueda calcular las deducciones de salud y
                    pensión.
                </p>
            )}

            <div className="overflow-x-auto rounded-xl border border-gray-200">
                <table className="w-full text-left text-sm">
                    <caption className="bg-secondary px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                        Aportes a cargo del empleado
                    </caption>
                    <thead className="sr-only">
                        <tr>
                            <th scope="col">Descuento</th>
                            <th scope="col">Porcentaje</th>
                            <th scope="col">Vigente desde</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {LEGAL_DEDUCTION_TYPES.map(({ type, label }) => {
                            const deduction = current[type];

                            return (
                                <tr key={type}>
                                    <th
                                        scope="row"
                                        className="px-3 py-2 font-medium text-text"
                                    >
                                        {label}
                                    </th>
                                    {deduction ? (
                                        <>
                                            <td className="whitespace-nowrap px-3 py-2 font-semibold text-text">
                                                {formatPercentage(
                                                    deduction.percentage,
                                                )}
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-2 text-text-muted">
                                                Desde el{" "}
                                                {formatDateCO(
                                                    deduction.validFrom,
                                                )}
                                            </td>
                                        </>
                                    ) : (
                                        <td
                                            colSpan={2}
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
        </section>
    );
}
