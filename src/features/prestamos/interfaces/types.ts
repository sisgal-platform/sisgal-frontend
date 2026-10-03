export type PrestamosIndicadores = {
    cantidadPrestamosActivos: number;
    montoTotalPrestamosActivos: number;
};

export type EstadoPrestamo = "ACTIVO" | "SALDADO" | "CANCELADO";

export type EmpleadoPrestamo = {
    id: number;
    firstName: string;
    lastName: string;
    documentType?: string;
    document: string;
};

/** Espejo de LoanResponseDto; las fechas llegan serializadas como texto. */
export type Prestamo = {
    id: number;
    employee: EmpleadoPrestamo;
    totalAmount: number;
    installmentAmount: number;
    totalInstallments: number;
    pendingInstallments: number;
    outstandingBalance: number;
    grantedAt: string;
    status: EstadoPrestamo;
    createdAt: string;
    updatedAt: string;
};

export type PrestamosQuery = {
    empleadoId?: number;
    nombreEmpleado?: string;
    documento?: string;
    estado?: EstadoPrestamo;
    fechaDesde?: string;
    fechaHasta?: string;
};

export type FiltrosPrestamos = {
    busqueda: string;
    estado: EstadoPrestamo | "";
    fechaDesde: string;
    fechaHasta: string;
};
