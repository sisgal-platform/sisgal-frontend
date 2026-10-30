import { useCallback, useEffect, useState } from "react";

import { asistenciaService } from "../services/asistenciaService";
import type { AsistenciaHoy } from "../interfaces/types";

/** Cada cuánto se vuelve a consultar la asistencia del día. */
export const INTERVALO_ACTUALIZACION_MS = 30_000;

/**
 * Asistencia del día actual. Se consulta al entrar, de forma automática cada
 * INTERVALO_ACTUALIZACION_MS mientras la pestaña del navegador está visible,
 * al volver a ella y cuando el administrador lo pide.
 */
export function useAsistenciaHoy() {
    const [version, setVersion] = useState(0);
    const [asistencia, setAsistencia] = useState<AsistenciaHoy | null>(null);
    const [actualizando, setActualizando] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelado = false;

        async function consultar() {
            setActualizando(true);

            try {
                const datos = await asistenciaService.consultarHoy();

                if (!cancelado) {
                    setAsistencia(datos);
                    setError(null);
                }
            } catch (error: unknown) {
                // Se conservan los datos de la última consulta exitosa.
                if (!cancelado) {
                    setError(
                        error instanceof Error
                            ? error.message
                            : "No fue posible consultar la asistencia del día.",
                    );
                }
            } finally {
                if (!cancelado) setActualizando(false);
            }
        }

        void consultar();

        return () => {
            cancelado = true;
        };
    }, [version]);

    const actualizar = useCallback(
        () => setVersion((actual) => actual + 1),
        [],
    );

    useEffect(() => {
        function actualizarSiEsVisible() {
            if (document.visibilityState === "visible") actualizar();
        }

        const intervalo = window.setInterval(
            actualizarSiEsVisible,
            INTERVALO_ACTUALIZACION_MS,
        );
        document.addEventListener("visibilitychange", actualizarSiEsVisible);

        return () => {
            window.clearInterval(intervalo);
            document.removeEventListener(
                "visibilitychange",
                actualizarSiEsVisible,
            );
        };
    }, [actualizar]);

    return {
        asistencia,
        /** Primera consulta en curso: todavía no hay datos que mostrar. */
        cargando: asistencia === null && error === null,
        actualizando,
        error,
        actualizar,
    };
}
