import { useCallback, useEffect, useState } from "react";

import { prestamosService } from "../services/prestamosService";
import type { PrestamosIndicadores } from "../interfaces/types";

type ResultadoIndicadores = {
    version: number;
    datos: PrestamosIndicadores | null;
    error: string | null;
};

export function usePrestamosIndicadores() {
    const [version, setVersion] = useState(0);
    const [resultado, setResultado] = useState<ResultadoIndicadores | null>(
        null,
    );

    useEffect(() => {
        let cancelado = false;

        prestamosService.obtenerIndicadores().then(
            (datos) => {
                if (!cancelado) {
                    setResultado({ version, datos, error: null });
                }
            },
            (error: unknown) => {
                if (!cancelado) {
                    setResultado({
                        version,
                        datos: null,
                        error:
                            error instanceof Error
                                ? error.message
                                : "No fue posible cargar los indicadores de préstamos.",
                    });
                }
            },
        );

        return () => {
            cancelado = true;
        };
    }, [version]);

    const recargar = useCallback(() => setVersion((actual) => actual + 1), []);
    const resultadoActual = resultado?.version === version;

    return {
        indicadores: resultado?.datos ?? null,
        cargando: !resultadoActual,
        error: resultadoActual ? resultado.error : null,
        recargar,
    };
}
