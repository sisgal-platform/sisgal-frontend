import { isAxiosError } from "axios";

const MENSAJE_GENERICO = "Ocurrió un error inesperado. Intenta de nuevo.";

/** Error HTTP normalizado a partir del `ErrorResponseDto` del backend. */
export class ApiError extends Error {
    readonly status: number;

    constructor(status: number, message: string) {
        super(message);
        this.name = "ApiError";
        this.status = status;
    }
}

/**
 * Traduce un error de axios a `ApiError` con un mensaje legible para la UI.
 * Sin respuesta (red caída, CORS) el estado es 0.
 */
export function toApiError(error: unknown): ApiError {
    if (!isAxiosError(error)) return new ApiError(0, MENSAJE_GENERICO);

    if (!error.response) {
        return new ApiError(
            0,
            "No fue posible conectar con el servidor. Intenta de nuevo.",
        );
    }

    const message = (error.response.data as { message?: unknown } | null)
        ?.message;

    // El ValidationPipe devuelve un arreglo con un mensaje por regla incumplida.
    if (Array.isArray(message)) {
        return new ApiError(error.response.status, message.join(". "));
    }
    if (typeof message === "string" && message) {
        return new ApiError(error.response.status, message);
    }

    return new ApiError(error.response.status, MENSAJE_GENERICO);
}
