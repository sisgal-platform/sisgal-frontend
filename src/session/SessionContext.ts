import { createContext } from 'react'
import type { SessionContextValue } from './types'

/**
 * Vive en su propio módulo (sin componentes) para no romper el fast refresh
 * de react-refresh, que exige que un archivo exporte solo componentes.
 */
export const SessionContext = createContext<SessionContextValue | null>(null)
