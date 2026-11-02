import { useCallback, useEffect, useState } from "react";

import { asistenciaService } from "../services/asistenciaService";
import type {
    ConsultaHistorial,
    HistorialAsistencia,
} from "../interfaces/types";

/** Consulta una página del historial; se recarga si cambian los filtros o la paginación. */
export function useHistorialAsistencia(consulta: ConsultaHistorial) {
    const [version, setVersion] = useState(0);
    const [historial, setHistorial] = useState<HistorialAsistencia | null>(
        null,
    );
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            setCargando(true);
            setError(null);

            try {
                const datos = await asistenciaService.consultarHistorial({
                    empleadoId: consulta.empleadoId,
                    fechaDesde: consulta.fechaDesde,
                    fechaHasta: consulta.fechaHasta,
                    estado: consulta.estado,
                    pagina: consulta.pagina,
                    porPagina: consulta.porPagina,
                });

                if (!cancelado) setHistorial(datos);
            } catch (error: unknown) {
                if (!cancelado) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible cargar el historial de asistencia.",
                    );
                }
            } finally {
                if (!cancelado) setCargando(false);
            }
        }

        void cargar();

        return () => {
            cancelado = true;
        };
    }, [
        consulta.empleadoId,
        consulta.fechaDesde,
        consulta.fechaHasta,
        consulta.estado,
        consulta.pagina,
        consulta.porPagina,
        version,
    ]);

    const recargar = useCallback(() => setVersion((actual) => actual + 1), []);

    return { historial, cargando, error, recargar };
}
