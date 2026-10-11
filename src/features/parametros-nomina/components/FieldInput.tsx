import type { InputHTMLAttributes } from "react";

type FieldInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
    id: string;
    label: string;
    error?: string;
    hint?: string;
};

/** Campo obligatorio con su etiqueta y el mensaje de validación junto a él. */
export function FieldInput({
    id,
    label,
    error,
    hint,
    ...props
}: FieldInputProps) {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    const describedBy =
        [error ? errorId : null, hint ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined;

    return (
        <div className="flex flex-col gap-1">
            <label htmlFor={id} className="text-sm font-semibold text-text">
                {label}{" "}
                <span aria-hidden="true" className="text-error">
                    *
                </span>
            </label>
            <input
                id={id}
                required
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy}
                className="h-11 rounded-xl border border-gray-300 px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-[invalid]:border-error"
                {...props}
            />
            {hint && (
                <p id={hintId} className="text-xs text-text-muted">
                    {hint}
                </p>
            )}
            {error && (
                <p id={errorId} className="text-sm text-error">
                    {error}
                </p>
            )}
        </div>
    );
}
