import { useState } from "react"

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

import { EmployeeForm } from "./EmployeeForm"
import type { Employee } from "../interfaces/types"

type EmployeeEditModalProps = {
  /** null = cerrado. El componente no tiene botón propio: lo abre la tabla. */
  employee: Employee | null
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EmployeeEditModal({
  employee,
  onOpenChange,
  onSuccess,
}: EmployeeEditModalProps) {
  // Al seleccionar un empleado se abre primero en modo detalle
  // (solo lectura); "Actualizar" habilita la edición de los campos.
  const [modoEdicion, setModoEdicion] = useState(false)

  return (
    <Dialog open={employee !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {modoEdicion ? "Editar empleado" : "Detalle del empleado"}
          </DialogTitle>
        </DialogHeader>

        {employee && (
          <EmployeeForm
            employee={employee}
            soloLectura={!modoEdicion}
            onSolicitarEdicion={() => setModoEdicion(true)}
            onSuccess={() => {
              onOpenChange(false)
              onSuccess()
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
