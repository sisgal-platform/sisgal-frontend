import type { LegalDeductionType } from "../interfaces/types";

export type LegalDeductionTypeOption = {
    type: LegalDeductionType;
    label: string;
};

/** Descuentos legales a cargo del empleado, en el orden en que se presentan. */
export const LEGAL_DEDUCTION_TYPES: readonly LegalDeductionTypeOption[] = [
    { type: "HEALTH_RATE", label: "Salud" },
    { type: "PENSION_RATE", label: "Pensión" },
];

export const LEGAL_DEDUCTION_LABELS = Object.fromEntries(
    LEGAL_DEDUCTION_TYPES.map(({ type, label }) => [type, label]),
) as Record<LegalDeductionType, string>;
