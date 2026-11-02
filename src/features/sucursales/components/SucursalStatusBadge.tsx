type SucursalStatusBadgeProps = {
    active: boolean;
};

export function SucursalStatusBadge({ active }: SucursalStatusBadgeProps) {
    return (
        <span
            className={
                active
                    ? "rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700"
                    : "rounded-full bg-slate-200 px-2 py-1 text-xs font-medium text-slate-700"
            }
        >
            {active ? "Activo" : "Inactivo"}
        </span>
    );
}
