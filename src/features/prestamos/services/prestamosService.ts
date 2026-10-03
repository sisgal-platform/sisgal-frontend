import apiClient from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

import type {
    FiltrosPrestamos,
    Prestamo,
    PrestamosIndicadores,
    PrestamosQuery,
} from "../interfaces/types";

export function normalizarRangoFechas({
    fechaDesde,
    fechaHasta,
}: Pick<FiltrosPrestamos, "fechaDesde" | "fechaHasta">) {
    if (!fechaDesde && !fechaHasta) {
        return { fechaDesde: "", fechaHasta: "" };
    }

    if (!fechaDesde) {
        return { fechaDesde: "", fechaHasta };
    }

    if (!fechaHasta) {
        return { fechaDesde, fechaHasta: "" };
    }

    if (fechaDesde <= fechaHasta) {
        return { fechaDesde, fechaHasta };
    }

    return { fechaDesde: fechaHasta, fechaHasta: fechaDesde };
}

function crearQueryPrestamos(filtros: FiltrosPrestamos): PrestamosQuery {
    const busqueda = filtros.busqueda.trim();
    const query: PrestamosQuery = {};
    const rango = normalizarRangoFechas(filtros);

    if (busqueda) {
        if (/^\d+$/.test(busqueda)) {
            query.documento = busqueda;
        } else {
            query.nombreEmpleado = busqueda;
        }
    }

    if (filtros.estado) query.estado = filtros.estado;

    if (rango.fechaDesde || rango.fechaHasta) {
        if (rango.fechaDesde) query.fechaDesde = rango.fechaDesde;
        if (rango.fechaHasta) query.fechaHasta = rango.fechaHasta;
    }

    return query;
}

export const prestamosService = {
    async obtenerTodos(filtros: FiltrosPrestamos): Promise<Prestamo[]> {
        try {
            const { data } = await apiClient.get<Prestamo[]>("/prestamos", {
                params: crearQueryPrestamos(filtros),
            });
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    async obtenerIndicadores(): Promise<PrestamosIndicadores> {
        try {
            const { data } = await apiClient.get<PrestamosIndicadores>(
                "/prestamos/indicadores",
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },
};
