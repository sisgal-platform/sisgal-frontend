import type {
    EmpleadoAsistenciaHoy,
    EstadoAsistenciaHoy,
} from "../interfaces/types";
import { formatHoraMarcacion } from "../utils/fechas";

const estadoConfig: Record<
    EstadoAsistenciaHoy,
    { label: string; badge: string; texto: string }
> = {
    PRESENTE: {
        label: "Presente",
        badge: "bg-success-light text-success-dark",
        texto: "text-text",
    },
    AUSENTE: {
        label: "Ausente",
        badge: "bg-error-light text-error-dark",
        texto: "text-text-muted",
    },
};

type AsistenciaHoyTableProps = Readonly<{
    empleados: EmpleadoAsistenciaHoy[];
    /** Hay una consulta en curso sobre los datos que ya se muestran. */
    actualizando: boolean;
}>;

export function AsistenciaHoyTable({
    empleados,
    actualizando,
}: AsistenciaHoyTableProps) {
    return (
        <div
            className="overflow-x-auto rounded-2xl border border-gray-200 bg-surface shadow-sm"
            aria-busy={actualizando}
        >
            <table className="w-full min-w-[560px] text-left text-sm">
                <caption className="sr-only">
                    Asistencia de los empleados durante el día actual
                </caption>
                <thead className="bg-secondary text-xs uppercase tracking-wide text-text-muted">
                    <tr>
                        <th scope="col" className="px-3 py-3">
                            Empleado
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Cargo
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Sucursal
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Hora de entrada
                        </th>
                        <th scope="col" className="px-3 py-3">
                            Estado
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {empleados.map((empleado) => {
                        const estado = estadoConfig[empleado.status];

                        return (
                            <tr key={empleado.employeeId}>
                                <td
                                    className={`px-3 py-3 font-medium ${estado.texto}`}
                                >
                                    {empleado.firstName} {empleado.lastName}
                                </td>
                                <td className="px-3 py-3 text-text-muted">
                                    {empleado.positionName ?? "—"}
                                </td>
                                <td className="px-3 py-3 text-text-muted">
                                    {empleado.branchName ?? "—"}
                                </td>
                                <td className="whitespace-nowrap px-3 py-3 font-medium text-text">
                                    {empleado.checkIn
                                        ? formatHoraMarcacion(empleado.checkIn)
                                        : "—"}
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
