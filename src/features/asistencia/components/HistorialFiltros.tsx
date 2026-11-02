import type { SubmitEvent } from "react";
import { RotateCcw, Search } from "lucide-react";

import type { Employee } from "@/features/empleados/interfaces/types";

import type {
    EstadoRegistroAsistencia,
    FiltrosHistorial,
} from "../interfaces/types";
import { FECHA_MINIMA, fechaActual } from "../utils/fechas";

const ID_ERROR_FECHAS = "filtro-asistencia-error-fechas";

const ESTADOS_REGISTRO: ReadonlyArray<{
    value: EstadoRegistroAsistencia;
    label: string;
}> = [
    { value: "COMPLETO", label: "Completo" },
    { value: "INCOMPLETO", label: "Incompleto" },
];

const estiloCampo =
    "h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 aria-[invalid=true]:border-error";

type HistorialFiltrosProps = Readonly<{
    filtros: FiltrosHistorial;
    empleados: Employee[];
    cargandoEmpleados: boolean;
    errorEmpleados: string | null;
    /** Mensaje de un rango de fechas inválido; null si el rango es válido. */
    errorFechas: string | null;
    onCambiar: (filtros: FiltrosHistorial) => void;
    onBuscar: () => void;
    onLimpiar: () => void;
}>;

export function HistorialFiltros({
    filtros,
    empleados,
    cargandoEmpleados,
    errorEmpleados,
    errorFechas,
    onCambiar,
    onBuscar,
    onLimpiar,
}: HistorialFiltrosProps) {
    function enviar(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        onBuscar();
    }

    const fechasInvalidas = errorFechas !== null;

    return (
        // noValidate: los mensajes del rango de fechas los da la aplicación.
        <form
            noValidate
            onSubmit={enviar}
            aria-label="Filtros del historial"
            className="space-y-4 rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm"
        >
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[minmax(240px,1.6fr)_minmax(170px,1fr)_minmax(170px,1fr)_minmax(170px,1fr)]">
                <div className="space-y-2">
                    <label
                        htmlFor="filtro-asistencia-empleado"
                        className="text-sm font-medium text-text"
                    >
                        Empleado
                    </label>
                    <select
                        id="filtro-asistencia-empleado"
                        value={filtros.empleadoId}
                        onChange={(event) =>
                            onCambiar({
                                ...filtros,
                                empleadoId: event.target.value,
                            })
                        }
                        className={estiloCampo}
                    >
                        <option value="">
                            {cargandoEmpleados
                                ? "Cargando empleados…"
                                : "Todos los empleados"}
                        </option>
                        {empleados.map((empleado) => (
                            <option key={empleado.id} value={empleado.id}>
                                {empleado.firstName} {empleado.lastName} —{" "}
                                {empleado.document}
                            </option>
                        ))}
                    </select>
                    {errorEmpleados && (
                        <p className="text-sm text-error">{errorEmpleados}</p>
                    )}
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="filtro-asistencia-estado"
                        className="text-sm font-medium text-text"
                    >
                        Estado
                    </label>
                    <select
                        id="filtro-asistencia-estado"
                        value={filtros.estado}
                        onChange={(event) =>
                            onCambiar({
                                ...filtros,
                                estado: event.target
                                    .value as FiltrosHistorial["estado"],
                            })
                        }
                        className={estiloCampo}
                    >
                        <option value="">Todos los estados</option>
                        {ESTADOS_REGISTRO.map((estado) => (
                            <option key={estado.value} value={estado.value}>
                                {estado.label}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="filtro-asistencia-fecha-desde"
                        className="text-sm font-medium text-text"
                    >
                        Fecha inicial
                    </label>
                    <input
                        id="filtro-asistencia-fecha-desde"
                        type="date"
                        min={FECHA_MINIMA}
                        max={fechaActual()}
                        value={filtros.fechaDesde}
                        onChange={(event) =>
                            onCambiar({
                                ...filtros,
                                fechaDesde: event.target.value,
                            })
                        }
                        aria-invalid={fechasInvalidas}
                        aria-describedby={
                            fechasInvalidas ? ID_ERROR_FECHAS : undefined
                        }
                        className={estiloCampo}
                    />
                </div>

                <div className="space-y-2">
                    <label
                        htmlFor="filtro-asistencia-fecha-hasta"
                        className="text-sm font-medium text-text"
                    >
                        Fecha final
                    </label>
                    <input
                        id="filtro-asistencia-fecha-hasta"
                        type="date"
                        min={FECHA_MINIMA}
                        max={fechaActual()}
                        value={filtros.fechaHasta}
                        onChange={(event) =>
                            onCambiar({
                                ...filtros,
                                fechaHasta: event.target.value,
                            })
                        }
                        aria-invalid={fechasInvalidas}
                        aria-describedby={
                            fechasInvalidas ? ID_ERROR_FECHAS : undefined
                        }
                        className={estiloCampo}
                    />
                </div>
            </div>

            {errorFechas && (
                <p
                    id={ID_ERROR_FECHAS}
                    role="alert"
                    className="text-sm font-medium text-error"
                >
                    {errorFechas}
                </p>
            )}

            <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <button
                    type="button"
                    onClick={onLimpiar}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text transition hover:bg-secondary"
                >
                    <RotateCcw size={16} aria-hidden="true" />
                    Limpiar filtros
                </button>
                <button
                    type="submit"
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
                >
                    <Search size={16} aria-hidden="true" />
                    Buscar
                </button>
            </div>
        </form>
    );
}
