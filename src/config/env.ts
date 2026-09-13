const DEFAULT_API_BASE_URL = 'http://localhost:3000'

/** Base URL del backend. En producción se inyecta vía VITE_API_BASE_URL. */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL ?? DEFAULT_API_BASE_URL

/** Prefijo del módulo de autenticación (ver BACKEND_CONTEXT.md). */
export const AUTH_URL = `${API_BASE_URL}/auth`