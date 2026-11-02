import apiClient from "@/lib/axios"
import { toApiError } from "@/lib/apiError"

import type {
    DisabilityLeave,
    DisabilityLeaveQuery,
    RegisterDisabilityLeavePayload,
    UpdateDisabilityLeavePayload,
} from "../interfaces/types"

export const disabilityLeavesService = {
    // Listado con filtros opcionales; sin query trae todos los registros
    async findAll(query: DisabilityLeaveQuery = {}): Promise<DisabilityLeave[]> {
        try {
            const { data } = await apiClient.get<DisabilityLeave[]>("/incapacidades", {
                params: query,
            })
            return data
        } catch (error) {
            throw toApiError(error)
        }
    },

    // Registra una incapacidad o licencia nueva
    async register(payload: RegisterDisabilityLeavePayload): Promise<DisabilityLeave> {
        try {
            const { data } = await apiClient.post<DisabilityLeave>("/incapacidades", payload)
            return data
        } catch (error) {
            throw toApiError(error)
        }
    },

    async update(id: number, payload: UpdateDisabilityLeavePayload): Promise<DisabilityLeave> {
        try {
            const { data } = await apiClient.patch<DisabilityLeave>(`/incapacidades/${id}`, payload)
            return data
        } catch (error) {
            throw toApiError(error)
        }
    },

    async remove(id: number): Promise<void> {
        try {
            await apiClient.delete(`/incapacidades/${id}`)
        } catch (error) {
            throw toApiError(error)
        }
    },
}
