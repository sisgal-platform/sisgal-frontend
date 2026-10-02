import type { FiltrosPrestamos, PrestamoFila } from "../interfaces/types";
import { obtenerConfiguracionEstadoPrestamo } from "../estadosPrestamo";
import {
    dateToInputValue,
    formatCurrencyCOP,
    formatDateCO,
} from "@/lib/formatters";

type PrestamosTableProps = {
    prestamos: PrestamoFila[];
    filtros: FiltrosPrestamos;
};

function normalizarBusqueda(value: string) {
    return value
        .trim()
        .toLocaleLowerCase("es-CO")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
}

export function PrestamosTable({ prestamos, filtros }: PrestamosTableProps) {
    const busqueda = normalizarBusqueda(filtros.busqueda);
    const prestamosFiltrados = prestamos.filter((prestamo) => {
        const datosEmpleado = normalizarBusqueda(
            `${prestamo.empleadoNombre} ${prestamo.numeroDocumento}`,
        );

        return (
            (!busqueda || datosEmpleado.includes(busqueda)) &&
            (!filtros.estado || prestamo.estado === filtros.estado) &&
            (!filtros.fecha ||
                dateToInputValue(prestamo.ultimaActualizacion) ===
                    filtros.fecha)
        );
    });

    return (
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm">
            <table className="w-full min-w-[1000px] text-left text-sm">
                <caption className="sr-only">
                    Listado de préstamos otorgados
                </caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                        <th scope="col" className="px-4 py-3">
                            Empleado
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Tipo de documento
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Número de documento
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
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {prestamosFiltrados.length > 0 ? (
                        prestamosFiltrados.map((prestamo) => {
                            const estado = obtenerConfiguracionEstadoPrestamo(
                                prestamo.estado,
                            );

                            return (
                                <tr key={prestamo.id}>
                                    <td className="px-4 py-3 font-medium text-text">
                                        {prestamo.empleadoNombre}
                                    </td>
                                    <td className="px-4 py-3 text-text-muted">
                                        {prestamo.tipoDocumento}
                                    </td>
                                    <td className="px-4 py-3 text-text-muted">
                                        {prestamo.numeroDocumento}
                                    </td>
                                    <td className="px-4 py-3">
                                        <span
                                            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.badgeClassName}`}
                                        >
                                            {estado.label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-text-muted">
                                        {formatCurrencyCOP(prestamo.montoTotal)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-text-muted">
                                        {formatCurrencyCOP(prestamo.cuota)}
                                    </td>
                                    <td className="px-4 py-3 text-right text-text-muted">
                                        {formatCurrencyCOP(
                                            prestamo.saldoPendiente,
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-text-muted">
                                        {formatDateCO(
                                            prestamo.ultimaActualizacion,
                                        )}
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td
                                colSpan={8}
                                className="px-4 py-10 text-center text-text-muted"
                            >
                                {prestamos.length === 0
                                    ? "No hay préstamos para mostrar."
                                    : "No se encontraron préstamos con los filtros aplicados."}
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
