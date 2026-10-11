import apiClient from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

import type { RegisterWorkRatesPayload, WorkRate } from "../interfaces/types";

const BASE_PATH = "/parametros-nomina/recargos";

/** Acceso al recurso de recargos laborales del sisgal-core-service (HU39). */
export const workRatesService = {
    /** Todas las versiones, por tipo de hora y de la más reciente a la más antigua. */
    async findAll(): Promise<WorkRate[]> {
        try {
            const { data } = await apiClient.get<WorkRate[]>(BASE_PATH);
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    /** Registra juntos los recargos que cambian; devuelve las versiones creadas. */
    async register(payload: RegisterWorkRatesPayload): Promise<WorkRate[]> {
        try {
            const { data } = await apiClient.post<WorkRate[]>(
                BASE_PATH,
                payload,
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },
};
