/** Estado de una versión respecto a la fecha actual (`EstadoVigencia` en el backend). */
export type ValidityStatus = "VIGENTE" | "PROGRAMADA" | "HISTORICA";

/** Espejo de `WorkdayConfigResponseDto`: horas en HH:mm y fechas en YYYY-MM-DD. */
export type WorkdayConfig = {
    id: number;
    maxWeekHours: number;
    maxDayHours: number;
    dayStart: string;
    dayEnd: string;
    nightStart: string;
    nightEnd: string;
    validFrom: string;
    /** Es null mientras no se registre una versión posterior. */
    validTo: string | null;
    status: ValidityStatus;
};

/** Espejo de `RegisterWorkdayConfigDto`. */
export type RegisterWorkdayConfigPayload = {
    maxWeekHours: number;
    maxDayHours: number;
    dayStart: string;
    dayEnd: string;
    nightStart: string;
    nightEnd: string;
    validFrom: string;
};

/** Tipos de hora con multiplicador configurable (`WorkRateType` en el backend). */
export type WorkRateType =
    | "ORDINARIA_DIURNA"
    | "ORDINARIA_NOCTURNA"
    | "EXTRA_DIURNA"
    | "EXTRA_NOCTURNA"
    | "DOMINICAL_DIURNA"
    | "DOMINICAL_NOCTURNA"
    | "EXTRA_DOMINICAL_DIURNA"
    | "EXTRA_DOMINICAL_NOCTURNA";

/** Espejo de `WorkRateConfigResponseDto`: una versión del multiplicador de un tipo de hora. */
export type WorkRate = {
    id: number;
    type: WorkRateType;
    /** Factor sobre la hora ordinaria, p. ej. 1.25 para un recargo del 25 %. */
    multiplier: number;
    validFrom: string;
    /** Es null mientras no se registre una versión posterior del mismo tipo. */
    validTo: string | null;
    status: ValidityStatus;
};

/** Espejo de `WorkRateInputDto`. */
export type WorkRateInput = {
    type: WorkRateType;
    multiplier: number;
};

/** Espejo de `RegisterWorkRatesDto`: solo los tipos de hora que cambian. */
export type RegisterWorkRatesPayload = {
    validFrom: string;
    rates: WorkRateInput[];
};
