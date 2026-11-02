import type { LucideIcon } from "lucide-react";

type AsistenciaHoyIndicadorProps = Readonly<{
    titulo: string;
    valor: string;
    Icono: LucideIcon;
    iconoEstilo: string;
}>;

export function AsistenciaHoyIndicador({
    titulo,
    valor,
    Icono,
    iconoEstilo,
}: AsistenciaHoyIndicadorProps) {
    return (
        <article className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-surface px-5 py-5 shadow-sm">
            <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconoEstilo}`}
            >
                <Icono size={24} strokeWidth={2} aria-hidden="true" />
            </div>
            <div className="min-w-0">
                <h3 className="text-sm font-medium text-primary-light sm:text-base">
                    {titulo}
                </h3>
                <p className="text-3xl font-bold leading-tight text-primary">
                    {valor}
                </p>
            </div>
        </article>
    );
}
