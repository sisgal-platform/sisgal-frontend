import { useEffect, useState } from "react";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import type { Employee } from "../interfaces/types";

type DeactivateEmployeeDialogProps = {
    employee: Employee | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (id: number) => Promise<void>;
};

export function DeactivateEmployeeDialog({
    employee,
    open,
    onOpenChange,
    onConfirm,
}: DeactivateEmployeeDialogProps) {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            setError(null);
            setIsSubmitting(false);
        }
    }, [open]);

    const handleConfirm = async () => {
        if (!employee) {
            return;
        }

        try {
            setError(null);
            setIsSubmitting(true);

            await onConfirm(employee.id);

            // Solo cerramos el diálogo si la operación
            // realmente terminó correctamente.
            onOpenChange(false);
        } catch (error: any) {
            console.error("Error al confirmar desactivación:", error);

            const status = error?.response?.status;

            if (status === 409) {
                setError(
                    "No es posible desactivar este empleado porque tiene registros de asistencia, nómina o incapacidades asociados.",
                );
            } else {
                setError(
                    "No fue posible desactivar el empleado. Inténtalo nuevamente.",
                );
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AlertDialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!isSubmitting) {
                    onOpenChange(nextOpen);
                }
            }}
        >
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        ¿Deseas desactivar este empleado?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {employee ? (
                            <>
                                El empleado{" "}
                                <strong>
                                    {employee.firstName} {employee.lastName}
                                </strong>{" "}
                                dejará de aparecer entre los empleados activos.
                            </>
                        ) : (
                            "El empleado dejará de estar activo."
                        )}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                {error && (
                    <div
                        role="alert"
                        className="rounded-md border border-destructive/20 bg-destructive/10 px-3 py-2 text-sm text-destructive"
                    >
                        {error}
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isSubmitting}>
                        Cancelar
                    </AlertDialogCancel>
                    <AlertDialogAction
                        disabled={isSubmitting}
                        onClick={(event) => {
                            event.preventDefault();
                            void handleConfirm();
                        }}
                    >
                        {isSubmitting ? "Desactivando..." : "Desactivar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
