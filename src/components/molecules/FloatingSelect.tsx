import { type SelectHTMLAttributes, useId } from "react"

type FloatingSelectProps = Omit<SelectHTMLAttributes<HTMLSelectElement>, "id"> & {
  id?: string
  label: string
  required?: boolean
  error?: string
}

/**
 * Selector con la misma altura y "look" que FloatingInput, pero con la
 * etiqueta siempre fija arriba en pequeño: un <select> no tiene un estado
 * de "vacío" tan claro como un texto (siempre muestra alguna opción), así
 * que no aplica el truco de placeholder-shown.
 */
export function FloatingSelect({
  id: idProp,
  label,
  required,
  error,
  className = "",
  children,
  ...props
}: FloatingSelectProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        <label
          htmlFor={id}
          className="pointer-events-none absolute left-3 top-2 text-xs text-text-muted"
        >
          {label}
          {required && <span className="text-error"> *</span>}
        </label>

        <select
          id={id}
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`w-full rounded-lg border bg-white px-3 pb-2 pt-5 text-text outline-none transition-colors focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 ${
            error ? "border-error focus:border-error" : "border-gray-300 focus:border-primary"
          } ${className}`}
          {...props}
        >
          {children}
        </select>
      </div>

      {error && (
        <span id={errorId} role="alert" className="text-sm text-error">
          {error}
        </span>
      )}
    </div>
  )
}
