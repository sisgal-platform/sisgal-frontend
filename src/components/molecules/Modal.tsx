import { useEffect, useId, useRef, type ReactNode } from 'react'

type ModalProps = {
  title: string
  onClose: () => void
  children: ReactNode
}

/**
 * Ventana modal accesible: se anuncia como `dialog`, lleva el foco a su primer
 * campo y se cierra con Escape o al hacer clic fuera. Al cerrarse devuelve el
 * foco al elemento que la abrió.
 */
export function Modal({ title, onClose, children }: ModalProps) {
  const tituloId = useId()
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previo = document.activeElement as HTMLElement | null
    const enfocable = panelRef.current?.querySelector<HTMLElement>(
      'input, textarea, select, button',
    )
    enfocable?.focus()

    return () => previo?.focus()
  }, [])

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-black/40 p-4 sm:items-center"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        className="w-full max-w-lg rounded-2xl bg-surface p-5 shadow-xl sm:p-6"
      >
        <h2 id={tituloId} className="mb-4 text-xl font-semibold text-primary">
          {title}
        </h2>
        {children}
      </div>
    </div>
  )
}
