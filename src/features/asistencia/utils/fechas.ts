import type { FiltrosHistorial } from "../interfaces/types";

/** Zona horaria de operación del restaurante. */
const ZONA_HORARIA = "America/Bogota";

export const FECHA_MINIMA = "1900-01-01";

const formateadorFechaISO = new Intl.DateTimeFormat("en-CA", {
    timeZone: ZONA_HORARIA,
});

const formateadorFecha = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: ZONA_HORARIA,
});

const formateadorHora = new Intl.DateTimeFormat("es-CO", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: ZONA_HORARIA,
});

const formateadorFechaLarga = new Intl.DateTimeFormat("es-CO", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
});

const formateadorFechaHora = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
    timeZone: ZONA_HORARIA,
});

/** Fecha de hoy (YYYY-MM-DD) en la zona horaria de operación. */
export function fechaActual(): string {
    return formateadorFechaISO.format(new Date());
}

/** Fecha de una marcación, p. ej. "15/09/2026". */
export function formatFechaMarcacion(valor: string): string {
    return formateadorFecha.format(new Date(valor));
}

/** Hora de una marcación, p. ej. "8:05 a. m.". */
export function formatHoraMarcacion(valor: string): string {
    // Intl separa con espacios duros; se normalizan a espacios simples.
    return formateadorHora.format(new Date(valor)).replace(/\s/g, " ");
}

/** Indica si dos marcaciones caen en días distintos (turnos que cruzan la medianoche). */
export function esOtroDia(entrada: string, salida: string): boolean {
    return (
        formateadorFechaISO.format(new Date(entrada)) !==
        formateadorFechaISO.format(new Date(salida))
    );
}

/** Tiempo trabajado legible, p. ej. 510 → "8 h 30 min". */
export function formatHorasTrabajadas(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    return `${horas} h ${String(resto).padStart(2, "0")} min`;
}

/**
 * Valida el rango de fechas del historial. Devuelve el mensaje que se le
 * muestra al administrador, o null cuando el rango es válido.
 */
export function validarRangoFechas(
    { fechaDesde, fechaHasta }: Pick<FiltrosHistorial, "fechaDesde" | "fechaHasta">,
    hoy: string = fechaActual(),
): string | null {
    // Las fechas tienen formato YYYY-MM-DD, por lo que se comparan como texto.
    if (fechaDesde && fechaDesde < FECHA_MINIMA) {
        return "La fecha inicial no puede ser anterior al 1 de enero de 1900.";
    }

    if (fechaHasta && fechaHasta > hoy) {
        return "La fecha final no puede ser posterior a la fecha actual.";
    }

    if (fechaDesde && fechaHasta && fechaDesde > fechaHasta) {
        return "El rango de fechas seleccionado no es válido: la fecha inicial no puede ser posterior a la fecha final.";
    }

    return null;
}

/** Día (YYYY-MM-DD) en texto, p. ej. "domingo, 4 de octubre de 2026". */
export function formatFechaLarga(fecha: string): string {
    // La fecha no tiene hora: se formatea en UTC para que no cambie de día.
    return formateadorFechaLarga.format(new Date(`${fecha}T00:00:00Z`));
}

/** Fecha y hora de una actualización, p. ej. "04/10/2026, 3:19:31 p. m.". */
export function formatFechaHoraActualizacion(valor: string): string {
    return formateadorFechaHora.format(new Date(valor)).replace(/\s/g, " ");
}
