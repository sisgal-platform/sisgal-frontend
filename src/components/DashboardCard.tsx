import type { LucideIcon } from 'lucide-react';

interface DashboardCardProps {
  title: string;
  value: number;
  label: string;
  icon: LucideIcon;
  color: 'primary' | 'success' | 'warning' | 'text';
  actionLabel: string;
  onAction?: () => void;
  actionIcon?: LucideIcon;
}

const colorConfig = {
  primary: {
    icon: 'bg-blue-100 text-primary',
    value: 'text-primary',
    button:
      'border-primary text-primary hover:bg-primary hover:text-white',
  },

  success: {
    icon: 'bg-success-light text-success',
    value: 'text-success',
    button:
      'bg-success text-white hover:bg-success-dark',
  },

  warning: {
    icon: 'bg-warning-light text-warning',
    value: 'text-warning',
    button:
      'bg-warning text-white hover:bg-warning-dark',
  },

  text: {
    icon: 'bg-secondary text-text-muted',
    value: 'text-text-muted',
    button:
      'bg-text-muted text-white hover:bg-gray-600',
  },
};

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
    <article className="flex min-h-[265px] flex-col rounded-2xl border border-gray-200 bg-surface p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${styles.icon}`}
        >
          <Icon size={28} strokeWidth={2} />
        </div>

        <h2 className="text-xl font-semibold text-text">
          {title}
        </h2>
      </div>

      {/* Value */}
      <div className="mt-7 flex items-baseline gap-3">
        <span
          className={`text-6xl font-bold leading-none ${styles.value}`}
        >
          {value}
        </span>

        <span className="text-base text-text-muted">
          {label}
        </span>
      </div>

      {/* Action */}
      <button
        type="button"
        onClick={onAction}
        className={`mt-auto flex h-11 w-full items-center justify-center gap-2 rounded-xl  px-4 text-base font-semibold transition-colors ${styles.button}`}
      >
        {actionLabel}

        {ActionIcon && (
          <ActionIcon size={20} strokeWidth={2} />
        )}
      </button>
    </article>
  );
};