/** Hora HH:mm en formato de 12 horas, p. ej. "21:00" → "9:00 p. m.". */
export function formatTime(value: string): string {
    const [hours, minutes] = value.split(":").map(Number);
    const period = hours < 12 ? "a. m." : "p. m.";
    const hour12 = hours % 12 === 0 ? 12 : hours % 12;

    return `${hour12}:${String(minutes).padStart(2, "0")} ${period}`;
}

/** Franja horaria, p. ej. "6:00 a. m. – 9:00 p. m.". */
export function formatTimeRange(start: string, end: string): string {
    return `${formatTime(start)} – ${formatTime(end)}`;
}

export function formatHours(value: number): string {
    return value === 1 ? "1 hora" : `${value} horas`;
}

/** Día calendario (YYYY-MM-DD) desplazado la cantidad de días indicada. */
export function shiftDate(date: string, days: number): string {
    // La fecha no tiene hora: se opera en UTC para que no cambie de día.
    const calendar = new Date(`${date}T12:00:00Z`);
    calendar.setUTCDate(calendar.getUTCDate() + days);

    return calendar.toISOString().slice(0, 10);
}

/** Recargo sobre la hora ordinaria que representa un multiplicador, p. ej. 1.25 → 25. */
export function multiplierToPercent(multiplier: number): number {
    return Math.round((multiplier - 1) * 100);
}

/** Multiplicador de dos decimales para un recargo en porcentaje, p. ej. 25 → 1.25. */
export function percentToMultiplier(percent: number): number {
    return Number((1 + percent / 100).toFixed(2));
}

/** Recargo legible, p. ej. 1.25 → "25 %". */
export function formatSurcharge(multiplier: number): string {
    return `${multiplierToPercent(multiplier)} %`;
}

const multiplierFormatter = new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

/** Factor legible, p. ej. 1.25 → "× 1,25". */
export function formatMultiplier(multiplier: number): string {
    return `× ${multiplierFormatter.format(multiplier)}`;
}

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

/** Indica si el texto es una fecha YYYY-MM-DD que existe en el calendario. */
export function isValidDate(value: string): boolean {
    if (!DATE_PATTERN.test(value)) return false;

    const date = new Date(`${value}T00:00:00Z`);

    // Descarta fechas que no existen en el calendario, como el 30 de febrero.
    return (
        !Number.isNaN(date.getTime()) &&
        date.toISOString().slice(0, 10) === value
    );
}
