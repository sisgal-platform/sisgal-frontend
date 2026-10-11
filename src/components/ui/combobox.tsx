import { useEffect, useRef, useState } from "react"

export type ComboboxOption = {
    value: string
    label: string
}

type ComboboxProps = Readonly<{
    options: ComboboxOption[]
    value: string
    onChange: (value: string) => void
    loading?: boolean
    placeholder?: string
    allLabel?: string
    id?: string
}>

/**
 * Selector con búsqueda: un input de texto que filtra una lista desplegable de opciones.
 * No depende de ninguna librería externa (el proyecto no tiene Popover/cmdk instalado).
 */
export function Combobox({
    options,
    value,
    onChange,
    loading = false,
    placeholder = "Todos",
    allLabel = "Todos",
    id,
}: ComboboxProps) {
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState("")
    const containerRef = useRef<HTMLDivElement>(null)

    const selectedOption = options.find((option) => option.value === value)

    // Cierra el listado al hacer clic fuera, sin perder la selección ya hecha
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setOpen(false)
                setQuery("")
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    const filteredOptions = options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
    )

    function selectOption(optionValue: string) {
        onChange(optionValue)
        setQuery("")
        setOpen(false)
    }

    const listboxId = id ? `${id}-listbox` : undefined

    return (
        <div ref={containerRef} className="relative">
            <input
                id={id}
                type="text"
                role="combobox"
                aria-expanded={open}
                aria-controls={listboxId}
                value={open ? query : (selectedOption?.label ?? "")}
                onChange={(event) => {
                    setQuery(event.target.value)
                    if (!open) setOpen(true)
                }}
                onFocus={() => {
                    setOpen(true)
                    setQuery("")
                }}
                onKeyDown={(event) => {
                    if (event.key === "Escape") {
                        setOpen(false)
                        setQuery("")
                    }
                }}
                placeholder={loading ? "Cargando…" : placeholder}
                className="h-10 w-full rounded-xl border border-gray-300 bg-surface px-3 text-sm text-text"
            />

            {open && (
                <ul
                    id={listboxId}
                    role="listbox"
                    className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-lg"
                >
                    <li
                        role="option"
                        aria-selected={value === ""}
                        onMouseDown={(event) => {
                            event.preventDefault()
                            selectOption("")
                        }}
                        className="cursor-pointer px-3 py-2 text-sm text-text hover:bg-secondary"
                    >
                        {allLabel}
                    </li>
                    {filteredOptions.length === 0 ? (
                        <li className="px-3 py-2 text-sm text-text-muted">Sin coincidencias</li>
                    ) : (
                        filteredOptions.map((option) => (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={option.value === value}
                                onMouseDown={(event) => {
                                    event.preventDefault()
                                    selectOption(option.value)
                                }}
                                className="cursor-pointer px-3 py-2 text-sm text-text hover:bg-secondary"
                            >
                                {option.label}
                            </li>
                        ))
                    )}
                </ul>
            )}
        </div>
    )
}
