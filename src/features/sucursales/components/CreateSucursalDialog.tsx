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
            setForm((current) => ({
                ...current,
                [field]: event.target.value,
            }));
        };

    const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        console.log("🔥 HANDLE SUBMIT EJECUTADO");

        const nombre = form.nombre.trim();
        const direccion = form.direccion.trim();
        const telefono = form.telefono.trim();
        const ciudad = form.ciudad.trim();

        if (!nombre || !direccion || !telefono || !ciudad) {
            setError("Todos los campos son obligatorios.");
            return;
        }

        try {
            setError(null);
            setIsSubmitting(true);

            const payload: CreateSucursalPayload = {
                nombre,
                direccion,
                telefono,
                ciudad,
                companyId: 1,
            };

            if (mode === "edit" && sucursal) {
                await sucursalesService.update(String(sucursal.id), payload);
                onUpdated?.();
            } else {
                await sucursalesService.create(payload);
                onCreated?.();
            }

            onOpenChange(false);
        } catch (submitError) {
            console.error(
                `Error al ${mode === "edit" ? "actualizar" : "crear"} la sucursal:`,
                submitError,
            );
            setError(
                mode === "edit"
                    ? "No fue posible actualizar la sucursal. Inténtalo nuevamente."
                    : "No fue posible crear la sucursal. Inténtalo nuevamente.",
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
                        {mode === "edit" ? "Editar sucursal" : "Nueva sucursal"}
                    </AlertDialogTitle>

                    <AlertDialogDescription>
                        {mode === "edit"
                            ? "Actualiza la información de esta sucursal."
                            : "Completa los datos de la nueva sucursal. La compañía se asigna automáticamente."}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                            <span>Nombre</span>
                            <input
                                type="text"
                                value={form.nombre}
                                onChange={handleChange("nombre")}
                                placeholder="Sucursal Centro"
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                            />
                        </label>

                        <label className="space-y-2 text-sm text-slate-700 sm:col-span-2">
                            <span>Dirección</span>
                            <input
                                type="text"
                                value={form.direccion}
                                onChange={handleChange("direccion")}
                                placeholder="Carrera 43A # 10-15"
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                            />
                        </label>

                        <label className="space-y-2 text-sm text-slate-700">
                            <span>Teléfono</span>
                            <input
                                type="tel"
                                value={form.telefono}
                                onChange={handleChange("telefono")}
                                placeholder="6041234567"
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                            />
                        </label>

                        <label className="space-y-2 text-sm text-slate-700">
                            <span>Ciudad</span>
                            <input
                                type="text"
                                value={form.ciudad}
                                onChange={handleChange("ciudad")}
                                placeholder="Medellín"
                                className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none ring-0 transition focus:border-slate-400"
                            />
                        </label>
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
