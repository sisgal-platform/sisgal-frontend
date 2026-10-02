import type { LucideIcon } from "lucide-react";

type PrestamoIndicadorCardProps = Readonly<{
    titulo: string;
    valor: string;
    Icono: LucideIcon;
    iconoEstilo: string;
}>;

export function PrestamoIndicadorCard({
    titulo,
    valor,
    Icono,
    iconoEstilo,
}: PrestamoIndicadorCardProps) {
    return (
        <article className="flex min-h-32 items-center gap-5 rounded-2xl border border-gray-200 bg-surface px-5 py-6 shadow-sm sm:px-6">
            <div
                className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl sm:h-16 sm:w-16 ${iconoEstilo}`}
            >
                <Icono size={26} strokeWidth={2} aria-hidden="true" />
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
}
