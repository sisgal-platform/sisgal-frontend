import apiClient from "@/lib/axios";
import { toApiError } from "@/lib/apiError";

import type { Cargo, CargoInput, FiltroEstado } from "../interfaces/types";

const ACTIVOS_PARAM: Record<FiltroEstado, boolean | undefined> = {
    todos: undefined,
    activos: true,
    inactivos: false,
};

/** Ejecuta la petición y convierte cualquier fallo en `ApiError`. */
async function ejecutar<T>(peticion: Promise<{ data: T }>): Promise<T> {
    try {
        const { data } = await peticion;
        return data;
    } catch (error) {
        throw toApiError(error);
    }
}

/** Acceso al recurso `/cargos` del sisgal-core-service (HU41). */
export const cargosService = {
    listar(filtro: FiltroEstado = "todos"): Promise<Cargo[]> {
        const activos = ACTIVOS_PARAM[filtro];
        return ejecutar(
            apiClient.get<Cargo[]>("/cargos", {
                params: activos === undefined ? undefined : { activos },
            }),
        );
    },

    /** Catálogo para los formularios que requieren seleccionar un cargo (CA06). */
    listarActivos(): Promise<Cargo[]> {
        return ejecutar(apiClient.get<Cargo[]>("/cargos/activos"));
    },

    crear(input: CargoInput): Promise<Cargo> {
        return ejecutar(apiClient.post<Cargo>("/cargos", input));
    },

    actualizar(id: number, input: CargoInput): Promise<Cargo> {
        return ejecutar(apiClient.patch<Cargo>(`/cargos/${id}`, input));
    },

    async desactivar(id: number): Promise<void> {
        await ejecutar(apiClient.delete(`/cargos/${id}`));
    },
};
