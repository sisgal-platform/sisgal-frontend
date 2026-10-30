import apiClient, { integrationClient } from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

import type {
    AsistenciaHoy,
    ConsultaHistorial,
    HistorialAsistencia,
    HistorialAsistenciaQuery,
    LecturaSimulada,
    Marcacion,
} from "../interfaces/types";

function crearQueryHistorial(consulta: ConsultaHistorial): HistorialAsistenciaQuery {
    const query: HistorialAsistenciaQuery = {
        pagina: consulta.pagina,
        porPagina: consulta.porPagina,
    };

    if (consulta.empleadoId) query.empleadoId = Number(consulta.empleadoId);
    if (consulta.fechaDesde) query.fechaDesde = consulta.fechaDesde;
    if (consulta.fechaHasta) query.fechaHasta = consulta.fechaHasta;
    if (consulta.estado) query.estado = consulta.estado;

    return query;
}

export const asistenciaService = {
    async consultarHistorial(
        consulta: ConsultaHistorial,
    ): Promise<HistorialAsistencia> {
        try {
            const { data } = await apiClient.get<HistorialAsistencia>(
                "/asistencias/historial",
                { params: crearQueryHistorial(consulta) },
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    async consultarHoy(): Promise<AsistenciaHoy> {
        try {
            const { data } =
                await apiClient.get<AsistenciaHoy>("/asistencias/hoy");
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    /** Envía la lectura del lector de huella simulado; el backend decide si es entrada o salida. */
    async registrarMarcacionSimulada(
        lectura: LecturaSimulada,
    ): Promise<Marcacion> {
        try {
            const { data } = await integrationClient.post<Marcacion>(
                "/integracion/lector-simulado/marcaciones",
                lectura,
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },
};
