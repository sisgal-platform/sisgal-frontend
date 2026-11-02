import { useCallback, useEffect, useState } from "react";

import { workdayConfigService } from "../services/workdayConfigService";
import type { WorkdayConfig } from "../interfaces/types";

type Result = {
    /** Consulta que produjo el resultado; si no coincide con la actual, se está cargando. */
    version: number;
    versions: WorkdayConfig[];
    error: string | null;
};

/** Versiones de la jornada laboral; `reload` vuelve a consultarlas tras un cambio. */
export function useWorkdayConfig() {
    const [version, setVersion] = useState(0);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => {
        let cancelled = false;

        workdayConfigService.findAll().then(
            (versions) => {
                if (!cancelled) setResult({ version, versions, error: null });
            },
            (error: unknown) => {
                if (!cancelled) {
                    setResult({
                        version,
                        versions: [],
                        error: getErrorMessage(error),
                    });
                }
            },
        );

        return () => {
            cancelled = true;
        };
    }, [version]);

    const reload = useCallback(() => setVersion((current) => current + 1), []);

    return {
        versions: result?.versions ?? [],
        loading: result?.version !== version,
        error: result?.version === version ? result.error : null,
        reload,
    };
}

export function getErrorMessage(error: unknown): string {
    return error instanceof Error && error.message
        ? error.message
        : "Ocurrió un error inesperado. Intenta de nuevo.";
}
