import type { ValidityStatus } from "../interfaces/types";

const STATUS_CONFIG: Record<ValidityStatus, { label: string; badge: string }> =
    {
        VIGENTE: {
            label: "Vigente",
            badge: "bg-success-light text-success-dark",
        },
        PROGRAMADA: {
            label: "Programada",
            badge: "bg-warning-light text-warning-dark",
        },
        HISTORICA: {
            label: "Histórica",
            badge: "bg-secondary-dark text-text-muted",
        },
    };

type ValidityStatusBadgeProps = {
    status: ValidityStatus;
};

export function ValidityStatusBadge({ status }: ValidityStatusBadgeProps) {
    const { label, badge } = STATUS_CONFIG[status];

    return (
        <span
            className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge}`}
        >
            {label}
        </span>
    );
}
