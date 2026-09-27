import { request } from '../api/http'
import type { Cargo, CargoInput, FiltroEstado } from './types'

const ACTIVOS_QUERY: Record<FiltroEstado, string> = {
  todos: '',
  activos: '?activos=true',
  inactivos: '?activos=false',
}

/** Acceso al recurso `/cargos` del sisgal-core-service (HU41). */
export const cargosApi = {
  listar(filtro: FiltroEstado = 'todos'): Promise<Cargo[]> {
    return request<Cargo[]>(`/cargos${ACTIVOS_QUERY[filtro]}`)
  },

  /** Catálogo para los formularios que requieren seleccionar un cargo (CA06). */
  listarActivos(): Promise<Cargo[]> {
    return request<Cargo[]>('/cargos/activos')
  },

  crear(input: CargoInput): Promise<Cargo> {
    return request<Cargo>('/cargos', { method: 'POST', body: input })
  },

  actualizar(id: number, input: CargoInput): Promise<Cargo> {
    return request<Cargo>(`/cargos/${id}`, { method: 'PATCH', body: input })
  },

  desactivar(id: number): Promise<void> {
    return request<void>(`/cargos/${id}`, { method: 'DELETE' })
  },
}
