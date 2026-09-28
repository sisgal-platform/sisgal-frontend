import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { EmployeeForm } from "./EmployeeForm"

type EmployeeFormModalProps = {
  /** Se ejecuta además de cerrar el modal, por ejemplo para refrescar la tabla. */
  onSuccess?: () => void
}

/**
 * Botón "Registrar empleado" + modal con el formulario.
 * El scroll queda dentro del modal (DialogContent) para que el formulario
 * no desborde la pantalla en dispositivos pequeños.
 */
export function EmployeeFormModal({ onSuccess }: EmployeeFormModalProps = {}) {
  const [open, setOpen] = useState(false)

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" className="bg-primary hover:bg-primary-light">
          Registrar empleado
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Agregar nuevo empleado</DialogTitle>
        </DialogHeader>

        <EmployeeForm
          onSuccess={() => {
            setOpen(false)
            onSuccess?.()
          }}
        />
      </DialogContent>
    </Dialog>
  )
}
