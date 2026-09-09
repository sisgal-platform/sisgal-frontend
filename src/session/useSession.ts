import { useContext } from 'react'
import { SessionContext } from './SessionContext'
import type { SessionContextValue } from './types'

export function useSession(): SessionContextValue {
  const value = useContext(SessionContext)
  if (value === null) {
    throw new Error('useSession debe usarse dentro de un <SessionProvider>')
  }
  return value
}
