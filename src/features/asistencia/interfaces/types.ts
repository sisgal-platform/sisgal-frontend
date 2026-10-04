export type EstadoRegistroAsistencia = "COMPLETO" | "INCOMPLETO";

export type EmpleadoAsistencia = {
    id: number;
    firstName: string;
    lastName: string;
    documentType: string;
    document: string;
};

/** Espejo de AttendanceHistoryItemDto; las fechas llegan serializadas como texto. */
export type RegistroAsistencia = {
    id: number;
    employee: EmpleadoAsistencia;
    branchId: number | null;
    branchName: string | null;
    checkIn: string;
    /** null en un registro incompleto. */
    checkOut: string | null;
    /** null en un registro incompleto: no se calculan sus horas. */
    workedMinutes: number | null;
    status: EstadoRegistroAsistencia;
};

/** Espejo de AttendanceHistoryResponseDto. */
export type HistorialAsistencia = {
    data: RegistroAsistencia[];
    total: number;
    pagina: number;
    porPagina: number;
    totalPaginas: number;
};

export type ResultadosPorPagina = 10 | 25 | 50;

/** Valores del formulario de filtros; vacío significa "sin filtro". */
export type FiltrosHistorial = {
    empleadoId: string;
    fechaDesde: string;
    fechaHasta: string;
    estado: EstadoRegistroAsistencia | "";
};

export type ConsultaHistorial = FiltrosHistorial & {
    pagina: number;
    porPagina: ResultadosPorPagina;
};

/** Espejo de HistorialAsistenciaQueryDto. */
export type HistorialAsistenciaQuery = {
    empleadoId?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    estado?: EstadoRegistroAsistencia;
    pagina: number;
    porPagina: ResultadosPorPagina;
};

export type EstadoAsistenciaHoy = "PRESENTE" | "AUSENTE";

/** Espejo de AttendanceTodayEmployeeDto. */
export type EmpleadoAsistenciaHoy = {
    employeeId: number;
    firstName: string;
    lastName: string;
    positionName: string | null;
    branchName: string | null;
    /** Primera entrada del día; null si el empleado está ausente. */
    checkIn: string | null;
    status: EstadoAsistenciaHoy;
};

/** Espejo de AttendanceTodayResponseDto. */
export type AsistenciaHoy = {
    /** Día consultado (YYYY-MM-DD). */
    fecha: string;
    /** Fecha y hora en que el backend generó la información. */
    actualizadoEn: string;
    totalEmpleados: number;
    presentes: number;
    ausentes: number;
    data: EmpleadoAsistenciaHoy[];
};
