import { TrendingDown, WalletCards } from "lucide-react";

const indicadores = [
    {
        titulo: "Préstamos Activos",
        valor: "2",
        Icono: WalletCards,
        iconoEstilo: "bg-warning-light text-warning",
    },
    {
        titulo: "Saldo Pendiente Total",
        valor: "$4,000",
        Icono: TrendingDown,
        iconoEstilo: "bg-error-light text-error",
    },
] as const;

export function PrestamosFeature() {
    return (
        <section className="space-y-6 p-4">
            <header className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight text-primary sm:text-4xl">
                    Préstamos
                </h1>
                <p className="text-sm text-primary-light sm:text-base">
                    Administra los préstamos otorgados a los empleados, incluyendo el seguimiento de los saldos pendientes y la gestión de nuevos préstamos.
                </p>
            </header>

            <section
                aria-label="Resumen de préstamos"
                className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
                {indicadores.map(({ titulo, valor, Icono, iconoEstilo }) => (
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
                ))}
            </section>
        </section>
    );
}
