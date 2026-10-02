import { useState, type SubmitEvent } from "react";
import {
    CalendarDays,
    Plus,
    RotateCcw,
    Search,
    TrendingDown,
    WalletCards,
} from "lucide-react";

import { formatCurrencyCOP, formatNumberCO } from "@/lib/formatters";

import { PrestamoIndicadorCard } from "./components/PrestamoIndicadorCard";
import { PrestamosTable } from "./components/PrestamosTable";
import { ESTADOS_PRESTAMO } from "./estadosPrestamo";
import { usePrestamosIndicadores } from "./hooks/usePrestamosIndicadores";
import type {
    FiltrosPrestamos,
    PrestamoFila,
    PrestamosIndicadores,
} from "./interfaces/types";

const prestamos: PrestamoFila[] = [];

const filtrosVacios: FiltrosPrestamos = {
    busqueda: "",
    estado: "",
    fecha: "",
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
    const {
        indicadores: datos,
        cargando,
        error,
        recargar,
    } = usePrestamosIndicadores();

    function aplicarFiltros(event: SubmitEvent<HTMLFormElement>) {
        event.preventDefault();
        setFiltrosAplicados(filtros);
    }

    function limpiarFiltros() {
        setFiltros(filtrosVacios);
        setFiltrosAplicados(filtrosVacios);
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
                    <button
                        type="button"
                        className="flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark"
                    >
                        <Plus size={18} aria-hidden="true" />
                        Crear préstamo
                    </button>
                </div>

                <form
                    onSubmit={aplicarFiltros}
                    className="grid grid-cols-1 gap-3 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm md:grid-cols-2 xl:grid-cols-[minmax(220px,1.5fr)_minmax(170px,1fr)_minmax(170px,1fr)_auto] xl:items-end"
                >
                    <div className="space-y-1.5">
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
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        />
                    </div>
                    <div className="space-y-1.5">
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
                            className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                        >
                            <option value="">Todos los estados</option>
                            {ESTADOS_PRESTAMO.map((estado) => (
                                <option key={estado.value} value={estado.value}>
                                    {estado.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label
                            htmlFor="filtro-prestamo-fecha"
                            className="text-sm font-medium text-text"
                        >
                            Fecha de última actualización
                        </label>
                        <div className="relative">
                            <input
                                id="filtro-prestamo-fecha"
                                type="date"
                                value={filtros.fecha}
                                onChange={(event) =>
                                    setFiltros({
                                        ...filtros,
                                        fecha: event.target.value,
                                    })
                                }
                                className="h-10 w-full rounded-lg border border-gray-300 bg-white px-3 pr-10 text-sm text-text outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                            />
                            <CalendarDays
                                size={17}
                                aria-hidden="true"
                                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-text-muted"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row xl:justify-end">
                        <button
                            type="button"
                            onClick={limpiarFiltros}
                            className="flex h-10 items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 text-sm font-semibold text-text hover:bg-secondary"
                        >
                            <RotateCcw size={16} aria-hidden="true" />
                            Limpiar filtros
                        </button>
                        <button
                            type="submit"
                            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-dark"
                        >
                            <Search size={16} aria-hidden="true" />
                            Aplicar filtros
                        </button>
                    </div>
                </form>

                <PrestamosTable
                    prestamos={prestamos}
                    filtros={filtrosAplicados}
                />
            </section>
        </section>
    );
}
