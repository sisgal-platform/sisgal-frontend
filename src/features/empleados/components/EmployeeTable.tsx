import { Eye, Power } from "lucide-react";

import { formatCurrencyCOP } from "@/lib/formatters";
import { formatTimeRange } from "@/features/parametros-nomina/utils/format";
import type { WorkdayConfig } from "@/features/parametros-nomina/interfaces/types";

import type { Employee } from "../interfaces/types";

// El backend hoy solo usa "ACTIVO"; cualquier otro valor (ej. tras desactivar
// un empleado) se muestra como "Inactivo".
const estadoConfig = {
    activo: {
        label: "Activo",
        badge: "bg-success-light text-success-dark",
    },
    inactivo: {
        label: "Inactivo",
        badge: "bg-secondary-dark text-text-muted",
    },
};

type EmployeeTableProps = {
    employees: Employee[];
    /** Jornada laboral general vigente; es null si no hay una configurada. */
    workdayConfig: WorkdayConfig | null;
    cargando: boolean;
    error: string | null;
    onReintentar: () => void;
    onVerDetalle: (employee: Employee) => void;
    onDesactivar: (employee: Employee) => void;
};

export function EmployeeTable({
    employees,
    workdayConfig,
    cargando,
    error,
    onReintentar,
    onVerDetalle,
    onDesactivar,
}: EmployeeTableProps) {
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

    if (cargando && employees.length === 0) {
        return (
            <p
                role="status"
                className="rounded-2xl bg-white p-6 text-text-muted"
            >
                Cargando empleados…
            </p>
        );
    }

    if (employees.length === 0) {
        return (
            <p className="rounded-2xl bg-white p-6 text-text-muted">
                No hay empleados para mostrar.
            </p>
        );
    }

    return (
        <div
            className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
            aria-busy={cargando}
        >
            <table className="w-full text-left text-sm sm:text-base">
                <caption className="sr-only">Listado de empleados</caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                        <th scope="col" className="px-4 py-3">
                            Nombre
                        </th>
                        <th
                            scope="col"
                            className="hidden px-4 py-3 md:table-cell"
                        >
                            Documento
                        </th>
                        <th
                            scope="col"
                            className="hidden px-4 py-3 lg:table-cell"
                        >
                            Teléfono
                        </th>
                        <th
                            scope="col"
                            className="hidden px-4 py-3 lg:table-cell"
                        >
                            Salario
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Sucursal
                        </th>
                        <th
                            scope="col"
                            className="hidden px-4 py-3 md:table-cell"
                        >
                            Cargo
                        </th>
                        <th
                            scope="col"
                            className="hidden px-4 py-3 xl:table-cell"
                        >
                            Horario
                        </th>
                        <th scope="col" className="px-4 py-3">
                            Estado
                        </th>
                        <th scope="col" className="px-4 py-3 text-right">
                            Acciones
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {employees.map((employee) => {
                        const estado =
                            estadoConfig[
                                employee.status === "ACTIVO"
                                    ? "activo"
                                    : "inactivo"
                            ];

                        return (
                            <tr key={employee.id}>
                                <td className="px-4 py-3 font-medium text-text">
                                    {employee.firstName} {employee.lastName}
                                </td>
                                <td className="hidden px-4 py-3 text-text-muted md:table-cell">
                                    {employee.document}
                                </td>
                                <td className="hidden px-4 py-3 text-text-muted lg:table-cell">
                                    {employee.phone}
                                </td>
                                <td className="hidden px-4 py-3 text-text-muted lg:table-cell">
                                    {formatCurrencyCOP(employee.salaryBase)}
                                </td>
                                <td className="px-4 py-3 text-text-muted">
                                    {employee.branchName ?? "—"}
                                </td>
                                <td className="hidden px-4 py-3 text-text-muted md:table-cell">
                                    {employee.positionName ?? "—"}
                                </td>
                                <td className="hidden px-4 py-3 text-text-muted xl:table-cell">
                                    {workdayConfig ? (
                                        <>
                                            <span className="block">
                                                Diurna{" "}
                                                {formatTimeRange(
                                                    workdayConfig.dayStart,
                                                    workdayConfig.dayEnd,
                                                )}
                                            </span>
                                            <span className="block">
                                                Nocturna{" "}
                                                {formatTimeRange(
                                                    workdayConfig.nightStart,
                                                    workdayConfig.nightEnd,
                                                )}
                                            </span>
                                        </>
                                    ) : (
                                        "—"
                                    )}
                                </td>
                                <td className="px-4 py-3">
                                    <span
                                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${estado.badge}`}
                                    >
                                        {estado.label}
                                    </span>
                                </td>
                                <td className="px-4 py-3">
                                    <div className="flex justify-end gap-2">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                onVerDetalle(employee)
                                            }
                                            aria-label={`Ver detalle de ${employee.firstName} ${employee.lastName}`}
                                            title="Ver detalle"
                                            className="flex h-9 w-9 items-center justify-center rounded-lg text-primary hover:bg-secondary"
                                        >
                                            <Eye size={18} aria-hidden="true" />
                                        </button>
                                        {employee.status === "ACTIVO" && (
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    onDesactivar(employee)
                                                }
                                                aria-label={`Desactivar ${employee.firstName} ${employee.lastName}`}
                                                title="Desactivar"
                                                className="flex h-9 w-9 items-center justify-center rounded-lg text-error hover:bg-error-light"
                                            >
                                                <Power
                                                    size={18}
                                                    aria-hidden="true"
                                                />
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
