import apiClient from "@/lib/axios"
import { toApiError } from "@/lib/apiError"

import type { DisabilityLeave, RegisterDisabilityLeavePayload } from "../interfaces/types"

export const disabilityLeavesService = {
    async registrar(payload: RegisterDisabilityLeavePayload): Promise<DisabilityLeave> {
        try {
            const { data } = await apiClient.post<DisabilityLeave>("/incapacidades", payload)
            return data
        } catch (error) {
            throw toApiError(error)
        }
    },
}
