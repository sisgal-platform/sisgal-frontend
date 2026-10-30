/** Espejo del enum DisabilityType del backend. */
export type DisabilityType =
    | "Enfermedad general"
    | "Accidente de trabajo"
    | "Licencia de maternidad"
    | "Licencia de paternidad"
    | "Otros";

export const DISABILITY_TYPES: DisabilityType[] = [
    "Enfermedad general",
    "Accidente de trabajo",
    "Licencia de maternidad",
    "Licencia de paternidad",
    "Otros",
];

/** Espejo del campo "status" calculado por el backend (no es un valor almacenado). */
export type DisabilityStatus = "Activo" | "Finalizado";

/** Espejo exacto de DisabilityLeaveResponseDto (backend). */
export type DisabilityLeave = {
    id: number;
    employeeId: number;
    employeeName: string;
    documentType: string;
    document: string;
    position: string | null;
    type: DisabilityType;
    otherTypeDescription: string | null;
    startDate: string;
    endDate: string;
    totalDays: number;
    status: DisabilityStatus;
};

/** Espejo exacto de DisabilityLeaveIndicatorsResponseDto (backend). */
export type DisabilityLeaveIndicators = {
    activeCount: number;
    totalActiveDays: number;
};

/** Espejo exacto de ListDisabilityLeaveQueryDto (backend). */
export type DisabilityLeaveQuery = {
    employeeId?: number;
    employeeName?: string;
    document?: string;
    positionId?: number;
    status?: DisabilityStatus;
    startDate?: string;
    endDate?: string;
};

/** Valores del formulario de filtros (siempre string, se convierten antes de consultar). */
export type DisabilityLeaveFilterValues = {
    employeeId: string;
    positionId: string;
    status: DisabilityStatus | "";
    startDate: string;
    endDate: string;
};

/** Espejo exacto de RegisterDisabilityLeaveDto (backend). */
export type RegisterDisabilityLeavePayload = {
    employeeId: number;
    type: DisabilityType;
    otherTypeDescription?: string;
    startDate: string;
    endDate: string;
};
