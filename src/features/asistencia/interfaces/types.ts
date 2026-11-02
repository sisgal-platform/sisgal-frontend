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

export type TipoMarcacion = "ENTRADA" | "SALIDA";

export type MetodoMarcacion = "HUELLA" | "QR";

/** Espejo de LecturaSimuladaDto: lo que envía el lector simulado al colocar el dedo. */
export type LecturaSimulada = {
    /** false simula una falla del lector. */
    capturaExitosa: boolean;
    /** En el lector simulado, el documento de quien coloca el dedo. */
    huella?: string;
    /** Clave única de la lectura; un reintento con la misma clave no duplica la marcación. */
    idempotencyKey: string;
};

/** Espejo de MarcacionResponseDto; las fechas llegan serializadas como texto. */
export type Marcacion = {
    id: number;
    tipo: TipoMarcacion;
    metodo: MetodoMarcacion;
    /** Hora oficial de la marcación, asignada por el servidor. */
    fechaHora: string;
    empleadoId: number;
    empleadoNombre: string;
    sucursalId: number | null;
    sucursalNombre: string | null;
    registroAsistenciaId: number;
    entrada: string;
    /** null en una entrada. */
    salida: string | null;
    /** null en una entrada. */
    minutosTrabajados: number | null;
};
