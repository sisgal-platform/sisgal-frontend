import type { LucideIcon } from "lucide-react";

export interface DashboardCardProps {
    title: string;
    value: number;
    label: string;
    icon: LucideIcon;
    color: "primary" | "success" | "warning" | "text";
    actionLabel: string;
    onAction?: () => void;
    actionIcon?: LucideIcon;
}

const colorConfig = {
    primary: {
        icon: "bg-blue-100 text-primary",
        value: "text-primary",
        button: "border-primary text-primary hover:bg-primary hover:text-white",
    },
    success: {
        icon: "bg-success-light text-success",
        value: "text-success",
        button: "bg-success text-white hover:bg-success-dark",
    },
    warning: {
        icon: "bg-warning-light text-warning",
        value: "text-warning",
        button: "bg-warning text-white hover:bg-warning-dark",
    },
    text: {
        icon: "bg-secondary text-text-muted",
        value: "text-text-muted",
        button: "bg-text-muted text-white hover:bg-gray-600",
    },
} as const;

export const DashboardCard = ({
    title,
    value,
    label,
    icon: Icon,
    color,
    actionLabel,
    onAction,
    actionIcon: ActionIcon,
}: DashboardCardProps) => {
    const styles = colorConfig[color];

    return (
        <article className="flex min-h-[220px] flex-col rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm sm:min-h-[240px] sm:p-5 lg:min-h-[265px]">
            <div className="flex items-center gap-3 sm:gap-4">
                <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl sm:h-14 sm:w-14 ${styles.icon}`}
                >
                    <Icon size={24} strokeWidth={2} className="sm:h-7 sm:w-7" />
                </div>

                <h2 className="text-lg font-semibold text-text sm:text-xl">
                    {title}
                </h2>
            </div>

            <div className="mt-6 flex items-baseline gap-2 sm:mt-7 sm:gap-3">
                <span
                    className={`text-4xl font-bold leading-none sm:text-5xl lg:text-6xl ${styles.value}`}
                >
                    {value}
                </span>

                <span className="text-sm text-text-muted sm:text-base">
                    {label}
                </span>
            </div>

            <button
                type="button"
                onClick={onAction}
                className={`mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition-colors sm:text-base ${styles.button}`}
            >
                {actionLabel}

                {ActionIcon && (
                    <ActionIcon
                        size={18}
                        strokeWidth={2}
                        className="sm:h-5 sm:w-5"
                    />
                )}
            </button>
        </article>
    );
};
