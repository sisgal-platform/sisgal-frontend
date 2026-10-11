import apiClient from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

import type {
    LegalDeduction,
    RegisterLegalDeductionsPayload,
} from "../interfaces/types";

const BASE_PATH = "/parametros-nomina/descuentos-legales";

/** Acceso al recurso de descuentos legales del sisgal-core-service (HU37). */
export const legalDeductionsService = {
    /** Todas las versiones, por descuento y de la más reciente a la más antigua. */
    async findAll(): Promise<LegalDeduction[]> {
        try {
            const { data } = await apiClient.get<LegalDeduction[]>(BASE_PATH);
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    /** Registra juntos los descuentos que cambian; devuelve las versiones creadas. */
    async register(
        payload: RegisterLegalDeductionsPayload,
    ): Promise<LegalDeduction[]> {
        try {
            const { data } = await apiClient.post<LegalDeduction[]>(
                BASE_PATH,
                payload,
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },
};
