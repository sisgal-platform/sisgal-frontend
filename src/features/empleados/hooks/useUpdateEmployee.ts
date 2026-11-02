import { useState } from "react"

import { useToast } from "@/toast"
import { employeesService } from "../services/employeesService"
import type { UpdateEmployeePayload } from "../interfaces/types"

export function useUpdateEmployee(onSuccess: () => void) {
  const { showToast } = useToast()
  const [enviando, setEnviando] = useState(false)

  async function updateEmployee(id: number, payload: UpdateEmployeePayload) {
    setEnviando(true)

    try {
      await employeesService.update(id, payload)

      showToast("Empleado actualizado correctamente.", "success")
      onSuccess()
    } catch (error) {
      showToast(mensajeDeError(error), "error")
    } finally {
      setEnviando(false)
    }
  }

  return { updateEmployee, enviando }
}

function mensajeDeError(error: unknown): string {
  if (isAxiosLikeError(error)) {
    const status = error.response?.status
    const backendMessage = error.response?.data?.message

    if (status === 404) {
      return backendMessage ?? "No se encontró el empleado o el cargo indicado."
    }
    if (status === 400) {
      return backendMessage ?? "Revisa los datos del formulario."
    }
  }

  return "No se pudo actualizar el empleado. Inténtalo de nuevo."
}

function isAxiosLikeError(
  error: unknown,
): error is { response?: { status?: number; data?: { message?: string } } } {
  return typeof error === "object" && error !== null && "response" in error
}
