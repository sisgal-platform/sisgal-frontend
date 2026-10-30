import { useState } from "react"

import { useToast } from "@/toast"
import { disabilityLeavesService } from "../services/disabilityLeavesService"
import type { RegisterDisabilityLeavePayload } from "../interfaces/types"

export function useRegisterDisabilityLeave(onSuccess: () => void) {
    const { showToast } = useToast()
    const [submitting, setSubmitting] = useState(false)

    async function registerDisabilityLeave(payload: RegisterDisabilityLeavePayload) {
        setSubmitting(true)

        try {
            await disabilityLeavesService.register(payload)

            showToast("Incapacidad registrada correctamente.", "success")
            onSuccess()
        } catch (error) {
            // toApiError ya traduce el mensaje del backend (400/404/409) a texto legible
            showToast(
                error instanceof Error ? error.message : "No se pudo registrar la incapacidad.",
                "error",
            )
        } finally {
            setSubmitting(false)
        }
    }

    return { registerDisabilityLeave, submitting }
}
