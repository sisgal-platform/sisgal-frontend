import { useCallback, useEffect, useState } from "react";

import { workRatesService } from "../services/workRatesService";
import type { WorkRate } from "../interfaces/types";
import { getErrorMessage } from "./useWorkdayConfig";

type Result = {
    /** Consulta que produjo el resultado; si no coincide con la actual, se está cargando. */
    version: number;
    rates: WorkRate[];
    error: string | null;
};

/** Versiones de los recargos laborales; `reload` vuelve a consultarlas tras un cambio. */
export function useWorkRates() {
    const [version, setVersion] = useState(0);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => {
        let cancelled = false;

        workRatesService.findAll().then(
            (rates) => {
                if (!cancelled) setResult({ version, rates, error: null });
            },
            (error: unknown) => {
                if (!cancelled) {
                    setResult({
                        version,
                        rates: [],
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
        rates: result?.rates ?? [],
        loading: result?.version !== version,
        error: result?.version === version ? result.error : null,
        reload,
    };
}
