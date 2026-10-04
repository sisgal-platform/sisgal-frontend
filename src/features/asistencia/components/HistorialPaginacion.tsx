import { ChevronLeft, ChevronRight } from "lucide-react";

import { formatNumberCO } from "@/lib/formatters";

import type { ResultadosPorPagina } from "../interfaces/types";

const RESULTADOS_POR_PAGINA: readonly ResultadosPorPagina[] = [10, 25, 50];

type HistorialPaginacionProps = Readonly<{
    pagina: number;
    porPagina: ResultadosPorPagina;
    total: number;
    totalPaginas: number;
    onCambiarPagina: (pagina: number) => void;
    onCambiarPorPagina: (porPagina: ResultadosPorPagina) => void;
}>;

export function HistorialPaginacion({
    pagina,
    porPagina,
    total,
    totalPaginas,
    onCambiarPagina,
    onCambiarPorPagina,
}: HistorialPaginacionProps) {
    const primero = (pagina - 1) * porPagina + 1;
    const ultimo = Math.min(pagina * porPagina, total);

    return (
        <nav
            aria-label="Paginación del historial"
            className="flex flex-col gap-3 text-sm text-text-muted lg:flex-row lg:items-center lg:justify-between"
        >
            <label className="flex items-center gap-2">
                Resultados por página
                <select
                    value={porPagina}
                    onChange={(event) =>
                        onCambiarPorPagina(
                            Number(event.target.value) as ResultadosPorPagina,
                        )
                    }
                    className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                    {RESULTADOS_POR_PAGINA.map((cantidad) => (
                        <option key={cantidad} value={cantidad}>
                            {cantidad}
                        </option>
                    ))}
                </select>
            </label>

            <p>
                Mostrando {formatNumberCO(primero)}–{formatNumberCO(ultimo)} de{" "}
                {formatNumberCO(total)} registros
            </p>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={pagina <= 1}
                    onClick={() => onCambiarPagina(pagina - 1)}
                    className="flex h-10 items-center gap-1 rounded-xl border border-gray-300 px-3 font-semibold text-text transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <ChevronLeft size={16} aria-hidden="true" />
                    Anterior
                </button>
                <span
                    aria-current="page"
                    className="px-2 font-semibold text-primary sm:whitespace-nowrap"
                >
                    Página {formatNumberCO(pagina)} de{" "}
                    {formatNumberCO(totalPaginas)}
                </span>
                <button
                    type="button"
                    disabled={pagina >= totalPaginas}
                    onClick={() => onCambiarPagina(pagina + 1)}
                    className="flex h-10 items-center gap-1 rounded-xl border border-gray-300 px-3 font-semibold text-text transition hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-40"
                >
                    Siguiente
                    <ChevronRight size={16} aria-hidden="true" />
                </button>
            </div>
        </nav>
    );
}
