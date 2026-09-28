import { useState } from "react";

import { useToast } from "@/toast";
import { employeesService } from "../services/employeesService";
import type { RegisterEmployeePayload } from "../interfaces/types";

export function useRegisterEmployee(onSuccess: () => void) {
  const { showToast } = useToast();
  const [enviando, setEnviando] = useState(false);

  async function registerEmployee(payload: RegisterEmployeePayload) {
    setEnviando(true);

    try {
      await employeesService.create(payload);

      showToast("Empleado registrado correctamente.", "success");
      onSuccess();
    } catch (error) {
      showToast(mensajeDeError(error), "error");
    } finally {
      setEnviando(false);
    }
  }

  return { registerEmployee, enviando };
}

function mensajeDeError(error: unknown): string {
  if (isAxiosLikeError(error)) {
    const status = error.response?.status;
    const backendMessage = error.response?.data?.message;

    if (status === 409) {
      return backendMessage ?? "Ya existe un empleado con ese documento.";
    }
    if (status === 404) {
      return backendMessage ?? "La sucursal seleccionada no existe.";
    }
    if (status === 400) {
      return backendMessage ?? "Revisa los datos del formulario.";
    }
  }

  return "No se pudo registrar el empleado. Inténtalo de nuevo.";
}

function isAxiosLikeError(
  error: unknown,
): error is { response?: { status?: number; data?: { message?: string } } } {
  return typeof error === "object" && error !== null && "response" in error;
}
