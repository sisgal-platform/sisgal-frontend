import type { PeriodicidadPrestamo } from "./interfaces/types";

type ConfiguracionPeriodicidadPrestamo = {
    value: PeriodicidadPrestamo;
    label: string;
    descripcion: string;
};

export const PERIODICIDADES_PRESTAMO: ConfiguracionPeriodicidadPrestamo[] = [
    {
        value: "MENSUAL",
        label: "Mensual",
        descripcion: "Se descuenta una cuota el último día de cada mes.",
    },
    {
        value: "QUINCENAL",
        label: "Quincenal",
        descripcion:
            "Se descuenta una cuota el día 15 y otra el último día de cada mes.",
    },
];

export function obtenerEtiquetaPeriodicidadPrestamo(periodicidad: string) {
    return (
        PERIODICIDADES_PRESTAMO.find((opcion) => opcion.value === periodicidad)
            ?.label ??
        (periodicidad || "Sin periodicidad")
    );
}
