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
