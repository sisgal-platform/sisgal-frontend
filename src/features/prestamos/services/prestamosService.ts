import apiClient from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

import type { PrestamosIndicadores } from "../interfaces/types";

export const prestamosService = {
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
