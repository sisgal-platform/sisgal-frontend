import type { WorkRateType } from "../interfaces/types";

export type WorkRateTypeOption = {
    type: WorkRateType;
    label: string;
};

export type WorkRateGroup = {
    id: string;
    label: string;
    types: readonly WorkRateTypeOption[];
};

/** Tipos de hora en el orden en que se presentan, agrupados para facilitar su lectura. */
export const WORK_RATE_GROUPS: readonly WorkRateGroup[] = [
    {
        id: "ordinarias-extra",
        label: "Horas ordinarias y extra",
        types: [
            { type: "ORDINARIA_DIURNA", label: "Ordinaria diurna" },
            { type: "ORDINARIA_NOCTURNA", label: "Ordinaria nocturna" },
            { type: "EXTRA_DIURNA", label: "Extra diurna" },
            { type: "EXTRA_NOCTURNA", label: "Extra nocturna" },
        ],
    },
    {
        id: "dominicales-festivos",
        label: "Dominicales y festivos",
        types: [
            { type: "DOMINICAL_DIURNA", label: "Dominical o festiva diurna" },
            {
                type: "DOMINICAL_NOCTURNA",
                label: "Dominical o festiva nocturna",
            },
            {
                type: "EXTRA_DOMINICAL_DIURNA",
                label: "Extra dominical o festiva diurna",
            },
            {
                type: "EXTRA_DOMINICAL_NOCTURNA",
                label: "Extra dominical o festiva nocturna",
            },
        ],
    },
];

export const WORK_RATE_TYPES: readonly WorkRateTypeOption[] =
    WORK_RATE_GROUPS.flatMap((group) => group.types);

export const WORK_RATE_LABELS = Object.fromEntries(
    WORK_RATE_TYPES.map(({ type, label }) => [type, label]),
) as Record<WorkRateType, string>;
