export type ToastKind = 'success' | 'error' | 'warning' | 'info'

export type Toast = {
  id: string
  kind: ToastKind
  message: string
}

export type ToastContextValue = {
  showToast: (message: string, kind?: ToastKind) => void
}
