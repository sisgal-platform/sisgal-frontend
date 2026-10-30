import { type InputHTMLAttributes, useId } from "react"

type FloatingInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id" | "placeholder"> & {
  id?: string
  label: string
  required?: boolean
  error?: string
  /** Símbolo fijo antes del valor, por ejemplo "$" para salario. */
  prefix?: string
}

/**
 * Campo de texto con etiqueta flotante (patrón "Material" / Gmail): la
 * etiqueta vive dentro del input y sube cuando hay foco o contenido.
 *
 * Usa el truco de Tailwind con `placeholder=" "` (un espacio, no vacío) para
 * que `:placeholder-shown` solo sea verdadero cuando el campo está realmente
 * vacío. La etiqueta sigue siendo un <label htmlFor> real, así que la
 * asociación con el input para lectores de pantalla no se pierde.
 */
export function FloatingInput({
  id: idProp,
  label,
  required,
  error,
  prefix,
  className = "",
  ...props
}: FloatingInputProps) {
  const generatedId = useId()
  const id = idProp ?? generatedId
  const errorId = error ? `${id}-error` : undefined

  return (
    <div className="flex flex-col gap-1">
      <div className="relative">
        {prefix && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted peer-focus:text-primary">
            {prefix}
          </span>
        )}

        <input
          id={id}
          placeholder=" "
          aria-invalid={!!error}
          aria-describedby={errorId}
          className={`peer w-full rounded-lg border px-3 pb-2 pt-5 text-text outline-none transition-colors focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:bg-gray-100 ${
            prefix ? "pl-6" : ""
          } ${error ? "border-error focus:border-error" : "border-gray-300 focus:border-primary"} ${className}`}
          {...props}
        />

        <label
          htmlFor={id}
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-text-muted transition-all
            peer-placeholder-shown:text-base peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2
            peer-focus:top-2 peer-focus:translate-y-0 peer-focus:text-xs peer-focus:text-primary
            peer-[:not(:placeholder-shown)]:top-2 peer-[:not(:placeholder-shown)]:translate-y-0 peer-[:not(:placeholder-shown)]:text-xs
            ${prefix ? "left-6" : "left-3"}`}
        >
          {label}
          {required && <span className="text-error"> *</span>}
        </label>
      </div>

      {error && (
        <span id={errorId} role="alert" className="text-sm text-error">
          {error}
        </span>
      )}
    </div>
  )
}
