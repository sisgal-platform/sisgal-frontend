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
