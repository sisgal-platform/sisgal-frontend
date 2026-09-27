import apiClient from '@/lib/axios'

import type { Sucursal, SucursalPayload } from '../interfaces/types'

export const sucursalesService = {
  async list(): Promise<Sucursal[]> {
    const { data } = await apiClient.get<Sucursal[]>('/sucursales')
    return data
  },

  async getById(id: string): Promise<Sucursal> {
    const { data } = await apiClient.get<Sucursal>(`/sucursales/${id}`)
    return data
  },

  async create(payload: SucursalPayload): Promise<Sucursal> {
    const { data } = await apiClient.post<Sucursal>('/sucursales', payload)
    return data
  },

  async update(id: string, payload: Partial<SucursalPayload>): Promise<Sucursal> {
    const { data } = await apiClient.put<Sucursal>(`/sucursales/${id}`, payload)
    return data
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/sucursales/${id}`)
  },
}
