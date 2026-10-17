import apiClient from "@/lib/axios"
import { toApiError } from "@/lib/apiError"

import type { DashboardIndicators, DashboardIndicatorsQuery } from "../interfaces/types"

export const dashboardIndicatorsService = {
    async getIndicators(query: DashboardIndicatorsQuery = {}): Promise<DashboardIndicators> {
        try {
            const { data } = await apiClient.get<DashboardIndicators>("/dashboard/indicadores", {
                params: query,
            })
            return data
        } catch (error) {
            throw toApiError(error)
        }
    },
}
