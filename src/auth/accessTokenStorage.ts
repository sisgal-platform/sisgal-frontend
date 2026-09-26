export const ACCESS_TOKEN_STORAGE_KEY = 'sisgal.access_token';

export function readAccessToken(): string | null {
  try {
    return window.sessionStorage.getItem(
      ACCESS_TOKEN_STORAGE_KEY,
    );
  } catch {
    return null;
  }
}

export function writeAccessToken(token: string): void {
  try {
    window.sessionStorage.setItem(
      ACCESS_TOKEN_STORAGE_KEY,
      token,
    );
  } catch {
    // Persistir es best-effort.
  }
}

export function clearAccessToken(): void {
  try {
    window.sessionStorage.removeItem(
      ACCESS_TOKEN_STORAGE_KEY,
    );
  } catch {
    // Sin acción.
  }
}