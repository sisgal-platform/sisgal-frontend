/** Espejo exacto de PayrollLineResponseDto (backend). */
export type PayrollLine = {
    conceptName: string;
    amount: number;
};

/** Espejo exacto de PayrollPeriodResponseDto (backend). */
export type PayrollPeriod = {
    id: number;
    employeeId: number;
    employeeName: string;
    periodStart: string;
    periodEnd: string;
    settlementDate: string;
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
    status: "Confirmada" | "Preliquidación";
};

/** Espejo exacto de WorkedHoursResponseDto (backend). */
export type PayrollWorkedHours = {
    type: string;
    label: string;
    hours: number;
};

/** Espejo exacto de PayrollPeriodDetailResponseDto (backend). */
export type PayrollPeriodDetail = PayrollPeriod & {
    employeeDocumentType: string;
    employeeDocument: string;
    employeePosition: string | null;
    earnings: PayrollLine[];
    deductions: PayrollLine[];
    workedHours: PayrollWorkedHours[];
};

/** Espejo exacto de ListPayrollPeriodQueryDto (backend). */
export type PayrollPeriodQuery = {
    employeeId?: number;
    periodStart?: string;
    periodEnd?: string;
};

/** Valores del formulario de filtros (siempre string, se convierten antes de consultar). */
export type PayrollPeriodFilterValues = {
    employeeId: string;
    periodStart: string;
    periodEnd: string;
};

export type PayrollPreliquidationRequest = {
    periodStart: string;
    periodEnd: string;
};

export type PayrollConfirmationRequest = PayrollPreliquidationRequest & {
    employeeId: number;
};

export type PayrollPreliquidation = PayrollPeriodDetail;

/** Espejo exacto de PayrollCalculationErrorResponseDto (backend). */
export type PayrollCalculationError = {
    employeeId: number;
    employeeName: string;
    employeeDocumentType: string;
    employeeDocument: string;
    causes: string[];
};

/** Espejo exacto de PayrollCalculationResponseDto (backend). */
export type PayrollCalculation = {
    periodStart: string;
    periodEnd: string;
    status: "COMPLETADO" | "CON_ERRORES";
    totalEmployees: number;
    totalEarnings: number;
    totalDeductions: number;
    totalNetPay: number;
    results: PayrollPreliquidation[];
    errors: PayrollCalculationError[];
};
