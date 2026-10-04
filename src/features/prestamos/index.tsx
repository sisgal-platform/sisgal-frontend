import { useState, type SubmitEvent } from "react";
import {
    RotateCcw,
    Search,
    TrendingDown,
    WalletCards,
} from "lucide-react";

import { formatCurrencyCOP, formatNumberCO } from "@/lib/formatters";

import { PrestamoIndicadorCard } from "./components/PrestamoIndicadorCard";
import { CreatePrestamoModal } from "./components/CreatePrestamoModal";
import { PrestamoDetailDialog } from "./components/PrestamoDetailDialog";
import { PrestamosTable } from "./components/PrestamosTable";
import { ESTADOS_PRESTAMO } from "./estadosPrestamo";
import { usePrestamos } from "./hooks/usePrestamos";
import { usePrestamosIndicadores } from "./hooks/usePrestamosIndicadores";
import type {
    FiltrosPrestamos,
    Prestamo,
    PrestamosIndicadores,
} from "./interfaces/types";
import { normalizarRangoFechas } from "./services/prestamosService";

const filtrosVacios: FiltrosPrestamos = {
    busqueda: "",
    estado: "",
    fechaDesde: "",
    fechaHasta: "",
};

const indicadores = [
    {
        titulo: "Préstamos Activos",
        Icono: WalletCards,
        iconoEstilo: "bg-warning-light text-warning",
        obtenerValor: ({ cantidadPrestamosActivos }: PrestamosIndicadores) =>
            formatNumberCO(cantidadPrestamosActivos),
    },
    {
        titulo: "Saldo Pendiente Total",
        Icono: TrendingDown,
        iconoEstilo: "bg-error-light text-error",
        obtenerValor: ({ montoTotalPrestamosActivos }: PrestamosIndicadores) =>
            formatCurrencyCOP(montoTotalPrestamosActivos),
    },
] as const;

export function PrestamosFeature() {
    const [filtros, setFiltros] = useState(filtrosVacios);
    const [filtrosAplicados, setFiltrosAplicados] = useState(filtrosVacios);
    const [prestamoDetalle, setPrestamoDetalle] = useState<Prestamo | null>(
        null,
    );
    const {
        indicadores: datos,
        cargando,
        error,
        recargar,
    } = usePrestamosIndicadores();
    const listado = usePrestamos(filtrosAplicados);

    function aplicarFiltros(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        const filtrosNormalizados = {
            ...filtros,
            ...normalizarRangoFechas(filtros),
        };
        setFiltros(filtrosNormalizados);
        setFiltrosAplicados(filtrosNormalizados);
    }

    function limpiarFiltros() {
        setFiltros(filtrosVacios);
        setFiltrosAplicados(filtrosVacios);
    }

    function actualizarFechaDesde(fechaDesde: string) {
        setFiltros((actual) => ({
            ...actual,
            ...normalizarRangoFechas({
                fechaDesde,
                fechaHasta: actual.fechaHasta,
            }),
        }));
    }

    function actualizarFechaHasta(fechaHasta: string) {
        setFiltros((actual) => ({
            ...actual,
            ...normalizarRangoFechas({
                fechaDesde: actual.fechaDesde,
                fechaHasta,
            }),
        }));
    }

    return (
        <section className="space-y-6 p-4">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    Préstamos
                </h1>
                <p className="text-sm text-primary-light sm:text-base">
                    Administra los préstamos otorgados a los empleados,
                    incluyendo el seguimiento de los saldos pendientes y la
                    gestión de nuevos préstamos.
                </p>
            </header>

            <section
                aria-label="Resumen de préstamos"
                aria-busy={cargando}
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
                {indicadores.map(
                    ({ titulo, Icono, iconoEstilo, obtenerValor }) => {
                        let valor = "—";
                        if (cargando) {
                            valor = "...";
                        } else if (datos) {
                            valor = obtenerValor(datos);
                        }

                        return (
                            <PrestamoIndicadorCard
                                key={titulo}
                                titulo={titulo}
                                valor={valor}
                                Icono={Icono}
                                iconoEstilo={iconoEstilo}
                            />
                        );
                    },
                )}
            </section>

            {error && (
                <div
                    role="alert"
                    className="flex flex-wrap items-center gap-3 text-sm text-error"
                >
                    <p>{error}</p>
                    <button
                        type="button"
                        onClick={recargar}
                        className="font-semibold underline underline-offset-2"
                    >
                        Reintentar
                    </button>
                </div>
            )}

            <section
                aria-labelledby="listado-prestamos-titulo"
                className="space-y-4"
            >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h2
                        id="listado-prestamos-titulo"
                        className="text-xl font-semibold text-primary"
                    >
                        Listado de préstamos
                    </h2>
                    <CreatePrestamoModal
                        onSuccess={() => {
                            listado.recargar();
                            recargar();
                        }}
                    />
                </div>

                <form
                    onSubmit={aplicarFiltros}
                    className="space-y-4 rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm"
                >
                    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(260px,1.8fr)_minmax(190px,1fr)_minmax(240px,1.2fr)_minmax(240px,1.2fr)]">
                        <div className="space-y-2">
                            <label
                                htmlFor="filtro-prestamo-busqueda"
                                className="text-sm font-medium text-text"
                            >
                                Nombre o número de documento
                            </label>
                            <input
                                id="filtro-prestamo-busqueda"
                                type="search"
                                value={filtros.busqueda}
                                onChange={(event) =>
                                    setFiltros({
                                        ...filtros,
                                        busqueda: event.target.value,
                                    })
                                }
                                placeholder="Buscar empleado o documento"
                                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                        <div className="space-y-2">
                            <label
                                htmlFor="filtro-prestamo-estado"
                                className="text-sm font-medium text-text"
                            >
                                Estado del préstamo
                            </label>
                            <select
                                id="filtro-prestamo-estado"
                                value={filtros.estado}
                                onChange={(event) =>
                                    setFiltros({
                                        ...filtros,
                                        estado: event.target
                                            .value as FiltrosPrestamos["estado"],
                                    })
                                }
                                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            >
                                <option value="">Todos los estados</option>
                                {ESTADOS_PRESTAMO.map((estado) => (
                                    <option
                                        key={estado.value}
                                        value={estado.value}
                                    >
                                        {estado.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="relative space-y-2">
                            <label
                                htmlFor="filtro-prestamo-fecha-desde"
                                className="text-sm font-medium text-text"
                            >
                                Fecha de otorgamiento desde
                            </label>
                            <input
                                id="filtro-prestamo-fecha-desde"
                                type="date"
                                value={filtros.fechaDesde}
                                onChange={(event) =>
                                    actualizarFechaDesde(event.target.value)
                                }
                                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />                            
                        </div>
                        <div className="relative space-y-2">
                            <label
                                htmlFor="filtro-prestamo-fecha-hasta"
                                className="text-sm font-medium text-text"
                            >
                                Fecha de otorgamiento hasta
                            </label>
                            <input
                                id="filtro-prestamo-fecha-hasta"
                                type="date"
                                value={filtros.fechaHasta}
                                onChange={(event) =>
                                    actualizarFechaHasta(event.target.value)
                                }
                                className="h-12 w-full rounded-xl border border-gray-300 bg-white px-4 text-base text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <button
                            type="button"
                            onClick={limpiarFiltros}
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
                            Aplicar filtros
                        </button>
                    </div>
                </form>

                <PrestamosTable
                    prestamos={listado.prestamos}
                    cargando={listado.cargando}
                    error={listado.error}
                    onReintentar={listado.recargar}
                    onVerDetalle={setPrestamoDetalle}
                />
            </section>

            {prestamoDetalle && (
                <PrestamoDetailDialog
                    key={prestamoDetalle.id}
                    prestamo={prestamoDetalle}
                    onOpenChange={(open) => {
                        if (!open) setPrestamoDetalle(null);
                    }}
                />
            )}
        </section>
    );
}
