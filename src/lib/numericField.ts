import {
    useLayoutEffect,
    useRef,
    type ChangeEvent,
    type RefObject,
} from "react";

export type NumericFieldOptions = {
    /** Decimales que admite el campo. */
    maxDecimals?: number;
    /**
     * Si el punto también escribe decimales. Sirve para porcentajes, donde no
     * hay miles; en valores en pesos el punto se ignora porque quien escribe
     * "1.250.000" lo usa como separador de miles.
     */
    dotIsDecimal?: boolean;
};

const DECIMAL_SEPARATOR = ",";
const THOUSANDS_SEPARATOR = ".";

/** Convierte lo que escribe el usuario ("1.250,5") al valor del formulario ("1250.5"). */
export function parseNumericText(
    text: string,
    { maxDecimals = 2, dotIsDecimal = false }: NumericFieldOptions = {},
): string {
    const normalized = dotIsDecimal ? text.replaceAll(".", ",") : text;
    const [integer, ...decimalParts] = normalized
        .replace(/[^\d,]/g, "")
        .split(DECIMAL_SEPARATOR);
    const integerDigits = integer.replace(/^0+(?=\d)/, "");

    if (decimalParts.length === 0 || maxDecimals === 0) return integerDigits;

    const decimals = decimalParts.join("").slice(0, maxDecimals);
    return `${integerDigits || "0"}.${decimals}`;
}

/** Muestra el valor del formulario ("1250.5") con separadores ("1.250,5"). */
export function formatNumericValue(value: string): string {
    if (!value) return "";

    const [integer, decimals] = value.split(".");
    const grouped = integer.replace(
        /\B(?=(\d{3})+(?!\d))/g,
        THOUSANDS_SEPARATOR,
    );

    return decimals === undefined
        ? grouped
        : `${grouped}${DECIMAL_SEPARATOR}${decimals}`;
}

function countSignificantChars(text: string, dotIsDecimal: boolean): number {
    return (text.match(dotIsDecimal ? /[\d,.]/g : /[\d,]/g) ?? []).length;
}

function caretAfterSignificantChars(text: string, count: number): number {
    let seen = 0;

    for (let index = 0; index < text.length && seen < count; index += 1) {
        if (text[index] !== THOUSANDS_SEPARATOR) seen += 1;
        if (seen === count) return index + 1;
    }

    return count === 0 ? 0 : text.length;
}

type NumericFieldProps = {
    ref: RefObject<HTMLInputElement | null>;
    type: "text";
    inputMode: "decimal" | "numeric";
    autoComplete: "off";
    value: string;
    onChange: (event: ChangeEvent<HTMLInputElement>) => void;
};

/**
 * Props para un input numérico que muestra separadores de miles y decimales
 * mientras se escribe. El formulario sigue trabajando con el valor sin formato
 * ("1250.5"), que se convierte con `Number`.
 */
export function useNumericField(
    value: string,
    onValueChange: (value: string) => void,
    options: NumericFieldOptions = {},
): NumericFieldProps {
    const ref = useRef<HTMLInputElement>(null);
    const pendingCaret = useRef<number | null>(null);
    const text = formatNumericValue(value);
    const { maxDecimals = 2, dotIsDecimal = false } = options;

    // Al insertar separadores el cursor no debe saltar al final del campo.
    useLayoutEffect(() => {
        if (pendingCaret.current === null || !ref.current) return;

        const caret = caretAfterSignificantChars(
            ref.current.value,
            pendingCaret.current,
        );
        ref.current.setSelectionRange(caret, caret);
        pendingCaret.current = null;
    });

    return {
        ref,
        type: "text",
        inputMode: maxDecimals > 0 ? "decimal" : "numeric",
        autoComplete: "off",
        value: text,
        onChange: (event) => {
            const typed = event.target.value;
            const caret = event.target.selectionStart ?? typed.length;

            pendingCaret.current = countSignificantChars(
                typed.slice(0, caret),
                dotIsDecimal,
            );
            onValueChange(parseNumericText(typed, options));
        },
    };
}
