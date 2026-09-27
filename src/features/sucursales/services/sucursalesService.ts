import apiClient from '@/lib/axios';

import type { Sucursal, SucursalPayload } from '../interfaces/types';

export const sucursalesService = {
  async list(soloActivas?: boolean): Promise<Sucursal[]> {
    const params =
      soloActivas === undefined
        ? undefined
        : { activas: soloActivas };

    const { data } = await apiClient.get<Sucursal[]>('/sucursales', {
      params,
    });

    return data;
  },

  async listActive(): Promise<Sucursal[]> {
    const { data } = await apiClient.get<Sucursal[]>(
      '/sucursales/activas',
    );

    return data;
  },

  async getById(id: string): Promise<Sucursal> {
    const { data } = await apiClient.get<Sucursal>(
      `/sucursales/${id}`,
    );

    return data;
  },

  async create(payload: SucursalPayload): Promise<Sucursal> {
    const { data } = await apiClient.post<Sucursal>(
      '/sucursales',
      payload,
    );

    return data;
  },

  async update(
    id: string,
    payload: Partial<SucursalPayload>,
  ): Promise<Sucursal> {
    const { data } = await apiClient.patch<Sucursal>(
      `/sucursales/${id}`,
      payload,
    );

    return data;
  },

  async remove(id: string): Promise<void> {
    await apiClient.delete(`/sucursales/${id}`);
  },
};