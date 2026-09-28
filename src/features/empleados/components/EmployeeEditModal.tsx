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
  return (
    <Dialog open={employee !== null} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Editar empleado</DialogTitle>
        </DialogHeader>

        {employee && (
          <EmployeeForm
            employee={employee}
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
