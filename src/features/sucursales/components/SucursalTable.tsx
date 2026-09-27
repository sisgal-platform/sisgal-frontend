import { Button } from "@/components/ui/button";

import { SucursalStatusBadge } from "./SucursalStatusBadge";
import type { Sucursal } from "../interfaces/types";

interface SucursalTableProps {
  sucursales: Sucursal[];
}

export function SucursalTable({
  sucursales,
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

                <td className="px-4 py-3 text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    type="button"
                  >
                    Ver
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}