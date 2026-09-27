import { Modal } from './Modal'

type ConfirmDialogProps = {
  title: string
  message: string
  confirmLabel: string
  /** Deshabilita los botones mientras la operación está en curso. */
  busy?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** Solicita confirmación antes de una operación destructiva. */
export function ConfirmDialog({
  title,
  message,
  confirmLabel,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal title={title} onClose={busy ? () => {} : onCancel}>
      <p className="text-base text-text">{message}</p>

      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text hover:bg-secondary disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          type="button"
          onClick={onConfirm}
          disabled={busy}
          className="h-11 rounded-xl bg-error px-4 text-sm font-semibold text-white hover:bg-error-dark disabled:opacity-50"
        >
          {busy ? 'Procesando…' : confirmLabel}
        </button>
      </div>
    </Modal>
  )
}
