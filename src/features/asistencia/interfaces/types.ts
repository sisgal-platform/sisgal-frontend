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
