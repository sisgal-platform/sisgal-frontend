import { useState } from "react";
import {
    CircleAlert,
    CircleCheck,
    RefreshCw,
    UserCheck,
    UserX,
    Users,
} from "lucide-react";

import { formatNumberCO } from "@/lib/formatters";

import { AsistenciaHoyIndicador } from "./AsistenciaHoyIndicador";
import { AsistenciaHoyTable } from "./AsistenciaHoyTable";
import {
    INTERVALO_ACTUALIZACION_MS,
    useAsistenciaHoy,
} from "../hooks/useAsistenciaHoy";
import {
    fechaActual,
    formatFechaHoraActualizacion,
    formatFechaLarga,
} from "../utils/fechas";

const SEGUNDOS_ENTRE_ACTUALIZACIONES = INTERVALO_ACTUALIZACION_MS / 1000;

export function AsistenciaHoy() {
    const { asistencia, cargando, actualizando, error, actualizar } =
        useAsistenciaHoy();
    const [mostrarAusentes, setMostrarAusentes] = useState(false);

    const empleados = asistencia?.data ?? [];
    const visibles = mostrarAusentes
        ? empleados
        : empleados.filter((empleado) => empleado.status === "PRESENTE");

    return (
        <section aria-labelledby="asistencia-hoy-titulo" className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-1">
                    <h2
                        id="asistencia-hoy-titulo"
                        className="text-xl font-semibold text-primary"
                    >
                        Asistencia hoy
                    </h2>
                    <p className="text-sm text-text first-letter:uppercase sm:text-base">
                        {formatFechaLarga(asistencia?.fecha ?? fechaActual())}
                    </p>
                </div>

                <button
                    type="button"
                    onClick={actualizar}
                    disabled={actualizando}
                    className="flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark disabled:cursor-not-allowed disabled:opacity-60"
                >
                    <RefreshCw
                        size={16}
                        aria-hidden="true"
                        className={actualizando ? "animate-spin" : undefined}
                    />
                    Actualizar
                </button>
            </div>

            {error && !asistencia && (
                <div
                    role="alert"
                    className="flex flex-col items-start gap-3 rounded-2xl border border-error-light bg-white p-6"
                >
                    <p className="text-base text-error">{error}</p>
                    <button
                        type="button"
                        onClick={actualizar}
                        className="h-10 rounded-xl border border-primary px-4 text-sm font-semibold text-primary hover:bg-primary hover:text-white"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            {cargando && (
                <output className="block rounded-2xl bg-white p-6 text-text-muted">
                    Cargando asistencia del día…
                </output>
            )}

            {asistencia && (
                <>
                    <div
                        role="status"
                        className="flex flex-col gap-1 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-3"
                    >
                        {error ? (
                            <span className="flex items-center gap-1.5 font-semibold text-error">
                                <CircleAlert size={16} aria-hidden="true" />
                                No fue posible actualizar la información
                            </span>
                        ) : actualizando ? (
                            <span className="font-semibold text-text-muted">
                                Actualizando…
                            </span>
                        ) : (
                            <span className="flex items-center gap-1.5 font-semibold text-success-dark">
                                <CircleCheck size={16} aria-hidden="true" />
                                Información actualizada
                            </span>
                        )}
                        <span className="text-text-muted">
                            Última actualización:{" "}
                            {formatFechaHoraActualizacion(
                                asistencia.actualizadoEn,
                            )}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        <AsistenciaHoyIndicador
                            titulo="Empleados presentes"
                            valor={formatNumberCO(asistencia.presentes)}
                            Icono={UserCheck}
                            iconoEstilo="bg-success-light text-success-dark"
                        />
                        <AsistenciaHoyIndicador
                            titulo="Empleados ausentes"
                            valor={formatNumberCO(asistencia.ausentes)}
                            Icono={UserX}
                            iconoEstilo="bg-error-light text-error-dark"
                        />
                        <AsistenciaHoyIndicador
                            titulo="Empleados activos"
                            valor={formatNumberCO(asistencia.totalEmpleados)}
                            Icono={Users}
                            iconoEstilo="bg-secondary-dark text-primary"
                        />
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <label className="flex items-center gap-2 text-sm font-medium text-text">
                            <input
                                type="checkbox"
                                checked={mostrarAusentes}
                                onChange={(event) =>
                                    setMostrarAusentes(event.target.checked)
                                }
                                className="h-4 w-4 rounded border-gray-300 accent-primary"
                            />
                            Mostrar también los empleados ausentes
                        </label>
                        <p className="text-xs text-text-muted sm:text-sm">
                            Se actualiza automáticamente cada{" "}
                            {SEGUNDOS_ENTRE_ACTUALIZACIONES} segundos.
                        </p>
                    </div>

                    {asistencia.presentes === 0 && (
                        <p className="rounded-2xl bg-white p-6 text-text-muted">
                            No hay empleados con entrada registrada durante el
                            día.
                        </p>
                    )}

                    {visibles.length > 0 && (
                        <AsistenciaHoyTable
                            empleados={visibles}
                            actualizando={actualizando}
                        />
                    )}
                </>
            )}
        </section>
    );
}
