export type PrestamosIndicadores = {
    cantidadPrestamosActivos: number;
    montoTotalPrestamosActivos: number;
};

export type EstadoPrestamo = "ACTIVO" | "PAGADO" | "VENCIDO" | "CANCELADO";

export type PrestamoFila = {
    id: number;
    empleadoNombre: string;
    tipoDocumento: string;
    numeroDocumento: string;
    estado: string;
    montoTotal: number;
    cuota: number;
    saldoPendiente: number;
    ultimaActualizacion: string;
};

export type FiltrosPrestamos = {
    busqueda: string;
    estado: EstadoPrestamo | "";
    fecha: string;
};
