type SectionHeaderProps = {
    eyebrow?: string;
    title: string;
    description?: string;
};

export function SectionHeader({
    eyebrow,
    title,
    description,
}: SectionHeaderProps) {
    return (
        <header className="space-y-1">
            {eyebrow ? (
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                    {eyebrow}
                </p>
            ) : null}
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
                {title}
            </h2>
            {description ? (
                <p className="text-sm text-slate-600">{description}</p>
            ) : null}
        </header>
    );
}
