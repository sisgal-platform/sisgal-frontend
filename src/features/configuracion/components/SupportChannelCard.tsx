import type { SupportChannel } from "../constants/supportChannels";

type SupportChannelCardProps = {
    channel: SupportChannel;
};

export function SupportChannelCard({ channel }: SupportChannelCardProps) {
    const { label, value, href, Icon, iconClass } = channel;

    return (
        <article className="flex min-w-0 items-start gap-3 rounded-lg border border-gray-200 bg-surface p-4">
            <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${iconClass}`}
            >
                <Icon size={20} aria-hidden="true" />
            </span>
            <div className="min-w-0 space-y-1">
                <h3 className="text-sm font-semibold text-text">{label}</h3>
                {href ? (
                    <a
                        href={href}
                        className="break-words text-sm text-primary underline underline-offset-2 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-sm text-text-muted">{value}</p>
                )}
            </div>
        </article>
    );
}