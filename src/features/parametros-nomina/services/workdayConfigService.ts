import apiClient from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

import type {
    RegisterWorkdayConfigPayload,
    WorkdayConfig,
} from "../interfaces/types";

const BASE_PATH = "/parametros-nomina/jornada-laboral";

/** Acceso al recurso de jornada laboral del sisgal-core-service (HU45). */
export const workdayConfigService = {
    /** Todas las versiones, de la más reciente a la más antigua. */
    async findAll(): Promise<WorkdayConfig[]> {
        try {
            const { data } = await apiClient.get<WorkdayConfig[]>(BASE_PATH);
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    async register(
        payload: RegisterWorkdayConfigPayload,
    ): Promise<WorkdayConfig> {
        try {
            const { data } = await apiClient.post<WorkdayConfig>(
                BASE_PATH,
                payload,
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },
};
