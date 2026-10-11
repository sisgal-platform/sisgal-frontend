import apiClient from "@/lib/axios"
import { toApiError } from "@/lib/apiError"

import type { PayrollPeriod, PayrollPeriodDetail, PayrollPeriodQuery } from "../interfaces/types"

export const payrollPeriodsService = {
    // Listado con filtros opcionales; sin query trae todas las liquidaciones
    async findAll(query: PayrollPeriodQuery = {}): Promise<PayrollPeriod[]> {
        try {
            const { data } = await apiClient.get<PayrollPeriod[]>("/liquidaciones", {
                params: query,
            })
            return data
        } catch (error) {
            throw toApiError(error)
        }
    },

    // Detalle completo de una liquidación, con los conceptos devengados y las deducciones
    async findById(id: number): Promise<PayrollPeriodDetail> {
        try {
            const { data } = await apiClient.get<PayrollPeriodDetail>(`/liquidaciones/${id}`)
            return data
        } catch (error) {
            throw toApiError(error)
        }
    },
}
