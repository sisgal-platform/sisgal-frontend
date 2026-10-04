import { useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { EmployeeForm } from "./EmployeeForm";
import { Plus } from "lucide-react";

type EmployeeFormModalProps = {
    /** Se ejecuta además de cerrar el modal, por ejemplo para refrescar la tabla. */
    onSuccess?: () => void;
};

/**
 * Botón "Registrar empleado" + modal con el formulario.
 * El scroll queda dentro del modal (DialogContent) para que el formulario
 * no desborde la pantalla en dispositivos pequeños.
 */
export function EmployeeFormModal({ onSuccess }: EmployeeFormModalProps = {}) {
    const [open, setOpen] = useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <button
                    type="button"
                    className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
                >
                    <Plus size={18} aria-hidden="true" />
                    Registrar empleado
                </button>
            </DialogTrigger>

            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Agregar nuevo empleado</DialogTitle>
                </DialogHeader>

                <EmployeeForm
                    onSuccess={() => {
                        setOpen(false);
                        onSuccess?.();
                    }}
                />
            </DialogContent>
        </Dialog>
    );
}
