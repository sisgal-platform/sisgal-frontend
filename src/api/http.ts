import { readAccessToken } from '../auth/accessTokenStorage'

/** URL base del sisgal-core-service. */
const API_URL = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000').replace(/\/$/, '')

/** Error HTTP normalizado a partir del `ErrorResponseDto` del backend. */
export class ApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
}

/**
 * Cliente HTTP compartido: agrega el token de Supabase como Bearer y traduce
 * las respuestas de error del backend a `ApiError` con un mensaje legible.
 */
export async function request<T>(
  path: string,
  { method = 'GET', body }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = { Accept: 'application/json' }
  const token = readAccessToken()

  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  let response: Response
  try {
    response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
    })
  } catch {
    throw new ApiError(0, 'No fue posible conectar con el servidor. Intenta de nuevo.')
  }

  if (!response.ok) {
    throw new ApiError(response.status, await readErrorMessage(response))
  }

  if (response.status === 204) return undefined as T

  return (await response.json()) as T
}

async function readErrorMessage(response: Response): Promise<string> {
  try {
    const data: unknown = await response.json()
    const message = (data as { message?: unknown } | null)?.message

    // El ValidationPipe devuelve un arreglo con un mensaje por regla incumplida.
    if (Array.isArray(message)) return message.join('. ')
    if (typeof message === 'string' && message) return message
  } catch {
    // Cuerpo vacío o no JSON: se usa el mensaje genérico.
  }

  return 'Ocurrió un error inesperado. Intenta de nuevo.'
}
