import { useState, type FormEvent } from "react";
import { Clock3 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

import { asistenciaService } from "../services/asistenciaService";
import type { RegistroAsistencia } from "../interfaces/types";
import { formatFechaMarcacion, formatHoraMarcacion } from "../utils/fechas";

type CompletarHoraSalidaDialogProps = Readonly<{
    registro: RegistroAsistencia | null;
    onOpenChange: (open: boolean) => void;
    onUpdated: () => void;
}>;

export function CompletarHoraSalidaDialog({
    registro,
    onOpenChange,
    onUpdated,
}: CompletarHoraSalidaDialogProps) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const open = registro !== null;

    const handleOpenChange = (nextOpen: boolean) => {
        if (!nextOpen) setError(null);
        onOpenChange(nextOpen);
    };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!registro) return;

        const formData = new FormData(event.currentTarget);
        const horaSalida = String(formData.get("horaSalida") ?? "");
        if (!horaSalida) {
            setError("Ingresa la hora de salida.");
            return;
        }

        try {
            setError(null);
            setIsSubmitting(true);
            await asistenciaService.actualizarHoraSalida(
                registro.id,
                registro.employee.id,
                horaSalida,
            );
            onUpdated();
            onOpenChange(false);
        } catch (submitError) {
            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "No fue posible completar la hora de salida.",
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog
            open={open}
            onOpenChange={(nextOpen) => {
                if (!isSubmitting) handleOpenChange(nextOpen);
            }}
        >
            {registro && (
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <div className="mb-1 flex size-11 items-center justify-center rounded-xl bg-warning-light text-warning-dark">
                            <Clock3 aria-hidden="true" className="size-5" />
                        </div>
                        <DialogTitle>Completar hora de salida</DialogTitle>
                        <DialogDescription>
                            Registra la salida pendiente de esta asistencia.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="rounded-xl border border-gray-200 bg-secondary/50 p-4">
                        <p className="font-semibold text-text">
                            {registro.employee.firstName} {registro.employee.lastName}
                        </p>
                        <p className="mt-1 text-sm text-text-muted">
                            Entrada: {formatFechaMarcacion(registro.checkIn)} · {formatHoraMarcacion(registro.checkIn)}
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label
                                htmlFor="hora-salida-asistencia"
                                className="text-sm font-semibold text-text"
                            >
                                Hora de salida
                            </label>
                            <input
                                key={registro.id}
                                id="hora-salida-asistencia"
                                name="horaSalida"
                                type="time"
                                required
                                autoFocus
                                disabled={isSubmitting}
                                className="h-11 w-full rounded-lg border border-input bg-white px-3 text-base text-text outline-none transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 disabled:opacity-60"
                            />
                            <p className="text-xs leading-5 text-text-muted">
                                Hora local de Colombia. Si terminó después de medianoche, selecciona la hora de salida correspondiente.
                            </p>
                        </div>

                        {error && (
                            <p
                                role="alert"
                                className="rounded-lg border border-error-light bg-white px-3 py-2 text-sm text-error"
                            >
                                {error}
                            </p>
                        )}

                        <DialogFooter>
                            <Button
                                type="button"
                                variant="outline"
                                disabled={isSubmitting}
                                onClick={() => handleOpenChange(false)}
                            >
                                Cancelar
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting ? "Guardando…" : "Guardar salida"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            )}
        </Dialog>
    );
}
