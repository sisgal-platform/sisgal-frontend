import { useState, type FormEvent } from 'react'
import { ApiError } from '@/lib/apiError'
import { Modal } from '@/components/molecules/Modal'
import type { Cargo, CargoInput } from '../interfaces/types'
import { mensajeDeError } from '../hooks/useCargos'

const NOMBRE_MAX = 100
const DESCRIPCION_MAX = 255

type Errores = {
  nombre?: string
  general?: string
}

type CargoFormDialogProps = {
  /** Cargo a editar; si se omite, el formulario registra uno nuevo. */
  cargo?: Cargo
  onSubmit: (input: CargoInput) => Promise<unknown>
  onClose: () => void
}

/** Mismas reglas que `CrearCargoDto` para dar retroalimentación inmediata (CA05). */
function validar({ nombre, descripcion }: CargoInput): Errores {
  if (!nombre) return { nombre: 'El nombre del cargo es obligatorio.' }
  if (nombre.length < 2) {
    return { nombre: 'El nombre del cargo debe tener al menos 2 caracteres.' }
  }
  if (nombre.length > NOMBRE_MAX) {
    return { nombre: `El nombre del cargo no debe superar los ${NOMBRE_MAX} caracteres.` }
  }
  if (descripcion.length > DESCRIPCION_MAX) {
    return { general: `La descripción no debe superar los ${DESCRIPCION_MAX} caracteres.` }
  }
  return {}
}

export function CargoFormDialog({ cargo, onSubmit, onClose }: CargoFormDialogProps) {
  const [nombre, setNombre] = useState(cargo?.name ?? '')
  const [descripcion, setDescripcion] = useState(cargo?.description ?? '')
  const [errores, setErrores] = useState<Errores>({})
  const [enviando, setEnviando] = useState(false)

  const editando = cargo !== undefined

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const input = { nombre: nombre.trim(), descripcion: descripcion.trim() }
    const erroresValidacion = validar(input)

    setErrores(erroresValidacion)
    if (erroresValidacion.nombre || erroresValidacion.general) return

    setEnviando(true)
    try {
      await onSubmit(input)
    } catch (error) {
      // El nombre duplicado (409) se muestra junto al campo que lo causa.
      setErrores(
        error instanceof ApiError && error.status === 409
          ? { nombre: error.message }
          : { general: mensajeDeError(error) },
      )
      setEnviando(false)
    }
  }

  return (
    <Modal
      title={editando ? 'Actualizar cargo' : 'Nuevo cargo'}
      onClose={enviando ? () => {} : onClose}
    >
      <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="cargo-nombre" className="text-sm font-semibold text-text">
            Nombre <span aria-hidden="true" className="text-error">*</span>
          </label>
          <input
            id="cargo-nombre"
            type="text"
            value={nombre}
            maxLength={NOMBRE_MAX}
            required
            aria-invalid={errores.nombre ? true : undefined}
            aria-describedby={errores.nombre ? 'cargo-nombre-error' : undefined}
            onChange={(event) => setNombre(event.target.value)}
            className="h-11 rounded-xl border border-gray-300 px-3 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-[invalid]:border-error"
          />
          {errores.nombre && (
            <p id="cargo-nombre-error" className="text-sm text-error">
              {errores.nombre}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="cargo-descripcion" className="text-sm font-semibold text-text">
            Descripción <span className="font-normal text-text-muted">(opcional)</span>
          </label>
          <textarea
            id="cargo-descripcion"
            value={descripcion}
            maxLength={DESCRIPCION_MAX}
            rows={3}
            onChange={(event) => setDescripcion(event.target.value)}
            className="rounded-xl border border-gray-300 px-3 py-2 text-base text-text focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {errores.general && (
          <p role="alert" className="rounded-xl bg-error-light px-3 py-2 text-sm text-error">
            {errores.general}
          </p>
        )}

        <div className="mt-2 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={enviando}
            className="h-11 rounded-xl border border-gray-300 px-4 text-sm font-semibold text-text hover:bg-secondary disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={enviando}
            className="h-11 rounded-xl bg-primary px-4 text-sm font-semibold text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {enviando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Registrar cargo'}
          </button>
        </div>
      </form>
    </Modal>
  )
}
