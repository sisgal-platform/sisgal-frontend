import { useState } from "react";
import { CircleX, FingerprintPattern, LogIn, LogOut } from "lucide-react";

import { useEmpleadosFiltro } from "../hooks/useEmpleadosFiltro";
import {
    type EstadoLector,
    useLectorSimulado,
} from "../hooks/useLectorSimulado";
import type { Marcacion } from "../interfaces/types";
import { formatHoraMarcacion, formatHorasTrabajadas } from "../utils/fechas";

type QuienMarca = "empleado" | "desconocido";

/**
 * Huella que no coincide con ningún empleado: los documentos solo tienen
 * dígitos, así que simula a una persona sin huella registrada.
 */
export const HUELLA_NO_REGISTRADA = "huella-no-registrada";

const estiloCampo =
    "h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-secondary";

type LectorHuellaSimuladoProps = Readonly<{
    /** Permite acortar la lectura en las pruebas. */
    duracionLecturaMs?: number;
}>;

/**
 * Lector de huella simulado: hace el papel del dispositivo físico, que el
 * proyecto aún no tiene. El panel de simulación elige quién coloca el dedo.
 */
export function LectorHuellaSimulado({
    duracionLecturaMs,
}: LectorHuellaSimuladoProps) {
    const { empleados, cargando, error } = useEmpleadosFiltro();
    const { estado, colocarDedo } = useLectorSimulado(duracionLecturaMs);
    const [quienMarca, setQuienMarca] = useState<QuienMarca>("empleado");
    const [documento, setDocumento] = useState("");
    const [fallaLector, setFallaLector] = useState(false);

    const leyendo = estado.fase === "leyendo";
    const puedeColocarDedo =
        !leyendo && (quienMarca === "desconocido" || documento !== "");

    function alColocarDedo() {
        void colocarDedo(
            fallaLector
                ? { capturaExitosa: false }
                : {
                      capturaExitosa: true,
                      huella:
                          quienMarca === "empleado"
                              ? documento
                              : HUELLA_NO_REGISTRADA,
                  },
        );
    }

    return (
        <section aria-labelledby="lector-huella-titulo" className="space-y-4">
            <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                    <h2
                        id="lector-huella-titulo"
                        className="text-xl font-semibold text-primary"
                    >
                        Lector de huella
                    </h2>
                    <span className="rounded-full bg-warning-light px-3 py-1 text-xs font-semibold text-warning-dark">
                        Simulado
                    </span>
                </div>
                <p className="text-sm text-text sm:text-base">
                    El proyecto aún no cuenta con el lector físico; esta
                    pantalla cumple su papel. La hora de cada marcación la
                    asigna el servidor.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
                <div className="flex flex-col items-center gap-6 rounded-3xl bg-primary-dark p-6 sm:p-8">
                    <PantallaLector estado={estado} />

                    <button
                        type="button"
                        onClick={alColocarDedo}
                        disabled={!puedeColocarDedo}
                        aria-label="Colocar el dedo en el lector"
                        className="flex h-28 w-28 items-center justify-center rounded-full border-4 border-white/30 bg-primary-light text-white transition hover:border-white/60 focus:outline-none focus-visible:ring-4 focus-visible:ring-white/40 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FingerprintPattern
                            size={56}
                            aria-hidden="true"
                            className={leyendo ? "animate-pulse" : undefined}
                        />
                    </button>

                    <p className="text-sm text-white/80">
                        {leyendo
                            ? "Leyendo…"
                            : "Toca el sensor para colocar el dedo"}
                    </p>
                </div>

                <div className="space-y-5 rounded-2xl bg-white p-6">
                    <h3 className="text-base font-semibold text-primary">
                        Simulación
                    </h3>

                    <fieldset className="space-y-3" disabled={leyendo}>
                        <legend className="mb-3 text-sm font-medium text-text">
                            ¿Quién coloca el dedo?
                        </legend>

                        <label className="flex items-center gap-2 text-sm text-text">
                            <input
                                type="radio"
                                name="quien-marca"
                                checked={quienMarca === "empleado"}
                                onChange={() => setQuienMarca("empleado")}
                                className="h-4 w-4 accent-primary"
                            />
                            Un empleado
                        </label>

                        <div className="space-y-2 pl-6">
                            <label
                                htmlFor="lector-empleado"
                                className="sr-only"
                            >
                                Empleado
                            </label>
                            <select
                                id="lector-empleado"
                                value={documento}
                                onChange={(event) =>
                                    setDocumento(event.target.value)
                                }
                                disabled={quienMarca !== "empleado"}
                                className={estiloCampo}
                            >
                                <option value="">
                                    {cargando
                                        ? "Cargando empleados…"
                                        : "Selecciona un empleado"}
                                </option>
                                {empleados.map((empleado) => (
                                    <option
                                        key={empleado.id}
                                        value={empleado.document}
                                    >
                                        {empleado.firstName}{" "}
                                        {empleado.lastName} —{" "}
                                        {empleado.document}
                                        {empleado.status === "INACTIVO"
                                            ? " (inactivo)"
                                            : ""}
                                    </option>
                                ))}
                            </select>
                            {error && (
                                <p className="text-sm text-error">{error}</p>
                            )}
                        </div>

                        <label className="flex items-center gap-2 text-sm text-text">
                            <input
                                type="radio"
                                name="quien-marca"
                                checked={quienMarca === "desconocido"}
                                onChange={() => setQuienMarca("desconocido")}
                                className="h-4 w-4 accent-primary"
                            />
                            Una persona sin huella registrada
                        </label>
                    </fieldset>

                    <label className="flex items-center gap-2 border-t border-secondary-dark pt-4 text-sm text-text">
                        <input
                            type="checkbox"
                            checked={fallaLector}
                            onChange={(event) =>
                                setFallaLector(event.target.checked)
                            }
                            disabled={leyendo}
                            className="h-4 w-4 rounded border-gray-300 accent-primary"
                        />
                        Simular una falla del lector
                    </label>
                </div>
            </div>
        </section>
    );
}

function PantallaLector({ estado }: Readonly<{ estado: EstadoLector }>) {
    return (
        <div
            role="status"
            className="flex min-h-48 w-full max-w-md flex-col items-center justify-center gap-2 rounded-2xl bg-white p-6 text-center"
        >
            {estado.fase === "esperando" && (
                <p className="text-lg text-text-muted">
                    Coloque su dedo en el lector
                </p>
            )}

            {estado.fase === "leyendo" && (
                <p className="text-lg font-semibold text-primary">
                    Leyendo huella…
                </p>
            )}

            {estado.fase === "registrada" && (
                <MarcacionRegistrada marcacion={estado.marcacion} />
            )}

            {estado.fase === "rechazada" && (
                <>
                    <CircleX
                        size={36}
                        aria-hidden="true"
                        className="text-error"
                    />
                    <p className="text-lg font-semibold text-error">
                        {estado.mensaje}
                    </p>
                </>
            )}
        </div>
    );
}

function MarcacionRegistrada({
    marcacion,
}: Readonly<{ marcacion: Marcacion }>) {
    const esEntrada = marcacion.tipo === "ENTRADA";
    const Icono = esEntrada ? LogIn : LogOut;

    return (
        <>
            <Icono size={36} aria-hidden="true" className="text-success" />
            <p className="text-xl font-semibold text-success-dark">
                {esEntrada ? "Entrada registrada" : "Salida registrada"}
            </p>
            <p className="text-lg font-semibold text-text">
                {marcacion.empleadoNombre}
            </p>
            <p className="text-sm text-text-muted">
                {formatHoraMarcacion(marcacion.fechaHora)}
                {marcacion.sucursalNombre && ` · ${marcacion.sucursalNombre}`}
            </p>
            {marcacion.salida && marcacion.minutosTrabajados !== null && (
                <p className="text-sm text-text">
                    Jornada: {formatHoraMarcacion(marcacion.entrada)} –{" "}
                    {formatHoraMarcacion(marcacion.salida)} ·{" "}
                    {formatHorasTrabajadas(marcacion.minutosTrabajados)}
                </p>
            )}
        </>
    );
}
