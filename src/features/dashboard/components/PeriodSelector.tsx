import { Search } from "lucide-react"

type PeriodSelectorProps = Readonly<{
    from: string
    to: string
    onFromChange: (value: string) => void
    onToChange: (value: string) => void
    onApply: () => void
}>

export function PeriodSelector({ from, to, onFromChange, onToChange, onApply }: PeriodSelectorProps) {
    return (
        <form
            onSubmit={(event) => {
                event.preventDefault()
                onApply()
            }}
            className="flex flex-wrap items-end gap-4 rounded-2xl border border-gray-200 bg-surface p-4 shadow-sm"
        >
            <label className="flex w-40 flex-col gap-1 text-sm text-text-muted">
                Desde
                <input
                    type="date"
                    value={from}
                    onChange={(event) => onFromChange(event.target.value)}
                    className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                />
            </label>

            <label className="flex w-40 flex-col gap-1 text-sm text-text-muted">
                Hasta
                <input
                    type="date"
                    value={to}
                    onChange={(event) => onToChange(event.target.value)}
                    className="h-10 rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
                />
            </label>

            <button
                type="submit"
                className="flex h-10 items-center justify-center gap-2 rounded-xl bg-primary px-4 text-sm font-semibold text-white transition hover:bg-primary-dark"
            >
                <Search size={16} aria-hidden="true" />
                Consultar
            </button>
        </form>
    )
}
