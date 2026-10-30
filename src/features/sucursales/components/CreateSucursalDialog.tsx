import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";

import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

import { Button } from "@/components/ui/button";

import { sucursalesService } from "../services/sucursalesService";
import type { Sucursal } from "../interfaces/types";

export type CreateSucursalPayload = {
    nombre: string;
    direccion: string;
    telefono: string;
    ciudad: string;
    companyId: number;
};

type CreateSucursalDialogProps = {
    open: boolean;
    mode?: "create" | "edit";
    sucursal?: Sucursal | null;
    onOpenChange: (open: boolean) => void;
    onCreated?: () => void;
    onUpdated?: () => void;
};

const initialForm = {
    nombre: "",
    direccion: "",
    telefono: "",
    ciudad: "",
};

const getValidationError = ({ form }: { form: typeof initialForm }) => {
    const nombre = form.nombre.trim();
    const direccion = form.direccion.trim();
    const telefono = form.telefono.trim();
    const ciudad = form.ciudad.trim();

    if (!nombre) {
        return "El nombre es obligatorio.";
    }

    if (!direccion) {
        return "La dirección es obligatoria.";
    }

    if (!ciudad) {
        return "La ciudad es obligatoria.";
    }

    if (telefono && !/^\d+$/.test(telefono)) {
        return "El teléfono solo puede contener números.";
    }

    return null;
};

export function CreateSucursalDialog({
    open,
    mode = "create",
    sucursal = null,
    onOpenChange,
    onCreated,
    onUpdated,
}: CreateSucursalDialogProps) {
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (!open) {
            // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync controlled dialog/form props into the local editable form.
            setForm(initialForm);
            setError(null);
            setIsSubmitting(false);
            return;
        }

        if (mode === "edit" && sucursal) {
            setForm({
                nombre: sucursal.name ?? "",
                direccion: sucursal.address ?? "",
                telefono: sucursal.phone ?? "",
                ciudad: sucursal.city ?? "",
            });
            return;
        }

        setForm(initialForm);
        setError(null);
        setIsSubmitting(false);
    }, [open, mode, sucursal]);

    const handleChange =
        (field: keyof typeof initialForm) =>
        (event: ChangeEvent<HTMLInputElement>) => {
            const nextValue =
                field === "telefono"
                    ? event.target.value.replace(/\D/g, "")
                    : event.target.value;

            setForm((current) => ({
                ...current,
                [field]: nextValue,
            }));
        };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const validationError = getValidationError({
            form,
        });

        if (validationError) {
            setError(validationError);
            return;
        }

        const nombre = form.nombre.trim();
        const direccion = form.direccion.trim();
        const telefono = form.telefono.trim();
        const ciudad = form.ciudad.trim();

        try {
            setError(null);
            setIsSubmitting(true);

            if (mode === "edit" && sucursal) {
                await sucursalesService.update(String(sucursal.id), {
                    nombre,
                    direccion,
                    telefono,
                    ciudad,
                });
                onUpdated?.();
            } else {
                const payload: CreateSucursalPayload = {
                    nombre,
                    direccion,
                    telefono,
                    ciudad,
                    companyId: 1,
                };

                await sucursalesService.create(payload);
                onCreated?.();
            }

            onOpenChange(false);
        } catch (submitError) {
            console.error(
                `Error al ${mode === "edit" ? "actualizar" : "crear"} la sucursal:`,
                submitError,
            );

            const backendMessage =
                typeof submitError === "object" &&
                submitError !== null &&
                "response" in submitError &&
                submitError.response &&
                typeof submitError.response === "object" &&
                "data" in submitError.response &&
                submitError.response.data &&
                typeof submitError.response.data === "object" &&
                "message" in submitError.response.data
                    ? String(submitError.response.data.message)
                    : null;

            setError(
                backendMessage ||
                    (mode === "edit"
                        ? "No fue posible actualizar la sucursal. Inténtalo nuevamente."
                        : "No fue posible crear la sucursal. Inténtalo nuevamente."),
            );
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
            <AlertDialogContent className="max-w-xl">
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {mode === "edit"
                            ? "Actualizar sucursal"
                            : "Nueva sucursal"}
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        {mode === "edit"
                            ? "Actualiza la información de esta sucursal."
                            : "Completa los datos de la nueva sucursal. La compañía se asigna automáticamente."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="cargo-nombre"
                            className="text-sm font-semibold text-text"
                        >
                            Nombre{" "}
                            <span aria-hidden="true" className="text-error">
                                *
                            </span>
                        </label>
                        <input
                            id="cargo-nombre"
                            type="text"
                            value={form.nombre}
                            onChange={handleChange("nombre")}
                            placeholder="Sucursal Centro"
                            required
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="cargo-direccion"
                            className="text-sm font-semibold text-text"
                        >
                            Dirección{" "}
                            <span aria-hidden="true" className="text-error">
                                *
                            </span>
                        </label>
                        <input
                            id="cargo-direccion"
                            type="text"
                            value={form.direccion}
                            onChange={handleChange("direccion")}
                            placeholder="Carrera 43A # 10-15"
                            required
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="cargo-telefono"
                            className="text-sm font-semibold text-text"
                        >
                            Teléfono
                            <span aria-hidden="true" className="text-error">
                                *
                            </span>
                        </label>
                        <input
                            id="cargo-telefono"
                            type="tel"
                            inputMode="numeric"
                            value={form.telefono}
                            onChange={handleChange("telefono")}
                            placeholder="6041234567"
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                        />
                    </div>

                    <div className="flex flex-col gap-1">
                        <label
                            htmlFor="cargo-ciudad"
                            className="text-sm font-semibold text-text"
                        >
                            Ciudad{" "}
                            <span aria-hidden="true" className="text-error">
                                *
                            </span>
                        </label>
                        <input
                            id="cargo-ciudad"
                            type="text"
                            value={form.ciudad}
                            onChange={handleChange("ciudad")}
                            placeholder="Medellín"
                            required
                            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                        />
                    </div>

                    {error && (
                        <div
                            role="alert"
                            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                        >
                            {error}
                        </div>
                    )}

                    <AlertDialogFooter>
                        <AlertDialogCancel
                            type="button"
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </AlertDialogCancel>

                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting
                                ? mode === "edit"
                                    ? "Guardando..."
                                    : "Creando..."
                                : mode === "edit"
                                  ? "Guardar cambios"
                                  : "Crear sucursal"}
                        </Button>
                    </AlertDialogFooter>
                </form>
            </AlertDialogContent>
        </AlertDialog>
    );
}
