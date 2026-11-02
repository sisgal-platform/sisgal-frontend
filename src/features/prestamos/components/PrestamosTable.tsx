import type { Prestamo } from "../interfaces/types";
import { obtenerConfiguracionEstadoPrestamo } from "../estadosPrestamo";
import { formatCurrencyCOP, formatDateCO } from "@/lib/formatters";
import { Eye, Pencil, Trash2 } from "lucide-react";

type PrestamosTableProps = Readonly<{
    prestamos: Prestamo[];
    cargando: boolean;
    error: string | null;
    onReintentar: () => void;
    onVerDetalle: (prestamo: Prestamo) => void;
    onEditar: (prestamo: Prestamo) => void;
    onEliminar: (prestamo: Prestamo) => void;
}>;

export function PrestamosTable({
    prestamos,
    cargando,
    error,
    onReintentar,
    onVerDetalle,
    onEditar,
    onEliminar,
}: PrestamosTableProps) {
    if (error) {
        return (
            <div
                role="alert"
                className="flex flex-col items-start gap-3 rounded-2xl border border-error-light bg-white p-6"
            >
                <p className="text-base text-error">{error}</p>
                <button
                    type="button"
                    onClick={onReintentar}
                    className="h-10 rounded-xl border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                >
                    Reintentar
                </button>
            </div>
        );
    }

    if (cargando && prestamos.length === 0) {
        return (
            <output className="block rounded-2xl bg-white p-6 text-text-muted">
                Cargando préstamos…
            </output>
        );
    }

    if (prestamos.length === 0) {
        return (
            <p className="rounded-2xl bg-white p-6 text-text-muted">
                No hay préstamos que coincidan con los filtros.
            </p>
        );
    }

    return (
        <div
            className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
            aria-busy={cargando}
        >
            <table className="w-full min-w-[1000px] text-left text-sm">
                <caption className="sr-only">
                    Listado de préstamos otorgados
                </caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                        <th scope="col" className="px-4 py-3">
                            Documento
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Empleado
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Estado
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                            Monto total
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                            Cuota
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                            Saldo pendiente
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Última actualización
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {prestamos.map((prestamo) => {
                        const estado = obtenerConfiguracionEstadoPrestamo(
                            prestamo.status,
                        );
                        const empleado = `${prestamo.employee.firstName} ${prestamo.employee.lastName}`;

                        return (
                            <tr key={prestamo.id}>
                                <td className="px-4 py-3 text-text-muted">
                                    {prestamo.employee.documentType
                                        ? `${prestamo.employee.documentType} ${prestamo.employee.document}`
                                        : prestamo.employee.document}
                                </td>
                                <td className="px-4 py-3 font-medium text-text">
                                    {prestamo.employee.firstName}{" "}
                                    {prestamo.employee.lastName}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.badgeClassName}`}
                                    >
                                        {estado.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right text-text-muted">
                                    {formatCurrencyCOP(prestamo.totalAmount)}
                                </td>
                                <td className="px-4 py-3 text-right text-text-muted">
                                    {formatCurrencyCOP(
                                        prestamo.installmentAmount,
                                    )}
                                </td>
                                <td className="px-4 py-3 text-right text-text-muted">
                                    {formatCurrencyCOP(
                                        prestamo.outstandingBalance,
                                    )}
                                </td>
                                <td className="px-4 py-3 text-text-muted">
                                    {formatDateCO(prestamo.updatedAt)}
                                </td>
                                <td className="whitespace-nowrap px-4 py-3 text-right">
                                    <button
                                        type="button"
                                        onClick={() => onVerDetalle(prestamo)}
                                        aria-label={`Ver detalle del préstamo de ${empleado}`}
                                        title="Ver detalle"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary"
                                    >
                                        <Eye size={18} aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onEditar(prestamo)}
                                        aria-label={`Editar el préstamo de ${empleado}`}
                                        title="Editar"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary"
                                    >
                                        <Pencil size={18} aria-hidden="true" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => onEliminar(prestamo)}
                                        aria-label={`Eliminar el préstamo de ${empleado}`}
                                        title="Eliminar"
                                        className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-error hover:bg-error-light"
                                    >
                                        <Trash2 size={18} aria-hidden="true" />
                                    </button>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
