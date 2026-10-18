import { isAxiosError } from "axios"

import apiClient from "@/lib/axios"
import { ApiError, toApiError } from "@/lib/apiError"

import type { PayrollPeriod, PayrollPeriodDetail, PayrollPeriodQuery } from "../interfaces/types"

// Con responseType "blob", el cuerpo del error también llega como Blob (no
// como JSON), así que toApiError no puede leer el mensaje del backend ahí.
// Se lee el blob como texto para recuperar el mensaje real antes de caer al
// mensaje genérico.
async function toPdfApiError(error: unknown): Promise<ApiError> {
    if (isAxiosError(error) && error.response?.data instanceof Blob) {
        try {
            const texto = await error.response.data.text()
            const cuerpo: unknown = JSON.parse(texto)
            const message = (cuerpo as { message?: unknown })?.message
            if (typeof message === "string" && message) {
                return new ApiError(error.response.status, message)
            }
        } catch {
            // El cuerpo del error no era JSON legible; se usa el mensaje genérico.
        }
    }
    return toApiError(error)
}

export const payrollPeriodsService = {
    // Listado con filtros opcionales; sin query trae todas las liquidaciones
    async findAll(query: PayrollPeriodQuery = {}): Promise<PayrollPeriod[]> {
        try {
            const { data } = await apiClient.get<PayrollPeriod[]>(
                "/liquidaciones",
                {
                    params: query,
                },
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    // Detalle completo de una liquidación, con los conceptos devengados y las deducciones
    async findById(id: number): Promise<PayrollPeriodDetail> {
        try {
            const { data } = await apiClient.get<PayrollPeriodDetail>(
                `/liquidaciones/${id}`,
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    async generatePreliquidation(
        request: PayrollPreliquidationRequest,
    ): Promise<PayrollPreliquidation> {
        try {
            const { data } = await apiClient.post<PayrollPreliquidation>(
                "/nomina/generar",
                request,
            );
            return data;
        } catch (error) {
            throw toApiError(error);
        }
    },

    async confirmPreliquidation(
        request: PayrollPreliquidationRequest,
    ): Promise<void> {
        try {
            await apiClient.post("/liquidaciones", request);
        } catch (error) {
            throw toApiError(error);
        }
    },

    // Comprobante de pago en PDF; responseType "blob" porque la respuesta es binaria, no JSON
    async getPdf(id: number): Promise<Blob> {
        try {
            const { data } = await apiClient.get<Blob>(`/liquidaciones/${id}/pdf`, {
                responseType: "blob",
            })
            return data
        } catch (error) {
            throw await toPdfApiError(error)
        }
    },
}
