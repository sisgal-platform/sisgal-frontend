import { refresh } from './api'
import type { AuthTokens } from './types'
const TOKENS_KEY = 'sisgal.tokens'

export function readTokens(): AuthTokens | null {
  try {
    const raw = window.localStorage.getItem(TOKENS_KEY)
    if (!raw) return null
    return JSON.parse(raw) as AuthTokens
  } catch {
    return null
  }
}

export function writeTokens(tokens: AuthTokens): void {
  try {
    window.localStorage.setItem(TOKENS_KEY, JSON.stringify(tokens))
  } catch {
     // best-effort: no romper la app si el storage no está disponible.
  }
}

export function clearTokens(): void {
  try {
    window.localStorage.removeItem(TOKENS_KEY)
  } catch {
    // best-effort: ver writeTokens.
  }
}

const REFRESH_MARGIN_SECONDS = 60

function isNearExpiry(tokens: AuthTokens): boolean {
  const now = Math.floor(Date.now() / 1000)
  return tokens.expiresAt - now < REFRESH_MARGIN_SECONDS
}

export async function getValidAccessToken(): Promise<string> {
  const tokens = readTokens()
  if (!tokens) {
    throw new Error('Sesión no autenticada')
  }

  if (!isNearExpiry(tokens)) {
    return tokens.accessToken
  }

  try {
    const response = await refresh(tokens.refreshToken)
    writeTokens(response.tokens)
    return response.tokens.accessToken
  } catch (error) {
    clearTokens()
    throw error
  }
}