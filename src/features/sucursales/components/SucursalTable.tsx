import { Button } from "@/components/ui/button";
import { SucursalStatusBadge } from "./SucursalStatusBadge";

const sucursalesDemo = [
    {
        id: "1",
        nombre: "Casa Central",
        codigo: "CC-01",
        ciudad: "Córdoba",
        activo: true,
    },
    {
        id: "2",
        nombre: "Sucursal Norte",
        codigo: "SN-02",
        ciudad: "Rosario",
        activo: true,
    },
    {
        id: "3",
        nombre: "Sucursal Sur",
        codigo: "SS-03",
        ciudad: "Mendoza",
        activo: false,
    },
];

export function SucursalTable() {
    return (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-600">
                        <tr>
                            <th className="px-4 py-3 font-medium">Nombre</th>
                            <th className="px-4 py-3 font-medium">Código</th>
                            <th className="px-4 py-3 font-medium">Ciudad</th>
                            <th className="px-4 py-3 font-medium">Estado</th>
                            <th className="px-4 py-3 text-right font-medium">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {sucursalesDemo.map((sucursal) => (
                            <tr
                                key={sucursal.id}
                                className="border-t border-slate-200"
                            >
                                <td className="px-4 py-3 font-medium text-slate-900">
                                    {sucursal.nombre}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {sucursal.codigo}
                                </td>
                                <td className="px-4 py-3 text-slate-600">
                                    {sucursal.ciudad}
                                </td>
                                <td className="px-4 py-3">
                                    <SucursalStatusBadge
                                        active={sucursal.activo}
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
