import { useCallback, useEffect, useState } from "react";

import { legalDeductionsService } from "../services/legalDeductionsService";
import type { LegalDeduction } from "../interfaces/types";
import { getErrorMessage } from "./useWorkdayConfig";

type Result = {
    /** Consulta que produjo el resultado; si no coincide con la actual, se está cargando. */
    version: number;
    deductions: LegalDeduction[];
    error: string | null;
};

/** Versiones de los descuentos legales; `reload` vuelve a consultarlas tras un cambio. */
export function useLegalDeductions() {
    const [version, setVersion] = useState(0);
    const [result, setResult] = useState<Result | null>(null);

    useEffect(() => {
        let cancelled = false;

        legalDeductionsService.findAll().then(
            (deductions) => {
                if (!cancelled) {
                    setResult({ version, deductions, error: null });
                }
            },
            (error: unknown) => {
                if (!cancelled) {
                    setResult({
                        version,
                        deductions: [],
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
        deductions: result?.deductions ?? [],
        loading: result?.version !== version,
        error: result?.version === version ? result.error : null,
        reload,
    };
}
