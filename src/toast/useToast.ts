import { useContext } from 'react'
import { ToastContext } from './ToastContext'
import type { ToastContextValue } from './types'

export function useToast(): ToastContextValue {
  const value = useContext(ToastContext)
  if (value === null) {
    throw new Error('useToast debe usarse dentro de un <ToastProvider>')
  }
  return value
}
