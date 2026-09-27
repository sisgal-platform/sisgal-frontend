export type Sucursal = {
    id: string;
    nombre: string;
    codigo: string;
    direccion: string;
    ciudad: string;
    activo: boolean;
    createdAt?: string;
};

export type SucursalPayload = Omit<Sucursal, "id" | "createdAt">;
