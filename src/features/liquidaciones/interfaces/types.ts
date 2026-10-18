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
    status: "Confirmada";
};

/** Espejo exacto de PayrollPeriodDetailResponseDto (backend). */
export type PayrollPeriodDetail = PayrollPeriod & {
    employeeDocumentType: string;
    employeeDocument: string;
    employeePosition: string | null;
    earnings: PayrollLine[];
    deductions: PayrollLine[];
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

export type PayrollPreliquidationRequest = Pick<
    PayrollPeriodQuery,
    "periodStart" | "periodEnd"
> & {
    employeeId: number;
    periodStart: string;
    periodEnd: string;
};

export type PayrollPreliquidationHour = {
    type: string;
    hours: number;
};

export type PayrollPreliquidationEmployee = {
    employeeId: number;
    employeeName: string;
    employeeDocumentType: string;
    employeeDocument: string;
    employeePosition: string | null;
    hours: PayrollPreliquidationHour[];
    surcharges: PayrollLine[];
    earnings: PayrollLine[];
    deductions: PayrollLine[];
    totalEarnings: number;
    totalDeductions: number;
    netPay: number;
    inconsistencies: string[];
};

export type PayrollPreliquidation = {
    periodStart: string;
    periodEnd: string;
    employees: PayrollPreliquidationEmployee[];
};
