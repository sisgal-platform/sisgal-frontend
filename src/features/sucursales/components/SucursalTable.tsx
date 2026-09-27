import { Button } from "@/components/ui/button";

import { SucursalStatusBadge } from "./SucursalStatusBadge";
import type { Sucursal } from "../interfaces/types";
import { Pencil, Trash2 } from "lucide-react";

interface SucursalTableProps {
    sucursales: Sucursal[];
    onDelete: (sucursal: Sucursal) => void;
    onEdit: (sucursal: Sucursal) => void;
}

export function SucursalTable({
    sucursales,
    onDelete,
    onEdit,
}: SucursalTableProps) {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-medium">Nombre</th>
                            <th className="px-4 py-3 font-medium">Ciudad</th>
                            <th className="px-4 py-3 font-medium">Dirección</th>
                            <th className="px-4 py-3 font-medium">Teléfono</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                            <th className="px-4 py-3 text-right font-medium">
                                Acciones
                            </th>
                        </tr>
                    </thead>

                    <tbody>
                        {sucursales.map((sucursal) => (
                            <tr
                                key={sucursal.id}
                                className="border-t border-slate-200"
                            >
                                <td className="px-4 py-3 font-medium text-slate-900">
                                    {sucursal.name}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                    {sucursal.city}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                    {sucursal.address}
                                </td>

                                <td className="px-4 py-3 text-slate-600">
                                    {sucursal.phone ?? "—"}
                                </td>

                                <td className="px-4 py-3">
                                    <SucursalStatusBadge
                                        active={sucursal.is_active}
                                    />
                                </td>

                                <td className="px-4 py-3">
                                    <div className="flex items-center justify-end gap-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            aria-label={`Editar ${sucursal.name}`}
                                            title={`Editar ${sucursal.name}`}
                                            className="text-text-muted hover:bg-primary/10 hover:text-primary"
                                            onClick={() => onEdit(sucursal)}
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            type="button"
                                            aria-label={`Inactivar ${sucursal.name}`}
                                            title={`Inactivar ${sucursal.name}`}
                                            className="text-text-muted hover:bg-destructive/10 hover:text-destructive"
                                            onClick={() => onDelete(sucursal)}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
