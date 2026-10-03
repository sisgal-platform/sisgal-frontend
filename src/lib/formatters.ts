const formateadorMonedaCOP = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
});

const formateadorNumeroCO = new Intl.NumberFormat("es-CO");

const formateadorFechaCO = new Intl.DateTimeFormat("es-CO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
});

export function formatCurrencyCOP(value: number) {
    return formateadorMonedaCOP.format(value);
}

export function formatNumberCO(value: number) {
    return formateadorNumeroCO.format(value);
}

export function formatDateCO(value: string | Date | null | undefined) {
    if (!value) return "—";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "—";

    return formateadorFechaCO.format(date);
}

export function dateToInputValue(value: string | Date | null | undefined) {
    if (!value) return "";

    const date = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(date.getTime())) return "";

    return date.toISOString().slice(0, 10);
}
