import { useCallback, useState } from "react";

import { ApiError } from "@/lib/apiError";

import type { LecturaSimulada, Marcacion } from "../interfaces/types";
import { asistenciaService } from "../services/asistenciaService";

/** Lo que tarda el lector simulado en "leer" la huella, para que se perciba la lectura. */
export const DURACION_LECTURA_MS = 900;

export type EstadoLector =
    | { fase: "esperando" }
    | { fase: "leyendo" }
    | { fase: "registrada"; marcacion: Marcacion }
    | { fase: "rechazada"; mensaje: string };

const esperar = (milisegundos: number) =>
    new Promise<void>((resolve) => setTimeout(resolve, milisegundos));

/**
 * Los rechazos de negocio traen su mensaje del backend; un error interno trae
 * el genérico de NestJS en inglés, así que se reemplaza por uno en español.
 * El 503 es la falla del lector y conserva "Error en lectura biométrica".
 */
function mensajeDeRechazo(error: unknown): string {
    if (!(error instanceof ApiError)) {
        return "Error en lectura biométrica";
    }

    if (error.status >= 500 && error.status !== 503) {
        return "No fue posible registrar la marcación. Intenta de nuevo.";
    }

    return error.message;
}

/**
 * Estado de la pantalla del lector de huella simulado. Cada vez que se coloca
 * el dedo es una lectura nueva, con su propia clave de idempotencia.
 */
export function useLectorSimulado(duracionLecturaMs = DURACION_LECTURA_MS) {
    const [estado, setEstado] = useState<EstadoLector>({ fase: "esperando" });

    const colocarDedo = useCallback(
        async (lectura: Omit<LecturaSimulada, "idempotencyKey">) => {
            setEstado({ fase: "leyendo" });

            const [resultado] = await Promise.allSettled([
                asistenciaService.registrarMarcacionSimulada({
                    ...lectura,
                    idempotencyKey: crypto.randomUUID(),
                }),
                esperar(duracionLecturaMs),
            ]);

            if (resultado.status === "fulfilled") {
                setEstado({ fase: "registrada", marcacion: resultado.value });
                return;
            }

            setEstado({
                fase: "rechazada",
                mensaje: mensajeDeRechazo(resultado.reason),
            });
        },
        [duracionLecturaMs],
    );

    return { estado, colocarDedo };
}
