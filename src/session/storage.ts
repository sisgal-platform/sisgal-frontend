import { EMPTY_SESSION, type SessionState } from './types'

export const SESSION_STORAGE_KEY = 'sisgal.session'

/**
 * Lee la sesión persistida. Cualquier fallo (modo privado, storage deshabilitado,
 * JSON corrupto) degrada a una sesión vacía en lugar de romper el arranque.
 */
export function readSession(): SessionState {
  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY)
    if (!raw) return EMPTY_SESSION

    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null) return EMPTY_SESSION

    const candidate = parsed as Partial<SessionState>
    return {
      user: candidate.user ?? null,
      lastModule: candidate.lastModule ?? null,
      startedAt: candidate.startedAt ?? null,
    }
  } catch {
    return EMPTY_SESSION
  }
}

export function writeSession(state: SessionState): void {
  try {
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Persistir es best-effort: la sesión en memoria sigue siendo válida.
  }
}

export function clearSession(): void {
  try {
    window.sessionStorage.removeItem(SESSION_STORAGE_KEY)
  } catch {
    // Sin acción: ver writeSession.
  }
}
