import apiClient from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

import type {
    FiltrosPrestamos,
    CrearPrestamoPayload,
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

    if (filtros.empleadoId) {
        query.empleadoId = filtros.empleadoId;
    } else if (busqueda) {
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
    async obtenerPorId(id: number): Promise<Prestamo> {
        try {
            const { data } = await apiClient.get<Prestamo>(`/prestamos/${id}`);
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    async crear(payload: CrearPrestamoPayload): Promise<Prestamo> {
        try {
            const { data } = await apiClient.post<Prestamo>(
                "/prestamos",
                payload,
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

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
