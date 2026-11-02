import { useState } from "react"

import { useToast } from "@/toast"
import { disabilityLeavesService } from "../services/disabilityLeavesService"
import type { UpdateDisabilityLeavePayload } from "../interfaces/types"

export function useUpdateDisabilityLeave(onSuccess: () => void) {
    const { showToast } = useToast()
    const [submitting, setSubmitting] = useState(false)

    async function updateDisabilityLeave(id: number, payload: UpdateDisabilityLeavePayload) {
        setSubmitting(true)

        try {
            await disabilityLeavesService.update(id, payload)

            showToast("Incapacidad actualizada correctamente.", "success")
            onSuccess()
        } catch (error) {
            showToast(
                error instanceof Error ? error.message : "No se pudo actualizar la incapacidad.",
                "error",
            )
        } finally {
            setSubmitting(false)
        }
    }

    return { updateDisabilityLeave, submitting }
}
