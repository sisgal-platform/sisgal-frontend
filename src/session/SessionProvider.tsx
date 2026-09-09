import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { ModuleId } from '../modules/catalog'
import { SessionContext } from './SessionContext'
import { clearSession, readSession, writeSession } from './storage'
import { EMPTY_SESSION, type SessionState, type SessionUser } from './types'

type SessionProviderProps = {
  children: ReactNode
  /** Estado inicial explícito; si se omite se rehidrata desde sessionStorage. */
  initialState?: SessionState
}

export function SessionProvider({
  children,
  initialState,
}: SessionProviderProps) {
  const [state, setState] = useState<SessionState>(
    () => initialState ?? readSession(),
  )

  /** Actualiza el estado en memoria y lo persiste en un solo paso. */
  const update = useCallback((next: SessionState) => {
    setState(next)
    writeSession(next)
  }, [])

  const login = useCallback(
    (user: SessionUser) => {
      update({ user, lastModule: null, startedAt: new Date().toISOString() })
    },
    [update],
  )

  const logout = useCallback(() => {
    setState(EMPTY_SESSION)
    clearSession()
  }, [])

  const setLastModule = useCallback((moduleId: ModuleId) => {
    setState((current) => {
      if (current.lastModule === moduleId) return current
      const next = { ...current, lastModule: moduleId }
      writeSession(next)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({
      ...state,
      isAuthenticated: state.user !== null,
      login,
      logout,
      setLastModule,
    }),
    [state, login, logout, setLastModule],
  )

  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}
