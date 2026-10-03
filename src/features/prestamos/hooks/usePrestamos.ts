import { useCallback, useEffect, useState } from "react";

import { prestamosService } from "../services/prestamosService";
import type { FiltrosPrestamos, Prestamo } from "../interfaces/types";

export function usePrestamos(filtros: FiltrosPrestamos) {
    const [version, setVersion] = useState(0);
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
    const [cargando, setCargando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelado = false;

        async function cargar() {
            setCargando(true);
            setError(null);

            try {
                const datos = await prestamosService.obtenerTodos({
                    busqueda: filtros.busqueda,
                    estado: filtros.estado,
                    fechaDesde: filtros.fechaDesde,
                    fechaHasta: filtros.fechaHasta,
                });

                if (!cancelado) setPrestamos(datos);
            } catch (error: unknown) {
                if (!cancelado) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible cargar los préstamos.",
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
        filtros.busqueda,
        filtros.estado,
        filtros.fechaDesde,
        filtros.fechaHasta,
        version,
    ]);

    const recargar = useCallback(() => setVersion((actual) => actual + 1), []);

    return { prestamos, cargando, error, recargar };
}
