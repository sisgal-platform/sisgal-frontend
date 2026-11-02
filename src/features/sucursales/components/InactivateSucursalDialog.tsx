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

import type { Sucursal } from "../interfaces/types";

function getHttpStatus(error: unknown): number | undefined {
    if (typeof error !== "object" || error === null || !("response" in error)) {
        return undefined;
    }

    const response = error.response;
    if (typeof response !== "object" || response === null || !("status" in response)) {
        return undefined;
    }

    return typeof response.status === "number" ? response.status : undefined;
}

type InactivateSucursalDialogProps = {
    sucursal: Sucursal | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: (id: number | string) => Promise<void>;
};

export function InactivateSucursalDialog({
    sucursal,
    open,
    onOpenChange,
    onConfirm,
}: InactivateSucursalDialogProps) {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Clear transient dialog state when the controlled dialog closes.
            setError(null);
            setIsSubmitting(false);
        }
    }, [open]);

    const handleConfirm = async () => {
        if (!sucursal) {
            return;
        }

        try {
            setError(null);
            setIsSubmitting(true);

            await onConfirm(sucursal.id);

            // Solo cerramos el diálogo si la operación
            // realmente terminó correctamente.
            onOpenChange(false);
        } catch (error: unknown) {
            console.error("Error al confirmar inactivación:", error);

            const status = getHttpStatus(error);

            if (status === 409) {
                setError(
                    "No es posible inactivar esta sucursal porque tiene empleados o registros históricos de asistencia asociados.",
                );
            } else {
                setError(
                    "No fue posible inactivar la sucursal. Inténtalo nuevamente.",
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
                        ¿Deseas inactivar esta sucursal?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {sucursal ? (
                            <>
                                La sucursal <strong>{sucursal.name}</strong>{" "}
                                dejará de aparecer entre las sucursales activas.
                            </>
                        ) : (
                            "La sucursal dejará de estar activa."
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
                        {isSubmitting ? "Inactivando..." : "Inactivar"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
