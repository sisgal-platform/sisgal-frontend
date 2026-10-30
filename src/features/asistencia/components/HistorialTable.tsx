import type {
    EstadoRegistroAsistencia,
    RegistroAsistencia,
} from "../interfaces/types";
import {
    esOtroDia,
    formatFechaMarcacion,
    formatHoraMarcacion,
    formatHorasTrabajadas,
} from "../utils/fechas";

const estadoConfig: Record<
    EstadoRegistroAsistencia,
    { label: string; badge: string; fila: string }
> = {
    COMPLETO: {
        label: "Completo",
        badge: "bg-success-light text-success-dark",
        fila: "",
    },
    INCOMPLETO: {
        label: "Incompleto",
        badge: "bg-warning-light text-warning-dark",
        fila: "bg-warning-light/40",
    },
};

type HistorialTableProps = Readonly<{
    registros: RegistroAsistencia[];
    cargando: boolean;
    error: string | null;
    onReintentar: () => void;
}>;

export function HistorialTable({
    registros,
    cargando,
    error,
    onReintentar,
}: HistorialTableProps) {
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

    if (cargando && registros.length === 0) {
        return (
            <output className="block rounded-2xl bg-white p-6 text-text-muted">
                Cargando historial…
            </output>
        );
    }

    if (registros.length === 0) {
        return (
            <p className="rounded-2xl bg-white p-6 text-text-muted">
                No se encontraron resultados.
            </p>
        );
    }

    return (
        <div
            className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
            aria-busy={cargando}
        >
            <table className="w-full min-w-[640px] text-left text-sm">
                <caption className="sr-only">
                    Historial de asistencia en orden cronológico
                </caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                        <th scope="col" className="px-3 py-3">
                            Fecha
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Empleado
                        </th>
                        <th
                            scope="col"
                            className="hidden px-3 py-3 lg:table-cell"
                        >
                            Documento
                        </th>
                        <th
                            scope="col"
                            className="hidden px-3 py-3 md:table-cell"
                        >
                            Sucursal
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Hora de entrada
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Hora de salida
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Horas trabajadas
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Estado
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {registros.map((registro) => {
                        const estado = estadoConfig[registro.status];

                        return (
                            <tr key={registro.id} className={estado.fila}>
                                <td className="whitespace-nowrap px-3 py-3 font-medium text-text">
                                    {formatFechaMarcacion(registro.checkIn)}
                                </td>
                                <td className="px-3 py-3 font-medium text-text">
                                    {registro.employee.firstName}{" "}
                                    {registro.employee.lastName}
                                </td>
                                <td className="hidden whitespace-nowrap px-3 py-3 text-text-muted lg:table-cell">
                                    {registro.employee.documentType}{" "}
                                    {registro.employee.document}
                                </td>
                                <td className="hidden px-3 py-3 text-text-muted md:table-cell">
                                    {registro.branchName ?? "—"}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-text-muted">
                                    {formatHoraMarcacion(registro.checkIn)}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-text-muted">
                                    {registro.checkOut ? (
                                        <>
                                            {formatHoraMarcacion(
                                                registro.checkOut,
                                            )}
                                            {esOtroDia(
                                                registro.checkIn,
                                                registro.checkOut,
                                            ) && (
                                                <span className="block text-xs">
                                                    {formatFechaMarcacion(
                                                        registro.checkOut,
                                                    )}
                                                </span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="font-medium text-warning-dark">
                                            Sin salida
                                        </span>
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 text-text-muted">
                                    {registro.workedMinutes === null
                                        ? "—"
                                        : formatHorasTrabajadas(
                                              registro.workedMinutes,
                                          )}
                                </td>
                                <td className="px-3 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.badge}`}
                                    >
                                        {estado.label}
                                    </span>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
