import { useCallback, useEffect, useState } from 'react'
import { cargosService } from '../services/cargosService'
import type { Cargo, CargoInput, FiltroEstado } from '../interfaces/types'

type Resultado = {
  /** Consulta que produjo el resultado; si no coincide con la actual, se está cargando. */
  clave: string
  cargos: Cargo[]
  error: string | null
}

/**
 * Estado del catálogo de cargos: consulta según el filtro y vuelve a consultar
 * después de cada operación exitosa para reflejar los cambios (CA03).
 */
export function useCargos(filtro: FiltroEstado) {
  const [version, setVersion] = useState(0)
  const [resultado, setResultado] = useState<Resultado | null>(null)
  const clave = `${filtro}:${version}`

  useEffect(() => {
    let cancelado = false

    cargosService.listar(filtro).then(
      (cargos) => {
        if (!cancelado) setResultado({ clave, cargos, error: null })
      },
      (error: unknown) => {
        if (!cancelado) {
          setResultado({ clave, cargos: [], error: mensajeDeError(error) })
        }
      },
    )

    return () => {
      cancelado = true
    }
  }, [filtro, clave])

  const recargar = useCallback(() => setVersion((actual) => actual + 1), [])

  const crear = useCallback(
    async (input: CargoInput) => {
      const cargo = await cargosService.crear(input)
      recargar()
      return cargo
    },
    [recargar],
  )

  const actualizar = useCallback(
    async (id: number, input: CargoInput) => {
      const cargo = await cargosService.actualizar(id, input)
      recargar()
      return cargo
    },
    [recargar],
  )

  const desactivar = useCallback(
    async (id: number) => {
      await cargosService.desactivar(id)
      recargar()
    },
    [recargar],
  )

  return {
    cargos: resultado?.cargos ?? [],
    cargando: resultado?.clave !== clave,
    error: resultado?.clave === clave ? resultado.error : null,
    recargar,
    crear,
    actualizar,
    desactivar,
  }
}

export function mensajeDeError(error: unknown): string {
  return error instanceof Error && error.message
    ? error.message
    : 'Ocurrió un error inesperado. Intenta de nuevo.'
}
