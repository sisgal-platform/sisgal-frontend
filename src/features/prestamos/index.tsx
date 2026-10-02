import { TrendingDown, WalletCards } from "lucide-react";

import { usePrestamosIndicadores } from "./hooks/usePrestamosIndicadores";
import type { PrestamosIndicadores } from "./interfaces/types";

const indicadores = [
    {
        titulo: "Préstamos Activos",
        Icono: WalletCards,
        iconoEstilo: "bg-warning-light text-warning",
        obtenerValor: ({ cantidadPrestamosActivos }: PrestamosIndicadores) =>
            new Intl.NumberFormat("es-CO").format(cantidadPrestamosActivos),
    },
    {
        titulo: "Saldo Pendiente Total",
        Icono: TrendingDown,
        iconoEstilo: "bg-error-light text-error",
        obtenerValor: ({ montoTotalPrestamosActivos }: PrestamosIndicadores) =>
            `$${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(montoTotalPrestamosActivos)}`,
    },
] as const;

export function PrestamosFeature() {
    const {
        indicadores: datos,
        cargando,
        error,
        recargar,
    } = usePrestamosIndicadores();

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
                            <article
                                key={titulo}
                                className="flex min-h-32 items-center gap-5 rounded-2xl border border-gray-200 bg-surface px-5 py-6 shadow-sm sm:px-6"
                            >
                                <div
                                    className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl sm:h-16 sm:w-16 ${iconoEstilo}`}
                                >
                                    <Icono
                                        size={26}
                                        strokeWidth={2}
                                        aria-hidden="true"
                                    />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-base font-medium text-primary-light sm:text-lg">
                                        {titulo}
                                    </h2>
                                    <p className="text-3xl font-bold leading-tight text-primary sm:text-4xl">
                                        {valor}
                                    </p>
                                </div>
                            </article>
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
        </section>
    );
}
