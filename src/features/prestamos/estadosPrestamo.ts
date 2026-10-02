import type { EstadoPrestamo } from "./interfaces/types";

type ConfiguracionEstadoPrestamo = {
    value: EstadoPrestamo;
    label: string;
    badgeClassName: string;
};

export const ESTADOS_PRESTAMO: ConfiguracionEstadoPrestamo[] = [
    {
        value: "ACTIVO",
        label: "Activo",
        badgeClassName: "bg-success-light text-success-dark",
    },
    {
        value: "PAGADO",
        label: "Pagado",
        badgeClassName: "bg-secondary-dark text-text-muted",
    },
    {
        value: "VENCIDO",
        label: "Vencido",
        badgeClassName: "bg-error-light text-error",
    },
    {
        value: "CANCELADO",
        label: "Cancelado",
        badgeClassName: "bg-secondary-dark text-text-muted",
    },
];

const ESTADO_DESCONOCIDO = {
    label: "Sin estado",
    badgeClassName: "bg-secondary-dark text-text-muted",
};

export function obtenerConfiguracionEstadoPrestamo(estado: string) {
    return (
        ESTADOS_PRESTAMO.find((opcion) => opcion.value === estado) ?? {
            ...ESTADO_DESCONOCIDO,
            label: estado || ESTADO_DESCONOCIDO.label,
        }
    );
}
